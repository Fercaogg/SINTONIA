// Ejecuta en local las tareas diarias del servidor (npm run local:tareas):
// cierre de semanas, recordatorios y avisos de apoyo. Los correos no se
// envían: se muestran en la terminal. Necesita el servidor local en marcha.

import { CLAVE_SERVIDOR_LOCAL, PUERTO_LOCAL } from './servidor-local.mjs'
import { clienteServidor, crearAlmacenSupabase } from '../../servidor/almacen-supabase.ts'
import { cerrarSemanas } from '../../servidor/cierre-semana.ts'
import { enviadorConsola } from '../../servidor/correo.ts'
import { enviarRecordatorios, notificarAvisosApoyo } from '../../servidor/recordatorios.ts'

const almacen = crearAlmacenSupabase(clienteServidor(`http://localhost:${PUERTO_LOCAL}`, CLAVE_SERVIDOR_LOCAL))
const urlApp = 'http://localhost:5173'
console.log('Cierre de semanas:', await cerrarSemanas({ almacen, redactor: null }))
console.log('Recordatorios:', await enviarRecordatorios(almacen, enviadorConsola(), urlApp))
console.log('Avisos de apoyo:', await notificarAvisosApoyo(almacen, enviadorConsola(), urlApp))
