-- SINTONÍA · Migración 6: desajuste, sorteo (microensayo aleatorizado) y agenda
--
-- El cálculo del desajuste y el sorteo se hacen en el servidor
-- (src/logica). Aquí se guardan los resultados, con la versión de la regla y
-- del algoritmo, para que el análisis sepa exactamente qué se aplicó.
-- Solo el servidor (rol service_role) puede escribir en estas tablas.

-- ---------------------------------------------------------------------------
-- Reglas del desajuste (versionadas)
-- ---------------------------------------------------------------------------

create table public.reglas_desajuste (
  version text primary key,
  -- Relevante si |diferencia| >= umbral_absoluto ...
  umbral_absoluto smallint not null check (umbral_absoluto between 1 and 4),
  -- ... o si |diferencia| >= umbral_persistente, con el mismo signo,
  -- durante semanas_persistencia semanas seguidas.
  umbral_persistente smallint not null check (umbral_persistente between 1 and 4),
  semanas_persistencia smallint not null check (semanas_persistencia between 2 and 10),
  vigente boolean not null default false,
  descripcion text,
  created_at timestamptz not null default now()
);
create unique index reglas_un_vigente on public.reglas_desajuste (vigente) where vigente;

insert into public.reglas_desajuste (version, umbral_absoluto, umbral_persistente, semanas_persistencia, vigente, descripcion)
values ('v1', 2, 1, 2, true, 'Diferencia absoluta de 2 o más, o de 1 con el mismo signo durante 2 semanas seguidas.');

-- ---------------------------------------------------------------------------
-- Cierres de semana: cada semana se procesa una sola vez
-- ---------------------------------------------------------------------------

create table public.cierres_semana (
  estudio_id uuid not null references public.estudios (id) on delete cascade,
  semana smallint not null,
  iniciado_at timestamptz not null default now(),
  completado_at timestamptz,
  primary key (estudio_id, semana)
);

-- ---------------------------------------------------------------------------
-- Desajustes calculados
-- ---------------------------------------------------------------------------

-- Uno por pareja, semana, ítem y tutor (con cotutoría, se calcula con cada uno).
create table public.desajustes (
  pareja_id uuid not null references public.parejas (id) on delete cascade,
  tutor_id uuid not null references public.perfiles (user_id) on delete cascade,
  semana smallint not null,
  item text not null check (item in ('avance', 'siguiente_paso')),
  valor_estudiante smallint not null,
  valor_tutor smallint not null,
  -- estudiante menos tutor
  diferencia smallint not null,
  relevante boolean not null,
  motivo text check (motivo in ('absoluto', 'persistente')),
  regla_version text not null references public.reglas_desajuste (version),
  calculado_at timestamptz not null default now(),
  primary key (pareja_id, semana, item, tutor_id)
);

-- ---------------------------------------------------------------------------
-- Sorteos: se guardan ANTES de generar o mostrar ninguna agenda
-- ---------------------------------------------------------------------------

create table public.sorteos (
  pareja_id uuid not null references public.parejas (id) on delete cascade,
  semana smallint not null,
  -- ¿Se podía sortear? (hacen falta los dos check-ins)
  elegible boolean not null,
  motivo_no_elegible text check (motivo_no_elegible in ('falta_estudiante', 'falta_tutor', 'faltan_ambos', 'sin_tutor', 'retirado')),
  probabilidad numeric(3, 2),
  semilla text,
  valor_aleatorio double precision,
  resultado boolean,
  algoritmo_version text not null,
  -- ¿Había algún desajuste relevante? (para el análisis)
  desajuste_relevante boolean,
  realizado_at timestamptz not null default now(),
  primary key (pareja_id, semana),
  check (elegible = (resultado is not null)),
  check (elegible = (motivo_no_elegible is null))
);

-- ---------------------------------------------------------------------------
-- Banco de preguntas (modo sin modelo de lenguaje)
-- ---------------------------------------------------------------------------

create table public.banco_preguntas (
  id serial primary key,
  -- avance, siguiente_paso o general
  tipo text not null check (tipo in ('avance', 'siguiente_paso', 'general')),
  texto text not null unique,
  activo boolean not null default true,
  provisional boolean not null default true
);

