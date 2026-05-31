from PIL import Image, ImageDraw, ImageFont
import os
from arabic_reshaper import reshape
from bidi.algorithm import get_display

# Create icons directory
os.makedirs('android/app/src/main/res/mipmap-hdpi', exist_ok=True)
os.makedirs('android/app/src/main/res/mipmap-mdpi', exist_ok=True)
os.makedirs('android/app/src/main/res/mipmap-xhdpi', exist_ok=True)
os.makedirs('android/app/src/main/res/mipmap-xxhdpi', exist_ok=True)
os.makedirs('android/app/src/main/res/mipmap-xxxhdpi', exist_ok=True)

def create_icon(size, output_path):
    # Create image with gradient background
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw gradient background (purple to blue)
    for y in range(size):
        r = int(107 + (100 - 107) * y / size)
        g = int(78 + (149 - 78) * y / size)
        b = int(255 + (237 - 255) * y / size)
        draw.rectangle([(0, y), (size, y+1)], fill=(r, g, b))
    
    # Draw rounded rectangle for modern look
    margin = size // 8
    draw.rounded_rectangle(
        [(margin, margin), (size-margin, size-margin)],
        radius=size//6,
        fill=(255, 255, 255, 230)
    )
    
    # Draw Arabic text "كن" in the center
    try:
        # Try to use a nice font, fallback to default
        font_size = size // 2
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    # Properly reshape and display Arabic text
    text = "كن"
    try:
        reshaped_text = reshape(text)
        bidi_text = get_display(reshaped_text)
    except:
        # Fallback if arabic_reshaper not available
        bidi_text = text
    
    # Get text bounding box
    bbox = draw.textbbox((0, 0), bidi_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - size // 20
    
    # Draw text with shadow
    shadow_offset = size // 40
    draw.text((x + shadow_offset, y + shadow_offset), bidi_text, fill=(107, 78, 255, 100), font=font)
    draw.text((x, y), bidi_text, fill=(107, 78, 255), font=font)
    
    # Draw small pen icon at bottom
    pen_size = size // 8
    pen_x = size - margin - pen_size
    pen_y = size - margin - pen_size
    
    # Simple pen shape
    draw.ellipse(
        [(pen_x, pen_y), (pen_x + pen_size, pen_y + pen_size)],
        fill=(107, 78, 255)
    )
    
    # Save
    img.save(output_path, 'PNG')
    print(f"Created: {output_path}")

# Create icons for different densities
sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

for folder, size in sizes.items():
    output_path = f'android/app/src/main/res/{folder}/ic_launcher.png'
    create_icon(size, output_path)

print("\n✅ All icons created successfully!")
print("Now rebuild the APK with: flutter build apk --release")
