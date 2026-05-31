import tkinter as tk
from tkinter import filedialog, ttk, messagebox, scrolledtext
import mido
from mido import MidiFile, MidiTrack, Message, MetaMessage
import os

class ImprovedMIDIEditor:
    def __init__(self, root):
        self.root = root
        self.root.title("🎼 MIDI Composer & Editor")
        self.root.geometry("1000x700")
        
        # Modern color palette
        self.bg_dark = '#1e1e2e'
        self.bg_medium = '#2a2a3e'
        self.bg_light = '#363650'
        self.accent_primary = '#89b4fa'
        self.accent_secondary = '#f5c2e7'
        self.accent_success = '#a6e3a1'
        self.accent_warning = '#f9e2af'
        self.text_white = '#cdd6f4'
        self.text_muted = '#9399b2'
        
        self.root.configure(bg=self.bg_dark)
        
        self.midi_file = None
        self.filename = None
        self.selected_track_idx = None
        
        # Note names for reference
        self.note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        self.setup_ui()
        self.new_midi()  # Start with a new file
    
    def setup_ui(self):
        # Main container with padding
        main_container = tk.Frame(self.root, bg=self.bg_dark)
        main_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Top section: Title and file operations
        self.setup_header(main_container)
        
        # Middle section: Two-column layout
        content_frame = tk.Frame(main_container, bg=self.bg_dark)
        content_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Left panel: Track list
        self.setup_track_panel(content_frame)
        
        # Right panel: Note editor
        self.setup_note_panel(content_frame)
        
        # Bottom section: Status and quick actions
        self.setup_footer(main_container)
    
    def setup_header(self, parent):
        header = tk.Frame(parent, bg=self.bg_medium, relief=tk.FLAT, bd=0)
        header.pack(fill=tk.X, pady=(0, 10))
        
        # Title section
        title_frame = tk.Frame(header, bg=self.bg_medium)
        title_frame.pack(side=tk.LEFT, padx=15, pady=10)
        
        tk.Label(
            title_frame,
            text="🎼 MIDI Composer",
            bg=self.bg_medium,
            fg=self.accent_primary,
            font=('Segoe UI', 16, 'bold')
        ).pack(anchor=tk.W)
        
        self.file_label = tk.Label(
            title_frame,
            text="New Project",
            bg=self.bg_medium,
            fg=self.text_muted,
            font=('Segoe UI', 9)
        )
        self.file_label.pack(anchor=tk.W)
        
        # File operations buttons
        btn_frame = tk.Frame(header, bg=self.bg_medium)
        btn_frame.pack(side=tk.RIGHT, padx=15, pady=10)
        
        button_style = {
            'font': ('Segoe UI', 9),
            'relief': tk.FLAT,
            'bd': 0,
            'cursor': 'hand2',
            'padx': 15,
            'pady': 8
        }
        
        tk.Button(
            btn_frame,
            text="📄 New",
            command=self.new_midi,
            bg=self.bg_light,
            fg=self.text_white,
            activebackground=self.accent_primary,
            **button_style
        ).pack(side=tk.LEFT, padx=2)
        
        tk.Button(
            btn_frame,
            text="📂 Open",
            command=self.open_midi,
            bg=self.bg_light,
            fg=self.text_white,
            activebackground=self.accent_primary,
            **button_style
        ).pack(side=tk.LEFT, padx=2)
        
        tk.Button(
            btn_frame,
            text="💾 Save",
            command=self.save_midi,
            bg=self.accent_success,
            fg=self.bg_dark,
            activebackground=self.accent_warning,
            **button_style
        ).pack(side=tk.LEFT, padx=2)
        
        tk.Button(
            btn_frame,
            text="💾 Save As",
            command=self.save_as_midi,
            bg=self.bg_light,
            fg=self.text_white,
            activebackground=self.accent_primary,
            **button_style
        ).pack(side=tk.LEFT, padx=2)
    
    def setup_track_panel(self, parent):
        left_panel = tk.Frame(parent, bg=self.bg_medium, width=350)
        left_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=False, padx=(0, 5))
        left_panel.pack_propagate(False)
        
        # Track panel header
        header = tk.Frame(left_panel, bg=self.bg_medium)
        header.pack(fill=tk.X, padx=15, pady=10)
        
        tk.Label(
            header,
            text="Tracks",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 12, 'bold')
        ).pack(side=tk.LEFT)
        
        tk.Button(
            header,
            text="+ Add Track",
            command=self.add_track,
            bg=self.accent_primary,
            fg=self.bg_dark,
            font=('Segoe UI', 9, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            padx=10,
            pady=5
        ).pack(side=tk.RIGHT)
        
        # Track listbox with custom styling
        list_container = tk.Frame(left_panel, bg=self.bg_dark)
        list_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=(0, 10))
        
        scrollbar = tk.Scrollbar(list_container, bg=self.bg_light)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.track_listbox = tk.Listbox(
            list_container,
            bg=self.bg_dark,
            fg=self.text_white,
            font=('Consolas', 10),
            selectbackground=self.accent_primary,
            selectforeground=self.bg_dark,
            activestyle='none',
            relief=tk.FLAT,
            highlightthickness=0,
            yscrollcommand=scrollbar.set
        )
        self.track_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.track_listbox.bind('<<ListboxSelect>>', self.on_track_select)
        scrollbar.config(command=self.track_listbox.yview)
        
        # Track action buttons
        action_frame = tk.Frame(left_panel, bg=self.bg_medium)
        action_frame.pack(fill=tk.X, padx=10, pady=(0, 10))
        
        btn_style = {
            'font': ('Segoe UI', 9),
            'relief': tk.FLAT,
            'cursor': 'hand2',
            'padx': 10,
            'pady': 6
        }
        
        tk.Button(
            action_frame,
            text="🔍 View Details",
            command=self.view_track,
            bg=self.bg_light,
            fg=self.text_white,
            **btn_style
        ).pack(side=tk.LEFT, padx=2, expand=True, fill=tk.X)
        
        tk.Button(
            action_frame,
            text="✏️ Rename",
            command=self.rename_track,
            bg=self.bg_light,
            fg=self.text_white,
            **btn_style
        ).pack(side=tk.LEFT, padx=2, expand=True, fill=tk.X)
        
        tk.Button(
            action_frame,
            text="🗑️ Delete",
            command=self.delete_track,
            bg='#f38ba8',
            fg=self.bg_dark,
            **btn_style
        ).pack(side=tk.LEFT, padx=2, expand=True, fill=tk.X)
    
    def setup_note_panel(self, parent):
        right_panel = tk.Frame(parent, bg=self.bg_medium)
        right_panel.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(5, 0))
        
        # Note panel header
        header = tk.Frame(right_panel, bg=self.bg_medium)
        header.pack(fill=tk.X, padx=15, pady=10)
        
        tk.Label(
            header,
            text="Add Notes",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 12, 'bold')
        ).pack(side=tk.LEFT)
        
        self.track_info_label = tk.Label(
            header,
            text="Select a track to add notes",
            bg=self.bg_medium,
            fg=self.text_muted,
            font=('Segoe UI', 9)
        )
        self.track_info_label.pack(side=tk.RIGHT)
        
        # Note input form
        form_container = tk.Frame(right_panel, bg=self.bg_medium)
        form_container.pack(fill=tk.BOTH, expand=True, padx=15, pady=(0, 10))
        
        # Create a grid for inputs
        input_frame = tk.Frame(form_container, bg=self.bg_medium)
        input_frame.pack(fill=tk.X, pady=10)
        
        # Note input with piano keyboard helper
        self.create_input_row(input_frame, "Note", 0)
        self.note_var = tk.IntVar(value=60)
        self.note_scale = tk.Scale(
            input_frame,
            from_=0,
            to=127,
            orient=tk.HORIZONTAL,
            variable=self.note_var,
            bg=self.bg_light,
            fg=self.text_white,
            highlightthickness=0,
            troughcolor=self.bg_dark,
            activebackground=self.accent_primary,
            command=self.update_note_label
        )
        self.note_scale.grid(row=0, column=1, sticky='ew', padx=10, pady=5)
        
        self.note_label = tk.Label(
            input_frame,
            text="C4 (Middle C)",
            bg=self.bg_medium,
            fg=self.accent_secondary,
            font=('Segoe UI', 10, 'bold'),
            width=15
        )
        self.note_label.grid(row=0, column=2, padx=5)
        
        # Velocity input
        self.create_input_row(input_frame, "Velocity", 1)
        self.velocity_var = tk.IntVar(value=80)
        tk.Scale(
            input_frame,
            from_=1,
            to=127,
            orient=tk.HORIZONTAL,
            variable=self.velocity_var,
            bg=self.bg_light,
            fg=self.text_white,
            highlightthickness=0,
            troughcolor=self.bg_dark,
            activebackground=self.accent_primary
        ).grid(row=1, column=1, sticky='ew', padx=10, pady=5)
        
        tk.Label(
            input_frame,
            text="(Volume)",
            bg=self.bg_medium,
            fg=self.text_muted,
            font=('Segoe UI', 9)
        ).grid(row=1, column=2, padx=5)
        
        # Duration input with presets
        self.create_input_row(input_frame, "Duration", 2)
        duration_frame = tk.Frame(input_frame, bg=self.bg_medium)
        duration_frame.grid(row=2, column=1, columnspan=2, sticky='ew', padx=10, pady=5)
        
        self.duration_var = tk.IntVar(value=480)
        tk.Spinbox(
            duration_frame,
            from_=1,
            to=9600,
            textvariable=self.duration_var,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 10),
            width=10,
            relief=tk.FLAT
        ).pack(side=tk.LEFT, padx=(0, 10))
        
        # Duration presets
        preset_frame = tk.Frame(duration_frame, bg=self.bg_medium)
        preset_frame.pack(side=tk.LEFT)
        
        presets = [
            ("♪ 1/16", 120),
            ("♪ 1/8", 240),
            ("♩ 1/4", 480),
            ("𝅗𝅥 1/2", 960),
            ("𝅝 Whole", 1920)
        ]
        
        for text, value in presets:
            tk.Button(
                preset_frame,
                text=text,
                command=lambda v=value: self.duration_var.set(v),
                bg=self.bg_light,
                fg=self.text_white,
                font=('Segoe UI', 8),
                relief=tk.FLAT,
                cursor='hand2',
                padx=5,
                pady=2
            ).pack(side=tk.LEFT, padx=2)
        
        # Time offset input
        self.create_input_row(input_frame, "Time Offset", 3)
        self.time_var = tk.IntVar(value=0)
        tk.Spinbox(
            input_frame,
            from_=0,
            to=9600,
            textvariable=self.time_var,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 10),
            width=10,
            relief=tk.FLAT
        ).grid(row=3, column=1, sticky='w', padx=10, pady=5)
        
        tk.Label(
            input_frame,
            text="(Delay in ticks)",
            bg=self.bg_medium,
            fg=self.text_muted,
            font=('Segoe UI', 9)
        ).grid(row=3, column=2, padx=5)
        
        input_frame.columnconfigure(1, weight=1)
        
        # Add note button
        tk.Button(
            form_container,
            text="➕ Add Note to Track",
            command=self.add_note,
            bg=self.accent_success,
            fg=self.bg_dark,
            font=('Segoe UI', 11, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            padx=20,
            pady=12
        ).pack(pady=20)
        
        # Quick reference
        ref_frame = tk.Frame(form_container, bg=self.bg_dark, relief=tk.FLAT)
        ref_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        tk.Label(
            ref_frame,
            text="📖 Quick Reference",
            bg=self.bg_dark,
            fg=self.accent_warning,
            font=('Segoe UI', 10, 'bold')
        ).pack(anchor=tk.W, padx=10, pady=5)
        
        ref_text = """
• Note 60 = Middle C (C4)
• Velocity: 1-127 (higher = louder)
• Duration: 480 ticks = quarter note (at 480 PPQ)
• Time offset: Delay before note starts
• Add multiple notes to create melodies!
        """
        
        tk.Label(
            ref_frame,
            text=ref_text,
            bg=self.bg_dark,
            fg=self.text_muted,
            font=('Consolas', 9),
            justify=tk.LEFT
        ).pack(anchor=tk.W, padx=10, pady=5)
    
    def create_input_row(self, parent, label_text, row):
        tk.Label(
            parent,
            text=label_text + ":",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 10, 'bold'),
            width=12,
            anchor='e'
        ).grid(row=row, column=0, padx=10, pady=5, sticky='e')
    
    def update_note_label(self, value):
        note_num = int(float(value))
        octave = (note_num // 12) - 1
        note_name = self.note_names[note_num % 12]
        label = f"{note_name}{octave}"
        
        if note_num == 60:
            label += " (Middle C)"
        
        self.note_label.config(text=label)
    
    def setup_footer(self, parent):
        footer = tk.Frame(parent, bg=self.bg_medium, relief=tk.FLAT)
        footer.pack(fill=tk.X, pady=(10, 0))
        
        self.status_label = tk.Label(
            footer,
            text="✓ Ready to compose",
            bg=self.bg_medium,
            fg=self.accent_success,
            font=('Segoe UI', 10),
            anchor='w',
            padx=15,
            pady=10
        )
        self.status_label.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Info label
        self.info_label = tk.Label(
            footer,
            text="",
            bg=self.bg_medium,
            fg=self.text_muted,
            font=('Segoe UI', 9),
            anchor='e',
            padx=15
        )
        self.info_label.pack(side=tk.RIGHT)
    
    def new_midi(self):
        if self.midi_file and messagebox.askyesno("New File", "Create new file? Unsaved changes will be lost."):
            pass
        elif self.midi_file:
            return
        
        self.midi_file = MidiFile(ticks_per_beat=480)
        track = MidiTrack()
        track.append(MetaMessage('track_name', name='Track 1', time=0))
        track.append(MetaMessage('set_tempo', tempo=500000, time=0))
        self.midi_file.tracks.append(track)
        
        self.filename = None
        self.file_label.config(text="New Project")
        self.refresh_tracks()
        self.status_label.config(text="✓ New MIDI file created", fg=self.accent_success)
        self.update_info()
    
    def open_midi(self):
        filename = filedialog.askopenfilename(
            title="Open MIDI file",
            filetypes=[("MIDI files", "*.mid *.midi"), ("All files", "*.*")]
        )
        if filename:
            try:
                self.midi_file = MidiFile(filename)
                self.filename = filename
                self.file_label.config(text=os.path.basename(filename))
                self.refresh_tracks()
                self.status_label.config(text=f"✓ Loaded: {os.path.basename(filename)}", fg=self.accent_success)
                self.update_info()
            except Exception as e:
                messagebox.showerror("Error", f"Failed to open file:\n{str(e)}")
                self.status_label.config(text="✗ Failed to open file", fg='#f38ba8')
    
    def save_midi(self):
        if not self.midi_file:
            messagebox.showwarning("Warning", "No MIDI file to save")
            return
        
        if self.filename:
            try:
                self.midi_file.save(self.filename)
                self.status_label.config(text="✓ File saved successfully", fg=self.accent_success)
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save:\n{str(e)}")
                self.status_label.config(text="✗ Save failed", fg='#f38ba8')
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
                self.file_label.config(text=os.path.basename(filename))
                self.status_label.config(text="✓ File saved successfully", fg=self.accent_success)
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save:\n{str(e)}")
                self.status_label.config(text="✗ Save failed", fg='#f38ba8')
    
    def refresh_tracks(self):
        self.track_listbox.delete(0, tk.END)
        if self.midi_file:
            for i, track in enumerate(self.midi_file.tracks):
                track_name = f"Track {i+1}"
                for msg in track:
                    if msg.type == 'track_name':
                        track_name = msg.name
                        break
                note_count = sum(1 for msg in track if msg.type == 'note_on')
                self.track_listbox.insert(tk.END, f"♪ {track_name} ({note_count} notes)")
    
    def on_track_select(self, event):
        selection = self.track_listbox.curselection()
        if selection:
            self.selected_track_idx = selection[0]
            track_name = self.track_listbox.get(selection[0])
            self.track_info_label.config(text=f"Adding to: {track_name}")
        else:
            self.selected_track_idx = None
            self.track_info_label.config(text="Select a track to add notes")
    
    def add_track(self):
        if not self.midi_file:
            self.new_midi()
        
        track_num = len(self.midi_file.tracks) + 1
        track = MidiTrack()
        track.append(MetaMessage('track_name', name=f'Track {track_num}', time=0))
        self.midi_file.tracks.append(track)
        self.refresh_tracks()
        self.status_label.config(text=f"✓ Added Track {track_num}", fg=self.accent_success)
        self.update_info()
    
    def add_note(self):
        if not self.midi_file or not self.midi_file.tracks:
            messagebox.showwarning("Warning", "Create a track first")
            return
        
        if self.selected_track_idx is None:
            messagebox.showwarning("Warning", "Select a track first")
            return
        
        note = self.note_var.get()
        velocity = self.velocity_var.get()
        duration = self.duration_var.get()
        time_offset = self.time_var.get()
        
        track = self.midi_file.tracks[self.selected_track_idx]
        track.append(Message('note_on', note=note, velocity=velocity, time=time_offset))
        track.append(Message('note_off', note=note, velocity=0, time=duration))
        
        self.refresh_tracks()
        
        octave = (note // 12) - 1
        note_name = self.note_names[note % 12]
        self.status_label.config(
            text=f"✓ Added note {note_name}{octave} to track {self.selected_track_idx + 1}",
            fg=self.accent_success
        )
    
    def rename_track(self):
        if self.selected_track_idx is None:
            messagebox.showwarning("Warning", "Select a track first")
            return
        
        track = self.midi_file.tracks[self.selected_track_idx]
        
        # Get current name
        current_name = f"Track {self.selected_track_idx + 1}"
        for msg in track:
            if msg.type == 'track_name':
                current_name = msg.name
                break
        
        # Ask for new name
        new_name = tk.simpledialog.askstring("Rename Track", "Enter new track name:", initialvalue=current_name)
        
        if new_name:
            # Update or add track name
            found = False
            for i, msg in enumerate(track):
                if msg.type == 'track_name':
                    track[i] = MetaMessage('track_name', name=new_name, time=msg.time)
                    found = True
                    break
            
            if not found:
                track.insert(0, MetaMessage('track_name', name=new_name, time=0))
            
            self.refresh_tracks()
            self.status_label.config(text=f"✓ Renamed to: {new_name}", fg=self.accent_success)
    
    def view_track(self):
        if self.selected_track_idx is None:
            messagebox.showwarning("Warning", "Select a track first")
            return
        
        track = self.midi_file.tracks[self.selected_track_idx]
        
        dialog = tk.Toplevel(self.root)
        dialog.title(f"Track {self.selected_track_idx + 1} Details")
        dialog.geometry("700x500")
        dialog.configure(bg=self.bg_dark)
        
        # Header
        header = tk.Frame(dialog, bg=self.bg_medium)
        header.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Label(
            header,
            text=f"Track {self.selected_track_idx + 1} Contents",
            bg=self.bg_medium,
            fg=self.accent_primary,
            font=('Segoe UI', 12, 'bold')
        ).pack()
        
        # Text area
        text = scrolledtext.ScrolledText(
            dialog,
            bg=self.bg_dark,
            fg=self.text_white,
            font=('Consolas', 9),
            wrap=tk.WORD,
            relief=tk.FLAT,
            padx=10,
            pady=10
        )
        text.pack(fill=tk.BOTH, expand=True, padx=10, pady=(0, 10))
        
        for msg in track:
            text.insert(tk.END, f"{msg}\n")
        
        text.config(state=tk.DISABLED)
    
    def delete_track(self):
        if self.selected_track_idx is None:
            messagebox.showwarning("Warning", "Select a track first")
            return
        
        if messagebox.askyesno("Confirm", f"Delete track {self.selected_track_idx + 1}?"):
            del self.midi_file.tracks[self.selected_track_idx]
            self.selected_track_idx = None
            self.refresh_tracks()
            self.status_label.config(text="✓ Track deleted", fg=self.accent_success)
            self.update_info()
    
    def update_info(self):
        if self.midi_file:
            tracks = len(self.midi_file.tracks)
            total_notes = sum(sum(1 for msg in track if msg.type == 'note_on') for track in self.midi_file.tracks)
            self.info_label.config(text=f"{tracks} tracks • {total_notes} notes")

if __name__ == "__main__":
    root = tk.Tk()
    app = ImprovedMIDIEditor(root)
    root.mainloop()
