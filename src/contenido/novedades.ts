// Registro de cambios de /novedades, sacado del historial real de git
// (git log de la rama main). Una línea por mejora, en lenguaje sencillo.
// La versión más reciente coincide con la de package.json (lo comprueba un test).

export interface Novedad {
  version: string
  fecha: string // AAAA-MM-DD
  cambios: string[]
}

export const NOVEDADES: Novedad[] = [
  {
    version: '0.4.0',
    fecha: '2026-11-15',
    cambios: [
      'Páginas nuevas de seguridad, accesibilidad, novedades y estado de la plataforma.',
      'El mensaje para quien marca un bienestar bajo enlaza al servicio de atención psicológica de la Universidad de Salamanca, gratuito, y recuerda el 112 para urgencias.',
      'La web confirma que los datos se guardan en la Unión Europea (Fráncfort, Alemania).',
      'Datos públicos comprobados en fuentes oficiales: convocatorias predoctorales y normativa de doctorado.',
    ],
  },
  {
    version: '0.3.0',
    fecha: '2026-11-14',
    cambios: [
      'Portada nueva, ordenada por importancia, con un recorrido animado del producto.',
      'Movimiento que acompaña al desplazamiento y al ratón, y que se detiene con "reducir movimiento".',
      'Modo oscuro según la preferencia del sistema.',
      'Página de la investigación y apartados de Dirección, perfiles, preguntas frecuentes y contacto.',
      'Demostración pública con entrada directa a cada perfil y reinicio cada noche.',
      'Interior de la aplicación rediseñado: tarjeta de la semana, títulos y cifras más claros.',
      'Región de los datos comprobada en la Unión Europea.',
    ],
  },
  {
    version: '0.2.0',
    fecha: '2026-11-13',
    cambios: [
      'Registro y acceso más seguros: códigos con caducidad y límite de intentos.',
      'Cabeceras de seguridad y política de contenidos estricta, sin nada de terceros.',
      'Páginas de privacidad, aviso legal, cookies y consentimiento.',
      'Calendario compartido de tutorías, entregas, congresos y eventos del máster.',
      'Cotutoría, cambio de tutor/a y términos adaptados a las tesis doctorales.',
      'Modo demostración con datos ficticios.',
    ],
  },
  {
    version: '0.1.0',
    fecha: '2026-11-12',
    cambios: [
      'Primera versión: acceso con código, perfiles de estudiante, tutor/a, dirección e investigación.',
      'Check-in semanal de estudiante y tutor/a, con "Necesito apoyo", retirada y borrado de la cuenta.',
      'Comparación de las dos miradas, sorteo semanal y agenda de tres preguntas para la tutoría.',
      'Puente al doctorado, cuestionarios inicial y final, y recordatorios por correo.',
      'Panel de la dirección con cifras solo de 5 personas o más, y exportación de datos para el análisis.',
    ],
  },
]

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export function fechaLarga(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number)
  return `${d} de ${MESES[m - 1]} de ${a}`
}