-- Preguntas provisionales, neutras: no culpan, no dicen quién tiene razón,
-- no mencionan puntuaciones ni hablan de emociones. Pendientes de revisión.
insert into public.banco_preguntas (tipo, texto) values
  ('avance', '¿Qué parte del trabajo consideráis cerrada y cuál sigue abierta?'),
  ('avance', '¿Qué se ha hecho desde la última tutoría y qué falta para el próximo entregable?'),
  ('avance', '¿Qué criterio vais a usar para dar por terminada una parte del trabajo?'),
  ('avance', '¿Qué parte del trabajo conviene revisar juntos en esta tutoría?'),
  ('siguiente_paso', '¿Cuál es el próximo entregable y para cuándo?'),
  ('siguiente_paso', '¿Cuál es el siguiente paso concreto y qué hace falta para darlo?'),
  ('siguiente_paso', '¿Qué decisión pendiente conviene tomar para poder seguir?'),
  ('siguiente_paso', '¿Qué hará cada uno antes de la próxima tutoría?'),
  ('general', '¿Hay algo que esté frenando el avance?'),
  ('general', '¿Qué dudas conviene resolver antes de seguir?'),
  ('general', '¿Qué ha funcionado bien en la forma de trabajar de estas semanas?'),
  ('general', '¿Cómo y cuándo vais a estar en contacto hasta la próxima tutoría?'),
  ('general', '¿Qué fuentes o materiales hacen falta para la siguiente fase?'),
  ('general', '¿Qué plazos del calendario académico conviene tener presentes?');

-- ---------------------------------------------------------------------------
-- Agendas: las mismas tres preguntas para estudiante y tutor
-- ---------------------------------------------------------------------------

