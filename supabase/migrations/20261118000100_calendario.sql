-- SINTONÍA · Migración 12: calendario compartido
--
-- Cada persona puede anotar fechas (tutorías, entregas, congresos...).
-- Tres alcances:
--   * privado: solo lo ve quien lo anota.
--   * pareja:  lo ven el estudiante y sus tutores (principal y cotutores).
--   * master:  lo publica la dirección del máster o el equipo de
--              investigación y lo ve todo el máster.
-- El calendario NO es un dato de investigación: no se exporta, y ni la
-- dirección ni el investigador ven las anotaciones de las parejas
-- (decisión de Fernando, 13/11/2026; ver DECISIONES.md).

create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references auth.users (id) on delete cascade,
  ambito text not null check (ambito in ('privado', 'pareja', 'master')),
  pareja_id uuid references public.parejas (id) on delete cascade,
  master_id uuid references public.masters (id) on delete cascade,
  tipo text not null check (tipo in ('tutoria', 'entrega', 'congreso', 'evento', 'plazo', 'otro')),
  titulo text not null check (length(trim(titulo)) between 1 and 120),
  descripcion text check (length(descripcion) <= 1000),
  lugar text check (length(lugar) <= 200),
  fecha date not null,
  fecha_fin date,
  hora_inicio time,
  hora_fin time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((ambito = 'pareja') = (pareja_id is not null)),
  check (ambito <> 'master' or master_id is not null),
  check (fecha_fin is null or fecha_fin >= fecha),
  check (hora_fin is null or hora_inicio is not null),
  check (hora_fin is null or fecha_fin is not null or hora_fin >= hora_inicio)
);

create index eventos_fecha on public.eventos (fecha);
create index eventos_pareja on public.eventos (pareja_id) where pareja_id is not null;
create index eventos_master on public.eventos (master_id) where ambito = 'master';

