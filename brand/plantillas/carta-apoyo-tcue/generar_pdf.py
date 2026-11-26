"""Carta de apoyo empresarial de SINTONÍA (Prototipos TCUE 2026/2027) como PDF rellenable.

Misma carta que la de LUMBRA360 (brand/plantillas/carta-apoyo-tcue de ese repositorio), con los datos,
el logotipo y la tipografía de SINTONÍA: una sola familia, Instrument Sans; los antetítulos van en
seminegrita, mayúsculas y +0,08 em (DISENO.md, apartado 0). Colores «Tinta y lumbre» de src/assets/tokens.css.
El logotipo en PNG se genera con: node brand/plantillas/carta-apoyo-tcue/logotipo.mjs

Uso: python3 generar_pdf.py recursos recursos/fuentes carta-apoyo-empresarial-sintonia.pdf
Los huecos son campos de formulario: se rellenan con cualquier lector de PDF (Adobe, Edge, Chrome, Vista Previa).
La firma es un campo de firma digital (certificado FNMT, DNIe...) o se puede firmar a mano tras imprimir.
"""
import sys
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, DictionaryObject, FloatObject, NameObject, NumberObject, TextStringObject, BooleanObject

REC, FUENTES, SALIDA = sys.argv[1], sys.argv[2], sys.argv[3]

pdfmetrics.registerFont(TTFont("Instrument", f"{FUENTES}/instrument-sans-latin-400-normal.ttf"))
pdfmetrics.registerFont(TTFont("Instrument-Medio", f"{FUENTES}/instrument-sans-latin-500-normal.ttf"))
pdfmetrics.registerFont(TTFont("Instrument-Negrita", f"{FUENTES}/instrument-sans-latin-600-normal.ttf"))
pdfmetrics.registerFontFamily("Instrument", normal="Instrument", bold="Instrument-Negrita")

# Tokens de src/assets/tokens.css
TINTA = HexColor("#111111")
SUAVE = HexColor("#55554F")
TERCIARIO = HexColor("#6B6B65")
LUMBRE = HexColor("#F25A1F")
LUMBRE_TEXTO = HexColor("#B83A0E")
LINEA = HexColor("#E3E3DF")
LINEA_FUERTE = HexColor("#CFCFCA")
PAPEL = HexColor("#F5F5F2")
CONTROL = HexColor("#8A8A84")

W, H = 595.28, 841.89
MX = 62
ANCHO = W - 2 * MX

c = canvas.Canvas(SALIDA, pagesize=(W, H))
c.setTitle("Carta de apoyo empresarial · SINTONÍA · Prototipos TCUE 2026/2027")
c.setAuthor("SINTONÍA")
c.setSubject("Documento de apoyo empresarial (base 3.ª, punto 4)")


def imagen(ruta, x, y, alto):
    im = ImageReader(ruta)
    iw, ih = im.getSize()
    ancho = alto * iw / ih
    c.drawImage(im, x, y, width=ancho, height=alto, mask="auto")
    return ancho


def espaciado(txt, fuente, tam, x, y, track, color, alinear="izq"):
    """Texto en mayúsculas con interletraje abierto (antetítulos de la web: 600, +0,08 em)."""
    c.setFillColor(color)
    t = c.beginText()
    t.setFont(fuente, tam)
    t.setCharSpace(track)
    ancho = pdfmetrics.stringWidth(txt, fuente, tam) + track * (len(txt) - 1)
    t.setTextOrigin(x - ancho if alinear == "der" else x, y)
    t.textOut(txt)
    t.setCharSpace(0)
    c.drawText(t)


# ---------- Cabecera ----------
imagen(f"{REC}/sintonia-logotipo.png", MX, H - 72, 22)
espaciado("CONVOCATORIA PROTOTIPOS TCUE · 2026/2027", "Instrument-Negrita", 7.5, W - MX, H - 60, 0.6, LUMBRE_TEXTO, "der")
c.setFont("Instrument", 8)
c.setFillColor(TERCIARIO)
c.drawRightString(W - MX, H - 72, "Documento de apoyo empresarial (base 3.ª, punto 4)")
c.setStrokeColor(LINEA)
c.setLineWidth(0.6)
c.line(MX, H - 86, W - MX, H - 86)

