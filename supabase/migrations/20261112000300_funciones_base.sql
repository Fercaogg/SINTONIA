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
    candidato := private.aleatorio(8);
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

  select * into c from public.codigos_acceso where codigo = v_codigo for update;
  if not found or c.usado_por is not null or (c.caduca_at is not null and c.caduca_at < now()) then
    perform private.error('CODIGO_NO_VALIDO', 'El código no es válido o ya se ha usado.');
  end if;

  if not private.dominio_permitido(new.email) then
    perform private.error('DOMINIO_NO_PERMITIDO', 'Usa tu correo institucional.');
  end if;

  if v_nombre = '' then
    perform private.error('NOMBRE_REQUERIDO', 'Escribe tu nombre.');
  end if;

  if c.rol = 'estudiante' and not exists (
    select 1 from public.perfiles t where t.user_id = c.tutor_id and t.retirado_at is null
  ) then
    perform private.error('CODIGO_NO_VALIDO', 'El código no es válido o ya se ha usado.');
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

  update public.codigos_acceso set usado_por = new.id, usado_at = now() where codigo = c.codigo;

  return new;
end
$$;

create trigger sintonia_alta_usuario
  after insert on auth.users
  for each row execute function private.alta_usuario();

-- ---------------------------------------------------------------------------
-- Funciones públicas: cualquier visitante
-- ---------------------------------------------------------------------------

-- Comprueba un código antes de registrarse, para dar un mensaje claro.
create or replace function public.comprobar_codigo(p_codigo text, p_email text default null)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  c public.codigos_acceso;
  m public.masters;
begin
  select * into c from public.codigos_acceso where codigo = upper(trim(coalesce(p_codigo, '')));
  if not found or c.usado_por is not null or (c.caduca_at is not null and c.caduca_at < now()) then
    return jsonb_build_object('valido', false, 'motivo', 'CODIGO_NO_VALIDO');
  end if;
  if p_email is not null and not private.dominio_permitido(p_email) then
    return jsonb_build_object('valido', false, 'motivo', 'DOMINIO_NO_PERMITIDO');
  end if;
  select * into m from public.masters where id = c.master_id;
  return jsonb_build_object(
    'valido', true,
    'rol', c.rol,
    'master', m.nombre,
    'tipo_trabajo', m.tipo_trabajo
  );
end
$$;

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
    select jsonb_agg(jsonb_build_object('pareja_id', pa.id, 'nombre', i.nombre) order by i.nombre)
    from public.parejas pa
    join public.perfiles pe on pe.user_id = pa.estudiante_id and pe.retirado_at is null
    join public.identidades i on i.user_id = pa.estudiante_id
    where pa.tutor_id = auth.uid() and pa.finalizada_at is null
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
    select jsonb_agg(jsonb_build_object('codigo', codigo, 'caduca_at', caduca_at) order by created_at)
    from public.codigos_acceso
    where tutor_id = auth.uid() and rol = 'estudiante' and usado_por is null
      and (caduca_at is null or caduca_at > now())
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
  p_etiqueta text default null
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
    insert into public.codigos_acceso (codigo, rol, master_id, tutor_id, etiqueta, creado_por)
    values (
      v_codigo, p_rol, p_master_id,
      case when p_rol = 'estudiante' then p_tutor_id end,
      nullif(trim(coalesce(p_etiqueta, '')), ''),
      auth.uid()
    );
    codigos := codigos || v_codigo;
  end loop;
  perform private.auditar('codigos_creados', jsonb_build_object('master_id', p_master_id, 'rol', p_rol, 'cantidad', p_cantidad));
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
      'usado', c.usado_por is not null,
      'usado_at', c.usado_at,
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
      'etiqueta', (select c.etiqueta from public.codigos_acceso c where c.usado_por = p.user_id limit 1),
      'estudiantes', (select count(*) from public.parejas pa where pa.tutor_id = p.user_id)
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
  public.listar_tutores(uuid)
to authenticated;

revoke all on all functions in schema private from public, anon;
grant execute on function
  private.rol_actual(), private.master_actual(), private.es_investigador(),
  private.mis_parejas(), private.parejas_como_estudiante(), private.parejas_como_tutor()
to authenticated;
