import tkinter as tk
from tkinter import ttk, messagebox
import json
import os
from datetime import datetime
import time
from tkcalendar import DateEntry
try:
    from pymongo import MongoClient
    from mongodb_config import MONGODB_URI, DATABASE_NAME, COLLECTION_NAME, ENABLE_MONGODB
    MONGODB_AVAILABLE = True
except:
    MONGODB_AVAILABLE = False
    ENABLE_MONGODB = False

class DoughtWidget:
    def __init__(self, root):
        self.root = root
        self.root.title("In the Name of God - dought")
        
        # Widget settings - compact size
        self.widget_width = 320
        self.widget_height = 480
        
        # Position in bottom-right corner
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        x = screen_width - self.widget_width - 20
        y = screen_height - self.widget_height - 80
        
        self.root.geometry(f"{self.widget_width}x{self.widget_height}+{x}+{y}")
        
        # Widget properties
        self.root.attributes('-topmost', True)  # Always on top
        self.root.attributes('-alpha', 0.95)  # Slight transparency
        self.root.overrideredirect(False)  # Keep window decorations for now
        
        # Set icon
        try:
            icon_path = os.path.join(os.path.dirname(__file__), 'dought_icon.ico')
            self.root.iconbitmap(icon_path)
        except:
            pass
        
        # Modern color palette
        self.bg_dark = '#1e1e2e'
        self.bg_medium = '#313244'
        self.bg_light = '#45475a'
        self.bg_card = '#585b70'
        self.accent_todo = '#f38ba8'
        self.accent_progress = '#fab387'
        self.accent_done = '#a6e3a1'
        self.text_white = '#cdd6f4'
        self.text_muted = '#9399b2'
        
        self.root.configure(bg=self.bg_dark)
        
        # Data - use AppData folder for shared access
        appdata = os.getenv('APPDATA')
        dought_folder = os.path.join(appdata, 'dought')
        if not os.path.exists(dought_folder):
            os.makedirs(dought_folder)
        self.data_file = os.path.join(dought_folder, 'dought_data.json')
        self.lock_file = os.path.join(dought_folder, 'dought_widget.lock')
        
        # Check if another instance is running
        if os.path.exists(self.lock_file):
            try:
                with open(self.lock_file, 'r') as f:
                    pid = f.read().strip()
                # If lock file exists but process is not running, remove it
                import psutil
                if not psutil.pid_exists(int(pid)):
                    os.remove(self.lock_file)
            except:
                pass
        
        # Create lock file
        try:
            with open(self.lock_file, 'w') as f:
                f.write(str(os.getpid()))
        except:
            pass
        self.tasks = {
            'todo': [],
            'in_progress': [],
            'done': []
        }
        self.active_timers = {}
        self.collapsed = False
        self.last_modified = 0  # Track file modification time
        
        # MongoDB setup
        self.mongo_client = None
        self.mongo_db = None
        self.mongo_collection = None
        if ENABLE_MONGODB and MONGODB_AVAILABLE and MONGODB_URI:
            try:
                print(f"Attempting MongoDB connection...")
                print(f"  URI: {MONGODB_URI[:30]}...")
                print(f"  Database: {DATABASE_NAME}")
                print(f"  Collection: {COLLECTION_NAME}")
                
                self.mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
                # Test the connection
                self.mongo_client.admin.command('ping')
                
                self.mongo_db = self.mongo_client[DATABASE_NAME]
                self.mongo_collection = self.mongo_db[COLLECTION_NAME]
                print("✅ MongoDB connected successfully!")
                
                # Try to read existing data
                doc = self.mongo_collection.find_one({'_id': 'tasks_data'})
                if doc:
                    print(f"✅ Found existing tasks document in MongoDB")
                else:
                    print("⚠️ No tasks document found in MongoDB yet")
                    
            except Exception as e:
                print(f"❌ MongoDB connection failed: {e}")
                import traceback
                traceback.print_exc()
                self.mongo_client = None
        
        # Load data
        self.load_data()
        
        # Setup UI
        self.setup_ui()
        
        # Keyboard shortcuts
        self.root.bind('<Control-n>', lambda e: self.quick_add_task())
        self.root.bind('<Control-h>', lambda e: self.toggle_collapse())
        
        # Auto-save
        self.auto_save()
        
        # Check for external changes every 2 seconds
        self.check_external_changes()
        
        # Cleanup on close
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
    def setup_ui(self):
        # Header with drag capability
        self.header = tk.Frame(self.root, bg=self.bg_medium, height=40, cursor='fleur')
        self.header.pack(fill=tk.X, side=tk.TOP)
        self.header.pack_propagate(False)
        
        # Make header draggable
        self.header.bind('<Button-1>', self.start_drag)
        self.header.bind('<B1-Motion>', self.on_drag)
        
        # Title
        title_label = tk.Label(
            self.header,
            text="📋 dought",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 11, 'bold'),
            cursor='fleur'
        )
        title_label.pack(side=tk.LEFT, padx=10, pady=8)
        title_label.bind('<Button-1>', self.start_drag)
        title_label.bind('<B1-Motion>', self.on_drag)
        
        # "In The Name of God" subtitle
        subtitle_label = tk.Label(
            self.header,
            text="In The Name of God",
            bg=self.bg_medium,
            fg=self.accent_done,
            font=('Segoe UI', 8, 'italic'),
            cursor='fleur'
        )
        subtitle_label.pack(side=tk.LEFT, padx=(0, 5))
        subtitle_label.bind('<Button-1>', self.start_drag)
        subtitle_label.bind('<B1-Motion>', self.on_drag)
        
        # Collapse button
        self.collapse_btn = tk.Button(
            self.header,
            text="−",
            command=self.toggle_collapse,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 12, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            width=2
        )
        self.collapse_btn.pack(side=tk.RIGHT, padx=2)
        
        # Add button
        tk.Button(
            self.header,
            text="+",
            command=self.quick_add_task,
            bg=self.accent_todo,
            fg=self.bg_dark,
            font=('Segoe UI', 12, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            width=2
        ).pack(side=tk.RIGHT, padx=2)
        
        # Stats
        self.stats_label = tk.Label(
            self.header,
            text="",
            bg=self.bg_medium,
            fg=self.text_muted,
            font=('Segoe UI', 8)
        )
        self.stats_label.pack(side=tk.RIGHT, padx=5)  
        
        # Main content frame
        self.content_frame = tk.Frame(self.root, bg=self.bg_dark)
        self.content_frame.pack(fill=tk.BOTH, expand=True)
        
        # Scrollable task list
        self.canvas = tk.Canvas(self.content_frame, bg=self.bg_dark, highlightthickness=0)
        
        # Custom styled scrollbar
        style = ttk.Style()
        style.theme_use('default')
        style.configure("Custom.Vertical.TScrollbar",
                        background=self.bg_light,
                        troughcolor=self.bg_dark,
                        bordercolor=self.bg_dark,
                        arrowcolor=self.text_white,
                        width=14)
        
        scrollbar = ttk.Scrollbar(self.content_frame, orient="vertical", command=self.canvas.yview, style="Custom.Vertical.TScrollbar")
        self.scrollable_frame = tk.Frame(self.canvas, bg=self.bg_dark)
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        self.canvas_window = self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw", width=self.widget_width-20)
        self.canvas.configure(yscrollcommand=scrollbar.set)
        
        # Bind canvas resize to update window width
        self.canvas.bind('<Configure>', self._on_canvas_configure)
        
        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Mouse wheel scrolling
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)
        
        self.refresh_view()
        self.update_stats()
    
    def _on_mousewheel(self, event):
        self.canvas.yview_scroll(int(-1*(event.delta/120)), "units")
    
    def _on_canvas_configure(self, event):
        """Update the canvas window width when canvas is resized"""
        self.canvas.itemconfig(self.canvas_window, width=event.width)
    
    def start_drag(self, event):
        self.drag_x = event.x
        self.drag_y = event.y
    
    def on_drag(self, event):
        x = self.root.winfo_x() + event.x - self.drag_x
        y = self.root.winfo_y() + event.y - self.drag_y
        self.root.geometry(f"+{x}+{y}")
    
    def toggle_collapse(self):
        if self.collapsed:
            # Expand
            self.content_frame.pack(fill=tk.BOTH, expand=True)
            self.root.geometry(f"{self.widget_width}x{self.widget_height}")
            self.collapse_btn.config(text="−")
            self.collapsed = False
        else:
            # Collapse
            self.content_frame.pack_forget()
            self.root.geometry(f"{self.widget_width}x40")
            self.collapse_btn.config(text="+")
            self.collapsed = True
    
    def refresh_view(self):
        # Clear scrollable frame
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        
        # Show tasks by column
        columns = [
            ('todo', '📝 To Do', self.accent_todo),
            ('in_progress', '⚡ In Progress', self.accent_progress),
            ('done', '✅ Done', self.accent_done)
        ]
        
        for col_id, col_title, col_color in columns:
            if not self.tasks[col_id]:
                continue
            
            # Column header
            header = tk.Frame(self.scrollable_frame, bg=col_color, height=30)
            header.pack(fill=tk.X, padx=5, pady=(5, 2))
            
            tk.Label(
                header,
                text=f"{col_title} ({len(self.tasks[col_id])})",
                bg=col_color,
                fg=self.bg_dark,
                font=('Segoe UI', 9, 'bold')
            ).pack(side=tk.LEFT, padx=8, pady=5)
            
            # Tasks
            for task in self.tasks[col_id]:
                self.create_task_card(self.scrollable_frame, task, col_id)
    
    def create_task_card(self, parent, task, column):
        card = tk.Frame(parent, bg=self.bg_card, relief=tk.FLAT)
        card.pack(fill=tk.X, padx=5, pady=2)
        
        inner = tk.Frame(card, bg=self.bg_card)
        inner.pack(fill=tk.BOTH, padx=8, pady=6)
        
        # Task title
        title_label = tk.Label(
            inner,
            text=task['title'][:40] + ('...' if len(task['title']) > 40 else ''),
            bg=self.bg_card,
            fg=self.text_white,
            font=('Segoe UI', 9),
            wraplength=280,
            justify=tk.LEFT,
            anchor='w'
        )
        title_label.pack(fill=tk.X)
        
        # Description
        if task.get('description'):
            desc_label = tk.Label(
                inner,
                text=task['description'][:50] + ('...' if len(task.get('description', '')) > 50 else ''),
                bg=self.bg_card,
                fg=self.text_muted,
                font=('Segoe UI', 8),
                wraplength=280,
                justify=tk.LEFT,
                anchor='w'
            )
            desc_label.pack(fill=tk.X, pady=(2, 0))
        
        # Due date
        if task.get('due_date'):
            due_label = tk.Label(
                inner,
                text=f"📅 {task['due_date']}",
                bg=self.bg_card,
                fg=self.accent_progress,
                font=('Segoe UI', 7, 'bold')
            )
            due_label.pack(anchor='w', pady=(3, 0))
        
        # Action buttons
        btn_frame = tk.Frame(inner, bg=self.bg_card)
        btn_frame.pack(fill=tk.X, pady=(4, 0))
        
        task_id = task['id']
        
        # Timer button
        if task_id in self.active_timers:
            tk.Button(
                btn_frame,
                text="⏸",
                command=lambda: self.stop_timer(task_id),
                bg=self.accent_progress,
                fg=self.bg_dark,
                font=('Segoe UI', 8),
                relief=tk.FLAT,
                cursor='hand2',
                width=2
            ).pack(side=tk.LEFT, padx=(0, 2))
        else:
            tk.Button(
                btn_frame,
                text="▶",
                command=lambda: self.start_timer(task_id),
                bg=self.bg_light,
                fg=self.text_white,
                font=('Segoe UI', 8),
                relief=tk.FLAT,
                cursor='hand2',
                width=2
            ).pack(side=tk.LEFT, padx=(0, 2))
        
        # Move buttons
        if column == 'todo':
            tk.Button(
                btn_frame,
                text="→",
                command=lambda: self.move_task(task_id, 'todo', 'in_progress'),
                bg=self.bg_light,
                fg=self.text_white,
                font=('Segoe UI', 8),
                relief=tk.FLAT,
                cursor='hand2',
                width=2
            ).pack(side=tk.LEFT, padx=(0, 2))
        elif column == 'in_progress':
            tk.Button(
                btn_frame,
                text="←",
                command=lambda: self.move_task(task_id, 'in_progress', 'todo'),
                bg=self.bg_light,
                fg=self.text_white,
                font=('Segoe UI', 8),
                relief=tk.FLAT,
                cursor='hand2',
                width=2
            ).pack(side=tk.LEFT, padx=(0, 2))
            
            tk.Button(
                btn_frame,
                text="✓",
                command=lambda: self.move_task(task_id, 'in_progress', 'done'),
                bg=self.accent_done,
                fg=self.bg_dark,
                font=('Segoe UI', 8),
                relief=tk.FLAT,
                cursor='hand2',
                width=2
            ).pack(side=tk.LEFT, padx=(0, 2))
        elif column == 'done':
            tk.Button(
                btn_frame,
                text="↶",
                command=lambda: self.move_task(task_id, 'done', 'in_progress'),
                bg=self.bg_light,
                fg=self.text_white,
                font=('Segoe UI', 8),
                relief=tk.FLAT,
                cursor='hand2',
                width=2
            ).pack(side=tk.LEFT, padx=(0, 2))
        
        # Delete button
        tk.Button(
            btn_frame,
            text="🗑",
            command=lambda: self.delete_task(task_id, column),
            bg=self.bg_light,
            fg=self.accent_todo,
            font=('Segoe UI', 7),
            relief=tk.FLAT,
            cursor='hand2',
            width=2
        ).pack(side=tk.RIGHT)
        
        # Edit button
        tk.Button(
            btn_frame,
            text="✏️",
            command=lambda: self.edit_task(task_id, column),
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 7),
            relief=tk.FLAT,
            cursor='hand2',
            width=2
        ).pack(side=tk.RIGHT, padx=(0, 2))
        
        # Time info
        if task.get('time_spent', 0) > 0:
            hours = task['time_spent'] // 3600
            minutes = (task['time_spent'] % 3600) // 60
            time_str = f"⏱️ {int(hours)}h {int(minutes)}m" if hours > 0 else f"⏱️ {int(minutes)}m"
            
            tk.Label(
                btn_frame,
                text=time_str,
                bg=self.bg_card,
                fg=self.text_muted,
                font=('Segoe UI', 7)
            ).pack(side=tk.RIGHT, padx=5)
    
    def quick_add_task(self):
        popup = tk.Toplevel(self.root)
        popup.title("Add Task")
        popup.geometry("300x280")
        popup.configure(bg=self.bg_medium)
        popup.transient(self.root)
        popup.attributes('-topmost', True)
        
        # Center on widget
        popup.update_idletasks()
        x = self.root.winfo_x() + (self.root.winfo_width() // 2) - (popup.winfo_width() // 2)
        y = self.root.winfo_y() + (self.root.winfo_height() // 2) - (popup.winfo_height() // 2)
        popup.geometry(f"+{x}+{y}")
        
        tk.Label(
            popup,
            text="New Task",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 11, 'bold')
        ).pack(pady=10)
        
        # Title
        tk.Label(
            popup,
            text="Title:",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 9)
        ).pack(anchor='w', padx=15)
        
        title_entry = tk.Entry(
            popup,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 10),
            relief=tk.FLAT,
            insertbackground=self.text_white
        )
        title_entry.pack(fill=tk.X, padx=15, pady=3)
        title_entry.focus()
        
        # Description
        tk.Label(
            popup,
            text="Description (optional):",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 9)
        ).pack(anchor='w', padx=15, pady=(5, 0))
        
        desc_entry = tk.Entry(
            popup,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 9),
            relief=tk.FLAT,
            insertbackground=self.text_white
        )
        desc_entry.pack(fill=tk.X, padx=15, pady=3)
        
        # Due date
        tk.Label(
            popup,
            text="Due Date (optional):",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 9)
        ).pack(anchor='w', padx=15, pady=(5, 0))
        
        date_frame = tk.Frame(popup, bg=self.bg_medium)
        date_frame.pack(fill=tk.X, padx=15, pady=3)
        
        due_calendar = DateEntry(
            date_frame,
            background=self.bg_light,
            foreground=self.text_white,
            borderwidth=0,
            date_pattern='yyyy-mm-dd',
            font=('Segoe UI', 9)
        )
        due_calendar.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        clear_date_btn = tk.Button(
            date_frame,
            text="X",
            command=lambda: due_calendar.set_date(''),
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 7),
            relief=tk.FLAT,
            cursor='hand2',
            width=3
        )
        clear_date_btn.pack(side=tk.LEFT, padx=(3, 0))
        
        def save_task():
            title = title_entry.get().strip()
            if not title:
                return
            
            description = desc_entry.get().strip()
            try:
                due_date = due_calendar.get_date().strftime('%Y-%m-%d') if due_calendar.get_date() else ''
            except:
                due_date = ''
            
            task = {
                'id': int(time.time() * 1000),
                'title': title,
                'description': description,
                'due_date': due_date,
                'tags': [],
                'created': datetime.now().isoformat(),
                'time_spent': 0
            }
            
            self.tasks['todo'].append(task)
            self.save_data()
            popup.destroy()
            self.refresh_view()
            self.update_stats()
        
        btn_frame = tk.Frame(popup, bg=self.bg_medium)
        btn_frame.pack(pady=15)
        
        tk.Button(
            btn_frame,
            text="Add",
            command=save_task,
            bg=self.accent_todo,
            fg=self.bg_dark,
            font=('Segoe UI', 9, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            padx=15,
            pady=5
        ).pack(side=tk.LEFT, padx=5)
        
        tk.Button(
            btn_frame,
            text="Cancel",
            command=popup.destroy,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 9),
            relief=tk.FLAT,
            cursor='hand2',
            padx=15,
            pady=5
        ).pack(side=tk.LEFT, padx=5)
        
        title_entry.bind('<Return>', lambda e: save_task())
        title_entry.bind('<Escape>', lambda e: popup.destroy())
    
    def move_task(self, task_id, from_col, to_col):
        task = None
        for t in self.tasks[from_col]:
            if t['id'] == task_id:
                task = t
                break
        
        if task:
            self.tasks[from_col].remove(task)
            self.tasks[to_col].append(task)
            self.save_data()
            self.refresh_view()
            self.update_stats()
    
    def delete_task(self, task_id, column):
        self.tasks[column] = [t for t in self.tasks[column] if t['id'] != task_id]
        
        if task_id in self.active_timers:
            del self.active_timers[task_id]
        
        self.save_data()
        self.refresh_view()
        self.update_stats()
    
    def edit_task(self, task_id, column):
        # Find the task
        task = None
        for t in self.tasks[column]:
            if t['id'] == task_id:
                task = t
                break
        
        if not task:
            return
        
        popup = tk.Toplevel(self.root)
        popup.title("Edit Task")
        popup.geometry("300x280")
        popup.configure(bg=self.bg_medium)
        popup.transient(self.root)
        popup.attributes('-topmost', True)
        
        # Center on widget
        popup.update_idletasks()
        x = self.root.winfo_x() + (self.root.winfo_width() // 2) - (popup.winfo_width() // 2)
        y = self.root.winfo_y() + (self.root.winfo_height() // 2) - (popup.winfo_height() // 2)
        popup.geometry(f"+{x}+{y}")
        
        tk.Label(
            popup,
            text="Edit Task",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 11, 'bold')
        ).pack(pady=10)
        
        # Title
        tk.Label(
            popup,
            text="Title:",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 9)
        ).pack(anchor='w', padx=15)
        
        title_entry = tk.Entry(
            popup,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 10),
            relief=tk.FLAT,
            insertbackground=self.text_white
        )
        title_entry.insert(0, task['title'])
        title_entry.pack(fill=tk.X, padx=15, pady=3)
        title_entry.focus()
        title_entry.select_range(0, tk.END)
        
        # Description
        tk.Label(
            popup,
            text="Description (optional):",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 9)
        ).pack(anchor='w', padx=15, pady=(5, 0))
        
        desc_entry = tk.Entry(
            popup,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 9),
            relief=tk.FLAT,
            insertbackground=self.text_white
        )
        desc_entry.insert(0, task.get('description', ''))
        desc_entry.pack(fill=tk.X, padx=15, pady=3)
        
        # Due date
        tk.Label(
            popup,
            text="Due Date (optional):",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 9)
        ).pack(anchor='w', padx=15, pady=(5, 0))
        
        date_frame = tk.Frame(popup, bg=self.bg_medium)
        date_frame.pack(fill=tk.X, padx=15, pady=3)
        
        due_calendar = DateEntry(
            date_frame,
            background=self.bg_light,
            foreground=self.text_white,
            borderwidth=0,
            date_pattern='yyyy-mm-dd',
            font=('Segoe UI', 9)
        )
        
        # Set existing due date if available
        if task.get('due_date'):
            try:
                from datetime import datetime
                due_calendar.set_date(datetime.strptime(task['due_date'], '%Y-%m-%d'))
            except:
                pass
        
        due_calendar.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        clear_date_btn = tk.Button(
            date_frame,
            text="X",
            command=lambda: due_calendar.set_date(''),
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 7),
            relief=tk.FLAT,
            cursor='hand2',
            width=3
        )
        clear_date_btn.pack(side=tk.LEFT, padx=(3, 0))
        
        def save_changes():
            title = title_entry.get().strip()
            if not title:
                return
            
            description = desc_entry.get().strip()
            try:
                due_date = due_calendar.get_date().strftime('%Y-%m-%d') if due_calendar.get_date() else ''
            except:
                due_date = ''
            
            # Update task
            task['title'] = title
            task['description'] = description
            task['due_date'] = due_date
            
            self.save_data()
            popup.destroy()
            self.refresh_view()
        
        btn_frame = tk.Frame(popup, bg=self.bg_medium)
        btn_frame.pack(pady=15)
        
        tk.Button(
            btn_frame,
            text="Save",
            command=save_changes,
            bg=self.accent_done,
            fg=self.bg_dark,
            font=('Segoe UI', 9, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            padx=15,
            pady=5
        ).pack(side=tk.LEFT, padx=5)
        
        tk.Button(
            btn_frame,
            text="Cancel",
            command=popup.destroy,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 9),
            relief=tk.FLAT,
            cursor='hand2',
            padx=15,
            pady=5
        ).pack(side=tk.LEFT, padx=5)
        
        title_entry.bind('<Return>', lambda e: save_changes())
        title_entry.bind('<Escape>', lambda e: popup.destroy())
    
    def start_timer(self, task_id):
        self.active_timers[task_id] = time.time()
        self.refresh_view()
    
    def stop_timer(self, task_id):
        if task_id in self.active_timers:
            elapsed = time.time() - self.active_timers[task_id]
            
            for col in self.tasks.values():
                for task in col:
                    if task['id'] == task_id:
                        task['time_spent'] = task.get('time_spent', 0) + elapsed
                        break
            
            del self.active_timers[task_id]
            self.save_data()
            self.refresh_view()
    
    def update_stats(self):
        total = sum(len(tasks) for tasks in self.tasks.values())
        done = len(self.tasks['done'])
        self.stats_label.config(text=f"{done}/{total}")
    
    def load_data(self):
        # Try MongoDB first
        if self.mongo_collection is not None:
            try:
                print("📥 Loading data from MongoDB...")
                doc = self.mongo_collection.find_one({'_id': 'tasks_data'})
                if doc:
                    self.tasks = {
                        'todo': doc.get('todo', []),
                        'in_progress': doc.get('in_progress', []),
                        'done': doc.get('done', [])
                    }
                    print(f"✅ Loaded from MongoDB - Todo: {len(self.tasks['todo'])}, In Progress: {len(self.tasks['in_progress'])}, Done: {len(self.tasks['done'])}")
                    
                    # Also save to local file as backup
                    with open(self.data_file, 'w') as f:
                        json.dump(self.tasks, f, indent=2)
                    self.last_modified = os.path.getmtime(self.data_file)
                    return
                else:
                    print("⚠️ No tasks document found in MongoDB")
            except Exception as e:
                print(f"❌ MongoDB load error: {e}")
                import traceback
                traceback.print_exc()
        else:
            print("⚠️ MongoDB not connected, using local file")
        
        # Fallback to local file
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    self.tasks = json.load(f)
                self.last_modified = os.path.getmtime(self.data_file)
                print(f"📁 Loaded from local file - Todo: {len(self.tasks['todo'])}, In Progress: {len(self.tasks['in_progress'])}, Done: {len(self.tasks['done'])}")
            except Exception as e:
                print(f"❌ Error loading local file: {e}")
    
    def save_data(self):
        # Save to MongoDB first
        if self.mongo_collection is not None:
            try:
                print("💾 Saving to MongoDB...")
                result = self.mongo_collection.update_one(
                    {'_id': 'tasks_data'},
                    {'$set': {
                        'todo': self.tasks['todo'],
                        'in_progress': self.tasks['in_progress'],
                        'done': self.tasks['done'],
                        'last_updated': datetime.now().isoformat()
                    }},
                    upsert=True
                )
                print(f"✅ Saved to MongoDB - Matched: {result.matched_count}, Modified: {result.modified_count}, Upserted: {result.upserted_id}")
            except Exception as e:
                print(f"❌ MongoDB save error: {e}")
                import traceback
                traceback.print_exc()
        else:
            print("⚠️ MongoDB not connected, saving to local file only")
        
        # Also save to local file
        try:
            with open(self.data_file, 'w') as f:
                json.dump(self.tasks, f, indent=2)
            self.last_modified = os.path.getmtime(self.data_file)
            print(f"💾 Saved to local file")
        except Exception as e:
            print(f"❌ Error saving to local file: {e}")
    
    def check_external_changes(self):
        """Check if data file was modified externally and reload"""
        # Also check MongoDB for changes
        if self.mongo_collection is not None:
            try:
                doc = self.mongo_collection.find_one({'_id': 'tasks_data'})
                if doc:
                    last_updated = doc.get('last_updated', '')
                    # Compare with current data
                    current_updated = getattr(self, 'last_mongo_update', '')
                    if last_updated != current_updated:
                        print(f"🔄 MongoDB data changed, reloading...")
                        self.tasks = {
                            'todo': doc.get('todo', []),
                            'in_progress': doc.get('in_progress', []),
                            'done': doc.get('done', [])
                        }
                        self.last_mongo_update = last_updated
                        self.refresh_view()
                        self.update_stats()
            except Exception as e:
                print(f"Error checking MongoDB: {e}")
        
        # Check local file
        try:
            if os.path.exists(self.data_file):
                current_modified = os.path.getmtime(self.data_file)
                if current_modified > self.last_modified:
                    print(f"🔄 Local file changed, reloading...")
                    self.load_data()
                    self.refresh_view()
                    self.update_stats()
        except Exception as e:
            print(f"Error checking local file: {e}")
        
        self.root.after(2000, self.check_external_changes)
    
    def auto_save(self):
        self.save_data()
        self.root.after(30000, self.auto_save)
    
    def on_closing(self):
        """Cleanup when closing the app"""
        # Remove lock file
        try:
            if os.path.exists(self.lock_file):
                os.remove(self.lock_file)
        except:
            pass
        
        # Close MongoDB connection
        if self.mongo_client:
            try:
                self.mongo_client.close()
            except:
                pass
        
        self.root.destroy()

if __name__ == '__main__':
    root = tk.Tk()
    app = DoughtWidget(root)
    root.mainloop()
