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
  caduca_at timestamptz,
  usado_por uuid references auth.users (id) on delete set null,
  usado_at timestamptz,
  check ((rol = 'estudiante') = (tutor_id is not null))
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

create table public.respuestas_tutor (
  id uuid primary key default gen_random_uuid(),
  pareja_id uuid not null references public.parejas (id) on delete cascade,
  semana smallint not null check (semana between 1 and 52),
  avance smallint not null check (avance between 1 and 5),
  siguiente_paso smallint check (siguiente_paso between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pareja_id, semana)
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
create index on public.codigos_acceso (master_id);
create index on public.auditoria (created_at);
