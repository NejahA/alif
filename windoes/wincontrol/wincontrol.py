import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import subprocess
import os
import winreg
import ctypes
import sys

class WinControl:
    def __init__(self, root):
        self.root = root
        self.root.title("WinControl - System Tweaker")
        self.root.geometry("900x700")
        
        # Check admin rights
        self.is_admin = ctypes.windll.shell32.IsUserAnAdmin() != 0
        
        # Modern colors
        self.bg_dark = '#1a1a1d'
        self.bg_medium = '#2d2d30'
        self.bg_light = '#3e3e42'
        self.accent = '#0078d4'
        self.accent_hover = '#1e88e5'
        self.danger = '#e74c3c'
        self.success = '#27ae60'
        self.text_white = '#ffffff'
        self.text_muted = '#a0a0a0'
        
        self.root.configure(bg=self.bg_dark)
        
        self.setup_ui()
        
    def setup_ui(self):
        # Top bar
        top_bar = tk.Frame(self.root, bg=self.bg_medium, height=70)
        top_bar.pack(fill=tk.X, side=tk.TOP)
        top_bar.pack_propagate(False)
        
        # Title
        tk.Label(
            top_bar,
            text="⚙️ WinControl",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 20, 'bold')
        ).pack(side=tk.LEFT, padx=20, pady=15)
        
        # Admin status
        if self.is_admin:
            status_text = "✓ Running as Administrator"
            status_color = self.success
        else:
            status_text = "⚠ Not Administrator (limited features)"
            status_color = self.danger
        
        tk.Label(
            top_bar,
            text=status_text,
            bg=self.bg_medium,
            fg=status_color,
            font=('Segoe UI', 10, 'bold')
        ).pack(side=tk.RIGHT, padx=20)
        
        # Main container with tabs
        notebook = ttk.Notebook(self.root)
        notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Style notebook
        style = ttk.Style()
        style.theme_use('default')
        style.configure('TNotebook', background=self.bg_dark, borderwidth=0)
        style.configure('TNotebook.Tab', background=self.bg_light, foreground=self.text_white, 
                       padding=[20, 10], font=('Segoe UI', 10))
        style.map('TNotebook.Tab', background=[('selected', self.accent)])
        
        # Create tabs
        self.privacy_tab = tk.Frame(notebook, bg=self.bg_dark)
        self.performance_tab = tk.Frame(notebook, bg=self.bg_dark)
        self.startup_tab = tk.Frame(notebook, bg=self.bg_dark)
        self.tweaks_tab = tk.Frame(notebook, bg=self.bg_dark)
        
        notebook.add(self.privacy_tab, text='🔒 Privacy')
        notebook.add(self.performance_tab, text='⚡ Performance')
        notebook.add(self.startup_tab, text='🚀 Startup')
        notebook.add(self.tweaks_tab, text='🔧 Tweaks')
        
        # Setup each tab
        self.setup_privacy_tab()
        self.setup_performance_tab()
        self.setup_startup_tab()
        self.setup_tweaks_tab()
        
        # Console output at bottom
        console_frame = tk.Frame(self.root, bg=self.bg_medium)
        console_frame.pack(fill=tk.BOTH, padx=10, pady=(0, 10))
        
        tk.Label(
            console_frame,
            text="Console Output:",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 10, 'bold')
        ).pack(anchor='w', padx=10, pady=(10, 5))
        
        self.console = scrolledtext.ScrolledText(
            console_frame,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Consolas', 9),
            height=6,
            relief=tk.FLAT,
            insertbackground=self.text_white
        )
        self.console.pack(fill=tk.BOTH, padx=10, pady=(0, 10))
        
    def setup_privacy_tab(self):
        container = tk.Frame(self.privacy_tab, bg=self.bg_dark)
        container.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        tk.Label(
            container,
            text="Privacy & Telemetry Settings",
            bg=self.bg_dark,
            fg=self.text_white,
            font=('Segoe UI', 14, 'bold')
        ).pack(anchor='w', pady=(0, 20))
        
        privacy_options = [
            ("Disable Telemetry", "Stops Windows from sending usage data to Microsoft", 
             lambda: self.disable_telemetry()),
            ("Disable Cortana", "Disables Cortana voice assistant", 
             lambda: self.disable_cortana()),
            ("Disable Windows Tips", "Stops Windows from showing tips and suggestions", 
             lambda: self.disable_tips()),
            ("Disable Activity History", "Prevents Windows from tracking your activity", 
             lambda: self.disable_activity_history()),
            ("Disable Location Tracking", "Disables location services", 
             lambda: self.disable_location()),
        ]
        
        for title, desc, action in privacy_options:
            self.create_option_card(container, title, desc, action)
        
        # Quick action button
        tk.Button(
            container,
            text="🛡️ Apply All Privacy Settings",
            command=self.apply_all_privacy,
            bg=self.accent,
            fg=self.text_white,
            font=('Segoe UI', 11, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            padx=20,
            pady=12
        ).pack(pady=20)
    
    def setup_performance_tab(self):
        container = tk.Frame(self.performance_tab, bg=self.bg_dark)
        container.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        tk.Label(
            container,
            text="Performance Optimizations",
            bg=self.bg_dark,
            fg=self.text_white,
            font=('Segoe UI', 14, 'bold')
        ).pack(anchor='w', pady=(0, 20))
        
        perf_options = [
            ("Disable Visual Effects", "Turns off animations for better performance", 
             lambda: self.disable_visual_effects()),
            ("Disable Windows Search Indexing", "Reduces disk usage (slower file search)", 
             lambda: self.disable_search_indexing()),
            ("Disable Superfetch", "Reduces RAM usage", 
             lambda: self.disable_superfetch()),
            ("Clean Temp Files", "Removes temporary files to free up space", 
             lambda: self.clean_temp_files()),
            ("Optimize Power Plan", "Sets high performance power plan", 
             lambda: self.set_high_performance()),
        ]
        
        for title, desc, action in perf_options:
            self.create_option_card(container, title, desc, action)
    
    def setup_startup_tab(self):
        container = tk.Frame(self.startup_tab, bg=self.bg_dark)
        container.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        tk.Label(
            container,
            text="Startup Programs",
            bg=self.bg_dark,
            fg=self.text_white,
            font=('Segoe UI', 14, 'bold')
        ).pack(anchor='w', pady=(0, 10))
        
        tk.Label(
            container,
            text="Manage which programs start with Windows",
            bg=self.bg_dark,
            fg=self.text_muted,
            font=('Segoe UI', 10)
        ).pack(anchor='w', pady=(0, 20))
        
        # Buttons
        btn_frame = tk.Frame(container, bg=self.bg_dark)
        btn_frame.pack(fill=tk.X, pady=10)
        
        tk.Button(
            btn_frame,
            text="📋 List Startup Programs",
            command=self.list_startup_programs,
            bg=self.accent,
            fg=self.text_white,
            font=('Segoe UI', 10, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            padx=15,
            pady=10
        ).pack(side=tk.LEFT, padx=(0, 10))
        
        tk.Button(
            btn_frame,
            text="🚀 Open Task Manager Startup",
            command=self.open_task_manager_startup,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 10),
            relief=tk.FLAT,
            cursor='hand2',
            padx=15,
            pady=10
        ).pack(side=tk.LEFT)
        
        # Info
        info_frame = tk.Frame(container, bg=self.bg_medium)
        info_frame.pack(fill=tk.BOTH, expand=True, pady=20)
        
        tk.Label(
            info_frame,
            text="💡 Tip: Disable unnecessary startup programs to improve boot time",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 10),
            wraplength=800,
            justify=tk.LEFT
        ).pack(padx=20, pady=20)
    
    def setup_tweaks_tab(self):
        container = tk.Frame(self.tweaks_tab, bg=self.bg_dark)
        container.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        tk.Label(
            container,
            text="System Tweaks",
            bg=self.bg_dark,
            fg=self.text_white,
            font=('Segoe UI', 14, 'bold')
        ).pack(anchor='w', pady=(0, 20))
        
        tweak_options = [
            ("Show File Extensions", "Always show file extensions in Explorer", 
             lambda: self.show_file_extensions()),
            ("Show Hidden Files", "Show hidden files and folders", 
             lambda: self.show_hidden_files()),
            ("Disable Sticky Keys", "Prevents Sticky Keys popup", 
             lambda: self.disable_sticky_keys()),
            ("Enable Dark Mode", "Enables Windows dark theme", 
             lambda: self.enable_dark_mode()),
            ("Enable Light Mode", "Enables Windows light theme", 
             lambda: self.enable_light_mode()),
            ("Disable OneDrive", "Disables OneDrive integration", 
             lambda: self.disable_onedrive()),
        ]
        
        for title, desc, action in tweak_options:
            self.create_option_card(container, title, desc, action)
    
    def create_option_card(self, parent, title, description, action):
        card = tk.Frame(parent, bg=self.bg_medium)
        card.pack(fill=tk.X, pady=5)
        
        inner = tk.Frame(card, bg=self.bg_medium)
        inner.pack(fill=tk.BOTH, padx=15, pady=12)
        
        # Left side - text
        text_frame = tk.Frame(inner, bg=self.bg_medium)
        text_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        tk.Label(
            text_frame,
            text=title,
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 11, 'bold'),
            anchor='w'
        ).pack(fill=tk.X)
        
        tk.Label(
            text_frame,
            text=description,
            bg=self.bg_medium,
            fg=self.text_muted,
            font=('Segoe UI', 9),
            anchor='w',
            wraplength=600
        ).pack(fill=tk.X, pady=(3, 0))
        
        # Right side - button
        tk.Button(
            inner,
            text="Apply",
            command=action,
            bg=self.accent,
            fg=self.text_white,
            font=('Segoe UI', 9, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            padx=20,
            pady=8
        ).pack(side=tk.RIGHT)
    
    def log(self, message, color='white'):
        self.console.insert(tk.END, f"{message}\n")
        self.console.see(tk.END)
        self.root.update()
    
    def run_command(self, command, shell=True):
        try:
            result = subprocess.run(command, shell=shell, capture_output=True, text=True)
            if result.returncode == 0:
                self.log(f"✓ Success: {command}", 'green')
                if result.stdout:
                    self.log(result.stdout)
                return True
            else:
                self.log(f"✗ Failed: {command}", 'red')
                if result.stderr:
                    self.log(result.stderr)
                return False
        except Exception as e:
            self.log(f"✗ Error: {str(e)}", 'red')
            return False
    
    def set_registry(self, path, name, value, value_type=winreg.REG_DWORD):
        try:
            key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, path)
            winreg.SetValueEx(key, name, 0, value_type, value)
            winreg.CloseKey(key)
            self.log(f"✓ Registry updated: {path}\\{name}")
            return True
        except Exception as e:
            self.log(f"✗ Registry error: {str(e)}")
            return False
    
    # Privacy functions
    def disable_telemetry(self):
        self.log("Disabling telemetry...")
        self.run_command('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f')
        self.run_command('sc stop DiagTrack')
        self.run_command('sc config DiagTrack start= disabled')
    
    def disable_cortana(self):
        self.log("Disabling Cortana...")
        self.set_registry(r'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Search', 'CortanaEnabled', 0)
        self.set_registry(r'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Search', 'BingSearchEnabled', 0)
    
    def disable_tips(self):
        self.log("Disabling Windows tips...")
        self.set_registry(r'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager', 'SoftLandingEnabled', 0)
        self.set_registry(r'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager', 'SubscribedContent-338389Enabled', 0)
    
    def disable_activity_history(self):
        self.log("Disabling activity history...")
        self.set_registry(r'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\ActivityFeed', 'EnableActivityFeed', 0)
    
    def disable_location(self):
        self.log("Disabling location tracking...")
        self.set_registry(r'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\location', 'Value', 'Deny', winreg.REG_SZ)
    
    def apply_all_privacy(self):
        if messagebox.askyesno("Apply All", "Apply all privacy settings? This may require a restart."):
            self.disable_telemetry()
            self.disable_cortana()
            self.disable_tips()
            self.disable_activity_history()
            self.disable_location()
            self.log("✓ All privacy settings applied!")
            messagebox.showinfo("Complete", "Privacy settings applied. Restart recommended.")
    
    # Performance functions
    def disable_visual_effects(self):
        self.log("Disabling visual effects...")
        self.set_registry(r'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects', 'VisualFXSetting', 2)
        self.run_command('SystemPropertiesPerformance.exe')
    
    def disable_search_indexing(self):
        self.log("Disabling search indexing...")
        self.run_command('sc stop WSearch')
        self.run_command('sc config WSearch start= disabled')
    
    def disable_superfetch(self):
        self.log("Disabling Superfetch...")
        self.run_command('sc stop SysMain')
        self.run_command('sc config SysMain start= disabled')
    
    def clean_temp_files(self):
        self.log("Cleaning temporary files...")
        self.run_command('cleanmgr /sagerun:1')
    
    def set_high_performance(self):
        self.log("Setting high performance power plan...")
        self.run_command('powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c')
    
    # Startup functions
    def list_startup_programs(self):
        self.log("Listing startup programs...")
        self.run_command('wmic startup get caption,command')
    
    def open_task_manager_startup(self):
        self.log("Opening Task Manager...")
        subprocess.Popen('taskmgr /0 /startup')
    
    # Tweak functions
    def show_file_extensions(self):
        self.log("Showing file extensions...")
        self.set_registry(r'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced', 'HideFileExt', 0)
        self.restart_explorer()
    
    def show_hidden_files(self):
        self.log("Showing hidden files...")
        self.set_registry(r'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced', 'Hidden', 1)
        self.restart_explorer()
    
    def disable_sticky_keys(self):
        self.log("Disabling Sticky Keys...")
        self.set_registry(r'Control Panel\\Accessibility\\StickyKeys', 'Flags', '506', winreg.REG_SZ)
    
    def enable_dark_mode(self):
        self.log("Enabling dark mode...")
        self.set_registry(r'SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize', 'AppsUseLightTheme', 0)
        self.set_registry(r'SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize', 'SystemUsesLightTheme', 0)
        messagebox.showinfo("Dark Mode", "Dark mode enabled! Changes will apply to new windows.")
    
    def enable_light_mode(self):
        self.log("Enabling light mode...")
        self.set_registry(r'SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize', 'AppsUseLightTheme', 1)
        self.set_registry(r'SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize', 'SystemUsesLightTheme', 1)
        messagebox.showinfo("Light Mode", "Light mode enabled! Changes will apply to new windows.")
    
    def disable_onedrive(self):
        self.log("Disabling OneDrive...")
        self.run_command('taskkill /f /im OneDrive.exe')
        self.set_registry(r'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System', 'DisableOneDrive', 1)
    
    def restart_explorer(self):
        self.log("Restarting Explorer...")
        self.run_command('taskkill /f /im explorer.exe')
        subprocess.Popen('explorer.exe')

if __name__ == '__main__':
    # Check if running as admin
    if not ctypes.windll.shell32.IsUserAnAdmin():
        messagebox.showwarning(
            "Administrator Required",
            "Some features require administrator privileges.\n\n"
            "Right-click and select 'Run as administrator' for full functionality."
        )
    
    root = tk.Tk()
    app = WinControl(root)
    root.mainloop()