-- ¿Puede la persona conectada ver esta anotación?
create or replace function private.puede_ver_evento(p_ambito text, p_autor_id uuid, p_pareja_id uuid, p_master_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select case
    when private.rol_actual() is null then false
    when p_autor_id = auth.uid() then true
    when p_ambito = 'pareja' then exists (
      select 1 from public.parejas pa
      join public.perfiles pe on pe.user_id = pa.estudiante_id and pe.retirado_at is null
      where pa.id = p_pareja_id and pa.finalizada_at is null
        and (pa.estudiante_id = auth.uid() or private.es_tutor_de(pa.id, auth.uid())))
    when p_ambito = 'master' then private.es_investigador() or private.master_actual() = p_master_id
    else false
  end
$$;

alter table public.eventos enable row level security;
grant select on public.eventos to authenticated;
create policy eventos_lectura on public.eventos for select to authenticated
  using (private.puede_ver_evento(ambito, autor_id, pareja_id, master_id));

-- Comprobación común: perfil activo y, si participa en el estudio, con consentimiento.
create or replace function private.exigir_calendario()
returns public.rol_usuario
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_rol public.rol_usuario := private.rol_actual();
begin
  if v_rol is null then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  if v_rol in ('estudiante', 'tutor') and not private.consentimiento_ok() then
    perform private.error('SIN_CONSENTIMIENTO', 'Antes tienes que aceptar el consentimiento informado.');
  end if;
  return v_rol;
end
$$;

-- Calendario de la persona conectada entre dos fechas (incluidas).
create or replace function public.mi_calendario(p_desde date, p_hasta date)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_rol public.rol_usuario := private.exigir_calendario();
  v_tesis boolean;
begin
  if p_desde is null or p_hasta is null or p_hasta < p_desde or p_hasta - p_desde > 400 then
    perform private.error('FECHAS_NO_VALIDAS', 'Revisa las fechas.');
  end if;
  select coalesce(m.tipo_trabajo = 'TESIS', false) into v_tesis
  from public.masters m where m.id = private.master_actual();

  return jsonb_build_object(
    'eventos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id, 'tipo', e.tipo, 'titulo', e.titulo, 'descripcion', e.descripcion, 'lugar', e.lugar,
        'fecha', e.fecha, 'fecha_fin', e.fecha_fin, 'hora_inicio', to_char(e.hora_inicio, 'HH24:MI'),
        'hora_fin', to_char(e.hora_fin, 'HH24:MI'), 'ambito', e.ambito, 'pareja_id', e.pareja_id,
        'master_id', e.master_id,
        'mio', e.autor_id = auth.uid(),
        -- Para el tutor: con qué estudiante es la anotación de pareja.
        'con', case when e.ambito = 'pareja' and v_rol = 'tutor' then
          (select i.nombre from public.parejas pa join public.identidades i on i.user_id = pa.estudiante_id where pa.id = e.pareja_id) end,
        -- Quién la anotó, si no es la persona conectada.
        'autor', case
          when e.autor_id = auth.uid() then null
          when e.ambito = 'master' then
            case (select p.rol from public.perfiles p where p.user_id = e.autor_id)
              when 'direccion' then 'Dirección del máster' else 'Equipo de investigación' end
          else (select i.nombre from public.identidades i where i.user_id = e.autor_id) end,
        'editable', e.autor_id = auth.uid()
          or (e.ambito = 'master' and (v_rol = 'investigador' or (v_rol = 'direccion' and e.master_id = private.master_actual())))
      ) order by e.fecha, e.hora_inicio nulls first, e.titulo)
      from public.eventos e
      where e.fecha <= p_hasta and coalesce(e.fecha_fin, e.fecha) >= p_desde
        and private.puede_ver_evento(e.ambito, e.autor_id, e.pareja_id, e.master_id)
    ), '[]'::jsonb),
    -- Plazos de las convocatorias de Puente al doctorado (solo lectura).
    'convocatorias', coalesce((
      select jsonb_agg(x order by x->>'fecha') from (
        select jsonb_build_object('id', 'conv-a-' || c.id, 'fecha', c.fecha_apertura, 'titulo', 'Abre: ' || c.nombre,
                                  'enlace', c.enlace, 'organismo', c.organismo) as x
        from public.convocatorias c where c.activa and c.fecha_apertura between p_desde and p_hasta
        union all
        select jsonb_build_object('id', 'conv-c-' || c.id, 'fecha', c.fecha_cierre, 'titulo', 'Cierra: ' || c.nombre,
                                  'enlace', c.enlace, 'organismo', c.organismo)
        from public.convocatorias c where c.activa and c.fecha_cierre between p_desde and p_hasta
      ) s
    ), '[]'::jsonb),
    -- Opciones para el formulario.
    'opciones', jsonb_build_object(
      'rol', v_rol,
      'tesis', coalesce(v_tesis, false),
      'parejas', case v_rol
        when 'tutor' then coalesce((
          select jsonb_agg(jsonb_build_object('pareja_id', pa.id, 'nombre', i.nombre) order by i.nombre)
          from public.parejas pa
          join public.perfiles pe on pe.user_id = pa.estudiante_id and pe.retirado_at is null
          join public.identidades i on i.user_id = pa.estudiante_id
          where pa.id in (select private.parejas_como_tutor()) and pa.finalizada_at is null), '[]'::jsonb)
        when 'estudiante' then coalesce((
          select jsonb_agg(jsonb_build_object('pareja_id', pa.id, 'nombre', null))
          from public.parejas pa where pa.estudiante_id = auth.uid() and pa.finalizada_at is null), '[]'::jsonb)
        else '[]'::jsonb end,
      'masters', case v_rol
        when 'investigador' then coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'nombre', m.nombre) order by m.nombre)
                                           from public.masters m), '[]'::jsonb)
        when 'direccion' then coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'nombre', m.nombre))
                                        from public.masters m where m.id = private.master_actual()), '[]'::jsonb)
        else '[]'::jsonb end
    )
  );
end
$$;

