// Une todas las migraciones en un solo archivo para pegarlo en el editor SQL
// de Supabase (npm run sql:unir).

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const carpeta = 'supabase/migrations'
const partes = readdirSync(carpeta).filter((f) => f.endsWith('.sql')).sort()
const texto = [
  '-- SINTONÍA · Instalación completa de la base de datos.',
  '-- Generado con "npm run sql:unir" a partir de supabase/migrations. No lo edites a mano.',
  '-- Pégalo entero en Supabase > SQL Editor > New query y pulsa "Run" UNA sola vez,',
  '-- en un proyecto nuevo.',
  '',
  ...partes.map((f) => `-- ===========================================================================\n-- ${f}\n-- ===========================================================================\n\n${readFileSync(`${carpeta}/${f}`, 'utf8')}`),
].join('\n')
writeFileSync('supabase/instalacion-completa.sql', texto)
console.log(`supabase/instalacion-completa.sql: ${partes.length} migraciones unidas.`)