create table public.agendas (
  id uuid primary key default gen_random_uuid(),
  pareja_id uuid not null,
  semana smallint not null,
  preguntas jsonb not null check (jsonb_typeof(preguntas) = 'array' and jsonb_array_length(preguntas) = 3),
  origen text not null check (origen in ('modelo', 'banco')),
  -- Por qué se usó el banco: sin_modelo, error_modelo o validacion.
  motivo_banco text check (motivo_banco in ('sin_modelo', 'error_modelo', 'validacion')),
  version_prompt text,
  modelo text,
  -- Exactamente lo que se envió al modelo (sin datos personales), o null.
  entrada_modelo jsonb,
  -- Línea de Puente al doctorado (Fase 5).
  linea_puente text,
  created_at timestamptz not null default now(),
  vista_estudiante_at timestamptz,
  vista_tutor_at timestamptz,
  unique (pareja_id, semana),
  -- Solo puede existir una agenda si antes se guardó un sorteo.
  foreign key (pareja_id, semana) references public.sorteos (pareja_id, semana) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Permisos
-- ---------------------------------------------------------------------------

alter table public.reglas_desajuste enable row level security;
alter table public.cierres_semana enable row level security;
alter table public.desajustes enable row level security;
alter table public.sorteos enable row level security;
alter table public.banco_preguntas enable row level security;
alter table public.agendas enable row level security;

revoke all on public.reglas_desajuste, public.cierres_semana, public.desajustes, public.sorteos,
  public.banco_preguntas, public.agendas from public, anon, authenticated;
grant select on public.reglas_desajuste, public.desajustes, public.sorteos, public.banco_preguntas, public.agendas to authenticated;

create policy "lectura general" on public.reglas_desajuste for select to authenticated using (true);
create policy "solo investigador" on public.banco_preguntas for select to authenticated using (private.es_investigador());
-- Desajustes y sorteos: solo el investigador. Ni el estudiante ni el tutor
-- ven la diferencia ni el resultado del sorteo como tal.
create policy "solo investigador" on public.desajustes for select to authenticated using (private.es_investigador());
create policy "solo investigador" on public.sorteos for select to authenticated using (private.es_investigador());
-- Agendas: los dos miembros de la pareja y el investigador.
create policy "miembros o investigador" on public.agendas for select to authenticated
  using (pareja_id in (select private.mis_parejas()) or private.es_investigador());

-- ---------------------------------------------------------------------------
-- Funciones del servidor (solo service_role)
-- ---------------------------------------------------------------------------

-- Además de que solo service_role puede ejecutar estas funciones, se
-- comprueba el rol del token. (Dentro de una función "security definer",
-- current_user es siempre el dueño, así que no sirve para esta comprobación.)
create or replace function private.exigir_servidor()
returns void
language plpgsql stable
as $$
begin
  if auth.role() = 'service_role' then
    return;
  end if;
  -- Sin token: alguien administrando directamente la base de datos.
  if auth.role() is null and session_user in ('postgres', 'supabase_admin') then
    return;
  end if;
  perform private.error('SIN_PERMISO', 'Solo el servidor puede hacer esto.');
end
$$;

-- Semanas ya cerradas que todavía no se han procesado.
create or replace function public.servicio_semanas_por_cerrar()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  resultado jsonb := '[]'::jsonb;
  e public.estudios;
  v record;
begin
  perform private.exigir_servidor();
  for e in select * from public.estudios where fecha_inicio is not null loop
    for n in 1 .. e.semanas loop
      select * into v from private.ventana(e, n);
      exit when v.cierra > private.ahora();
      if not exists (select 1 from public.cierres_semana c where c.estudio_id = e.id and c.semana = n and c.completado_at is not null) then
        resultado := resultado || jsonb_build_object('estudio_id', e.id, 'semana', n, 'semanas', e.semanas, 'probabilidad', e.probabilidad_agenda);
      end if;
    end loop;
  end loop;
  return resultado;
end
$$;

-- Datos de una semana para calcular el desajuste: SOLO códigos y números.
-- Incluye las semanas anteriores necesarias para la regla de persistencia.
create or replace function public.servicio_datos_semana(p_estudio_id uuid, p_semana integer)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  r public.reglas_desajuste;
begin
  perform private.exigir_servidor();
  select * into r from public.reglas_desajuste where vigente;
  return jsonb_build_object(
    'regla', jsonb_build_object('version', r.version, 'umbralAbsoluto', r.umbral_absoluto,
      'umbralPersistente', r.umbral_persistente, 'semanasPersistencia', r.semanas_persistencia),
    'parejas', coalesce((
      select jsonb_agg(jsonb_build_object(
        'pareja_id', pa.id,
        -- Sin ningún tutor activo (ni principal ni cotutor).
        'sin_tutor', not exists (
          select 1 from public.perfiles t
          where t.retirado_at is null
            and (t.user_id = pa.tutor_id
                 or t.user_id in (select c.tutor_id from public.cotutores c where c.pareja_id = pa.id and c.finalizada_at is null))
        ),
        'retirado', pe.retirado_at is not null,
        'tiene_agenda', exists (select 1 from public.agendas a where a.pareja_id = pa.id and a.semana = p_semana),
        'semanas', (
          select coalesce(jsonb_agg(jsonb_build_object(
            'semana', s,
            'estudiante', (select jsonb_build_object('avance', re.avance, 'siguiente_paso', re.siguiente_paso)
                           from public.respuestas_estudiante re where re.pareja_id = pa.id and re.semana = s),
            -- Una respuesta por tutor (principal y cotutores), solo de tutores no retirados.
            'tutores', (select coalesce(jsonb_agg(jsonb_build_object(
                          'tutor_id', rt.tutor_id, 'principal', rt.principal,
                          'avance', rt.avance, 'siguiente_paso', rt.siguiente_paso) order by rt.principal desc, rt.created_at), '[]'::jsonb)
                        from public.respuestas_tutor rt
                        join public.perfiles t on t.user_id = rt.tutor_id and t.retirado_at is null
                        where rt.pareja_id = pa.id and rt.semana = s)
          ) order by s), '[]'::jsonb)
          from generate_series(greatest(1, p_semana - r.semanas_persistencia + 1), p_semana) s
        ),
        'preguntas_previas', (
          select coalesce(jsonb_agg(q), '[]'::jsonb)
          from public.agendas a, jsonb_array_elements_text(a.preguntas) q
          where a.pareja_id = pa.id and a.semana < p_semana
        )
      ))
      from public.parejas pa
      join public.masters m on m.id = pa.master_id and m.estudio_id = p_estudio_id
      join public.perfiles pe on pe.user_id = pa.estudiante_id
      where pa.finalizada_at is null and pa.created_at < (select v.cierra from private.ventana((select e from public.estudios e where e.id = p_estudio_id), p_semana) v)
    ), '[]'::jsonb),
    'banco', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'tipo', tipo, 'texto', texto) order by id), '[]'::jsonb)
              from public.banco_preguntas where activo)
  );
