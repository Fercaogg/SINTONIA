-- SINTONÍA · Migración 7: Puente al doctorado, pretest y postest, recordatorios

-- ---------------------------------------------------------------------------
-- Puente al doctorado
-- ---------------------------------------------------------------------------

alter table public.perfiles add column puente_doctorado boolean not null default false;

-- Historial de activaciones (para saber cuándo estaba activado).
create table public.puente_cambios (
  id bigint generated always as identity primary key,
  estudiante_id uuid not null references public.perfiles (user_id) on delete cascade,
  activado boolean not null,
  created_at timestamptz not null default now()
);

-- Calendario de convocatorias, editable por el investigador.
-- No se precargan fechas reales: todo queda como [PENDIENTE].
create table public.convocatorias (
  id serial primary key,
  nombre text not null,
  organismo text not null default '[PENDIENTE]',
  fecha_apertura date,
  fecha_cierre date,
  enlace text not null default '[PENDIENTE: enlace oficial]',
  estado text not null default '[PENDIENTE]',
  activa boolean not null default true,
  actualizado_at timestamptz not null default now()
);

insert into public.convocatorias (nombre, organismo) values
  ('Ayudas para la Formación de Profesorado Universitario (FPU)', '[PENDIENTE]'),
  ('Ayudas para contratos predoctorales para la formación de doctores (FPI)', '[PENDIENTE]'),
  ('Contratos predoctorales de la Universidad de Salamanca', 'Universidad de Salamanca'),
  ('Contratos predoctorales de la Junta de Castilla y León', 'Junta de Castilla y León'),
  ('Admisión al doctorado', 'Universidad de Salamanca (Escuela de Doctorado «Studii Salamantini»)');

-- Normativa oficial del doctorado que se muestra en Puente al doctorado.
-- Enlaces facilitados por Fernando a partir de la web de la USAL (13/11/2026).
create table public.enlaces_normativa (
  id serial primary key,
  ambito text not null default 'doctorado',
  titulo text not null,
  descripcion text,
  url text not null,
  orden smallint not null default 0,
  activo boolean not null default true
);

insert into public.enlaces_normativa (titulo, descripcion, url, orden) values
  ('Reglamento de Doctorado de la Universidad de Salamanca', 'Aprobado por Consejo de Gobierno el 18 de julio de 2025 (BOCyL de 15 de diciembre de 2025).',
   'https://bocyl.jcyl.es/boletines/2025/12/15/pdf/BOCYL-D-15122025-31.pdf', 1),
  ('Reglamento de Régimen Interno de la Escuela de Doctorado «Studii Salamantini»', 'Aprobado por Consejo de Gobierno el 18 de julio de 2025 (BOCyL de 15 de diciembre de 2025).',
   'https://bocyl.jcyl.es/boletines/2025/12/15/pdf/BOCYL-D-15122025-32.pdf', 2),
  ('Real Decreto 99/2011, de 28 de enero, por el que se regulan las enseñanzas oficiales de doctorado', 'Texto consolidado del BOE, con las modificaciones del Real Decreto 576/2023.',
   'https://www.boe.es/buscar/pdf/2011/BOE-A-2011-2541-consolidado.pdf', 3),
  ('Guía de Buenas Prácticas para la Gestión Académica de los Programas de Doctorado', 'Aprobada por Consejo de Gobierno el 25 de julio de 2019.',
   'http://posgrado.usal.es/DOCTORADO%2099/GuiaBuenasPracticas.pdf', 4);

-- Lo que se decidió cada semana para cada pareja: si Puente estaba activado
-- y, en su caso, la línea que se añadió a la agenda. Se registra aunque esa
-- semana no hubiera agenda de desajuste (hipótesis 3).
create table public.puente_semanal (
  pareja_id uuid not null references public.parejas (id) on delete cascade,
  semana smallint not null,
  activado boolean not null,
  linea text,
  convocatorias jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  vista_estudiante_at timestamptz,
  vista_tutor_at timestamptz,
  primary key (pareja_id, semana)
);

-- ---------------------------------------------------------------------------
-- Cuestionarios (pretest y postest)
-- ---------------------------------------------------------------------------

