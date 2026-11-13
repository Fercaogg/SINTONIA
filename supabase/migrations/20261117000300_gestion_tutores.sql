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
