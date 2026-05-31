from PIL import Image
import os

# Convert ICO to PNG
ico_path = 'dought_icon.ico'
output_path = 'dought/android_icon.png'

print(f"Converting {ico_path} to PNG...")
img = Image.open(ico_path)

# Get the largest size from the ICO
if hasattr(img, 'size'):
    # Save as 1024x1024 for Android (adaptive icon requirement)
    img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    img.save(output_path, 'PNG')
    print(f"✓ Saved icon to {output_path}")
    print(f"  Size: {img.size}")
else:
    print("Error: Could not read icon")
