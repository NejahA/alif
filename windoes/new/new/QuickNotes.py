import tkinter as tk
from tkinter import ttk, messagebox, colorchooser
import json
import os
from datetime import datetime
import random

class StickyNote:
    def __init__(self, parent_app, note_id, x=100, y=100, width=250, height=200, 
                 content="", color="#ffeb3b", title="Note"):
        self.parent_app = parent_app
        self.note_id = note_id
        self.color = color
        
        # Create note window
        self.window = tk.Toplevel()
        self.window.title(title)
        self.window.geometry(f"{width}x{height}+{x}+{y}")
        self.window.configure(bg=color)
        self.window.attributes('-topmost', True)
        
        # Title bar
        title_frame = tk.Frame(self.window, bg=self.darken_color(color), height=30)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        self.title_var = tk.StringVar(value=title)
        title_entry = tk.Entry(title_frame, textvariable=self.title_var, font=("Arial", 10, "bold"),
                              bg=self.darken_color(color), fg="#000000", relief=tk.FLAT)
        title_entry.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        title_entry.bind('<KeyRelease>', lambda e: self.save_note())
        
        # Buttons
        btn_frame = tk.Frame(title_frame, bg=self.darken_color(color))
        btn_frame.pack(side=tk.RIGHT, padx=5)
        
        tk.Button(btn_frame, text="🎨", command=self.change_color, relief=tk.FLAT,
                 bg=self.darken_color(color), font=("Arial", 10)).pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="📌", command=self.toggle_topmost, relief=tk.FLAT,
                 bg=self.darken_color(color), font=("Arial", 10)).pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="✕", command=self.close_note, relief=tk.FLAT,
                 bg=self.darken_color(color), font=("Arial", 10)).pack(side=tk.LEFT, padx=2)
        
        # Text area
        text_frame = tk.Frame(self.window, bg=color)
        text_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        scrollbar = tk.Scrollbar(text_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.text_widget = tk.Text(text_frame, wrap=tk.WORD, yscrollcommand=scrollbar.set,
                                   font=("Arial", 10), bg=color, fg="#000000", relief=tk.FLAT)
        self.text_widget.pack(fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.text_widget.yview)
        
        self.text_widget.insert(1.0, content)
        self.text_widget.bind('<KeyRelease>', lambda e: self.save_note())
        
        # Timestamp
        self.timestamp_label = tk.Label(self.window, text="", bg=color, fg="#666666",
                                       font=("Arial", 7), anchor=tk.E)
        self.timestamp_label.pack(fill=tk.X, padx=5, pady=2)
        self.update_timestamp()
        
        # Make window draggable
        title_frame.bind('<Button-1>', self.start_move)
        title_frame.bind('<B1-Motion>', self.on_move)
        title_entry.bind('<Button-1>', self.start_move)
        title_entry.bind('<B1-Motion>', self.on_move)
        
        self.window.protocol("WM_DELETE_WINDOW", self.close_note)
        
        self.offset_x = 0
        self.offset_y = 0
        self.is_topmost = True
    
    def darken_color(self, color):
        # Simple color darkening
        color = color.lstrip('#')
        r, g, b = tuple(int(color[i:i+2], 16) for i in (0, 2, 4))
        r = max(0, r - 30)
        g = max(0, g - 30)
        b = max(0, b - 30)
        return f'#{r:02x}{g:02x}{b:02x}'
    
    def start_move(self, event):
        self.offset_x = event.x
        self.offset_y = event.y
    
    def on_move(self, event):
        x = self.window.winfo_x() + event.x - self.offset_x
        y = self.window.winfo_y() + event.y - self.offset_y
        self.window.geometry(f'+{x}+{y}')
        self.save_note()
    
    def change_color(self):
        color = colorchooser.askcolor(initialcolor=self.color)[1]
        if color:
            self.color = color
            self.window.configure(bg=color)
            self.text_widget.configure(bg=color)
            self.timestamp_label.configure(bg=color)
            self.save_note()
    
    def toggle_topmost(self):
        self.is_topmost = not self.is_topmost
        self.window.attributes('-topmost', self.is_topmost)
    
    def update_timestamp(self):
        now = datetime.now().strftime("%Y-%m-%d %H:%M")
        self.timestamp_label.config(text=f"Modified: {now}")
    
    def save_note(self):
        self.update_timestamp()
        self.parent_app.save_all_notes()
    
    def close_note(self):
        self.parent_app.remove_note(self.note_id)
        self.window.destroy()
    
    def get_data(self):
        geometry = self.window.geometry()
        return {
            'id': self.note_id,
            'title': self.title_var.get(),
            'content': self.text_widget.get(1.0, tk.END).strip(),
            'color': self.color,
            'geometry': geometry,
            'timestamp': datetime.now().isoformat()
        }

class QuickNotes:
    def __init__(self, root):
        self.root = root
        self.root.title("Quick Notes")
        self.root.geometry("400x500")
        
        self.notes = {}
        self.notes_file = "quick_notes_data.json"
        self.next_id = 1
        
        self.setup_ui()
        self.load_notes()
    
    def setup_ui(self):
        # Title
        title_label = tk.Label(self.root, text="📝 Quick Notes", font=("Arial", 18, "bold"))
        title_label.pack(pady=15)
        
        # New note button
        btn_frame = tk.Frame(self.root)
        btn_frame.pack(pady=10)
        
        tk.Button(btn_frame, text="+ New Note", command=self.create_new_note,
                 bg="#4CAF50", fg="white", font=("Arial", 12, "bold"),
                 padx=20, pady=10).pack(side=tk.LEFT, padx=5)
        
        tk.Button(btn_frame, text="📋 New from Clipboard", command=self.create_from_clipboard,
                 bg="#2196F3", fg="white", font=("Arial", 12, "bold"),
                 padx=20, pady=10).pack(side=tk.LEFT, padx=5)
        
        # Color presets
        color_frame = tk.LabelFrame(self.root, text="Quick Colors", font=("Arial", 10, "bold"))
        color_frame.pack(fill=tk.X, padx=20, pady=10)
        
        self.colors = [
            ("#ffeb3b", "Yellow"),
            ("#ff9800", "Orange"),
            ("#f48fb1", "Pink"),
            ("#81c784", "Green"),
            ("#64b5f6", "Blue"),
            ("#ce93d8", "Purple"),
        ]
        
        for color, name in self.colors:
            btn = tk.Button(color_frame, bg=color, width=10, text=name,
                          command=lambda c=color: self.create_new_note(color=c))
            btn.pack(side=tk.LEFT, padx=5, pady=5)
        
        # Notes list
        list_frame = tk.LabelFrame(self.root, text="Active Notes", font=("Arial", 10, "bold"))
        list_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        scrollbar = tk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.notes_listbox = tk.Listbox(list_frame, yscrollcommand=scrollbar.set,
                                        font=("Arial", 10))
        self.notes_listbox.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        scrollbar.config(command=self.notes_listbox.yview)
        
        self.notes_listbox.bind('<Double-Button-1>', self.focus_note)
        
        # Action buttons
        action_frame = tk.Frame(self.root)
        action_frame.pack(fill=tk.X, padx=20, pady=10)
        
        tk.Button(action_frame, text="Focus Selected", command=self.focus_note,
                 bg="#2196F3", fg="white").pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        tk.Button(action_frame, text="Delete Selected", command=self.delete_selected,
                 bg="#f44336", fg="white").pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        tk.Button(action_frame, text="Delete All", command=self.delete_all,
                 bg="#FF9800", fg="white").pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        
        # Status
        self.status_label = tk.Label(self.root, text="Ready", bd=1, relief=tk.SUNKEN, anchor=tk.W)
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)
    
    def create_new_note(self, color=None):
        if color is None:
            color = random.choice([c[0] for c in self.colors])
        
        x = 100 + (len(self.notes) * 30) % 500
        y = 100 + (len(self.notes) * 30) % 400
        
        note = StickyNote(self, self.next_id, x=x, y=y, color=color,
                         title=f"Note {self.next_id}")
        self.notes[self.next_id] = note
        self.next_id += 1
        
        self.update_notes_list()
        self.save_all_notes()
        self.status_label.config(text=f"Created new note - Total: {len(self.notes)}")
    
    def create_from_clipboard(self):
        try:
            import pyperclip
            content = pyperclip.paste()
            if content:
                color = random.choice([c[0] for c in self.colors])
                x = 100 + (len(self.notes) * 30) % 500
                y = 100 + (len(self.notes) * 30) % 400
                
                note = StickyNote(self, self.next_id, x=x, y=y, color=color,
                                title=f"Note {self.next_id}", content=content)
                self.notes[self.next_id] = note
                self.next_id += 1
                
                self.update_notes_list()
                self.save_all_notes()
                self.status_label.config(text="Created note from clipboard")
            else:
                messagebox.showinfo("Info", "Clipboard is empty")
        except ImportError:
            messagebox.showerror("Error", "pyperclip not installed. Use: pip install pyperclip")
    
    def remove_note(self, note_id):
        if note_id in self.notes:
            del self.notes[note_id]
            self.update_notes_list()
            self.save_all_notes()
            self.status_label.config(text=f"Note deleted - Total: {len(self.notes)}")
    
    def focus_note(self, event=None):
        selection = self.notes_listbox.curselection()
        if selection:
            idx = selection[0]
            note_id = list(self.notes.keys())[idx]
            self.notes[note_id].window.lift()
            self.notes[note_id].window.focus_force()
    
    def delete_selected(self):
        selection = self.notes_listbox.curselection()
        if selection:
            idx = selection[0]
            note_id = list(self.notes.keys())[idx]
            self.notes[note_id].close_note()
    
    def delete_all(self):
        if self.notes and messagebox.askyesno("Confirm", "Delete all notes?"):
            for note_id in list(self.notes.keys()):
                self.notes[note_id].window.destroy()
            self.notes.clear()
            self.update_notes_list()
            self.save_all_notes()
            self.status_label.config(text="All notes deleted")
    
    def update_notes_list(self):
        self.notes_listbox.delete(0, tk.END)
        for note_id, note in self.notes.items():
            title = note.title_var.get()
            content_preview = note.text_widget.get(1.0, "1.end")[:30]
            self.notes_listbox.insert(tk.END, f"{title} - {content_preview}...")
    
    def save_all_notes(self):
        data = {
            'next_id': self.next_id,
            'notes': [note.get_data() for note in self.notes.values()]
        }
        
        try:
            with open(self.notes_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving notes: {e}")
    
    def load_notes(self):
        if os.path.exists(self.notes_file):
            try:
                with open(self.notes_file, 'r') as f:
                    data = json.load(f)
                
                self.next_id = data.get('next_id', 1)
                
                for note_data in data.get('notes', []):
                    geometry = note_data.get('geometry', '250x200+100+100')
                    parts = geometry.split('+')
                    size = parts[0].split('x')
                    width, height = int(size[0]), int(size[1])
                    x, y = int(parts[1]), int(parts[2])
                    
                    note = StickyNote(
                        self,
                        note_data['id'],
                        x=x, y=y,
                        width=width, height=height,
                        content=note_data.get('content', ''),
                        color=note_data.get('color', '#ffeb3b'),
                        title=note_data.get('title', 'Note')
                    )
                    self.notes[note_data['id']] = note
                
                self.update_notes_list()
                self.status_label.config(text=f"Loaded {len(self.notes)} notes")
            except Exception as e:
                print(f"Error loading notes: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = QuickNotes(root)
    root.mainloop()
