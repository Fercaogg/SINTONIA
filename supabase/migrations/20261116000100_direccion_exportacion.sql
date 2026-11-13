-- SINTONÍA · Migración 8: panel de la dirección y exportación para la investigación

-- Mínimo de personas para mostrar una cifra a la dirección.
insert into public.configuracion (clave, valor, descripcion, pendiente)
values ('minimo_anonimato', '5', 'Ninguna cifra para la dirección se calcula sobre menos de estas personas.', false)
on conflict (clave) do nothing;

-- ---------------------------------------------------------------------------
-- Supresión de grupos pequeños
-- ---------------------------------------------------------------------------

-- Devuelve la cifra solo si se ha calculado sobre al menos el mínimo de
-- personas. Si no, devuelve null y la marca de suprimida (sin decir cuántas
-- personas había, porque eso también sería una cifra sobre pocas personas).
create or replace function private.cifra(p_valor numeric, p_personas integer)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select case
    when coalesce(p_personas, 0) >= coalesce(private.config('minimo_anonimato')::integer, 5)
      then jsonb_build_object('valor', p_valor, 'suprimida', false)
    else jsonb_build_object('valor', null, 'suprimida', true)
  end
$$;

-- ---------------------------------------------------------------------------
-- Panel de la dirección: solo datos agregados y anónimos de su máster
-- ---------------------------------------------------------------------------
-- Para cada semana cerrada:
--   tasa_estudiantes: estudiantes que respondieron / estudiantes participantes
--   tasa_tutores:     tutores que respondieron sobre todos sus estudiantes / tutores
--   avance_estudiantes, avance_tutores: media del avance (1 a 5)
--   desajuste_medio:  media de |avance del estudiante − avance del tutor|
--   agendas:          número de agendas generadas
-- Nunca por tutor, nunca filas individuales, nunca bienestar.
create or replace function public.resumen_direccion()
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  m public.masters;
  e public.estudios;
  semanas jsonb := '[]'::jsonb;
  v record;
  n_est integer; n_resp_est integer; n_tut integer; n_resp_tut integer; n_tut_avance integer; n_ambos integer; n_elegibles integer;
  avance_e numeric; avance_t numeric; desajuste numeric; agendas integer;
begin
  if private.rol_actual() is distinct from 'direccion' then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  select * into m from public.masters where id = private.master_actual();
  select * into e from public.estudios where id = m.estudio_id;

  if e.fecha_inicio is not null then
    for w in 1 .. e.semanas loop
      select * into v from private.ventana(e, w);
      exit when v.cierra > private.ahora();

      -- Parejas que participaban esa semana.
      create temporary table if not exists pg_temp.parejas_semana (pareja_id uuid, estudiante_id uuid, tutor_id uuid) on commit drop;
      truncate pg_temp.parejas_semana;
      insert into pg_temp.parejas_semana
      select pa.id, pa.estudiante_id, pa.tutor_id
      from public.parejas pa
      join public.perfiles pe on pe.user_id = pa.estudiante_id
      where pa.master_id = m.id and pa.created_at < v.cierra
        and (pe.retirado_at is null or pe.retirado_at > v.cierra);

      select count(*) into n_est from pg_temp.parejas_semana;
      select count(*), avg(r.avance) into n_resp_est, avance_e
      from pg_temp.parejas_semana p join public.respuestas_estudiante r on r.pareja_id = p.pareja_id and r.semana = w;

      -- Tutores de esas parejas esa semana: principal y cotutores activos.
      create temporary table if not exists pg_temp.tutores_semana (pareja_id uuid, tutor_id uuid) on commit drop;
      truncate pg_temp.tutores_semana;
      insert into pg_temp.tutores_semana
      select p.pareja_id, p.tutor_id from pg_temp.parejas_semana p where p.tutor_id is not null
      union
      select c.pareja_id, c.tutor_id from public.cotutores c
      join pg_temp.parejas_semana p on p.pareja_id = c.pareja_id
      where c.created_at < v.cierra and (c.finalizada_at is null or c.finalizada_at > v.cierra);

      select count(distinct tutor_id) into n_tut from pg_temp.tutores_semana;
      -- Tutores que respondieron sobre todas sus parejas.
      select count(*) into n_resp_tut from (
        select t.tutor_id from pg_temp.tutores_semana t
        left join public.respuestas_tutor rt on rt.pareja_id = t.pareja_id and rt.semana = w and rt.tutor_id = t.tutor_id
        group by t.tutor_id having bool_and(rt.id is not null)
      ) x;
      select count(distinct rt.tutor_id), avg(rt.avance) into n_tut_avance, avance_t
      from pg_temp.tutores_semana t
      join public.respuestas_tutor rt on rt.pareja_id = t.pareja_id and rt.semana = w and rt.tutor_id = t.tutor_id;

      -- Desajuste medio: cada combinación de estudiante y tutor que respondió.
      -- Se cuenta sobre el número de estudiantes (parejas) con datos.
      select count(distinct p.pareja_id), avg(abs(re.avance - rt.avance)) into n_ambos, desajuste
      from pg_temp.parejas_semana p
      join public.respuestas_estudiante re on re.pareja_id = p.pareja_id and re.semana = w
      join pg_temp.tutores_semana t on t.pareja_id = p.pareja_id
      join public.respuestas_tutor rt on rt.pareja_id = p.pareja_id and rt.semana = w and rt.tutor_id = t.tutor_id;

      select count(*) filter (where s.elegible), count(a.pareja_id) into n_elegibles, agendas
      from pg_temp.parejas_semana p
      left join public.sorteos s on s.pareja_id = p.pareja_id and s.semana = w
      left join public.agendas a on a.pareja_id = p.pareja_id and a.semana = w;

      semanas := semanas || jsonb_build_object(
        'semana', w,
        'estudiantes', private.cifra(n_est, n_est),
        'tasa_estudiantes', private.cifra(round(n_resp_est::numeric / nullif(n_est, 0), 2), n_est),
        'tasa_tutores', private.cifra(round(n_resp_tut::numeric / nullif(n_tut, 0), 2), n_tut),
        'avance_estudiantes', private.cifra(round(avance_e, 2), n_resp_est),
        'avance_tutores', private.cifra(round(avance_t, 2), n_tut_avance),
        'desajuste_medio', private.cifra(round(desajuste, 2), n_ambos),
        'agendas', private.cifra(agendas, n_elegibles)
      );
    end loop;
  end if;

  return jsonb_build_object(
    'master', m.nombre,
    'minimo', coalesce(private.config('minimo_anonimato')::integer, 5),
    'semanas', semanas
  );
