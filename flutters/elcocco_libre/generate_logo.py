from PIL import Image, ImageDraw, ImageFilter
import math
import os

def create_eye_of_providence(size=1024):
    """Generate an Eye of Providence (All-Seeing Eye) logo image."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    center = (size // 2, size // 2)
    radius = size // 2 - 20

    # Colors
    gold = (255, 193, 7, 255)
    gold_dark = (255, 160, 0, 255)
    gold_dim = (255, 193, 7, 30)
    bg_dark = (15, 15, 26, 255)
    white_translucent = (255, 255, 255, 100)

    # --- Outer glow ring ---
    for r in range(int(radius * 1.05), int(radius * 1.15)):
        alpha = max(0, int(15 * (1 - (r - radius * 1.05) / (radius * 0.1))))
        draw.ellipse(
            [center[0] - r, center[1] - r, center[0] + r, center[1] + r],
            outline=(255, 193, 7, alpha), width=1
        )

    # --- Triangle ---
    triangle_radius = radius * 0.75
    points = []
    for i in range(3):
        angle = (i * 2 * math.pi / 3) - math.pi / 2
        px = center[0] + triangle_radius * math.cos(angle)
        py = center[1] + triangle_radius * math.sin(angle)
        points.append((px, py))

    draw.polygon(points, fill=gold_dim)
    for w in range(3, 8, 2):
        draw.polygon(points, outline=gold, width=w)

    glow_points = []
    glow_radius = triangle_radius * 1.02
    for i in range(3):
        angle = (i * 2 * math.pi / 3) - math.pi / 2
        px = center[0] + glow_radius * math.cos(angle)
        py = center[1] + glow_radius * math.sin(angle)
        glow_points.append((px, py))
    draw.polygon(glow_points, outline=gold_dark, width=6)

    # --- Eye circle ---
    eye_radius = radius * 0.28
    draw.ellipse(
        [center[0] - eye_radius, center[1] - eye_radius,
         center[0] + eye_radius, center[1] + eye_radius],
        fill=gold_dim, outline=gold, width=3
    )

    # Iris
    iris_radius = eye_radius * 0.5
    draw.ellipse(
        [center[0] - iris_radius, center[1] - iris_radius,
         center[0] + iris_radius, center[1] + iris_radius],
        fill=gold, width=0
    )

    # Pupil
    pupil_radius = eye_radius * 0.22
    draw.ellipse(
        [center[0] - pupil_radius, center[1] - pupil_radius,
         center[0] + pupil_radius, center[1] + pupil_radius],
        fill=bg_dark, width=0
    )

    # Pupil highlight
    highlight_r = eye_radius * 0.08
    highlight_pos = (center[0] - eye_radius * 0.1, center[1] - eye_radius * 0.1)
    draw.ellipse(
        [highlight_pos[0] - highlight_r, highlight_pos[1] - highlight_r,
         highlight_pos[0] + highlight_r, highlight_pos[1] + highlight_r],
        fill=white_translucent, width=0
    )

    # --- Rays ---
    for i in range(12):
        angle = i * 2 * math.pi / 12
        start_r = eye_radius + 5
        end_r = eye_radius + 22
        alpha_ray = int(80 * (1 - i / 12))
        x1 = center[0] + start_r * math.cos(angle)
        y1 = center[1] + start_r * math.sin(angle)
        x2 = center[0] + end_r * math.cos(angle)
        y2 = center[1] + end_r * math.sin(angle)
        draw.line([(x1, y1), (x2, y2)], fill=(255, 193, 7, alpha_ray), width=2)

    # --- Inner glow rings ---
    for r_offset in [18, 30]:
        r = eye_radius + r_offset
        draw.ellipse(
            [center[0] - r, center[1] - r, center[0] + r, center[1] + r],
            outline=(255, 193, 7, 20), width=1
        )

    # Apply gaussian blur for glow effect
    glow_layer = img.copy()
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=8))

    result = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    result.paste(glow_layer, (0, 0), glow_layer)
    result.paste(img, (0, 0), img)

    return result


def save_resized(img, path, size):
    """Resize and save the image."""
    resized = img.resize((size, size), Image.LANCZOS)
    # If saving to a non-RGBA context, composite onto dark background
    if path.endswith('.png'):
        resized.save(path, 'PNG')
    else:
        # Composite onto dark background for non-PNG
        bg = Image.new('RGBA', (size, size), (15, 15, 26, 255))
        bg.paste(resized, (0, 0), resized)
        bg.save(path, 'PNG')
    print(f"  Saved: {path} ({size}x{size})")


def main():
    print("Generating Eye of Providence logo...")

    # Generate the base 1024x1024 logo
    logo = create_eye_of_providence(1024)

    # Output directory
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # --- Web icons ---
    web_icons_dir = os.path.join(base_dir, 'web', 'icons')
    os.makedirs(web_icons_dir, exist_ok=True)

    web_sizes = {
        'favicon.png': 512,
        'Icon-192.png': 192,
        'Icon-512.png': 512,
        'Icon-maskable-192.png': 192,
        'Icon-maskable-512.png': 512,
    }
    print("\n[Web Icons]")
    for name, sz in web_sizes.items():
        save_resized(logo, os.path.join(web_icons_dir, name), sz)

    # Also save favicon at root web dir
    save_resized(logo, os.path.join(base_dir, 'web', 'favicon.png'), 512)

    # --- Android mipmap icons ---
    android_res_dir = os.path.join(base_dir, 'android', 'app', 'src', 'main', 'res')
    android_sizes = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
    }
    print("\n[Android Icons]")
    for folder, sz in android_sizes.items():
        path = os.path.join(android_res_dir, folder, 'ic_launcher.png')
        save_resized(logo, path, sz)

    # --- iOS AppIcon ---
    ios_assets_dir = os.path.join(base_dir, 'ios', 'Runner', 'Assets.xcassets', 'AppIcon.appiconset')
    os.makedirs(ios_assets_dir, exist_ok=True)

    # iOS icon sizes (from Contents.json typical sizes)
    ios_sizes = {
        'Icon-App-20x20@1x.png': 20,
        'Icon-App-20x20@2x.png': 40,
        'Icon-App-20x20@3x.png': 60,
        'Icon-App-29x29@1x.png': 29,
        'Icon-App-29x29@2x.png': 58,
        'Icon-App-29x29@3x.png': 87,
        'Icon-App-40x40@1x.png': 40,
        'Icon-App-40x40@2x.png': 80,
        'Icon-App-40x40@3x.png': 120,
        'Icon-App-60x60@2x.png': 120,
        'Icon-App-60x60@3x.png': 180,
        'Icon-App-76x76@1x.png': 76,
        'Icon-App-76x76@2x.png': 152,
        'Icon-App-83.5x83.5@2x.png': 167,
        'Icon-App-1024x1024@1x.png': 1024,
    }
    print("\n[iOS Icons]")
    for name, sz in ios_sizes.items():
        save_resized(logo, os.path.join(ios_assets_dir, name), sz)

    print("\n✅ All Eye of Providence logo icons generated successfully!")


if __name__ == '__main__':
    main()