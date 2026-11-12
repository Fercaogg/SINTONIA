-- SINTONÍA · Migración 4: datos iniciales
--
-- Solo estructura y textos provisionales. Todo lo que no está confirmado
-- lleva la marca [PENDIENTE] y aparece en PENDIENTES.md.

insert into public.configuracion (clave, valor, descripcion, pendiente) values
  ('dominios_permitidos', 'usal.es', 'Dominios de correo admitidos en el registro, separados por comas.', true),
  ('url_servicio_psicologico', '[PENDIENTE: URL oficial del servicio de atención psicológica de la USAL]', 'Enlace que se muestra si el bienestar es 1 o 2.', true),
  ('texto_politica_privacidad', '[PENDIENTE: revisión del Comité de Ética de la USAL]', 'Política de privacidad.', true),
  ('responsable_tratamiento', '[PENDIENTE: responsable del tratamiento y datos de contacto]', 'Responsable del tratamiento (RGPD).', true)
on conflict (clave) do nothing;

insert into public.estudios (nombre, fecha_inicio, semanas, dia_apertura, dia_cierre)
select 'Piloto SINTONÍA 2027', null, 10, 1, 7
where not exists (select 1 from public.estudios);

insert into public.consentimiento_textos (version, texto, vigente)
values (1, '[PENDIENTE: revisión del Comité de Ética de la USAL]', true)
on conflict (version) do nothing;

-- Ítems del check-in. Textos provisionales (provisional = true).
insert into public.items (rol, clave, texto, ancla_min, ancla_max, orden, privado, obligatorio, provisional) values
  ('estudiante', 'avance',         '¿Cuánto has avanzado en tu trabajo esta semana?', 'Nada', 'Mucho', 1, false, true, true),
  ('estudiante', 'siguiente_paso', '¿Tienes claro tu siguiente paso?',                'Nada claro', 'Muy claro', 2, false, true, true),
  ('estudiante', 'apoyo',          '¿Te sientes apoyado/a por tu tutor/a?',          'Nada', 'Mucho', 3, false, true, true),
  ('estudiante', 'bienestar',      '¿Cómo estás tú esta semana?',                     'Mal', 'Muy bien', 4, true, true, true),
  ('tutor',      'avance',         '¿Cuánto ha avanzado esta semana?',                'Nada', 'Mucho', 1, false, true, true),
  ('tutor',      'siguiente_paso', '¿Tiene claro su siguiente paso?',                 'Nada claro', 'Muy claro', 2, false, false, true)
on conflict (rol, clave) do nothing;