# ---------- Pie con logos institucionales ----------
c.line(MX, 96, W - MX, 96)
y_logo = 50
logos = [("usal.png", 30), ("fgusal.png", 38), ("tcue.png", 36), ("ris3.png", 21)]
anchos = []
for f, a in logos:
    iw, ih = ImageReader(f"{REC}/{f}").getSize()
    anchos.append(a * iw / ih)
hueco = (ANCHO - sum(anchos)) / (len(logos) - 1)
x = MX
for (f, a), an in zip(logos, anchos):
    imagen(f"{REC}/{f}", x, y_logo + (38 - a) / 2, a)
    x += an + hueco
c.setFont("Instrument", 7.5)
c.setFillColor(TERCIARIO)
c.drawCentredString(W / 2, 32, "Esta actuación se enmarca en el PLAN TCUE 2024-2027 financiado por la Junta de Castilla y León.")

# ---------- Título ----------
y = H - 114
espaciado("CARTA DE APOYO EMPRESARIAL", "Instrument-Negrita", 8, MX, y, 0.64, LUMBRE_TEXTO)
y -= 30
c.setFillColor(TINTA)
c.setFont("Instrument-Medio", 24)
t = c.beginText(MX, y)
t.setFont("Instrument-Medio", 24)
t.setCharSpace(-0.72)  # −0,03 em
t.textOut("Apoyo al desarrollo de SINTONÍA")
t.setCharSpace(0)
c.drawText(t)
c.setFillColor(LUMBRE)
c.rect(MX, y - 14, 28, 2.4, stroke=0, fill=1)

# ---------- Campos ----------
campos = []  # (nombre, x, y, ancho, alto, ayuda)


def campo(nombre, x, y, ancho, ayuda, alto=17):
    c.setFillColor(PAPEL)
    c.roundRect(x, y, ancho, alto, 2.5, stroke=0, fill=1)
    c.setStrokeColor(CONTROL)
    c.setLineWidth(0.5)
    c.line(x, y, x + ancho, y)
    campos.append((nombre, x, y, ancho, alto, ayuda))


def bloque_datos(titulo, filas, y):
    espaciado(titulo, "Instrument-Negrita", 7.5, MX, y, 0.6, LUMBRE_TEXTO)
    y -= 10
    c.setStrokeColor(LINEA_FUERTE)
    c.setLineWidth(0.5)
    c.line(MX, y, W - MX, y)
    for etiqueta, nombre, ayuda in filas:
        y -= 20
        c.setFont("Instrument", 9.5)
        c.setFillColor(SUAVE)
        c.drawString(MX, y + 5.5, etiqueta)
        campo(nombre, MX + 132, y + 1, ANCHO - 132, ayuda, alto=16)
        c.setStrokeColor(LINEA)
        c.setLineWidth(0.5)
        c.line(MX, y - 3, W - MX, y - 3)
    return y


y = bloque_datos("DATOS DE LA ENTIDAD", [
    ("Razón social", "razon_social", "Nombre de la empresa o entidad"),
    ("CIF / NIF", "cif", "CIF o NIF de la entidad"),
    ("Domicilio social", "domicilio", "Calle, número, código postal y localidad"),
    ("Actividad", "actividad", "Sector o actividad principal"),
], y - 30)

y = bloque_datos("REPRESENTANTE QUE FIRMA", [
    ("Nombre y apellidos", "representante", "Nombre y apellidos de quien firma"),
    ("DNI / NIE", "dni", "DNI o NIE de quien firma"),
    ("Cargo", "cargo", "Cargo en la entidad"),
], y - 22)

# ---------- Declaración ----------
y -= 26
c.setFillColor(TINTA)
espaciado("MANIFIESTA", "Instrument-Negrita", 9.5, MX, y, 0.76, TINTA)

