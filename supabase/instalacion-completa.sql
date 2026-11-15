-- SINTONÍA · Instalación completa de la base de datos.
-- Generado con "npm run sql:unir" a partir de supabase/migrations. No lo edites a mano.
-- Pégalo entero en Supabase > SQL Editor > New query y pulsa "Run" UNA sola vez,
-- en un proyecto nuevo.

-- ===========================================================================
-- 20261112000100_tablas.sql
-- ===========================================================================

-- SINTONÍA · Migración 1: tablas
--
-- Principio rector: acompañar sin vigilar. Por eso:
--   * Los nombres y correos (identidades) están en una tabla separada de las
--     respuestas. Las respuestas solo llevan códigos seudónimos.
--   * El bienestar del estudiante tiene su propia tabla y se guarda cifrado.
--   * Nadie escribe directamente en las tablas: todos los cambios pasan por
--     funciones que comprueban las reglas (migración 3).

create extension if not exists pgcrypto with schema extensions;

-- Esquema privado: no se publica en la API de Supabase.
create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type public.rol_usuario as enum ('estudiante', 'tutor', 'direccion', 'investigador');
create type public.tipo_trabajo as enum ('TFG', 'TFM', 'TESIS');

-- ---------------------------------------------------------------------------
-- Configuración general (valores no sensibles, editables por el investigador)
-- ---------------------------------------------------------------------------

create table public.configuracion (
  clave text primary key,
  valor text not null,
  descripcion text,
  pendiente boolean not null default false,
  actualizado_at timestamptz not null default now()
);

-- Valores que solo ve el servidor (por ejemplo, el modo de la instalación).
create table private.ajustes (
  clave text primary key,
  valor text not null
);

-- Correos autorizados a darse de alta como investigador (sin código).
create table private.investigadores_autorizados (
  email text primary key
);

-- ---------------------------------------------------------------------------
-- Estudio, másteres y calendario
-- ---------------------------------------------------------------------------

create table public.estudios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  -- Día en que abre la semana 1 (fecha local de Europe/Madrid).
  fecha_inicio date,
  semanas smallint not null default 10 check (semanas between 1 and 52),
  -- Días de la semana ISO: 1 = lunes ... 7 = domingo.
  dia_apertura smallint not null default 1 check (dia_apertura between 1 and 7),
  dia_cierre smallint not null default 7 check (dia_cierre between 1 and 7),
  zona_horaria text not null default 'Europe/Madrid',
  probabilidad_agenda numeric(3, 2) not null default 0.50
    check (probabilidad_agenda >= 0 and probabilidad_agenda <= 1),
  created_at timestamptz not null default now()
);

create table public.masters (
  id uuid primary key default gen_random_uuid(),
  estudio_id uuid not null references public.estudios (id),
  nombre text not null,
  tipo_trabajo public.tipo_trabajo not null default 'TFM',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Personas
-- ---------------------------------------------------------------------------

-- Perfil seudónimo: rol, máster y código. Sin nombre ni correo.
create table public.perfiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  rol public.rol_usuario not null,
  master_id uuid references public.masters (id),
  seudonimo text not null unique,
  recordatorios boolean not null default true,
  retirado_at timestamptz,
  created_at timestamptz not null default now(),
  check ((rol = 'investigador') or (master_id is not null))
);

-- Identidad: nombre y correo. Separada de todo lo demás.
create table public.identidades (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null check (length(trim(nombre)) between 1 and 120),
  email text not null,
  actualizado_at timestamptz not null default now()
);

-- Códigos de acceso. Uno de estudiante equivale a un "código de pareja":
-- ya va asociado a su tutor.
create table public.codigos_acceso (
  codigo text primary key,
  rol public.rol_usuario not null check (rol <> 'investigador'),
  master_id uuid not null references public.masters (id) on delete cascade,
  tutor_id uuid references public.perfiles (user_id) on delete cascade,
  -- Nota interna del investigador (por ejemplo, "Tutor 3"). Nunca un nombre real.
  etiqueta text,
  creado_por uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  -- Caducidad, usos máximos y anulación (AUDITORIA.md, A5).
  caduca_at timestamptz,
  usos_max integer not null default 1 check (usos_max between 1 and 500),
  usos integer not null default 0 check (usos >= 0),
  revocado_at timestamptz,
  check ((rol = 'estudiante') = (tutor_id is not null))
);

-- Cada uso de un código: quién se registró con él y cuándo.
create table public.codigos_usos (
  codigo text not null references public.codigos_acceso (codigo) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  usado_at timestamptz not null default now(),
  primary key (codigo, user_id)
);

create table public.parejas (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references public.masters (id),
  estudiante_id uuid not null unique references public.perfiles (user_id) on delete cascade,
  tutor_id uuid not null references public.perfiles (user_id) on delete cascade,
  seudonimo text not null unique,
  created_at timestamptz not null default now(),
  finalizada_at timestamptz
);

-- Cotutores: además del tutor principal (parejas.tutor_id), hasta dos más.
-- El Reglamento de TFM de la USAL permite un segundo tutor y, de forma
-- excepcional, un tercero (art. 4.3 y 4.7).
create table public.cotutores (
  pareja_id uuid not null references public.parejas (id) on delete cascade,
  tutor_id uuid not null references public.perfiles (user_id) on delete cascade,
  created_at timestamptz not null default now(),
  finalizada_at timestamptz,
  primary key (pareja_id, tutor_id)
);

