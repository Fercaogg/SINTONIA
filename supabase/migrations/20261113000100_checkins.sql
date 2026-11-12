-- SINTONÍA · Migración 5: calendario, check-ins, apoyo, retirada y borrado

-- ---------------------------------------------------------------------------
-- Ajustes de tablas
-- ---------------------------------------------------------------------------

-- Si un tutor borra su cuenta, la pareja del estudiante se conserva sin tutor.
alter table public.parejas alter column tutor_id drop not null;
alter table public.parejas drop constraint parejas_tutor_id_fkey;
alter table public.parejas add constraint parejas_tutor_id_fkey
  foreign key (tutor_id) references public.perfiles (user_id) on delete set null;

-- Avisos de "Necesito apoyo". Solo existen si el estudiante pulsa el botón.
create table public.avisos_apoyo (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references public.masters (id) on delete cascade,
  estudiante_id uuid not null references public.perfiles (user_id) on delete cascade,
  -- Copia del nombre SOLO si el estudiante autoriza compartirlo.
  nombre_autorizado text,
  created_at timestamptz not null default now(),
  atendido_at timestamptz
);
create index on public.avisos_apoyo (master_id, created_at);

alter table public.avisos_apoyo enable row level security;
revoke all on public.avisos_apoyo from public, anon, authenticated;
grant select on public.avisos_apoyo to authenticated;
-- El estudiante ve los suyos. La dirección los consulta con una función que
-- no devuelve el identificador del estudiante.
create policy "mis avisos" on public.avisos_apoyo
  for select to authenticated
  using (estudiante_id = auth.uid() and private.rol_actual() = 'estudiante');

-- Cuentas cuyo borrado no se pudo completar desde la base de datos (si
-- Supabase no lo permite) y que el servidor debe terminar de borrar.
create table private.borrados_pendientes (
  user_id uuid primary key,
  solicitado_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Calendario del estudio (zona horaria Europe/Madrid por defecto)
-- ---------------------------------------------------------------------------

-- Hora actual. En los tests se puede fijar con set_config('sintonia.ahora', ...).
-- La API de Supabase no permite a los usuarios cambiar este ajuste.
create or replace function private.ahora()
returns timestamptz
language sql stable
as $$
  select coalesce(nullif(current_setting('sintonia.ahora', true), '')::timestamptz, now())
$$;

-- Ventana de la semana n: abre a las 00:00 del día de apertura y cierra al
-- terminar el día de cierre (hora local del estudio).
-- La semana n empieza en fecha_inicio + 7 * (n - 1). Dentro de esa semana, el
-- check-in abre el primer día que coincide con dia_apertura y cierra el
-- primer día, desde la apertura, que coincide con dia_cierre.
create or replace function private.ventana(p_estudio public.estudios, p_semana integer, out abre timestamptz, out cierra timestamptz)
language plpgsql stable
as $$
declare
  base date;
  apertura date;
  cierre date;
begin
  if p_estudio.fecha_inicio is null then
    return;
  end if;
  base := p_estudio.fecha_inicio + 7 * (p_semana - 1);
  apertura := base + ((p_estudio.dia_apertura - extract(isodow from base)::integer + 7) % 7);
  cierre := apertura + ((p_estudio.dia_cierre - p_estudio.dia_apertura + 7) % 7);
  abre := apertura::timestamp at time zone p_estudio.zona_horaria;
  cierra := (cierre + 1)::timestamp at time zone p_estudio.zona_horaria;
end
$$;

-- Estado del calendario en este momento.
create or replace function private.estado_calendario(p_estudio_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  e public.estudios;
  v_ahora timestamptz := private.ahora();
  v record;
  siguiente record;
begin
  select * into e from public.estudios where id = p_estudio_id;
  if not found or e.fecha_inicio is null then
    return jsonb_build_object('estado', 'sin_fecha', 'semanas', coalesce(e.semanas, 0));
  end if;
  for n in 1 .. e.semanas loop
    select * into v from private.ventana(e, n);
    if v_ahora < v.abre then
      return jsonb_build_object('estado', case when n = 1 then 'antes' else 'entre' end,
        'semana', n - 1, 'proxima', n, 'abre', v.abre, 'semanas', e.semanas);
    end if;
    if v_ahora < v.cierra then
      return jsonb_build_object('estado', 'abierta', 'semana', n, 'abre', v.abre, 'cierra', v.cierra, 'semanas', e.semanas);
    end if;
  end loop;
  return jsonb_build_object('estado', 'terminado', 'semana', e.semanas, 'semanas', e.semanas);
end
$$;

-- Número de la semana abierta ahora mismo, o null.
create or replace function private.semana_abierta(p_estudio_id uuid)
returns integer
language sql stable security definer set search_path = ''
as $$
  select case when (c ->> 'estado') = 'abierta' then (c ->> 'semana')::integer end
  from private.estado_calendario(p_estudio_id) c
$$;

create or replace function private.estudio_actual()
returns uuid
language sql stable security definer set search_path = ''
as $$
  select m.estudio_id from public.masters m where m.id = private.master_actual()
$$;

create or replace function private.consentimiento_ok()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.consentimientos c
    join public.consentimiento_textos t on t.version = c.version and t.vigente
    where c.user_id = auth.uid() and c.retirado_at is null
  )
$$;

create or replace function private.exigir_participante(p_rol public.rol_usuario)
returns void
language plpgsql stable security definer set search_path = ''
as $$
begin
  if private.rol_actual() is distinct from p_rol then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  if not private.consentimiento_ok() then
    perform private.error('SIN_CONSENTIMIENTO', 'Antes tienes que aceptar el consentimiento informado.');
  end if;
end
$$;

create or replace function private.items_de(p_rol public.rol_usuario)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'clave', clave, 'texto', texto, 'ancla_min', ancla_min, 'ancla_max', ancla_max,
    'privado', privado, 'obligatorio', obligatorio, 'provisional', provisional
  ) order by orden), '[]'::jsonb)
  from public.items where rol = p_rol and activo
