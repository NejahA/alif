import tkinter as tk
from tkinter import ttk, messagebox
import subprocess
import re
import threading
import time

class WiFiScanner:
    def __init__(self, root):
        self.root = root
        self.root.title("WiFi Network Scanner")
        self.root.geometry("900x650")
        
        self.networks = []
        self.is_scanning = False
        self.auto_refresh = False
        
        self.setup_ui()
    
    def setup_ui(self):
        # Title
        title_frame = tk.Frame(self.root, bg="#00897b", height=70)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        tk.Label(title_frame, text="📡 WiFi Network Scanner", 
                font=("Arial", 20, "bold"),
                bg="#00897b", fg="white").pack(pady=20)
        
        # Control panel
        control_frame = tk.Frame(self.root)
        control_frame.pack(fill=tk.X, padx=20, pady=10)
        
        tk.Button(control_frame, text="🔍 Scan Networks", 
                 command=self.start_scan,
                 bg="#4CAF50", fg="white", 
                 font=("Arial", 11, "bold"),
                 padx=20, pady=10).pack(side=tk.LEFT, padx=5)
        
        tk.Button(control_frame, text="🔄 Refresh", 
                 command=self.start_scan,
                 bg="#2196F3", fg="white",
                 font=("Arial", 11, "bold"),
                 padx=20, pady=10).pack(side=tk.LEFT, padx=5)
        
        self.auto_refresh_var = tk.BooleanVar(value=False)
        tk.Checkbutton(control_frame, text="Auto-refresh (10s)", 
                      variable=self.auto_refresh_var,
                      command=self.toggle_auto_refresh,
                      font=("Arial", 10)).pack(side=tk.LEFT, padx=20)
        
        tk.Button(control_frame, text="📊 Show Details", 
                 command=self.show_details,
                 bg="#9C27B0", fg="white",
                 font=("Arial", 11, "bold"),
                 padx=20, pady=10).pack(side=tk.LEFT, padx=5)
        
        tk.Button(control_frame, text="💾 Export", 
                 command=self.export_results,
                 bg="#FF9800", fg="white",
                 font=("Arial", 11, "bold"),
                 padx=20, pady=10).pack(side=tk.LEFT, padx=5)
        
        # Info panel
        info_frame = tk.Frame(self.root)
        info_frame.pack(fill=tk.X, padx=20, pady=5)
        
        self.info_label = tk.Label(info_frame, text="Click 'Scan Networks' to start",
                                   font=("Arial", 10), fg="#666")
        self.info_label.pack(side=tk.LEFT)
        
        self.count_label = tk.Label(info_frame, text="Networks: 0",
                                    font=("Arial", 10, "bold"), fg="#00897b")
        self.count_label.pack(side=tk.RIGHT)
        
        # Networks table
        table_frame = tk.LabelFrame(self.root, text="Available Networks",
                                   font=("Arial", 11, "bold"))
        table_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        # Scrollbars
        scroll_y = tk.Scrollbar(table_frame)
        scroll_y.pack(side=tk.RIGHT, fill=tk.Y)
        
        scroll_x = tk.Scrollbar(table_frame, orient=tk.HORIZONTAL)
        scroll_x.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Treeview
        self.tree = ttk.Treeview(table_frame, 
                                yscrollcommand=scroll_y.set,
                                xscrollcommand=scroll_x.set,
                                selectmode='browse')
        self.tree.pack(fill=tk.BOTH, expand=True)
        
        scroll_y.config(command=self.tree.yview)
        scroll_x.config(command=self.tree.xview)
        
        # Columns
        self.tree['columns'] = ('Signal', 'Security', 'Channel', 'BSSID')
        
        self.tree.column('#0', width=250, minwidth=150)
        self.tree.column('Signal', width=120, minwidth=80)
        self.tree.column('Security', width=150, minwidth=100)
        self.tree.column('Channel', width=80, minwidth=60)
        self.tree.column('BSSID', width=150, minwidth=120)
        
        self.tree.heading('#0', text='Network Name (SSID)', anchor=tk.W)
        self.tree.heading('Signal', text='Signal Strength', anchor=tk.W)
        self.tree.heading('Security', text='Security Type', anchor=tk.W)
        self.tree.heading('Channel', text='Channel', anchor=tk.W)
        self.tree.heading('BSSID', text='MAC Address', anchor=tk.W)
        
        # Configure tags for signal strength colors
        self.tree.tag_configure('excellent', background='#c8e6c9')
        self.tree.tag_configure('good', background='#fff9c4')
        self.tree.tag_configure('fair', background='#ffccbc')
        self.tree.tag_configure('poor', background='#ffcdd2')
        
        # Bind double-click
        self.tree.bind('<Double-Button-1>', self.show_details)
        
        # Legend
        legend_frame = tk.Frame(self.root)
        legend_frame.pack(fill=tk.X, padx=20, pady=5)
        
        tk.Label(legend_frame, text="Signal Strength:", 
                font=("Arial", 9, "bold")).pack(side=tk.LEFT, padx=5)
        
        tk.Label(legend_frame, text="Excellent", bg="#c8e6c9", 
                font=("Arial", 8), padx=10).pack(side=tk.LEFT, padx=2)
        tk.Label(legend_frame, text="Good", bg="#fff9c4",
                font=("Arial", 8), padx=10).pack(side=tk.LEFT, padx=2)
        tk.Label(legend_frame, text="Fair", bg="#ffccbc",
                font=("Arial", 8), padx=10).pack(side=tk.LEFT, padx=2)
        tk.Label(legend_frame, text="Poor", bg="#ffcdd2",
                font=("Arial", 8), padx=10).pack(side=tk.LEFT, padx=2)
        
        # Status bar
        self.status_label = tk.Label(self.root, text="Ready", 
                                     bd=1, relief=tk.SUNKEN, anchor=tk.W)
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)
    
    def start_scan(self):
        if self.is_scanning:
            self.info_label.config(text="Scan already in progress...")
            return
        
        self.is_scanning = True
        self.info_label.config(text="Scanning for networks...")
        self.status_label.config(text="Scanning...")
        
        # Clear existing data
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Start scan in thread
        thread = threading.Thread(target=self.scan_networks, daemon=True)
        thread.start()
    
    def scan_networks(self):
        try:
            # Run netsh command to get WiFi networks
            result = subprocess.run(
                ['netsh', 'wlan', 'show', 'networks', 'mode=Bssid'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                self.parse_networks(result.stdout)
            else:
                self.root.after(0, lambda: messagebox.showerror(
                    "Error", "Failed to scan networks. Make sure WiFi is enabled."))
        
        except subprocess.TimeoutExpired:
            self.root.after(0, lambda: messagebox.showerror(
                "Error", "Scan timeout. Please try again."))
        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror(
                "Error", f"Scan failed: {str(e)}"))
        
        finally:
            self.is_scanning = False
            self.root.after(0, self.scan_complete)
    
    def parse_networks(self, output):
        networks = []
        current_network = {}
        
        lines = output.split('\n')
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('SSID'):
                # New network
                if current_network and current_network.get('ssid'):
                    networks.append(current_network.copy())
                
                # Extract SSID
                parts = line.split(':', 1)
                if len(parts) > 1:
                    ssid = parts[1].strip()
                    current_network = {'ssid': ssid if ssid else '(Hidden Network)'}
            
            elif 'Authentication' in line:
                parts = line.split(':', 1)
                if len(parts) > 1:
                    current_network['security'] = parts[1].strip()
            
            elif 'Signal' in line:
                parts = line.split(':', 1)
                if len(parts) > 1:
                    signal = parts[1].strip()
                    current_network['signal'] = signal
            
            elif 'Channel' in line:
                parts = line.split(':', 1)
                if len(parts) > 1:
                    channel = parts[1].strip()
                    current_network['channel'] = channel
            
            elif 'BSSID' in line:
                parts = line.split(':', 1)
                if len(parts) > 1:
                    bssid = parts[1].strip()
                    current_network['bssid'] = bssid
        
        # Add last network
        if current_network and current_network.get('ssid'):
            networks.append(current_network)
        
        self.networks = networks
        self.root.after(0, self.display_networks)
    
    def display_networks(self):
        # Clear tree
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        if not self.networks:
            self.info_label.config(text="No networks found")
            self.count_label.config(text="Networks: 0")
            return
        
        # Sort by signal strength
        sorted_networks = sorted(self.networks, 
                                key=lambda x: self.signal_to_number(x.get('signal', '0%')),
                                reverse=True)
        
        for network in sorted_networks:
            ssid = network.get('ssid', 'Unknown')
            signal = network.get('signal', 'N/A')
            security = network.get('security', 'Unknown')
            channel = network.get('channel', 'N/A')
            bssid = network.get('bssid', 'N/A')
            
            # Determine signal strength tag
            signal_num = self.signal_to_number(signal)
            if signal_num >= 75:
                tag = 'excellent'
            elif signal_num >= 50:
                tag = 'good'
            elif signal_num >= 25:
                tag = 'fair'
            else:
                tag = 'poor'
            
            # Add to tree
            self.tree.insert('', 'end', text=ssid,
                           values=(signal, security, channel, bssid),
                           tags=(tag,))
        
        self.count_label.config(text=f"Networks: {len(self.networks)}")
        self.info_label.config(text=f"Found {len(self.networks)} network(s)")
    
    def signal_to_number(self, signal_str):
        """Convert signal percentage string to number"""
        try:
            return int(signal_str.rstrip('%'))
        except:
            return 0
    
    def scan_complete(self):
        self.status_label.config(text=f"Scan complete - Found {len(self.networks)} networks")
    
    def toggle_auto_refresh(self):
        self.auto_refresh = self.auto_refresh_var.get()
        
        if self.auto_refresh:
            self.status_label.config(text="Auto-refresh enabled (every 10 seconds)")
            self.auto_refresh_loop()
        else:
            self.status_label.config(text="Auto-refresh disabled")
    
    def auto_refresh_loop(self):
        if self.auto_refresh:
            self.start_scan()
            self.root.after(10000, self.auto_refresh_loop)
    
    def show_details(self, event=None):
        selection = self.tree.selection()
        if not selection:
            messagebox.showinfo("Info", "Please select a network")
            return
        
        item = self.tree.item(selection[0])
        ssid = item['text']
        values = item['values']
        
        # Find full network details
        network = None
        for net in self.networks:
            if net.get('ssid') == ssid:
                network = net
                break
        
        if not network:
            return
        
        # Create details window
        details_window = tk.Toplevel(self.root)
        details_window.title(f"Network Details - {ssid}")
        details_window.geometry("500x400")
        
        tk.Label(details_window, text=f"📡 {ssid}", 
                font=("Arial", 16, "bold")).pack(pady=20)
        
        details_frame = tk.Frame(details_window)
        details_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        details = [
            ("SSID:", network.get('ssid', 'N/A')),
            ("Signal Strength:", network.get('signal', 'N/A')),
            ("Security Type:", network.get('security', 'N/A')),
            ("Channel:", network.get('channel', 'N/A')),
            ("MAC Address (BSSID):", network.get('bssid', 'N/A')),
        ]
        
        for i, (label, value) in enumerate(details):
            tk.Label(details_frame, text=label, font=("Arial", 10, "bold"),
                    anchor=tk.W).grid(row=i, column=0, sticky=tk.W, pady=5, padx=5)
            tk.Label(details_frame, text=value, font=("Arial", 10),
                    anchor=tk.W).grid(row=i, column=1, sticky=tk.W, pady=5, padx=5)
        
        # Signal quality assessment
        signal_num = self.signal_to_number(network.get('signal', '0%'))
        if signal_num >= 75:
            quality = "Excellent - Strong connection expected"
            color = "#4CAF50"
        elif signal_num >= 50:
            quality = "Good - Reliable connection"
            color = "#FFC107"
        elif signal_num >= 25:
            quality = "Fair - May experience issues"
            color = "#FF9800"
        else:
            quality = "Poor - Weak signal"
            color = "#F44336"
        
        tk.Label(details_frame, text="Signal Quality:", font=("Arial", 10, "bold"),
                anchor=tk.W).grid(row=len(details), column=0, sticky=tk.W, pady=5, padx=5)
        tk.Label(details_frame, text=quality, font=("Arial", 10),
                fg=color, anchor=tk.W).grid(row=len(details), column=1, sticky=tk.W, pady=5, padx=5)
        
        tk.Button(details_window, text="Close", command=details_window.destroy,
                 bg="#2196F3", fg="white", font=("Arial", 10),
                 padx=20, pady=5).pack(pady=20)
    
    def export_results(self):
        if not self.networks:
            messagebox.showinfo("Info", "No networks to export")
            return
        
        from tkinter import filedialog
        
        file_path = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("CSV files", "*.csv"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write("WiFi Network Scan Results\n")
                    f.write("=" * 80 + "\n\n")
                    f.write(f"Total Networks Found: {len(self.networks)}\n")
                    f.write(f"Scan Time: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                    
                    # Sort by signal
                    sorted_networks = sorted(self.networks,
                                           key=lambda x: self.signal_to_number(x.get('signal', '0%')),
                                           reverse=True)
                    
                    for i, network in enumerate(sorted_networks, 1):
                        f.write(f"\n{i}. {network.get('ssid', 'Unknown')}\n")
                        f.write("-" * 80 + "\n")
                        f.write(f"   Signal Strength: {network.get('signal', 'N/A')}\n")
                        f.write(f"   Security: {network.get('security', 'N/A')}\n")
                        f.write(f"   Channel: {network.get('channel', 'N/A')}\n")
                        f.write(f"   BSSID: {network.get('bssid', 'N/A')}\n")
                
                messagebox.showinfo("Success", f"Results exported to:\n{file_path}")
                self.status_label.config(text=f"Exported to {file_path}")
            
            except Exception as e:
                messagebox.showerror("Error", f"Failed to export: {str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    app = WiFiScanner(root)
    root.mainloop()
