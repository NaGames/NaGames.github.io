"""Generate assets/og-image.png - the 1200x630 social share preview.

Run after changing the studio name or tagline:

    python scripts/make-og.py

Needs Pillow (`pip install pillow`). It is the only thing in this repo that
does, which is why it is a standalone script rather than part of the site.

The mascot is built from overlapping ellipses - that naturally produces the
lumpy nugget silhouette without needing the SVG path. Everything is drawn at
4x and downscaled at the end, which is how we get antialiased edges out of
Pillow's hard-edged primitives.
"""

import os
import pathlib
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "og-image.png"

W, H, S = 1200, 630, 4          # final size, supersample factor

# must match the tokens at the top of css/style.css
BG = (10, 10, 11)
GOLD = (212, 162, 76)
BRIGHT = (232, 192, 106)
SHADOW = (168, 124, 50)
DARK = (26, 18, 8)
TEXT = (242, 239, 233)
MUTED = (154, 149, 140)

WORDMARK = "NAGAMES"
LINES = ["Roblox games and Minecraft add-ons.", "Some of them are good."]
TAG = "R O B L O X   ·   M I N E C R A F T"


def font(candidates, size):
    for name in candidates:
        path = os.path.join(r"C:\Windows\Fonts", name)
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def fit(draw, text, candidates, start, avail, floor=14):
    """Largest font size at which `text` still fits `avail` pixels wide."""
    size = start
    while size > floor:
        f = font(candidates, size * S)
        if draw.textlength(text, font=f) <= avail:
            return f
        size -= 2
    return font(candidates, floor * S)


def draw_mascot(img, cx, cy, r):
    """Nugget silhouette from overlapping ellipses, then the deadpan face."""
    d = ImageDraw.Draw(img)

    # (offset x, offset y, radius x, radius y), as fractions of r
    lobes = [
        (-0.30, -0.22, 0.52, 0.46),
        (0.26, -0.28, 0.48, 0.42),
        (0.38, 0.10, 0.50, 0.50),
        (-0.38, 0.14, 0.46, 0.48),
        (0.02, 0.30, 0.56, 0.46),
        (0.00, -0.02, 0.72, 0.66),
    ]
    for ox, oy, rx, ry in lobes:
        d.ellipse(
            [cx + (ox - rx) * r, cy + (oy - ry) * r,
             cx + (ox + rx) * r, cy + (oy + ry) * r],
            fill=GOLD,
        )

    # shading and highlight, blurred hard - otherwise they read as pasted-on circles
    blur = ImageFilter.GaussianBlur(0.26 * r)

    shade = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(shade).ellipse(
        [cx + 0.04 * r, cy + 0.02 * r, cx + 1.05 * r, cy + 1.00 * r],
        fill=SHADOW + (150,),
    )
    shade = shade.filter(blur)

    hi = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(hi).ellipse(
        [cx - 0.78 * r, cy - 0.80 * r, cx + 0.04 * r, cy - 0.12 * r],
        fill=BRIGHT + (150,),
    )
    hi = hi.filter(blur)

    # clip both to the body so nothing spills past the silhouette
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    for ox, oy, rx, ry in lobes:
        md.ellipse(
            [cx + (ox - rx) * r, cy + (oy - ry) * r,
             cx + (ox + rx) * r, cy + (oy + ry) * r],
            fill=255,
        )
    img.paste(Image.alpha_composite(img.convert("RGBA"), shade), (0, 0), mask)
    img.paste(Image.alpha_composite(img.convert("RGBA"), hi), (0, 0), mask)

    # face
    d = ImageDraw.Draw(img)
    eye_y = cy - 0.06 * r
    for sx in (-1, 1):
        ex = cx + sx * 0.26 * r
        d.ellipse([ex - 0.09 * r, eye_y - 0.13 * r,
                   ex + 0.09 * r, eye_y + 0.13 * r], fill=DARK)
    mw, mh = 0.32 * r, 0.055 * r
    my = cy + 0.33 * r
    d.rounded_rectangle([cx - mw, my - mh, cx + mw, my + mh], radius=mh, fill=DARK)


def main():
    img = Image.new("RGBA", (W * S, H * S), BG + (255,))

    # soft gold bloom behind the mascot
    bloom = Image.new("RGBA", img.size, (0, 0, 0, 0))
    bd = ImageDraw.Draw(bloom)
    bcx, bcy = int(W * 0.20 * S), int(H * 0.5 * S)
    for i in range(44, 0, -1):
        rad = int(i / 44 * 290 * S)
        bd.ellipse([bcx - rad, bcy - rad, bcx + rad, bcy + rad],
                   fill=GOLD + (max(1, int(22 * (1 - i / 44))),))
    img = Image.alpha_composite(img, bloom)

    draw_mascot(img, bcx, bcy, 136 * S)

    d = ImageDraw.Draw(img)
    x = int(W * 0.38 * S)
    avail = (W - 56) * S - x          # keep a 56px right margin

    f_title = fit(d, WORDMARK, ["ariblk.ttf", "impact.ttf", "arialbd.ttf"], 118, avail)
    f_sub = fit(d, max(LINES, key=len), ["segoeui.ttf", "arial.ttf"], 34, avail)
    f_tag = fit(d, TAG, ["consola.ttf", "cour.ttf", "arial.ttf"], 23, avail)

    y = int(H * 0.26 * S)
    d.text((x, y), WORDMARK, font=f_title, fill=TEXT)

    # gold rule, positioned off the wordmark's real bounding box
    rule_y = d.textbbox((x, y), WORDMARK, font=f_title)[3] + 20 * S
    d.rectangle([x, rule_y, x + 170 * S, rule_y + 5 * S], fill=GOLD)

    for i, line in enumerate(LINES):
        d.text((x, rule_y + (40 + i * 48) * S), line, font=f_sub, fill=MUTED)

    d.text((x, rule_y + (56 + len(LINES) * 48) * S), TAG, font=f_tag, fill=GOLD)

    img.convert("RGB").resize((W, H), Image.LANCZOS).save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB, {W}x{H})")


if __name__ == "__main__":
    main()
