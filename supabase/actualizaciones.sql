-- ACTUALIZACIONES PARA INSTALACIONES YA HECHAS: api/instalar las aplica en cada llamada.
-- Todo debe poder ejecutarse varias veces sin efecto (idempotente).

-- Enlace oficial del servicio de atención psicológica de la USAL (gratuito
-- para la comunidad universitaria), comprobado el 15/11/2026 en
-- https://asuntossociales.usal.es/atencion-psicologica/
-- Solo sustituye el texto provisional: si alguien ya puso otro enlace, se respeta.
update public.configuracion
set valor = 'https://asuntossociales.usal.es/atencion-psicologica/', pendiente = false
where clave = 'url_servicio_psicologico' and valor like '[PENDIENTE%';

-- Comprobación de salud para la página /estado (api/estado): una lectura
-- mínima que demuestra que la base de datos responde. No devuelve datos.
-- Solo la puede llamar el servidor (service_role).
create or replace function public.servicio_estado()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.configuracion limit 1);
$$;

revoke all on function public.servicio_estado() from public, anon, authenticated;
grant execute on function public.servicio_estado() to service_role;