$$;

create or replace function private.validar_escala(p_valor integer, p_obligatorio boolean default true)
returns void
language plpgsql immutable
as $$
begin
  if p_valor is null and p_obligatorio then
    perform private.error('FALTAN_RESPUESTAS', 'Responde a todas las preguntas antes de enviar.');
  end if;
  if p_valor is not null and p_valor not between 1 and 5 then
    perform private.error('VALOR_NO_VALIDO', 'Las respuestas van del 1 al 5.');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Calendario: consulta y configuración
-- ---------------------------------------------------------------------------

create or replace function public.estado_semana()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  if private.rol_actual() is null then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  return private.estado_calendario(coalesce(private.estudio_actual(), (select id from public.estudios order by created_at limit 1)));
end
$$;

create or replace function public.ver_estudio()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  e public.estudios;
begin
  perform private.exigir_investigador();
  select * into e from public.estudios order by created_at limit 1;
  return jsonb_build_object(
    'id', e.id, 'nombre', e.nombre, 'fecha_inicio', e.fecha_inicio, 'semanas', e.semanas,
    'dia_apertura', e.dia_apertura, 'dia_cierre', e.dia_cierre, 'zona_horaria', e.zona_horaria,
    'probabilidad_agenda', e.probabilidad_agenda,
    'estado', private.estado_calendario(e.id),
    'ventanas', (
      select coalesce(jsonb_agg(jsonb_build_object('semana', n, 'abre', v.abre, 'cierra', v.cierra) order by n), '[]'::jsonb)
      from generate_series(1, e.semanas) n, lateral private.ventana(e, n) v
      where e.fecha_inicio is not null
    )
  );
end
$$;