end
$$;

-- ---------------------------------------------------------------------------
-- Exportaciones para la investigación (seudonimizadas)
-- ---------------------------------------------------------------------------

-- Última semana que ha empezado (para no exportar semanas futuras vacías).
create or replace function private.ultima_semana_iniciada(p_estudio_id uuid)
returns integer
language plpgsql stable security definer set search_path = ''
as $$
declare
  c jsonb := private.estado_calendario(p_estudio_id);
begin
  return case c ->> 'estado'
    when 'abierta' then (c ->> 'semana')::integer
    when 'entre' then (c ->> 'semana')::integer
    when 'terminado' then (c ->> 'semanas')::integer
    else 0
  end;
end
$$;

-- Una fila por pareja y semana, en formato largo. Incluye el bienestar: es el
-- único lugar donde el investigador lo recibe, siempre con códigos seudónimos.
-- Cada descarga queda registrada en la auditoría.
create or replace function public.exportar_investigacion()
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  filas jsonb;
  v_clave text;
begin
  perform private.exigir_investigador();
  -- La clave se lee una sola vez para toda la exportación.
  v_clave := private.clave_bienestar();
  select coalesce(jsonb_agg(f order by f ->> 'master', f ->> 'id_pareja', (f ->> 'semana')::integer), '[]'::jsonb) into filas
  from (
    select jsonb_build_object(
      'id_pareja', pa.seudonimo,
      'id_estudiante', pe.seudonimo,
      -- Tutor principal: quien respondió como principal esa semana o, si no
      -- respondió nadie, el tutor principal actual.
      'id_tutor', coalesce((select t.seudonimo from public.perfiles t where t.user_id = rt.tutor_id), pt.seudonimo),
      'master', m.nombre,
      'tipo_trabajo', m.tipo_trabajo,
      'semana', w,
      'est_avance', re.avance,
      'est_siguiente_paso', re.siguiente_paso,
      'est_apoyo', re.apoyo,
      'est_bienestar', case when b.valor_cifrado is null then null else extensions.pgp_sym_decrypt(b.valor_cifrado, v_clave)::integer end,
      'est_respondido_at', re.updated_at,
      'tut_avance', rt.avance,
      'tut_siguiente_paso', rt.siguiente_paso,
      'tut_respondido_at', rt.updated_at,
      'n_cotutores', (select count(*) from public.cotutores c where c.pareja_id = pa.id
                      and c.created_at < coalesce(so.realizado_at, now()) and (c.finalizada_at is null or c.finalizada_at > coalesce(so.realizado_at, now()))),
      'cotutores_respondieron', (select count(*) from public.respuestas_tutor r2 where r2.pareja_id = pa.id and r2.semana = w and not r2.principal),
      'dif_avance', da.diferencia,
      'dif_siguiente_paso', ds.diferencia,
      'relevante_avance', case when da.relevante is null then null when da.relevante then 1 else 0 end,
      'relevante_siguiente_paso', case when ds.relevante is null then null when ds.relevante then 1 else 0 end,
      'motivo_avance', da.motivo,
      'motivo_siguiente_paso', ds.motivo,
      'regla_version', coalesce(da.regla_version, ds.regla_version),
      'sorteo_elegible', case when so.elegible is null then null when so.elegible then 1 else 0 end,
      'sorteo_motivo_no_elegible', so.motivo_no_elegible,
      'sorteo_probabilidad', so.probabilidad,
      'sorteo_valor', so.valor_aleatorio,
      'sorteo_resultado', case when so.resultado is null then null when so.resultado then 1 else 0 end,
      'sorteo_semilla', so.semilla,
      'sorteo_algoritmo', so.algoritmo_version,
      'sorteo_at', so.realizado_at,
      'agenda', case when so.pareja_id is null then null when a.id is not null then 1 else 0 end,
      'agenda_origen', a.origen,
      'agenda_motivo_banco', a.motivo_banco,
      'agenda_version_prompt', a.version_prompt,
      'agenda_modelo', a.modelo,
      'agenda_vista_estudiante', case when a.id is null then null when a.vista_estudiante_at is not null then 1 else 0 end,
      'agenda_vista_tutor', case when a.id is null then null when a.vista_tutor_at is not null then 1 else 0 end,
      'puente_activado', case when ps.activado is null then null when ps.activado then 1 else 0 end,
      'puente_linea', case when ps.pareja_id is null then null when ps.linea is not null then 1 else 0 end,
      'puente_vista_estudiante', case when ps.linea is null then null when ps.vista_estudiante_at is not null then 1 else 0 end,
      'puente_vista_tutor', case when ps.linea is null then null when ps.vista_tutor_at is not null then 1 else 0 end,
      'estudiante_retirado', case when pe.retirado_at is not null then 1 else 0 end
    ) as f
    from public.parejas pa
    join public.masters m on m.id = pa.master_id
    join public.estudios es on es.id = m.estudio_id
    join public.perfiles pe on pe.user_id = pa.estudiante_id
    left join public.perfiles pt on pt.user_id = pa.tutor_id
    cross join lateral generate_series(1, private.ultima_semana_iniciada(es.id)) w
    left join public.respuestas_estudiante re on re.pareja_id = pa.id and re.semana = w
    left join public.bienestar b on b.estudiante_id = pa.estudiante_id and b.semana = w
    left join lateral (
      select r.* from public.respuestas_tutor r
      where r.pareja_id = pa.id and r.semana = w
      order by r.principal desc, r.updated_at desc limit 1
    ) rt on true
    left join public.desajustes da on da.pareja_id = pa.id and da.semana = w and da.item = 'avance' and da.tutor_id = rt.tutor_id
    left join public.desajustes ds on ds.pareja_id = pa.id and ds.semana = w and ds.item = 'siguiente_paso' and ds.tutor_id = rt.tutor_id
    left join public.sorteos so on so.pareja_id = pa.id and so.semana = w
    left join public.agendas a on a.pareja_id = pa.id and a.semana = w
    left join public.puente_semanal ps on ps.pareja_id = pa.id and ps.semana = w
  ) x;

  perform private.auditar('exportacion_investigacion', jsonb_build_object('filas', jsonb_array_length(filas), 'incluye_bienestar', true));
  return filas;
