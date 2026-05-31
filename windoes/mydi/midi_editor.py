import tkinter as tk
from tkinter import filedialog, ttk, messagebox
import mido
from mido import MidiFile, MidiTrack, Message, MetaMessage

class MIDIEditor:
    def __init__(self, root):
        self.root = root
        self.root.title("🎼 MIDI Editor")
        self.root.geometry("800x600")
        
        # Zelda color palette
        self.bg_dark = '#1a3a1a'
        self.bg_medium = '#2d5a2d'
        self.accent_gold = '#d4af37'
        self.accent_light = '#90ee90'
        self.text_white = '#ffffff'
        self.button_green = '#3d7a3d'
        self.button_hover = '#4d9a4d'
        
        self.root.configure(bg=self.bg_dark)
        
        self.midi_file = None
        self.current_track = None
        self.filename = None
        
        self.setup_ui()
    
    def setup_ui(self):
        # Title
        title_label = tk.Label(
            self.root,
            text="⟁ MIDI EDITOR ⟁",
            bg=self.bg_dark,
            fg=self.accent_gold,
            font=('Courier New', 18, 'bold')
        )
        title_label.pack(pady=10)
        
        # Menu frame
        menu_frame = tk.Frame(self.root, bg=self.bg_dark)
        menu_frame.pack(pady=10)
        
        button_config = {
            'font': ('Courier New', 9, 'bold'),
            'relief': tk.RAISED,
            'bd': 3,
            'cursor': 'hand2',
            'bg': self.button_green,
            'fg': self.text_white,
            'activebackground': self.button_hover
        }
        
        tk.Button(menu_frame, text="New MIDI", command=self.new_midi, **button_config).pack(side=tk.LEFT, padx=5)
        tk.Button(menu_frame, text="Open MIDI", command=self.open_midi, **button_config).pack(side=tk.LEFT, padx=5)
        tk.Button(menu_frame, text="Save MIDI", command=self.save_midi, **button_config).pack(side=tk.LEFT, padx=5)
        tk.Button(menu_frame, text="Save As", command=self.save_as_midi, **button_config).pack(side=tk.LEFT, padx=5)
        
        # File info
        info_container = tk.Frame(self.root, bg=self.bg_medium, relief=tk.RIDGE, bd=3)
        info_container.pack(pady=10, padx=20, fill=tk.X)
        
        self.file_label = tk.Label(
            info_container,
            text="No file loaded",
            bg=self.bg_medium,
            fg=self.accent_light,
            font=('Courier New', 10, 'bold'),
            pady=8
        )
        self.file_label.pack()
        
        # Track management
        track_frame = tk.Frame(self.root, bg=self.bg_dark)
        track_frame.pack(pady=10, padx=20, fill=tk.BOTH, expand=True)
        
        tk.Label(
            track_frame,
            text="Tracks:",
            bg=self.bg_dark,
            fg=self.accent_gold,
            font=('Courier New', 11, 'bold')
        ).pack(anchor=tk.W)
        
        # Track listbox with scrollbar
        list_frame = tk.Frame(track_frame, bg=self.bg_dark)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        scrollbar = tk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.track_listbox = tk.Listbox(
            list_frame,
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Courier New', 9),
            selectbackground=self.accent_gold,
            yscrollcommand=scrollbar.set,
            height=10
        )
        self.track_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.track_listbox.yview)
        
        # Track buttons
        track_btn_frame = tk.Frame(self.root, bg=self.bg_dark)
        track_btn_frame.pack(pady=5)
        
        tk.Button(track_btn_frame, text="Add Track", command=self.add_track, **button_config).pack(side=tk.LEFT, padx=5)
        tk.Button(track_btn_frame, text="Add Note", command=self.add_note_dialog, **button_config).pack(side=tk.LEFT, padx=5)
        tk.Button(track_btn_frame, text="View Track", command=self.view_track, **button_config).pack(side=tk.LEFT, padx=5)
        tk.Button(track_btn_frame, text="Delete Track", command=self.delete_track, **button_config).pack(side=tk.LEFT, padx=5)
        
        # Status
        self.status_label = tk.Label(
            self.root,
            text="Ready",
            bg=self.bg_dark,
            fg=self.accent_gold,
            font=('Courier New', 10, 'bold'),
            pady=5
        )
        self.status_label.pack(pady=10)
    
    def new_midi(self):
        self.midi_file = MidiFile()
        self.midi_file.tracks.append(MidiTrack())
        self.filename = None
        self.file_label.config(text="New MIDI file")
        self.refresh_tracks()
        self.status_label.config(text="Created new MIDI file")
    
    def open_midi(self):
        filename = filedialog.askopenfilename(
            title="Open MIDI file",
            filetypes=[("MIDI files", "*.mid *.midi"), ("All files", "*.*")]
        )
        if filename:
            try:
                self.midi_file = MidiFile(filename)
                self.filename = filename
                self.file_label.config(text=f"File: {filename.split('/')[-1]}")
                self.refresh_tracks()
                self.status_label.config(text=f"Loaded {len(self.midi_file.tracks)} tracks")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to open file: {str(e)}")
    
    def save_midi(self):
        if not self.midi_file:
            messagebox.showwarning("Warning", "No MIDI file to save")
            return
        
        if self.filename:
            try:
                self.midi_file.save(self.filename)
                self.status_label.config(text="File saved")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save: {str(e)}")
        else:
            self.save_as_midi()
    
    def save_as_midi(self):
        if not self.midi_file:
            messagebox.showwarning("Warning", "No MIDI file to save")
            return
        
        filename = filedialog.asksaveasfilename(
            title="Save MIDI file",
            defaultextension=".mid",
            filetypes=[("MIDI files", "*.mid"), ("All files", "*.*")]
        )
        if filename:
            try:
                self.midi_file.save(filename)
                self.filename = filename
                self.file_label.config(text=f"File: {filename.split('/')[-1]}")
                self.status_label.config(text="File saved")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save: {str(e)}")
    
    def refresh_tracks(self):
        self.track_listbox.delete(0, tk.END)
        if self.midi_file:
            for i, track in enumerate(self.midi_file.tracks):
                track_name = f"Track {i}"
                for msg in track:
                    if msg.type == 'track_name':
                        track_name = f"Track {i}: {msg.name}"
                        break
                note_count = sum(1 for msg in track if msg.type == 'note_on')
                self.track_listbox.insert(tk.END, f"{track_name} ({note_count} notes)")
    
    def add_track(self):
        if not self.midi_file:
            self.new_midi()
        
        track = MidiTrack()
        track.append(MetaMessage('track_name', name=f'Track {len(self.midi_file.tracks)}', time=0))
        self.midi_file.tracks.append(track)
        self.refresh_tracks()
        self.status_label.config(text=f"Added track {len(self.midi_file.tracks) - 1}")
    
    def add_note_dialog(self):
        if not self.midi_file or not self.midi_file.tracks:
            messagebox.showwarning("Warning", "Create a track first")
            return
        
        dialog = tk.Toplevel(self.root)
        dialog.title("Add Note")
        dialog.geometry("400x350")
        dialog.configure(bg=self.bg_dark)
        
        tk.Label(dialog, text="Add MIDI Note", bg=self.bg_dark, fg=self.accent_gold, 
                font=('Courier New', 12, 'bold')).pack(pady=10)
        
        # Track selection
        tk.Label(dialog, text="Track:", bg=self.bg_dark, fg=self.text_white).pack()
        track_var = tk.IntVar(value=0)
        track_spin = tk.Spinbox(dialog, from_=0, to=len(self.midi_file.tracks)-1, 
                               textvariable=track_var, width=10)
        track_spin.pack(pady=5)
        
        # Note
        tk.Label(dialog, text="Note (0-127, Middle C=60):", bg=self.bg_dark, fg=self.text_white).pack()
        note_var = tk.IntVar(value=60)
        note_spin = tk.Spinbox(dialog, from_=0, to=127, textvariable=note_var, width=10)
        note_spin.pack(pady=5)
        
        # Velocity
        tk.Label(dialog, text="Velocity (0-127):", bg=self.bg_dark, fg=self.text_white).pack()
        velocity_var = tk.IntVar(value=64)
        velocity_spin = tk.Spinbox(dialog, from_=0, to=127, textvariable=velocity_var, width=10)
        velocity_spin.pack(pady=5)
        
        # Duration
        tk.Label(dialog, text="Duration (ticks):", bg=self.bg_dark, fg=self.text_white).pack()
        duration_var = tk.IntVar(value=480)
        duration_spin = tk.Spinbox(dialog, from_=1, to=9600, textvariable=duration_var, width=10)
        duration_spin.pack(pady=5)
        
        # Time offset
        tk.Label(dialog, text="Time offset (ticks):", bg=self.bg_dark, fg=self.text_white).pack()
        time_var = tk.IntVar(value=0)
        time_spin = tk.Spinbox(dialog, from_=0, to=9600, textvariable=time_var, width=10)
        time_spin.pack(pady=5)
        
        def add_note():
            track_idx = track_var.get()
            note = note_var.get()
            velocity = velocity_var.get()
            duration = duration_var.get()
            time_offset = time_var.get()
            
            track = self.midi_file.tracks[track_idx]
            track.append(Message('note_on', note=note, velocity=velocity, time=time_offset))
            track.append(Message('note_off', note=note, velocity=0, time=duration))
            
            self.refresh_tracks()
            self.status_label.config(text=f"Added note {note} to track {track_idx}")
            dialog.destroy()
        
        tk.Button(dialog, text="Add Note", command=add_note, bg=self.button_green, 
                 fg=self.text_white, font=('Courier New', 10, 'bold')).pack(pady=15)
    
    def view_track(self):
        selection = self.track_listbox.curselection()
        if not selection:
            messagebox.showwarning("Warning", "Select a track first")
            return
        
        track_idx = selection[0]
        track = self.midi_file.tracks[track_idx]
        
        dialog = tk.Toplevel(self.root)
        dialog.title(f"Track {track_idx} Contents")
        dialog.geometry("600x400")
        dialog.configure(bg=self.bg_dark)
        
        text = tk.Text(dialog, bg=self.bg_medium, fg=self.text_white, 
                      font=('Courier New', 9), wrap=tk.WORD)
        text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        for msg in track:
            text.insert(tk.END, f"{msg}\n")
        
        text.config(state=tk.DISABLED)
    
    def delete_track(self):
        selection = self.track_listbox.curselection()
        if not selection:
            messagebox.showwarning("Warning", "Select a track first")
            return
        
        track_idx = selection[0]
        if messagebox.askyesno("Confirm", f"Delete track {track_idx}?"):
            del self.midi_file.tracks[track_idx]
            self.refresh_tracks()
            self.status_label.config(text=f"Deleted track {track_idx}")

if __name__ == "__main__":
    root = tk.Tk()
    app = MIDIEditor(root)
    root.mainloop()
