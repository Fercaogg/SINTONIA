# Presencia en Google

Qué está hecho en la web para que Google la entienda, y qué tienes que hacer tú (necesita tu cuenta de Google).

## Lo que ya hace la web

- **Título, descripción e imagen propios** en cada página pública (`src/contenido/paginas.json`).
- **Datos estructurados** (schema.org, JSON-LD) en cada página: el sitio, la página y sus migas; en la portada, además, la aplicación (`WebApplication`) y el proyecto de investigación (`ResearchProject`) con su autor y la Universidad de Salamanca. Los genera `scripts/paginas-estaticas.mjs`.
- **sitemap.xml** con la versión en el otro idioma de cada página (hreflang) y **robots.txt** que solo deja indexar las páginas públicas.
- **favicon.ico** (además del SVG): es el icono que Google muestra junto al resultado.

Para comprobar los datos estructurados de una página: https://search.google.com/test/rich-results (pega la dirección).

## Ficha de Google (Google Business Profile): no se recomienda

La ficha de Google es para negocios que atienden en persona (un local o una zona de servicio). Las normas de Google no admiten negocios solo en línea, y SINTONÍA es un proyecto de investigación sin local ni atención presencial: la ficha podría ser rechazada o suspendida. Si en el futuro hubiera un lugar físico (por ejemplo, un grupo de investigación con despacho propio que quiera aparecer en Maps), es la propia Universidad quien debe crearla o autorizarla.

Lo que sí sirve, y es gratis:

## Google Search Console (recomendado, 10 minutos)

1. Entra en https://search.google.com/search-console con tu cuenta de Google.
2. *Añadir propiedad* > *Prefijo de URL* > `https://sintonia360-ferca.vercel.app` (o tu dominio propio, si ya lo tienes: ver docs/DOMINIO.md).
3. Verificación: elige *Etiqueta HTML* y pásale a Claude el código `google-site-verification` que te da; se añade en `index.html` y se publica. (Con dominio propio es mejor la verificación por DNS, en el registrador.)
4. Ya verificada: *Sitemaps* > añade `sitemap.xml` > *Enviar*.
5. Al cabo de unos días, revisa *Páginas* (qué está indexado) y *Mejoras* (datos estructurados).

Cuando cambies de dominio, repite los pasos con la nueva dirección.
