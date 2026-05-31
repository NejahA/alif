#!/usr/bin/env python3
"""
Galaxy - Desktop Screenshot & Annotation Tool
A powerful screenshot capture and annotation application
"""

import sys
from PyQt6.QtWidgets import QApplication
from src.main_window import MainWindow
from src.hotkey_manager import HotkeyManager

def main():
    """Main entry point for Galaxy application"""
    app = QApplication(sys.argv)
    app.setApplicationName("Galaxy")
    app.setOrganizationName("Galaxy")
    
    # Create main window
    window = MainWindow()
    window.show()  # Show the window immediately
    
    # Setup global hotkeys
    hotkey_manager = HotkeyManager(window)
    hotkey_manager.register_hotkeys()
    
    # Show system tray icon (optional)
    try:
        window.show_tray_icon()
    except Exception as e:
        print(f"Tray icon error (non-critical): {e}")
    
    # Start the application
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
