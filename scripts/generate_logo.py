#!/usr/bin/env python3
"""
Generate logo variants for הסל של ישראל.
Cart icon sourced from the Freepik SVG (black filled path, mesh grid via even-odd rule).
Rendered via rsvg-convert.
"""
import os, subprocess, tempfile, shutil

OUT    = "/Users/eranmoradi/Claude/israel basket/docs/media/assets"
PUBLIC = "/Users/eranmoradi/Claude/israel basket/israel-basket/public"

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


def cart_group(target_x, target_y, target_h, color):
    s  = target_h / CART_H
    tx = target_x - CART_X * s
    ty = target_y - CART_Y * s
    return (
        f'<g transform="translate({tx:.3f},{ty:.3f}) scale({s:.6f})">'
        f'<path d="{CART_PATH_D}" fill="{color}" fill-rule="evenodd"/>'
        f'</g>'
    )


def make_horizontal_svg(bg, icon_color, text_color, w=600, h=200):
    cart_h   = 140
    cart_w   = CART_W / CART_H * cart_h
    cart_x   = w - cart_w - 12
    cart_y   = (h - cart_h) / 2

    cart = cart_group(cart_x, cart_y, cart_h, icon_color)

    text_area = int(cart_x - 10)
    text_x    = text_area // 2
    text_y    = h // 2 + 20

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}">
  <rect width="{w}" height="{h}" fill="{bg}"/>
  <text x="{text_x}" y="{text_y}"
        font-family="Arial Hebrew, ArialHB, Arial" font-size="56" font-weight="bold"
        fill="{text_color}" text-anchor="middle" direction="rtl">הסל של ישראל</text>
  {cart}
</svg>"""


def make_icon_svg(bg, icon_color, size=200):
    cart_h  = int(size * 0.78)
    cart_w  = CART_W / CART_H * cart_h
    cart_x  = (size - cart_w) / 2
    cart_y  = (size - cart_h) / 2
    cart    = cart_group(cart_x, cart_y, cart_h, icon_color)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}">
  <rect width="{size}" height="{size}" fill="{bg}"/>
  {cart}
</svg>"""


def make_favicon_svg():
    size   = 200
    cart_h = int(size * 0.80)
    cart_w = CART_W / CART_H * cart_h
    cart_x = (size - cart_w) / 2
    cart_y = (size - cart_h) / 2
    cart   = cart_group(cart_x, cart_y, cart_h, "white")
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">
  <rect width="{size}" height="{size}" fill="#1d4ed8" rx="36"/>
  {cart}
</svg>"""


def make_og_svg(w=1200, h=630):
    cart_h    = 360
    cart_w_px = CART_W / CART_H * cart_h
    cart_x    = w - cart_w_px - 80
    cart_y    = (h - cart_h) / 2
    cart      = cart_group(cart_x, cart_y, cart_h, "white")
    text_right = int(cart_x - 50)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#bg)"/>
  {cart}
  <text x="{text_right}" y="195"
        font-family="Arial Hebrew, ArialHB, Arial" font-size="84" font-weight="bold"
        fill="white" text-anchor="end" direction="rtl">הסל של ישראל</text>
  <text x="{text_right}" y="278"
        font-family="Arial Hebrew, ArialHB, Arial" font-size="40"
        fill="#93c5fd" text-anchor="end" direction="rtl">האם הממשלה עמדה בהבטחה?</text>
  <text x="{text_right}" y="345"
        font-family="Arial Hebrew, ArialHB, Arial" font-size="30"
        fill="#64748b" text-anchor="end" direction="rtl">4 רשתות · 30 שניות · בדקו בעצמכם</text>
  <text x="60" y="598"
        font-family="Arial, sans-serif" font-size="26"
        fill="#334155">israelbasket.app</text>
</svg>"""


def render(svg_str, out_path):
    with tempfile.NamedTemporaryFile(suffix=".svg", mode="w", delete=False) as f:
        f.write(svg_str)
        tmp = f.name
    try:
        subprocess.run(
            ["rsvg-convert", "-f", "png", "-o", out_path, tmp],
            check=True, capture_output=True
        )
        print(f"  ✓ {os.path.basename(out_path)}")
    finally:
        os.unlink(tmp)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print("Generating logo variants...\n")

    # Marketing / docs assets
    render(make_horizontal_svg("#080b48", "white",   "white"),   f"{OUT}/logo-on-dark.png")
    render(make_horizontal_svg("white",   "#1d4ed8", "#1e3a8a"), f"{OUT}/logo-on-light.png")
    render(make_horizontal_svg("#1d4ed8", "white",   "white"),   f"{OUT}/logo-on-blue.png")
    render(make_icon_svg("#1d4ed8", "white"),                    f"{OUT}/logo-icon-blue.png")
    render(make_icon_svg("white",   "#1d4ed8"),                  f"{OUT}/logo-icon-white.png")

    # App assets
    render(make_icon_svg("#1d4ed8", "white", 192),               f"{OUT}/pwa-192x192.png")
    render(make_icon_svg("#1d4ed8", "white", 512),               f"{OUT}/pwa-512x512.png")
    render(make_icon_svg("#1d4ed8", "white", 180),               f"{OUT}/apple-touch-icon.png")
    render(make_og_svg(),                                         f"{OUT}/og-image.png")

    favicon_svg = make_favicon_svg()
    with open(f"{OUT}/favicon.svg", "w") as fh:
        fh.write(favicon_svg)
    print("  ✓ favicon.svg")

    # Copy app assets to public/
    print("\nCopying to public/...")
    for fname in ["pwa-192x192.png", "pwa-512x512.png", "apple-touch-icon.png", "og-image.png", "favicon.svg"]:
        shutil.copy(f"{OUT}/{fname}", f"{PUBLIC}/{fname}")
        print(f"  ✓ → public/{fname}")

    print("\nDone.")
