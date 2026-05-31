import tkinter as tk
from tkinter import ttk
import psutil
import platform
from datetime import datetime
import threading
import time

class SystemMonitor:
    def __init__(self, root):
        self.root = root
        self.root.title("System Monitor")
        self.root.geometry("800x650")
        self.root.configure(bg="#1e1e1e")
        
        self.monitoring = True
        self.cpu_history = []
        self.mem_history = []
        self.max_history = 60
        
        self.setup_ui()
        self.start_monitoring()
    
    def setup_ui(self):
        # Title
        title_frame = tk.Frame(self.root, bg="#1e1e1e")
        title_frame.pack(fill=tk.X, pady=10)
        
        tk.Label(title_frame, text="⚡ System Monitor", font=("Arial", 20, "bold"), 
                bg="#1e1e1e", fg="#00ff00").pack()
        
        # System Info
        info_frame = tk.LabelFrame(self.root, text="System Information", font=("Arial", 10, "bold"),
                                   bg="#2d2d2d", fg="#ffffff")
        info_frame.pack(fill=tk.X, padx=10, pady=5)
        
        info_text = f"OS: {platform.system()} {platform.release()} | Processor: {platform.processor()}"
        tk.Label(info_frame, text=info_text, bg="#2d2d2d", fg="#cccccc", font=("Arial", 9)).pack(pady=5)
        
        # Main content frame
        content_frame = tk.Frame(self.root, bg="#1e1e1e")
        content_frame.pack(fill=tk.BOTH, expand=True, padx=10)
        
        # Left column - CPU and Memory
        left_frame = tk.Frame(content_frame, bg="#1e1e1e")
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        
        # CPU Frame
        self.cpu_frame = tk.LabelFrame(left_frame, text="CPU Usage", font=("Arial", 10, "bold"),
                                       bg="#2d2d2d", fg="#ffffff")
        self.cpu_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.cpu_label = tk.Label(self.cpu_frame, text="0%", font=("Arial", 32, "bold"),
                                  bg="#2d2d2d", fg="#00ff00")
        self.cpu_label.pack(pady=10)
        
        self.cpu_canvas = tk.Canvas(self.cpu_frame, height=80, bg="#1e1e1e", highlightthickness=0)
        self.cpu_canvas.pack(fill=tk.X, padx=10, pady=5)
        
        self.cpu_cores_label = tk.Label(self.cpu_frame, text="", bg="#2d2d2d", fg="#cccccc", font=("Arial", 9))
        self.cpu_cores_label.pack(pady=5)
        
        # Memory Frame
        self.mem_frame = tk.LabelFrame(left_frame, text="Memory Usage", font=("Arial", 10, "bold"),
                                       bg="#2d2d2d", fg="#ffffff")
        self.mem_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.mem_label = tk.Label(self.mem_frame, text="0%", font=("Arial", 32, "bold"),
                                  bg="#2d2d2d", fg="#00aaff")
        self.mem_label.pack(pady=10)
        
        self.mem_canvas = tk.Canvas(self.mem_frame, height=80, bg="#1e1e1e", highlightthickness=0)
        self.mem_canvas.pack(fill=tk.X, padx=10, pady=5)
        
        self.mem_details_label = tk.Label(self.mem_frame, text="", bg="#2d2d2d", fg="#cccccc", font=("Arial", 9))
        self.mem_details_label.pack(pady=5)
        
        # Right column - Disk and Network
        right_frame = tk.Frame(content_frame, bg="#1e1e1e")
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=5)
        
        # Disk Frame
        self.disk_frame = tk.LabelFrame(right_frame, text="Disk Usage", font=("Arial", 10, "bold"),
                                        bg="#2d2d2d", fg="#ffffff")
        self.disk_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.disk_canvas = tk.Canvas(self.disk_frame, height=150, bg="#2d2d2d", highlightthickness=0)
        self.disk_canvas.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Network Frame
        self.net_frame = tk.LabelFrame(right_frame, text="Network", font=("Arial", 10, "bold"),
                                       bg="#2d2d2d", fg="#ffffff")
        self.net_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.net_label = tk.Label(self.net_frame, text="", bg="#2d2d2d", fg="#cccccc", 
                                 font=("Arial", 10), justify=tk.LEFT)
        self.net_label.pack(pady=10, padx=10)
        
        # Process Frame
        self.proc_frame = tk.LabelFrame(self.root, text="Top Processes (by CPU)", font=("Arial", 10, "bold"),
                                        bg="#2d2d2d", fg="#ffffff")
        self.proc_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Process list
        proc_scroll = tk.Scrollbar(self.proc_frame)
        proc_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.proc_listbox = tk.Listbox(self.proc_frame, yscrollcommand=proc_scroll.set,
                                       bg="#1e1e1e", fg="#cccccc", font=("Consolas", 9),
                                       height=6)
        self.proc_listbox.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        proc_scroll.config(command=self.proc_listbox.yview)
        
        # Status bar
        self.status_label = tk.Label(self.root, text="Monitoring...", bd=1, relief=tk.SUNKEN,
                                     anchor=tk.W, bg="#2d2d2d", fg="#00ff00")
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)
    
    def start_monitoring(self):
        def monitor():
            last_net_io = psutil.net_io_counters()
            
            while self.monitoring:
                try:
                    # CPU
                    cpu_percent = psutil.cpu_percent(interval=0.5)
                    self.update_cpu(cpu_percent)
                    
                    # Memory
                    mem = psutil.virtual_memory()
                    self.update_memory(mem)
                    
                    # Disk
                    self.update_disk()
                    
                    # Network
                    net_io = psutil.net_io_counters()
                    self.update_network(net_io, last_net_io)
                    last_net_io = net_io
                    
                    # Processes
                    self.update_processes()
                    
                    # Status
                    now = datetime.now().strftime("%H:%M:%S")
                    self.status_label.config(text=f"Last updated: {now}")
                    
                except Exception as e:
                    print(f"Error: {e}")
                
                time.sleep(1)
        
        thread = threading.Thread(target=monitor, daemon=True)
        thread.start()
    
    def update_cpu(self, percent):
        self.cpu_label.config(text=f"{percent:.1f}%")
        
        # Update history
        self.cpu_history.append(percent)
        if len(self.cpu_history) > self.max_history:
            self.cpu_history.pop(0)
        
        # Draw graph
        self.draw_graph(self.cpu_canvas, self.cpu_history, "#00ff00")
        
        # Core info
        cores = psutil.cpu_count(logical=False)
        threads = psutil.cpu_count(logical=True)
        self.cpu_cores_label.config(text=f"{cores} Cores | {threads} Threads")
    
    def update_memory(self, mem):
        self.mem_label.config(text=f"{mem.percent:.1f}%")
        
        # Update history
        self.mem_history.append(mem.percent)
        if len(self.mem_history) > self.max_history:
            self.mem_history.pop(0)
        
        # Draw graph
        self.draw_graph(self.mem_canvas, self.mem_history, "#00aaff")
        
        # Details
        used_gb = mem.used / (1024**3)
        total_gb = mem.total / (1024**3)
        self.mem_details_label.config(text=f"Used: {used_gb:.1f} GB / {total_gb:.1f} GB")
    
    def draw_graph(self, canvas, data, color):
        canvas.delete("all")
        if not data:
            return
        
        width = canvas.winfo_width()
        height = canvas.winfo_height()
        
        if width <= 1:
            return
        
        max_val = 100
        points = []
        
        for i, val in enumerate(data):
            x = (i / max(len(data) - 1, 1)) * width
            y = height - (val / max_val * height)
            points.extend([x, y])
        
        if len(points) >= 4:
            canvas.create_line(points, fill=color, width=2, smooth=True)
    
    def update_disk(self):
        self.disk_canvas.delete("all")
        
        partitions = psutil.disk_partitions()
        y_offset = 10
        
        for partition in partitions[:3]:  # Show first 3 partitions
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                
                # Draw partition info
                label = f"{partition.device} ({partition.mountpoint})"
                self.disk_canvas.create_text(10, y_offset, text=label, anchor=tk.W, 
                                            fill="#ffffff", font=("Arial", 9))
                
                # Draw progress bar
                bar_width = 200
                bar_height = 15
                x = 10
                y = y_offset + 15
                
                # Background
                self.disk_canvas.create_rectangle(x, y, x + bar_width, y + bar_height,
                                                 fill="#1e1e1e", outline="#555555")
                
                # Fill
                fill_width = (usage.percent / 100) * bar_width
                color = "#ff4444" if usage.percent > 90 else "#00ff00"
                self.disk_canvas.create_rectangle(x, y, x + fill_width, y + bar_height,
                                                 fill=color, outline="")
                
                # Percentage
                used_gb = usage.used / (1024**3)
                total_gb = usage.total / (1024**3)
                text = f"{usage.percent:.1f}% ({used_gb:.0f}/{total_gb:.0f} GB)"
                self.disk_canvas.create_text(x + bar_width + 10, y + 7, text=text,
                                            anchor=tk.W, fill="#cccccc", font=("Arial", 8))
                
                y_offset += 45
            except:
                pass
    
    def update_network(self, current, previous):
        sent_speed = (current.bytes_sent - previous.bytes_sent) / 1024  # KB/s
        recv_speed = (current.bytes_recv - previous.bytes_recv) / 1024  # KB/s
        
        sent_total = current.bytes_sent / (1024**2)  # MB
        recv_total = current.bytes_recv / (1024**2)  # MB
        
        text = f"↑ Upload: {sent_speed:.1f} KB/s ({sent_total:.0f} MB total)\n"
        text += f"↓ Download: {recv_speed:.1f} KB/s ({recv_total:.0f} MB total)"
        
        self.net_label.config(text=text)
    
    def update_processes(self):
        self.proc_listbox.delete(0, tk.END)
        
        try:
            processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    processes.append(proc.info)
                except:
                    pass
            
            # Sort by CPU usage
            processes.sort(key=lambda x: x['cpu_percent'] or 0, reverse=True)
            
            # Show top 10
            for proc in processes[:10]:
                name = proc['name'][:30]
                cpu = proc['cpu_percent'] or 0
                mem = proc['memory_percent'] or 0
                pid = proc['pid']
                
                line = f"{name:<32} CPU: {cpu:>5.1f}%  MEM: {mem:>5.1f}%  PID: {pid}"
                self.proc_listbox.insert(tk.END, line)
        except:
            pass
    
    def on_closing(self):
        self.monitoring = False
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = SystemMonitor(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()
