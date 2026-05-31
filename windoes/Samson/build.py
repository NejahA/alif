#!/usr/bin/env python3
"""Build script for creating Galaxy executable"""

import PyInstaller.__main__
import os

def build_exe():
    """Build the executable using PyInstaller"""
    
    PyInstaller.__main__.run([
        'main.py',
        '--onefile',
        '--windowed',
        '--name=Galaxy',
        '--add-data=src:src',
        '--icon=camera.ico',
        '--clean',
        '--noconfirm',
    ])
    
    print("\n✅ Build complete! Check the 'dist' folder for Galaxy.exe")

if __name__ == "__main__":
    build_exe()