create table public.cuestionarios (
  clave text primary key,
  titulo text not null,
  instrucciones text not null,
  rol public.rol_usuario not null default 'estudiante',
  -- Disponible desde la apertura de la semana "desde" hasta el cierre de la
  -- semana "hasta" (la semana 0 es la anterior al inicio del estudio).
  desde_semana smallint not null,
  hasta_semana smallint not null,
  activo boolean not null default true
);

create table public.cuestionario_items (
  id serial primary key,
  cuestionario text not null references public.cuestionarios (clave) on delete cascade,
  orden smallint not null,
  bloque text not null,
  texto text not null,
  -- escala: de min a max con palabras en los extremos; si_no; opcion: una de varias.
  tipo text not null check (tipo in ('escala', 'si_no', 'opcion')),
  minimo smallint,
  maximo smallint,
  ancla_min text,
  ancla_max text,
  opciones jsonb,
  obligatorio boolean not null default true,
  -- Variable con la que aparece en la exportación (Fase 6).
  variable text not null,
  pendiente boolean not null default false,
  unique (cuestionario, variable)
);

create table public.cuestionario_respuestas (
  user_id uuid not null references public.perfiles (user_id) on delete cascade,
  item_id integer not null references public.cuestionario_items (id) on delete cascade,
  valor jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

insert into public.cuestionarios (clave, titulo, instrucciones, desde_semana, hasta_semana) values
  ('pretest', 'Cuestionario inicial', '[PENDIENTE: instrucciones del cuestionario inicial] Responde con tranquilidad: no hay respuestas buenas ni malas.', 0, 1),
  ('postest', 'Cuestionario final', '[PENDIENTE: instrucciones del cuestionario final] Responde con tranquilidad: no hay respuestas buenas ni malas.', 11, 11);

-- Mismos ítems en pretest y postest. Los de la escala validada y el bloque de
-- conocimiento quedan pendientes (no se incluyen ítems con derechos de autor).
insert into public.cuestionario_items (cuestionario, orden, bloque, texto, tipo, minimo, maximo, ancla_min, ancla_max, opciones, variable, pendiente)
select c.clave, x.orden, x.bloque, x.texto, x.tipo, x.minimo, x.maximo, x.ancla_min, x.ancla_max, x.opciones::jsonb, x.variable, x.pendiente
from public.cuestionarios c,
(values
  (1, 'Escala validada', '[PENDIENTE: ítems de la escala validada]', 'escala', 1, 5, '[PENDIENTE]', '[PENDIENTE]', null, 'escala_item_1', true),
  (2, 'Orientación sobre el doctorado', '¿Cuentas con alguna persona del ámbito académico, distinta de tu tutor/a, que te oriente sobre el doctorado?', 'si_no', null, null, null, null, null, 'h3_orientacion_doctorado', false),
  (3, 'Convocatorias predoctorales', '[PENDIENTE: pregunta de conocimiento sobre las convocatorias predoctorales]', 'opcion', null, null, null, null, '["[PENDIENTE: opción 1]", "[PENDIENTE: opción 2]", "No lo sé"]', 'conocimiento_1', true)
) as x(orden, bloque, texto, tipo, minimo, maximo, ancla_min, ancla_max, opciones, variable, pendiente);

-- ---------------------------------------------------------------------------
-- Recordatorios y avisos por correo
-- ---------------------------------------------------------------------------

create table public.correos_enviados (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('apertura', 'cierre_48h', 'aviso_apoyo')),
  semana smallint,
  referencia uuid,
  enviado_at timestamptz not null default now()
);
create unique index correos_un_recordatorio on public.correos_enviados (user_id, tipo, semana) where tipo <> 'aviso_apoyo';
create unique index correos_un_aviso on public.correos_enviados (user_id, referencia) where tipo = 'aviso_apoyo';

alter table public.avisos_apoyo add column notificado_at timestamptz;

-- ---------------------------------------------------------------------------
-- Permisos de tabla
-- ---------------------------------------------------------------------------

alter table public.enlaces_normativa enable row level security;
revoke all on public.enlaces_normativa from public, anon, authenticated;
grant select on public.enlaces_normativa to authenticated;
create policy "lectura general" on public.enlaces_normativa for select to authenticated using (activo or private.es_investigador());