create or replace function public.configurar_estudio(
  p_fecha_inicio date,
  p_semanas integer,
  p_dia_apertura integer,
  p_dia_cierre integer
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  perform private.exigir_investigador();
  if p_semanas not between 1 and 52 then
    perform private.error('SEMANAS_NO_VALIDAS', 'La duración debe estar entre 1 y 52 semanas.');
  end if;
  if p_dia_apertura not between 1 and 7 or p_dia_cierre not between 1 and 7 then
    perform private.error('DIA_NO_VALIDO', 'Elige un día de la semana válido.');
  end if;
  select id into v_id from public.estudios order by created_at limit 1;
  update public.estudios
  set fecha_inicio = p_fecha_inicio, semanas = p_semanas, dia_apertura = p_dia_apertura, dia_cierre = p_dia_cierre
  where id = v_id;
  perform private.auditar('calendario_configurado', jsonb_build_object(
    'fecha_inicio', p_fecha_inicio, 'semanas', p_semanas, 'dia_apertura', p_dia_apertura, 'dia_cierre', p_dia_cierre));
  return public.ver_estudio();
end
$$;

-- ---------------------------------------------------------------------------
-- Check-in del estudiante
-- ---------------------------------------------------------------------------

create or replace function public.mi_checkin()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_pareja uuid;
  v_cal jsonb;
  v_semana integer;
  r public.respuestas_estudiante;
  b public.bienestar;
begin
  perform private.exigir_participante('estudiante');
  select id into v_pareja from public.parejas where estudiante_id = auth.uid() and finalizada_at is null;
  v_cal := private.estado_calendario(private.estudio_actual());
  v_semana := case when v_cal ->> 'estado' = 'abierta' then (v_cal ->> 'semana')::integer end;
  if v_semana is not null then
    select * into r from public.respuestas_estudiante where pareja_id = v_pareja and semana = v_semana;
    select * into b from public.bienestar where estudiante_id = auth.uid() and semana = v_semana;
  end if;
  return jsonb_build_object(
    'calendario', v_cal,
    'items', private.items_de('estudiante'),
    'url_servicio_psicologico', private.config('url_servicio_psicologico'),
    'respuesta', case when r.id is null then null else jsonb_build_object(
      'avance', r.avance, 'siguiente_paso', r.siguiente_paso, 'apoyo', r.apoyo,
      'bienestar', case when b.id is null then null else private.descifrar_bienestar(b.valor_cifrado) end,
      'actualizado_at', r.updated_at
    ) end
  );
end
$$;

create or replace function public.guardar_checkin_estudiante(
  p_avance integer,
  p_siguiente_paso integer,
  p_apoyo integer,
  p_bienestar integer
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_pareja uuid;
  v_semana integer;
begin
  perform private.exigir_participante('estudiante');
  select id into v_pareja from public.parejas where estudiante_id = auth.uid() and finalizada_at is null;
  if v_pareja is null then
    perform private.error('SIN_PAREJA', 'Tu cuenta no está asociada a ningún tutor/a.');
  end if;
  v_semana := private.semana_abierta(private.estudio_actual());
  if v_semana is null then
    perform private.error('SEMANA_CERRADA', 'El check-in no está abierto ahora. Podrás responder cuando se abra la próxima semana.');
  end if;
  perform private.validar_escala(p_avance);
  perform private.validar_escala(p_siguiente_paso);
  perform private.validar_escala(p_apoyo);
  perform private.validar_escala(p_bienestar);

  insert into public.respuestas_estudiante (pareja_id, semana, avance, siguiente_paso, apoyo)
  values (v_pareja, v_semana, p_avance, p_siguiente_paso, p_apoyo)
  on conflict (pareja_id, semana) do update
    set avance = excluded.avance, siguiente_paso = excluded.siguiente_paso, apoyo = excluded.apoyo, updated_at = now();

  insert into public.bienestar (estudiante_id, semana, valor_cifrado)
  values (auth.uid(), v_semana, private.cifrar_bienestar(p_bienestar))
  on conflict (estudiante_id, semana) do update
    set valor_cifrado = excluded.valor_cifrado, updated_at = now();

  -- Nota: el bienestar bajo NO genera avisos a nadie. Solo se devuelve aquí
  -- para que la propia pantalla del estudiante muestre el mensaje amable.
  return jsonb_build_object('ok', true, 'semana', v_semana, 'bienestar_bajo', p_bienestar <= 2);
end
$$;

-- Histórico del propio estudiante (incluido su bienestar, que solo ve él).
create or replace function public.mi_historial()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_participante('estudiante');
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'semana', r.semana, 'avance', r.avance, 'siguiente_paso', r.siguiente_paso, 'apoyo', r.apoyo,
      'bienestar', case when b.id is null then null else private.descifrar_bienestar(b.valor_cifrado) end,
      'actualizado_at', r.updated_at
    ) order by r.semana desc)
    from public.respuestas_estudiante r
    join public.parejas pa on pa.id = r.pareja_id and pa.estudiante_id = auth.uid()
    left join public.bienestar b on b.estudiante_id = auth.uid() and b.semana = r.semana
  ), '[]'::jsonb);
