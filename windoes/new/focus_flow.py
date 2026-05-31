import json
import os
from pathlib import Path
import win32gui
import win32process
import win32con
import psutil
from PIL import Image, ImageDraw
import pystray
from pystray import MenuItem as item
import threading
import time

class FocusFlow:
    def __init__(self):
        self.config_dir = Path.home() / '.focus_flow'
        self.config_dir.mkdir(exist_ok=True)
        self.contexts_file = self.config_dir / 'contexts.json'
        self.contexts = self.load_contexts()
        self.current_context = None
        self.focus_timer = None
        self.focus_start_time = None
        
    def load_contexts(self):
        if self.contexts_file.exists():
            with open(self.contexts_file, 'r') as f:
                return json.load(f)
        return {}
    
    def save_contexts(self):
        with open(self.contexts_file, 'w') as f:
            json.dump(self.contexts, f, indent=2)
    
    def get_active_windows(self):
        windows = []
        
        def callback(hwnd, _):
            if win32gui.IsWindowVisible(hwnd) and win32gui.GetWindowText(hwnd):
                try:
                    _, pid = win32process.GetWindowThreadProcessId(hwnd)
                    process = psutil.Process(pid)
                    rect = win32gui.GetWindowRect(hwnd)
                    
                    windows.append({
                        'title': win32gui.GetWindowText(hwnd),
                        'process': process.name(),
                        'exe_path': process.exe(),
                        'position': {
                            'left': rect[0],
                            'top': rect[1],
                            'right': rect[2],
                            'bottom': rect[3]
                        }
                    })
                except:
                    pass
            return True
        
        win32gui.EnumWindows(callback, None)
        return windows
    
    def save_current_context(self, name):
        windows = self.get_active_windows()
        self.contexts[name] = {
            'windows': windows,
            'created': time.time()
        }
        self.save_contexts()
        self.current_context = name
        return f"Context '{name}' saved with {len(windows)} windows"
    
    def restore_context(self, name):
        if name not in self.contexts:
            return f"Context '{name}' not found"
        
        context = self.contexts[name]
        restored = 0
        
        for window_info in context['windows']:
            try:
                os.startfile(window_info['exe_path'])
                restored += 1
                time.sleep(0.5)
            except:
                pass
        
        self.current_context = name
        return f"Restored {restored} applications from '{name}'"
    
    def list_contexts(self):
        return list(self.contexts.keys())
    
    def delete_context(self, name):
        if name in self.contexts:
            del self.contexts[name]
            self.save_contexts()
            return f"Context '{name}' deleted"
        return f"Context '{name}' not found"
    
    def start_focus_mode(self, duration_minutes=25):
        self.focus_start_time = time.time()
        self.focus_timer = duration_minutes * 60
        return f"Focus mode started for {duration_minutes} minutes"
    
    def stop_focus_mode(self):
        if self.focus_start_time:
            elapsed = int((time.time() - self.focus_start_time) / 60)
            self.focus_start_time = None
            self.focus_timer = None
            return f"Focus session ended. Duration: {elapsed} minutes"
        return "No active focus session"

def create_icon():
    width = 64
    height = 64
    image = Image.new('RGB', (width, height), 'white')
    dc = ImageDraw.Draw(image)
    dc.ellipse([16, 16, 48, 48], fill='#4A90E2', outline='#2E5C8A')
    return image

def setup_menu(focus_flow):
    def save_context_action(icon, item):
        name = f"context_{len(focus_flow.contexts) + 1}"
        result = focus_flow.save_current_context(name)
        icon.notify(result, "Focus Flow")
    
    def start_focus_action(icon, item):
        result = focus_flow.start_focus_mode(25)
        icon.notify(result, "Focus Flow")
    
    def stop_focus_action(icon, item):
        result = focus_flow.stop_focus_mode()
        icon.notify(result, "Focus Flow")
    
    def make_restore_action(context_name):
        def restore_action(icon, item):
            result = focus_flow.restore_context(context_name)
            icon.notify(result, "Focus Flow")
        return restore_action
    
    def create_context_menu_items():
        contexts = focus_flow.list_contexts()
        if contexts:
            return [item(name, make_restore_action(name)) for name in contexts]
        return [item("No saved contexts", None, enabled=False)]
    
    return pystray.Menu(
        item('Save Current Context', save_context_action),
        item('Restore Context', pystray.Menu(create_context_menu_items)),
        pystray.Menu.SEPARATOR,
        item('Start Focus (25min)', start_focus_action),
        item('Stop Focus', stop_focus_action),
        pystray.Menu.SEPARATOR,
        item('Exit', lambda icon, item: icon.stop())
    )

def main():
    focus_flow = FocusFlow()
    icon_image = create_icon()
    icon = pystray.Icon(
        "focus_flow",
        icon_image,
        "Focus Flow",
        menu=setup_menu(focus_flow)
    )
    
    print("Focus Flow started. Check your system tray!")
    icon.run()

if __name__ == '__main__':
    main()
