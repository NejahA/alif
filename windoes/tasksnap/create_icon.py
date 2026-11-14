"""Generate the shared dought app icon.

The same artwork is emitted for every target so the Python (Windows/Tk) app and
both Flutter projects display an identical icon:

  * dought_icon.png / dought_icon.ico            -> Python app (tasksnap)
  * dought/assets/icon/icon.png                  -> Flutter (flutter_launcher_icons)
  * dought/windows/runner/resources/app_icon.ico -> Flutter Windows runner
  * ../flutters/dought/assets/icon/write.png     -> Flutter (flutter_launcher_icons)
  * ../flutters/dought/windows/.../app_icon.ico  -> Flutter Windows runner
"""

import math
from pathlib import Path

from PIL import Image, ImageDraw

# Catppuccin-inspired gradient used across the dought UI.
COLOR_TOP = (243, 139, 168)      # Pink   #f38ba8
COLOR_BOTTOM = (166, 147, 200)   # Purple #a69bc8

BASE = 256                       # Reference design size
MASTER = 1024                    # Rendered PNG size
ICO_SIZES = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]


def _mix(color_a, color_b, ratio):
    return tuple(int(a + (b - a) * ratio) for a, b in zip(color_a, color_b))


def draw_icon(size):
    """Render the notepad + pencil logo at ``size`` x ``size`` pixels."""
    k = size / BASE
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad_x, pad_y = 30 * k, 30 * k
    pad_w, pad_h = 160 * k, 200 * k

    # Gradient notepad body.
    for i in range(int(pad_h)):
        ratio = i / pad_h
        draw.rectangle(
            [pad_x, pad_y + i, pad_x + pad_w, pad_y + i + 1],
            fill=_mix(COLOR_TOP, COLOR_BOTTOM, ratio),
        )

    # Dark notepad interior.
    inner = 20 * k
    draw.rectangle(
        [pad_x + inner, pad_y + inner, pad_x + pad_w - inner, pad_y + pad_h - inner],
        fill=(0, 0, 0, 255),
    )

    # Text lines.
    line_color = (166, 147, 200)
    line_x0 = pad_x + inner + 15 * k
    line_x1 = pad_x + pad_w - inner - 15 * k
    line_y0 = pad_y + inner + 20 * k
    for i in range(4):
        y = line_y0 + i * 25 * k
        draw.rounded_rectangle([line_x0, y, line_x1, y + 12 * k], radius=6 * k, fill=line_color)

    # Diagonal pencil.
    rad = math.radians(45)
    p1 = (140 * k, 20 * k)
    length = 140 * k
    p2 = (p1[0] + length * math.cos(rad), p1[1] + length * math.sin(rad))
    pencil_w = max(1, int(35 * k))
    stroke = max(1, int(2 * k))

    for offset in range(pencil_w):
        xo = offset * math.sin(rad)
        yo = offset * math.cos(rad)
        ratio = offset / pencil_w
        draw.line(
            [(p1[0] + xo, p1[1] - yo), (p2[0] + xo, p2[1] - yo)],
            fill=_mix(COLOR_TOP, COLOR_BOTTOM, ratio),
            width=stroke,
        )

    # Darker pencil tip.
    tip = 25 * k
    t2 = (p2[0] + tip * math.cos(rad), p2[1] + tip * math.sin(rad))
    for offset in range(pencil_w):
        xo = offset * math.sin(rad)
        yo = offset * math.cos(rad)
        draw.line(
            [(p2[0] + xo, p2[1] - yo), (t2[0] + xo, t2[1] - yo)],
            fill=(80, 60, 100),
            width=stroke,
        )

    return img


def _save_png(img, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, 'PNG')
    print(f"  PNG -> {path}")


def _save_ico(img, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, format='ICO', sizes=ICO_SIZES)
    print(f"  ICO -> {path}")


def main():
    here = Path(__file__).resolve().parent          # .../windoes/tasksnap
    root = here.parents[1]                          # .../alif

    icon = draw_icon(MASTER)

    print("Generating shared dought icon...")
    # Python desktop app.
    _save_png(icon, here / 'dought_icon.png')
    _save_ico(icon, here / 'dought_icon.ico')

    # Flutter: windoes/tasksnap/dought
    ts = here / 'dought'
    _save_png(icon, ts / 'assets' / 'icon' / 'icon.png')
    _save_ico(icon, ts / 'windows' / 'runner' / 'resources' / 'app_icon.ico')

    # Flutter: flutters/dought
    fl = root / 'flutters' / 'dought'
    _save_png(icon, fl / 'assets' / 'icon' / 'write.png')
    _save_ico(icon, fl / 'windows' / 'runner' / 'resources' / 'app_icon.ico')

    print("Done.")


if __name__ == '__main__':
    main()
