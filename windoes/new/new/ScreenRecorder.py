import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import threading
import time
from datetime import datetime
import os

try:
    import mss
    import mss.tools
    MSS_AVAILABLE = True
except ImportError:
    MSS_AVAILABLE = False

try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

class ScreenRecorder:
    def __init__(self, root):
        self.root = root
        self.root.title("Screen Recorder")
        self.root.geometry("500x650")
        
        # Check dependencies
        if not MSS_AVAILABLE or not CV2_AVAILABLE:
            self.show_dependency_error()
            return
        
        self.is_recording = False
        self.is_paused = False
        self.output_file = None
        self.video_writer = None
        self.start_time = None
        self.pause_time = 0
        self.frames_recorded = 0
        
        self.setup_ui()
    
    def show_dependency_error(self):
        error_frame = tk.Frame(self.root)
        error_frame.pack(expand=True, fill=tk.BOTH, padx=20, pady=20)
        
        tk.Label(error_frame, text="❌ Missing Dependencies", 
                font=("Arial", 16, "bold"), fg="red").pack(pady=20)
        
        msg = "Please install required packages:\n\n"
        if not MSS_AVAILABLE:
            msg += "pip install mss\n"
        if not CV2_AVAILABLE:
            msg += "pip install opencv-python numpy\n"
        
        tk.Label(error_frame, text=msg, font=("Courier", 10), 
                justify=tk.LEFT).pack(pady=10)
        
        tk.Button(error_frame, text="Copy Command", 
                 command=lambda: self.copy_to_clipboard("pip install mss opencv-python numpy"),
                 bg="#2196F3", fg="white", font=("Arial", 11)).pack(pady=10)
    
    def copy_to_clipboard(self, text):
        try:
            import pyperclip
            pyperclip.copy(text)
            messagebox.showinfo("Success", "Command copied to clipboard!")
        except:
            self.root.clipboard_clear()
            self.root.clipboard_append(text)
            messagebox.showinfo("Success", "Command copied to clipboard!")
    
    def setup_ui(self):
        # Title
        title_frame = tk.Frame(self.root, bg="#e74c3c", height=70)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        tk.Label(title_frame, text="🎥 Screen Recorder", font=("Arial", 20, "bold"),
                bg="#e74c3c", fg="white").pack(pady=20)
        
        # Settings frame
        settings_frame = tk.LabelFrame(self.root, text="Recording Settings", 
                                      font=("Arial", 11, "bold"))
        settings_frame.pack(fill=tk.X, padx=20, pady=15)
        
        # Get screen size using mss
        with mss.mss() as sct:
            monitor = sct.monitors[1]  # Primary monitor
            screen_width = monitor["width"]
            screen_height = monitor["height"]
        
        # Screen resolution
        res_frame = tk.Frame(settings_frame)
        res_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Label(res_frame, text="Resolution:", font=("Arial", 10)).pack(side=tk.LEFT)
        
        self.resolution_var = tk.StringVar(value=f"{screen_width}x{screen_height}")
        resolutions = [
            f"{screen_width}x{screen_height} (Full Screen)",
            "1920x1080 (Full HD)",
            "1280x720 (HD)",
            "854x480 (SD)",
        ]
        
        resolution_combo = ttk.Combobox(res_frame, textvariable=self.resolution_var,
                                       values=resolutions, state='readonly', width=30)
        resolution_combo.pack(side=tk.LEFT, padx=10)
        
        # FPS
        fps_frame = tk.Frame(settings_frame)
        fps_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Label(fps_frame, text="FPS (Frames Per Second):", font=("Arial", 10)).pack(side=tk.LEFT)
        
        self.fps_var = tk.IntVar(value=20)
        fps_spin = tk.Spinbox(fps_frame, from_=10, to=60, textvariable=self.fps_var,
                             width=10, font=("Arial", 10))
        fps_spin.pack(side=tk.LEFT, padx=10)
        
        # Output location
        output_frame = tk.Frame(settings_frame)
        output_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Label(output_frame, text="Save to:", font=("Arial", 10)).pack(side=tk.LEFT)
        
        self.output_path = tk.StringVar(value=os.path.join(os.path.expanduser("~"), "Videos"))
        tk.Entry(output_frame, textvariable=self.output_path, font=("Arial", 9),
                state='readonly').pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        
        tk.Button(output_frame, text="Browse", command=self.browse_output,
                 bg="#3498db", fg="white").pack(side=tk.LEFT)
        
        # Options
        options_frame = tk.LabelFrame(self.root, text="Options",
                                     font=("Arial", 11, "bold"))
        options_frame.pack(fill=tk.X, padx=20, pady=10)
        
        self.countdown = tk.BooleanVar(value=True)
        tk.Checkbutton(options_frame, text="3 Second Countdown", variable=self.countdown,
                      font=("Arial", 10)).pack(anchor=tk.W, padx=20, pady=5)
        
        # Quality
        quality_frame = tk.Frame(options_frame)
        quality_frame.pack(fill=tk.X, padx=20, pady=5)
        
        tk.Label(quality_frame, text="Quality:", font=("Arial", 10)).pack(side=tk.LEFT)
        self.quality_var = tk.StringVar(value="medium")
        ttk.Combobox(quality_frame, textvariable=self.quality_var,
                    values=["low", "medium", "high"], state='readonly', width=15).pack(side=tk.LEFT, padx=10)
        
        # Status display
        status_frame = tk.LabelFrame(self.root, text="Status",
                                    font=("Arial", 11, "bold"))
        status_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        self.status_label = tk.Label(status_frame, text="Ready to record",
                                     font=("Arial", 12), fg="#27ae60")
        self.status_label.pack(pady=10)
        
        self.timer_label = tk.Label(status_frame, text="00:00:00",
                                    font=("Arial", 32, "bold"), fg="#2c3e50")
        self.timer_label.pack(pady=10)
        
        self.frames_label = tk.Label(status_frame, text="Frames: 0",
                                     font=("Arial", 10), fg="#7f8c8d")
        self.frames_label.pack(pady=2)
        
        self.file_label = tk.Label(status_frame, text="",
                                   font=("Arial", 9), fg="#7f8c8d")
        self.file_label.pack(pady=5)
        
        # Control buttons
        btn_frame = tk.Frame(self.root)
        btn_frame.pack(fill=tk.X, padx=20, pady=15)
        
        self.record_btn = tk.Button(btn_frame, text="⏺ Start Recording",
                                    command=self.start_recording,
                                    bg="#27ae60", fg="white",
                                    font=("Arial", 12, "bold"), height=2)
        self.record_btn.pack(fill=tk.X, pady=2)
        
        self.pause_btn = tk.Button(btn_frame, text="⏸ Pause",
                                   command=self.pause_recording,
                                   bg="#f39c12", fg="white",
                                   font=("Arial", 12, "bold"), height=2,
                                   state=tk.DISABLED)
        self.pause_btn.pack(fill=tk.X, pady=2)
        
        self.stop_btn = tk.Button(btn_frame, text="⏹ Stop Recording",
                                 command=self.stop_recording,
                                 bg="#e74c3c", fg="white",
                                 font=("Arial", 12, "bold"), height=2,
                                 state=tk.DISABLED)
        self.stop_btn.pack(fill=tk.X, pady=2)
        
        # Status bar
        self.statusbar = tk.Label(self.root, text="Ready", bd=1, relief=tk.SUNKEN,
                                 anchor=tk.W)
        self.statusbar.pack(side=tk.BOTTOM, fill=tk.X)
    
    def browse_output(self):
        folder = filedialog.askdirectory(initialdir=self.output_path.get())
        if folder:
            self.output_path.set(folder)
    
    def start_recording(self):
        if self.is_recording:
            return
        
        # Ensure output directory exists
        output_dir = self.output_path.get()
        if not os.path.exists(output_dir):
            try:
                os.makedirs(output_dir)
            except:
                messagebox.showerror("Error", f"Cannot create directory: {output_dir}")
                return
        
        # Countdown
        if self.countdown.get():
            for i in range(3, 0, -1):
                self.status_label.config(text=f"Starting in {i}...")
                self.root.update()
                time.sleep(1)
        
        self.is_recording = True
        self.is_paused = False
        self.start_time = time.time()
        self.pause_time = 0
        self.frames_recorded = 0
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.output_file = os.path.join(output_dir, f"recording_{timestamp}.avi")
        
        # Update UI
        self.record_btn.config(state=tk.DISABLED)
        self.pause_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.NORMAL)
        self.status_label.config(text="● Recording...", fg="#e74c3c")
        self.file_label.config(text=f"Saving to: {os.path.basename(self.output_file)}")
        self.statusbar.config(text="Recording in progress...")
        
        # Start recording thread
        thread = threading.Thread(target=self.record_screen, daemon=True)
        thread.start()
        
        # Start timer
        self.update_timer()
    
    def pause_recording(self):
        if not self.is_recording:
            return
        
        self.is_paused = not self.is_paused
        
        if self.is_paused:
            self.pause_btn.config(text="▶ Resume")
            self.status_label.config(text="⏸ Paused", fg="#f39c12")
            self.statusbar.config(text="Recording paused")
        else:
            self.pause_btn.config(text="⏸ Pause")
            self.status_label.config(text="● Recording...", fg="#e74c3c")
            self.statusbar.config(text="Recording resumed")
    
    def stop_recording(self):
        if not self.is_recording:
            return
        
        self.is_recording = False
        self.is_paused = False
        
        # Wait for recording to finish
        time.sleep(0.5)
        
        # Update UI
        self.record_btn.config(state=tk.NORMAL)
        self.pause_btn.config(state=tk.DISABLED, text="⏸ Pause")
        self.stop_btn.config(state=tk.DISABLED)
        self.status_label.config(text="Recording saved!", fg="#27ae60")
        self.statusbar.config(text=f"Saved to: {self.output_file}")
        
        messagebox.showinfo("Success", f"Recording saved to:\n{self.output_file}")
    
    def record_screen(self):
        # Get resolution
        res_str = self.resolution_var.get().split()[0]
        target_width, target_height = map(int, res_str.split('x'))
        
        # Setup video writer
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        fps = self.fps_var.get()
        
        # Quality settings
        quality = self.quality_var.get()
        if quality == "low":
            fps = max(10, fps // 2)
        elif quality == "high":
            fps = min(30, fps)
        
        self.video_writer = cv2.VideoWriter(self.output_file, fourcc, fps, 
                                           (target_width, target_height))
        
        if not self.video_writer.isOpened():
            self.root.after(0, lambda: messagebox.showerror("Error", 
                "Failed to initialize video writer. Check output path."))
            self.is_recording = False
            return
        
        frame_delay = 1.0 / fps
        
        try:
            with mss.mss() as sct:
                # Get primary monitor
                monitor = sct.monitors[1]
                
                while self.is_recording:
                    if not self.is_paused:
                        frame_start = time.time()
                        
                        # Capture screenshot
                        screenshot = sct.grab(monitor)
                        
                        # Convert to numpy array
                        frame = np.array(screenshot)
                        
                        # Convert BGRA to BGR
                        frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
                        
                        # Resize if needed
                        if frame.shape[1] != target_width or frame.shape[0] != target_height:
                            frame = cv2.resize(frame, (target_width, target_height), 
                                             interpolation=cv2.INTER_AREA)
                        
                        # Write frame
                        self.video_writer.write(frame)
                        self.frames_recorded += 1
                        
                        # Update frames counter (every 10 frames)
                        if self.frames_recorded % 10 == 0:
                            self.root.after(0, lambda: self.frames_label.config(
                                text=f"Frames: {self.frames_recorded}"))
                        
                        # Maintain frame rate
                        elapsed = time.time() - frame_start
                        sleep_time = max(0, frame_delay - elapsed)
                        if sleep_time > 0:
                            time.sleep(sleep_time)
                    else:
                        time.sleep(0.1)
        
        except Exception as e:
            error_msg = f"Recording error: {str(e)}"
            print(error_msg)
            self.root.after(0, lambda: messagebox.showerror("Error", error_msg))
        
        finally:
            if self.video_writer:
                self.video_writer.release()
                print(f"Recording saved: {self.output_file}")
    
    def update_timer(self):
        if self.is_recording:
            if not self.is_paused:
                elapsed = time.time() - self.start_time - self.pause_time
            else:
                elapsed = time.time() - self.start_time - self.pause_time
                self.pause_time = time.time() - self.start_time - elapsed
            
            hours = int(elapsed // 3600)
            minutes = int((elapsed % 3600) // 60)
            seconds = int(elapsed % 60)
            
            self.timer_label.config(text=f"{hours:02d}:{minutes:02d}:{seconds:02d}")
            
            self.root.after(1000, self.update_timer)
        else:
            self.timer_label.config(text="00:00:00")

if __name__ == "__main__":
    root = tk.Tk()
    app = ScreenRecorder(root)
    root.mainloop()
