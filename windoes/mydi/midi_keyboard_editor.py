import tkinter as tk
from tkinter import filedialog, ttk, messagebox, scrolledtext
import mido
from mido import MidiFile, MidiTrack, Message, MetaMessage
import os
import threading
import time

class PianoKeyboardEditor:
    def __init__(self, root):
        self.root = root
        self.root.title("🎹 MIDI Piano Keyboard")
        self.root.geometry("1200x850")
        
        # Modern color palette
        self.bg_dark = '#1e1e2e'
        self.bg_medium = '#2a2a3e'
        self.bg_light = '#363650'
        self.accent_primary = '#89b4fa'
        self.accent_secondary = '#f5c2e7'
        self.accent_success = '#a6e3a1'
        self.text_white = '#cdd6f4'
        self.text_muted = '#9399b2'
        
        # Piano colors
        self.white_key = '#f5f5f5'
        self.white_key_pressed = '#89b4fa'
        self.black_key = '#1e1e2e'
        self.black_key_pressed = '#f5c2e7'
        
        self.root.configure(bg=self.bg_dark)
        
        self.midi_file = None
        self.filename = None
        self.selected_track_idx = 0
        self.current_time = 0
        self.recording = False
        self.recorded_notes = []
        
        # Undo/Redo system
        self.undo_stack = []
        self.redo_stack = []
        self.max_undo_levels = 50
        
        # Session file for persistence
        self.session_file = os.path.join(os.path.dirname(__file__), '.midi_session.json')
        
        # Note names
        self.note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        # Piano keyboard state
        self.key_buttons = {}
        self.pressed_keys = set()
        
        # Current octave for keyboard input
        self.current_octave = 4
        
        # Keyboard to MIDI note mapping (AZERTY layout)
        # Bottom row: W X C V B N , ; : !  (white keys C-B)
        # Top of bottom: S D   G H J        (black keys)
        # Middle row: A Z E R T Y U I O P   (next octave white keys)
        # Top of middle: É "   (   È _      (next octave black keys)
        self.keyboard_map = {
            # Lower octave (starts at current octave)
            'w': 0,   # C
            's': 1,   # C#
            'x': 2,   # D
            'd': 3,   # D#
            'c': 4,   # E
            'v': 5,   # F
            'g': 6,   # F#
            'b': 7,   # G
            'h': 8,   # G#
            'n': 9,   # A
            'j': 10,  # A#
            ',': 11,  # B
            # Upper octave (one octave higher)
            'a': 12,  # C
            'é': 13,  # C# (or 'z' for some keyboards)
            'z': 14,  # D
            '"': 15,  # D# (or '2')
            'e': 16,  # E
            'r': 17,  # F
            '(': 18,  # F# (or '5')
            't': 19,  # G
            'è': 20,  # G# (or '7')
            'y': 21,  # A
            '_': 22,  # A# (or '8')
            'u': 23,  # B
            'i': 24,  # C (next octave)
            'o': 26,  # D
            'p': 28,  # E
        }
        
        # Alternative mappings for keyboards without special chars
        self.keyboard_map_alt = {
            '2': 13,  # C#
            '3': 15,  # D#
            '5': 18,  # F#
            '6': 20,  # G#
            '7': 22,  # A#
        }
        
        self.keyboard_pressed = {}  # Track which keyboard keys are pressed
        
        # MIDI output for playback
        try:
            import rtmidi
            self.midi_out = rtmidi.MidiOut()
            available_ports = self.midi_out.get_ports()
            if available_ports:
                self.midi_out.open_port(0)
            else:
                self.midi_out.open_virtual_port("MIDI Keyboard")
        except:
            self.midi_out = None
        
        self.setup_ui()
        
        # Try to load previous session first
        session_loaded = self.load_session()
        
        # Only create new MIDI if no session was loaded
        if not session_loaded:
            self.new_midi()
        
        # Bind keyboard events
        self.root.bind('<KeyPress>', self.on_keyboard_press)
        self.root.bind('<KeyRelease>', self.on_keyboard_release)
        self.root.focus_set()
        
        # Save session on close
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
    
    def setup_ui(self):
        # Main container
        main_container = tk.Frame(self.root, bg=self.bg_dark)
        main_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Top section: Header
        self.setup_header(main_container)
        
        # Middle section: Piano keyboard
        self.setup_piano_keyboard(main_container)
        
        # Bottom section: Controls and track info
        self.setup_controls(main_container)
        
        # Footer
        self.setup_footer(main_container)
    
    def setup_header(self, parent):
        header = tk.Frame(parent, bg=self.bg_medium)
        header.pack(fill=tk.X, pady=(0, 10))
        
        # Title
        title_frame = tk.Frame(header, bg=self.bg_medium)
        title_frame.pack(side=tk.LEFT, padx=15, pady=10)
        
        tk.Label(
            title_frame,
            text="🎹 MIDI Piano Keyboard",
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
        
        # File buttons
        btn_frame = tk.Frame(header, bg=self.bg_medium)
        btn_frame.pack(side=tk.RIGHT, padx=15, pady=10)
        
        btn_style = {
            'font': ('Segoe UI', 9),
            'relief': tk.FLAT,
            'bd': 0,
            'cursor': 'hand2',
            'padx': 12,
            'pady': 6
        }
        
        tk.Button(btn_frame, text="📄 New", command=self.new_midi, bg=self.bg_light, fg=self.text_white, **btn_style).pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="📂 Open", command=self.open_midi, bg=self.bg_light, fg=self.text_white, **btn_style).pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="💾 Save", command=self.save_midi, bg=self.accent_success, fg=self.bg_dark, **btn_style).pack(side=tk.LEFT, padx=2)
        
        # Undo/Redo buttons
        tk.Button(btn_frame, text="↶ Undo", command=self.undo, bg=self.bg_light, fg=self.text_white, **btn_style).pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="↷ Redo", command=self.redo, bg=self.bg_light, fg=self.text_white, **btn_style).pack(side=tk.LEFT, padx=2)
    
    def setup_piano_keyboard(self, parent):
        keyboard_container = tk.Frame(parent, bg=self.bg_medium)
        keyboard_container.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Keyboard info
        info_frame = tk.Frame(keyboard_container, bg=self.bg_medium)
        info_frame.pack(fill=tk.X, padx=15, pady=10)
        
        tk.Label(
            info_frame,
            text="🎹 AZERTY keyboard: W-N-, (lower), A-P (upper) • ← → octave • Ctrl+Z undo • Ctrl+Y redo",
            bg=self.bg_medium,
            fg=self.text_muted,
            font=('Segoe UI', 9)
        ).pack(side=tk.LEFT)
        
        self.octave_label = tk.Label(
            info_frame,
            text="Octave: 4 (Middle C)",
            bg=self.bg_medium,
            fg=self.accent_primary,
            font=('Segoe UI', 10, 'bold')
        )
        self.octave_label.pack(side=tk.RIGHT)
        
        # Keyboard layout guide
        guide_frame = tk.Frame(keyboard_container, bg=self.bg_dark, relief=tk.FLAT)
        guide_frame.pack(fill=tk.X, padx=15, pady=(10, 0))
        
        tk.Label(
            guide_frame,
            text="⌨️ Keyboard Layout (AZERTY):",
            bg=self.bg_dark,
            fg=self.accent_primary,
            font=('Segoe UI', 9, 'bold')
        ).pack(anchor=tk.W, padx=5, pady=2)
        
        layout_text = """
Lower Octave:  W  X  C  V  B  N  ,     (White keys: C D E F G A B)
               S  D     G  H  J        (Black keys: C# D# F# G# A#)

Upper Octave:  A  Z  E  R  T  Y  U  I  O  P    (White keys: C D E F G A B C D E)
               2  3     5  6  7                 (Black keys: C# D# F# G# A#)

Controls: ← → (Change octave)  |  Current octave shown in top right
        """
        
        tk.Label(
            guide_frame,
            text=layout_text,
            bg=self.bg_dark,
            fg=self.text_muted,
            font=('Consolas', 8),
            justify=tk.LEFT
        ).pack(anchor=tk.W, padx=5, pady=2)
        
        # Piano keyboard canvas
        canvas_frame = tk.Frame(keyboard_container, bg=self.bg_dark)
        canvas_frame.pack(fill=tk.BOTH, expand=True, padx=15, pady=(10, 10))
        
        self.piano_canvas = tk.Canvas(
            canvas_frame,
            bg=self.bg_dark,
            highlightthickness=0,
            height=300
        )
        self.piano_canvas.pack(fill=tk.BOTH, expand=True)
        
        # Draw piano keyboard
        self.draw_piano_keyboard()
        
        # Bind mouse events
        self.piano_canvas.bind('<Button-1>', self.on_key_press)
        self.piano_canvas.bind('<ButtonRelease-1>', self.on_key_release)
        self.piano_canvas.bind('<B1-Motion>', self.on_key_drag)
    
    def draw_piano_keyboard(self):
        self.piano_canvas.delete('all')
        
        # Calculate dimensions
        canvas_width = self.piano_canvas.winfo_width()
        if canvas_width <= 1:
            canvas_width = 1000
        
        canvas_height = 300
        
        # Draw 3 octaves (C3 to B5) - 36 white keys
        num_octaves = 3
        start_octave = 3
        white_keys_per_octave = 7
        total_white_keys = num_octaves * white_keys_per_octave
        
        white_key_width = canvas_width / total_white_keys
        white_key_height = canvas_height * 0.8
        black_key_width = white_key_width * 0.6
        black_key_height = white_key_height * 0.6
        
        self.key_buttons = {}
        
        # Pattern of black keys (1 = has black key to the right)
        black_key_pattern = [1, 1, 0, 1, 1, 1, 0]  # C, D, E, F, G, A, B
        
        # Draw white keys first
        white_key_index = 0
        for octave in range(start_octave, start_octave + num_octaves):
            for note_in_octave in range(12):
                note_name = self.note_names[note_in_octave]
                
                # Only draw white keys
                if '#' not in note_name:
                    note_num = (octave + 1) * 12 + note_in_octave
                    x1 = white_key_index * white_key_width
                    y1 = canvas_height - white_key_height
                    x2 = x1 + white_key_width
                    y2 = canvas_height
                    
                    # Draw key
                    key_id = self.piano_canvas.create_rectangle(
                        x1, y1, x2, y2,
                        fill=self.white_key,
                        outline=self.bg_dark,
                        width=2,
                        tags=('white_key', f'note_{note_num}')
                    )
                    
                    # Draw note label
                    label_text = f"{note_name}{octave}"
                    if note_num == 60:
                        label_text += "\n(C4)"
                    
                    self.piano_canvas.create_text(
                        (x1 + x2) / 2,
                        y2 - 20,
                        text=label_text,
                        fill=self.bg_dark,
                        font=('Segoe UI', 8),
                        tags=f'note_{note_num}'
                    )
                    
                    self.key_buttons[note_num] = {
                        'id': key_id,
                        'type': 'white',
                        'bounds': (x1, y1, x2, y2)
                    }
                    
                    white_key_index += 1
        
        # Draw black keys on top
        white_key_index = 0
        for octave in range(start_octave, start_octave + num_octaves):
            for i, note_in_octave in enumerate([0, 2, 4, 5, 7, 9, 11]):  # C, D, E, F, G, A, B
                if i < len(black_key_pattern) and black_key_pattern[i]:
                    # Draw black key
                    note_num = (octave + 1) * 12 + note_in_octave + 1
                    x1 = (white_key_index + 0.7) * white_key_width
                    y1 = canvas_height - white_key_height
                    x2 = x1 + black_key_width
                    y2 = y1 + black_key_height
                    
                    key_id = self.piano_canvas.create_rectangle(
                        x1, y1, x2, y2,
                        fill=self.black_key,
                        outline=self.bg_dark,
                        width=2,
                        tags=('black_key', f'note_{note_num}')
                    )
                    
                    # Draw note label
                    note_name = self.note_names[note_in_octave + 1]
                    self.piano_canvas.create_text(
                        (x1 + x2) / 2,
                        y2 - 15,
                        text=f"{note_name}{octave}",
                        fill=self.white_key,
                        font=('Segoe UI', 7),
                        tags=f'note_{note_num}'
                    )
                    
                    self.key_buttons[note_num] = {
                        'id': key_id,
                        'type': 'black',
                        'bounds': (x1, y1, x2, y2)
                    }
                
                white_key_index += 1
    
    def get_note_at_position(self, x, y):
        # Check black keys first (they're on top)
        for note_num, key_info in self.key_buttons.items():
            if key_info['type'] == 'black':
                x1, y1, x2, y2 = key_info['bounds']
                if x1 <= x <= x2 and y1 <= y <= y2:
                    return note_num
        
        # Then check white keys
        for note_num, key_info in self.key_buttons.items():
            if key_info['type'] == 'white':
                x1, y1, x2, y2 = key_info['bounds']
                if x1 <= x <= x2 and y1 <= y <= y2:
                    return note_num
        
        return None
    
    def on_key_press(self, event):
        note_num = self.get_note_at_position(event.x, event.y)
        if note_num is not None:
            self.play_note(note_num)
    
    def on_key_release(self, event):
        # Release all pressed keys
        for note_num in list(self.pressed_keys):
            self.release_note(note_num)
    
    def on_key_drag(self, event):
        note_num = self.get_note_at_position(event.x, event.y)
        if note_num is not None and note_num not in self.pressed_keys:
            # Release old notes
            for old_note in list(self.pressed_keys):
                self.release_note(old_note)
            # Play new note
            self.play_note(note_num)
    
    def on_keyboard_press(self, event):
        """Handle computer keyboard key press"""
        # Check for Ctrl+Z (Undo) and Ctrl+Y (Redo) first
        if event.state & 0x4 or event.state & 0x40004:  # Ctrl key (works on different systems)
            if event.keysym.lower() == 'z':
                print("Ctrl+Z pressed - calling undo")
                self.undo()
                return
            elif event.keysym.lower() == 'y':
                print("Ctrl+Y pressed - calling redo")
                self.redo()
                return
        
        key = event.char.lower()
        
        # Ignore if key is already pressed (key repeat)
        if key in self.keyboard_pressed:
            return
        
        # Check for octave change
        if event.keysym == 'Left':
            self.current_octave = max(0, self.current_octave - 1)
            self.octave_label.config(text=f"Octave: {self.current_octave}")
            return
        elif event.keysym == 'Right':
            self.current_octave = min(8, self.current_octave + 1)
            self.octave_label.config(text=f"Octave: {self.current_octave}")
            return
        
        # Check if key is mapped to a note
        note_offset = None
        if key in self.keyboard_map:
            note_offset = self.keyboard_map[key]
        elif key in self.keyboard_map_alt:
            note_offset = self.keyboard_map_alt[key]
        
        if note_offset is not None:
            note_num = (self.current_octave + 1) * 12 + note_offset
            
            # Only play if note is in valid MIDI range (0-127)
            if 0 <= note_num <= 127:
                self.keyboard_pressed[key] = note_num
                self.play_note(note_num)
    
    def on_keyboard_release(self, event):
        """Handle computer keyboard key release"""
        key = event.char.lower()
        
        if key in self.keyboard_pressed:
            note_num = self.keyboard_pressed[key]
            del self.keyboard_pressed[key]
            self.release_note(note_num)
    
    def play_note(self, note_num, velocity=80):
        if note_num in self.pressed_keys:
            return
        
        self.pressed_keys.add(note_num)
        
        # Visual feedback
        key_info = self.key_buttons.get(note_num)
        if key_info:
            color = self.white_key_pressed if key_info['type'] == 'white' else self.black_key_pressed
            self.piano_canvas.itemconfig(key_info['id'], fill=color)
        
        # Play MIDI note
        if self.midi_out:
            try:
                self.midi_out.send_message([0x90, note_num, velocity])
            except:
                pass
        
        # Add to track if recording
        if self.recording:
            self.recorded_notes.append({
                'note': note_num,
                'velocity': velocity,
                'time': time.time(),
                'type': 'on'
            })
    
    def release_note(self, note_num):
        if note_num not in self.pressed_keys:
            return
        
        self.pressed_keys.discard(note_num)
        
        # Visual feedback
        key_info = self.key_buttons.get(note_num)
        if key_info:
            color = self.white_key if key_info['type'] == 'white' else self.black_key
            self.piano_canvas.itemconfig(key_info['id'], fill=color)
        
        # Stop MIDI note
        if self.midi_out:
            try:
                self.midi_out.send_message([0x80, note_num, 0])
            except:
                pass
        
        # Add to track if recording
        if self.recording:
            self.recorded_notes.append({
                'note': note_num,
                'time': time.time(),
                'type': 'off'
            })
    
    def setup_controls(self, parent):
        controls = tk.Frame(parent, bg=self.bg_medium)
        controls.pack(fill=tk.X, pady=10)
        
        # Left side: Recording controls
        left_frame = tk.Frame(controls, bg=self.bg_medium)
        left_frame.pack(side=tk.LEFT, padx=15, pady=10)
        
        tk.Label(
            left_frame,
            text="Recording",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 11, 'bold')
        ).pack(anchor=tk.W)
        
        btn_frame = tk.Frame(left_frame, bg=self.bg_medium)
        btn_frame.pack(anchor=tk.W, pady=5)
        
        self.record_btn = tk.Button(
            btn_frame,
            text="⏺ Start Recording",
            command=self.toggle_recording,
            bg='#f38ba8',
            fg=self.bg_dark,
            font=('Segoe UI', 10, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            padx=15,
            pady=8
        )
        self.record_btn.pack(side=tk.LEFT, padx=2)
        
        tk.Button(
            btn_frame,
            text="🗑️ Clear Recording",
            command=self.clear_recording,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 9),
            relief=tk.FLAT,
            cursor='hand2',
            padx=12,
            pady=8
        ).pack(side=tk.LEFT, padx=2)
        
        self.record_status = tk.Label(
            left_frame,
            text="Not recording",
            bg=self.bg_medium,
            fg=self.text_muted,
            font=('Segoe UI', 9)
        )
        self.record_status.pack(anchor=tk.W)
        
        # Right side: Track selection
        right_frame = tk.Frame(controls, bg=self.bg_medium)
        right_frame.pack(side=tk.RIGHT, padx=15, pady=10)
        
        tk.Label(
            right_frame,
            text="Track:",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 10)
        ).pack(side=tk.LEFT, padx=(0, 10))
        
        self.track_combo = ttk.Combobox(
            right_frame,
            values=['Track 1'],
            state='readonly',
            width=15,
            font=('Segoe UI', 9)
        )
        self.track_combo.set('Track 1')
        self.track_combo.pack(side=tk.LEFT, padx=5)
        
        tk.Button(
            right_frame,
            text="+ Add Track",
            command=self.add_track,
            bg=self.accent_primary,
            fg=self.bg_dark,
            font=('Segoe UI', 9, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            padx=12,
            pady=6
        ).pack(side=tk.LEFT, padx=5)
    
    def setup_footer(self, parent):
        footer = tk.Frame(parent, bg=self.bg_medium)
        footer.pack(fill=tk.X, pady=(10, 0))
        
        self.status_label = tk.Label(
            footer,
            text="✓ Ready to play",
            bg=self.bg_medium,
            fg=self.accent_success,
            font=('Segoe UI', 10),
            anchor='w',
            padx=15,
            pady=10
        )
        self.status_label.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        self.info_label = tk.Label(
            footer,
            text="0 notes recorded",
            bg=self.bg_medium,
            fg=self.text_muted,
            font=('Segoe UI', 9),
            anchor='e',
            padx=15
        )
        self.info_label.pack(side=tk.RIGHT)
        
        # Debug button (can be removed later)
        debug_btn = tk.Button(
            footer,
            text="Debug: Show Undo Stack",
            command=self.show_undo_stack,
            bg=self.bg_light,
            fg=self.text_muted,
            font=('Segoe UI', 8),
            relief=tk.FLAT,
            cursor='hand2',
            padx=8,
            pady=4
        )
        debug_btn.pack(side=tk.RIGHT, padx=10)
    
    def toggle_recording(self):
        self.recording = not self.recording
        
        if self.recording:
            self.recorded_notes = []
            self.record_btn.config(text="⏹ Stop Recording", bg=self.accent_success)
            self.record_status.config(text="🔴 Recording...", fg='#f38ba8')
            self.status_label.config(text="🔴 Recording - Play notes on keyboard", fg='#f38ba8')
        else:
            self.record_btn.config(text="⏺ Start Recording", bg='#f38ba8')
            self.record_status.config(text="Not recording", fg=self.text_muted)
            self.save_recording()
    
    def clear_recording(self):
        self.recorded_notes = []
        self.info_label.config(text="0 notes recorded")
        self.status_label.config(text="✓ Recording cleared", fg=self.accent_success)
    
    def save_recording(self):
        if not self.recorded_notes:
            self.status_label.config(text="⚠ No notes to save", fg='#f9e2af')
            return
        
        if not self.midi_file or not self.midi_file.tracks:
            self.new_midi()
        
        # Save state before modifying
        self.save_state()
        
        track = self.midi_file.tracks[self.selected_track_idx]
        
        # Convert recorded notes to MIDI messages
        start_time = self.recorded_notes[0]['time']
        ticks_per_beat = self.midi_file.ticks_per_beat
        
        for i, note_event in enumerate(self.recorded_notes):
            time_delta = int((note_event['time'] - start_time) * ticks_per_beat)
            
            if note_event['type'] == 'on':
                track.append(Message('note_on', 
                    note=note_event['note'], 
                    velocity=note_event['velocity'], 
                    time=time_delta if i == 0 else 0))
            else:
                track.append(Message('note_off', 
                    note=note_event['note'], 
                    velocity=0, 
                    time=time_delta))
        
        # Save state after modifying (this becomes the new current state)
        self.save_state()
        
        note_count = sum(1 for n in self.recorded_notes if n['type'] == 'on')
        self.info_label.config(text=f"{note_count} notes saved to track")
        self.status_label.config(text=f"✓ Saved {note_count} notes to track", fg=self.accent_success)
    
    def new_midi(self):
        self.midi_file = MidiFile(ticks_per_beat=480)
        track = MidiTrack()
        track.append(MetaMessage('track_name', name='Track 1', time=0))
        track.append(MetaMessage('set_tempo', tempo=500000, time=0))
        self.midi_file.tracks.append(track)
        
        self.filename = None
        self.file_label.config(text="New Project")
        self.update_track_list()
        self.status_label.config(text="✓ New MIDI file created", fg=self.accent_success)
        
        # Save initial state
        self.save_state()
    
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
                self.update_track_list()
                self.status_label.config(text=f"✓ Loaded: {os.path.basename(filename)}", fg=self.accent_success)
            except Exception as e:
                messagebox.showerror("Error", f"Failed to open file:\n{str(e)}")
    
    def save_midi(self):
        if not self.midi_file:
            return
        
        if self.filename:
            try:
                self.midi_file.save(self.filename)
                self.status_label.config(text="✓ File saved", fg=self.accent_success)
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save:\n{str(e)}")
        else:
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
                    self.status_label.config(text="✓ File saved", fg=self.accent_success)
                except Exception as e:
                    messagebox.showerror("Error", f"Failed to save:\n{str(e)}")
    
    def add_track(self):
        if not self.midi_file:
            self.new_midi()
        
        # Save state before modifying
        self.save_state()
        
        track_num = len(self.midi_file.tracks) + 1
        track = MidiTrack()
        track.append(MetaMessage('track_name', name=f'Track {track_num}', time=0))
        self.midi_file.tracks.append(track)
        self.update_track_list()
        
        # Save state after modifying (this becomes the new current state)
        self.save_state()
        
        self.status_label.config(text=f"✓ Added Track {track_num}", fg=self.accent_success)
    
    def update_track_list(self):
        if self.midi_file:
            track_names = []
            for i, track in enumerate(self.midi_file.tracks):
                name = f"Track {i+1}"
                for msg in track:
                    if msg.type == 'track_name':
                        name = msg.name
                        break
                track_names.append(name)
            
            self.track_combo['values'] = track_names
            if track_names:
                self.track_combo.set(track_names[0])
    
    def save_state(self):
        """Save current state to undo stack"""
        if self.midi_file:
            # Serialize MIDI file to bytes
            import io
            buffer = io.BytesIO()
            self.midi_file.save(file=buffer)
            state = {
                'midi_data': buffer.getvalue(),
                'filename': self.filename,
                'selected_track': self.selected_track_idx
            }
            
            self.undo_stack.append(state)
            
            # Limit undo stack size
            if len(self.undo_stack) > self.max_undo_levels:
                self.undo_stack.pop(0)
            
            # Clear redo stack when new action is performed
            self.redo_stack.clear()
    
    def undo(self):
        """Undo last action"""
        print(f"Undo called - undo stack size: {len(self.undo_stack)}")
        
        if len(self.undo_stack) < 1:
            self.status_label.config(text="⚠ Nothing to undo", fg='#f9e2af')
            print("Cannot undo - undo stack is empty")
            return
        
        # Save current state to redo stack BEFORE undoing
        if self.midi_file:
            import io
            buffer = io.BytesIO()
            self.midi_file.save(file=buffer)
            current_state = {
                'midi_data': buffer.getvalue(),
                'filename': self.filename,
                'selected_track': self.selected_track_idx
            }
            self.redo_stack.append(current_state)
            print(f"Saved current state to redo stack")
        
        # Pop and restore the last state from undo stack
        previous_state = self.undo_stack.pop()
        self.restore_state(previous_state)
        print(f"Restored previous state, {len(self.undo_stack)} more undo states available")
        self.status_label.config(text=f"↶ Undo successful ({len(self.undo_stack)} more available)", fg=self.accent_success)
    
    def redo(self):
        """Redo last undone action"""
        if not self.redo_stack:
            self.status_label.config(text="⚠ Nothing to redo", fg='#f9e2af')
            return
        
        # Get state from redo stack
        state = self.redo_stack.pop()
        
        # Add to undo stack
        self.undo_stack.append(state)
        
        # Restore state
        self.restore_state(state)
        self.status_label.config(text=f"↷ Redo successful ({len(self.redo_stack)} more available)", fg=self.accent_success)
    
    def restore_state(self, state):
        """Restore MIDI file from saved state (without modifying undo/redo stacks)"""
        import io
        buffer = io.BytesIO(state['midi_data'])
        self.midi_file = MidiFile(file=buffer)
        self.filename = state['filename']
        self.selected_track_idx = state['selected_track']
        
        if self.filename:
            self.file_label.config(text=os.path.basename(self.filename))
        else:
            self.file_label.config(text="New Project")
        
        self.update_track_list()
    
    def save_session(self):
        """Save current session to file for persistence"""
        try:
            import json
            
            # Save current state to undo stack before saving session
            if self.midi_file:
                import io
                buffer = io.BytesIO()
                self.midi_file.save(file=buffer)
                current_state = {
                    'midi_data': buffer.getvalue(),
                    'filename': self.filename,
                    'selected_track': self.selected_track_idx
                }
                
                # Only add if it's different from the last state
                if not self.undo_stack or self.undo_stack[-1]['midi_data'] != current_state['midi_data']:
                    self.undo_stack.append(current_state)
                    if len(self.undo_stack) > self.max_undo_levels:
                        self.undo_stack.pop(0)
            
            session_data = {
                'undo_stack': [],
                'redo_stack': [],
                'filename': self.filename,
                'selected_track': self.selected_track_idx
            }
            
            # Save undo stack
            for state in self.undo_stack:
                session_data['undo_stack'].append({
                    'midi_data': state['midi_data'].hex(),
                    'filename': state['filename'],
                    'selected_track': state['selected_track']
                })
            
            # Save redo stack
            for state in self.redo_stack:
                session_data['redo_stack'].append({
                    'midi_data': state['midi_data'].hex(),
                    'filename': state['filename'],
                    'selected_track': state['selected_track']
                })
            
            with open(self.session_file, 'w') as f:
                json.dump(session_data, f)
            
            print(f"Session saved: {len(self.undo_stack)} undo states, {len(self.redo_stack)} redo states")
        except Exception as e:
            print(f"Failed to save session: {e}")
            import traceback
            traceback.print_exc()
    
    def load_session(self):
        """Load previous session from file"""
        try:
            import json
            if not os.path.exists(self.session_file):
                print("No session file found")
                return False
            
            with open(self.session_file, 'r') as f:
                session_data = json.load(f)
            
            print(f"Loading session with {len(session_data.get('undo_stack', []))} undo states")
            
            # Restore undo stack
            for state_data in session_data.get('undo_stack', []):
                state = {
                    'midi_data': bytes.fromhex(state_data['midi_data']),
                    'filename': state_data['filename'],
                    'selected_track': state_data['selected_track']
                }
                self.undo_stack.append(state)
            
            # Restore redo stack
            for state_data in session_data.get('redo_stack', []):
                state = {
                    'midi_data': bytes.fromhex(state_data['midi_data']),
                    'filename': state_data['filename'],
                    'selected_track': state_data['selected_track']
                }
                self.redo_stack.append(state)
            
            # Restore the most recent state (last in undo stack)
            if self.undo_stack:
                current_state = self.undo_stack[-1]
                # Restore without removing from stack
                import io
                buffer = io.BytesIO(current_state['midi_data'])
                self.midi_file = MidiFile(file=buffer)
                self.filename = current_state['filename']
                self.selected_track_idx = current_state['selected_track']
                
                if self.filename:
                    self.file_label.config(text=os.path.basename(self.filename))
                else:
                    self.file_label.config(text="Restored Session")
                
                self.update_track_list()
                
                undo_count = len(self.undo_stack)
                self.status_label.config(
                    text=f"✓ Session restored ({undo_count} undo states available)",
                    fg=self.accent_success
                )
                print(f"Session loaded successfully: {undo_count} undo states available")
                return True
            
            return False
        except Exception as e:
            print(f"Failed to load session: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def on_closing(self):
        """Handle window close event"""
        # Save session before closing
        self.save_session()
        
        # Close MIDI output
        if self.midi_out:
            self.midi_out.close_port()
        
        self.root.destroy()
    
    def show_undo_stack(self):
        """Debug function to show undo stack info"""
        print("\n=== UNDO STACK DEBUG ===")
        print(f"Undo stack size: {len(self.undo_stack)}")
        print(f"Redo stack size: {len(self.redo_stack)}")
        
        for i, state in enumerate(self.undo_stack):
            filename = state['filename'] or 'New Project'
            print(f"  [{i}] {filename} - {len(state['midi_data'])} bytes")
        
        if self.redo_stack:
            print("Redo stack:")
            for i, state in enumerate(self.redo_stack):
                filename = state['filename'] or 'New Project'
                print(f"  [{i}] {filename} - {len(state['midi_data'])} bytes")
        
        print("========================\n")
        
        msg = f"Undo: {len(self.undo_stack)} states, Redo: {len(self.redo_stack)} states"
        self.status_label.config(text=msg, fg=self.text_muted)
    
    def __del__(self):
        if self.midi_out:
            try:
                self.midi_out.close_port()
            except:
                pass

if __name__ == "__main__":
    root = tk.Tk()
    app = PianoKeyboardEditor(root)
    
    # Redraw keyboard on resize
    def on_resize(event):
        app.draw_piano_keyboard()
    
    app.piano_canvas.bind('<Configure>', on_resize)
    
    root.mainloop()
