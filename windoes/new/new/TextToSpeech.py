import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import threading
import queue

try:
    import pyttsx3
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False

class TextToSpeechReader:
    def __init__(self, root):
        self.root = root
        self.root.title("Text-to-Speech Reader")
        self.root.geometry("700x750")
        
        if not TTS_AVAILABLE:
            self.show_dependency_error()
            return
        
        # Initialize TTS engine
        try:
            self.engine = None
            self.init_engine()
            self.is_speaking = False
            self.is_paused = False
            self.current_text = ""
            self.word_queue = queue.Queue()
            
            # Get available voices
            self.voices = self.engine.getProperty('voices')
            
            self.setup_ui()
            self.load_settings()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to initialize TTS engine: {str(e)}")
            self.root.destroy()
    
    def init_engine(self):
        """Initialize or reinitialize the TTS engine"""
        try:
            if self.engine is not None:
                try:
                    del self.engine
                except:
                    pass
            
            self.engine = pyttsx3.init()
            return True
        except Exception as e:
            print(f"Engine init error: {e}")
            return False
    
    def show_dependency_error(self):
        error_frame = tk.Frame(self.root)
        error_frame.pack(expand=True, fill=tk.BOTH, padx=20, pady=20)
        
        tk.Label(error_frame, text="❌ Missing Dependency", 
                font=("Arial", 16, "bold"), fg="red").pack(pady=20)
        
        tk.Label(error_frame, text="Please install pyttsx3:\n\npip install pyttsx3", 
                font=("Courier", 11), justify=tk.LEFT).pack(pady=10)
        
        tk.Button(error_frame, text="Copy Command", 
                 command=lambda: self.copy_to_clipboard("pip install pyttsx3"),
                 bg="#2196F3", fg="white", font=("Arial", 11)).pack(pady=10)
    
    def copy_to_clipboard(self, text):
        self.root.clipboard_clear()
        self.root.clipboard_append(text)
        messagebox.showinfo("Success", "Command copied to clipboard!")
    
    def setup_ui(self):
        # Title
        title_frame = tk.Frame(self.root, bg="#673ab7", height=70)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        tk.Label(title_frame, text="🔊 Text-to-Speech Reader", 
                font=("Arial", 20, "bold"),
                bg="#673ab7", fg="white").pack(pady=20)
        
        # Quick actions
        quick_frame = tk.Frame(self.root)
        quick_frame.pack(fill=tk.X, padx=20, pady=10)
        
        tk.Button(quick_frame, text="📋 Read Clipboard", 
                 command=self.read_clipboard,
                 bg="#2196F3", fg="white", 
                 font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        tk.Button(quick_frame, text="📄 Open File", 
                 command=self.open_file,
                 bg="#4CAF50", fg="white",
                 font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        tk.Button(quick_frame, text="💾 Save Text",
                 command=self.save_text,
                 bg="#FF9800", fg="white",
                 font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        tk.Button(quick_frame, text="🗑️ Clear",
                 command=self.clear_text,
                 bg="#f44336", fg="white",
                 font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        # Text area
        text_frame = tk.LabelFrame(self.root, text="Text to Read",
                                  font=("Arial", 10, "bold"))
        text_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        self.text_area = scrolledtext.ScrolledText(text_frame, 
                                                   font=("Arial", 11),
                                                   wrap=tk.WORD,
                                                   height=15)
        self.text_area.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Character count
        self.char_label = tk.Label(text_frame, text="Characters: 0 | Words: 0",
                                   font=("Arial", 9), fg="gray")
        self.char_label.pack(pady=5)
        
        self.text_area.bind('<KeyRelease>', self.update_char_count)
        
        # Voice settings
        settings_frame = tk.LabelFrame(self.root, text="Voice Settings",
                                      font=("Arial", 10, "bold"))
        settings_frame.pack(fill=tk.X, padx=20, pady=10)
        
        settings_content = tk.Frame(settings_frame)
        settings_content.pack(fill=tk.X, padx=10, pady=10)
        
        # Voice selection
        voice_frame = tk.Frame(settings_content)
        voice_frame.pack(fill=tk.X, pady=5)
        
        tk.Label(voice_frame, text="Voice:", font=("Arial", 10)).pack(side=tk.LEFT, padx=5)
        
        self.voice_var = tk.StringVar()
        voice_names = [self.get_voice_name(v) for v in self.voices]
        self.voice_combo = ttk.Combobox(voice_frame, textvariable=self.voice_var,
                                       values=voice_names, state='readonly', width=40)
        self.voice_combo.pack(side=tk.LEFT, padx=5)
        self.voice_combo.bind('<<ComboboxSelected>>', self.change_voice)
        if voice_names:
            self.voice_combo.current(0)
        
        # Rate slider
        rate_frame = tk.Frame(settings_content)
        rate_frame.pack(fill=tk.X, pady=5)
        
        tk.Label(rate_frame, text="Speed:", font=("Arial", 10)).pack(side=tk.LEFT, padx=5)
        
        self.rate_var = tk.IntVar(value=150)
        self.rate_slider = tk.Scale(rate_frame, from_=50, to=300, 
                                    orient=tk.HORIZONTAL,
                                    variable=self.rate_var,
                                    command=self.change_rate,
                                    length=200)
        self.rate_slider.pack(side=tk.LEFT, padx=5)
        
        self.rate_label = tk.Label(rate_frame, text="150 wpm", font=("Arial", 9))
        self.rate_label.pack(side=tk.LEFT, padx=5)
        
        # Volume slider
        volume_frame = tk.Frame(settings_content)
        volume_frame.pack(fill=tk.X, pady=5)
        
        tk.Label(volume_frame, text="Volume:", font=("Arial", 10)).pack(side=tk.LEFT, padx=5)
        
        self.volume_var = tk.DoubleVar(value=1.0)
        self.volume_slider = tk.Scale(volume_frame, from_=0.0, to=1.0,
                                     orient=tk.HORIZONTAL,
                                     variable=self.volume_var,
                                     command=self.change_volume,
                                     resolution=0.1,
                                     length=200)
        self.volume_slider.pack(side=tk.LEFT, padx=5)
        
        self.volume_label = tk.Label(volume_frame, text="100%", font=("Arial", 9))
        self.volume_label.pack(side=tk.LEFT, padx=5)
        
        # Control buttons
        control_frame = tk.Frame(self.root)
        control_frame.pack(pady=20)
        
        self.speak_btn = tk.Button(control_frame, text="▶ Speak",
                                   command=self.start_speaking,
                                   bg="#4CAF50", fg="white",
                                   font=("Arial", 14, "bold"),
                                   width=12, height=2)
        self.speak_btn.grid(row=0, column=0, padx=5)
        
        self.pause_btn = tk.Button(control_frame, text="⏸ Pause",
                                   command=self.pause_speaking,
                                   bg="#FF9800", fg="white",
                                   font=("Arial", 14, "bold"),
                                   width=12, height=2,
                                   state=tk.DISABLED)
        self.pause_btn.grid(row=0, column=1, padx=5)
        
        self.stop_btn = tk.Button(control_frame, text="⏹ Stop",
                                  command=self.stop_speaking,
                                  bg="#f44336", fg="white",
                                  font=("Arial", 14, "bold"),
                                  width=12, height=2,
                                  state=tk.DISABLED)
        self.stop_btn.grid(row=0, column=2, padx=5)
        
        # Status
        self.status_label = tk.Label(self.root, text="Ready to speak",
                                     font=("Arial", 11), fg="#27ae60")
        self.status_label.pack(pady=10)
        
        # Status bar
        self.statusbar = tk.Label(self.root, text="Ready", 
                                 bd=1, relief=tk.SUNKEN, anchor=tk.W)
        self.statusbar.pack(side=tk.BOTTOM, fill=tk.X)
    
    def get_voice_name(self, voice):
        """Extract readable name from voice object"""
        name = voice.name
        if "Microsoft" in name:
            # Extract just the voice name for Microsoft voices
            parts = name.split(" - ")
            if len(parts) > 1:
                return parts[1]
        return name
    
    def change_voice(self, event=None):
        selected_name = self.voice_var.get()
        for i, voice in enumerate(self.voices):
            if self.get_voice_name(voice) == selected_name:
                self.engine.setProperty('voice', voice.id)
                self.statusbar.config(text=f"Voice changed to: {selected_name}")
                break
    
    def change_rate(self, value):
        rate = int(float(value))
        self.engine.setProperty('rate', rate)
        self.rate_label.config(text=f"{rate} wpm")
    
    def change_volume(self, value):
        volume = float(value)
        self.engine.setProperty('volume', volume)
        self.volume_label.config(text=f"{int(volume * 100)}%")
    
    def update_char_count(self, event=None):
        text = self.text_area.get(1.0, tk.END).strip()
        char_count = len(text)
        word_count = len(text.split()) if text else 0
        self.char_label.config(text=f"Characters: {char_count} | Words: {word_count}")
    
    def read_clipboard(self):
        try:
            import pyperclip
            text = pyperclip.paste()
            if text:
                self.text_area.delete(1.0, tk.END)
                self.text_area.insert(1.0, text)
                self.update_char_count()
                self.statusbar.config(text="Loaded text from clipboard")
            else:
                messagebox.showinfo("Info", "Clipboard is empty")
        except ImportError:
            # Fallback to tkinter clipboard
            try:
                text = self.root.clipboard_get()
                if text:
                    self.text_area.delete(1.0, tk.END)
                    self.text_area.insert(1.0, text)
                    self.update_char_count()
                    self.statusbar.config(text="Loaded text from clipboard")
            except:
                messagebox.showerror("Error", "Failed to read clipboard")
    
    def open_file(self):
        file_path = filedialog.askopenfilename(
            filetypes=[
                ("Text files", "*.txt"),
                ("All files", "*.*")
            ]
        )
        
        if file_path:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
                
                self.text_area.delete(1.0, tk.END)
                self.text_area.insert(1.0, text)
                self.update_char_count()
                self.statusbar.config(text=f"Loaded: {file_path}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to open file: {str(e)}")
    
    def save_text(self):
        text = self.text_area.get(1.0, tk.END).strip()
        if not text:
            messagebox.showinfo("Info", "No text to save")
            return
        
        file_path = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(text)
                self.statusbar.config(text=f"Saved to: {file_path}")
                messagebox.showinfo("Success", "Text saved successfully!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save: {str(e)}")
    
    def clear_text(self):
        if self.text_area.get(1.0, tk.END).strip():
            if messagebox.askyesno("Confirm", "Clear all text?"):
                self.text_area.delete(1.0, tk.END)
                self.update_char_count()
                self.statusbar.config(text="Text cleared")
    
    def start_speaking(self):
        text = self.text_area.get(1.0, tk.END).strip()
        
        if not text:
            messagebox.showinfo("Info", "Please enter some text to read")
            return
        
        if self.is_speaking:
            messagebox.showinfo("Info", "Already speaking")
            return
        
        self.current_text = text
        self.is_speaking = True
        self.is_paused = False
        
        self.speak_btn.config(state=tk.DISABLED)
        self.pause_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.NORMAL)
        self.status_label.config(text="🔊 Speaking...", fg="#2196F3")
        self.statusbar.config(text="Speaking...")
        
        # Start speaking in separate thread
        thread = threading.Thread(target=self.speak_text, daemon=True)
        thread.start()
    
    def speak_text(self):
        try:
            # Reinitialize engine for each speech (workaround for pyttsx3 bug)
            self.init_engine()
            self.apply_current_settings()
            
            # Clear any pending speech
            try:
                self.engine.stop()
            except:
                pass
            
            # Speak the text
            self.engine.say(self.current_text)
            self.engine.runAndWait()
            
            if self.is_speaking:  # Only update if not stopped
                self.root.after(0, self.speaking_finished)
        except Exception as e:
            print(f"Speech error: {str(e)}")
            self.root.after(0, lambda: messagebox.showerror("Error", f"Speech error: {str(e)}"))
            self.root.after(0, self.speaking_finished)
    
    def pause_speaking(self):
        # Note: pyttsx3 doesn't support pause/resume natively
        # This will stop and allow restart
        if self.is_speaking:
            self.stop_speaking()
            self.statusbar.config(text="Paused (restart to continue)")
    
    def stop_speaking(self):
        if self.is_speaking:
            self.is_speaking = False
            try:
                self.engine.stop()
            except:
                pass
            
            self.speaking_finished()
    
    def speaking_finished(self):
        self.is_speaking = False
        self.is_paused = False
        
        self.speak_btn.config(state=tk.NORMAL)
        self.pause_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.DISABLED)
        self.status_label.config(text="Ready to speak", fg="#27ae60")
        self.statusbar.config(text="Finished speaking")
    
    def apply_current_settings(self):
        """Apply current UI settings to engine"""
        try:
            # Apply rate
            rate = self.rate_var.get()
            self.engine.setProperty('rate', rate)
            
            # Apply volume
            volume = self.volume_var.get()
            self.engine.setProperty('volume', volume)
            
            # Apply voice
            selected_name = self.voice_var.get()
            for voice in self.voices:
                if self.get_voice_name(voice) == selected_name:
                    self.engine.setProperty('voice', voice.id)
                    break
        except Exception as e:
            print(f"Error applying settings: {e}")
    
    def load_settings(self):
        """Load saved settings"""
        try:
            rate = self.engine.getProperty('rate')
            volume = self.engine.getProperty('volume')
            
            self.rate_var.set(rate)
            self.volume_var.set(volume)
            
            self.rate_label.config(text=f"{rate} wpm")
            self.volume_label.config(text=f"{int(volume * 100)}%")
        except:
            pass

if __name__ == "__main__":
    root = tk.Tk()
    app = TextToSpeechReader(root)
    root.mainloop()
