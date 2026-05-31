import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
from datetime import datetime, timedelta

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False

class BatteryMonitor:
    def __init__(self, root):
        self.root = root
        self.root.title("Battery Monitor")
        self.root.geometry("500x700")
        
        if not PSUTIL_AVAILABLE:
            self.show_dependency_error()
            return
        
        self.monitoring = True
        self.battery_history = []
        self.max_history = 60  # Keep 60 data points
        
        # Alert settings
        self.low_battery_alert = 20
        self.high_battery_alert = 95
        self.alert_shown = False
        
        self.setup_ui()
        self.start_monitoring()
    
    def show_dependency_error(self):
        error_frame = tk.Frame(self.root)
        error_frame.pack(expand=True, fill=tk.BOTH, padx=20, pady=20)
        
        tk.Label(error_frame, text="❌ Missing Dependency", 
                font=("Arial", 16, "bold"), fg="red").pack(pady=20)
        
        tk.Label(error_frame, text="Please install psutil:\n\npip install psutil", 
                font=("Courier", 11), justify=tk.LEFT).pack(pady=10)
        
        tk.Button(error_frame, text="Copy Command", 
                 command=lambda: self.copy_to_clipboard("pip install psutil"),
                 bg="#2196F3", fg="white", font=("Arial", 11)).pack(pady=10)
    
    def copy_to_clipboard(self, text):
        self.root.clipboard_clear()
        self.root.clipboard_append(text)
        messagebox.showinfo("Success", "Command copied to clipboard!")
    
    def setup_ui(self):
        # Title
        title_frame = tk.Frame(self.root, bg="#4CAF50", height=70)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        tk.Label(title_frame, text="🔋 Battery Monitor", 
                font=("Arial", 20, "bold"),
                bg="#4CAF50", fg="white").pack(pady=20)
        
        # Main battery display
        main_frame = tk.Frame(self.root, bg="#f5f5f5")
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Battery percentage
        self.battery_label = tk.Label(main_frame, text="---%", 
                                      font=("Arial", 48, "bold"),
                                      bg="#f5f5f5", fg="#4CAF50")
        self.battery_label.pack(pady=20)
        
        # Battery icon/bar
        self.battery_canvas = tk.Canvas(main_frame, width=300, height=120, 
                                        bg="#f5f5f5", highlightthickness=0)
        self.battery_canvas.pack(pady=10)
        
        # Status
        self.status_label = tk.Label(main_frame, text="Checking...", 
                                     font=("Arial", 14),
                                     bg="#f5f5f5", fg="#666")
        self.status_label.pack(pady=5)
        
        # Time remaining
        self.time_label = tk.Label(main_frame, text="", 
                                   font=("Arial", 12),
                                   bg="#f5f5f5", fg="#666")
        self.time_label.pack(pady=5)
        
        # Details frame
        details_frame = tk.LabelFrame(self.root, text="Battery Details",
                                     font=("Arial", 11, "bold"))
        details_frame.pack(fill=tk.X, padx=10, pady=10)
        
        details_grid = tk.Frame(details_frame)
        details_grid.pack(padx=10, pady=10)
        
        # Detail labels
        labels = [
            ("Power Source:", "power_source"),
            ("Health:", "health"),
            ("Voltage:", "voltage"),
            ("Temperature:", "temperature"),
        ]
        
        self.detail_labels = {}
        for i, (label, key) in enumerate(labels):
            tk.Label(details_grid, text=label, font=("Arial", 10, "bold"),
                    anchor=tk.W).grid(row=i, column=0, sticky=tk.W, pady=3, padx=5)
            
            value_label = tk.Label(details_grid, text="--", font=("Arial", 10),
                                  anchor=tk.W)
            value_label.grid(row=i, column=1, sticky=tk.W, pady=3, padx=5)
            self.detail_labels[key] = value_label
        
        # History graph
        graph_frame = tk.LabelFrame(self.root, text="Battery History (Last Hour)",
                                   font=("Arial", 11, "bold"))
        graph_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.graph_canvas = tk.Canvas(graph_frame, bg="white", height=150)
        self.graph_canvas.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Settings frame
        settings_frame = tk.LabelFrame(self.root, text="Alert Settings",
                                      font=("Arial", 11, "bold"))
        settings_frame.pack(fill=tk.X, padx=10, pady=10)
        
        settings_content = tk.Frame(settings_frame)
        settings_content.pack(padx=10, pady=10)
        
        # Low battery alert
        tk.Label(settings_content, text="Low Battery Alert:", 
                font=("Arial", 9)).grid(row=0, column=0, sticky=tk.W, pady=3)
        self.low_alert_var = tk.IntVar(value=self.low_battery_alert)
        tk.Spinbox(settings_content, from_=5, to=50, textvariable=self.low_alert_var,
                  width=10, font=("Arial", 9)).grid(row=0, column=1, padx=5)
        tk.Label(settings_content, text="%", font=("Arial", 9)).grid(row=0, column=2)
        
        # High battery alert
        tk.Label(settings_content, text="Full Battery Alert:", 
                font=("Arial", 9)).grid(row=1, column=0, sticky=tk.W, pady=3)
        self.high_alert_var = tk.IntVar(value=self.high_battery_alert)
        tk.Spinbox(settings_content, from_=80, to=100, textvariable=self.high_alert_var,
                  width=10, font=("Arial", 9)).grid(row=1, column=1, padx=5)
        tk.Label(settings_content, text="%", font=("Arial", 9)).grid(row=1, column=2)
        
        tk.Button(settings_content, text="Apply", command=self.apply_settings,
                 bg="#2196F3", fg="white", font=("Arial", 9)).grid(row=2, column=0, 
                                                                   columnspan=3, pady=10)
        
        # Status bar
        self.statusbar = tk.Label(self.root, text="Monitoring...", 
                                 bd=1, relief=tk.SUNKEN, anchor=tk.W)
        self.statusbar.pack(side=tk.BOTTOM, fill=tk.X)
    
    def start_monitoring(self):
        def monitor():
            while self.monitoring:
                try:
                    battery = psutil.sensors_battery()
                    
                    if battery:
                        self.root.after(0, lambda: self.update_display(battery))
                    else:
                        self.root.after(0, lambda: self.statusbar.config(
                            text="No battery detected - Running on AC power"))
                    
                    time.sleep(2)
                except Exception as e:
                    print(f"Monitoring error: {e}")
                    time.sleep(5)
        
        thread = threading.Thread(target=monitor, daemon=True)
        thread.start()
    
    def update_display(self, battery):
        percent = battery.percent
        plugged = battery.power_plugged
        
        # Update percentage
        self.battery_label.config(text=f"{percent:.0f}%")
        
        # Update color based on level
        if percent <= 20:
            color = "#f44336"  # Red
        elif percent <= 50:
            color = "#FF9800"  # Orange
        elif percent <= 80:
            color = "#FFC107"  # Yellow
        else:
            color = "#4CAF50"  # Green
        
        self.battery_label.config(fg=color)
        
        # Update battery icon
        self.draw_battery(percent, plugged, color)
        
        # Update status
        if plugged:
            if percent >= 100:
                status = "Fully Charged"
            else:
                status = "Charging"
        else:
            status = "On Battery"
        
        self.status_label.config(text=status)
        
        # Update time remaining
        if battery.secsleft != psutil.POWER_TIME_UNLIMITED and battery.secsleft != psutil.POWER_TIME_UNKNOWN:
            hours = battery.secsleft // 3600
            minutes = (battery.secsleft % 3600) // 60
            
            if plugged:
                time_text = f"Time until full: {hours}h {minutes}m"
            else:
                time_text = f"Time remaining: {hours}h {minutes}m"
            
            self.time_label.config(text=time_text)
        else:
            self.time_label.config(text="")
        
        # Update details
        self.detail_labels['power_source'].config(
            text="AC Power" if plugged else "Battery")
        
        # Battery health (simplified)
        if percent >= 80:
            health = "Good"
            health_color = "#4CAF50"
        elif percent >= 50:
            health = "Fair"
            health_color = "#FFC107"
        else:
            health = "Check Battery"
            health_color = "#FF9800"
        
        self.detail_labels['health'].config(text=health, fg=health_color)
        self.detail_labels['voltage'].config(text="N/A")
        self.detail_labels['temperature'].config(text="N/A")
        
        # Add to history
        self.battery_history.append(percent)
        if len(self.battery_history) > self.max_history:
            self.battery_history.pop(0)
        
        # Update graph
        self.draw_graph()
        
        # Check alerts
        self.check_alerts(percent, plugged)
        
        # Update statusbar
        now = datetime.now().strftime("%H:%M:%S")
        self.statusbar.config(text=f"Last update: {now} | {status} | {percent:.0f}%")
    
    def draw_battery(self, percent, plugged, color):
        self.battery_canvas.delete("all")
        
        # Battery outline
        x, y = 50, 30
        width, height = 200, 60
        
        # Battery body
        self.battery_canvas.create_rectangle(x, y, x + width, y + height,
                                            outline="#333", width=3, fill="white")
        
        # Battery terminal
        self.battery_canvas.create_rectangle(x + width, y + 15, x + width + 10, y + 45,
                                            outline="#333", width=3, fill="#333")
        
        # Fill level
        fill_width = (width - 10) * (percent / 100)
        self.battery_canvas.create_rectangle(x + 5, y + 5, x + 5 + fill_width, y + height - 5,
                                            fill=color, outline="")
        
        # Percentage text
        self.battery_canvas.create_text(x + width // 2, y + height // 2,
                                       text=f"{percent:.0f}%",
                                       font=("Arial", 16, "bold"),
                                       fill="#333")
        
        # Charging indicator
        if plugged:
            # Lightning bolt
            self.battery_canvas.create_text(x + width + 30, y + height // 2,
                                           text="⚡", font=("Arial", 24),
                                           fill="#FFC107")
    
    def draw_graph(self):
        self.graph_canvas.delete("all")
        
        if len(self.battery_history) < 2:
            return
        
        width = self.graph_canvas.winfo_width()
        height = self.graph_canvas.winfo_height()
        
        if width <= 1:
            width = 400
        if height <= 1:
            height = 150
        
        # Draw grid lines
        for i in range(0, 101, 25):
            y = height - (i / 100 * (height - 40)) - 20
            self.graph_canvas.create_line(40, y, width - 10, y,
                                         fill="#e0e0e0", dash=(2, 2))
            self.graph_canvas.create_text(20, y, text=f"{i}%",
                                         font=("Arial", 8), fill="#666")
        
        # Draw data line
        points = []
        x_step = (width - 50) / max(len(self.battery_history) - 1, 1)
        
        for i, value in enumerate(self.battery_history):
            x = 40 + i * x_step
            y = height - (value / 100 * (height - 40)) - 20
            points.extend([x, y])
        
        if len(points) >= 4:
            self.graph_canvas.create_line(points, fill="#4CAF50", width=2, smooth=True)
            
            # Draw points
            for i in range(0, len(points), 2):
                x, y = points[i], points[i + 1]
                self.graph_canvas.create_oval(x - 3, y - 3, x + 3, y + 3,
                                             fill="#4CAF50", outline="")
    
    def check_alerts(self, percent, plugged):
        low_threshold = self.low_alert_var.get()
        high_threshold = self.high_alert_var.get()
        
        # Low battery alert
        if not plugged and percent <= low_threshold and not self.alert_shown:
            self.show_notification("Low Battery Warning",
                                 f"Battery is at {percent:.0f}%\nPlease connect charger")
            self.alert_shown = True
            try:
                import winsound
                winsound.Beep(1000, 500)
            except:
                self.root.bell()
        
        # High battery alert
        elif plugged and percent >= high_threshold and not self.alert_shown:
            self.show_notification("Battery Charged",
                                 f"Battery is at {percent:.0f}%\nYou can unplug the charger")
            self.alert_shown = True
            try:
                import winsound
                winsound.Beep(800, 300)
            except:
                self.root.bell()
        
        # Reset alert flag
        elif (plugged and percent < high_threshold - 5) or (not plugged and percent > low_threshold + 5):
            self.alert_shown = False
    
    def show_notification(self, title, message):
        # Create notification window
        notif = tk.Toplevel(self.root)
        notif.title(title)
        notif.geometry("300x150")
        notif.attributes('-topmost', True)
        
        tk.Label(notif, text=title, font=("Arial", 14, "bold")).pack(pady=10)
        tk.Label(notif, text=message, font=("Arial", 11)).pack(pady=10)
        tk.Button(notif, text="OK", command=notif.destroy,
                 bg="#4CAF50", fg="white", font=("Arial", 10),
                 padx=20, pady=5).pack(pady=10)
        
        # Auto-close after 10 seconds
        notif.after(10000, notif.destroy)
    
    def apply_settings(self):
        self.low_battery_alert = self.low_alert_var.get()
        self.high_battery_alert = self.high_alert_var.get()
        self.alert_shown = False  # Reset alert flag
        messagebox.showinfo("Settings", "Alert settings updated!")
    
    def on_closing(self):
        self.monitoring = False
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = BatteryMonitor(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()
