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
