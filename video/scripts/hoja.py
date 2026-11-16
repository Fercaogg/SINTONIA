# Une varias imágenes de prueba en una sola hoja (solo para revisar).
from PIL import Image
import sys
ids = sys.argv[1:]
ims = [Image.open(f'out/storyboard/t{i}.png') for i in ids]
w, h = ims[0].size
cols = 3
s = Image.new('RGB', (w * cols, h * -(-len(ims) // cols)), '#888')
for k, im in enumerate(ims):
    s.paste(im, ((k % cols) * w, (k // cols) * h))
s.save('out/storyboard/hoja.png')
