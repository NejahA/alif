from PIL import Image

# Load the base icon
base_icon = Image.open('icon.png')

# Android launcher icon sizes
sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

for folder, size in sizes.items():
    # Resize the icon
    resized = base_icon.resize((size, size), Image.Resampling.LANCZOS)
    
    # Save to the appropriate folder
    output_path = f'android/app/src/main/res/{folder}/ic_launcher.png'
    resized.save(output_path, 'PNG')
    print(f'Created {output_path}')

print('\nAll Android launcher icons created successfully!')
