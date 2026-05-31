from PIL import Image, ImageDraw
import math

# Create 1024x1024 image
size = 1024
img = Image.new('RGB', (size, size), color='#7c3aed')
draw = ImageDraw.Draw(img)

# Define colors
bg_color = (124, 58, 237)  # #7c3aed
node_color = (233, 213, 255)  # #e9d5ff
line_color = (255, 255, 255)  # white
center_color = (167, 139, 250)  # #a78bfa

# Draw connection lines first (so they appear behind nodes)
center = (512, 512)
nodes = [
    (512, 280, 60),   # top
    (512, 744, 60),   # bottom
    (280, 512, 60),   # left
    (744, 512, 60),   # right
    (340, 340, 50),   # top-left
    (684, 340, 50),   # top-right
    (340, 684, 50),   # bottom-left
    (684, 684, 50),   # bottom-right
]

# Draw lines from center to all nodes
for x, y, r in nodes:
    draw.line([center, (x, y)], fill=line_color, width=12)

# Draw nodes
for x, y, r in nodes:
    # Outer circle (border)
    draw.ellipse([x-r-4, y-r-4, x+r+4, y+r+4], fill=line_color)
    # Inner circle
    draw.ellipse([x-r, y-r, x+r, y+r], fill=node_color)

# Draw central node
cx, cy = center
r = 80
# Outer circle (border)
draw.ellipse([cx-r-4, cy-r-4, cx+r+4, cy+r+4], fill=line_color)
# Inner circle
draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=node_color)
# Center highlight
r2 = 40
draw.ellipse([cx-r2, cy-r2, cx+r2, cy+r2], fill=center_color)

# Save as PNG
img.save('nexus_flutter/assets/icon.png')
print('Icon created: nexus_flutter/assets/icon.png')

# Create smaller version for Windows ICO (256x256)
img_small = img.resize((256, 256), Image.Resampling.LANCZOS)
img_small.save('Nexus/icon.ico', format='ICO', sizes=[(256, 256)])
print('Icon created: Nexus/icon.ico')
