import tkinter as tk
from tkinter import ttk, messagebox
import time
import threading
from datetime import datetime
import json
import os

class PomodoroTimer:
    def __init__(self, root):
        self.root = root
        self.root.title("Pomodoro Timer")
        self.root.geometry("450x650")
        self.root.configure(bg="#2c3e50")
        
        self.is_running = False
        self.is_paused = False
        self.current_mode = "work"  # work, short_break, long_break
        self.time_left = 25 * 60  # seconds
        self.sessions_completed = 0
        self.total_work_time = 0
        
        # Settings
        self.work_duration = 25
        self.short_break_duration = 5
        self.long_break_duration = 15
        self.sessions_until_long_break = 4
        
        # Stats
        self.stats_file = "pomodoro_stats.json"
        self.load_stats()
        
        self.setup_ui()
        self.update_display()
    
    def setup_ui(self):
        # Title
        title_frame = tk.Frame(self.root, bg="#e74c3c", height=80)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        tk.Label(title_frame, text="🍅 Pomodoro Timer", font=("Arial", 24, "bold"),
                bg="#e74c3c", fg="white").pack(pady=25)
        
        # Main timer display
        timer_frame = tk.Frame(self.root, bg="#2c3e50")
        timer_frame.pack(pady=30)
        
        self.mode_label = tk.Label(timer_frame, text="WORK TIME", 
                                   font=("Arial", 16, "bold"),
                                   bg="#2c3e50", fg="#3498db")
        self.mode_label.pack(pady=10)
        
        self.timer_label = tk.Label(timer_frame, text="25:00",
                                    font=("Arial", 72, "bold"),
                                    bg="#2c3e50", fg="#ecf0f1")
        self.timer_label.pack()
        
        # Progress bar
        self.progress = ttk.Progressbar(timer_frame, length=350, mode='determinate')
        self.progress.pack(pady=20)
        
        # Session counter
        self.session_label = tk.Label(timer_frame, text="Session 1 of 4",
                                      font=("Arial", 12),
                                      bg="#2c3e50", fg="#95a5a6")
        self.session_label.pack(pady=5)
        
        # Control buttons
        btn_frame = tk.Frame(self.root, bg="#2c3e50")
        btn_frame.pack(pady=20)
        
        self.start_btn = tk.Button(btn_frame, text="▶ Start",
                                   command=self.start_timer,
                                   bg="#27ae60", fg="white",
                                   font=("Arial", 14, "bold"),
                                   width=10, height=2)
        self.start_btn.grid(row=0, column=0, padx=5)
        
        self.pause_btn = tk.Button(btn_frame, text="⏸ Pause",
                                   command=self.pause_timer,
                                   bg="#f39c12", fg="white",
                                   font=("Arial", 14, "bold"),
                                   width=10, height=2,
                                   state=tk.DISABLED)
        self.pause_btn.grid(row=0, column=1, padx=5)
        
        self.reset_btn = tk.Button(btn_frame, text="⟲ Reset",
                                   command=self.reset_timer,
                                   bg="#e74c3c", fg="white",
                                   font=("Arial", 14, "bold"),
                                   width=10, height=2)
        self.reset_btn.grid(row=0, column=2, padx=5)
        
        # Quick actions
        quick_frame = tk.LabelFrame(self.root, text="Quick Actions",
                                   font=("Arial", 10, "bold"),
                                   bg="#34495e", fg="#ecf0f1")
        quick_frame.pack(fill=tk.X, padx=20, pady=10)
        
        quick_btn_frame = tk.Frame(quick_frame, bg="#34495e")
        quick_btn_frame.pack(pady=10)
        
        tk.Button(quick_btn_frame, text="Skip to Break",
                 command=self.skip_to_break,
                 bg="#3498db", fg="white",
                 font=("Arial", 10)).grid(row=0, column=0, padx=5, pady=5)
        
        tk.Button(quick_btn_frame, text="Skip Break",
                 command=self.skip_break,
                 bg="#9b59b6", fg="white",
                 font=("Arial", 10)).grid(row=0, column=1, padx=5, pady=5)
        
        tk.Button(quick_btn_frame, text="Settings",
                 command=self.show_settings,
                 bg="#7f8c8d", fg="white",
                 font=("Arial", 10)).grid(row=0, column=2, padx=5, pady=5)
        
        # Stats
        stats_frame = tk.LabelFrame(self.root, text="Today's Stats",
                                   font=("Arial", 10, "bold"),
                                   bg="#34495e", fg="#ecf0f1")
        stats_frame.pack(fill=tk.X, padx=20, pady=10)
        
        stats_content = tk.Frame(stats_frame, bg="#34495e")
        stats_content.pack(pady=10, padx=10)
        
        self.sessions_label = tk.Label(stats_content, text="Sessions: 0",
                                       font=("Arial", 11),
                                       bg="#34495e", fg="#ecf0f1")
        self.sessions_label.grid(row=0, column=0, padx=15, pady=5)
        
        self.work_time_label = tk.Label(stats_content, text="Work Time: 0m",
                                        font=("Arial", 11),
                                        bg="#34495e", fg="#ecf0f1")
        self.work_time_label.grid(row=0, column=1, padx=15, pady=5)
        
        self.streak_label = tk.Label(stats_content, text="Streak: 0 days",
                                     font=("Arial", 11),
                                     bg="#34495e", fg="#ecf0f1")
        self.streak_label.grid(row=1, column=0, columnspan=2, pady=5)
        
        # Status bar
        self.status_label = tk.Label(self.root, text="Ready to focus!",
                                     bd=1, relief=tk.SUNKEN, anchor=tk.W,
                                     bg="#34495e", fg="#ecf0f1")
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)
    
    def start_timer(self):
        if not self.is_running:
            self.is_running = True
            self.is_paused = False
            
            self.start_btn.config(state=tk.DISABLED)
            self.pause_btn.config(state=tk.NORMAL)
            
            if self.current_mode == "work":
                self.status_label.config(text="Focus time! Stay concentrated.")
            else:
                self.status_label.config(text="Break time! Relax and recharge.")
            
            thread = threading.Thread(target=self.run_timer, daemon=True)
            thread.start()
    
    def pause_timer(self):
        if self.is_running:
            self.is_paused = not self.is_paused
            
            if self.is_paused:
                self.pause_btn.config(text="▶ Resume")
                self.status_label.config(text="Timer paused")
            else:
                self.pause_btn.config(text="⏸ Pause")
                if self.current_mode == "work":
                    self.status_label.config(text="Focus time! Stay concentrated.")
                else:
                    self.status_label.config(text="Break time! Relax and recharge.")
    
    def reset_timer(self):
        self.is_running = False
        self.is_paused = False
        
        if self.current_mode == "work":
            self.time_left = self.work_duration * 60
        elif self.current_mode == "short_break":
            self.time_left = self.short_break_duration * 60
        else:
            self.time_left = self.long_break_duration * 60
        
        self.start_btn.config(state=tk.NORMAL)
        self.pause_btn.config(state=tk.DISABLED, text="⏸ Pause")
        self.status_label.config(text="Timer reset")
        
        self.update_display()
    
    def run_timer(self):
        while self.is_running and self.time_left > 0:
            if not self.is_paused:
                time.sleep(1)
                self.time_left -= 1
                self.root.after(0, self.update_display)
            else:
                time.sleep(0.1)
        
        if self.is_running and self.time_left == 0:
            self.root.after(0, self.timer_finished)
    
    def timer_finished(self):
        self.is_running = False
        
        # Play sound (beep)
        try:
            import winsound
            winsound.Beep(1000, 500)
        except:
            self.root.bell()
        
        if self.current_mode == "work":
            # Work session completed
            self.sessions_completed += 1
            self.total_work_time += self.work_duration
            self.save_stats()
            self.update_stats_display()
            
            # Determine next break type
            if self.sessions_completed % self.sessions_until_long_break == 0:
                self.current_mode = "long_break"
                self.time_left = self.long_break_duration * 60
                message = f"Great work! Take a long break ({self.long_break_duration} min)"
            else:
                self.current_mode = "short_break"
                self.time_left = self.short_break_duration * 60
                message = f"Good job! Take a short break ({self.short_break_duration} min)"
            
            messagebox.showinfo("Work Session Complete!", message)
            self.status_label.config(text="Work session complete! Time for a break.")
        
        else:
            # Break finished
            self.current_mode = "work"
            self.time_left = self.work_duration * 60
            messagebox.showinfo("Break Over!", "Break time is over. Ready to focus again?")
            self.status_label.config(text="Break complete! Ready for next session.")
        
        self.start_btn.config(state=tk.NORMAL)
        self.pause_btn.config(state=tk.DISABLED, text="⏸ Pause")
        self.update_display()
    
    def skip_to_break(self):
        if self.current_mode == "work":
            self.is_running = False
            self.sessions_completed += 1
            
            if self.sessions_completed % self.sessions_until_long_break == 0:
                self.current_mode = "long_break"
                self.time_left = self.long_break_duration * 60
            else:
                self.current_mode = "short_break"
                self.time_left = self.short_break_duration * 60
            
            self.start_btn.config(state=tk.NORMAL)
            self.pause_btn.config(state=tk.DISABLED, text="⏸ Pause")
            self.update_display()
            self.status_label.config(text="Skipped to break")
    
    def skip_break(self):
        if self.current_mode in ["short_break", "long_break"]:
            self.is_running = False
            self.current_mode = "work"
            self.time_left = self.work_duration * 60
            
            self.start_btn.config(state=tk.NORMAL)
            self.pause_btn.config(state=tk.DISABLED, text="⏸ Pause")
            self.update_display()
            self.status_label.config(text="Skipped break - back to work!")
    
    def show_settings(self):
        settings_window = tk.Toplevel(self.root)
        settings_window.title("Settings")
        settings_window.geometry("350x300")
        settings_window.configure(bg="#34495e")
        
        tk.Label(settings_window, text="⚙️ Timer Settings",
                font=("Arial", 16, "bold"),
                bg="#34495e", fg="#ecf0f1").pack(pady=15)
        
        frame = tk.Frame(settings_window, bg="#34495e")
        frame.pack(padx=20, pady=10)
        
        # Work duration
        tk.Label(frame, text="Work Duration (min):",
                bg="#34495e", fg="#ecf0f1").grid(row=0, column=0, sticky=tk.W, pady=5)
        work_var = tk.IntVar(value=self.work_duration)
        tk.Spinbox(frame, from_=1, to=60, textvariable=work_var, width=10).grid(row=0, column=1, pady=5)
        
        # Short break
        tk.Label(frame, text="Short Break (min):",
                bg="#34495e", fg="#ecf0f1").grid(row=1, column=0, sticky=tk.W, pady=5)
        short_var = tk.IntVar(value=self.short_break_duration)
        tk.Spinbox(frame, from_=1, to=30, textvariable=short_var, width=10).grid(row=1, column=1, pady=5)
        
        # Long break
        tk.Label(frame, text="Long Break (min):",
                bg="#34495e", fg="#ecf0f1").grid(row=2, column=0, sticky=tk.W, pady=5)
        long_var = tk.IntVar(value=self.long_break_duration)
        tk.Spinbox(frame, from_=1, to=60, textvariable=long_var, width=10).grid(row=2, column=1, pady=5)
        
        # Sessions until long break
        tk.Label(frame, text="Sessions until long break:",
                bg="#34495e", fg="#ecf0f1").grid(row=3, column=0, sticky=tk.W, pady=5)
        sessions_var = tk.IntVar(value=self.sessions_until_long_break)
        tk.Spinbox(frame, from_=2, to=10, textvariable=sessions_var, width=10).grid(row=3, column=1, pady=5)
        
        def save_settings():
            self.work_duration = work_var.get()
            self.short_break_duration = short_var.get()
            self.long_break_duration = long_var.get()
            self.sessions_until_long_break = sessions_var.get()
            
            if not self.is_running:
                self.reset_timer()
            
            settings_window.destroy()
            self.status_label.config(text="Settings saved!")
        
        tk.Button(settings_window, text="Save Settings", command=save_settings,
                 bg="#27ae60", fg="white", font=("Arial", 11, "bold"),
                 padx=20, pady=10).pack(pady=20)
    
    def update_display(self):
        # Update timer display
        minutes = self.time_left // 60
        seconds = self.time_left % 60
        self.timer_label.config(text=f"{minutes:02d}:{seconds:02d}")
        
        # Update mode label
        if self.current_mode == "work":
            self.mode_label.config(text="WORK TIME", fg="#3498db")
            total_time = self.work_duration * 60
        elif self.current_mode == "short_break":
            self.mode_label.config(text="SHORT BREAK", fg="#27ae60")
            total_time = self.short_break_duration * 60
        else:
            self.mode_label.config(text="LONG BREAK", fg="#9b59b6")
            total_time = self.long_break_duration * 60
        
        # Update progress bar
        progress_value = ((total_time - self.time_left) / total_time) * 100
        self.progress['value'] = progress_value
        
        # Update session counter
        current_session = (self.sessions_completed % self.sessions_until_long_break) + 1
        self.session_label.config(text=f"Session {current_session} of {self.sessions_until_long_break}")
        
        # Update window title
        self.root.title(f"Pomodoro - {minutes:02d}:{seconds:02d}")
    
    def update_stats_display(self):
        self.sessions_label.config(text=f"Sessions: {self.sessions_completed}")
        self.work_time_label.config(text=f"Work Time: {self.total_work_time}m")
        
        # Calculate streak
        streak = self.calculate_streak()
        self.streak_label.config(text=f"Streak: {streak} days")
    
    def load_stats(self):
        if os.path.exists(self.stats_file):
            try:
                with open(self.stats_file, 'r') as f:
                    data = json.load(f)
                
                today = datetime.now().strftime("%Y-%m-%d")
                if today in data:
                    self.sessions_completed = data[today].get('sessions', 0)
                    self.total_work_time = data[today].get('work_time', 0)
            except:
                pass
    
    def save_stats(self):
        data = {}
        if os.path.exists(self.stats_file):
            try:
                with open(self.stats_file, 'r') as f:
                    data = json.load(f)
            except:
                pass
        
        today = datetime.now().strftime("%Y-%m-%d")
        data[today] = {
            'sessions': self.sessions_completed,
            'work_time': self.total_work_time
        }
        
        with open(self.stats_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def calculate_streak(self):
        if not os.path.exists(self.stats_file):
            return 0
        
        try:
            with open(self.stats_file, 'r') as f:
                data = json.load(f)
            
            dates = sorted(data.keys(), reverse=True)
            if not dates:
                return 0
            
            streak = 0
            today = datetime.now().date()
            
            for date_str in dates:
                date = datetime.strptime(date_str, "%Y-%m-%d").date()
                expected_date = today - timedelta(days=streak)
                
                if date == expected_date:
                    streak += 1
                else:
                    break
            
            return streak
        except:
            return 0

if __name__ == "__main__":
    from datetime import timedelta
    root = tk.Tk()
    app = PomodoroTimer(root)
    root.mainloop()
