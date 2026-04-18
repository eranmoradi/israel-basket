#!/usr/bin/env python3
"""
Build final og-image.png from og-v3-typo.png:
  1. Remove bottom URL bar (natural cut at y=549)
  2. Repaint top subtitle and bottom CTA line at larger size, accent color
  3. Composite logo-on-dark.png (white logo) centered at bottom
  4. Save to docs/media/assets/ and israel-basket/public/
"""
import os, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont
from bidi.algorithm import get_display

BASE   = "/Users/eranmoradi/Claude/israel basket"
SRC    = f"{BASE}/docs/media/assets/og-v3-typo.png"
OUT    = f"{BASE}/docs/media/assets/og-image.png"
PUBLIC = f"{BASE}/israel-basket/public/og-image.png"

FONT_PATH = "/System/Library/Fonts/ArialHB.ttc"
ACCENT    = (147, 197, 253, 255)   # Tailwind blue-300 — pops on dark navy
WHITE     = (255, 255, 255, 255)

# Background colors sampled from og-v3-typo.png at relevant rows
BG_TOP    = (9,  22,  78,  255)   # y≈85-110  (top subtitle area)
BG_BOTTOM = (18, 41, 107, 255)    # y≈455-490 (bottom CTA area)
BG_FOOTER = (7,  15,  38,  255)   # y≈550+    (footer bar)

CART_X, CART_Y = 154.0, 299.0
CART_W, CART_H = 900.0, 865.0

CART_PATH_D = (
    "M1023.738,462.853H360.523l-23.554-123.555c-4.425-23.215-24.791-40.065-48.425-40.065H170.049"
    "c-8.864,0-16.049,7.185-16.049,16.049s7.185,16.049,16.049,16.049h118.495"
    "c8.245,0,15.35,5.878,16.894,13.978l101.856,534.301l-22.456,41.366"
    "c-12.655,23.311-12.113,50.837,1.45,73.631c13.563,22.796,37.496,36.404,64.02,36.404h27.269"
    "c-25.896,10.402-44.19,35.729-44.19,65.345c0,38.887,31.524,70.411,70.411,70.411"
    "s70.411-31.524,70.411-70.411c0-29.616-18.294-54.944-44.19-65.345h335.728"
    "c-25.896,10.402-44.19,35.729-44.19,65.345c0,38.887,31.524,70.411,70.411,70.411"
    "s70.411-31.524,70.411-70.411c0-29.616-18.294-54.944-44.19-65.345h63.41"
    "c8.863,0,16.049-7.186,16.049-16.049s-7.186-16.049-16.049-16.049H450.309"
    "c-15.095,0-28.716-7.746-36.435-20.719s-8.027-28.639-0.825-41.905l20.635-38.011h508.337"
    "c30.522,0,57.449-20.566,65.478-50.013l81.724-299.682c5.611-20.579,1.402-42.105-11.548-59.057"
    "C1064.726,472.575,1045.067,462.853,1023.738,462.853z"
    " M857.252,734.676H727.808V630.248h147.875L857.252,734.676z"
    " M908.968,630.248h124.712l-28.478,104.428H890.537L908.968,630.248z"
    " M437.411,866.18l-18.95-99.405h119.502l17.544,99.405H437.411z"
    " M695.028,630.248v104.428H565.584l-18.431-104.428H695.028z"
    " M541.488,598.15l-18.214-103.198h171.753V598.15H541.488z"
    " M532.298,734.676H412.342l-19.908-104.428h121.433L532.298,734.676z"
    " M571.249,766.774h123.779v99.405H588.793L571.249,766.774z"
    " M727.808,766.774h123.779l-17.544,99.405H727.808V766.774z"
    " M727.808,598.15V494.952h171.754L881.348,598.15H727.808z"
    " M489.989,494.952l18.214,103.198H386.315l-19.673-103.198H489.989z"
    " M976.529,839.82c-4.232,15.521-18.422,26.36-34.509,26.36h-74.693l17.544-99.405h111.577L976.529,839.82z"
    " M1058.253,540.139l-15.82,58.01h-127.8l18.214-103.198h90.891"
    "c11.242,0,21.603,5.124,28.428,14.059C1058.992,517.947,1061.21,529.293,1058.253,540.139z"
)