-- Historial de cambios de tutor principal (Reglamento de TFM, art. 4.9).
create table public.cambios_tutor (
  id bigint generated always as identity primary key,
  pareja_id uuid not null references public.parejas (id) on delete cascade,
  tutor_anterior uuid references public.perfiles (user_id) on delete set null,
  tutor_nuevo uuid references public.perfiles (user_id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Consentimiento informado (versionado)
-- ---------------------------------------------------------------------------

create table public.consentimiento_textos (
  version integer primary key,
  texto text not null,
  vigente boolean not null default false,
  publicado_at timestamptz not null default now()
);
create unique index consentimiento_un_vigente on public.consentimiento_textos (vigente) where vigente;

create table public.consentimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  version integer not null references public.consentimiento_textos (version),
  aceptado_at timestamptz not null default now(),
  retirado_at timestamptz,
  unique (user_id, version)
);

-- ---------------------------------------------------------------------------
-- Ítems del check-in (textos configurables)
-- ---------------------------------------------------------------------------

-- La "clave" fija a qué dato corresponde cada ítem. El texto, las palabras de
-- los extremos y el orden se pueden cambiar sin tocar el código.
create table public.items (
  clave text not null,
  rol public.rol_usuario not null check (rol in ('estudiante', 'tutor')),
  texto text not null,
  ancla_min text not null default 'Nada',
  ancla_max text not null default 'Mucho',
  orden smallint not null,
  privado boolean not null default false,
  obligatorio boolean not null default true,
  provisional boolean not null default true,
  activo boolean not null default true,
  primary key (rol, clave)
);

-- ---------------------------------------------------------------------------
-- Respuestas semanales
-- ---------------------------------------------------------------------------

-- Solo códigos seudónimos: la pareja, nunca el nombre.
create table public.respuestas_estudiante (
  id uuid primary key default gen_random_uuid(),
  pareja_id uuid not null references public.parejas (id) on delete cascade,
  semana smallint not null check (semana between 1 and 52),
  avance smallint not null check (avance between 1 and 5),
  siguiente_paso smallint not null check (siguiente_paso between 1 and 5),
  apoyo smallint not null check (apoyo between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pareja_id, semana)
);

-- Cada tutor (principal o cotutor) responde por separado.
create table public.respuestas_tutor (
  id uuid primary key default gen_random_uuid(),
  pareja_id uuid not null references public.parejas (id) on delete cascade,
  tutor_id uuid not null references public.perfiles (user_id) on delete cascade,
  -- ¿Era el tutor principal cuando respondió?
  principal boolean not null default true,
  semana smallint not null check (semana between 1 and 52),
  avance smallint not null check (avance between 1 and 5),
  siguiente_paso smallint check (siguiente_paso between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pareja_id, semana, tutor_id)
);

-- Bienestar: dato posiblemente de categoría especial (RGPD, art. 9).
-- Tabla propia, valor cifrado y lectura solo por su autor.
create table public.bienestar (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references public.perfiles (user_id) on delete cascade,
  semana smallint not null check (semana between 1 and 52),
  valor_cifrado bytea not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (estudiante_id, semana)
);

-- ---------------------------------------------------------------------------
-- Auditoría de accesos a datos sensibles y descargas
-- ---------------------------------------------------------------------------

create table public.auditoria (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_rol public.rol_usuario,
  accion text not null,
  detalle jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index on public.respuestas_estudiante (semana);
create index on public.respuestas_tutor (semana);
create index on public.parejas (tutor_id);
create index on public.cotutores (tutor_id);
create index on public.respuestas_tutor (tutor_id);
create index on public.codigos_acceso (master_id);
create index on public.auditoria (created_at);

-- ===========================================================================
-- 20261112000200_seguridad.sql
-- ===========================================================================

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
     or exists (select 1 from public.cotutores c where c.pareja_id = pa.id and c.tutor_id = auth.uid() and c.finalizada_at is null)
$$;

create or replace function private.parejas_como_estudiante()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select pa.id from public.parejas pa
  join public.perfiles p on p.user_id = pa.estudiante_id and p.retirado_at is null
  where pa.estudiante_id = auth.uid()
$$;

-- Parejas en las que la persona conectada es tutor principal o cotutor.
create or replace function private.parejas_como_tutor()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select pa.id from public.parejas pa
  join public.perfiles p on p.user_id = auth.uid() and p.retirado_at is null
  where pa.tutor_id = auth.uid()
     or exists (select 1 from public.cotutores c where c.pareja_id = pa.id and c.tutor_id = auth.uid() and c.finalizada_at is null)
$$;

-- ¿Es esta persona tutor (principal o cotutor activo) de la pareja?
create or replace function private.es_tutor_de(p_pareja_id uuid, p_user_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.parejas pa where pa.id = p_pareja_id and pa.tutor_id = p_user_id)
      or exists (select 1 from public.cotutores c where c.pareja_id = p_pareja_id and c.tutor_id = p_user_id and c.finalizada_at is null)
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
-- es_tutor_de se usa solo dentro de otras funciones.
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
  public.auditoria, public.cotutores, public.cambios_tutor
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
alter table public.cotutores enable row level security;
alter table public.cambios_tutor enable row level security;

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

-- Respuestas del tutor: cada tutor, solo las suyas (un cotutor no ve las
-- del otro); y el investigador. El estudiante y la dirección NO.
create policy "tutor o investigador" on public.respuestas_tutor
  for select to authenticated
  using ((tutor_id = auth.uid() and private.rol_actual() = 'tutor') or private.es_investigador());

-- Cotutorías: el propio tutor y el investigador. Historial de cambios: el investigador.
create policy "propias o investigador" on public.cotutores
  for select to authenticated
  using (tutor_id = auth.uid() or private.es_investigador());
create policy "solo investigador" on public.cambios_tutor
  for select to authenticated
  using (private.es_investigador());

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

-- ===========================================================================
-- 20261112000300_funciones_base.sql
-- ===========================================================================

-- SINTONÍA · Migración 3: funciones de alta, perfiles y gestión
--
-- La aplicación habla con la base de datos SOLO a través de funciones como
-- estas. Cada una comprueba quién llama antes de hacer nada. Todas devuelven
-- JSON. Los mensajes de error van en español porque se muestran tal cual.

-- ---------------------------------------------------------------------------
-- Utilidades privadas
-- ---------------------------------------------------------------------------

-- Lanza un error con un mensaje para la persona y un código para el programa.
create or replace function private.error(p_codigo text, p_mensaje text)
returns void
language plpgsql
as $$
begin
  raise exception using errcode = 'P0001', message = p_mensaje, hint = p_codigo;
end
$$;

-- Cadena aleatoria sin caracteres que se confundan (sin 0, O, 1, I).
create or replace function private.aleatorio(p_longitud integer)
returns text
language plpgsql volatile set search_path = ''
as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea := extensions.gen_random_bytes(p_longitud);
  resultado text := '';
begin
  for i in 0 .. p_longitud - 1 loop
    resultado := resultado || substr(alfabeto, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return resultado;
end
$$;

create or replace function private.nuevo_seudonimo(p_prefijo text)
returns text
language plpgsql volatile set search_path = ''
as $$
declare
  candidato text;
begin
  loop
    candidato := p_prefijo || '-' || private.aleatorio(6);
    exit when not exists (select 1 from public.perfiles where seudonimo = candidato)
          and not exists (select 1 from public.parejas where seudonimo = candidato);
  end loop;
  return candidato;
end
$$;

create or replace function private.nuevo_codigo()
returns text
language plpgsql volatile set search_path = ''
as $$
declare
  candidato text;
begin
  loop
    candidato := private.aleatorio(12);
    exit when not exists (select 1 from public.codigos_acceso where codigo = candidato);
  end loop;
  return candidato;
end
$$;

create or replace function private.config(p_clave text)
returns text
language sql stable security definer set search_path = ''
as $$
  select valor from public.configuracion where clave = p_clave
$$;

-- ¿Está permitido el dominio de este correo? (configuracion.dominios_permitidos,
-- lista separada por comas; "*" admite cualquiera).
create or replace function private.dominio_permitido(p_email text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select bool_or(d = '*' or lower(split_part(p_email, '@', 2)) = d)
     from unnest(string_to_array(replace(lower(coalesce(private.config('dominios_permitidos'), '')), ' ', ''), ',')) d
     where d <> ''),
    false
  )
$$;

-- ---------------------------------------------------------------------------
-- Cifrado del bienestar
-- ---------------------------------------------------------------------------

-- La clave vive en el almacén de secretos de Supabase (Vault), no en el código.
create or replace function private.clave_bienestar()
returns text
language plpgsql stable security definer set search_path = ''
as $$
declare
  clave text;
begin
  select decrypted_secret into clave from vault.decrypted_secrets where name = 'clave_bienestar';
  if clave is null then
    perform private.error('SIN_CLAVE', 'Falta configurar la clave de cifrado del bienestar.');
  end if;
  return clave;
end
$$;

-- AES-256. La clave es aleatoria (256 bits), así que no hace falta el
-- estiramiento de contraseña de OpenPGP (s2k-mode=1: con sal, sin iteraciones),
-- que haría muy lenta la exportación.
create or replace function private.cifrar_bienestar(p_valor integer)
returns bytea
language sql volatile security definer set search_path = ''
as $$
  select extensions.pgp_sym_encrypt(p_valor::text, private.clave_bienestar(), 'cipher-algo=aes256, s2k-mode=1')
$$;

create or replace function private.descifrar_bienestar(p_cifrado bytea)
returns integer
language sql stable security definer set search_path = ''
as $$
  select extensions.pgp_sym_decrypt(p_cifrado, private.clave_bienestar())::integer
$$;

-- Crea la clave la primera vez (aleatoria, generada dentro de la base de datos).
do $$
begin
  if not exists (select 1 from vault.decrypted_secrets where name = 'clave_bienestar') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'clave_bienestar');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Alta de usuarios: se ejecuta cuando Supabase crea una cuenta nueva
-- ---------------------------------------------------------------------------

-- ¿Se puede usar este código ahora? (sin caducar, sin anular y con usos libres)
create or replace function private.codigo_disponible(c public.codigos_acceso)
returns boolean
language sql stable set search_path = ''
as $$
  select c.revocado_at is null and c.usos < c.usos_max and (c.caduca_at is null or c.caduca_at > now())
$$;

create or replace function private.alta_usuario()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_codigo text := upper(trim(coalesce(new.raw_user_meta_data ->> 'codigo', '')));
  v_nombre text := trim(coalesce(new.raw_user_meta_data ->> 'nombre', ''));
  c public.codigos_acceso;
  v_prefijo text;
begin
  -- Investigadores: autorizados de antemano por correo, sin código.
  if exists (select 1 from private.investigadores_autorizados a where lower(a.email) = lower(new.email)) then
    insert into public.perfiles (user_id, rol, seudonimo)
    values (new.id, 'investigador', private.nuevo_seudonimo('I'));
    insert into public.identidades (user_id, nombre, email)
    values (new.id, coalesce(nullif(v_nombre, ''), split_part(new.email, '@', 1)), new.email);
    return new;
  end if;

  if v_codigo = '' then
    perform private.error('CODIGO_REQUERIDO', 'Para registrarte necesitas un código de acceso.');
  end if;

  -- Un único mensaje para código y correo: no revela si un código existe.
  select * into c from public.codigos_acceso where codigo = v_codigo for update;
  if not found or not private.codigo_disponible(c) or not private.dominio_permitido(new.email) then
    perform private.error('REGISTRO_NO_VALIDO', 'No hemos podido completar el registro. Revisa el código y usa tu correo institucional.');
  end if;

  -- Solo se crean cuentas que haya autorizado antes el servidor de SINTONÍA
  -- (que limita los intentos). Así nadie puede probar códigos llamando
  -- directamente al servicio de acceso de Supabase.
  if not private.consumir_autorizacion_registro(new.email, v_codigo) then
    perform private.error('REGISTRO_NO_VALIDO', 'No hemos podido completar el registro. Revisa el código y usa tu correo institucional.');
  end if;

  if v_nombre = '' then
    perform private.error('NOMBRE_REQUERIDO', 'Escribe tu nombre.');
  end if;

  if c.rol = 'estudiante' and not exists (
    select 1 from public.perfiles t where t.user_id = c.tutor_id and t.retirado_at is null
  ) then
    perform private.error('REGISTRO_NO_VALIDO', 'No hemos podido completar el registro. Revisa el código y usa tu correo institucional.');
  end if;

  v_prefijo := case c.rol when 'estudiante' then 'E' when 'tutor' then 'T' else 'D' end;

  insert into public.perfiles (user_id, rol, master_id, seudonimo)
  values (new.id, c.rol, c.master_id, private.nuevo_seudonimo(v_prefijo));

  insert into public.identidades (user_id, nombre, email)
  values (new.id, v_nombre, new.email);

  if c.rol = 'estudiante' then
    insert into public.parejas (master_id, estudiante_id, tutor_id, seudonimo)
    values (c.master_id, new.id, c.tutor_id, private.nuevo_seudonimo('P'));
  end if;

  update public.codigos_acceso set usos = usos + 1 where codigo = c.codigo;
  insert into public.codigos_usos (codigo, user_id) values (c.codigo, new.id);

  return new;
end
$$;

create trigger sintonia_alta_usuario
  after insert on auth.users
  for each row execute function private.alta_usuario();

-- Si una respuesta de tutor se guarda sin indicar quién responde (por ejemplo,
-- en los datos de prueba), se asigna al tutor principal de la pareja.
create or replace function private.completar_respuesta_tutor()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.tutor_id is null then
    select tutor_id into new.tutor_id from public.parejas where id = new.pareja_id;
    new.principal := true;
  end if;
  return new;
end
$$;

create trigger sintonia_completar_respuesta_tutor
  before insert on public.respuestas_tutor
  for each row execute function private.completar_respuesta_tutor();

-- ---------------------------------------------------------------------------
-- Funciones públicas: cualquier visitante
-- ---------------------------------------------------------------------------

-- El código se comprueba en el servidor (servicio_autorizar_registro, en la
-- migración de registro seguro), con límite de intentos.

-- Valores de configuración que la interfaz necesita (no sensibles).
create or replace function public.configuracion_publica()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_object_agg(clave, jsonb_build_object('valor', valor, 'pendiente', pendiente)), '{}'::jsonb)
  from public.configuracion
