from PIL import Image, ImageDraw
import math

# Create a 256x256 image for the icon
size = 256
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Background - dark blue gradient circle
center = size // 2
for r in range(center, 0, -1):
    alpha = int(255 * (r / center))
    color_val = int(26 + (74 - 26) * (1 - r / center))
    draw.ellipse([center - r, center - r, center + r, center + r], 
                 fill=(color_val, color_val + 20, color_val + 40, alpha))

# Outer glow ring
for thickness in range(8, 0, -1):
    alpha = int(100 * (thickness / 8))
    draw.ellipse([20 - thickness, 20 - thickness, 
                  size - 20 + thickness, size - 20 + thickness],
                 outline=(74, 158, 255, alpha), width=2)

# Main materia orb - cyan/blue gradient
for r in range(90, 0, -1):
    ratio = r / 90
    # Radial gradient from cyan to dark blue
    red = int(74 + (255 - 74) * (1 - ratio))
    green = int(158 + (255 - 158) * (1 - ratio) * 0.7)
    blue = 255
    alpha = 255
    draw.ellipse([center - r, center - r, center + r, center + r],
                 fill=(red, green, blue, alpha))

# Highlight/shine effect
shine_offset_x = -25
shine_offset_y = -25
for r in range(35, 0, -1):
    alpha = int(200 * (1 - r / 35))
    draw.ellipse([center + shine_offset_x - r, center + shine_offset_y - r,
                  center + shine_offset_x + r, center + shine_offset_y + r],
                 fill=(255, 255, 255, alpha))

# Inner glow
for thickness in range(6, 0, -1):
    alpha = int(150 * (thickness / 6))
    draw.ellipse([center - 92 - thickness, center - 92 - thickness,
                  center + 92 + thickness, center + 92 + thickness],
                 outline=(74, 255, 255, alpha), width=2)

# Save as PNG first
img.save('icon.png', 'PNG')
print("Created icon.png")

# Create multiple sizes for ICO
sizes = [256, 128, 64, 48, 32, 16]
images = []
for s in sizes:
    resized = img.resize((s, s), Image.Resampling.LANCZOS)
    images.append(resized)

# Save as ICO
img.save('app_icon.ico', format='ICO', sizes=[(s, s) for s in sizes])
print("Created app_icon.ico with multiple sizes")