def draw_centered_text(draw, img_w, y_center, text_he, font, color):
    """Draw Hebrew text centered horizontally at y_center."""
    visual = get_display(text_he)
    bbox   = draw.textbbox((0, 0), visual, font=font)
    tw     = bbox[2] - bbox[0]
    th     = bbox[3] - bbox[1]
    x      = (img_w - tw) // 2
    draw.text((x, y_center - th // 2), visual, font=font, fill=color)


def render_cart_png(icon_size: int, color: str = "white") -> str:
    cart_h = int(icon_size * 0.78)
    cart_w = CART_W / CART_H * cart_h
    cart_x = (icon_size - cart_w) / 2
    cart_y = (icon_size - cart_h) / 2
    s  = cart_h / CART_H
    tx = cart_x - CART_X * s
    ty = cart_y - CART_Y * s
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg"'
        f' width="{icon_size}" height="{icon_size}">'
        f'<g transform="translate({tx:.3f},{ty:.3f}) scale({s:.6f})">'
        f'<path d="{CART_PATH_D}" fill="{color}" fill-rule="evenodd"/>'
        f'</g></svg>'
    )
    with tempfile.NamedTemporaryFile(suffix=".svg", mode="w", delete=False) as f:
        f.write(svg)
        tmp_svg = f.name
    tmp_png = tmp_svg.replace(".svg", ".png")
    subprocess.run(["rsvg-convert", "-f", "png", "-o", tmp_png, tmp_svg],
                   check=True, capture_output=True)
    os.unlink(tmp_svg)
    return tmp_png


def main():
    img  = Image.open(SRC).convert("RGBA")
    w, h = img.size   # 1200x630
    draw = ImageDraw.Draw(img)

    # ── 1. Remove bottom footer — fill with main content bg so no dark strip ─
    BG_MAIN = (19, 44, 112, 255)   # matches surrounding background at y≈545
    draw.rectangle([(0, 549), (w, h)], fill=BG_MAIN)

    # ── 2. Repaint top subtitle ───────────────────────────────────────────
    draw.rectangle([(0, 65), (w, 125)], fill=BG_TOP)
    font_sub = ImageFont.truetype(FONT_PATH, 38)
    draw_centered_text(draw, w, 97, "הממשלה הכריזה על הוזלת סל המזון", font_sub, ACCENT)

    # ── 3. Repaint bottom CTA line ────────────────────────────────────────
    draw.rectangle([(0, 448), (w, 498)], fill=BG_BOTTOM)
    font_cta = ImageFont.truetype(FONT_PATH, 42)
    draw_centered_text(draw, w, 473, "הכוח בידיכם — בדקו וחשפו בעצמכם", font_cta, ACCENT)

    # ── 4. Logo centered at bottom strip ─────────────────────────────────
    logo_raw = Image.open(f"{BASE}/docs/media/assets/logo-on-dark.png").convert("RGBA")
    pixels   = logo_raw.load()
    lw, lh   = logo_raw.size
    for ly in range(lh):
        for lx in range(lw):
            r, g, b, a = pixels[lx, ly]
            if r < 40 and g < 40 and b < 100:
                pixels[lx, ly] = (r, g, b, 0)

    target_h = 70
    target_w = int(lw * target_h / lh)
    logo_img = logo_raw.resize((target_w, target_h), Image.LANCZOS)

    strip_h  = h - 549
    paste_x  = (w - target_w) // 2
    paste_y  = 549 + (strip_h - target_h) // 2
    img.paste(logo_img, (paste_x, paste_y), logo_img)

    img.convert("RGB").save(OUT, "PNG")
    img.convert("RGB").save(PUBLIC, "PNG")
    print(f"  ✓ {OUT}")
    print(f"  ✓ {PUBLIC}")


if __name__ == "__main__":
    main()