$$;

-- ---------------------------------------------------------------------------
-- Funciones para cualquier persona con cuenta
-- ---------------------------------------------------------------------------

create or replace function public.mi_perfil()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  p public.perfiles;
  i public.identidades;
  m public.masters;
  v_vigente integer;
begin
  select * into p from public.perfiles where user_id = auth.uid();
  if not found then
    return null;
  end if;
  select * into i from public.identidades where user_id = p.user_id;
  select * into m from public.masters where id = p.master_id;
  select version into v_vigente from public.consentimiento_textos where vigente;

  return jsonb_build_object(
    'rol', p.rol,
    'seudonimo', p.seudonimo,
    'nombre', i.nombre,
    'email', i.email,
    'recordatorios', p.recordatorios,
    'retirado', p.retirado_at is not null,
    'master', case when m.id is null then null else
      jsonb_build_object('id', m.id, 'nombre', m.nombre, 'tipo_trabajo', m.tipo_trabajo) end,
    'consentimiento', jsonb_build_object(
      'version_vigente', v_vigente,
      'aceptado', exists (
        select 1 from public.consentimientos c
        where c.user_id = p.user_id and c.version = v_vigente and c.retirado_at is null
      )
    )
  );
end
$$;

create or replace function public.consentimiento_vigente()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object('version', version, 'texto', texto, 'publicado_at', publicado_at)
  from public.consentimiento_textos where vigente
