#!/usr/bin/env python3
"""Setup pubspec.yaml files for all Flutter apps with icon configuration"""

import os

apps = [
    'stardome', 'shifter', 'lumora', 'mindamaze', 'flowy',
    'waveme', 'vaulter', 'tifa', 'synethsize', 'conVeys',
    'banqroute', 'weather', 'waterymark', 'read', 'dought'
]

icon_config = """
flutter_launcher_icons:
  android: true
  ios: false
  image_path: "icon.png"
  adaptive_icon_background: "#1a1a2e"
  adaptive_icon_foreground: "icon.png"
"""

print("=" * 60)
print("Setting up pubspec.yaml files for icon generation")
print("=" * 60)

for app in apps:
    pubspec_path = f'{app}/pubspec.yaml'
    
    if not os.path.exists(pubspec_path):
        print(f"⚠ Skipping {app} (pubspec.yaml not found)")
        continue
    
    try:
        with open(pubspec_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if flutter_launcher_icons is already configured
        if 'flutter_launcher_icons:' in content and 'image_path: "icon.png"' in content:
            print(f"✓ {app} - Already configured")
            continue
        
        # Check if flutter_launcher_icons is in dev_dependencies
        needs_dep = 'flutter_launcher_icons' not in content
        needs_config = 'flutter_launcher_icons:' not in content or 'image_path:' not in content
        
        if needs_dep:
            # Add to dev_dependencies
            if 'dev_dependencies:' in content:
                # Find the line and add after it
                lines = content.split('\n')
                new_lines = []
                added = False
                
                for i, line in enumerate(lines):
                    new_lines.append(line)
                    if line.strip() == 'dev_dependencies:' and not added:
                        # Look for the next dependency line to match indentation
                        if i + 1 < len(lines):
                            next_line = lines[i + 1]
                            if next_line.strip():
                                # Add with same indentation
                                new_lines.append('  flutter_launcher_icons: ^0.13.1')
                                added = True
                
                if added:
                    content = '\n'.join(new_lines)
            else:
                # Add dev_dependencies section before flutter section
                if 'flutter:' in content:
                    content = content.replace('flutter:', 'dev_dependencies:\n  flutter_launcher_icons: ^0.13.1\n\nflutter:')
                else:
                    content += '\n\ndev_dependencies:\n  flutter_launcher_icons: ^0.13.1\n'
        
        # Add configuration at the end if not present
        if needs_config:
            if not content.endswith('\n'):
                content += '\n'
            content += icon_config
        
        # Write back
        with open(pubspec_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ {app} - Configured")
        
    except Exception as e:
        print(f"✗ {app} - Error: {e}")

print("=" * 60)
print("Setup complete!")
print("=" * 60)
