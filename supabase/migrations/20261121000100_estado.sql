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
