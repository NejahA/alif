"""
Atlas - Context-Aware Productivity Tracker
A simple Windows application to track your work activities and sessions
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog, simpledialog
import json
import os
from datetime import datetime, timedelta
import psutil
import threading
import time

class Atlas:
    def __init__(self, root):
        self.root = root
        self.root.title("Atlas - Context-Aware Productivity")
        self.root.geometry("900x600")
        
        # Data storage
        self.data_file = "atlas_data.json"
        self.sessions = []
        self.current_session = None
        self.current_activity = "other"
        self.monitoring = False
        
        # Load existing data
        self.load_data()
        
        # Create UI
        self.create_ui()
        
        # Start monitoring
        self.start_monitoring()
        
    def create_ui(self):
        # Create notebook (tabs)
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill='both', expand=True, padx=10, pady=10)
        
        # Dashboard tab
        self.dashboard_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.dashboard_frame, text='Dashboard')
        self.create_dashboard()
        
        # Activity tab
        self.activity_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.activity_frame, text='Activity')
        self.create_activity_view()
        
        # Sessions tab
        self.sessions_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.sessions_frame, text='Sessions')
        self.create_sessions_view()
        
        # Snapshots tab
        self.snapshots_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.snapshots_frame, text='Snapshots')
        self.create_snapshots_view()
        
        # Settings tab
        self.settings_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.settings_frame, text='Settings')
        self.create_settings_view()
        
    def create_dashboard(self):
        # Title
        title = tk.Label(self.dashboard_frame, text="Dashboard", font=('Arial', 20, 'bold'))
        title.pack(pady=10)
        
        # Stats frame
        stats_frame = tk.Frame(self.dashboard_frame)
        stats_frame.pack(fill='x', padx=20, pady=10)
        
        # Current Activity
        self.activity_label = tk.Label(stats_frame, text="Current Activity: Other", 
                                        font=('Arial', 14), bg='#e3f2fd', padx=20, pady=10)
        self.activity_label.pack(fill='x', pady=5)
        
        # Today's Stats
        stats_grid = tk.Frame(stats_frame)
        stats_grid.pack(fill='x', pady=10)
        
        # Total Focus Time
        focus_frame = tk.Frame(stats_grid, bg='#fff3e0', padx=20, pady=15)
        focus_frame.grid(row=0, column=0, padx=5, sticky='ew')
        tk.Label(focus_frame, text="Today's Focus Time", font=('Arial', 10), bg='#fff3e0').pack()
        self.focus_time_label = tk.Label(focus_frame, text="0 min", font=('Arial', 18, 'bold'), bg='#fff3e0')
        self.focus_time_label.pack()
        
        # Active Session
        session_frame = tk.Frame(stats_grid, bg='#e8f5e9', padx=20, pady=15)
        session_frame.grid(row=0, column=1, padx=5, sticky='ew')
        tk.Label(session_frame, text="Active Session", font=('Arial', 10), bg='#e8f5e9').pack()
        self.session_time_label = tk.Label(session_frame, text="--:--", font=('Arial', 18, 'bold'), bg='#e8f5e9')
        self.session_time_label.pack()
        
        # Total Sessions
        total_frame = tk.Frame(stats_grid, bg='#f3e5f5', padx=20, pady=15)
        total_frame.grid(row=0, column=2, padx=5, sticky='ew')
        tk.Label(total_frame, text="Total Sessions", font=('Arial', 10), bg='#f3e5f5').pack()
        self.total_sessions_label = tk.Label(total_frame, text="0", font=('Arial', 18, 'bold'), bg='#f3e5f5')
        self.total_sessions_label.pack()
        
        stats_grid.columnconfigure(0, weight=1)
        stats_grid.columnconfigure(1, weight=1)
        stats_grid.columnconfigure(2, weight=1)
        
        # Recent Sessions
        tk.Label(self.dashboard_frame, text="Recent Sessions", font=('Arial', 14, 'bold')).pack(pady=(20, 10))
        
        self.recent_sessions_text = tk.Text(self.dashboard_frame, height=10, width=80)
        self.recent_sessions_text.pack(padx=20, pady=5)
        
        # Update button
        tk.Button(self.dashboard_frame, text="Refresh", command=self.update_dashboard, 
                bg='#2196F3', fg='white', padx=20, pady=5).pack(pady=10)
        
    def create_activity_view(self):
        tk.Label(self.activity_frame, text="Activity Detection", font=('Arial', 20, 'bold')).pack(pady=10)
        
        # Current activity display
        self.current_activity_label = tk.Label(self.activity_frame, 
                                               text="Detecting activity...", 
                                               font=('Arial', 16), bg='#e3f2fd', padx=20, pady=20)
        self.current_activity_label.pack(fill='x', padx=20, pady=10)
        
        # Running applications
        tk.Label(self.activity_frame, text="Running Applications", font=('Arial', 14, 'bold')).pack(pady=10)
        
        self.apps_listbox = tk.Listbox(self.activity_frame, height=15, width=80)
        self.apps_listbox.pack(padx=20, pady=5)
        
        tk.Button(self.activity_frame, text="Refresh Apps", command=self.refresh_apps,
                 bg='#2196F3', fg='white', padx=20, pady=5).pack(pady=10)
        
    def create_sessions_view(self):
        tk.Label(self.sessions_frame, text="Session History", font=('Arial', 20, 'bold')).pack(pady=10)
        
        # Session list
        self.sessions_text = tk.Text(self.sessions_frame, height=20, width=80)
        self.sessions_text.pack(padx=20, pady=10)
        
        # Buttons
        btn_frame = tk.Frame(self.sessions_frame)
        btn_frame.pack(pady=10)
        
        tk.Button(btn_frame, text="Refresh", command=self.refresh_sessions,
                 bg='#2196F3', fg='white', padx=20, pady=5).pack(side='left', padx=5)
        tk.Button(btn_frame, text="Clear History", command=self.clear_sessions,
                 bg='#f44336', fg='white', padx=20, pady=5).pack(side='left', padx=5)
        
    def create_snapshots_view(self):
        tk.Label(self.snapshots_frame, text="Workspace Snapshots", font=('Arial', 20, 'bold')).pack(pady=10)
        
        # Create snapshot button
        tk.Button(self.snapshots_frame, text="Create Snapshot", command=self.create_snapshot,
                 bg='#4CAF50', fg='white', padx=30, pady=10, font=('Arial', 12)).pack(pady=10)
        
        # Snapshots list
        tk.Label(self.snapshots_frame, text="Saved Snapshots", font=('Arial', 14, 'bold')).pack(pady=10)
        
        self.snapshots_listbox = tk.Listbox(self.snapshots_frame, height=15, width=80)
        self.snapshots_listbox.pack(padx=20, pady=5)
        
        # Buttons
        btn_frame = tk.Frame(self.snapshots_frame)
        btn_frame.pack(pady=10)
        
        tk.Button(btn_frame, text="Restore Selected", command=self.restore_snapshot,
                 bg='#2196F3', fg='white', padx=20, pady=5).pack(side='left', padx=5)
        tk.Button(btn_frame, text="Delete Selected", command=self.delete_snapshot,
                 bg='#f44336', fg='white', padx=20, pady=5).pack(side='left', padx=5)
        tk.Button(btn_frame, text="Refresh", command=self.refresh_snapshots,
                 bg='#9E9E9E', fg='white', padx=20, pady=5).pack(side='left', padx=5)
    
    def create_settings_view(self):
        tk.Label(self.settings_frame, text="Settings", font=('Arial', 20, 'bold')).pack(pady=10)
        
        # Data management
        tk.Label(self.settings_frame, text="Data Management", font=('Arial', 14, 'bold')).pack(pady=10)
        
        btn_frame = tk.Frame(self.settings_frame)
        btn_frame.pack(pady=10)
        
        tk.Button(btn_frame, text="Export Data", command=self.export_data,
                 bg='#2196F3', fg='white', padx=20, pady=10).pack(pady=5)
        tk.Button(btn_frame, text="Import Data", command=self.import_data,
                 bg='#FF9800', fg='white', padx=20, pady=10).pack(pady=5)
        tk.Button(btn_frame, text="Delete All Data", command=self.delete_all_data,
                 bg='#f44336', fg='white', padx=20, pady=10).pack(pady=5)
        
        # Info
        info_text = f"""
        Data Location: {os.path.abspath(self.data_file)}
        Total Sessions: {len(self.sessions)}
        Monitoring: {'Active' if self.monitoring else 'Inactive'}
        """
        tk.Label(self.settings_frame, text=info_text, font=('Arial', 10), justify='left').pack(pady=20)
        
    def detect_activity(self):
        """Detect current activity based on running applications"""
        try:
            # Get foreground window process
            import win32gui
            import win32process
            
            hwnd = win32gui.GetForegroundWindow()
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            
            try:
                process = psutil.Process(pid)
                app_name = process.name().lower()
                
                # Classify activity
                if any(x in app_name for x in ['code', 'pycharm', 'visual studio', 'sublime', 'atom', 'notepad++']):
                    return 'coding'
                elif any(x in app_name for x in ['word', 'notepad', 'onenote', 'notion']):
                    return 'writing'
                elif any(x in app_name for x in ['photoshop', 'illustrator', 'figma', 'gimp']):
                    return 'designing'
                elif any(x in app_name for x in ['zoom', 'teams', 'slack', 'discord', 'skype']):
                    return 'meeting'
                else:
                    return 'other'
            except:
                return 'other'
        except:
            return 'other'
    
    def monitor_activity(self):
        """Background thread to monitor activity"""
        while self.monitoring:
            activity = self.detect_activity()
                    
            if activity != self.current_activity:
                # Activity changed
                if self.current_session:
                    self.end_session()
                
                if activity != 'other':
                    self.start_session(activity)
                
                self.current_activity = activity
                self.root.after(0, self.update_activity_display)
            
            time.sleep(5)  # Check every 5 seconds
    
    def start_monitoring(self):
        """Start activity monitoring"""
        self.monitoring = True
        thread = threading.Thread(target=self.monitor_activity, daemon=True)
        thread.start()
    
    def start_session(self, activity):
        """Start a new work session"""
        self.current_session = {
            'activity': activity,
            'start_time': datetime.now().isoformat(),
            'end_time': None,
            'duration': 0
        }
    
    def end_session(self):
        """End current session"""
        if self.current_session:
            self.current_session['end_time'] = datetime.now().isoformat()
            start = datetime.fromisoformat(self.current_session['start_time'])
            end = datetime.fromisoformat(self.current_session['end_time'])
            self.current_session['duration'] = int((end - start).total_seconds())
            
            self.sessions.append(self.current_session)
            self.save_data()
            self.current_session = None

    def update_activity_display(self):
        """Update activity display in UI"""
        activity_icons = {
            'coding': '💻',
            'writing': '✍️',
            'designing': '🎨',
            'meeting': '👥',
            'other': '📊'
        }
        
        icon = activity_icons.get(self.current_activity, '📊')
        text = f"{icon} {self.current_activity.capitalize()}"
        
        self.activity_label.config(text=f"Current Activity: {text}")
        self.current_activity_label.config(text=f"Current Activity: {text}")
    
    def update_dashboard(self):
        """Update dashboard statistics"""
        # Calculate today's stats
        today = datetime.now().date()
        today_sessions = [s for s in self.sessions 
                          if datetime.fromisoformat(s['start_time']).date() == today]
        
        total_time = sum(s['duration'] for s in today_sessions)
        minutes = total_time // 60
        
        self.focus_time_label.config(text=f"{minutes} min")
        self.total_sessions_label.config(text=str(len(today_sessions)))
        
        # Current session time
        if self.current_session:
            start = datetime.fromisoformat(self.current_session['start_time'])
            duration = int((datetime.now() - start).total_seconds())
            mins = duration // 60
            secs = duration % 60
            self.session_time_label.config(text=f"{mins:02d}:{secs:02d}")
        else:
            self.session_time_label.config(text="--:--")
        
        # Recent sessions
        self.recent_sessions_text.delete('1.0', tk.END)
        for session in reversed(today_sessions[-5:]):
            start_time = datetime.fromisoformat(session['start_time']).strftime('%H:%M')
            duration = session['duration'] // 60
            activity = session['activity'].capitalize()
            self.recent_sessions_text.insert(tk.END, 
                f"{start_time} - {activity} - {duration} minutes\n")
        
        # Schedule next update
        self.root.after(1000, self.update_dashboard)
    
    def refresh_apps(self):
        """Refresh running applications list"""
        self.apps_listbox.delete(0, tk.END)
        
        for proc in psutil.process_iter(['name', 'pid']):
            try:
                self.apps_listbox.insert(tk.END, f"{proc.info['name']} (PID: {proc.info['pid']})")
            except:
                pass
    
    def refresh_sessions(self):
        """Refresh sessions list"""
        self.sessions_text.delete('1.0', tk.END)
        
        for session in reversed(self.sessions[-20:]):
            start_time = datetime.fromisoformat(session['start_time']).strftime('%Y-%m-%d %H:%M')
            duration = session['duration'] // 60
            activity = session['activity'].capitalize()
            self.sessions_text.insert(tk.END, 
                f"{start_time} - {activity} - {duration} minutes\n")
    
    def clear_sessions(self):
        """Clear all session history"""
        if messagebox.askyesno("Confirm", "Delete all session history?"):
            self.sessions = []
            self.save_data()
            self.refresh_sessions()
            messagebox.showinfo("Success", "Session history cleared!")
    
    def create_snapshot(self):
        """Create a workspace snapshot"""
        name = tk.simpledialog.askstring("Create Snapshot", "Enter snapshot name:")
        if not name:
            return
        
        # Get running applications
        apps = []
        for proc in psutil.process_iter(['name', 'exe']):
            try:
                apps.append({
                    'name': proc.info['name'],
                    'path': proc.info['exe']
                })
            except:
                pass
        
        snapshot = {
            'id': datetime.now().isoformat(),
            'name': name,
            'created_at': datetime.now().isoformat(),
            'applications': apps
        }
    
        # Load existing snapshots
        snapshots = self.load_snapshots()
        snapshots.append(snapshot)
        self.save_snapshots(snapshots)
        
        self.refresh_snapshots()
        messagebox.showinfo("Success", f"Snapshot '{name}' created with {len(apps)} applications!")
    
    def restore_snapshot(self):
        """Restore a workspace snapshot"""
        selection = self.snapshots_listbox.curselection()
        if not selection:
            messagebox.showwarning("Warning", "Please select a snapshot to restore")
            return
        
        snapshots = self.load_snapshots()
        snapshot = snapshots[selection[0]]
        
        if messagebox.askyesno("Confirm", f"Restore snapshot '{snapshot['name']}'?"):
            # Launch applications
            launched = 0
            for app in snapshot['applications']:
                try:
                    if app['path'] and os.path.exists(app['path']):
                        os.startfile(app['path'])
                        launched += 1
                        time.sleep(0.5)
                except:
                    pass
            
            messagebox.showinfo("Success", f"Launched {launched} applications!")
            
    def delete_snapshot(self):
        """Delete a snapshot"""
        selection = self.snapshots_listbox.curselection()
        if not selection:
            messagebox.showwarning("Warning", "Please select a snapshot to delete")
            return
        
        snapshots = self.load_snapshots()
        snapshot = snapshots[selection[0]]
        
        if messagebox.askyesno("Confirm", f"Delete snapshot '{snapshot['name']}'?"):
            snapshots.pop(selection[0])
            self.save_snapshots(snapshots)
            self.refresh_snapshots()
            messagebox.showinfo("Success", "Snapshot deleted!")
    
    def refresh_snapshots(self):
        """Refresh snapshots list"""
        self.snapshots_listbox.delete(0, tk.END)
        
        snapshots = self.load_snapshots()
        for snapshot in snapshots:
            created = datetime.fromisoformat(snapshot['created_at']).strftime('%Y-%m-%d %H:%M')
            self.snapshots_listbox.insert(tk.END, 
                f"{snapshot['name']} - {created} ({len(snapshot['applications'])} apps)")

    def export_data(self):
        """Export all data to JSON file"""
        filename = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        
        if filename:
            data = {
                'sessions': self.sessions,
                'snapshots': self.load_snapshots(),
                'exported_at': datetime.now().isoformat()
            }
            
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2)
            
            messagebox.showinfo("Success", f"Data exported to {filename}")
    
    def import_data(self):
        """Import data from JSON file"""
        filename = filedialog.askopenfilename(
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        
        if filename:
            try:
                with open(filename, 'r') as f:
                    data = json.load(f)
                
                if 'sessions' in data:
                    self.sessions = data['sessions']
                    self.save_data()
                
                if 'snapshots' in data:
                    self.save_snapshots(data['snapshots'])
                
                messagebox.showinfo("Success", "Data imported successfully!")
                self.update_dashboard()
                self.refresh_sessions()
                self.refresh_snapshots()
            except Exception as e:
                messagebox.showerror("Error", f"Failed to import data: {e}")
    
    def delete_all_data(self):
        """Delete all data"""
        if messagebox.askyesno("Confirm", "Delete ALL data? This cannot be undone!"):
            self.sessions = []
            self.save_data()
            self.save_snapshots([])
            messagebox.showinfo("Success", "All data deleted!")
            self.update_dashboard()
            self.refresh_sessions()
            self.refresh_snapshots()
    
    def load_data(self):
        """Load data from file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                    self.sessions = data.get('sessions', [])
            except:
                self.sessions = []
    
    def save_data(self):
        """Save data to file"""
        data = {'sessions': self.sessions}
        with open(self.data_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_snapshots(self):
        """Load snapshots from file"""
        snapshots_file = "atlas_snapshots.json"
        if os.path.exists(snapshots_file):
            try:
                with open(snapshots_file, 'r') as f:
                    return json.load(f)
            except:
                return []
        return []
            
    def save_snapshots(self, snapshots):
        """Save snapshots to file"""
        with open("atlas_snapshots.json", 'w') as f:
            json.dump(snapshots, f, indent=2)

if __name__ == "__main__":
    root = tk.Tk()
    app = Atlas(root)
    app.update_dashboard()
    app.refresh_apps()
    app.refresh_sessions()
    app.refresh_snapshots()
    root.mainloop()