end
$$;

-- ---------------------------------------------------------------------------
-- Check-in del tutor
-- ---------------------------------------------------------------------------

create or replace function public.checkin_tutor()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_cal jsonb;
  v_semana integer;
begin
  perform private.exigir_participante('tutor');
  v_cal := private.estado_calendario(private.estudio_actual());
  v_semana := case when v_cal ->> 'estado' = 'abierta' then (v_cal ->> 'semana')::integer end;
  return jsonb_build_object(
    'calendario', v_cal,
    'items', private.items_de('tutor'),
    'estudiantes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'pareja_id', pa.id, 'nombre', i.nombre,
        'avance', rt.avance, 'siguiente_paso', rt.siguiente_paso
      ) order by i.nombre)
      from public.parejas pa
      join public.perfiles pe on pe.user_id = pa.estudiante_id and pe.retirado_at is null
      join public.identidades i on i.user_id = pa.estudiante_id
      left join public.respuestas_tutor rt on rt.pareja_id = pa.id and rt.semana = v_semana
      where pa.tutor_id = auth.uid() and pa.finalizada_at is null
    ), '[]'::jsonb)
  );
end
$$;

-- Guarda de una vez las respuestas sobre todos sus estudiantes.
-- p_respuestas: [{ "pareja_id": "...", "avance": 1-5, "siguiente_paso": 1-5 o null }]
create or replace function public.guardar_checkin_tutor(p_respuestas jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_semana integer;
  fila jsonb;
  v_pareja uuid;
  n integer := 0;
begin
  perform private.exigir_participante('tutor');
  v_semana := private.semana_abierta(private.estudio_actual());
  if v_semana is null then
    perform private.error('SEMANA_CERRADA', 'El check-in no está abierto ahora. Podrás responder cuando se abra la próxima semana.');
  end if;
  if jsonb_typeof(p_respuestas) is distinct from 'array' or jsonb_array_length(p_respuestas) = 0 then
    perform private.error('FALTAN_RESPUESTAS', 'Responde al menos sobre un estudiante.');
  end if;

  for fila in select * from jsonb_array_elements(p_respuestas) loop
    v_pareja := (fila ->> 'pareja_id')::uuid;
    if not exists (
      select 1 from public.parejas pa
      join public.perfiles pe on pe.user_id = pa.estudiante_id and pe.retirado_at is null
      where pa.id = v_pareja and pa.tutor_id = auth.uid() and pa.finalizada_at is null
    ) then
      perform private.error('PAREJA_NO_VALIDA', 'Uno de los estudiantes no está en tu lista. Recarga la página.');
    end if;
    perform private.validar_escala((fila ->> 'avance')::integer);
    perform private.validar_escala((fila ->> 'siguiente_paso')::integer, false);

    insert into public.respuestas_tutor (pareja_id, semana, avance, siguiente_paso)
    values (v_pareja, v_semana, (fila ->> 'avance')::integer, (fila ->> 'siguiente_paso')::integer)
    on conflict (pareja_id, semana) do update
      set avance = excluded.avance, siguiente_paso = excluded.siguiente_paso, updated_at = now();
    n := n + 1;
  end loop;

  return jsonb_build_object('ok', true, 'semana', v_semana, 'guardadas', n);
end
$$;

-- ---------------------------------------------------------------------------
-- "Necesito apoyo"
-- ---------------------------------------------------------------------------

create or replace function public.pedir_apoyo(p_compartir_nombre boolean)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_nombre text;
begin
  perform private.exigir_participante('estudiante');
  if p_compartir_nombre then
    select nombre into v_nombre from public.identidades where user_id = auth.uid();
  end if;
  -- Evita avisos duplicados por pulsar varias veces: uno abierto por día.
  -- Si ahora sí quiere compartir su nombre, se añade al aviso abierto.
  if exists (
    select 1 from public.avisos_apoyo
    where estudiante_id = auth.uid() and atendido_at is null and created_at > now() - interval '24 hours'
  ) then
    if v_nombre is not null then
      update public.avisos_apoyo set nombre_autorizado = v_nombre
      where estudiante_id = auth.uid() and atendido_at is null and created_at > now() - interval '24 hours';
    end if;
    return jsonb_build_object('ok', true, 'duplicado', true);
  end if;
  insert into public.avisos_apoyo (master_id, estudiante_id, nombre_autorizado)
  values (private.master_actual(), auth.uid(), v_nombre);
  return jsonb_build_object('ok', true, 'duplicado', false);
end
$$;

create or replace function public.mis_avisos_apoyo()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_participante('estudiante');
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'created_at', created_at, 'nombre_compartido', nombre_autorizado is not null, 'atendido', atendido_at is not null
    ) order by created_at desc)
    from public.avisos_apoyo where estudiante_id = auth.uid()
  ), '[]'::jsonb);