alter table public.puente_cambios enable row level security;
alter table public.convocatorias enable row level security;
alter table public.puente_semanal enable row level security;
alter table public.cuestionarios enable row level security;
alter table public.cuestionario_items enable row level security;
alter table public.cuestionario_respuestas enable row level security;
alter table public.correos_enviados enable row level security;

revoke all on public.puente_cambios, public.convocatorias, public.puente_semanal, public.cuestionarios,
  public.cuestionario_items, public.cuestionario_respuestas, public.correos_enviados from public, anon, authenticated;
grant select on public.convocatorias, public.cuestionarios, public.cuestionario_items, public.cuestionario_respuestas,
  public.puente_semanal to authenticated;

create policy "lectura general" on public.convocatorias for select to authenticated using (activa or private.es_investigador());
create policy "lectura general" on public.cuestionarios for select to authenticated using (true);
create policy "lectura general" on public.cuestionario_items for select to authenticated using (true);
-- Respuestas a cuestionarios: el propio estudiante y el investigador.
create policy "mias o investigador" on public.cuestionario_respuestas for select to authenticated
  using (user_id = auth.uid() or private.es_investigador());
-- Puente semanal: los dos miembros de la pareja y el investigador.
create policy "miembros o investigador" on public.puente_semanal for select to authenticated
  using (pareja_id in (select private.mis_parejas()) or private.es_investigador());

-- ---------------------------------------------------------------------------
-- Puente al doctorado: funciones
-- ---------------------------------------------------------------------------

create or replace function public.mi_puente()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_participante('estudiante');
  return jsonb_build_object(
    'activado', (select puente_doctorado from public.perfiles where user_id = auth.uid()),
    'convocatorias', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'nombre', nombre, 'organismo', organismo, 'fecha_apertura', fecha_apertura,
        'fecha_cierre', fecha_cierre, 'enlace', enlace, 'estado', estado
      ) order by coalesce(fecha_cierre, fecha_apertura, '9999-12-31'::date), id)
      from public.convocatorias where activa
    ), '[]'::jsonb),
    'normativa', coalesce((
      select jsonb_agg(jsonb_build_object('titulo', titulo, 'descripcion', descripcion, 'url', url) order by orden)
      from public.enlaces_normativa where activo and ambito = 'doctorado'
    ), '[]'::jsonb)
  );
end
$$;

create or replace function public.cambiar_puente(p_activado boolean)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.exigir_participante('estudiante');
  update public.perfiles set puente_doctorado = coalesce(p_activado, false) where user_id = auth.uid();
  insert into public.puente_cambios (estudiante_id, activado) values (auth.uid(), coalesce(p_activado, false));
  return jsonb_build_object('ok', true, 'activado', coalesce(p_activado, false));
end
$$;

create or replace function public.listar_convocatorias()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_investigador();
  return coalesce((select jsonb_agg(to_jsonb(c) order by c.id) from public.convocatorias c), '[]'::jsonb);
end
$$;

