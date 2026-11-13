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