end
$$;

-- Para la dirección: nunca devuelve quién es el estudiante, salvo el nombre
-- que este haya autorizado.
create or replace function public.avisos_apoyo_direccion()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  if private.rol_actual() is distinct from 'direccion' then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', id, 'created_at', created_at, 'nombre', nombre_autorizado, 'atendido_at', atendido_at
    ) order by atendido_at nulls first, created_at desc)
    from public.avisos_apoyo where master_id = private.master_actual()
  ), '[]'::jsonb);
end
$$;

create or replace function public.marcar_aviso_atendido(p_id uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  if private.rol_actual() is distinct from 'direccion' then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  update public.avisos_apoyo set atendido_at = now()
  where id = p_id and master_id = private.master_actual() and atendido_at is null;
  return jsonb_build_object('ok', true);
end
$$;

-- ---------------------------------------------------------------------------
-- Mi cuenta: recordatorios, acceso a mis datos, retirada y borrado
-- ---------------------------------------------------------------------------

create or replace function public.cambiar_recordatorios(p_activos boolean)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  if private.rol_actual() is null then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  update public.perfiles set recordatorios = coalesce(p_activos, true) where user_id = auth.uid();
  return jsonb_build_object('ok', true, 'recordatorios', coalesce(p_activos, true));
end
$$;

-- Derecho de acceso: todo lo que SINTONÍA guarda sobre la persona.
create or replace function public.mis_datos()
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  p public.perfiles;
begin
  select * into p from public.perfiles where user_id = auth.uid();
  if not found then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  perform private.auditar('descarga_mis_datos');
  return jsonb_build_object(
    'generado_at', now(),
    'identidad', (select to_jsonb(i) - 'user_id' from public.identidades i where i.user_id = p.user_id),
    'perfil', to_jsonb(p) - 'user_id',
    'consentimientos', (select coalesce(jsonb_agg(to_jsonb(c) - 'user_id' - 'id'), '[]') from public.consentimientos c where c.user_id = p.user_id),
    'pareja', (select to_jsonb(pa) - 'estudiante_id' - 'tutor_id' from public.parejas pa where pa.estudiante_id = p.user_id),
    'respuestas_como_estudiante', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'semana', r.semana, 'avance', r.avance, 'siguiente_paso', r.siguiente_paso, 'apoyo', r.apoyo,
        'bienestar', case when b.id is null then null else private.descifrar_bienestar(b.valor_cifrado) end,
        'creado_at', r.created_at, 'actualizado_at', r.updated_at) order by r.semana), '[]')
      from public.respuestas_estudiante r
      join public.parejas pa on pa.id = r.pareja_id and pa.estudiante_id = p.user_id
      left join public.bienestar b on b.estudiante_id = p.user_id and b.semana = r.semana
    ),
    'respuestas_como_tutor', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'pareja', pa.seudonimo, 'semana', rt.semana, 'avance', rt.avance, 'siguiente_paso', rt.siguiente_paso,
        'creado_at', rt.created_at, 'actualizado_at', rt.updated_at) order by rt.semana), '[]')
      from public.respuestas_tutor rt
      join public.parejas pa on pa.id = rt.pareja_id and pa.tutor_id = p.user_id
    ),
    'avisos_apoyo', (
      select coalesce(jsonb_agg(jsonb_build_object('created_at', a.created_at, 'nombre_compartido', a.nombre_autorizado is not null)), '[]')
      from public.avisos_apoyo a where a.estudiante_id = p.user_id
    )
  );