$$;

create or replace function public.aceptar_consentimiento(p_version integer)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  if private.rol_actual() is null then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  if not exists (select 1 from public.consentimiento_textos where version = p_version and vigente) then
    perform private.error('VERSION_NO_VIGENTE', 'Esta versión del consentimiento ya no está vigente. Recarga la página.');
  end if;
  insert into public.consentimientos (user_id, version)
  values (auth.uid(), p_version)
  on conflict (user_id, version) do update set aceptado_at = now(), retirado_at = null;
  perform private.auditar('consentimiento_aceptado', jsonb_build_object('version', p_version));
  return jsonb_build_object('ok', true);
end
$$;

-- Derecho de rectificación: cambiar el propio nombre.
create or replace function public.actualizar_mi_nombre(p_nombre text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  if private.rol_actual() is null then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  if length(trim(coalesce(p_nombre, ''))) not between 1 and 120 then
    perform private.error('NOMBRE_NO_VALIDO', 'Escribe un nombre de entre 1 y 120 caracteres.');
  end if;
  update public.identidades set nombre = trim(p_nombre), actualizado_at = now() where user_id = auth.uid();
  return jsonb_build_object('ok', true);
end
$$;

-- ---------------------------------------------------------------------------
-- Funciones del tutor
-- ---------------------------------------------------------------------------

-- Sus estudiantes: el nombre (para poder responder) y el código de la pareja.
-- Nunca devuelve correos ni respuestas.
create or replace function public.mis_estudiantes()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  if private.rol_actual() is distinct from 'tutor' then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('pareja_id', pa.id, 'nombre', i.nombre, 'cotutor', pa.tutor_id is distinct from auth.uid())
                     order by i.nombre)
    from public.parejas pa
    join public.perfiles pe on pe.user_id = pa.estudiante_id and pe.retirado_at is null
    join public.identidades i on i.user_id = pa.estudiante_id
    where pa.id in (select private.parejas_como_tutor()) and pa.finalizada_at is null
  ), '[]'::jsonb);
end
$$;

-- Códigos de pareja todavía sin usar, para dárselos a sus estudiantes.
create or replace function public.mis_codigos_pareja()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  if private.rol_actual() is distinct from 'tutor' then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('codigo', c.codigo, 'caduca_at', c.caduca_at,
                                        'usos', c.usos, 'usos_max', c.usos_max) order by c.created_at)
    from public.codigos_acceso c
    where c.tutor_id = auth.uid() and c.rol = 'estudiante' and private.codigo_disponible(c)
  ), '[]'::jsonb);
end
$$;

-- ---------------------------------------------------------------------------
-- Funciones del investigador
-- ---------------------------------------------------------------------------

create or replace function private.exigir_investigador()
returns void
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.es_investigador() then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
end
$$;

create or replace function public.listar_masters()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_investigador();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', m.id,
      'nombre', m.nombre,
      'tipo_trabajo', m.tipo_trabajo,
      'estudio_id', m.estudio_id,
      'tutores', (select count(*) from public.perfiles p where p.master_id = m.id and p.rol = 'tutor' and p.retirado_at is null),
      'estudiantes', (select count(*) from public.perfiles p where p.master_id = m.id and p.rol = 'estudiante' and p.retirado_at is null),
      'direccion', (select count(*) from public.perfiles p where p.master_id = m.id and p.rol = 'direccion' and p.retirado_at is null)
    ) order by m.created_at)
    from public.masters m
  ), '[]'::jsonb);
end
$$;

create or replace function public.crear_master(p_nombre text, p_tipo_trabajo public.tipo_trabajo default 'TFM')
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_estudio uuid;
  v_id uuid;
begin
  perform private.exigir_investigador();
  if length(trim(coalesce(p_nombre, ''))) = 0 then
    perform private.error('NOMBRE_NO_VALIDO', 'Escribe el nombre del máster.');
  end if;
  select id into v_estudio from public.estudios order by created_at limit 1;
  insert into public.masters (estudio_id, nombre, tipo_trabajo)
  values (v_estudio, trim(p_nombre), p_tipo_trabajo)
  returning id into v_id;
  perform private.auditar('master_creado', jsonb_build_object('master_id', v_id));
  return jsonb_build_object('id', v_id);
end
$$;