-- Crea o modifica una anotación. p_evento: {id?, tipo, titulo, descripcion,
-- lugar, fecha, fecha_fin, hora_inicio, hora_fin, ambito, pareja_id, master_id}.
create or replace function public.guardar_evento(p_evento jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_rol public.rol_usuario := private.exigir_calendario();
  v_id uuid := nullif(p_evento->>'id', '')::uuid;
  v_ambito text := coalesce(nullif(p_evento->>'ambito', ''), 'privado');
  v_pareja uuid := nullif(p_evento->>'pareja_id', '')::uuid;
  v_master uuid := nullif(p_evento->>'master_id', '')::uuid;
  v_tipo text := p_evento->>'tipo';
  v_titulo text := trim(coalesce(p_evento->>'titulo', ''));
  v_descripcion text := nullif(trim(coalesce(p_evento->>'descripcion', '')), '');
  v_lugar text := nullif(trim(coalesce(p_evento->>'lugar', '')), '');
  v_fecha date;
  v_fecha_fin date;
  v_hora_inicio time;
  v_hora_fin time;
  v_actual public.eventos;
begin
  if v_tipo is null or v_tipo not in ('tutoria', 'entrega', 'congreso', 'evento', 'plazo', 'otro') then
    perform private.error('TIPO_NO_VALIDO', 'Elige un tipo de anotación.');
  end if;
  if length(v_titulo) = 0 then
    perform private.error('TITULO_VACIO', 'Escribe un título.');
  end if;
  if length(v_titulo) > 120 then
    perform private.error('TITULO_LARGO', 'El título puede tener como mucho 120 caracteres.');
  end if;
  if length(coalesce(v_descripcion, '')) > 1000 then
    perform private.error('NOTA_LARGA', 'La nota puede tener como mucho 1000 caracteres.');
  end if;
  if length(coalesce(v_lugar, '')) > 200 then
    perform private.error('LUGAR_LARGO', 'El lugar puede tener como mucho 200 caracteres.');
  end if;
  begin
    v_fecha := (p_evento->>'fecha')::date;
    v_fecha_fin := nullif(p_evento->>'fecha_fin', '')::date;
    v_hora_inicio := nullif(p_evento->>'hora_inicio', '')::time;
    v_hora_fin := nullif(p_evento->>'hora_fin', '')::time;
  exception when others then
    perform private.error('FECHAS_NO_VALIDAS', 'Revisa la fecha y la hora.');
  end;
  if v_fecha is null then
    perform private.error('FECHAS_NO_VALIDAS', 'Elige una fecha.');
  end if;
  if v_fecha_fin = v_fecha then v_fecha_fin := null; end if;
  if v_fecha_fin is not null and v_fecha_fin < v_fecha then
    perform private.error('FECHAS_NO_VALIDAS', 'La fecha de fin no puede ser anterior a la de inicio.');
  end if;
  if v_hora_fin is not null and v_hora_inicio is null then
    perform private.error('FECHAS_NO_VALIDAS', 'Indica también la hora de inicio.');
  end if;
  if v_hora_fin is not null and v_fecha_fin is null and v_hora_fin < v_hora_inicio then
    perform private.error('FECHAS_NO_VALIDAS', 'La hora de fin no puede ser anterior a la de inicio.');
  end if;

  -- ¿Quién puede anotar con cada alcance?
  if v_ambito = 'privado' then
    v_pareja := null;
    v_master := private.master_actual();
  elsif v_ambito = 'pareja' then
    if v_rol = 'estudiante' then
      select id into v_pareja from public.parejas where estudiante_id = auth.uid() and finalizada_at is null;
    elsif v_rol = 'tutor' then
      if v_pareja is null or v_pareja not in (select private.parejas_como_tutor()) then
        perform private.error('PAREJA_NO_VALIDA', 'Elige con qué estudiante es.');
      end if;
    else
      perform private.error('SIN_PERMISO', 'Solo los estudiantes y sus tutores pueden compartir anotaciones de pareja.');
    end if;
    if v_pareja is null then
      perform private.error('PAREJA_NO_VALIDA', 'No tienes una pareja de tutoría activa.');
    end if;
    select master_id into v_master from public.parejas where id = v_pareja;
  elsif v_ambito = 'master' then
    if v_rol = 'direccion' then
      v_master := private.master_actual();
    elsif v_rol = 'investigador' then
      if v_master is null or not exists (select 1 from public.masters where id = v_master) then
        perform private.error('MASTER_NO_VALIDO', 'Elige un máster.');
      end if;
    else
      perform private.error('SIN_PERMISO', 'Solo la dirección del máster y el equipo de investigación publican eventos para todo el máster.');
    end if;
    v_pareja := null;
  else
    perform private.error('AMBITO_NO_VALIDO', 'Elige quién puede verlo.');
  end if;

  if v_id is null then
    insert into public.eventos (autor_id, ambito, pareja_id, master_id, tipo, titulo, descripcion, lugar,
                                fecha, fecha_fin, hora_inicio, hora_fin)
    values (auth.uid(), v_ambito, v_pareja, v_master, v_tipo, v_titulo, v_descripcion, v_lugar,
            v_fecha, v_fecha_fin, v_hora_inicio, v_hora_fin)
    returning id into v_id;
  else
    select * into v_actual from public.eventos where id = v_id;
    if not found or not private.puede_editar_evento(v_actual) then
      perform private.error('SIN_PERMISO', 'Solo puedes cambiar lo que has anotado tú.');
    end if;
    if v_actual.autor_id <> auth.uid() and v_ambito <> v_actual.ambito then
      perform private.error('SIN_PERMISO', 'Solo quien lo publicó puede cambiar quién lo ve.');
    end if;
    update public.eventos set
      ambito = v_ambito, pareja_id = v_pareja,
      master_id = v_master,
      tipo = v_tipo, titulo = v_titulo, descripcion = v_descripcion, lugar = v_lugar,
      fecha = v_fecha, fecha_fin = v_fecha_fin, hora_inicio = v_hora_inicio, hora_fin = v_hora_fin,
      updated_at = now()
    where id = v_id;
  end if;
  if v_ambito = 'master' then
    perform private.auditar('guardar_evento_master', jsonb_build_object('evento_id', v_id, 'master_id', v_master));
  end if;
  return jsonb_build_object('id', v_id);
end
$$;

-- Quien la anotó; y, en los eventos del máster, también la dirección de ese
-- máster y el equipo de investigación (para poder corregirlos entre todos).
create or replace function private.puede_editar_evento(e public.eventos)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select e.autor_id = auth.uid()
      or (e.ambito = 'master' and (private.es_investigador()
          or (private.rol_actual() = 'direccion' and private.master_actual() = e.master_id)))
$$;

create or replace function public.borrar_evento(p_id uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_actual public.eventos;
begin
  perform private.exigir_calendario();
  select * into v_actual from public.eventos where id = p_id;
  if not found or not private.puede_editar_evento(v_actual) then
    perform private.error('SIN_PERMISO', 'Solo puedes borrar lo que has anotado tú.');
  end if;
  delete from public.eventos where id = p_id;
  if v_actual.ambito = 'master' then
    perform private.auditar('borrar_evento_master', jsonb_build_object('evento_id', p_id, 'master_id', v_actual.master_id));
  end if;
  return jsonb_build_object('borrado', true);
end
$$;

revoke all on function public.mi_calendario(date, date), public.guardar_evento(jsonb), public.borrar_evento(uuid)
  from public, anon;
grant execute on function public.mi_calendario(date, date), public.guardar_evento(jsonb), public.borrar_evento(uuid)
  to authenticated;
revoke all on function private.puede_ver_evento(text, uuid, uuid, uuid), private.exigir_calendario(),
  private.puede_editar_evento(public.eventos) from public, anon;
grant execute on function private.puede_ver_evento(text, uuid, uuid, uuid) to authenticated;
