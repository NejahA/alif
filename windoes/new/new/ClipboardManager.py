import tkinter as tk
from tkinter import ttk, messagebox
import pyperclip
import threading
import time
from datetime import datetime

class ClipboardManager:
    def __init__(self, root):
        self.root = root
        self.root.title("Clipboard History Manager")
        self.root.geometry("600x500")
        
        self.clipboard_history = []
        self.max_history = 50
        self.last_clipboard = ""
        self.monitoring = True
        
        self.setup_ui()
        self.start_monitoring()
    
    def setup_ui(self):
        # Title
        title_label = tk.Label(self.root, text="📋 Clipboard History", font=("Arial", 16, "bold"))
        title_label.pack(pady=10)
        
        # Search frame
        search_frame = tk.Frame(self.root)
        search_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Label(search_frame, text="Search:").pack(side=tk.LEFT)
        self.search_var = tk.StringVar()
        self.search_var.trace('w', self.filter_history)
        search_entry = tk.Entry(search_frame, textvariable=self.search_var)
        search_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        
        # Listbox with scrollbar
        list_frame = tk.Frame(self.root)
        list_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        scrollbar = tk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.history_listbox = tk.Listbox(list_frame, yscrollcommand=scrollbar.set, font=("Consolas", 10))
        self.history_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.history_listbox.yview)
        
        self.history_listbox.bind('<Double-Button-1>', self.copy_selected)
        
        # Buttons frame
        btn_frame = tk.Frame(self.root)
        btn_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Button(btn_frame, text="Copy Selected", command=self.copy_selected, bg="#4CAF50", fg="white").pack(side=tk.LEFT, padx=5)
        tk.Button(btn_frame, text="Delete Selected", command=self.delete_selected, bg="#f44336", fg="white").pack(side=tk.LEFT, padx=5)
        tk.Button(btn_frame, text="Clear All", command=self.clear_all, bg="#FF9800", fg="white").pack(side=tk.LEFT, padx=5)
        
        # Status bar
        self.status_label = tk.Label(self.root, text="Monitoring clipboard...", bd=1, relief=tk.SUNKEN, anchor=tk.W)
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)
    
    def start_monitoring(self):
        def monitor():
            while self.monitoring:
                try:
                    current_clipboard = pyperclip.paste()
                    if current_clipboard and current_clipboard != self.last_clipboard:
                        self.add_to_history(current_clipboard)
                        self.last_clipboard = current_clipboard
                except Exception as e:
                    pass
                time.sleep(0.5)
        
        thread = threading.Thread(target=monitor, daemon=True)
        thread.start()
    
    def add_to_history(self, text):
        timestamp = datetime.now().strftime("%H:%M:%S")
        preview = text.replace('\n', ' ')[:80]
        entry = f"[{timestamp}] {preview}"
        
        self.clipboard_history.insert(0, (entry, text))
        
        if len(self.clipboard_history) > self.max_history:
            self.clipboard_history.pop()
        
        self.update_listbox()
        self.status_label.config(text=f"Added new item - Total: {len(self.clipboard_history)}")
    
    def update_listbox(self):
        self.history_listbox.delete(0, tk.END)
        search_term = self.search_var.get().lower()
        
        for entry, full_text in self.clipboard_history:
            if not search_term or search_term in full_text.lower():
                self.history_listbox.insert(tk.END, entry)
    
    def filter_history(self, *args):
        self.update_listbox()
    
    def copy_selected(self, event=None):
        selection = self.history_listbox.curselection()
        if selection:
            idx = selection[0]
            search_term = self.search_var.get().lower()
            
            # Find actual index in history
            actual_idx = 0
            for i, (entry, full_text) in enumerate(self.clipboard_history):
                if not search_term or search_term in full_text.lower():
                    if actual_idx == idx:
                        pyperclip.copy(full_text)
                        self.status_label.config(text="Copied to clipboard!")
                        return
                    actual_idx += 1
    
    def delete_selected(self):
        selection = self.history_listbox.curselection()
        if selection:
            idx = selection[0]
            search_term = self.search_var.get().lower()
            
            actual_idx = 0
            for i, (entry, full_text) in enumerate(self.clipboard_history):
                if not search_term or search_term in full_text.lower():
                    if actual_idx == idx:
                        self.clipboard_history.pop(i)
                        self.update_listbox()
                        self.status_label.config(text="Item deleted")
                        return
                    actual_idx += 1
    
    def clear_all(self):
        if messagebox.askyesno("Clear All", "Are you sure you want to clear all clipboard history?"):
            self.clipboard_history.clear()
            self.update_listbox()
            self.status_label.config(text="History cleared")
    
    def on_closing(self):
        self.monitoring = False
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = ClipboardManager(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()