-- Genera códigos de acceso. Para estudiantes hace falta indicar el tutor.
create or replace function public.crear_codigos(
  p_master_id uuid,
  p_rol public.rol_usuario,
  p_cantidad integer default 1,
  p_tutor_id uuid default null,
  p_etiqueta text default null,
  -- Caducan por defecto a los 30 días y sirven para una sola persona.
  p_dias_validez integer default 30,
  p_usos_max integer default 1
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  codigos text[] := '{}';
  v_codigo text;
begin
  perform private.exigir_investigador();
  if p_rol = 'investigador' then
    perform private.error('ROL_NO_VALIDO', 'No se pueden crear códigos de investigador.');
  end if;
  if p_cantidad not between 1 and 100 then
    perform private.error('CANTIDAD_NO_VALIDA', 'Puedes crear entre 1 y 100 códigos a la vez.');
  end if;
  if p_dias_validez is null or p_dias_validez not between 1 and 365 then
    perform private.error('VALIDEZ_NO_VALIDA', 'La validez debe estar entre 1 y 365 días.');
  end if;
  if p_usos_max is null or p_usos_max not between 1 and 500 then
    perform private.error('USOS_NO_VALIDOS', 'Cada código puede servir para entre 1 y 500 personas.');
  end if;
  if not exists (select 1 from public.masters where id = p_master_id) then
    perform private.error('MASTER_NO_VALIDO', 'Ese máster no existe.');
  end if;
  if p_rol = 'estudiante' and not exists (
    select 1 from public.perfiles
    where user_id = p_tutor_id and rol = 'tutor' and master_id = p_master_id and retirado_at is null
  ) then
    perform private.error('TUTOR_NO_VALIDO', 'Elige un tutor de este máster.');
  end if;
  for i in 1 .. p_cantidad loop
    v_codigo := private.nuevo_codigo();
    insert into public.codigos_acceso (codigo, rol, master_id, tutor_id, etiqueta, creado_por, caduca_at, usos_max)
    values (
      v_codigo, p_rol, p_master_id,
      case when p_rol = 'estudiante' then p_tutor_id end,
      nullif(trim(coalesce(p_etiqueta, '')), ''),
      auth.uid(),
      now() + make_interval(days => p_dias_validez),
      p_usos_max
    );
    codigos := codigos || v_codigo;
  end loop;
  perform private.auditar('codigos_creados', jsonb_build_object('master_id', p_master_id, 'rol', p_rol, 'cantidad', p_cantidad,
                                                                'dias_validez', p_dias_validez, 'usos_max', p_usos_max));
  return to_jsonb(codigos);
end
$$;

create or replace function public.listar_codigos(p_master_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_investigador();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'codigo', c.codigo,
      'rol', c.rol,
      'etiqueta', c.etiqueta,
      'tutor', t.seudonimo,
      'usado', c.usos >= c.usos_max,
      'usos', c.usos,
      'usos_max', c.usos_max,
      'caduca_at', c.caduca_at,
      'caducado', c.caduca_at is not null and c.caduca_at <= now(),
      'revocado', c.revocado_at is not null,
      'disponible', private.codigo_disponible(c),
      'usado_at', (select max(u.usado_at) from public.codigos_usos u where u.codigo = c.codigo),
      'created_at', c.created_at
    ) order by c.created_at desc)
    from public.codigos_acceso c
    left join public.perfiles t on t.user_id = c.tutor_id
    where c.master_id = p_master_id
  ), '[]'::jsonb);
end
$$;

-- Tutores de un máster, por su seudónimo y la etiqueta del código con que se
-- registraron (el investigador no ve nombres).
create or replace function public.listar_tutores(p_master_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_investigador();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'user_id', p.user_id,
      'seudonimo', p.seudonimo,
      'etiqueta', (select c.etiqueta from public.codigos_usos u join public.codigos_acceso c on c.codigo = u.codigo where u.user_id = p.user_id limit 1),
      'estudiantes', (select count(*) from public.parejas pa where pa.tutor_id = p.user_id),
      'cotutorias', (select count(*) from public.cotutores c where c.tutor_id = p.user_id and c.finalizada_at is null)
    ) order by p.created_at)
    from public.perfiles p
    where p.master_id = p_master_id and p.rol = 'tutor' and p.retirado_at is null
  ), '[]'::jsonb);
end
$$;

-- ---------------------------------------------------------------------------
-- Permisos de ejecución
-- ---------------------------------------------------------------------------

revoke all on all functions in schema public from public, anon, authenticated;

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
  public.crear_codigos(uuid, public.rol_usuario, integer, uuid, text, integer, integer),
  public.listar_codigos(uuid),
  public.listar_tutores(uuid)
to authenticated;

revoke all on all functions in schema private from public, anon;
grant execute on function
  private.rol_actual(), private.master_actual(), private.es_investigador(),
  private.mis_parejas(), private.parejas_como_estudiante(), private.parejas_como_tutor()
to authenticated;

-- ===========================================================================
-- 20261112000400_datos_iniciales.sql
-- ===========================================================================

-- SINTONÍA · Migración 4: datos iniciales
--
-- Solo estructura y textos provisionales. Todo lo que no está confirmado
-- lleva la marca [PENDIENTE] y aparece en PENDIENTES.md.

insert into public.configuracion (clave, valor, descripcion, pendiente) values
  ('dominios_permitidos', 'usal.es', 'Dominios de correo admitidos en el registro, separados por comas.', true),
  ('url_servicio_psicologico', '[PENDIENTE: URL oficial del servicio de atención psicológica de la USAL]', 'Enlace que se muestra si el bienestar es 1 o 2.', true),
  ('texto_politica_privacidad', '[PENDIENTE: revisión del Comité de Ética de la USAL]', 'Política de privacidad.', true),
  ('responsable_tratamiento', '[PENDIENTE: responsable del tratamiento y datos de contacto]', 'Responsable del tratamiento (RGPD).', true)
on conflict (clave) do nothing;

insert into public.estudios (nombre, fecha_inicio, semanas, dia_apertura, dia_cierre)
select 'Piloto SINTONÍA 2027', null, 10, 1, 7
where not exists (select 1 from public.estudios);

insert into public.consentimiento_textos (version, texto, vigente)
values (1, '[PENDIENTE: revisión del Comité de Ética de la USAL]', true)
on conflict (version) do nothing;

-- Ítems del check-in. Textos provisionales (provisional = true).
insert into public.items (rol, clave, texto, ancla_min, ancla_max, orden, privado, obligatorio, provisional) values
  ('estudiante', 'avance',         '¿Cuánto has avanzado en tu trabajo esta semana?', 'Nada', 'Mucho', 1, false, true, true),
  ('estudiante', 'siguiente_paso', '¿Tienes claro tu siguiente paso?',                'Nada claro', 'Muy claro', 2, false, true, true),
  ('estudiante', 'apoyo',          '¿Te sientes apoyado/a por tu tutor/a?',          'Nada', 'Mucho', 3, false, true, true),
  ('estudiante', 'bienestar',      '¿Cómo estás tú esta semana?',                     'Mal', 'Muy bien', 4, true, true, true),
  ('tutor',      'avance',         '¿Cuánto ha avanzado esta semana?',                'Nada', 'Mucho', 1, false, true, true),
  ('tutor',      'siguiente_paso', '¿Tiene claro su siguiente paso?',                 'Nada claro', 'Muy claro', 2, false, false, true)