end
$$;

-- Respuestas de TODOS los tutores (principales y cotutores), en formato
-- largo: una fila por pareja, semana y tutor, con su desajuste.
create or replace function public.exportar_tutores()
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  filas jsonb;
begin
  perform private.exigir_investigador();
  select coalesce(jsonb_agg(jsonb_build_object(
    'id_pareja', pa.seudonimo,
    'id_estudiante', pe.seudonimo,
    'id_tutor', t.seudonimo,
    'master', m.nombre,
    'semana', rt.semana,
    'tutor_principal', case when rt.principal then 1 else 0 end,
    'tut_avance', rt.avance,
    'tut_siguiente_paso', rt.siguiente_paso,
    'dif_avance', da.diferencia,
    'dif_siguiente_paso', ds.diferencia,
    'relevante_avance', case when da.relevante is null then null when da.relevante then 1 else 0 end,
    'relevante_siguiente_paso', case when ds.relevante is null then null when ds.relevante then 1 else 0 end,
    'motivo_avance', da.motivo,
    'motivo_siguiente_paso', ds.motivo,
    'regla_version', coalesce(da.regla_version, ds.regla_version),
    'tut_respondido_at', rt.updated_at
  ) order by m.nombre, pa.seudonimo, rt.semana, rt.principal desc, t.seudonimo), '[]'::jsonb) into filas
  from public.respuestas_tutor rt
  join public.parejas pa on pa.id = rt.pareja_id
  join public.perfiles pe on pe.user_id = pa.estudiante_id
  join public.perfiles t on t.user_id = rt.tutor_id
  join public.masters m on m.id = pa.master_id
  left join public.desajustes da on da.pareja_id = rt.pareja_id and da.semana = rt.semana and da.tutor_id = rt.tutor_id and da.item = 'avance'
  left join public.desajustes ds on ds.pareja_id = rt.pareja_id and ds.semana = rt.semana and ds.tutor_id = rt.tutor_id and ds.item = 'siguiente_paso';

  perform private.auditar('exportacion_tutores', jsonb_build_object('filas', jsonb_array_length(filas)));
  return filas;