cuerpo = ParagraphStyle("cuerpo", fontName="Instrument", fontSize=9.8, leading=13.8, textColor=TINTA, alignment=TA_JUSTIFY)
puntos = [
    "Que conoce el proyecto <b>SINTONÍA</b>, una aplicación web de acompañamiento del trabajo académico tutorizado "
    "en la que, cada semana, estudiante y tutor/a responden por separado unas pocas preguntas sobre cómo avanza el "
    "trabajo, y que señala dónde no coinciden las dos miradas y propone preguntas neutras para la siguiente tutoría, "
    "promovido por <b>Fernando Martín Vaquero</b>, estudiante del Máster en Estudios de la Ciencia, la Tecnología y la "
    "Innovación de la Universidad de Salamanca, con la tutela académica del Dr. Luis Eduardo Andrade Silva y la Dra. "
    "Ana María Pinto Llorente.",
    "Que considera que la aplicación responde a una necesidad real de las universidades: estudiante y tutor/a no "
    "siempre ven igual el mismo trabajo, y detectar a tiempo cuándo se separan sus miradas permite que las tutorías "
    "empiecen por lo que importa, sin notas, sin rankings y sin vigilar.",
    "Que apoya el desarrollo de SINTONÍA y su candidatura a la <b>Convocatoria de Prototipos orientados al mercado en "
    "TCUE, curso 2026/2027</b>, de la Fundación General de la Universidad de Salamanca, en el marco del Plan TCUE "
    "2024-2027 de la Junta de Castilla y León.",
    "Que el presente apoyo no supone para la entidad ningún compromiso económico, contractual ni de participación.",
]
y -= 8
for i, txt in enumerate(puntos, 1):
    p = Paragraph(txt, cuerpo)
    _, alto = p.wrap(ANCHO - 20, 400)
    y -= alto + 5
    p.drawOn(c, MX + 20, y)
    c.setFont("Instrument-Negrita", 10)
    c.setFillColor(LUMBRE_TEXTO)
    c.drawString(MX, y + alto - 10.4, f"{i}.")

# ---------- Lugar y fecha ----------
y -= 26
c.setFont("Instrument", 10)
c.setFillColor(TINTA)
c.drawString(MX, y + 5, "Y para que así conste, firma la presente en")
x = MX + pdfmetrics.stringWidth("Y para que así conste, firma la presente en", "Instrument", 10) + 6
campo("localidad", x, y, 130, "Localidad")
x += 136
c.setFillColor(TINTA)
c.drawString(x, y + 5, ", a")
x += pdfmetrics.stringWidth(", a", "Instrument", 10) + 6
campo("fecha", x, y, W - MX - x, "Fecha (día, mes y año)")

# ---------- Firma y sello ----------
y_caja = 118
alto_caja = y - 18 - y_caja
ancho_caja = (ANCHO - 16) / 2
for i, rotulo in enumerate(["FIRMA DEL REPRESENTANTE", "SELLO DE LA ENTIDAD"]):
    xc = MX + i * (ancho_caja + 16)
    c.setStrokeColor(LINEA_FUERTE)
    c.setLineWidth(0.6)
    c.setDash(2, 2)
    c.roundRect(xc, y_caja, ancho_caja, alto_caja, 6, stroke=1, fill=0)
    c.setDash()
    espaciado(rotulo, "Instrument-Negrita", 7, xc + 10, y_caja + alto_caja - 14, 0.56, TERCIARIO)
firma_rect = (MX + 6, y_caja + 6, MX + ancho_caja - 6, y_caja + alto_caja - 22)

# Campos de texto (fuente estándar de los formularios PDF; admite tildes y eñes)
for nombre, x, yy, ancho, alto, ayuda in campos:
    c.acroForm.textfield(
        name=nombre, tooltip=ayuda, x=x + 1, y=yy + 1, width=ancho - 2, height=alto - 1,
        fontName="Helvetica", fontSize=9.5, borderWidth=0, borderColor=None, fillColor=None,
        textColor=TINTA, forceBorder=False,
    )
c.showPage()
c.save()

# ---------- Campo de firma digital (pypdf) ----------
r = PdfReader(SALIDA)
w = PdfWriter(clone_from=r)
pagina = w.pages[0]
firma = DictionaryObject({
    NameObject("/Type"): NameObject("/Annot"),
    NameObject("/Subtype"): NameObject("/Widget"),
    NameObject("/FT"): NameObject("/Sig"),
    NameObject("/T"): TextStringObject("firma_representante"),
    NameObject("/TU"): TextStringObject("Firma digital del representante (o firmar a mano tras imprimir)"),
    NameObject("/Rect"): ArrayObject([FloatObject(v) for v in firma_rect]),
    NameObject("/F"): NumberObject(4),
    NameObject("/P"): pagina.indirect_reference,
})
ref = w._add_object(firma)
pagina[NameObject("/Annots")].append(ref)
form = w._root_object["/AcroForm"]
form[NameObject("/Fields")].append(ref)
form[NameObject("/SigFlags")] = NumberObject(1)
form[NameObject("/NeedAppearances")] = BooleanObject(True)
w.write(SALIDA)
print("ok", SALIDA, "campos:", [n for n, *_ in campos] + ["firma_representante"])