on conflict (rol, clave) do nothing;

-- ===========================================================================
-- 20261113000100_checkins.sql
-- ===========================================================================

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
        'cotutor', pa.tutor_id is distinct from auth.uid(),
        'avance', rt.avance, 'siguiente_paso', rt.siguiente_paso
      ) order by i.nombre)
      from public.parejas pa
      join public.perfiles pe on pe.user_id = pa.estudiante_id and pe.retirado_at is null
      join public.identidades i on i.user_id = pa.estudiante_id
      -- Solo las respuestas propias (un cotutor no ve las del otro).
      left join public.respuestas_tutor rt on rt.pareja_id = pa.id and rt.semana = v_semana and rt.tutor_id = auth.uid()
      where pa.id in (select private.parejas_como_tutor()) and pa.finalizada_at is null
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
      where pa.id = v_pareja and private.es_tutor_de(pa.id, auth.uid()) and pa.finalizada_at is null
    ) then
      perform private.error('PAREJA_NO_VALIDA', 'Uno de los estudiantes no está en tu lista. Recarga la página.');
    end if;
    perform private.validar_escala((fila ->> 'avance')::integer);
    perform private.validar_escala((fila ->> 'siguiente_paso')::integer, false);

    insert into public.respuestas_tutor (pareja_id, tutor_id, principal, semana, avance, siguiente_paso)
    values (v_pareja, auth.uid(), exists (select 1 from public.parejas where id = v_pareja and tutor_id = auth.uid()),
            v_semana, (fila ->> 'avance')::integer, (fila ->> 'siguiente_paso')::integer)
    on conflict (pareja_id, semana, tutor_id) do update
      set avance = excluded.avance, siguiente_paso = excluded.siguiente_paso, principal = excluded.principal, updated_at = now();
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
      join public.parejas pa on pa.id = rt.pareja_id
      where rt.tutor_id = p.user_id
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
  -- Si es un tutor, se borran sus respuestas y sus cotutorías; las parejas de
  -- las que era tutor principal quedan sin tutor principal.
  delete from public.respuestas_tutor where tutor_id = v_uid;
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
  public.crear_codigos(uuid, public.rol_usuario, integer, uuid, text, integer, integer),
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

-- ===========================================================================
-- 20261114000100_agenda.sql
-- ===========================================================================

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

-- ===========================================================================
-- 20261115000100_puente_cuestionarios.sql
-- ===========================================================================

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

-- ===========================================================================
-- 20261116000100_direccion_exportacion.sql
-- ===========================================================================

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

-- ===========================================================================
-- 20261117000100_modo_demo.sql
-- ===========================================================================

-- SINTONÍA · Migración 9: modo de la instalación (real o demostración)
--
-- Una instalación de demostración se marca en private.ajustes (modo = demo)
-- al generar sus datos ficticios. La aplicación lo consulta al arrancar: si la
-- base de datos es de demostración, siempre muestra el aviso "Demostración",
-- aunque alguien la haya configurado mal. Y si la aplicación se configuró en
-- modo demostración pero la base de datos es real, no ofrece los accesos rápidos.

create or replace function public.modo_instalacion()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object('modo', coalesce((select valor from private.ajustes where clave = 'modo'), 'real'))
$$;

revoke all on function public.modo_instalacion() from public;
grant execute on function public.modo_instalacion() to anon, authenticated;

-- Vaciar una base de datos de demostración para volver a generarla.
-- Solo funciona si está marcada como demostración: nunca en una real.
create or replace function private.vaciar_demo()
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if coalesce((select valor from private.ajustes where clave = 'modo'), 'real') <> 'demo' then
    raise exception 'Esta base de datos no está marcada como demostración: no se vacía.';
  end if;
  delete from public.auditoria;
  delete from public.correos_enviados;
  delete from public.cierres_semana;
  delete from public.convocatorias where nombre like '%(ficticia)%';
  delete from public.codigos_acceso;
  delete from auth.users;            -- borra en cascada perfiles, parejas y respuestas
  delete from public.masters;
  delete from private.investigadores_autorizados;
end
$$;

revoke all on function private.vaciar_demo() from public, anon, authenticated, service_role;

-- ===========================================================================
-- 20261117000200_borrados_pendientes.sql
-- ===========================================================================

-- SINTONÍA · Migración 10: terminar los borrados de cuenta pendientes
--
-- Cuando una persona pide borrar sus datos, la base de datos borra todo y
-- después intenta borrar su cuenta de acceso. Si Supabase no lo permite desde
-- la base de datos, la cuenta queda en private.borrados_pendientes y el
-- servidor la borra en la tarea diaria con la herramienta oficial de Supabase.

create or replace function public.servicio_borrados_pendientes()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_servidor();
  return coalesce((select jsonb_agg(user_id) from private.borrados_pendientes), '[]'::jsonb);
end
$$;

create or replace function public.servicio_borrado_completado(p_user_id uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.exigir_servidor();
  delete from private.borrados_pendientes where user_id = p_user_id;
  return jsonb_build_object('ok', true);
end
$$;

revoke all on function public.servicio_borrados_pendientes(), public.servicio_borrado_completado(uuid) from public, anon, authenticated;
grant execute on function public.servicio_borrados_pendientes(), public.servicio_borrado_completado(uuid) to service_role;

-- ===========================================================================
-- 20261117000300_gestion_tutores.sql
-- ===========================================================================

-- SINTONÍA · Migración 11: gestión de tutores de cada pareja
--
-- Normativa de la USAL (ver NORMATIVA.md):
--   * Cotutoría: un segundo tutor y, excepcionalmente, un tercero
--     (Reglamento de TFM, art. 4.3 y 4.7; Reglamento de TFG, art. 4.3).
--   * Cambio de tutor a petición motivada del estudiante
--     (Reglamento de TFM, art. 4.9; Reglamento de TFG, art. 7.3).
-- Las decisiones las toma la comisión correspondiente; en SINTONÍA las
-- refleja el investigador. Todo queda en la auditoría y las respuestas
-- anteriores se conservan.

create or replace function private.exigir_tutor_del_master(p_tutor_id uuid, p_master_id uuid)
returns void
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.perfiles
    where user_id = p_tutor_id and rol = 'tutor' and master_id = p_master_id and retirado_at is null
  ) then
    perform private.error('TUTOR_NO_VALIDO', 'Elige un tutor/a de este máster.');
  end if;
end
$$;

