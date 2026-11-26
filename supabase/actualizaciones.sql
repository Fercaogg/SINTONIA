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

-- Copia de supabase/migrations/20261125000100_convocatorias_comprobadas.sql
-- (idempotente) para las instalaciones ya hechas.
-- Puente al doctorado: datos de las convocatorias comprobados en las páginas
-- oficiales el 25/11/2026 (docs/FUENTES-OFICIALES.md, apartado 4).
-- Solo se rellenan organismo, enlace y estado. Las fechas se dejan vacías a
-- propósito: los plazos de 2026 ya han pasado y los de 2027 no se han
-- publicado; el investigador los mete en Investigación > Convocatorias cuando
-- salgan. Solo se sustituye lo que sigue pendiente: si el investigador ya
-- cambió una fila, se respeta. Se puede ejecutar varias veces.

update public.convocatorias set
  organismo = 'Agencia Estatal de Investigación',
  enlace = 'https://www.aei.gob.es/convocatorias/buscador-convocatorias/ayudas-formacion-profesorado-universitario-fpu-2026',
  estado = 'La de 2026 está cerrada (personas participantes: del 20/10/2026 al 12/11/2026; en la USAL, plazo interno hasta el 5/11/2026). [PENDIENTE: fechas de la convocatoria de 2027]',
  actualizado_at = now()
where nombre = 'Ayudas para la Formación de Profesorado Universitario (FPU)'
  and organismo like '[PENDIENTE%' and enlace like '[PENDIENTE%';

update public.convocatorias set
  organismo = 'Universidad de Salamanca (contratos ligados a proyectos de la Agencia Estatal de Investigación)',
  enlace = 'https://convocatoriasinvestigacion.usal.es/contratos-predoctorales-fpi-2026/',
  estado = 'La de 2026 está cerrada (del 26/10/2026 al 17/11/2026, con la ampliación; 15 contratos ligados a proyectos PID 2025). [PENDIENTE: fechas de la convocatoria de 2027]',
  actualizado_at = now()
where nombre = 'Ayudas para contratos predoctorales para la formación de doctores (FPI)'
  and organismo like '[PENDIENTE%' and enlace like '[PENDIENTE%';

update public.convocatorias set
  enlace = 'https://convocatoriasinvestigacion.usal.es/',
  estado = '[PENDIENTE: no se ha encontrado convocatoria de 2026 ni de 2027 (consulta del 25/11/2026)]',
  actualizado_at = now()
where nombre = 'Contratos predoctorales de la Universidad de Salamanca'
  and enlace like '[PENDIENTE%' and estado like '[PENDIENTE%';

update public.convocatorias set
  enlace = 'https://www.educa.jcyl.es/universidad/es/fondos-europeos/fondo-social-europeo-2021-2027-fse/ayudas-financiar-contratacion-predoctoral-personal-investig',
  estado = '[PENDIENTE: el portal de la Junta solo muestra la convocatoria de 2019; no se ha encontrado la de 2026 ni la de 2027 (consulta del 25/11/2026)]',
  actualizado_at = now()
where nombre = 'Contratos predoctorales de la Junta de Castilla y León'
  and enlace like '[PENDIENTE%' and estado like '[PENDIENTE%';

update public.convocatorias set
  enlace = 'https://doctorado.usal.es/es/preinscripcion-matricula',
  estado = 'Curso 2026/27: preinscripción del 1/3/2026 al 7/9/2026 (cerrada). [PENDIENTE: plazos del curso 2027/28]',
  actualizado_at = now()
where nombre = 'Admisión al doctorado'
  and enlace like '[PENDIENTE%' and estado like '[PENDIENTE%';

-- Nueva: ayuda para quien termina un máster oficial en la USAL y empieza
-- allí el doctorado (doctorado.usal.es/es/convocatorias, 25/11/2026).
insert into public.convocatorias (nombre, organismo, enlace, estado)
select
  'Becas Santander: ayuda económica para personal investigador predoctoral (USAL)',
  'Banco Santander y Escuela de Doctorado de la Universidad de Salamanca',
  'https://doctorado.usal.es/es/convocatorias',
  'La de 2026 está cerrada (del 7/5/2026 al 1/10/2026; resolución del 18/11/2026). [PENDIENTE: fechas de la convocatoria de 2027]'
where not exists (
  select 1 from public.convocatorias where nombre = 'Becas Santander: ayuda económica para personal investigador predoctoral (USAL)'
);
