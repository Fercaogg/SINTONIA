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