create or replace function public.guardar_convocatoria(p_convocatoria jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id integer := (p_convocatoria ->> 'id')::integer;
  v_nombre text := trim(coalesce(p_convocatoria ->> 'nombre', ''));
  v_apertura date := nullif(p_convocatoria ->> 'fecha_apertura', '')::date;
  v_cierre date := nullif(p_convocatoria ->> 'fecha_cierre', '')::date;
begin
  perform private.exigir_investigador();
  if v_nombre = '' then
    perform private.error('NOMBRE_NO_VALIDO', 'Escribe el nombre de la convocatoria.');
  end if;
  if v_apertura is not null and v_cierre is not null and v_cierre < v_apertura then
    perform private.error('FECHAS_NO_VALIDAS', 'La fecha de cierre no puede ser anterior a la de apertura.');
  end if;
  if v_id is null then
    insert into public.convocatorias (nombre, organismo, fecha_apertura, fecha_cierre, enlace, estado, activa)
    values (v_nombre, coalesce(nullif(trim(p_convocatoria ->> 'organismo'), ''), '[PENDIENTE]'), v_apertura, v_cierre,
            coalesce(nullif(trim(p_convocatoria ->> 'enlace'), ''), '[PENDIENTE: enlace oficial]'),
            coalesce(nullif(trim(p_convocatoria ->> 'estado'), ''), '[PENDIENTE]'), coalesce((p_convocatoria ->> 'activa')::boolean, true))
    returning id into v_id;
  else
    update public.convocatorias set
      nombre = v_nombre,
      organismo = coalesce(nullif(trim(p_convocatoria ->> 'organismo'), ''), '[PENDIENTE]'),
      fecha_apertura = v_apertura,
      fecha_cierre = v_cierre,
      enlace = coalesce(nullif(trim(p_convocatoria ->> 'enlace'), ''), '[PENDIENTE: enlace oficial]'),
      estado = coalesce(nullif(trim(p_convocatoria ->> 'estado'), ''), '[PENDIENTE]'),
      activa = coalesce((p_convocatoria ->> 'activa')::boolean, true),
      actualizado_at = now()
    where id = v_id;
  end if;
  perform private.auditar('convocatoria_guardada', jsonb_build_object('id', v_id));
  return jsonb_build_object('ok', true, 'id', v_id);
end
$$;

-- Datos de Puente para el cierre de semana (solo servidor).
create or replace function public.servicio_datos_puente(p_estudio_id uuid, p_semana integer)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  e public.estudios;
  v record;
begin
  perform private.exigir_servidor();
  select * into e from public.estudios where id = p_estudio_id;
  select * into v from private.ventana(e, p_semana);
  return jsonb_build_object(
    -- Fecha de referencia: el día siguiente al cierre de la semana (hora de Madrid).
    'referencia', (v.cierra at time zone e.zona_horaria)::date,
    'convocatorias', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'nombre', nombre, 'fecha_apertura', fecha_apertura, 'fecha_cierre', fecha_cierre))
      from public.convocatorias where activa
    ), '[]'::jsonb),
    'parejas', coalesce((
      select jsonb_agg(jsonb_build_object('pareja_id', pa.id, 'activado', pe.puente_doctorado))
      from public.parejas pa
      join public.masters m on m.id = pa.master_id and m.estudio_id = p_estudio_id
      join public.perfiles pe on pe.user_id = pa.estudiante_id
      where pa.finalizada_at is null
    ), '[]'::jsonb)
  );
end
$$;

