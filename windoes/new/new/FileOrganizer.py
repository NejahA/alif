import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import os
import shutil
from pathlib import Path
from datetime import datetime
import threading

class FileOrganizer:
    def __init__(self, root):
        self.root = root
        self.root.title("File Organizer")
        self.root.geometry("700x600")
        
        self.source_folder = ""
        self.file_categories = {
            'Images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.ico', '.webp'],
            'Documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.ppt', '.pptx'],
            'Videos': ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'],
            'Audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'],
            'Archives': ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
            'Code': ['.py', '.js', '.html', '.css', '.java', '.cpp', '.c', '.h', '.json', '.xml', '.sql'],
            'Executables': ['.exe', '.msi', '.bat', '.sh', '.app'],
        }
        
        self.setup_ui()
    
    def setup_ui(self):
        # Title
        title_label = tk.Label(self.root, text="🗂️ File Organizer", font=("Arial", 18, "bold"))
        title_label.pack(pady=15)
        
        # Folder selection
        folder_frame = tk.Frame(self.root)
        folder_frame.pack(fill=tk.X, padx=20, pady=10)
        
        tk.Label(folder_frame, text="Folder to organize:", font=("Arial", 10)).pack(anchor=tk.W)
        
        path_frame = tk.Frame(folder_frame)
        path_frame.pack(fill=tk.X, pady=5)
        
        self.folder_entry = tk.Entry(path_frame, font=("Arial", 10))
        self.folder_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        tk.Button(path_frame, text="Browse", command=self.browse_folder, bg="#2196F3", fg="white").pack(side=tk.LEFT, padx=5)
        tk.Button(path_frame, text="Scan", command=self.scan_folder, bg="#4CAF50", fg="white").pack(side=tk.LEFT)
        
        # Organization method
        method_frame = tk.LabelFrame(self.root, text="Organization Method", font=("Arial", 10, "bold"))
        method_frame.pack(fill=tk.X, padx=20, pady=10)
        
        self.org_method = tk.StringVar(value="type")
        tk.Radiobutton(method_frame, text="By File Type", variable=self.org_method, value="type").pack(anchor=tk.W, padx=10, pady=2)
        tk.Radiobutton(method_frame, text="By Date (Year-Month)", variable=self.org_method, value="date").pack(anchor=tk.W, padx=10, pady=2)
        tk.Radiobutton(method_frame, text="By Size", variable=self.org_method, value="size").pack(anchor=tk.W, padx=10, pady=2)
        
        # Preview area
        preview_frame = tk.LabelFrame(self.root, text="Preview", font=("Arial", 10, "bold"))
        preview_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        scrollbar = tk.Scrollbar(preview_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.preview_text = tk.Text(preview_frame, height=15, yscrollcommand=scrollbar.set, font=("Consolas", 9))
        self.preview_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        scrollbar.config(command=self.preview_text.yview)
        
        # Action buttons
        btn_frame = tk.Frame(self.root)
        btn_frame.pack(fill=tk.X, padx=20, pady=10)
        
        tk.Button(btn_frame, text="Organize Files", command=self.organize_files, 
                 bg="#4CAF50", fg="white", font=("Arial", 11, "bold"), height=2).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        tk.Button(btn_frame, text="Undo Last", command=self.undo_organization, 
                 bg="#FF9800", fg="white", font=("Arial", 11, "bold"), height=2).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        
        # Status bar
        self.status_label = tk.Label(self.root, text="Ready", bd=1, relief=tk.SUNKEN, anchor=tk.W)
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)
        
        self.last_operation = []
    
    def browse_folder(self):
        folder = filedialog.askdirectory()
        if folder:
            self.source_folder = folder
            self.folder_entry.delete(0, tk.END)
            self.folder_entry.insert(0, folder)
            self.status_label.config(text=f"Selected: {folder}")
    
    def scan_folder(self):
        folder = self.folder_entry.get()
        if not folder or not os.path.exists(folder):
            messagebox.showerror("Error", "Please select a valid folder")
            return
        
        self.source_folder = folder
        self.preview_text.delete(1.0, tk.END)
        
        try:
            files = [f for f in os.listdir(folder) if os.path.isfile(os.path.join(folder, f))]
            
            if not files:
                self.preview_text.insert(tk.END, "No files found in this folder.\n")
                return
            
            self.preview_text.insert(tk.END, f"Found {len(files)} files:\n\n")
            
            method = self.org_method.get()
            organization = self.preview_organization(folder, files, method)
            
            for category, file_list in organization.items():
                if file_list:
                    self.preview_text.insert(tk.END, f"📁 {category}/ ({len(file_list)} files)\n")
                    for file in file_list[:5]:
                        self.preview_text.insert(tk.END, f"   • {file}\n")
                    if len(file_list) > 5:
                        self.preview_text.insert(tk.END, f"   ... and {len(file_list) - 5} more\n")
                    self.preview_text.insert(tk.END, "\n")
            
            self.status_label.config(text=f"Scanned {len(files)} files")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to scan folder: {str(e)}")
    
    def preview_organization(self, folder, files, method):
        organization = {}
        
        for file in files:
            file_path = os.path.join(folder, file)
            
            if method == "type":
                category = self.get_file_category(file)
            elif method == "date":
                category = self.get_date_category(file_path)
            else:  # size
                category = self.get_size_category(file_path)
            
            if category not in organization:
                organization[category] = []
            organization[category].append(file)
        
        return organization
    
    def get_file_category(self, filename):
        ext = Path(filename).suffix.lower()
        for category, extensions in self.file_categories.items():
            if ext in extensions:
                return category
        return "Others"
    
    def get_date_category(self, file_path):
        timestamp = os.path.getmtime(file_path)
        date = datetime.fromtimestamp(timestamp)
        return f"{date.year}-{date.month:02d}"
    
    def get_size_category(self, file_path):
        size = os.path.getsize(file_path)
        if size < 1024 * 1024:  # < 1MB
            return "Small (< 1MB)"
        elif size < 10 * 1024 * 1024:  # < 10MB
            return "Medium (1-10MB)"
        elif size < 100 * 1024 * 1024:  # < 100MB
            return "Large (10-100MB)"
        else:
            return "Very Large (> 100MB)"
    
    def organize_files(self):
        if not self.source_folder or not os.path.exists(self.source_folder):
            messagebox.showerror("Error", "Please select and scan a folder first")
            return
        
        result = messagebox.askyesno("Confirm", 
                                    "This will move files into organized folders.\n\nContinue?")
        if not result:
            return
        
        def organize():
            try:
                files = [f for f in os.listdir(self.source_folder) 
                        if os.path.isfile(os.path.join(self.source_folder, f))]
                
                self.last_operation = []
                method = self.org_method.get()
                moved_count = 0
                
                for file in files:
                    src = os.path.join(self.source_folder, file)
                    
                    if method == "type":
                        category = self.get_file_category(file)
                    elif method == "date":
                        category = self.get_date_category(src)
                    else:
                        category = self.get_size_category(src)
                    
                    dest_folder = os.path.join(self.source_folder, category)
                    os.makedirs(dest_folder, exist_ok=True)
                    
                    dest = os.path.join(dest_folder, file)
                    
                    # Handle duplicate names
                    counter = 1
                    base_name = Path(file).stem
                    ext = Path(file).suffix
                    while os.path.exists(dest):
                        new_name = f"{base_name}_{counter}{ext}"
                        dest = os.path.join(dest_folder, new_name)
                        counter += 1
                    
                    shutil.move(src, dest)
                    self.last_operation.append((dest, src))
                    moved_count += 1
                
                self.status_label.config(text=f"✓ Organized {moved_count} files successfully!")
                messagebox.showinfo("Success", f"Organized {moved_count} files!")
                self.scan_folder()
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to organize files: {str(e)}")
        
        thread = threading.Thread(target=organize, daemon=True)
        thread.start()
    
    def undo_organization(self):
        if not self.last_operation:
            messagebox.showinfo("Info", "No operation to undo")
            return
        
        result = messagebox.askyesno("Confirm", "Undo the last organization?")
        if not result:
            return
        
        try:
            for dest, src in self.last_operation:
                if os.path.exists(dest):
                    shutil.move(dest, src)
            
            self.last_operation = []
            self.status_label.config(text="✓ Undo completed")
            messagebox.showinfo("Success", "Files restored to original locations")
            self.scan_folder()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to undo: {str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    app = FileOrganizer(root)
    root.mainloop()
