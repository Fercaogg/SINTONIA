// Páginas estáticas para buscadores y redes (Fase 5 de las mejoras).
//
// SINTONÍA es una aplicación de una sola página: sin esto, al compartir
// cualquier enlace se vería siempre el título y la imagen de la portada.
// Al compilar, por cada página pública de src/contenido/paginas.json se
// escribe un HTML con su título, descripción, URL canónica, idioma, versión
// en el otro idioma e imagen para compartir. También se generan sitemap.xml
// y robots.txt. Todas las direcciones salen de una sola: VITE_URL_SITIO.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const URL_POR_DEFECTO = 'https://sintonia360-ferca.vercel.app'

const escapar = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

export function leerPaginas(raiz) {
  return JSON.parse(readFileSync(join(raiz, 'src', 'contenido', 'paginas.json'), 'utf8'))
}

/** Bloque de etiquetas <head> de una página. */
export function etiquetas(pagina, todas, base) {
  const url = base + (pagina.ruta === '/' ? '/' : pagina.ruta)
  const clave = pagina.idioma === 'en' ? `en-${pagina.og}` : pagina.og
  const imagen = `${base}/og/${clave}.png`
  const alterna = pagina.alterna ? todas.find((p) => p.ruta === pagina.alterna) : null
  const lineas = [
    `<title>${escapar(pagina.titulo)}</title>`,
    `<meta name="description" content="${escapar(pagina.descripcion)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="SINTONÍA" />`,
    `<meta property="og:locale" content="${pagina.idioma === 'en' ? 'en_GB' : 'es_ES'}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${escapar(pagina.titulo)}" />`,
    `<meta property="og:description" content="${escapar(pagina.descripcion)}" />`,
    `<meta property="og:image" content="${imagen}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapar(pagina.titulo)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ]
  if (alterna) {
    lineas.push(`<link rel="alternate" hreflang="${pagina.idioma}" href="${url}" />`)
    lineas.push(`<link rel="alternate" hreflang="${alterna.idioma}" href="${base}${alterna.ruta === '/' ? '/' : alterna.ruta}" />`)
    lineas.push(`<link rel="alternate" hreflang="x-default" href="${pagina.idioma === 'es' ? url : base + (alterna.ruta === '/' ? '/' : alterna.ruta)}" />`)
  }
  return lineas.join('\n  ')
}

const MARCA = /<!-- pagina -->[\s\S]*?<!-- \/pagina -->/

/** HTML de una página a partir del index.html compilado. */
export function htmlDe(plantilla, pagina, todas, base) {
  return plantilla
    .replace(MARCA, `<!-- pagina -->\n  ${etiquetas(pagina, todas, base)}\n  <!-- /pagina -->`)
    .replace(/<html lang="[a-z]+">/, `<html lang="${pagina.idioma}">`)
}

export function sitemap(todas, base) {
  const urls = todas.map((p) => `  <url><loc>${base}${p.ruta === '/' ? '/' : p.ruta}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function robots(todas, base) {
  const permitidas = todas.map((p) => `Allow: ${p.ruta === '/' ? '/$' : p.ruta + '$'}`)
  return [
    '# SINTONÍA: solo las páginas públicas pueden aparecer en buscadores.',
    'User-agent: *',
    ...permitidas,
    'Allow: /og/',
    'Allow: /kit/',
    'Allow: /dosier/',
    'Disallow: /',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n')
}

/** Escribe las páginas, el sitemap y robots.txt en la carpeta compilada. */
export function escribir(raiz, salida, base) {
  const todas = leerPaginas(raiz)
  const plantilla = readFileSync(join(salida, 'index.html'), 'utf8')
  for (const p of todas) {
    const destino = p.ruta === '/' ? join(salida, 'index.html') : join(salida, `${p.ruta.slice(1)}.html`)
    mkdirSync(dirname(destino), { recursive: true })
    writeFileSync(destino, htmlDe(plantilla, p, todas, base))
  }
  writeFileSync(join(salida, 'sitemap.xml'), sitemap(todas, base))
  writeFileSync(join(salida, 'robots.txt'), robots(todas, base))
  return todas.length
}