end
$$;

-- Cambios de tutor principal (con seudónimos), para el análisis.
create or replace function public.exportar_cambios_tutor()
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform private.exigir_investigador();
  perform private.auditar('exportacion_cambios_tutor');
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id_pareja', pa.seudonimo, 'id_tutor_anterior', ta.seudonimo, 'id_tutor_nuevo', tn.seudonimo, 'cambiado_at', c.created_at
    ) order by c.created_at)
    from public.cambios_tutor c
    join public.parejas pa on pa.id = c.pareja_id
    left join public.perfiles ta on ta.user_id = c.tutor_anterior
    left join public.perfiles tn on tn.user_id = c.tutor_nuevo
  ), '[]'::jsonb);
end
$$;

-- Respuestas a los cuestionarios, en formato largo (una fila por persona,
-- cuestionario e ítem). La aplicación las convierte en un archivo por
-- cuestionario con una columna por variable.
create or replace function public.exportar_cuestionarios()
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  filas jsonb;
begin
  perform private.exigir_investigador();
  select coalesce(jsonb_agg(jsonb_build_object(
    'id_estudiante', pe.seudonimo,
    'id_pareja', pa.seudonimo,
    'master', m.nombre,
    'cuestionario', i.cuestionario,
    'variable', i.variable,
    'valor', r.valor,
    'respondido_at', r.updated_at
  ) order by i.cuestionario, pe.seudonimo, i.orden), '[]'::jsonb) into filas
  from public.cuestionario_respuestas r
  join public.cuestionario_items i on i.id = r.item_id
  join public.perfiles pe on pe.user_id = r.user_id
  left join public.parejas pa on pa.estudiante_id = pe.user_id
  left join public.masters m on m.id = pe.master_id;

  perform private.auditar('exportacion_cuestionarios', jsonb_build_object('filas', jsonb_array_length(filas)));
  return filas;
end
$$;

-- Variables de cada cuestionario, en orden (para las columnas del archivo).
create or replace function public.variables_cuestionarios()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_investigador();
  return coalesce((
    select jsonb_object_agg(cuestionario, variables) from (
      select cuestionario, jsonb_agg(variable order by orden) as variables
      from public.cuestionario_items group by cuestionario
    ) x
  ), '{}'::jsonb);
end
$$;

-- Últimos registros de la auditoría (con seudónimos, sin nombres).
create or replace function public.auditoria_reciente(p_limite integer default 100)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_investigador();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'created_at', a.created_at, 'accion', a.accion, 'rol', a.actor_rol,
      'quien', p.seudonimo, 'detalle', a.detalle
    ) order by a.created_at desc)
    from (select * from public.auditoria order by created_at desc limit least(greatest(p_limite, 1), 500)) a
    left join public.perfiles p on p.user_id = a.actor_id
  ), '[]'::jsonb);
end
$$;

revoke all on function
  public.resumen_direccion(), public.exportar_investigacion(), public.exportar_cuestionarios(),
  public.variables_cuestionarios(), public.auditoria_reciente(integer), public.exportar_tutores(), public.exportar_cambios_tutor()
from public, anon, authenticated;
grant execute on function
  public.resumen_direccion(), public.exportar_investigacion(), public.exportar_cuestionarios(),
  public.variables_cuestionarios(), public.auditoria_reciente(integer), public.exportar_tutores(), public.exportar_cambios_tutor()
to authenticated;