-- Guarda lo decidido sobre Puente esa semana (no se sobrescribe).
create or replace function public.servicio_registrar_puente(p_semana integer, p_filas jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.exigir_servidor();
  insert into public.puente_semanal (pareja_id, semana, activado, linea, convocatorias)
  select (f ->> 'pareja_id')::uuid, p_semana, (f ->> 'activado')::boolean, f ->> 'linea', coalesce(f -> 'convocatorias', '[]'::jsonb)
  from jsonb_array_elements(coalesce(p_filas, '[]'::jsonb)) f
  on conflict do nothing;
  return jsonb_build_object('ok', true);
end
$$;

-- La agenda que ve cada pareja incluye ahora la línea de Puente (si la hay),
-- aunque esa semana no haya agenda de desajuste. Y se anota que se mostró.
create or replace function private.agenda_de(p_pareja_id uuid, p_rol public.rol_usuario)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  so public.sorteos;
  a public.agendas;
  ps public.puente_semanal;
begin
  select s.* into so from public.sorteos s
  join public.cierres_semana c on c.semana = s.semana
  join public.parejas pa on pa.id = s.pareja_id
  join public.masters m on m.id = pa.master_id and m.estudio_id = c.estudio_id
  where s.pareja_id = p_pareja_id and c.completado_at is not null
  order by s.semana desc limit 1;
  if not found then
    return null;
  end if;
  select * into a from public.agendas where pareja_id = p_pareja_id and semana = so.semana;
  select * into ps from public.puente_semanal where pareja_id = p_pareja_id and semana = so.semana;

  if ps.linea is not null then
    if p_rol = 'estudiante' then
      update public.puente_semanal set vista_estudiante_at = coalesce(vista_estudiante_at, now()) where pareja_id = p_pareja_id and semana = so.semana;
    elsif p_rol = 'tutor' then
      update public.puente_semanal set vista_tutor_at = coalesce(vista_tutor_at, now()) where pareja_id = p_pareja_id and semana = so.semana;
    end if;
  end if;

  if a.id is null then
    return jsonb_build_object('estado', 'sin_agenda', 'semana', so.semana, 'linea_puente', ps.linea);
  end if;
  if p_rol = 'estudiante' then
    update public.agendas set vista_estudiante_at = coalesce(vista_estudiante_at, now()) where id = a.id;
  elsif p_rol = 'tutor' then
    update public.agendas set vista_tutor_at = coalesce(vista_tutor_at, now()) where id = a.id;
  end if;
  return jsonb_build_object('estado', 'agenda', 'semana', so.semana, 'preguntas', a.preguntas, 'linea_puente', coalesce(ps.linea, a.linea_puente));
end
$$;

-- ---------------------------------------------------------------------------
-- Cuestionarios: funciones
-- ---------------------------------------------------------------------------

-- ¿Está abierto el cuestionario ahora?
-- El pretest (desde la semana 0) está abierto desde el registro hasta el
-- cierre de su semana "hasta". El resto, entre la apertura de "desde" y el
-- cierre de "hasta".
create or replace function private.cuestionario_abierto(p_clave text)
returns boolean
language plpgsql stable security definer set search_path = ''
as $$
declare
  c public.cuestionarios;
  e public.estudios;
  desde record;
  hasta record;
begin
  select * into c from public.cuestionarios where clave = p_clave and activo;
  if not found then
    return false;
  end if;
  select * into e from public.estudios where id = private.estudio_actual();
  if e.fecha_inicio is null then
    -- Sin fecha de inicio, solo está disponible el pretest.
    return c.desde_semana = 0;
  end if;
  select * into hasta from private.ventana(e, c.hasta_semana);
  if c.desde_semana = 0 then
    return private.ahora() < hasta.cierra;
  end if;
  select * into desde from private.ventana(e, c.desde_semana);
  return private.ahora() >= desde.abre and private.ahora() < hasta.cierra;
end
$$;

create or replace function public.mis_cuestionarios()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_rol public.rol_usuario := private.rol_actual();
begin
  perform private.exigir_participante(v_rol);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'clave', c.clave, 'titulo', c.titulo,
      'abierto', private.cuestionario_abierto(c.clave),
      'completado', not exists (
        select 1 from public.cuestionario_items i
        where i.cuestionario = c.clave and i.obligatorio
          and not exists (select 1 from public.cuestionario_respuestas r where r.item_id = i.id and r.user_id = auth.uid())
      )
    ) order by c.desde_semana)
    from public.cuestionarios c where c.activo and c.rol = v_rol
  ), '[]'::jsonb);
end
$$;

create or replace function public.ver_cuestionario(p_clave text)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  c public.cuestionarios;
begin
  select * into c from public.cuestionarios where clave = p_clave and activo;
  if not found then
    perform private.error('NO_ENCONTRADO', 'Ese cuestionario no existe.');
  end if;
  if private.es_investigador() is false then
    perform private.exigir_participante(c.rol);
  end if;
  return jsonb_build_object(
    'clave', c.clave, 'titulo', c.titulo, 'instrucciones', c.instrucciones,
    'abierto', private.cuestionario_abierto(c.clave),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id, 'bloque', i.bloque, 'texto', i.texto, 'tipo', i.tipo, 'minimo', i.minimo, 'maximo', i.maximo,
        'ancla_min', i.ancla_min, 'ancla_max', i.ancla_max, 'opciones', i.opciones, 'obligatorio', i.obligatorio,
        'pendiente', i.pendiente,
        'respuesta', (select r.valor from public.cuestionario_respuestas r where r.item_id = i.id and r.user_id = auth.uid())
      ) order by i.orden)
      from public.cuestionario_items i where i.cuestionario = c.clave
    ), '[]'::jsonb)
  );
end
$$;

