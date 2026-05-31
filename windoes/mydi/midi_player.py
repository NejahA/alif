import tkinter as tk
from tkinter import filedialog, ttk
import os
import threading
import time
import mido
from mido import MidiFile
import rtmidi

class MIDIPlayer:
    def __init__(self, root):
        self.root = root
        self.root.title("🗡️ Hyrule MIDI Player")
        self.root.geometry("600x500")
        
        # Zelda ALTTP color palette
        self.bg_dark = '#1a3a1a'  # Dark green
        self.bg_medium = '#2d5a2d'  # Medium green
        self.accent_gold = '#d4af37'  # Triforce gold
        self.accent_light = '#90ee90'  # Light green
        self.text_white = '#ffffff'
        self.text_shadow = '#0a1a0a'
        self.button_green = '#3d7a3d'
        self.button_hover = '#4d9a4d'
        
        self.root.configure(bg=self.bg_dark)
        
        self.current_file = None
        self.midi_data = None
        self.is_playing = False
        self.is_paused = False
        self.play_thread = None
        self.tempo = 500000
        self.current_time = 0
        self.total_time = 0
        self.seek_position = 0
        
        try:
            self.midi_out = rtmidi.MidiOut()
            available_ports = self.midi_out.get_ports()
            if available_ports:
                self.midi_out.open_port(0)
            else:
                self.midi_out.open_virtual_port("MIDI Player")
        except:
            self.midi_out = None
        
        self.setup_ui()
    
    def setup_ui(self):
        # Title with Triforce symbol
        title_frame = tk.Frame(self.root, bg=self.bg_dark)
        title_frame.pack(pady=15)
        
        title_label = tk.Label(
            title_frame,
            text="⟁ HYRULE MUSIC BOX ⟁",
            bg=self.bg_dark,
            fg=self.accent_gold,
            font=('Courier New', 18, 'bold')
        )
        title_label.pack()
        
        # Decorative border
        border_frame = tk.Frame(self.root, bg=self.accent_gold, height=3)
        border_frame.pack(fill=tk.X, padx=30)
        
        # File label with pixel-style border
        file_container = tk.Frame(self.root, bg=self.bg_medium, relief=tk.RIDGE, bd=3)
        file_container.pack(pady=15, padx=30, fill=tk.X)
        
        self.file_label = tk.Label(
            file_container,
            text="♪ No Song Loaded ♪",
            bg=self.bg_medium,
            fg=self.accent_light,
            font=('Courier New', 11, 'bold'),
            pady=10
        )
        self.file_label.pack()
        
        # Info label
        self.info_label = tk.Label(
            self.root,
            text="",
            bg=self.bg_dark,
            fg=self.accent_gold,
            font=('Courier New', 9)
        )
        self.info_label.pack()
        
        # Progress frame with Zelda styling
        progress_container = tk.Frame(self.root, bg=self.bg_medium, relief=tk.RIDGE, bd=3)
        progress_container.pack(pady=15, padx=30, fill=tk.X)
        
        # Time label
        self.time_label = tk.Label(
            progress_container,
            text="0:00 / 0:00",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Courier New', 10, 'bold')
        )
        self.time_label.pack(pady=(10, 5))
        
        # Progress bar with custom style
        style = ttk.Style()
        style.theme_use('default')
        style.configure("Zelda.Horizontal.TProgressbar",
                       thickness=25,
                       troughcolor=self.text_shadow,
                       background=self.accent_gold,
                       bordercolor=self.accent_gold,
                       lightcolor=self.accent_gold,
                       darkcolor=self.accent_gold)
        
        progress_inner = tk.Frame(progress_container, bg=self.text_shadow, relief=tk.SUNKEN, bd=2)
        progress_inner.pack(pady=(0, 10), padx=10, fill=tk.X)
        
        self.progress_bar = ttk.Progressbar(
            progress_inner,
            style="Zelda.Horizontal.TProgressbar",
            length=500,
            mode='determinate'
        )
        self.progress_bar.pack(pady=3, padx=3, fill=tk.X)
        self.progress_bar.bind('<Button-1>', self.on_progress_click)
        
        # Button frame
        button_frame = tk.Frame(self.root, bg=self.bg_dark)
        button_frame.pack(pady=15)
        
        # Custom button style
        button_config = {
            'font': ('Courier New', 10, 'bold'),
            'relief': tk.RAISED,
            'bd': 3,
            'width': 12,
            'height': 2,
            'cursor': 'hand2'
        }
        
        # Load button
        self.load_btn = tk.Button(
            button_frame,
            text="📜 LOAD SONG",
            command=self.load_file,
            bg=self.button_green,
            fg=self.text_white,
            activebackground=self.button_hover,
            activeforeground=self.text_white,
            **button_config
        )
        self.load_btn.grid(row=0, column=0, padx=5, pady=5)
        
        # Play button
        self.play_btn = tk.Button(
            button_frame,
            text="▶ PLAY",
            command=self.play,
            bg=self.button_green,
            fg=self.accent_gold,
            activebackground=self.button_hover,
            activeforeground=self.accent_gold,
            state=tk.DISABLED,
            **button_config
        )
        self.play_btn.grid(row=0, column=1, padx=5, pady=5)
        
        # Pause button
        self.pause_btn = tk.Button(
            button_frame,
            text="⏸ PAUSE",
            command=self.pause,
            bg=self.button_green,
            fg=self.accent_light,
            activebackground=self.button_hover,
            activeforeground=self.accent_light,
            state=tk.DISABLED,
            **button_config
        )
        self.pause_btn.grid(row=0, column=2, padx=5, pady=5)
        
        # Stop button
        self.stop_btn = tk.Button(
            button_frame,
            text="⏹ STOP",
            command=self.stop,
            bg='#8b4513',
            fg=self.text_white,
            activebackground='#a0522d',
            activeforeground=self.text_white,
            state=tk.DISABLED,
            font=('Courier New', 10, 'bold'),
            relief=tk.RAISED,
            bd=3,
            width=38,
            height=1,
            cursor='hand2'
        )
        self.stop_btn.grid(row=1, column=0, columnspan=3, pady=10)
        
        # Status label with decorative frame
        status_container = tk.Frame(self.root, bg=self.bg_medium, relief=tk.RIDGE, bd=3)
        status_container.pack(pady=10, padx=30, fill=tk.X)
        
        self.status_label = tk.Label(
            status_container,
            text="⚔ Ready to Play ⚔",
            bg=self.bg_medium,
            fg=self.accent_gold,
            font=('Courier New', 11, 'bold'),
            pady=8
        )
        self.status_label.pack()
        
        # Footer
        footer = tk.Label(
            self.root,
            text="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            bg=self.bg_dark,
            fg=self.accent_gold,
            font=('Courier New', 8)
        )
        footer.pack(pady=(10, 5))
    
    def load_file(self):
        filename = filedialog.askopenfilename(
            title="Select MIDI file",
            filetypes=[("MIDI files", "*.mid *.midi"), ("All files", "*.*")]
        )
        
        if filename:
            try:
                self.midi_data = MidiFile(filename)
                self.current_file = filename
                self.file_label.config(text=f"♪ {os.path.basename(filename)} ♪")
                
                self.total_time = self.midi_data.length
                tracks = len(self.midi_data.tracks)
                self.info_label.config(text=f"Duration: {self._format_time(self.total_time)} | Tracks: {tracks}")
                
                self.progress_bar['value'] = 0
                self.time_label.config(text=f"0:00 / {self._format_time(self.total_time)}")
                
                self.play_btn.config(state=tk.NORMAL)
                self.status_label.config(text="⚔ Song Loaded ⚔", fg=self.accent_gold)
            except Exception as e:
                self.status_label.config(text=f"⚠ Error: {str(e)}", fg='#ff6b6b')
    
    def on_progress_click(self, event):
        if self.midi_data and self.total_time > 0:
            # Calculate clicked position
            widget_width = self.progress_bar.winfo_width()
            click_position = event.x / widget_width
            new_time = click_position * self.total_time
            
            # Stop current playback completely
            was_playing = self.is_playing
            if self.is_playing:
                self.is_playing = False
                time.sleep(0.2)  # Wait for thread to stop
            
            # Silence all notes
            if self.midi_out:
                try:
                    for channel in range(16):
                        for note in range(128):
                            self.midi_out.send_message([0x80 | channel, note, 0])
                        self.midi_out.send_message([0xB0 | channel, 123, 0])
                except:
                    pass
            
            # Reload MIDI file to reset state
            self.midi_data = MidiFile(self.current_file)
            
            # Set seek position
            self.seek_position = new_time
            
            # Update UI
            self.progress_bar['value'] = (new_time / self.total_time) * 100
            self.time_label.config(text=f"{self._format_time(new_time)} / {self._format_time(self.total_time)}")
            
            # Resume if was playing
            if was_playing:
                self.play()
    
    def _format_time(self, seconds):
        mins = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{mins}:{secs:02d}"
    
    def play(self):
        if self.midi_data and not self.is_playing:
            self.is_playing = True
            self.is_paused = False
            self.pause_btn.config(state=tk.NORMAL)
            self.stop_btn.config(state=tk.NORMAL)
            self.play_btn.config(state=tk.DISABLED)
            self.status_label.config(text="🎵 Playing... 🎵", fg=self.accent_light)
            
            self.play_thread = threading.Thread(target=self._play_midi, daemon=True)
            self.play_thread.start()
    
    def _play_midi(self):
        try:
            start_time = time.time() - self.seek_position
            elapsed = 0
            
            # Build list of messages with absolute timing
            messages = []
            for msg in self.midi_data:
                elapsed += msg.time
                messages.append((elapsed, msg))
            
            # Play from seek position
            for msg_time, msg in messages:
                if not self.is_playing:
                    break
                
                # Skip messages before seek position
                if msg_time < self.seek_position:
                    continue
                
                # Wait for the right time
                target_time = start_time + msg_time
                wait_time = target_time - time.time()
                if wait_time > 0:
                    time.sleep(wait_time)
                
                # Handle pause
                while self.is_paused:
                    pause_start = time.time()
                    time.sleep(0.1)
                    if not self.is_playing:
                        break
                    start_time += time.time() - pause_start
                
                if not self.is_playing:
                    break
                
                # Send MIDI message
                if self.midi_out and not msg.is_meta:
                    try:
                        self.midi_out.send_message(msg.bytes())
                    except:
                        pass
                
                # Update progress
                self.current_time = time.time() - start_time
                if self.total_time > 0:
                    progress = (self.current_time / self.total_time) * 100
                    self.root.after(0, self._update_progress, progress, self.current_time)
            
            if self.is_playing:
                self.root.after(0, self._playback_finished)
        except Exception as e:
            self.root.after(0, lambda: self.status_label.config(
                text=f"⚠ Error: {str(e)}", fg='#ff6b6b'
            ))
    
    def _update_progress(self, progress, current_time):
        self.progress_bar['value'] = min(progress, 100)
        self.time_label.config(text=f"{self._format_time(current_time)} / {self._format_time(self.total_time)}")
    
    def _playback_finished(self):
        self.is_playing = False
        self.is_paused = False
        self.play_btn.config(state=tk.NORMAL)
        self.pause_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.DISABLED)
        self.progress_bar['value'] = 100
        self.time_label.config(text=f"{self._format_time(self.total_time)} / {self._format_time(self.total_time)}")
        self.status_label.config(text="⚔ Victory! Song Complete ⚔", fg=self.accent_gold)
    
    def pause(self):
        if self.is_playing:
            self.is_paused = not self.is_paused
            if self.is_paused:
                self.pause_btn.config(text="▶ RESUME")
                self.status_label.config(text="⏸ Paused ⏸", fg='#ffd700')
                # Silence all notes when pausing
                if self.midi_out:
                    try:
                        for channel in range(16):
                            for note in range(128):
                                self.midi_out.send_message([0x80 | channel, note, 0])
                            self.midi_out.send_message([0xB0 | channel, 123, 0])
                    except:
                        pass
            else:
                self.pause_btn.config(text="⏸ PAUSE")
                self.status_label.config(text="🎵 Playing... 🎵", fg=self.accent_light)
    
    def stop(self):
        self.is_playing = False
        self.is_paused = False
        self.seek_position = 0
        self.pause_btn.config(state=tk.DISABLED, text="⏸ PAUSE")
        self.stop_btn.config(state=tk.DISABLED)
        self.play_btn.config(state=tk.NORMAL)
        self.progress_bar['value'] = 0
        self.time_label.config(text=f"0:00 / {self._format_time(self.total_time)}")
        self.status_label.config(text="⏹ Stopped ⏹", fg='#ff6b6b')
        
        # Send note off for all channels and notes
        if self.midi_out:
            try:
                for channel in range(16):
                    for note in range(128):
                        self.midi_out.send_message([0x80 | channel, note, 0])
                    # Also send all notes off CC
                    self.midi_out.send_message([0xB0 | channel, 123, 0])
            except:
                pass
    
    def __del__(self):
        if self.midi_out:
            self.midi_out.close_port()

if __name__ == "__main__":
    root = tk.Tk()
    app = MIDIPlayer(root)
    root.mainloop()
