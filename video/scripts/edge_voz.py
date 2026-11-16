# Dice un texto con edge-tts (voz de Microsoft Edge) y lo guarda en un archivo.
# Uso: python3 scripts/edge_voz.py "texto" salida.mp3 [voz]
import asyncio, os, sys
import edge_tts
from edge_tts import communicate

# En algunos entornos la conexión pasa por un intermediario con su propio certificado.
ca = os.environ.get('SSL_CERT_FILE') or '/root/.ccr/ca-bundle.crt'
if os.path.exists(ca) and hasattr(communicate, '_SSL_CTX'):
    communicate._SSL_CTX.load_verify_locations(ca)

async def main():
    texto, salida = sys.argv[1], sys.argv[2]
    voz = sys.argv[3] if len(sys.argv) > 3 else 'es-ES-AlvaroNeural'
    await edge_tts.Communicate(texto, voz).save(salida)

asyncio.run(main())
