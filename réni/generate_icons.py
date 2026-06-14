from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, path):
    """Create a simple gradient icon with the letter 'R'."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw rounded rectangle background
    radius = size // 4
    # Gradient colors: #667eea to #764ba2
    r1, g1, b1 = 102, 126, 234
    r2, g2, b2 = 118, 75, 162

    for y in range(size):
        ratio = y / size
        r = int(r1 + (r2 - r1) * ratio)
        g = int(g1 + (g2 - g1) * ratio)
        b = int(b1 + (b2 - b1) * ratio)

        for x in range(size):
            # Simple rounded rect check
            if (x >= radius and x < size - radius) or (y >= radius and y < size - radius):
                if (x >= 0 and x < size) and (y >= 0 and y < size):
                    draw.point((x, y), fill=(r, g, b, 255))
            elif ((x - radius) ** 2 + (y - radius) ** 2 <= radius ** 2) or \
                 ((x - (size - radius - 1)) ** 2 + (y - radius) ** 2 <= radius ** 2) or \
                 ((x - radius) ** 2 + (y - (size - radius - 1)) ** 2 <= radius ** 2) or \
                 ((x - (size - radius - 1)) ** 2 + (y - (size - radius - 1)) ** 2 <= radius ** 2):
                draw.point((x, y), fill=(r, g, b, 255))

    # Draw letter 'R' in white
    font_size = size // 2
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()

    text = "R"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (size - text_w) // 2
    y = (size - text_h) // 2 - 1
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)

    img.save(path, 'PNG')
    print(f"Created {path} ({size}x{size})")

def main():
    icons_dir = os.path.join(os.path.dirname(__file__), 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    sizes = [16, 48, 128]
    for size in sizes:
        path = os.path.join(icons_dir, f'icon{size}.png')
        create_icon(size, path)

if __name__ == '__main__':
    main()