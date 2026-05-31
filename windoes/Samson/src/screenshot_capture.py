"""Screenshot capture functionality"""

import mss
import mss.tools
from PIL import Image
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QRect
from .region_selector import RegionSelector

class ScreenshotCapture:
    """Handle screenshot capture operations"""
    
    def __init__(self):
        self.sct = mss.mss()
        
    def capture_fullscreen(self):
        """Capture entire screen"""
        try:
            # Capture primary monitor
            monitor = self.sct.monitors[1]
            screenshot = self.sct.grab(monitor)
            
            # Convert to PIL Image
            img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
            return img
        except Exception as e:
            print(f"Error capturing fullscreen: {e}")
            return None
            
    def capture_region(self):
        """Capture user-selected region"""
        try:
            # Show region selector
            selector = RegionSelector()
            if selector.exec():
                rect = selector.get_selected_region()
                if rect:
                    monitor = {
                        "left": rect.x(),
                        "top": rect.y(),
                        "width": rect.width(),
                        "height": rect.height()
                    }
                    screenshot = self.sct.grab(monitor)
                    img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
                    return img
            return None
        except Exception as e:
            print(f"Error capturing region: {e}")
            return None
