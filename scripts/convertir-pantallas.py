"""Convierte las pantallas de tests/demo/pantallas.ts (.local/pantallas) a WebP
para la portada (public/portada), a 1600 x 1000. Uso: python3 scripts/convertir-pantallas.py"""
from pathlib import Path
from PIL import Image

raiz = Path(__file__).resolve().parent.parent
salida = raiz / 'public' / 'portada'
salida.mkdir(parents=True, exist_ok=True)
for origen in sorted((raiz / '.local' / 'pantallas').glob('*.png')):
    im = Image.open(origen).convert('RGB').resize((1600, 1000), Image.LANCZOS)
    destino = salida / (origen.stem + '.webp')
    im.save(destino, 'WEBP', quality=82, method=6)
    print(f'public/portada/{destino.name}: {destino.stat().st_size // 1024} KB')
