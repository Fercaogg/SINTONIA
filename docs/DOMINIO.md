# Pasar SINTONÍA a un dominio propio

Hoy la web está en `https://sintonia360-ferca.vercel.app`. Todo está preparado para cambiar a un dominio propio (por ejemplo, `sintonia.es`) tocando una sola variable. Estos son los pasos, en orden, para el día que lo compres.

## Qué ya está preparado

- **Una sola dirección.** La URL del sitio sale de la variable `VITE_URL_SITIO`. De ella salen las URL canónicas de cada página, el `sitemap.xml`, el `robots.txt`, las imágenes para compartir, la versión en el otro idioma (hreflang) y la cita en APA.
- **Una página HTML por cada página pública**, con su título, descripción e imagen para compartir. Se generan al publicar (`scripts/paginas-estaticas.mjs`) a partir de `src/contenido/paginas.json`.
- **Sin direcciones escritas a mano** en el código, salvo la de por defecto, en dos sitios: `src/lib/publico.ts` y `scripts/paginas-estaticas.mjs`.

## Pasos

1. **Comprar el dominio** en un registrador (cualquiera vale).
2. **Añadirlo en Vercel:** proyecto `sintonia360-ferca` > *Settings* > *Domains* > *Add*. Vercel indica los registros DNS (normalmente un registro A o CNAME) que hay que crear en el registrador. El certificado HTTPS lo pone Vercel solo.
3. **Marcarlo como dominio principal** en esa misma pantalla.
4. **Redirigir la dirección antigua.** Para que los enlaces viejos lleven al dominio nuevo, Claude añadirá a `vercel.json` una redirección permanente (301) de `sintonia360-ferca.vercel.app` a la nueva dirección, conservando la ruta.
5. **Cambiar las variables en Vercel** (*Settings* > *Environment Variables*, entorno *Production*):
   - `VITE_URL_SITIO` = `https://tu-dominio` (sin barra al final);
   - `APP_URL` = `https://tu-dominio`.
6. **En Supabase** (*Authentication* > *URL Configuration*): poner la nueva dirección en *Site URL* y añadirla a *Redirect URLs*. Sin esto, los enlaces de acceso del correo no funcionan.
7. **Volver a generar las imágenes y los PDF**, que llevan la dirección escrita (Claude):
   - `node scripts/generar-og.mjs` (imágenes para compartir);
   - `npm run pdf` (kit para participantes y dosier).
8. **Publicar de nuevo** (un cambio en `main`, o *Redeploy* en Vercel).
9. **Comprobar:**
   - que `https://tu-dominio/seguridad` muestra la página y que su código fuente lleva `<link rel="canonical" href="https://tu-dominio/seguridad">`;
   - que `https://tu-dominio/sitemap.xml` y `/robots.txt` usan la nueva dirección;
   - que al pegar un enlace en un chat o en una red social sale la imagen correcta;
   - que el acceso por correo funciona de principio a fin.
10. **Opcional:** dar de alta el dominio en Google Search Console y enviar el `sitemap.xml`.
11. **Correo:** si se configura Resend, se puede verificar el mismo dominio para enviar los correos desde él (ver PENDIENTES.md).
