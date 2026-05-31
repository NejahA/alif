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

class Dought:
    def __init__(self, root):
        self.root = root
        self.root.title("In the Name of God - dought")
        self.root.geometry("1400x800")
        
        # Set icon
        try:
            icon_path = os.path.join(os.path.dirname(__file__), 'dought_icon.ico')
            self.root.iconbitmap(icon_path)
        except:
            pass
        
        # Modern color palette (Catppuccin-inspired)
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
        self.lock_file = os.path.join(dought_folder, 'dought.lock')
        
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
        self.active_timers = {}  # task_id: start_time
        self.last_modified = 0  # Track file modification time
        
        # MongoDB setup
        self.mongo_client = None
        self.mongo_db = None
        self.mongo_collection = None
        if ENABLE_MONGODB and MONGODB_AVAILABLE and MONGODB_URI:
            try:
                self.mongo_client = MongoClient(MONGODB_URI)
                self.mongo_db = self.mongo_client[DATABASE_NAME]
                self.mongo_collection = self.mongo_db[COLLECTION_NAME]
                print("MongoDB connected successfully!")
            except Exception as e:
                print(f"MongoDB connection failed: {e}")
                self.mongo_client = None
        
        # Load data
        self.load_data()
        
        # Setup UI
        self.setup_ui()
        
        # Global hotkey hint
        self.root.bind('<Control-n>', lambda e: self.quick_add_task())
        
        # Auto-save every 30 seconds
        self.auto_save()
        
        # Check for external changes every 2 seconds
        self.check_external_changes()
        
        # Cleanup on close
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
    def setup_ui(self):
        # Top bar
        top_bar = tk.Frame(self.root, bg=self.bg_medium, height=60)
        top_bar.pack(fill=tk.X, side=tk.TOP)
        top_bar.pack_propagate(False)
        
        # Title
        tk.Label(
            top_bar,
            text="📋 dought",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 18, 'bold')
        ).pack(side=tk.LEFT, padx=20, pady=10)
        
        # "In The Name of God" subtitle
        tk.Label(
            top_bar,
            text="In The Name of God",
            bg=self.bg_medium,
            fg=self.accent_done,
            font=('Segoe UI', 10, 'italic')
        ).pack(side=tk.LEFT, padx=(0, 10))
        
        # Quick add button
        tk.Button(
            top_bar,
            text="+ Quick Add (Ctrl+N)",
            command=self.quick_add_task,
            bg=self.accent_todo,
            fg=self.bg_dark,
            font=('Segoe UI', 10, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            padx=20,
            pady=8
        ).pack(side=tk.LEFT, padx=10)
        
        # Stats
        self.stats_label = tk.Label(
            top_bar,
            text="",
            bg=self.bg_medium,
            fg=self.text_muted,
            font=('Segoe UI', 9)
        )
        self.stats_label.pack(side=tk.RIGHT, padx=20)
        
        # Main container
        self.main_container = tk.Frame(self.root, bg=self.bg_dark)
        self.main_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Show board view
        self.refresh_view()
        self.update_stats()
        
    def refresh_view(self):
        """Refresh the board view"""
        self.show_board_view()
    
    def show_board_view(self):
        # Clear main container
        for widget in self.main_container.winfo_children():
            widget.destroy()
        
        # Create three columns
        columns = [
            ('todo', '📝 To Do', self.accent_todo),
            ('in_progress', '⚡ In Progress', self.accent_progress),
            ('done', '✅ Done', self.accent_done)
        ]
        
        for col_id, col_title, col_color in columns:
            col_frame = tk.Frame(self.main_container, bg=self.bg_dark)
            col_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
            
            # Column header
            header = tk.Frame(col_frame, bg=col_color, height=50)
            header.pack(fill=tk.X)
            header.pack_propagate(False)
            
            tk.Label(
                header,
                text=col_title,
                bg=col_color,
                fg=self.bg_dark,
                font=('Segoe UI', 12, 'bold')
            ).pack(side=tk.LEFT, padx=15, pady=12)
            
            count_label = tk.Label(
                header,
                text=f"({len(self.tasks[col_id])})",
                bg=col_color,
                fg=self.bg_dark,
                font=('Segoe UI', 10)
            )
            count_label.pack(side=tk.LEFT)
            
            # Add task button
            if col_id == 'todo':
                tk.Button(
                    header,
                    text="+",
                    command=lambda: self.add_task_to_column('todo'),
                    bg=self.bg_dark,
                    fg=col_color,
                    font=('Segoe UI', 14, 'bold'),
                    relief=tk.FLAT,
                    cursor='hand2',
                    width=2
                ).pack(side=tk.RIGHT, padx=10)
            
            # Scrollable task list
            canvas = tk.Canvas(col_frame, bg=self.bg_dark, highlightthickness=0)
            scrollbar = ttk.Scrollbar(col_frame, orient="vertical", command=canvas.yview)
            scrollable_frame = tk.Frame(canvas, bg=self.bg_dark)
            
            scrollable_frame.bind(
                "<Configure>",
                lambda e, c=canvas: c.configure(scrollregion=c.bbox("all"))
            )
            
            canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
            canvas.configure(yscrollcommand=scrollbar.set)
            
            canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, pady=10)
            scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
            
            # Add tasks
            for task in self.tasks[col_id]:
                self.create_task_card(scrollable_frame, task, col_id)
    
    def create_task_card(self, parent, task, column):
        card = tk.Frame(parent, bg=self.bg_card, relief=tk.FLAT, bd=0)
        card.pack(fill=tk.X, padx=10, pady=5)
        
        # Inner padding
        inner = tk.Frame(card, bg=self.bg_card)
        inner.pack(fill=tk.BOTH, padx=12, pady=10)
        
        # Task title
        title_label = tk.Label(
            inner,
            text=task['title'],
            bg=self.bg_card,
            fg=self.text_white,
            font=('Segoe UI', 11, 'bold'),
            wraplength=350,
            justify=tk.LEFT,
            anchor='w'
        )
        title_label.pack(fill=tk.X)
        
        # Description
        if task.get('description'):
            desc_label = tk.Label(
                inner,
                text=task['description'],
                bg=self.bg_card,
                fg=self.text_muted,
                font=('Segoe UI', 9),
                wraplength=350,
                justify=tk.LEFT,
                anchor='w'
            )
            desc_label.pack(fill=tk.X, pady=(3, 0))
        
        # Due date
        if task.get('due_date'):
            due_frame = tk.Frame(inner, bg=self.bg_card)
            due_frame.pack(fill=tk.X, pady=(5, 0))
            
            tk.Label(
                due_frame,
                text=f"📅 Due: {task['due_date']}",
                bg=self.bg_card,
                fg=self.accent_progress,
                font=('Segoe UI', 8, 'bold')
            ).pack(side=tk.LEFT)
        
        # Tags
        if task.get('tags'):
            tags_frame = tk.Frame(inner, bg=self.bg_card)
            tags_frame.pack(fill=tk.X, pady=(5, 0))
            
            for tag in task['tags']:
                tag_label = tk.Label(
                    tags_frame,
                    text=f"#{tag}",
                    bg=self.bg_light,
                    fg=self.text_white,
                    font=('Segoe UI', 8),
                    padx=6,
                    pady=2
                )
                tag_label.pack(side=tk.LEFT, padx=(0, 5))
        
        # Time info
        info_frame = tk.Frame(inner, bg=self.bg_card)
        info_frame.pack(fill=tk.X, pady=(8, 0))
        
        # Created date
        created = datetime.fromisoformat(task['created'])
        date_str = created.strftime('%b %d, %H:%M')
        
        tk.Label(
            info_frame,
            text=f"🕐 {date_str}",
            bg=self.bg_card,
            fg=self.text_muted,
            font=('Segoe UI', 8)
        ).pack(side=tk.LEFT)
        
        # Time tracked
        if task.get('time_spent', 0) > 0:
            hours = task['time_spent'] // 3600
            minutes = (task['time_spent'] % 3600) // 60
            time_str = f"{int(hours)}h {int(minutes)}m" if hours > 0 else f"{int(minutes)}m"
            
            tk.Label(
                info_frame,
                text=f"⏱️ {time_str}",
                bg=self.bg_card,
                fg=self.text_muted,
                font=('Segoe UI', 8)
            ).pack(side=tk.LEFT, padx=(10, 0))
        
        # Action buttons
        btn_frame = tk.Frame(inner, bg=self.bg_card)
        btn_frame.pack(fill=tk.X, pady=(8, 0))
        
        # Completion checkbox (for todo and in_progress)
        if column in ['todo', 'in_progress']:
            completed_var = tk.BooleanVar(value=False)
            check_btn = tk.Checkbutton(
                btn_frame,
                text="Mark Complete",
                variable=completed_var,
                command=lambda: self.mark_complete(task_id, column) if completed_var.get() else None,
                bg=self.bg_card,
                fg=self.text_white,
                selectcolor=self.bg_light,
                activebackground=self.bg_card,
                activeforeground=self.accent_done,
                font=('Segoe UI', 8),
                cursor='hand2'
            )
            check_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        # Timer button
        task_id = task['id']
        if task_id in self.active_timers:
            tk.Button(
                btn_frame,
                text="⏸ Stop",
                command=lambda: self.stop_timer(task_id),
                bg=self.accent_progress,
                fg=self.bg_dark,
                font=('Segoe UI', 8, 'bold'),
                relief=tk.FLAT,
                cursor='hand2',
                padx=8,
                pady=3
            ).pack(side=tk.LEFT, padx=(0, 5))
        else:
            tk.Button(
                btn_frame,
                text="▶ Start",
                command=lambda: self.start_timer(task_id),
                bg=self.bg_light,
                fg=self.text_white,
                font=('Segoe UI', 8),
                relief=tk.FLAT,
                cursor='hand2',
                padx=8,
                pady=3
            ).pack(side=tk.LEFT, padx=(0, 5))
        
        # Move buttons
        if column == 'todo':
            tk.Button(
                btn_frame,
                text="→ Progress",
                command=lambda: self.move_task(task_id, 'todo', 'in_progress'),
                bg=self.bg_light,
                fg=self.text_white,
                font=('Segoe UI', 8),
                relief=tk.FLAT,
                cursor='hand2',
                padx=8,
                pady=3
            ).pack(side=tk.LEFT, padx=(0, 5))
        elif column == 'in_progress':
            tk.Button(
                btn_frame,
                text="← Back",
                command=lambda: self.move_task(task_id, 'in_progress', 'todo'),
                bg=self.bg_light,
                fg=self.text_white,
                font=('Segoe UI', 8),
                relief=tk.FLAT,
                cursor='hand2',
                padx=8,
                pady=3
            ).pack(side=tk.LEFT, padx=(0, 5))
            
            tk.Button(
                btn_frame,
                text="✓ Done",
                command=lambda: self.move_task(task_id, 'in_progress', 'done'),
                bg=self.accent_done,
                fg=self.bg_dark,
                font=('Segoe UI', 8, 'bold'),
                relief=tk.FLAT,
                cursor='hand2',
                padx=8,
                pady=3
            ).pack(side=tk.LEFT, padx=(0, 5))
        elif column == 'done':
            tk.Button(
                btn_frame,
                text="← Reopen",
                command=lambda: self.move_task(task_id, 'done', 'in_progress'),
                bg=self.bg_light,
                fg=self.text_white,
                font=('Segoe UI', 8),
                relief=tk.FLAT,
                cursor='hand2',
                padx=8,
                pady=3
            ).pack(side=tk.LEFT, padx=(0, 5))
        
        # Edit button
        tk.Button(
            btn_frame,
            text="✏️ Edit",
            command=lambda: self.edit_task(task_id, column),
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 8),
            relief=tk.FLAT,
            cursor='hand2',
            padx=8,
            pady=3
        ).pack(side=tk.RIGHT, padx=(5, 0))
        
        # Delete button
        tk.Button(
            btn_frame,
            text="🗑",
            command=lambda: self.delete_task(task_id, column),
            bg=self.bg_light,
            fg=self.accent_todo,
            font=('Segoe UI', 8),
            relief=tk.FLAT,
            cursor='hand2',
            padx=8,
            pady=3
        ).pack(side=tk.RIGHT)
    
    def quick_add_task(self):
        self.add_task_to_column('todo')
    
    def add_task_to_column(self, column):
        # Create popup
        popup = tk.Toplevel(self.root)
        popup.title("Add Task")
        popup.geometry("400x350")
        popup.configure(bg=self.bg_medium)
        popup.transient(self.root)
        popup.grab_set()
        
        # Center popup
        popup.update_idletasks()
        x = (popup.winfo_screenwidth() // 2) - (popup.winfo_width() // 2)
        y = (popup.winfo_screenheight() // 2) - (popup.winfo_height() // 2)
        popup.geometry(f"+{x}+{y}")
        
        # Title
        tk.Label(
            popup,
            text="New Task",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 14, 'bold')
        ).pack(pady=15)
        
        # Task title input
        tk.Label(
            popup,
            text="Task Title:",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 10)
        ).pack(anchor='w', padx=20)
        
        title_entry = tk.Entry(
            popup,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 11),
            relief=tk.FLAT,
            insertbackground=self.text_white
        )
        title_entry.pack(fill=tk.X, padx=20, pady=5)
        title_entry.focus()
        
        # Description input
        tk.Label(
            popup,
            text="Description (optional):",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 10)
        ).pack(anchor='w', padx=20, pady=(10, 0))
        
        desc_entry = tk.Entry(
            popup,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 10),
            relief=tk.FLAT,
            insertbackground=self.text_white
        )
        desc_entry.pack(fill=tk.X, padx=20, pady=5)
        
        # Due date input with calendar
        tk.Label(
            popup,
            text="Due Date (optional):",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 10)
        ).pack(anchor='w', padx=20, pady=(10, 0))
        
        date_frame = tk.Frame(popup, bg=self.bg_medium)
        date_frame.pack(fill=tk.X, padx=20, pady=5)
        
        due_calendar = DateEntry(
            date_frame,
            background=self.bg_light,
            foreground=self.text_white,
            borderwidth=0,
            date_pattern='yyyy-mm-dd',
            font=('Segoe UI', 10)
        )
        due_calendar.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        clear_date_btn = tk.Button(
            date_frame,
            text="Clear",
            command=lambda: due_calendar.set_date(''),
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 8),
            relief=tk.FLAT,
            cursor='hand2',
            padx=10
        )
        clear_date_btn.pack(side=tk.LEFT, padx=(5, 0))
        
        # Tags input
        tk.Label(
            popup,
            text="Tags (comma-separated):",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 10)
        ).pack(anchor='w', padx=20, pady=(10, 0))
        
        tags_entry = tk.Entry(
            popup,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 10),
            relief=tk.FLAT,
            insertbackground=self.text_white
        )
        tags_entry.pack(fill=tk.X, padx=20, pady=5)
        
        def save_task():
            title = title_entry.get().strip()
            if not title:
                messagebox.showwarning("Empty Title", "Please enter a task title")
                return
            
            description = desc_entry.get().strip()
            try:
                due_date = due_calendar.get_date().strftime('%Y-%m-%d') if due_calendar.get_date() else ''
            except:
                due_date = ''
            tags_str = tags_entry.get().strip()
            tags = [t.strip() for t in tags_str.split(',') if t.strip()]
            
            task = {
                'id': int(time.time() * 1000),
                'title': title,
                'description': description,
                'due_date': due_date,
                'tags': tags,
                'created': datetime.now().isoformat(),
                'time_spent': 0
            }
            
            self.tasks[column].append(task)
            self.save_data()
            popup.destroy()
            self.refresh_view()
            self.update_stats()
        
        # Buttons
        btn_frame = tk.Frame(popup, bg=self.bg_medium)
        btn_frame.pack(pady=20)
        
        tk.Button(
            btn_frame,
            text="Add Task",
            command=save_task,
            bg=self.accent_todo,
            fg=self.bg_dark,
            font=('Segoe UI', 10, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            padx=20,
            pady=8
        ).pack(side=tk.LEFT, padx=5)
        
        tk.Button(
            btn_frame,
            text="Cancel",
            command=popup.destroy,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 10),
            relief=tk.FLAT,
            cursor='hand2',
            padx=20,
            pady=8
        ).pack(side=tk.LEFT, padx=5)
        
        # Enter to save
        title_entry.bind('<Return>', lambda e: save_task())
        tags_entry.bind('<Return>', lambda e: save_task())
    
    def move_task(self, task_id, from_col, to_col):
        # Find and move task
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
    
    def mark_complete(self, task_id, from_col):
        """Mark task as complete with checkbox"""
        self.move_task(task_id, from_col, 'done')
    
    def delete_task(self, task_id, column):
        if messagebox.askyesno("Delete Task", "Are you sure you want to delete this task?"):
            self.tasks[column] = [t for t in self.tasks[column] if t['id'] != task_id]
            
            # Stop timer if active
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
        
        # Create edit dialog
        dialog = tk.Toplevel(self.root)
        dialog.title("Edit Task")
        dialog.geometry("500x450")
        dialog.configure(bg=self.bg_medium)
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Center dialog
        dialog.update_idletasks()
        x = self.root.winfo_x() + (self.root.winfo_width() // 2) - (dialog.winfo_width() // 2)
        y = self.root.winfo_y() + (self.root.winfo_height() // 2) - (dialog.winfo_height() // 2)
        dialog.geometry(f"+{x}+{y}")
        
        # Title
        tk.Label(
            dialog,
            text="Edit Task",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 14, 'bold')
        ).pack(pady=15)
        
        # Form frame
        form = tk.Frame(dialog, bg=self.bg_medium)
        form.pack(fill=tk.BOTH, expand=True, padx=20)
        
        # Task title
        tk.Label(
            form,
            text="Title:",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 10)
        ).pack(anchor='w', pady=(0, 5))
        
        title_entry = tk.Entry(
            form,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 11),
            relief=tk.FLAT,
            insertbackground=self.text_white
        )
        title_entry.insert(0, task['title'])
        title_entry.pack(fill=tk.X, ipady=5, pady=(0, 15))
        title_entry.focus()
        title_entry.select_range(0, tk.END)
        
        # Description
        tk.Label(
            form,
            text="Description:",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 10)
        ).pack(anchor='w', pady=(0, 5))
        
        desc_text = tk.Text(
            form,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 10),
            relief=tk.FLAT,
            insertbackground=self.text_white,
            height=4,
            wrap=tk.WORD
        )
        desc_text.insert('1.0', task.get('description', ''))
        desc_text.pack(fill=tk.X, pady=(0, 15))
        
        # Due date
        tk.Label(
            form,
            text="Due Date:",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 10)
        ).pack(anchor='w', pady=(0, 5))
        
        date_frame = tk.Frame(form, bg=self.bg_medium)
        date_frame.pack(fill=tk.X, pady=(0, 15))
        
        due_calendar = DateEntry(
            date_frame,
            background=self.bg_light,
            foreground=self.text_white,
            borderwidth=0,
            date_pattern='yyyy-mm-dd',
            font=('Segoe UI', 10)
        )
        
        # Set existing due date if available
        if task.get('due_date'):
            try:
                due_calendar.set_date(datetime.strptime(task['due_date'], '%Y-%m-%d'))
            except:
                pass
        
        due_calendar.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        clear_date_btn = tk.Button(
            date_frame,
            text="Clear",
            command=lambda: due_calendar.set_date(''),
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 9),
            relief=tk.FLAT,
            cursor='hand2',
            padx=10
        )
        clear_date_btn.pack(side=tk.LEFT, padx=(10, 0))
        
        # Tags
        tk.Label(
            form,
            text="Tags (comma-separated):",
            bg=self.bg_medium,
            fg=self.text_white,
            font=('Segoe UI', 10)
        ).pack(anchor='w', pady=(0, 5))
        
        tags_entry = tk.Entry(
            form,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 10),
            relief=tk.FLAT,
            insertbackground=self.text_white
        )
        tags_entry.insert(0, ', '.join(task.get('tags', [])))
        tags_entry.pack(fill=tk.X, ipady=5, pady=(0, 20))
        
        def save_changes():
            title = title_entry.get().strip()
            if not title:
                messagebox.showwarning("Invalid Input", "Title cannot be empty!")
                return
            
            description = desc_text.get('1.0', tk.END).strip()
            try:
                due_date = due_calendar.get_date().strftime('%Y-%m-%d') if due_calendar.get_date() else ''
            except:
                due_date = ''
            
            tags_str = tags_entry.get().strip()
            tags = [t.strip() for t in tags_str.split(',') if t.strip()]
            
            # Update task
            task['title'] = title
            task['description'] = description
            task['due_date'] = due_date
            task['tags'] = tags
            
            self.save_data()
            dialog.destroy()
            self.refresh_view()
        
        # Buttons
        btn_frame = tk.Frame(dialog, bg=self.bg_medium)
        btn_frame.pack(pady=20)
        
        tk.Button(
            btn_frame,
            text="Save Changes",
            command=save_changes,
            bg=self.accent_done,
            fg=self.bg_dark,
            font=('Segoe UI', 10, 'bold'),
            relief=tk.FLAT,
            cursor='hand2',
            padx=20,
            pady=8
        ).pack(side=tk.LEFT, padx=5)
        
        tk.Button(
            btn_frame,
            text="Cancel",
            command=dialog.destroy,
            bg=self.bg_light,
            fg=self.text_white,
            font=('Segoe UI', 10),
            relief=tk.FLAT,
            cursor='hand2',
            padx=20,
            pady=8
        ).pack(side=tk.LEFT, padx=5)
        
        title_entry.bind('<Return>', lambda e: save_changes())
        title_entry.bind('<Escape>', lambda e: dialog.destroy())
    
    def start_timer(self, task_id):
        self.active_timers[task_id] = time.time()
        self.refresh_view()
    
    def stop_timer(self, task_id):
        if task_id in self.active_timers:
            elapsed = time.time() - self.active_timers[task_id]
            
            # Find task and add time
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
        
        self.stats_label.config(
            text=f"Total: {total} | Done: {done} | Active: {len(self.active_timers)}"
        )
    
    def load_data(self):
        # Try MongoDB first
        if self.mongo_collection is not None:
            try:
                doc = self.mongo_collection.find_one({'_id': 'tasks_data'})
                if doc:
                    self.tasks = {
                        'todo': doc.get('todo', []),
                        'in_progress': doc.get('in_progress', []),
                        'done': doc.get('done', [])
                    }
                    print("Loaded data from MongoDB")
                    return
            except Exception as e:
                print(f"MongoDB load error: {e}")
        
        # Fallback to local file
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    self.tasks = json.load(f)
                self.last_modified = os.path.getmtime(self.data_file)
            except:
                pass
    
    def save_data(self):
        # Save to MongoDB
        if self.mongo_collection is not None:
            try:
                self.mongo_collection.update_one(
                    {'_id': 'tasks_data'},
                    {'$set': {
                        'todo': self.tasks['todo'],
                        'in_progress': self.tasks['in_progress'],
                        'done': self.tasks['done'],
                        'last_updated': datetime.now().isoformat()
                    }},
                    upsert=True
                )
                print("Saved to MongoDB")
            except Exception as e:
                print(f"MongoDB save error: {e}")
        
        # Also save to local file
        with open(self.data_file, 'w') as f:
            json.dump(self.tasks, f, indent=2)
        self.last_modified = os.path.getmtime(self.data_file)
    
    def check_external_changes(self):
        """Check if data file was modified externally and reload"""
        try:
            if os.path.exists(self.data_file):
                current_modified = os.path.getmtime(self.data_file)
                if current_modified > self.last_modified:
                    self.load_data()
                    self.refresh_view()
                    self.update_stats()
        except:
            pass
        
        self.root.after(2000, self.check_external_changes)
    
    def auto_save(self):
        self.save_data()
        self.root.after(30000, self.auto_save)  # Save every 30 seconds
    
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
    app = Dought(root)
    root.mainloop()