-- Parejas de un máster con su tutor principal y sus cotutores (seudónimos y
-- etiquetas; el investigador no ve nombres).
create or replace function public.listar_parejas(p_master_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.exigir_investigador();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'pareja_id', pa.id,
      'pareja', pa.seudonimo,
      'estudiante', pe.seudonimo,
      'estudiante_retirado', pe.retirado_at is not null,
      'tutor', case when t.user_id is null then null else jsonb_build_object(
        'user_id', t.user_id, 'seudonimo', t.seudonimo,
        'etiqueta', (select c.etiqueta from public.codigos_usos u join public.codigos_acceso c on c.codigo = u.codigo where u.user_id = t.user_id limit 1)) end,
      'cotutores', coalesce((
        select jsonb_agg(jsonb_build_object(
          'user_id', ct.user_id, 'seudonimo', ct.seudonimo,
          'etiqueta', (select c.etiqueta from public.codigos_usos u join public.codigos_acceso c on c.codigo = u.codigo where u.user_id = ct.user_id limit 1)
        ) order by co.created_at)
        from public.cotutores co join public.perfiles ct on ct.user_id = co.tutor_id
        where co.pareja_id = pa.id and co.finalizada_at is null
      ), '[]'::jsonb),
      'cambios', (select count(*) from public.cambios_tutor ch where ch.pareja_id = pa.id)
    ) order by pa.created_at)
    from public.parejas pa
    join public.perfiles pe on pe.user_id = pa.estudiante_id
    left join public.perfiles t on t.user_id = pa.tutor_id
    where pa.master_id = p_master_id and pa.finalizada_at is null
  ), '[]'::jsonb);
end
$$;

