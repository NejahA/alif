from PIL import Image, ImageDraw

# Create a 256x256 icon with the gradient pink-purple notepad and pencil design
size = 256
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Define gradient colors (pink to purple)
color_top = (243, 139, 168)  # Pink
color_bottom = (166, 147, 200)  # Purple

# Draw notepad outline (rounded rectangle)
pad_margin = 30
pad_width = 160
pad_height = 200
pad_x = pad_margin
pad_y = pad_margin

# Draw notepad with gradient effect
for i in range(pad_height):
    ratio = i / pad_height
    r = int(color_top[0] + (color_bottom[0] - color_top[0]) * ratio)
    g = int(color_top[1] + (color_bottom[1] - color_top[1]) * ratio)
    b = int(color_top[2] + (color_bottom[2] - color_top[2]) * ratio)
    color = (r, g, b)
    draw.rectangle([pad_x, pad_y + i, pad_x + pad_width, pad_y + i + 1], fill=color, width=0)

# Draw inner black rectangle (notepad interior)
inner_margin = 20
draw.rectangle([
    pad_x + inner_margin, 
    pad_y + inner_margin,
    pad_x + pad_width - inner_margin,
    pad_y + pad_height - inner_margin
], fill=(0, 0, 0, 255))

# Draw lines inside notepad
line_color = (166, 147, 200)
line_x_start = pad_x + inner_margin + 15
line_x_end = pad_x + pad_width - inner_margin - 15
line_y_start = pad_y + inner_margin + 20
line_spacing = 25

for i in range(4):
    y = line_y_start + (i * line_spacing)
    draw.rounded_rectangle([line_x_start, y, line_x_end, y + 12], radius=6, fill=line_color)

# Draw pencil (diagonal, top-right)
pencil_width = 35
pencil_length = 140
pencil_x = 140
pencil_y = 20

# Pencil body (rotated)
import math
angle = 45  # degrees
rad = math.radians(angle)

# Pencil points
p1 = (pencil_x, pencil_y)
p2 = (pencil_x + pencil_length * math.cos(rad), pencil_y + pencil_length * math.sin(rad))

# Draw thick pencil line with gradient
for offset in range(pencil_width):
    x_off = offset * math.sin(rad)
    y_off = offset * math.cos(rad)
    
    ratio = offset / pencil_width
    r = int(color_top[0] + (color_bottom[0] - color_top[0]) * ratio)
    g = int(color_top[1] + (color_bottom[1] - color_top[1]) * ratio)
    b = int(color_top[2] + (color_bottom[2] - color_top[2]) * ratio)
    
    draw.line([
        (p1[0] + x_off, p1[1] - y_off),
        (p2[0] + x_off, p2[1] - y_off)
    ], fill=(r, g, b), width=2)

# Draw pencil tip (darker)
tip_length = 25
tip_x = p2[0]
tip_y = p2[1]
tip_end_x = tip_x + tip_length * math.cos(rad)
tip_end_y = tip_y + tip_length * math.sin(rad)

for offset in range(pencil_width):
    x_off = offset * math.sin(rad)
    y_off = offset * math.cos(rad)
    
    draw.line([
        (tip_x + x_off, tip_y - y_off),
        (tip_end_x + x_off, tip_end_y - y_off)
    ], fill=(80, 60, 100), width=2)

# Save as PNG and ICO
img.save('dought_icon.png', 'PNG')
img.save('dought_icon.ico', 'ICO')
print("Icon created successfully!")
