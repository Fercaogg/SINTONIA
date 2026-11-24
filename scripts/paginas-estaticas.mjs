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
  lineas.push(datosEstructurados(pagina, todas, base))
  if (alterna) {
    lineas.push(`<link rel="alternate" hreflang="${pagina.idioma}" href="${url}" />`)
    lineas.push(`<link rel="alternate" hreflang="${alterna.idioma}" href="${base}${alterna.ruta === '/' ? '/' : alterna.ruta}" />`)
    lineas.push(`<link rel="alternate" hreflang="x-default" href="${pagina.idioma === 'es' ? url : base + (alterna.ruta === '/' ? '/' : alterna.ruta)}" />`)
  }
  return lineas.join('\n  ')
}

const AUTOR = {
  '@type': 'Person',
  name: 'Fernando Martín Vaquero',
  affiliation: { '@type': 'CollegeOrUniversity', name: 'Universidad de Salamanca', url: 'https://www.usal.es' },
}

/**
 * Datos estructurados (schema.org, JSON-LD) para que los buscadores entiendan
 * qué es cada página: el sitio, la página, su lugar en el sitio (migas) y, en
 * la portada, la aplicación y el proyecto de investigación. Es un bloque de
 * datos, no código: el navegador no lo ejecuta y la CSP no lo bloquea.
 */
export function datosEstructurados(pagina, todas, base) {
  const url = base + (pagina.ruta === '/' ? '/' : pagina.ruta)
  const en = pagina.idioma === 'en'
  const inicio = en ? `${base}/en` : `${base}/`
  const sitio = {
    '@type': 'WebSite',
    '@id': `${base}/#sitio`,
    url: `${base}/`,
    name: 'SINTONÍA',
    inLanguage: ['es', 'en'],
    publisher: AUTOR,
  }
  const web = {
    '@type': 'WebPage',
    '@id': `${url}#pagina`,
    url,
    name: pagina.titulo,
    description: pagina.descripcion,
    inLanguage: pagina.idioma,
    isPartOf: { '@id': `${base}/#sitio` },
    primaryImageOfPage: `${base}/og/${en ? 'en-' : ''}${pagina.og}.png`,
  }
  const grafo = [sitio, web]
  const esInicio = pagina.ruta === '/' || pagina.ruta === '/en'
  if (!esInicio) {
    web.breadcrumb = { '@id': `${url}#migas` }
    grafo.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#migas`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: en ? 'Home' : 'Inicio', item: inicio },
        { '@type': 'ListItem', position: 2, name: pagina.titulo.replace(/ · SINTONÍA$/, ''), item: url },
      ],
    })
  } else {
    web.about = { '@id': `${base}/#aplicacion` }
    grafo.push(
      {
        '@type': 'WebApplication',
        '@id': `${base}/#aplicacion`,
        name: 'SINTONÍA',
        url: `${base}/`,
        description: pagina.descripcion,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        inLanguage: 'es',
        isAccessibleForFree: true,
        author: AUTOR,
      },
      {
        '@type': 'ResearchProject',
        '@id': `${base}/#investigacion`,
        name: en ? 'SINTONÍA: study of weekly student and supervisor check-ins' : 'SINTONÍA: estudio del registro semanal de estudiante y tutor/a',
        url: `${base}${en ? '/en/research' : '/investigacion'}`,
        parentOrganization: AUTOR.affiliation,
        member: AUTOR,
      },
    )
  }
  // "</" se escapa para que el bloque no pueda cerrar la etiqueta antes de tiempo.
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo }).replace(/<\//g, '<\\/')
  return `<script type="application/ld+json">${json}</script>`
}

const MARCA = /<!-- pagina -->[\s\S]*?<!-- \/pagina -->/

/** HTML de una página a partir del index.html compilado. */
export function htmlDe(plantilla, pagina, todas, base) {
  return plantilla
    .replace(MARCA, `<!-- pagina -->\n  ${etiquetas(pagina, todas, base)}\n  <!-- /pagina -->`)
    .replace(/<html lang="[a-z]+">/, `<html lang="${pagina.idioma}">`)
}

/** Sitemap con las versiones en otro idioma de cada página (hreflang). */
export function sitemap(todas, base) {
  const dir = (p) => base + (p.ruta === '/' ? '/' : p.ruta)
  const urls = todas
    .map((p) => {
      const otra = p.alterna ? todas.find((q) => q.ruta === p.alterna) : null
      if (!otra) return `  <url><loc>${dir(p)}</loc></url>`
      const es = p.idioma === 'es' ? p : otra
      return [
        `  <url>`,
        `    <loc>${dir(p)}</loc>`,
        `    <xhtml:link rel="alternate" hreflang="${p.idioma}" href="${dir(p)}" />`,
        `    <xhtml:link rel="alternate" hreflang="${otra.idioma}" href="${dir(otra)}" />`,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${dir(es)}" />`,
        `  </url>`,
      ].join('\n')
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`
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
  // 404.html: Vercel la sirve, con el código 404, para cualquier dirección
  // que no sea una página ni una pantalla de la aplicación. La aplicación
  // carga igual y muestra "Esta página no está en sintonía".
  const portada = todas.find((p) => p.ruta === '/')
  const noEncontrada = { ...portada, titulo: 'Página no encontrada · SINTONÍA', descripcion: 'Esta página no existe o se ha movido.' }
  writeFileSync(
    join(salida, '404.html'),
    htmlDe(plantilla, noEncontrada, [], base)
      .replace(/\n\s*<link rel="canonical"[^>]*>/, '')
      .replace(/\n\s*<script type="application\/ld\+json">.*?<\/script>/, '')
      .replace('<!-- /pagina -->', '<meta name="robots" content="noindex" />\n  <!-- /pagina -->'),
  )
  writeFileSync(join(salida, 'sitemap.xml'), sitemap(todas, base))
  writeFileSync(join(salida, 'robots.txt'), robots(todas, base))
  return todas.length
}
