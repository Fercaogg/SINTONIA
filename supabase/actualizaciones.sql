-- ACTUALIZACIONES PARA INSTALACIONES YA HECHAS: api/instalar las aplica en cada llamada.
-- Todo debe poder ejecutarse varias veces sin efecto (idempotente).

-- Enlace oficial del servicio de atención psicológica de la USAL (gratuito
-- para la comunidad universitaria), comprobado el 15/11/2026 en
-- https://asuntossociales.usal.es/atencion-psicologica/
-- Solo sustituye el texto provisional: si alguien ya puso otro enlace, se respeta.
update public.configuracion
set valor = 'https://asuntossociales.usal.es/atencion-psicologica/', pendiente = false
where clave = 'url_servicio_psicologico' and valor like '[PENDIENTE%';
