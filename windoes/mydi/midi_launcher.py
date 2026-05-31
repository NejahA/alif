import tkinter as tk
from tkinter import messagebox
import subprocess
import sys
import os

class MIDILauncher:
    def __init__(self, root):
        self.root = root
        self.root.title("🎵 MIDI Tools Launcher")
        self.root.geometry("500x550")
        
        # Zelda color palette
        self.bg_dark = '#1a3a1a'
        self.bg_medium = '#2d5a2d'
        self.accent_gold = '#d4af37'
        self.accent_light = '#90ee90'
        self.text_white = '#ffffff'
        self.button_green = '#3d7a3d'
        self.button_hover = '#4d9a4d'
        
        self.root.configure(bg=self.bg_dark)
        
        self.setup_ui()
    
    def setup_ui(self):
        # Title
        title_label = tk.Label(
            self.root,
            text="⟁ HYRULE MIDI TOOLS ⟁",
            bg=self.bg_dark,
            fg=self.accent_gold,
            font=('Courier New', 20, 'bold')
        )
        title_label.pack(pady=30)
        
        # Subtitle
        subtitle = tk.Label(
            self.root,
            text="Choose Your Adventure",
            bg=self.bg_dark,
            fg=self.accent_light,
            font=('Courier New', 12)
        )
        subtitle.pack(pady=10)
        
        # Decorative border
        border_frame = tk.Frame(self.root, bg=self.accent_gold, height=3)
        border_frame.pack(fill=tk.X, padx=50, pady=20)
        
        # Button container
        button_container = tk.Frame(self.root, bg=self.bg_dark)
        button_container.pack(pady=20, expand=True)
        
        button_config = {
            'font': ('Courier New', 11, 'bold'),
            'relief': tk.RAISED,
            'bd': 4,
            'width': 30,
            'height': 3,
            'cursor': 'hand2',
            'bg': self.button_green,
            'fg': self.text_white,
            'activebackground': self.button_hover,
            'activeforeground': self.text_white
        }
        
        # Player button
        player_btn = tk.Button(
            button_container,
            text="🎵 MIDI PLAYER\n(Play MIDI Files)",
            command=self.launch_player,
            **button_config
        )
        player_btn.pack(pady=8)
        
        # Keyboard button
        keyboard_btn = tk.Button(
            button_container,
            text="🎹 PIANO KEYBOARD\n(Record with Visual Keyboard)",
            command=self.launch_keyboard,
            **button_config
        )
        keyboard_btn.pack(pady=8)
        
        # Editor button
        editor_btn = tk.Button(
            button_container,
            text="🎼 MIDI EDITOR\n(Advanced MIDI Editing)",
            command=self.launch_editor,
            **button_config
        )
        editor_btn.pack(pady=8)
        
        # Footer
        footer = tk.Label(
            self.root,
            text="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            bg=self.bg_dark,
            fg=self.accent_gold,
            font=('Courier New', 8)
        )
        footer.pack(side=tk.BOTTOM, pady=10)
    
    def launch_player(self):
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            player_path = os.path.join(script_dir, 'midi_player.py')
            subprocess.Popen([sys.executable, player_path])
            self.root.destroy()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to launch player: {str(e)}")
    
    def launch_editor(self):
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            editor_path = os.path.join(script_dir, 'midi_editor_improved.py')
            subprocess.Popen([sys.executable, editor_path])
            self.root.destroy()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to launch editor: {str(e)}")
    
    def launch_keyboard(self):
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            keyboard_path = os.path.join(script_dir, 'midi_keyboard_editor.py')
            subprocess.Popen([sys.executable, keyboard_path])
            self.root.destroy()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to launch keyboard: {str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    app = MIDILauncher(root)
    root.mainloop()
