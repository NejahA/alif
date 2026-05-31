#!/usr/bin/env python3
"""
Generate conVeys app icon - Clean V Design
Creates a symmetric icon with interlocking circles and a V
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_gradient_background(size):
    """Create a blue gradient background"""
    img = Image.new('RGB', (size, size))
    draw = ImageDraw.Draw(img)
    
    # Blue gradient colors
    color1 = (33, 150, 243)  # #2196F3
    color2 = (25, 118, 210)  # #1976D2
    
    for y in range(size):
        ratio = y / size
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
        draw.line([(0, y), (size, y)], fill=(r, g, b))
    
    return img

def create_icon(size=1024):
    """Create the app icon with V and interlocking circles"""
    # Create gradient background
    img = create_gradient_background(size)
    draw = ImageDraw.Draw(img)
    
    center_x = size // 2
    center_y = size // 2
    
    # Draw interlocking circles
    circle_radius = 200
    offset = 160
    line_width = 12
    
    # Left circle
    left_x = center_x - offset
    draw.ellipse(
        [left_x - circle_radius, center_y - circle_radius,
         left_x + circle_radius, center_y + circle_radius],
        outline=(255, 255, 255, 255),
        width=line_width
    )
    
    # Right circle
    right_x = center_x + offset
    draw.ellipse(
        [right_x - circle_radius, center_y - circle_radius,
         right_x + circle_radius, center_y + circle_radius],
        outline=(255, 255, 255, 255),
        width=line_width
    )
    
    # Draw decorative dots at cardinal points
    dot_radius = 25
    
    # Top dot
    draw.ellipse(
        [center_x - dot_radius, center_y - circle_radius - offset//2 - dot_radius,
         center_x + dot_radius, center_y - circle_radius - offset//2 + dot_radius],
        fill=(255, 255, 255, 255)
    )
    
    # Bottom dot
    draw.ellipse(
        [center_x - dot_radius, center_y + circle_radius + offset//2 - dot_radius,
         center_x + dot_radius, center_y + circle_radius + offset//2 + dot_radius],
        fill=(255, 255, 255, 255)
    )
    
    # Draw large "V" in the center
    try:
        font_size = 380
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("arialbd.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    text = "V"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    text_x = center_x - text_width // 2
    text_y = center_y - text_height // 2 - 20
    
    # Draw V with shadow for depth
    shadow_offset = 6
    draw.text((text_x + shadow_offset, text_y + shadow_offset), text, 
              fill=(0, 0, 0, 80), font=font)
    draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)
    
    return img

def create_foreground(size=1024):
    """Create foreground icon for Android adaptive icon"""
    # Transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center_x = size // 2
    center_y = size // 2
    
    # Adjust for safe zone
    circle_radius = 180
    offset = 140
    line_width = 10
    
    # Left circle
    left_x = center_x - offset
    draw.ellipse(
        [left_x - circle_radius, center_y - circle_radius,
         left_x + circle_radius, center_y + circle_radius],
        outline=(255, 255, 255, 255),
        width=line_width
    )
    
    # Right circle
    right_x = center_x + offset
    draw.ellipse(
        [right_x - circle_radius, center_y - circle_radius,
         right_x + circle_radius, center_y + circle_radius],
        outline=(255, 255, 255, 255),
        width=line_width
    )
    
    # Draw V
    try:
        font_size = 340
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "V"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    text_x = center_x - text_width // 2
    text_y = center_y - text_height // 2 - 20
    
    draw.text((text_x, text_y), text, fill=(255, 255, 255, 255), font=font)
    
    # Dots
    dot_radius = 22
    
    # Top dot
    draw.ellipse(
        [center_x - dot_radius, center_y - circle_radius - offset//2 - dot_radius,
         center_x + dot_radius, center_y - circle_radius - offset//2 + dot_radius],
        fill=(255, 255, 255, 255)
    )
    
    # Bottom dot
    draw.ellipse(
        [center_x - dot_radius, center_y + circle_radius + offset//2 - dot_radius,
         center_x + dot_radius, center_y + circle_radius + offset//2 + dot_radius],
        fill=(255, 255, 255, 255)
    )
    
    return img

if __name__ == "__main__":
    print("Generating conVeys app icon (Clean V Design)...")
    
    # Create output directory
    os.makedirs("assets/icon", exist_ok=True)
    
    # Generate main icon
    print("Creating main icon (1024x1024)...")
    icon = create_icon(1024)
    icon.save("assets/icon/app_icon.png", "PNG")
    print("✓ Saved: assets/icon/app_icon.png")
    
    # Generate foreground for adaptive icon
    print("Creating foreground icon (1024x1024)...")
    foreground = create_foreground(1024)
    foreground.save("assets/icon/app_icon_foreground.png", "PNG")
    print("✓ Saved: assets/icon/app_icon_foreground.png")
    
    print("\n✅ Clean V icon generated successfully!")
    print("\nDesign features:")
    print("     ●")
    print("   ○   ○")
    print("   │ V │  ← Interlocking circles with V")
    print("   ○   ○")
    print("     ●")
    print("\nNext steps:")
    print("1. Run: flutter pub run flutter_launcher_icons")
    print("2. Run: flutter build apk --release")
    print("\nYour app will have the exact icon you wanted! 🎉")