end
$$;

-- Guarda desajustes y sorteos de una semana. Si ya existían, NO los cambia:
-- un sorteo nunca se repite. Devuelve los sorteos guardados.
create or replace function public.servicio_registrar_sorteos(p_estudio_id uuid, p_semana integer, p_desajustes jsonb, p_sorteos jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.exigir_servidor();
  insert into public.cierres_semana (estudio_id, semana) values (p_estudio_id, p_semana) on conflict do nothing;

  insert into public.desajustes (pareja_id, tutor_id, semana, item, valor_estudiante, valor_tutor, diferencia, relevante, motivo, regla_version)
  select (d ->> 'pareja_id')::uuid, (d ->> 'tutor_id')::uuid, p_semana, d ->> 'item', (d ->> 'valor_estudiante')::smallint, (d ->> 'valor_tutor')::smallint,
         (d ->> 'diferencia')::smallint, (d ->> 'relevante')::boolean, d ->> 'motivo', d ->> 'regla_version'
  from jsonb_array_elements(coalesce(p_desajustes, '[]'::jsonb)) d
  on conflict do nothing;

  insert into public.sorteos (pareja_id, semana, elegible, motivo_no_elegible, probabilidad, semilla, valor_aleatorio,
                              resultado, algoritmo_version, desajuste_relevante)
  select (s ->> 'pareja_id')::uuid, p_semana, (s ->> 'elegible')::boolean, s ->> 'motivo_no_elegible',
         (s ->> 'probabilidad')::numeric, s ->> 'semilla', (s ->> 'valor_aleatorio')::double precision,
         (s ->> 'resultado')::boolean, s ->> 'algoritmo_version', (s ->> 'desajuste_relevante')::boolean
  from jsonb_array_elements(coalesce(p_sorteos, '[]'::jsonb)) s
  on conflict do nothing;

  return coalesce((
    select jsonb_agg(jsonb_build_object('pareja_id', so.pareja_id, 'resultado', so.resultado, 'elegible', so.elegible))
    from public.sorteos so
    join public.parejas pa on pa.id = so.pareja_id
    join public.masters m on m.id = pa.master_id and m.estudio_id = p_estudio_id
    where so.semana = p_semana
  ), '[]'::jsonb);
end
$$;

create or replace function public.servicio_guardar_agenda(p_pareja_id uuid, p_semana integer, p_agenda jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.exigir_servidor();
  if not exists (select 1 from public.sorteos where pareja_id = p_pareja_id and semana = p_semana and resultado) then
    perform private.error('SIN_SORTEO', 'No hay un sorteo favorable guardado para esta pareja y semana.');
  end if;
  insert into public.agendas (pareja_id, semana, preguntas, origen, motivo_banco, version_prompt, modelo, entrada_modelo, linea_puente)
  values (p_pareja_id, p_semana, p_agenda -> 'preguntas', p_agenda ->> 'origen', p_agenda ->> 'motivo_banco',
          p_agenda ->> 'version_prompt', p_agenda ->> 'modelo', p_agenda -> 'entrada_modelo', p_agenda ->> 'linea_puente')
  on conflict (pareja_id, semana) do nothing;
  return jsonb_build_object('ok', true);
end
$$;

create or replace function public.servicio_completar_cierre(p_estudio_id uuid, p_semana integer)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.exigir_servidor();
  -- Solo se da por completado si todas las parejas con sorteo favorable tienen agenda.
  if exists (
    select 1 from public.sorteos so
    join public.parejas pa on pa.id = so.pareja_id
    join public.masters m on m.id = pa.master_id and m.estudio_id = p_estudio_id
    where so.semana = p_semana and so.resultado
      and not exists (select 1 from public.agendas a where a.pareja_id = so.pareja_id and a.semana = p_semana)
  ) then
    perform private.error('AGENDAS_PENDIENTES', 'Faltan agendas por generar.');
  end if;
  update public.cierres_semana set completado_at = now() where estudio_id = p_estudio_id and semana = p_semana;
  return jsonb_build_object('ok', true);
end
$$;

-- ---------------------------------------------------------------------------
-- Funciones para estudiante y tutor: la agenda
-- ---------------------------------------------------------------------------

-- Agenda de la última semana cerrada y procesada para una pareja.
-- estado: 'agenda' (con preguntas), 'sin_agenda' (mensaje neutro) o null.
create or replace function private.agenda_de(p_pareja_id uuid, p_rol public.rol_usuario)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  so public.sorteos;
  a public.agendas;
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
  if a.id is null then
    -- No elegible o sorteo sin agenda: el mismo mensaje neutro para ambos casos.
    return jsonb_build_object('estado', 'sin_agenda', 'semana', so.semana);
  end if;
  -- Registro de la primera vez que cada uno ve la agenda.
  if p_rol = 'estudiante' then
    update public.agendas set vista_estudiante_at = coalesce(vista_estudiante_at, now()) where id = a.id;
  elsif p_rol = 'tutor' then
    update public.agendas set vista_tutor_at = coalesce(vista_tutor_at, now()) where id = a.id;
  end if;
  return jsonb_build_object('estado', 'agenda', 'semana', so.semana, 'preguntas', a.preguntas, 'linea_puente', a.linea_puente);
end
$$;

create or replace function public.mi_agenda()
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_pareja uuid;
begin
  perform private.exigir_participante('estudiante');
  select id into v_pareja from public.parejas where estudiante_id = auth.uid();
  return private.agenda_de(v_pareja, 'estudiante');
end
$$;

create or replace function public.agendas_tutor()
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.exigir_participante('tutor');
  return coalesce((
    select jsonb_agg(jsonb_build_object('pareja_id', pa.id, 'nombre', i.nombre, 'cotutor', pa.tutor_id is distinct from auth.uid(),
                                     'agenda', private.agenda_de(pa.id, 'tutor')) order by i.nombre)
    from public.parejas pa
    join public.perfiles pe on pe.user_id = pa.estudiante_id and pe.retirado_at is null
    join public.identidades i on i.user_id = pa.estudiante_id
    where pa.id in (select private.parejas_como_tutor()) and pa.finalizada_at is null
  ), '[]'::jsonb);
end
$$;

-- Resumen de sorteos por semana para el investigador (sin parejas concretas).
create or replace function public.resumen_sorteos()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_investigador();
  return coalesce((
    select jsonb_agg(to_jsonb(r) order by r.semana)
    from (
      select semana,
        count(*) as parejas,
        count(*) filter (where elegible) as elegibles,
        count(*) filter (where resultado) as con_agenda,
        count(*) filter (where resultado = false) as sin_agenda,
        count(*) filter (where desajuste_relevante) as con_desajuste
      from public.sorteos group by semana
    ) r
  ), '[]'::jsonb);
end
$$;

-- ---------------------------------------------------------------------------
-- Permisos de ejecución
-- ---------------------------------------------------------------------------

revoke all on function
  public.servicio_semanas_por_cerrar(), public.servicio_datos_semana(uuid, integer),
  public.servicio_registrar_sorteos(uuid, integer, jsonb, jsonb), public.servicio_guardar_agenda(uuid, integer, jsonb),
  public.servicio_completar_cierre(uuid, integer), public.mi_agenda(), public.agendas_tutor(), public.resumen_sorteos()
from public, anon, authenticated;

grant usage on schema private to service_role;
grant execute on function
  public.servicio_semanas_por_cerrar(), public.servicio_datos_semana(uuid, integer),
  public.servicio_registrar_sorteos(uuid, integer, jsonb, jsonb), public.servicio_guardar_agenda(uuid, integer, jsonb),
  public.servicio_completar_cierre(uuid, integer)
to service_role;

grant execute on function public.mi_agenda(), public.agendas_tutor(), public.resumen_sorteos() to authenticated;