-- Guarda todas las respuestas de una vez. p_respuestas: { "<item_id>": valor, ... }
create or replace function public.responder_cuestionario(p_clave text, p_respuestas jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  c public.cuestionarios;
  i public.cuestionario_items;
  valor jsonb;
begin
  select * into c from public.cuestionarios where clave = p_clave and activo;
  if not found then
    perform private.error('NO_ENCONTRADO', 'Ese cuestionario no existe.');
  end if;
  perform private.exigir_participante(c.rol);
  if not private.cuestionario_abierto(p_clave) then
    perform private.error('CUESTIONARIO_CERRADO', 'Este cuestionario no está abierto ahora.');
  end if;
  for i in select * from public.cuestionario_items where cuestionario = p_clave order by orden loop
    valor := p_respuestas -> i.id::text;
    if valor is null or valor = 'null'::jsonb then
      if i.obligatorio then
        perform private.error('FALTAN_RESPUESTAS', 'Responde a todas las preguntas antes de enviar.');
      end if;
      continue;
    end if;
    if i.tipo = 'escala' and (jsonb_typeof(valor) <> 'number' or (valor #>> '{}')::numeric not between i.minimo and i.maximo
                             or (valor #>> '{}')::numeric <> round((valor #>> '{}')::numeric)) then
      perform private.error('VALOR_NO_VALIDO', 'Hay una respuesta fuera de la escala.');
    elsif i.tipo = 'si_no' and jsonb_typeof(valor) <> 'boolean' then
      perform private.error('VALOR_NO_VALIDO', 'Responde sí o no.');
    elsif i.tipo = 'opcion' and (jsonb_typeof(valor) <> 'string' or not (i.opciones ? (valor #>> '{}'))) then
      perform private.error('VALOR_NO_VALIDO', 'Elige una de las opciones.');
    end if;
    insert into public.cuestionario_respuestas (user_id, item_id, valor) values (auth.uid(), i.id, valor)
    on conflict (user_id, item_id) do update set valor = excluded.valor, updated_at = now();
  end loop;
  return jsonb_build_object('ok', true);
end
$$;

-- Investigador: cuestionarios con su número de respuestas (sin respuestas individuales).
create or replace function public.resumen_cuestionarios()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_investigador();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'clave', c.clave, 'titulo', c.titulo, 'desde_semana', c.desde_semana, 'hasta_semana', c.hasta_semana,
      'items', (select count(*) from public.cuestionario_items i where i.cuestionario = c.clave),
      'pendientes', (select count(*) from public.cuestionario_items i where i.cuestionario = c.clave and i.pendiente),
      'personas', (select count(distinct r.user_id) from public.cuestionario_respuestas r
                   join public.cuestionario_items i on i.id = r.item_id where i.cuestionario = c.clave)
    ) order by c.desde_semana)
    from public.cuestionarios c
  ), '[]'::jsonb);
end
$$;

-- ---------------------------------------------------------------------------
-- Correos: funciones del servidor
-- ---------------------------------------------------------------------------

-- ¿Ha hecho ya esta persona su check-in de la semana? (El tutor, si ha
-- respondido sobre todos sus estudiantes activos.)
create or replace function private.ha_respondido(p_user_id uuid, p_rol public.rol_usuario, p_semana integer)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select case p_rol
    when 'estudiante' then exists (
      select 1 from public.respuestas_estudiante r join public.parejas pa on pa.id = r.pareja_id
      where pa.estudiante_id = p_user_id and r.semana = p_semana)
    -- El tutor ha respondido si lo ha hecho sobre todas sus parejas (como
    -- principal o como cotutor).
    when 'tutor' then not exists (
      select 1 from public.parejas pa
      join public.perfiles pe on pe.user_id = pa.estudiante_id and pe.retirado_at is null
      where private.es_tutor_de(pa.id, p_user_id) and pa.finalizada_at is null
        and not exists (select 1 from public.respuestas_tutor r where r.pareja_id = pa.id and r.semana = p_semana and r.tutor_id = p_user_id))
    else true
  end
$$;

-- Personas a las que toca recordar algo ahora. Solo el servidor ve los correos.
--   apertura:   la semana está abierta, faltan más de 48 horas para el cierre
--               y aún no ha respondido.
--   cierre_48h: faltan 48 horas o menos para el cierre y aún no ha respondido.
-- Cada recordatorio se envía como mucho una vez por persona y semana, y solo a
-- quien los tiene activados, participa y no se ha retirado.
create or replace function public.servicio_recordatorios_pendientes()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  resultado jsonb := '[]'::jsonb;
  e public.estudios;
  v_cal jsonb;
  v_semana integer;
  v_cierra timestamptz;
  v_tipo text;
begin
  perform private.exigir_servidor();
  for e in select * from public.estudios where fecha_inicio is not null loop
    v_cal := private.estado_calendario(e.id);
    continue when v_cal ->> 'estado' <> 'abierta';
    v_semana := (v_cal ->> 'semana')::integer;
    v_cierra := (v_cal ->> 'cierra')::timestamptz;
    v_tipo := case when private.ahora() >= v_cierra - interval '48 hours' then 'cierre_48h' else 'apertura' end;

    resultado := resultado || coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', p.user_id, 'email', i.email, 'nombre', i.nombre, 'rol', p.rol,
        'tipo', v_tipo, 'semana', v_semana, 'cierra', v_cierra, 'tipo_trabajo', m.tipo_trabajo
      ))
      from public.perfiles p
      join public.masters m on m.id = p.master_id and m.estudio_id = e.id
      join public.identidades i on i.user_id = p.user_id
      where p.rol in ('estudiante', 'tutor') and p.retirado_at is null and p.recordatorios
        and exists (select 1 from public.consentimientos c join public.consentimiento_textos ct on ct.version = c.version and ct.vigente
                    where c.user_id = p.user_id and c.retirado_at is null)
        and not exists (select 1 from public.correos_enviados ce where ce.user_id = p.user_id and ce.tipo = v_tipo and ce.semana = v_semana)
        and not private.ha_respondido(p.user_id, p.rol, v_semana)
        -- Un tutor sin estudiantes no recibe recordatorios.
        and (p.rol = 'estudiante' or exists (select 1 from public.parejas pa where private.es_tutor_de(pa.id, p.user_id)))
    ), '[]'::jsonb);
  end loop;
  return resultado;
