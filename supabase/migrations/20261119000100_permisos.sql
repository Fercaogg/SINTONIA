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
