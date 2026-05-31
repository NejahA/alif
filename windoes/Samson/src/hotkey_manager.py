"""Global hotkey manager"""

import keyboard

class HotkeyManager:
    """Manage global keyboard shortcuts"""
    
    def __init__(self, main_window):
        self.main_window = main_window
        
    def register_hotkeys(self):
        """Register all global hotkeys"""
        try:
            keyboard.add_hotkey('ctrl+shift+s', self.main_window.capture_region)
            keyboard.add_hotkey('ctrl+shift+f', self.main_window.capture_fullscreen)
            keyboard.add_hotkey('ctrl+shift+w', self.main_window.capture_window)
            keyboard.add_hotkey('ctrl+shift+h', self.main_window.show_history)
            print("Hotkeys registered successfully")
        except Exception as e:
            print(f"Error registering hotkeys: {e}")
            
    def unregister_hotkeys(self):
        """Unregister all hotkeys"""
        keyboard.unhook_all()