-- Cambia el tutor principal. Si el nuevo era cotutor de la pareja, deja de
-- serlo. Las respuestas del tutor anterior se conservan (con su código).
create or replace function public.cambiar_tutor(p_pareja_id uuid, p_tutor_id uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  pa public.parejas;
begin
  perform private.exigir_investigador();
  select * into pa from public.parejas where id = p_pareja_id;
  if not found then
    perform private.error('PAREJA_NO_VALIDA', 'Esa pareja no existe.');
  end if;
  perform private.exigir_tutor_del_master(p_tutor_id, pa.master_id);
  if pa.tutor_id = p_tutor_id then
    perform private.error('SIN_CAMBIOS', 'Ese tutor/a ya es el tutor principal de la pareja.');
  end if;
  update public.cotutores set finalizada_at = now()
  where pareja_id = p_pareja_id and tutor_id = p_tutor_id and finalizada_at is null;
  update public.parejas set tutor_id = p_tutor_id where id = p_pareja_id;
  insert into public.cambios_tutor (pareja_id, tutor_anterior, tutor_nuevo) values (p_pareja_id, pa.tutor_id, p_tutor_id);
  perform private.auditar('tutor_cambiado', jsonb_build_object('pareja_id', p_pareja_id));
  return jsonb_build_object('ok', true);
end
$$;

-- Añade un cotutor (como máximo dos activos además del principal).
create or replace function public.asignar_cotutor(p_pareja_id uuid, p_tutor_id uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  pa public.parejas;
begin
  perform private.exigir_investigador();
  select * into pa from public.parejas where id = p_pareja_id;
  if not found then
    perform private.error('PAREJA_NO_VALIDA', 'Esa pareja no existe.');
  end if;
  perform private.exigir_tutor_del_master(p_tutor_id, pa.master_id);
  if pa.tutor_id = p_tutor_id then
    perform private.error('YA_ES_TUTOR', 'Ese tutor/a ya es el tutor principal de la pareja.');
  end if;
  if exists (select 1 from public.cotutores where pareja_id = p_pareja_id and tutor_id = p_tutor_id and finalizada_at is null) then
    perform private.error('YA_ES_TUTOR', 'Ese tutor/a ya es cotutor de la pareja.');
  end if;
  if (select count(*) from public.cotutores where pareja_id = p_pareja_id and finalizada_at is null) >= 2 then
    perform private.error('DEMASIADOS_COTUTORES', 'Una pareja puede tener como máximo dos cotutores, además del tutor principal.');
  end if;
  insert into public.cotutores (pareja_id, tutor_id) values (p_pareja_id, p_tutor_id)
  on conflict (pareja_id, tutor_id) do update set created_at = now(), finalizada_at = null;
  perform private.auditar('cotutor_asignado', jsonb_build_object('pareja_id', p_pareja_id));
  return jsonb_build_object('ok', true);
end
$$;

create or replace function public.quitar_cotutor(p_pareja_id uuid, p_tutor_id uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.exigir_investigador();
  update public.cotutores set finalizada_at = now()
  where pareja_id = p_pareja_id and tutor_id = p_tutor_id and finalizada_at is null;
  if not found then
    perform private.error('NO_ES_COTUTOR', 'Ese tutor/a no es cotutor de la pareja.');
  end if;
  perform private.auditar('cotutor_quitado', jsonb_build_object('pareja_id', p_pareja_id));
  return jsonb_build_object('ok', true);
end
$$;

revoke all on function
  public.listar_parejas(uuid), public.cambiar_tutor(uuid, uuid), public.asignar_cotutor(uuid, uuid), public.quitar_cotutor(uuid, uuid)
from public, anon, authenticated;
grant execute on function
  public.listar_parejas(uuid), public.cambiar_tutor(uuid, uuid), public.asignar_cotutor(uuid, uuid), public.quitar_cotutor(uuid, uuid)
to authenticated;

-- ===========================================================================
-- 20261118000100_calendario.sql
-- ===========================================================================

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

-- ===========================================================================
-- 20261119000100_permisos.sql
-- ===========================================================================

-- SINTONÍA · Migración 13: permisos cerrados en todas partes
--
-- AUDITORIA.md, M1 y M2:
--   * RLS activada también en las tablas internas (esquema private). Ya eran
--     inaccesibles (el esquema no se expone y no tienen permisos), pero así
--     ninguna tabla queda sin RLS.
--   * Las funciones internas solo las puede ejecutar quien las necesita: las
--     que usan las reglas de lectura (RLS), para los usuarios identificados.
--     El resto solo se usan dentro de otras funciones.
--   * A partir de aquí, ninguna función nueva queda abierta por defecto: cada
--     una debe concederse de forma explícita.

alter table private.ajustes enable row level security;
alter table private.borrados_pendientes enable row level security;
alter table private.investigadores_autorizados enable row level security;

revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function
  private.rol_actual(),
  private.master_actual(),
  private.es_investigador(),
  private.mis_parejas(),
  private.parejas_como_estudiante(),
  private.parejas_como_tutor(),
  private.puede_ver_evento(text, uuid, uuid, uuid)
  to authenticated;

alter default privileges in schema private revoke execute on functions from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- ===========================================================================
-- 20261119000200_registro_seguro.sql
-- ===========================================================================

-- SINTONÍA · Migración 14: registro y acceso seguros (AUDITORIA.md, A5, A6 y M6)
--
--   * Los códigos tienen 12 caracteres, caducan (30 días por defecto), tienen
--     un número máximo de usos y se pueden anular.
--   * Registro, acceso y contacto pasan por funciones del servidor de
--     SINTONÍA (carpeta api/), que limitan los intentos por IP y por correo.
--   * La base de datos solo crea una cuenta si el servidor la ha autorizado
--     justo antes: nadie puede probar códigos llamando directamente al
--     servicio de acceso de Supabase.
--   * Los mensajes de error no revelan si un código o un correo existen.

-- ---------------------------------------------------------------------------
-- Usos de los códigos
-- ---------------------------------------------------------------------------

alter table public.codigos_usos enable row level security;
grant select on public.codigos_usos to authenticated;
create policy "investigador ve los usos" on public.codigos_usos for select to authenticated
  using (private.es_investigador());

-- Anular un código que todavía no se ha agotado (investigador, o el tutor
-- con sus propios códigos de pareja).
create or replace function public.revocar_codigo(p_codigo text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  c public.codigos_acceso;
begin
  select * into c from public.codigos_acceso where codigo = upper(trim(coalesce(p_codigo, '')));
  if not found or not (private.es_investigador() or (private.rol_actual() = 'tutor' and c.tutor_id = auth.uid())) then
    perform private.error('SIN_PERMISO', 'No tienes permiso para hacer esto.');
  end if;
  if c.revocado_at is null then
    update public.codigos_acceso set revocado_at = now() where codigo = c.codigo;
    perform private.auditar('codigo_revocado', jsonb_build_object('master_id', c.master_id, 'rol', c.rol));
  end if;
  return jsonb_build_object('revocado', true);
end
$$;

-- ---------------------------------------------------------------------------
-- Límite de intentos
-- ---------------------------------------------------------------------------

-- Solo se guarda una huella (no la IP ni el correo) y se borra en 24 horas.
create table private.intentos (
  id bigserial primary key,
  tipo text not null,
  huella text not null,
  creado_at timestamptz not null default now()
);
create index intentos_busqueda on private.intentos (tipo, huella, creado_at);
alter table private.intentos enable row level security;

insert into private.ajustes (clave, valor)
values ('sal_intentos', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (clave) do nothing;

-- Anota un intento para cada clave (IP, correo...) y dice si se puede seguir:
-- false si alguna clave ya ha llegado al límite en la ventana de tiempo.
create or replace function public.servicio_limitar(p_tipo text, p_claves jsonb, p_limite integer, p_minutos integer)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_sal text := (select valor from private.ajustes where clave = 'sal_intentos');
  v_huellas text[];
  v_superado boolean;
begin
  perform private.exigir_servidor();
  if p_tipo is null or p_limite < 1 or p_minutos < 1 then
    perform private.error('PARAMETROS_NO_VALIDOS', 'Parámetros no válidos.');
  end if;
  delete from private.intentos where creado_at < now() - interval '24 hours';
  select array_agg(encode(extensions.digest(v_sal || ':' || lower(trim(k)), 'sha256'), 'hex'))
  into v_huellas
  from jsonb_array_elements_text(coalesce(p_claves, '[]'::jsonb)) k where coalesce(trim(k), '') <> '';
  if v_huellas is null then
    return true;
  end if;
  select exists (
    select 1 from private.intentos
    where tipo = p_tipo and huella = any (v_huellas) and creado_at > now() - make_interval(mins => p_minutos)
    group by huella having count(*) >= p_limite
  ) into v_superado;
  insert into private.intentos (tipo, huella) select p_tipo, h from unnest(v_huellas) h;
  return not v_superado;
end
$$;

-- ---------------------------------------------------------------------------
-- Registro autorizado por el servidor
-- ---------------------------------------------------------------------------

create table private.registros_autorizados (
  email text primary key,
  codigo text not null,
  expira_at timestamptz not null
);
alter table private.registros_autorizados enable row level security;

-- El servidor comprueba el código y el correo. Si son válidos, autoriza crear
-- la cuenta durante 15 minutos. La respuesta no dice qué ha fallado.
create or replace function public.servicio_autorizar_registro(p_codigo text, p_email text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  c public.codigos_acceso;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_codigo text := upper(regexp_replace(coalesce(p_codigo, ''), '[\s-]', '', 'g'));
begin
  perform private.exigir_servidor();
  delete from private.registros_autorizados where expira_at < now();
  select * into c from public.codigos_acceso where codigo = v_codigo;
  if not found or not private.codigo_disponible(c) or not private.dominio_permitido(v_email) then
    return jsonb_build_object('ok', false);
  end if;
  insert into private.registros_autorizados (email, codigo, expira_at)
  values (v_email, v_codigo, now() + interval '15 minutes')
  on conflict (email) do update set codigo = excluded.codigo, expira_at = excluded.expira_at;
  return jsonb_build_object('ok', true, 'codigo', v_codigo);
end
$$;

-- La usa la creación de cuentas: comprueba y gasta la autorización.
create or replace function private.consumir_autorizacion_registro(p_email text, p_codigo text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  delete from private.registros_autorizados
  where email = lower(trim(p_email)) and codigo = p_codigo and expira_at > now();
  return found;
end
$$;

revoke all on function public.revocar_codigo(text), public.servicio_limitar(text, jsonb, integer, integer),
  public.servicio_autorizar_registro(text, text), private.consumir_autorizacion_registro(text, text)
  from public, anon, authenticated;
grant execute on function public.revocar_codigo(text) to authenticated;
grant execute on function public.servicio_limitar(text, jsonb, integer, integer), public.servicio_autorizar_registro(text, text)
  to service_role;

-- ===========================================================================
-- 20261120000100_servicio_psicologico.sql
-- ===========================================================================

-- Enlace oficial del servicio de atención psicológica de la USAL (gratuito
-- para la comunidad universitaria), comprobado el 15/11/2026 en
-- https://asuntossociales.usal.es/atencion-psicologica/
-- Solo sustituye el texto provisional: si alguien ya puso otro enlace, se respeta.
update public.configuracion
set valor = 'https://asuntossociales.usal.es/atencion-psicologica/', pendiente = false
where clave = 'url_servicio_psicologico' and valor like '[PENDIENTE%';