end
$$;

-- Avisos de apoyo todavía sin notificar, con los correos de la dirección.
create or replace function public.servicio_avisos_por_notificar()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_servidor();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'aviso_id', a.id, 'master', m.nombre, 'nombre_autorizado', a.nombre_autorizado,
      'destinatarios', coalesce((
        select jsonb_agg(jsonb_build_object('user_id', p.user_id, 'email', i.email))
        from public.perfiles p join public.identidades i on i.user_id = p.user_id
        where p.master_id = a.master_id and p.rol = 'direccion' and p.retirado_at is null
      ), '[]'::jsonb)
    ))
    from public.avisos_apoyo a join public.masters m on m.id = a.master_id
    where a.notificado_at is null
  ), '[]'::jsonb);
end
$$;

create or replace function public.servicio_registrar_correo(p_user_id uuid, p_tipo text, p_semana integer, p_referencia uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.exigir_servidor();
  insert into public.correos_enviados (user_id, tipo, semana, referencia) values (p_user_id, p_tipo, p_semana, p_referencia)
  on conflict do nothing;
  return jsonb_build_object('ok', true);
end
$$;

create or replace function public.servicio_aviso_notificado(p_aviso_id uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.exigir_servidor();
  update public.avisos_apoyo set notificado_at = coalesce(notificado_at, now()) where id = p_aviso_id;
  return jsonb_build_object('ok', true);
end
$$;

-- ---------------------------------------------------------------------------
-- Permisos de ejecución
-- ---------------------------------------------------------------------------

revoke all on function
  public.mi_puente(), public.cambiar_puente(boolean), public.listar_convocatorias(), public.guardar_convocatoria(jsonb),
  public.servicio_datos_puente(uuid, integer), public.servicio_registrar_puente(integer, jsonb),
  public.mis_cuestionarios(), public.ver_cuestionario(text), public.responder_cuestionario(text, jsonb),
  public.resumen_cuestionarios(), public.servicio_recordatorios_pendientes(), public.servicio_avisos_por_notificar(),
  public.servicio_registrar_correo(uuid, text, integer, uuid), public.servicio_aviso_notificado(uuid)
from public, anon, authenticated;

grant execute on function
  public.mi_puente(), public.cambiar_puente(boolean), public.listar_convocatorias(), public.guardar_convocatoria(jsonb),
  public.mis_cuestionarios(), public.ver_cuestionario(text), public.responder_cuestionario(text, jsonb),
  public.resumen_cuestionarios()
to authenticated;

grant execute on function
  public.servicio_datos_puente(uuid, integer), public.servicio_registrar_puente(integer, jsonb),
  public.servicio_recordatorios_pendientes(), public.servicio_avisos_por_notificar(),
  public.servicio_registrar_correo(uuid, text, integer, uuid), public.servicio_aviso_notificado(uuid)
to service_role;