end
$$;

-- Retirarse del estudio. Con p_borrar = true, además se borran todos sus
-- datos y su cuenta. Sin borrar, las respuestas ya dadas se conservan
-- seudonimizadas, como explica el consentimiento.
create or replace function public.retirarme(p_borrar boolean)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_rol public.rol_usuario;
  v_uid uuid := auth.uid();
  v_cuenta_borrada boolean := false;
begin
  v_rol := private.rol_actual();
  if v_rol is null and not exists (select 1 from public.perfiles where user_id = v_uid and retirado_at is not null) then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  if v_rol in ('direccion', 'investigador') then
    perform private.error('SIN_PERMISO', 'Esta opción es para estudiantes y tutores.');
  end if;

  if not coalesce(p_borrar, false) then
    update public.perfiles set retirado_at = coalesce(retirado_at, now()) where user_id = v_uid;
    update public.consentimientos set retirado_at = now() where user_id = v_uid and retirado_at is null;
    perform private.auditar('retirada', jsonb_build_object('borrado', false));
    return jsonb_build_object('ok', true, 'borrado', false);
  end if;

  -- Borrado completo. Las respuestas del tutor sobre este estudiante son datos
  -- sobre el estudiante: también se borran (en cascada con la pareja).
  -- Si es un tutor, se borran sus respuestas; las parejas quedan sin tutor.
  delete from public.respuestas_tutor where pareja_id in (select id from public.parejas where tutor_id = v_uid);
  delete from public.perfiles where user_id = v_uid; -- borra en cascada pareja, respuestas, bienestar, avisos y códigos
  delete from public.identidades where user_id = v_uid;
  delete from public.consentimientos where user_id = v_uid;
  insert into public.auditoria (actor_id, actor_rol, accion, detalle)
  values (null, v_rol, 'borrado_completo', '{}'::jsonb);

  begin
    delete from auth.users where id = v_uid;
    v_cuenta_borrada := true;
  exception when insufficient_privilege then
    insert into private.borrados_pendientes (user_id) values (v_uid) on conflict do nothing;
  end;

  return jsonb_build_object('ok', true, 'borrado', true, 'cuenta_borrada', v_cuenta_borrada);
end
$$;

-- mi_perfil también debe funcionar para quien se ha retirado.

-- ---------------------------------------------------------------------------
-- Permisos de ejecución
-- ---------------------------------------------------------------------------

revoke all on all functions in schema public from public, anon, authenticated;
grant execute on function public.comprobar_codigo(text, text) to anon, authenticated;
grant execute on function public.configuracion_publica() to anon, authenticated;
grant execute on function
  public.mi_perfil(),
  public.consentimiento_vigente(),
  public.aceptar_consentimiento(integer),
  public.actualizar_mi_nombre(text),
  public.mis_estudiantes(),
  public.mis_codigos_pareja(),
  public.listar_masters(),
  public.crear_master(text, public.tipo_trabajo),
  public.crear_codigos(uuid, public.rol_usuario, integer, uuid, text),
  public.listar_codigos(uuid),
  public.listar_tutores(uuid),
  public.estado_semana(),
  public.ver_estudio(),
  public.configurar_estudio(date, integer, integer, integer),
  public.mi_checkin(),
  public.guardar_checkin_estudiante(integer, integer, integer, integer),
  public.mi_historial(),
  public.checkin_tutor(),
  public.guardar_checkin_tutor(jsonb),
  public.pedir_apoyo(boolean),
  public.mis_avisos_apoyo(),
  public.avisos_apoyo_direccion(),
  public.marcar_aviso_atendido(uuid),
  public.cambiar_recordatorios(boolean),
  public.mis_datos(),
  public.retirarme(boolean)
to authenticated;

revoke all on all functions in schema private from public, anon;
grant execute on function
  private.rol_actual(), private.master_actual(), private.es_investigador(),
  private.mis_parejas(), private.parejas_como_estudiante(), private.parejas_como_tutor()
to authenticated;
