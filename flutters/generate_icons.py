#!/usr/bin/env python3
"""Generate PNG icons from SVG files for Flutter apps"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    def create_chronokey_icon(output_path, size=1024):
        """Create Chronokey icon - Time capsule with clock"""
        img = Image.new('RGBA', (size, size), (26, 26, 46, 255))
        draw = ImageDraw.Draw(img)
        
        # Lock body
        lock_x, lock_y = size//2 - size//6, size//2 + size//20
        lock_w, lock_h = size//3, size//3
        draw.rounded_rectangle(
            [(lock_x, lock_y), (lock_x + lock_w, lock_y + lock_h)],
            radius=size//25, fill=(102, 126, 234, 255)
        )
        
        # Inner lock
        inner_margin = size//40
        draw.rounded_rectangle(
            [(lock_x + inner_margin, lock_y + inner_margin), 
             (lock_x + lock_w - inner_margin, lock_y + lock_h - inner_margin)],
            radius=size//50, fill=(45, 53, 97, 255)
        )
        
        # Keyhole
        keyhole_x, keyhole_y = size//2, lock_y + lock_h//3
        draw.ellipse(
            [(keyhole_x - size//40, keyhole_y - size//40),
             (keyhole_x + size//40, keyhole_y + size//40)],
            fill=(102, 126, 234, 255)
        )
        draw.rectangle(
            [(keyhole_x - size//80, keyhole_y),
             (keyhole_x + size//80, keyhole_y + size//20)],
            fill=(102, 126, 234, 255)
        )
        
        # Lock shackle
        shackle_y = lock_y - size//8
        shackle_r = size//8
        draw.arc(
            [(size//2 - shackle_r, shackle_y - shackle_r),
             (size//2 + shackle_r, shackle_y + shackle_r)],
            start=180, end=0, fill=(102, 126, 234, 255), width=size//40
        )
        
        # Clock face
        clock_y = shackle_y - size//20
        clock_r = size//12
        draw.ellipse(
            [(size//2 - clock_r, clock_y - clock_r),
             (size//2 + clock_r, clock_y + clock_r)],
            fill=(45, 53, 97, 255), outline=(102, 126, 234, 255), width=size//200
        )
        
        # Clock hands
        draw.line([(size//2, clock_y), (size//2, clock_y - clock_r//2)],
                  fill=(0, 242, 254, 255), width=size//200)
        draw.line([(size//2, clock_y), (size//2 + clock_r//2, clock_y)],
                  fill=(0, 242, 254, 255), width=size//250)
        
        # Clock center
        draw.ellipse(
            [(size//2 - size//150, clock_y - size//150),
             (size//2 + size//150, clock_y + size//150)],
            fill=(0, 242, 254, 255)
        )
        
        img.save(output_path, 'PNG')
        print(f"Created {output_path}")
    
    def create_autopixel_icon(output_path, size=1024):
        """Create AutoPixel icon - Retro camera with map pin"""
        img = Image.new('RGBA', (size, size), (26, 26, 46, 255))
        draw = ImageDraw.Draw(img)
        
        # Camera body
        cam_x, cam_y = size//4, size//2 - size//12
        cam_w, cam_h = size//2, size//3
        draw.rounded_rectangle(
            [(cam_x, cam_y), (cam_x + cam_w, cam_y + cam_h)],
            radius=size//40, fill=(0, 255, 136, 255)
        )
        
        # Inner camera
        inner_margin = size//50
        draw.rounded_rectangle(
            [(cam_x + inner_margin, cam_y + inner_margin),
             (cam_x + cam_w - inner_margin, cam_y + cam_h - inner_margin)],
            radius=size//80, fill=(15, 52, 96, 255)
        )
        
        # Lens
        lens_x, lens_y = size//2, cam_y + cam_h//2
        lens_r = size//12
        draw.ellipse(
            [(lens_x - lens_r, lens_y - lens_r),
             (lens_x + lens_r, lens_y + lens_r)],
            fill=(0, 255, 136, 255)
        )
        draw.ellipse(
            [(lens_x - lens_r*3//4, lens_y - lens_r*3//4),
             (lens_x + lens_r*3//4, lens_y + lens_r*3//4)],
            fill=(26, 26, 46, 255)
        )
        draw.ellipse(
            [(lens_x - lens_r//2, lens_y - lens_r//2),
             (lens_x + lens_r//2, lens_y + lens_r//2)],
            fill=(0, 255, 136, 128)
        )
        
        # Flash
        flash_x = cam_x + cam_w - size//15
        flash_y = cam_y + size//40
        draw.rounded_rectangle(
            [(flash_x, flash_y), (flash_x + size//25, flash_y + size//25)],
            radius=size//200, fill=(255, 235, 59, 255)
        )
        
        # Map pin
        pin_x, pin_y = size*3//4, size//4
        pin_w, pin_h = size//8, size//6
        # Pin body
        points = [
            (pin_x, pin_y),
            (pin_x, pin_y + pin_h),
            (pin_x + pin_w//2, pin_y + pin_h + pin_w//2),
            (pin_x + pin_w, pin_y + pin_h),
            (pin_x + pin_w, pin_y)
        ]
        draw.polygon(points, fill=(255, 71, 87, 255), outline=(255, 255, 255, 255), width=size//200)
        
        # Pin circle
        draw.ellipse(
            [(pin_x + pin_w//4, pin_y + pin_h//4),
             (pin_x + pin_w*3//4, pin_y + pin_h*3//4)],
            fill=(255, 255, 255, 255)
        )
        
        # Pixel details
        pixel_size = size//50
        draw.rectangle(
            [(cam_x + size//20, cam_y + cam_h - size//15),
             (cam_x + size//20 + pixel_size, cam_y + cam_h - size//15 + pixel_size)],
            fill=(0, 255, 136, 255)
        )
        draw.rectangle(
            [(cam_x + cam_w - size//15, cam_y + cam_h - size//15),
             (cam_x + cam_w - size//15 + pixel_size, cam_y + cam_h - size//15 + pixel_size)],
            fill=(0, 255, 136, 255)
        )
        
        img.save(output_path, 'PNG')
        print(f"Created {output_path}")
    
    def create_chronokey_temp_icon(output_path, size=1024):
        """Create Chronokey Temp icon - Similar to chronokey but different colors"""
        img = Image.new('RGBA', (size, size), (26, 26, 46, 255))
        draw = ImageDraw.Draw(img)
        
        # Lock body
        lock_x, lock_y = size//2 - size//6, size//2 + size//20
        lock_w, lock_h = size//3, size//3
        draw.rounded_rectangle(
            [(lock_x, lock_y), (lock_x + lock_w, lock_y + lock_h)],
            radius=size//25, fill=(240, 147, 251, 255)
        )
        
        # Inner lock
        inner_margin = size//40
        draw.rounded_rectangle(
            [(lock_x + inner_margin, lock_y + inner_margin), 
             (lock_x + lock_w - inner_margin, lock_y + lock_h - inner_margin)],
            radius=size//50, fill=(45, 53, 97, 255)
        )
        
        # Keyhole
        keyhole_x, keyhole_y = size//2, lock_y + lock_h//3
        draw.ellipse(
            [(keyhole_x - size//40, keyhole_y - size//40),
             (keyhole_x + size//40, keyhole_y + size//40)],
            fill=(240, 147, 251, 255)
        )
        draw.rectangle(
            [(keyhole_x - size//80, keyhole_y),
             (keyhole_x + size//80, keyhole_y + size//20)],
            fill=(240, 147, 251, 255)
        )
        
        # Lock shackle
        shackle_y = lock_y - size//8
        shackle_r = size//8
        draw.arc(
            [(size//2 - shackle_r, shackle_y - shackle_r),
             (size//2 + shackle_r, shackle_y + shackle_r)],
            start=180, end=0, fill=(240, 147, 251, 255), width=size//40
        )
        
        # Clock face
        clock_y = shackle_y - size//20
        clock_r = size//12
        draw.ellipse(
            [(size//2 - clock_r, clock_y - clock_r),
             (size//2 + clock_r, clock_y + clock_r)],
            fill=(45, 53, 97, 255), outline=(240, 147, 251, 255), width=size//200
        )
        
        # Clock hands
        draw.line([(size//2, clock_y), (size//2, clock_y - clock_r//2)],
                  fill=(255, 215, 0, 255), width=size//200)
        draw.line([(size//2, clock_y), (size//2 + clock_r//2, clock_y)],
                  fill=(255, 215, 0, 255), width=size//250)
        
        # Clock center
        draw.ellipse(
            [(size//2 - size//150, clock_y - size//150),
             (size//2 + size//150, clock_y + size//150)],
            fill=(255, 215, 0, 255)
        )
        
        img.save(output_path, 'PNG')
        print(f"Created {output_path}")
    
    # Generate icons
    print("Generating Flutter app icons...")
    create_chronokey_icon('chronokey/icon.png')
    create_autopixel_icon('autopixel/icon.png')
    create_chronokey_temp_icon('chronokey_temp/icon.png')
    print("\nAll icons generated successfully!")
    
except ImportError:
    print("Error: Pillow library not found. Installing...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'pillow'])
    print("Please run this script again.")
