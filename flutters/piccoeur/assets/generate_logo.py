from PIL import Image, ImageDraw, ImageFont
import os

size = 1024
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Yellow circle background
draw.ellipse([30, 30, size - 30, size - 30], fill=(255, 193, 7, 255))

# Simplified taxi body
cx, cy = size // 2, size // 2
car_w, car_h = 500, 240

# Car body (rounded rectangle)
draw.rounded_rectangle(
    [cx - car_w // 2, cy - car_h // 4, cx + car_w // 2, cy + car_h // 2],
    radius=40, fill=(33, 33, 33, 255)
)

# Car roof / cabin
roof_w, roof_h = 280, 160
draw.rounded_rectangle(
    [cx - roof_w // 2, cy - car_h // 4 - roof_h + 20, cx + roof_w // 2, cy - car_h // 4 + 10],
    radius=30, fill=(33, 33, 33, 255)
)

# Windows (lighter)
win_w, win_h = 120, 80
win_y = cy - car_h // 4 - roof_h + 30
draw.rounded_rectangle(
    [cx - roof_w // 2 + 20, win_y, cx - 10, win_y + win_h],
    radius=15, fill=(200, 220, 240, 255)
)
draw.rounded_rectangle(
    [cx + 10, win_y, cx + roof_w // 2 - 20, win_y + win_h],
    radius=15, fill=(200, 220, 240, 255)
)

# Wheels
wheel_r = 50
draw.ellipse([cx - 150 - wheel_r, cy + car_h // 2 - wheel_r, cx - 150 + wheel_r, cy + car_h // 2 + wheel_r], fill=(50, 50, 50, 255))
draw.ellipse([cx + 150 - wheel_r, cy + car_h // 2 - wheel_r, cx + 150 + wheel_r, cy + car_h // 2 + wheel_r], fill=(50, 50, 50, 255))

# Headlights
draw.ellipse([cx + car_w // 2 - 35, cy - 20, cx + car_w // 2 - 5, cy + 20], fill=(255, 255, 200, 255))
draw.ellipse([cx - car_w // 2 + 5, cy - 20, cx - car_w // 2 + 35, cy + 20], fill=(255, 100, 100, 255))

os.makedirs('assets', exist_ok=True)
img.save('assets/icon.png')
print('Logo generated: assets/icon.png')
