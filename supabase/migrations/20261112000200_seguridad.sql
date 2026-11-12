-- SINTONÍA · Migración 2: permisos (RLS)
--
-- Regla general: cada tabla tiene activada la seguridad por filas (RLS) y
-- nadie puede escribir directamente. Las lecturas permitidas se describen
-- abajo, tabla por tabla. Si una tabla no tiene una política para un perfil,
-- ese perfil no ve ninguna fila.

-- ---------------------------------------------------------------------------
-- Funciones auxiliares: ¿quién está haciendo la consulta?
-- ---------------------------------------------------------------------------

-- Rol de la persona conectada (null si no tiene perfil o se ha retirado).
create or replace function private.rol_actual()
returns public.rol_usuario
language sql stable security definer set search_path = ''
as $$
  select p.rol from public.perfiles p
  where p.user_id = auth.uid() and p.retirado_at is null
$$;

create or replace function private.master_actual()
returns uuid
language sql stable security definer set search_path = ''
as $$
  select p.master_id from public.perfiles p
  where p.user_id = auth.uid() and p.retirado_at is null
$$;

create or replace function private.es_investigador()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(private.rol_actual() = 'investigador', false)
$$;

-- Parejas de las que la persona conectada forma parte (como estudiante o tutor).
create or replace function private.mis_parejas()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select pa.id from public.parejas pa
  join public.perfiles p on p.user_id = auth.uid() and p.retirado_at is null
  where pa.estudiante_id = auth.uid() or pa.tutor_id = auth.uid()
$$;

create or replace function private.parejas_como_estudiante()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select pa.id from public.parejas pa
  join public.perfiles p on p.user_id = pa.estudiante_id and p.retirado_at is null
  where pa.estudiante_id = auth.uid()
$$;

create or replace function private.parejas_como_tutor()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select pa.id from public.parejas pa
  join public.perfiles p on p.user_id = pa.tutor_id and p.retirado_at is null
  where pa.tutor_id = auth.uid()
$$;

-- Registro de auditoría. Solo se llama desde otras funciones.
create or replace function private.auditar(p_accion text, p_detalle jsonb default '{}'::jsonb)
returns void
language sql security definer set search_path = ''
as $$
  insert into public.auditoria (actor_id, actor_rol, accion, detalle)
  values (auth.uid(), private.rol_actual(), p_accion, coalesce(p_detalle, '{}'::jsonb))
$$;

grant usage on schema private to authenticated;
revoke all on all functions in schema private from public, anon;
grant execute on function
  private.rol_actual(), private.master_actual(), private.es_investigador(),
  private.mis_parejas(), private.parejas_como_estudiante(), private.parejas_como_tutor()
  to authenticated;
revoke all on all tables in schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Permisos de tabla: solo lectura, y solo para usuarios identificados.
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from public, anon, authenticated;

grant select on
  public.configuracion, public.estudios, public.masters, public.perfiles,
  public.identidades, public.codigos_acceso, public.parejas,
  public.consentimiento_textos, public.consentimientos, public.items,
  public.respuestas_estudiante, public.respuestas_tutor, public.bienestar,
  public.auditoria
to authenticated;

alter table public.configuracion enable row level security;
alter table public.estudios enable row level security;
alter table public.masters enable row level security;
alter table public.perfiles enable row level security;
alter table public.identidades enable row level security;
alter table public.codigos_acceso enable row level security;
alter table public.parejas enable row level security;
alter table public.consentimiento_textos enable row level security;
alter table public.consentimientos enable row level security;
alter table public.items enable row level security;
alter table public.respuestas_estudiante enable row level security;
alter table public.respuestas_tutor enable row level security;
alter table public.bienestar enable row level security;
alter table public.auditoria enable row level security;

-- ---------------------------------------------------------------------------
-- Políticas de lectura
-- ---------------------------------------------------------------------------

-- Configuración, ítems y texto del consentimiento: cualquier persona con cuenta.
create policy "lectura general" on public.configuracion
  for select to authenticated using (true);
create policy "lectura general" on public.items
  for select to authenticated using (true);
create policy "lectura general" on public.consentimiento_textos
  for select to authenticated using (true);

-- Estudio y máster: el propio; el investigador, todos.
create policy "mi estudio o investigador" on public.estudios
  for select to authenticated
  using (
    private.es_investigador()
    or id = (select m.estudio_id from public.masters m where m.id = private.master_actual())
  );
create policy "mi master o investigador" on public.masters
  for select to authenticated
  using (private.es_investigador() or id = private.master_actual());

-- Perfiles seudónimos: el propio. El investigador ve todos (sin nombres).
create policy "mi perfil o investigador" on public.perfiles
  for select to authenticated
  using (user_id = auth.uid() or private.es_investigador());

-- Identidades: SOLO la propia. Ni el investigador ni la dirección las leen.
-- (El tutor obtiene el nombre de sus estudiantes con la función
-- mis_estudiantes(), que no devuelve correos.)
create policy "solo mi identidad" on public.identidades
  for select to authenticated
  using (user_id = auth.uid());

-- Códigos: el investigador, todos; el tutor, los de sus futuros estudiantes.
create policy "investigador o tutor de los codigos" on public.codigos_acceso
  for select to authenticated
  using (
    private.es_investigador()
    or (rol = 'estudiante' and tutor_id = auth.uid() and private.rol_actual() = 'tutor')
  );

-- Parejas: sus dos miembros y el investigador.
create policy "miembros o investigador" on public.parejas
  for select to authenticated
  using (id in (select private.mis_parejas()) or private.es_investigador());

-- Consentimientos: los propios; el investigador, todos.
create policy "mis consentimientos o investigador" on public.consentimientos
  for select to authenticated
  using (user_id = auth.uid() or private.es_investigador());

-- Respuestas del estudiante: el propio estudiante y el investigador.
-- El tutor y la dirección NO.
create policy "estudiante o investigador" on public.respuestas_estudiante
  for select to authenticated
  using (pareja_id in (select private.parejas_como_estudiante()) or private.es_investigador());

-- Respuestas del tutor: el propio tutor y el investigador.
-- El estudiante y la dirección NO.
create policy "tutor o investigador" on public.respuestas_tutor
  for select to authenticated
  using (pareja_id in (select private.parejas_como_tutor()) or private.es_investigador());

-- Bienestar: SOLO el propio estudiante. Nadie más, ni siquiera el
-- investigador, puede leer esta tabla. El investigador solo lo recibe dentro
-- de la exportación seudonimizada, que queda registrada en la auditoría.
create policy "solo el propio estudiante" on public.bienestar
  for select to authenticated
  using (estudiante_id = auth.uid() and private.rol_actual() = 'estudiante');

-- Auditoría: solo el investigador.
create policy "solo investigador" on public.auditoria
  for select to authenticated
  using (private.es_investigador());
