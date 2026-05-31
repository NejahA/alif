#!/usr/bin/env python3
"""Generate PNG icons for all Flutter apps"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    import math
    
    def create_stardome_icon(output_path, size=1024):
        """Stardome - Space Exploration & Constellation Tracker"""
        img = Image.new('RGBA', (size, size), (10, 10, 30, 255))
        draw = ImageDraw.Draw(img)
        
        # Planet/dome
        center = size // 2
        planet_r = size // 3
        draw.ellipse(
            [(center - planet_r, center - planet_r),
             (center + planet_r, center + planet_r)],
            fill=(30, 30, 80, 255), outline=(100, 150, 255, 255), width=size//100
        )
        
        # Stars
        import random
        random.seed(42)
        for _ in range(50):
            x = random.randint(size//10, size*9//10)
            y = random.randint(size//10, size*9//10)
            star_size = random.randint(2, 6)
            draw.ellipse([(x, y), (x+star_size, y+star_size)], fill=(255, 255, 255, 200))
        
        # Constellation lines
        points = [(center-planet_r//2, center-planet_r//3), 
                  (center, center-planet_r//2),
                  (center+planet_r//2, center-planet_r//3),
                  (center+planet_r//3, center+planet_r//4)]
        for i in range(len(points)-1):
            draw.line([points[i], points[i+1]], fill=(100, 200, 255, 255), width=size//200)
        for p in points:
            draw.ellipse([(p[0]-size//80, p[1]-size//80), (p[0]+size//80, p[1]+size//80)], 
                        fill=(255, 255, 100, 255))
        
        # Telescope
        tel_x, tel_y = size*3//4, size*3//4
        draw.rectangle([(tel_x, tel_y), (tel_x+size//15, tel_y+size//8)], fill=(150, 150, 150, 255))
        draw.ellipse([(tel_x-size//60, tel_y-size//60), (tel_x+size//15+size//60, tel_y+size//60)], 
                    fill=(200, 200, 255, 255))
        
        img.save(output_path, 'PNG')
        print(f"✓ Created {output_path}")
    
    def create_shifter_icon(output_path, size=1024):
        """Shifter - Mood-Based Color Therapy"""
        img = Image.new('RGBA', (size, size), (20, 20, 30, 255))
        draw = ImageDraw.Draw(img)
        
        # Rainbow gradient circles
        colors = [(255, 0, 100), (255, 100, 0), (255, 200, 0), 
                  (0, 255, 100), (0, 150, 255), (150, 0, 255)]
        
        center = size // 2
        for i, color in enumerate(colors):
            angle = (i * 60) * math.pi / 180
            x = center + int(size // 4 * math.cos(angle))
            y = center + int(size // 4 * math.sin(angle))
            r = size // 8
            
            # Gradient effect with transparency
            for j in range(3):
                alpha = 150 - j * 30
                offset = j * size // 100
                draw.ellipse(
                    [(x - r + offset, y - r + offset), 
                     (x + r - offset, y + r - offset)],
                    fill=(*color, alpha)
                )
        
        # Center circle
        draw.ellipse(
            [(center - size//10, center - size//10),
             (center + size//10, center + size//10)],
            fill=(255, 255, 255, 200)
        )
        
        img.save(output_path, 'PNG')
        print(f"✓ Created {output_path}")
    
    def create_lumora_icon(output_path, size=1024):
        """Lumora - Smart Habit Tracker with Mood Lighting"""
        img = Image.new('RGBA', (size, size), (15, 15, 25, 255))
        draw = ImageDraw.Draw(img)
        
        # Glowing orbs in constellation pattern
        orbs = [
            (size//2, size//4, size//8, (255, 200, 100)),
            (size//3, size//2, size//10, (100, 200, 255)),
            (size*2//3, size//2, size//9, (255, 100, 200)),
            (size//2, size*3//4, size//11, (150, 255, 150))
        ]
        
        # Connection lines
        for i in range(len(orbs)-1):
            draw.line([orbs[i][:2], orbs[i+1][:2]], 
                     fill=(100, 100, 150, 100), width=size//200)
        
        # Draw orbs with glow
        for x, y, r, color in orbs:
            # Outer glow
            for j in range(3):
                alpha = 80 - j * 20
                offset = j * size // 80
                draw.ellipse(
                    [(x - r - offset, y - r - offset),
                     (x + r + offset, y + r + offset)],
                    fill=(*color, alpha)
                )
            # Core
            draw.ellipse([(x - r, y - r), (x + r, y + r)], fill=color)
            # Highlight
            draw.ellipse(
                [(x - r//3, y - r//3), (x + r//4, y + r//4)],
                fill=(255, 255, 255, 150)
            )
        
        img.save(output_path, 'PNG')
        print(f"✓ Created {output_path}")
    
    def create_mindamaze_icon(output_path, size=1024):
        """Mindamaze - 3D Brain Training Puzzle"""
        img = Image.new('RGBA', (size, size), (25, 15, 35, 255))
        draw = ImageDraw.Draw(img)
        
        # Isometric maze blocks
        center = size // 2
        block_size = size // 12
        
        # Brain-like maze pattern
        positions = [
            (0, 0), (1, 0), (2, 0),
            (0, 1), (2, 1),
            (0, 2), (1, 2), (2, 2),
            (1, 3), (0, 4), (2, 4)
        ]
        
        for px, py in positions:
            x = center + (px - 1) * block_size * 2
            y = center + (py - 2) * block_size * 2
            
            # Isometric cube
            # Top face
            top_points = [
                (x, y),
                (x + block_size, y - block_size//2),
                (x, y - block_size),
                (x - block_size, y - block_size//2)
            ]
            draw.polygon(top_points, fill=(150, 100, 255, 255))
            
            # Left face
            left_points = [
                (x, y),
                (x - block_size, y - block_size//2),
                (x - block_size, y + block_size),
                (x, y + block_size*3//2)
            ]
            draw.polygon(left_points, fill=(100, 70, 200, 255))
            
            # Right face
            right_points = [
                (x, y),
                (x + block_size, y - block_size//2),
                (x + block_size, y + block_size),
                (x, y + block_size*3//2)
            ]
            draw.polygon(right_points, fill=(120, 80, 220, 255))
        
        img.save(output_path, 'PNG')
        print(f"✓ Created {output_path}")
    
    def create_flowy_icon(output_path, size=1024):
        """Flowy - Pomodoro Timer with Ocean Themes"""
        img = Image.new('RGBA', (size, size), (10, 30, 50, 255))
        draw = ImageDraw.Draw(img)
        
        # Ocean waves
        wave_colors = [(20, 60, 100), (30, 80, 130), (40, 100, 160)]
        for i, color in enumerate(wave_colors):
            y_offset = size // 3 + i * size // 8
            # Wave curve
            points = []
            for x in range(0, size, size//20):
                y = y_offset + int(size//15 * math.sin(x * 4 * math.pi / size + i))
                points.append((x, y))
            points.append((size, size))
            points.append((0, size))
            draw.polygon(points, fill=color)
        
        # Timer circle (sun/moon)
        center = size // 2
        timer_y = size // 4
        timer_r = size // 6
        
        # Glow
        for j in range(3):
            alpha = 60 - j * 15
            offset = j * size // 60
            draw.ellipse(
                [(center - timer_r - offset, timer_y - timer_r - offset),
                 (center + timer_r + offset, timer_y + timer_r + offset)],
                fill=(255, 200, 100, alpha)
            )
        
        # Sun/moon
        draw.ellipse(
            [(center - timer_r, timer_y - timer_r),
             (center + timer_r, timer_y + timer_r)],
            fill=(255, 220, 120, 255)
        )
        
        # Timer segments
        for i in range(4):
            angle = i * 90 * math.pi / 180
            x1 = center + int(timer_r * 0.7 * math.cos(angle))
            y1 = timer_y + int(timer_r * 0.7 * math.sin(angle))
            x2 = center + int(timer_r * math.cos(angle))
            y2 = timer_y + int(timer_r * math.sin(angle))
            draw.line([(x1, y1), (x2, y2)], fill=(200, 150, 80, 255), width=size//150)
        
        img.save(output_path, 'PNG')
        print(f"✓ Created {output_path}")
    
    def create_waveme_icon(output_path, size=1024):
        """Waveme - Voice Journaling with AI"""
        img = Image.new('RGBA', (size, size), (20, 20, 35, 255))
        draw = ImageDraw.Draw(img)
        
        # Microphone
        center = size // 2
        mic_w, mic_h = size // 6, size // 4
        mic_x, mic_y = center - mic_w // 2, size // 3
        
        # Mic capsule
        draw.rounded_rectangle(
            [(mic_x, mic_y), (mic_x + mic_w, mic_y + mic_h)],
            radius=mic_w // 2, fill=(100, 200, 255, 255)
        )
        
        # Mic stand
        draw.rectangle(
            [(center - size//80, mic_y + mic_h), 
             (center + size//80, mic_y + mic_h + size//10)],
            fill=(150, 150, 180, 255)
        )
        draw.arc(
            [(center - size//12, mic_y + mic_h - size//20),
             (center + size//12, mic_y + mic_h + size//8)],
            start=0, end=180, fill=(150, 150, 180, 255), width=size//100
        )
        
        # Waveform
        wave_y = size * 2 // 3
        bars = 15
        for i in range(bars):
            x = size // 6 + i * (size * 2 // 3) // bars
            height = size // 20 + int(size // 8 * abs(math.sin(i * 0.8)))
            y_top = wave_y - height // 2
            
            # Gradient bars
            color_intensity = 150 + int(100 * abs(math.sin(i * 0.8)))
            draw.rectangle(
                [(x, y_top), (x + size // 40, y_top + height)],
                fill=(color_intensity, 100, 255, 255)
            )
        
        img.save(output_path, 'PNG')
        print(f"✓ Created {output_path}")
    
    def create_vaulter_icon(output_path, size=1024):
        """Vaulter - Password Manager with Biometric Art"""
        img = Image.new('RGBA', (size, size), (15, 15, 20, 255))
        draw = ImageDraw.Draw(img)
        
        # Vault door
        center = size // 2
        vault_r = size // 3
        
        # Outer ring
        draw.ellipse(
            [(center - vault_r, center - vault_r),
             (center + vault_r, center + vault_r)],
            fill=(40, 40, 50, 255), outline=(150, 150, 160, 255), width=size//50
        )
        
        # Inner ring
        draw.ellipse(
            [(center - vault_r*3//4, center - vault_r*3//4),
             (center + vault_r*3//4, center + vault_r*3//4)],
            fill=(30, 30, 40, 255), outline=(120, 120, 130, 255), width=size//80
        )
        
        # Combination dial
        for i in range(12):
            angle = i * 30 * math.pi / 180
            x1 = center + int(vault_r * 0.6 * math.cos(angle))
            y1 = center + int(vault_r * 0.6 * math.sin(angle))
            x2 = center + int(vault_r * 0.7 * math.cos(angle))
            y2 = center + int(vault_r * 0.7 * math.sin(angle))
            draw.line([(x1, y1), (x2, y2)], fill=(200, 200, 210, 255), width=size//200)
        
        # Center knob
        draw.ellipse(
            [(center - size//15, center - size//15),
             (center + size//15, center + size//15)],
            fill=(100, 100, 110, 255), outline=(180, 180, 190, 255), width=size//150
        )
        
        # Fingerprint pattern
        fp_center_x, fp_center_y = center, center
        for i in range(5):
            r = size // 20 + i * size // 40
            draw.arc(
                [(fp_center_x - r, fp_center_y - r),
                 (fp_center_x + r, fp_center_y + r)],
                start=30, end=330, fill=(0, 255, 200, 150), width=size//300
            )
        
        # Lock bolts
        bolt_positions = [(center - vault_r - size//20, center), 
                         (center + vault_r + size//20, center)]
        for bx, by in bolt_positions:
            draw.rectangle(
                [(bx - size//30, by - size//80), (bx + size//30, by + size//80)],
                fill=(150, 150, 160, 255)
            )
        
        img.save(output_path, 'PNG')
        print(f"✓ Created {output_path}")
    
    def create_tifa_icon(output_path, size=1024):
        """Tifa/Istinaf - FF7 Pomodoro Timer"""
        img = Image.new('RGBA', (size, size), (10, 10, 30, 255))
        draw = ImageDraw.Draw(img)
        
        # Materia orb
        center = size // 2
        orb_r = size // 3
        
        # Outer glow
        for j in range(5):
            alpha = 100 - j * 15
            offset = j * size // 50
            draw.ellipse(
                [(center - orb_r - offset, center - orb_r - offset),
                 (center + orb_r + offset, center + orb_r + offset)],
                fill=(0, 200, 255, alpha)
            )
        
        # Main orb
        draw.ellipse(
            [(center - orb_r, center - orb_r),
             (center + orb_r, center + orb_r)],
            fill=(0, 180, 255, 255)
        )
        
        # Inner shine
        draw.ellipse(
            [(center - orb_r//2, center - orb_r//2),
             (center + orb_r//2, center + orb_r//2)],
            fill=(100, 220, 255, 200)
        )
        
        # Highlight
        draw.ellipse(
            [(center - orb_r//3, center - orb_r*2//3),
             (center + orb_r//4, center - orb_r//3)],
            fill=(200, 255, 255, 180)
        )
        
        # Timer segments (like materia slots)
        for i in range(4):
            angle = i * 90 * math.pi / 180
            x = center + int(orb_r * 1.5 * math.cos(angle))
            y = center + int(orb_r * 1.5 * math.sin(angle))
            draw.ellipse(
                [(x - size//40, y - size//40), (x + size//40, y + size//40)],
                fill=(0, 255, 200, 255), outline=(255, 255, 255, 255), width=size//200
            )
        
        # Scanlines effect
        for i in range(0, size, size//50):
            draw.line([(0, i), (size, i)], fill=(0, 100, 150, 20), width=1)
        
        img.save(output_path, 'PNG')
        print(f"✓ Created {output_path}")
    
    def create_synethsize_icon(output_path, size=1024):
        """Synethsize - Cyberpunk Music Visualizer"""
        img = Image.new('RGBA', (size, size), (10, 0, 20, 255))
        draw = ImageDraw.Draw(img)
        
        # Neon grid
        grid_color = (255, 0, 150, 150)
        for i in range(0, size, size//10):
            draw.line([(i, 0), (i, size)], fill=grid_color, width=size//500)
            draw.line([(0, i), (size, i)], fill=grid_color, width=size//500)
        
        # Beat pads (4x4 grid)
        pad_size = size // 6
        pad_spacing = size // 20
        start_x = size // 4
        start_y = size // 4
        
        colors = [
            (255, 0, 100), (0, 255, 200), (255, 200, 0), (150, 0, 255),
            (0, 200, 255), (255, 100, 0), (200, 255, 0), (255, 0, 200),
            (100, 255, 0), (0, 150, 255), (255, 150, 0), (200, 0, 255),
            (0, 255, 150), (255, 0, 150), (150, 255, 0), (0, 200, 200)
        ]
        
        for i in range(4):
            for j in range(4):
                x = start_x + j * (pad_size + pad_spacing)
                y = start_y + i * (pad_size + pad_spacing)
                color = colors[i * 4 + j]
                
                # Glow
                for k in range(2):
                    alpha = 80 - k * 30
                    offset = k * size // 100
                    draw.rectangle(
                        [(x - offset, y - offset), 
                         (x + pad_size + offset, y + pad_size + offset)],
                        fill=(*color, alpha)
                    )
                
                # Pad
                draw.rectangle(
                    [(x, y), (x + pad_size, y + pad_size)],
                    fill=(*color, 200), outline=(255, 255, 255, 255), width=size//300
                )
        
        img.save(output_path, 'PNG')
        print(f"✓ Created {output_path}")
    
    def create_conveys_icon(output_path, size=1024):
        """ConVeys - Conversation Deepener"""
        img = Image.new('RGBA', (size, size), (20, 25, 35, 255))
        draw = ImageDraw.Draw(img)
        
        # Speech bubbles
        center = size // 2
        
        # Left bubble
        bubble1_x, bubble1_y = size // 3, size // 3
        bubble1_w, bubble1_h = size // 4, size // 6
        draw.rounded_rectangle(
            [(bubble1_x, bubble1_y), (bubble1_x + bubble1_w, bubble1_y + bubble1_h)],
            radius=size//40, fill=(100, 150, 255, 255)
        )
        # Tail
        tail1 = [(bubble1_x + size//20, bubble1_y + bubble1_h),
                 (bubble1_x, bubble1_y + bubble1_h + size//20),
                 (bubble1_x + size//15, bubble1_y + bubble1_h)]
        draw.polygon(tail1, fill=(100, 150, 255, 255))
        
        # Right bubble
        bubble2_x, bubble2_y = size // 2, size // 2
        bubble2_w, bubble2_h = size // 4, size // 6
        draw.rounded_rectangle(
            [(bubble2_x, bubble2_y), (bubble2_x + bubble2_w, bubble2_y + bubble2_h)],
            radius=size//40, fill=(255, 100, 150, 255)
        )
        # Tail
        tail2 = [(bubble2_x + bubble2_w - size//20, bubble2_y + bubble2_h),
                 (bubble2_x + bubble2_w, bubble2_y + bubble2_h + size//20),
                 (bubble2_x + bubble2_w - size//15, bubble2_y + bubble2_h)]
        draw.polygon(tail2, fill=(255, 100, 150, 255))
        
        # Question marks
        # In bubble 1
        q1_x, q1_y = bubble1_x + bubble1_w//2, bubble1_y + bubble1_h//2
        draw.text((q1_x, q1_y), "?", fill=(255, 255, 255, 255), anchor="mm")
        
        # Connection line
        draw.line(
            [(bubble1_x + bubble1_w, bubble1_y + bubble1_h//2),
             (bubble2_x, bubble2_y + bubble2_h//2)],
            fill=(150, 200, 255, 150), width=size//150
        )
        
        # Hearts/connection symbols
        heart_x, heart_y = center, size*2//3
        draw.ellipse(
            [(heart_x - size//30, heart_y - size//30),
             (heart_x + size//30, heart_y + size//30)],
            fill=(255, 200, 100, 255)
        )
        
        img.save(output_path, 'PNG')
        print(f"✓ Created {output_path}")
    
    def create_generic_icon(output_path, name, size=1024):
        """Generic icon for apps without specific design"""
        img = Image.new('RGBA', (size, size), (30, 30, 50, 255))
        draw = ImageDraw.Draw(img)
        
        # Simple gradient circle
        center = size // 2
        for i in range(20):
            r = size // 3 - i * size // 80
            alpha = 255 - i * 10
            color = (100 + i * 7, 100 + i * 5, 200, alpha)
            draw.ellipse(
                [(center - r, center - r), (center + r, center + r)],
                fill=color
            )
        
        # App initial
        if name:
            initial = name[0].upper()
            # Draw large letter (simplified - actual text rendering needs font)
            draw.ellipse(
                [(center - size//8, center - size//8),
                 (center + size//8, center + size//8)],
                fill=(255, 255, 255, 100)
            )
        
        img.save(output_path, 'PNG')
        print(f"✓ Created {output_path}")
    
    # App definitions
    apps = [
        ('stardome', create_stardome_icon),
        ('shifter', create_shifter_icon),
        ('lumora', create_lumora_icon),
        ('mindamaze', create_mindamaze_icon),
        ('flowy', create_flowy_icon),
        ('waveme', create_waveme_icon),
        ('vaulter', create_vaulter_icon),
        ('tifa', create_tifa_icon),
        ('synethsize', create_synethsize_icon),
        ('conVeys', create_conveys_icon),
        ('banqroute', lambda p, s: create_generic_icon(p, 'banqroute', s)),
        ('weather', lambda p, s: create_generic_icon(p, 'weather', s)),
        ('waterymark', lambda p, s: create_generic_icon(p, 'waterymark', s)),
        ('read', lambda p, s: create_generic_icon(p, 'read', s)),
        ('dought', lambda p, s: create_generic_icon(p, 'dought', s)),
    ]
    
    print("=" * 50)
    print("Generating Flutter App Icons")
    print("=" * 50)
    
    for app_name, icon_func in apps:
        output_path = f'{app_name}/icon.png'
        if os.path.exists(app_name):
            icon_func(output_path, 1024)
        else:
            print(f"⚠ Skipping {app_name} (folder not found)")
    
    print("=" * 50)
    print("All icons generated successfully!")
    print("=" * 50)
    
except ImportError:
    print("Error: Pillow library not found. Installing...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'pillow'])
    print("Please run this script again.")
