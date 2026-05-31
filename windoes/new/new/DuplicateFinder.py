import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import os
import hashlib
from pathlib import Path
import threading
from collections import defaultdict

class DuplicateFinder:
    def __init__(self, root):
        self.root = root
        self.root.title("Duplicate File Finder")
        self.root.geometry("900x700")
        
        self.scan_path = ""
        self.duplicates = {}
        self.is_scanning = False
        self.files_scanned = 0
        self.duplicates_found = 0
        
        self.setup_ui()
    
    def setup_ui(self):
        # Title
        title_frame = tk.Frame(self.root, bg="#9c27b0", height=70)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        tk.Label(title_frame, text="🔍 Duplicate File Finder", 
                font=("Arial", 20, "bold"),
                bg="#9c27b0", fg="white").pack(pady=20)
        
        # Path selection
        path_frame = tk.LabelFrame(self.root, text="Scan Location", 
                                  font=("Arial", 10, "bold"))
        path_frame.pack(fill=tk.X, padx=20, pady=15)
        
        path_content = tk.Frame(path_frame)
        path_content.pack(fill=tk.X, padx=10, pady=10)
        
        self.path_entry = tk.Entry(path_content, font=("Arial", 10))
        self.path_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))
        
        tk.Button(path_content, text="Browse", command=self.browse_folder,
                 bg="#2196F3", fg="white", font=("Arial", 10)).pack(side=tk.LEFT, padx=2)
        tk.Button(path_content, text="Scan", command=self.start_scan,
                 bg="#4CAF50", fg="white", font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=2)
        
        # Options
        options_frame = tk.LabelFrame(self.root, text="Scan Options",
                                     font=("Arial", 10, "bold"))
        options_frame.pack(fill=tk.X, padx=20, pady=10)
        
        opt_content = tk.Frame(options_frame)
        opt_content.pack(fill=tk.X, padx=10, pady=10)
        
        self.include_subfolders = tk.BooleanVar(value=True)
        tk.Checkbutton(opt_content, text="Include subfolders", 
                      variable=self.include_subfolders,
                      font=("Arial", 9)).pack(side=tk.LEFT, padx=10)
        
        self.min_size = tk.IntVar(value=0)
        tk.Label(opt_content, text="Min size (KB):", font=("Arial", 9)).pack(side=tk.LEFT, padx=5)
        tk.Spinbox(opt_content, from_=0, to=10000, textvariable=self.min_size,
                  width=10, font=("Arial", 9)).pack(side=tk.LEFT, padx=5)
        
        tk.Label(opt_content, text="File types:", font=("Arial", 9)).pack(side=tk.LEFT, padx=5)
        self.file_types = tk.StringVar(value="*")
        tk.Entry(opt_content, textvariable=self.file_types, width=15,
                font=("Arial", 9)).pack(side=tk.LEFT, padx=5)
        tk.Label(opt_content, text="(* = all, or .jpg,.png)", 
                font=("Arial", 8), fg="gray").pack(side=tk.LEFT)
        
        # Progress
        progress_frame = tk.LabelFrame(self.root, text="Scan Progress",
                                      font=("Arial", 10, "bold"))
        progress_frame.pack(fill=tk.X, padx=20, pady=10)
        
        self.progress_label = tk.Label(progress_frame, text="Ready to scan",
                                       font=("Arial", 10))
        self.progress_label.pack(pady=5)
        
        self.progress_bar = ttk.Progressbar(progress_frame, mode='indeterminate')
        self.progress_bar.pack(fill=tk.X, padx=10, pady=5)
        
        stats_frame = tk.Frame(progress_frame)
        stats_frame.pack(pady=5)
        
        self.files_label = tk.Label(stats_frame, text="Files scanned: 0",
                                    font=("Arial", 9))
        self.files_label.pack(side=tk.LEFT, padx=20)
        
        self.dupes_label = tk.Label(stats_frame, text="Duplicates found: 0",
                                    font=("Arial", 9), fg="#e74c3c")
        self.dupes_label.pack(side=tk.LEFT, padx=20)
        
        # Results
        results_frame = tk.LabelFrame(self.root, text="Duplicate Files",
                                     font=("Arial", 10, "bold"))
        results_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        # Treeview
        tree_frame = tk.Frame(results_frame)
        tree_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        scrollbar_y = tk.Scrollbar(tree_frame)
        scrollbar_y.pack(side=tk.RIGHT, fill=tk.Y)
        
        scrollbar_x = tk.Scrollbar(tree_frame, orient=tk.HORIZONTAL)
        scrollbar_x.pack(side=tk.BOTTOM, fill=tk.X)
        
        self.tree = ttk.Treeview(tree_frame, 
                                yscrollcommand=scrollbar_y.set,
                                xscrollcommand=scrollbar_x.set,
                                selectmode='extended')
        self.tree.pack(fill=tk.BOTH, expand=True)
        
        scrollbar_y.config(command=self.tree.yview)
        scrollbar_x.config(command=self.tree.xview)
        
        # Columns
        self.tree['columns'] = ('Size', 'Path', 'Hash')
        self.tree.column('#0', width=300, minwidth=200)
        self.tree.column('Size', width=100, minwidth=80)
        self.tree.column('Path', width=400, minwidth=200)
        self.tree.column('Hash', width=0, stretch=False)
        
        self.tree.heading('#0', text='Filename')
        self.tree.heading('Size', text='Size')
        self.tree.heading('Path', text='Location')
        
        # Action buttons
        action_frame = tk.Frame(self.root)
        action_frame.pack(fill=tk.X, padx=20, pady=10)
        
        tk.Button(action_frame, text="Delete Selected", 
                 command=self.delete_selected,
                 bg="#e74c3c", fg="white", 
                 font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        tk.Button(action_frame, text="Keep Newest", 
                 command=self.keep_newest,
                 bg="#f39c12", fg="white",
                 font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        tk.Button(action_frame, text="Keep Oldest",
                 command=self.keep_oldest,
                 bg="#f39c12", fg="white",
                 font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        tk.Button(action_frame, text="Open Location",
                 command=self.open_location,
                 bg="#3498db", fg="white",
                 font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        tk.Button(action_frame, text="Export Report",
                 command=self.export_report,
                 bg="#9b59b6", fg="white",
                 font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        self.space_label = tk.Label(action_frame, text="Potential space saved: 0 MB",
                                    font=("Arial", 10, "bold"), fg="#27ae60")
        self.space_label.pack(side=tk.RIGHT, padx=10)
        
        # Status bar
        self.status_label = tk.Label(self.root, text="Ready", 
                                     bd=1, relief=tk.SUNKEN, anchor=tk.W)
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)
    
    def browse_folder(self):
        folder = filedialog.askdirectory()
        if folder:
            self.scan_path = folder
            self.path_entry.delete(0, tk.END)
            self.path_entry.insert(0, folder)
    
    def start_scan(self):
        path = self.path_entry.get()
        if not path or not os.path.exists(path):
            messagebox.showerror("Error", "Please select a valid folder")
            return
        
        if self.is_scanning:
            messagebox.showinfo("Info", "Scan already in progress")
            return
        
        self.scan_path = path
        self.is_scanning = True
        self.files_scanned = 0
        self.duplicates_found = 0
        self.duplicates = {}
        
        # Clear tree
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Start progress bar
        self.progress_bar.start()
        self.progress_label.config(text="Scanning files...")
        self.status_label.config(text="Scan in progress...")
        
        # Start scan thread
        thread = threading.Thread(target=self.scan_files, daemon=True)
        thread.start()
    
    def scan_files(self):
        try:
            file_hashes = defaultdict(list)
            min_size_bytes = self.min_size.get() * 1024
            file_types_str = self.file_types.get().strip()
            
            # Parse file types
            if file_types_str == "*":
                extensions = None
            else:
                extensions = [ext.strip().lower() for ext in file_types_str.split(',')]
                extensions = [ext if ext.startswith('.') else f'.{ext}' for ext in extensions]
            
            # Scan files
            if self.include_subfolders.get():
                file_list = Path(self.scan_path).rglob('*')
            else:
                file_list = Path(self.scan_path).glob('*')
            
            for file_path in file_list:
                if not file_path.is_file():
                    continue
                
                # Check file type
                if extensions and file_path.suffix.lower() not in extensions:
                    continue
                
                # Check file size
                try:
                    file_size = file_path.stat().st_size
                    if file_size < min_size_bytes:
                        continue
                    
                    # Calculate hash
                    file_hash = self.calculate_hash(file_path)
                    if file_hash:
                        file_hashes[file_hash].append(file_path)
                    
                    self.files_scanned += 1
                    
                    # Update UI every 10 files
                    if self.files_scanned % 10 == 0:
                        self.root.after(0, self.update_scan_progress)
                
                except (PermissionError, OSError):
                    continue
            
            # Find duplicates
            self.duplicates = {hash_val: files for hash_val, files in file_hashes.items() 
                             if len(files) > 1}
            self.duplicates_found = sum(len(files) - 1 for files in self.duplicates.values())
            
            # Update UI
            self.root.after(0, self.scan_complete)
        
        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("Error", f"Scan failed: {str(e)}"))
            self.root.after(0, self.scan_complete)
    
    def calculate_hash(self, file_path, block_size=65536):
        """Calculate MD5 hash of file"""
        try:
            hasher = hashlib.md5()
            with open(file_path, 'rb') as f:
                while True:
                    data = f.read(block_size)
                    if not data:
                        break
                    hasher.update(data)
            return hasher.hexdigest()
        except:
            return None
    
    def update_scan_progress(self):
        self.files_label.config(text=f"Files scanned: {self.files_scanned}")
        self.progress_label.config(text=f"Scanning... {self.files_scanned} files checked")
    
    def scan_complete(self):
        self.is_scanning = False
        self.progress_bar.stop()
        
        self.files_label.config(text=f"Files scanned: {self.files_scanned}")
        self.dupes_label.config(text=f"Duplicates found: {self.duplicates_found}")
        
        if self.duplicates:
            self.progress_label.config(text=f"Scan complete! Found {len(self.duplicates)} groups of duplicates")
            self.status_label.config(text=f"Found {self.duplicates_found} duplicate files")
            self.display_duplicates()
        else:
            self.progress_label.config(text="Scan complete! No duplicates found")
            self.status_label.config(text="No duplicates found")
            messagebox.showinfo("Scan Complete", "No duplicate files found!")
    
    def display_duplicates(self):
        total_wasted_space = 0
        
        for hash_val, files in self.duplicates.items():
            # Sort by modification time (newest first)
            files_sorted = sorted(files, key=lambda f: f.stat().st_mtime, reverse=True)
            
            # Get file size
            file_size = files_sorted[0].stat().st_size
            wasted_space = file_size * (len(files_sorted) - 1)
            total_wasted_space += wasted_space
            
            # Add group header
            group_name = f"{files_sorted[0].name} ({len(files_sorted)} copies)"
            group_id = self.tree.insert('', 'end', text=group_name,
                                       values=(self.format_size(file_size), 
                                             f"{len(files_sorted)} duplicates",
                                             hash_val),
                                       tags=('group',))
            
            # Add files
            for i, file_path in enumerate(files_sorted):
                file_info = file_path.stat()
                size_str = self.format_size(file_info.st_size)
                
                tag = 'original' if i == 0 else 'duplicate'
                self.tree.insert(group_id, 'end', 
                               text=f"  {'[KEEP]' if i == 0 else '[DELETE?]'} {file_path.name}",
                               values=(size_str, str(file_path.parent), hash_val),
                               tags=(tag,))
        
        # Configure tags
        self.tree.tag_configure('group', background='#e3f2fd', font=('Arial', 9, 'bold'))
        self.tree.tag_configure('original', background='#c8e6c9')
        self.tree.tag_configure('duplicate', background='#ffcdd2')
        
        # Update space label
        self.space_label.config(text=f"Potential space saved: {self.format_size(total_wasted_space)}")
    
    def format_size(self, size_bytes):
        """Convert bytes to human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} TB"
    
    def delete_selected(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showinfo("Info", "Please select files to delete")
            return
        
        # Get file paths
        files_to_delete = []
        for item in selected:
            values = self.tree.item(item)['values']
            if len(values) >= 2 and os.path.exists(values[1]):
                file_path = Path(values[1]) / self.tree.item(item)['text'].split('] ')[-1]
                if file_path.exists():
                    files_to_delete.append(file_path)
        
        if not files_to_delete:
            messagebox.showinfo("Info", "No valid files selected")
            return
        
        msg = f"Delete {len(files_to_delete)} file(s)?\n\nThis cannot be undone!"
        if messagebox.askyesno("Confirm Delete", msg):
            deleted = 0
            for file_path in files_to_delete:
                try:
                    os.remove(file_path)
                    deleted += 1
                except Exception as e:
                    print(f"Failed to delete {file_path}: {e}")
            
            messagebox.showinfo("Success", f"Deleted {deleted} file(s)")
            self.start_scan()  # Rescan
    
    def keep_newest(self):
        self.auto_delete('newest')
    
    def keep_oldest(self):
        self.auto_delete('oldest')
    
    def auto_delete(self, keep_mode):
        if not self.duplicates:
            messagebox.showinfo("Info", "No duplicates to process")
            return
        
        msg = f"This will delete all duplicates, keeping only the {keep_mode} file in each group.\n\nContinue?"
        if not messagebox.askyesno("Confirm", msg):
            return
        
        deleted_count = 0
        
        for hash_val, files in self.duplicates.items():
            # Sort files
            if keep_mode == 'newest':
                files_sorted = sorted(files, key=lambda f: f.stat().st_mtime, reverse=True)
            else:
                files_sorted = sorted(files, key=lambda f: f.stat().st_mtime)
            
            # Delete all except first
            for file_path in files_sorted[1:]:
                try:
                    os.remove(file_path)
                    deleted_count += 1
                except Exception as e:
                    print(f"Failed to delete {file_path}: {e}")
        
        messagebox.showinfo("Success", f"Deleted {deleted_count} duplicate file(s)")
        self.start_scan()  # Rescan
    
    def open_location(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showinfo("Info", "Please select a file")
            return
        
        values = self.tree.item(selected[0])['values']
        if len(values) >= 2:
            folder_path = values[1]
            if os.path.exists(folder_path):
                os.startfile(folder_path)
    
    def export_report(self):
        if not self.duplicates:
            messagebox.showinfo("Info", "No duplicates to export")
            return
        
        file_path = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write("Duplicate File Report\n")
                    f.write("=" * 80 + "\n\n")
                    f.write(f"Scan path: {self.scan_path}\n")
                    f.write(f"Files scanned: {self.files_scanned}\n")
                    f.write(f"Duplicate groups: {len(self.duplicates)}\n")
                    f.write(f"Total duplicates: {self.duplicates_found}\n\n")
                    
                    for hash_val, files in self.duplicates.items():
                        f.write(f"\nGroup (Hash: {hash_val}):\n")
                        f.write("-" * 80 + "\n")
                        for file_path in files:
                            size = self.format_size(file_path.stat().st_size)
                            f.write(f"  {size:>12} - {file_path}\n")
                
                messagebox.showinfo("Success", f"Report exported to:\n{file_path}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to export: {str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    app = DuplicateFinder(root)
    root.mainloop()
