"""
Advanced Features for Touch Mouse
Add keyboard support, gestures, and more
"""

import pyautogui
import json
from datetime import datetime

class AdvancedMouseController:
    def __init__(self):
        self.sensitivity = 2.0
        self.gesture_history = []
        self.macro_recording = False
        self.recorded_actions = []
        pyautogui.FAILSAFE = False
        
    def process_command(self, command):
        """Process advanced commands"""
        cmd_type = command.get('type')
        
        if cmd_type == 'move':
            self.handle_move(command)
        elif cmd_type == 'click':
            self.handle_click(command)
        elif cmd_type == 'scroll':
            self.handle_scroll(command)
        elif cmd_type == 'keyboard':
            self.handle_keyboard(command)
        elif cmd_type == 'gesture':
            self.handle_gesture(command)
        elif cmd_type == 'macro':
            self.handle_macro(command)
        elif cmd_type == 'sensitivity':
            self.sensitivity = command.get('value', 2.0)
    
    def handle_move(self, command):
        """Handle cursor movement"""
        dx = command.get('dx', 0) * self.sensitivity
        dy = command.get('dy', 0) * self.sensitivity
        pyautogui.moveRel(dx, dy)
    
    def handle_click(self, command):
        """Handle mouse clicks"""
        button = command.get('button', 'left')
        clicks = command.get('clicks', 1)
        
        if clicks == 2:
            pyautogui.doubleClick(button=button)
        elif clicks == 3:
            pyautogui.tripleClick(button=button)
        else:
            pyautogui.click(button=button)
    
    def handle_scroll(self, command):
        """Handle scrolling"""
        amount = command.get('amount', 0)
        pyautogui.scroll(int(amount))
    
    def handle_keyboard(self, command):
        """Handle keyboard input"""
        action = command.get('action')
        key = command.get('key', '')
        text = command.get('text', '')
        
        if action == 'press':
            pyautogui.press(key)
        elif action == 'hotkey':
            keys = command.get('keys', [])
            pyautogui.hotkey(*keys)
        elif action == 'type':
            pyautogui.write(text)
    
    def handle_gesture(self, command):
        """Handle custom gestures"""
        gesture = command.get('gesture')
        
        if gesture == 'swipe_left':
            # Alt+Left (browser back)
            pyautogui.hotkey('alt', 'left')
        elif gesture == 'swipe_right':
            # Alt+Right (browser forward)
            pyautogui.hotkey('alt', 'right')
        elif gesture == 'swipe_up':
            # Page Up
            pyautogui.press('pageup')
        elif gesture == 'swipe_down':
            # Page Down
            pyautogui.press('pagedown')
        elif gesture == 'pinch_in':
            # Zoom out (Ctrl+-)
            pyautogui.hotkey('ctrl', 'minus')
        elif gesture == 'pinch_out':
            # Zoom in (Ctrl++)
            pyautogui.hotkey('ctrl', 'plus')
        elif gesture == 'three_finger_tap':
            # Show desktop (Windows+D)
            pyautogui.hotkey('win', 'd')
        elif gesture == 'four_finger_swipe_up':
            # Task view (Windows+Tab)
            pyautogui.hotkey('win', 'tab')
    
    def handle_macro(self, command):
        """Handle macro recording and playback"""
        action = command.get('action')
        
        if action == 'start_recording':
            self.macro_recording = True
            self.recorded_actions = []
            return {'status': 'recording'}
        
        elif action == 'stop_recording':
            self.macro_recording = False
            return {'status': 'stopped', 'actions': len(self.recorded_actions)}
        
        elif action == 'playback':
            for recorded_cmd in self.recorded_actions:
                self.process_command(recorded_cmd)
            return {'status': 'played', 'actions': len(self.recorded_actions)}
        
        elif action == 'clear':
            self.recorded_actions = []
            return {'status': 'cleared'}
    
    def record_action(self, command):
        """Record action if macro recording is active"""
        if self.macro_recording:
            self.recorded_actions.append(command)

# Common keyboard shortcuts
SHORTCUTS = {
    'copy': ['ctrl', 'c'],
    'paste': ['ctrl', 'v'],
    'cut': ['ctrl', 'x'],
    'undo': ['ctrl', 'z'],
    'redo': ['ctrl', 'y'],
    'save': ['ctrl', 's'],
    'find': ['ctrl', 'f'],
    'select_all': ['ctrl', 'a'],
    'new_tab': ['ctrl', 't'],
    'close_tab': ['ctrl', 'w'],
    'refresh': ['f5'],
    'fullscreen': ['f11'],
    'screenshot': ['win', 'shift', 's'],
    'task_manager': ['ctrl', 'shift', 'esc'],
    'lock_screen': ['win', 'l'],
    'minimize_all': ['win', 'd'],
}

def execute_shortcut(shortcut_name):
    """Execute a predefined keyboard shortcut"""
    if shortcut_name in SHORTCUTS:
        pyautogui.hotkey(*SHORTCUTS[shortcut_name])
        return True
    return False
