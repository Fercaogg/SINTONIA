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
    version: '0.7.0',
    fecha: '2026-11-25',
    cambios: [
      'Si la sesión caduca, la aplicación lo dice y, al volver a entrar, te lleva a la misma pantalla.',
      'El check-in no se pierde: lo que marcas y aún no has enviado se guarda en tu navegador (salvo el bienestar) y se recupera al volver.',
      'Si la semana se cierra con el check-in abierto, no se guarda en otra semana: te lo explicamos.',
      'Sin conexión, el aviso lo dice claramente y cada pantalla ofrece "Reintentar" sin recargar la página.',
      'Los paneles se ponen al día solos al volver a la pestaña.',
      'Tras publicar una versión nueva, la pantalla se recarga sola en vez de quedarse en blanco.',
      'Menú del móvil más cómodo con el teclado y con lectores de pantalla, que ahora anuncian cada cambio de pantalla.',
    ],
  },
  {
    version: '0.6.0',
    fecha: '2026-11-25',
    cambios: [
      'Nueva imagen, la misma que LUMBRA360: lienzo blanco, tinta negra, un único acento naranja y las tipografías Instrument Sans e IBM Plex Mono.',
      'Portada rehecha: cabecera que se difumina al bajar, apartados con más aire y una sección con pantallas reales del panel.',
      'Apartado «Respaldo»: la trayectoria desde WORKWELL360, los avales de la Universidad de Salamanca y de su Fundación General, y las personas del equipo con foto.',
      'Todas las páginas públicas comparten la misma cabecera, con acceso directo a cada sección.',
      'Textos legales completos, iconos para instalar la web en el móvil y datos para buscadores en cada página.',
      'Analítica de visitas sin cookies y protección de los formularios frente al correo no deseado.',
      'Documentos en PDF y clips de la demostración actualizados con la nueva imagen.',
      'Todas las pantallas del panel se recorren con el teclado.',
    ],
  },
  {
    version: '0.5.0',
    fecha: '2026-11-16',
    cambios: [
      'Logotipo definitivo de SINTONÍA: tres hojas que forman una S, en la web, el icono del navegador y los documentos en PDF.',
      'Versión en inglés de las páginas públicas principales.',
      'Cada página tiene su propia imagen y descripción al compartir el enlace.',
      'Página propia para los enlaces que no existen.',
      'Mensajes de error y avisos revisados para que digan siempre qué hacer después, sin culpa ni prisa.',
      'Enlace "Saltar al contenido" en todas las páginas y la web entera se puede recorrer solo con el teclado.',
      'Carga más ligera en móviles: el fondo animado del inicio espera a que la página esté lista.',
    ],
  },
  {
    version: '0.4.0',
    fecha: '2026-11-15',
    cambios: [
      'Páginas nuevas de seguridad, accesibilidad, novedades y estado de la plataforma.',
      'Demostración guiada de unos 60 segundos: el check-in, la mirada del tutor/a, el desajuste y lo que ve la dirección.',
      'Clips cortos de la demostración para cada perfil, una calculadora del tiempo que pide a un máster y una comparación honesta con otras formas de acompañar.',
      'Página para instituciones con solicitud de demostración, dosier de una página en PDF y hoja de ruta pública.',
      'Si el formulario no puede enviar correos, ahora lo dice claramente y ofrece escribir con el mensaje ya preparado.',
      'Página de la investigación ordenada, con "Cómo citar SINTONÍA" en APA 7 y un kit para participantes (hoja informativa, consentimiento y preguntas frecuentes) descargable en PDF.',
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
