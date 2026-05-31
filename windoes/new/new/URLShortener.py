import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import os
import hashlib
import webbrowser
from datetime import datetime

try:
    import qrcode
    from PIL import Image, ImageTk
    QR_AVAILABLE = True
except ImportError:
    QR_AVAILABLE = False

class URLShortener:
    def __init__(self, root):
        self.root = root
        self.root.title("URL Shortener & QR Code Generator")
        self.root.geometry("800x700")
        
        self.urls_file = "shortened_urls.json"
        self.urls = self.load_urls()
        self.current_qr = None
        
        self.setup_ui()
        self.load_url_list()
    
    def setup_ui(self):
        # Title
        title_frame = tk.Frame(self.root, bg="#3498db", height=70)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        tk.Label(title_frame, text="🔗 URL Shortener & QR Generator", 
                font=("Arial", 20, "bold"),
                bg="#3498db", fg="white").pack(pady=20)
        
        # Main content
        content_frame = tk.Frame(self.root)
        content_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Input section
        input_frame = tk.LabelFrame(content_frame, text="Shorten URL",
                                   font=("Arial", 11, "bold"))
        input_frame.pack(fill=tk.X, pady=10)
        
        # Long URL
        tk.Label(input_frame, text="Long URL:", font=("Arial", 10)).pack(anchor=tk.W, padx=10, pady=(10,5))
        
        url_entry_frame = tk.Frame(input_frame)
        url_entry_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.long_url_entry = tk.Entry(url_entry_frame, font=("Arial", 10))
        self.long_url_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.long_url_entry.bind('<Return>', lambda e: self.shorten_url())
        
        tk.Button(url_entry_frame, text="📋 Paste", command=self.paste_url,
                 bg="#95a5a6", fg="white", font=("Arial", 9)).pack(side=tk.LEFT, padx=5)
        
        # Custom alias (optional)
        tk.Label(input_frame, text="Custom Alias (optional):", 
                font=("Arial", 10)).pack(anchor=tk.W, padx=10, pady=(10,5))
        
        alias_frame = tk.Frame(input_frame)
        alias_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Label(alias_frame, text="short.ly/", font=("Arial", 10)).pack(side=tk.LEFT)
        self.alias_entry = tk.Entry(alias_frame, font=("Arial", 10), width=20)
        self.alias_entry.pack(side=tk.LEFT, padx=5)
        
        # Buttons
        btn_frame = tk.Frame(input_frame)
        btn_frame.pack(fill=tk.X, padx=10, pady=15)
        
        tk.Button(btn_frame, text="✂️ Shorten URL", command=self.shorten_url,
                 bg="#3498db", fg="white", font=("Arial", 11, "bold"),
                 padx=20, pady=10).pack(side=tk.LEFT, padx=5)
        
        tk.Button(btn_frame, text="🔄 Clear", command=self.clear_inputs,
                 bg="#95a5a6", fg="white", font=("Arial", 11, "bold"),
                 padx=20, pady=10).pack(side=tk.LEFT, padx=5)
        
        # Result section
        result_frame = tk.LabelFrame(content_frame, text="Shortened URL",
                                    font=("Arial", 11, "bold"))
        result_frame.pack(fill=tk.X, pady=10)
        
        result_content = tk.Frame(result_frame)
        result_content.pack(fill=tk.X, padx=10, pady=10)
        
        self.short_url_var = tk.StringVar(value="Your shortened URL will appear here")
        short_url_entry = tk.Entry(result_content, textvariable=self.short_url_var,
                                   font=("Arial", 12, "bold"), state='readonly',
                                   fg="#3498db")
        short_url_entry.pack(fill=tk.X, pady=5)
        
        result_btn_frame = tk.Frame(result_frame)
        result_btn_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Button(result_btn_frame, text="📋 Copy", command=self.copy_short_url,
                 bg="#27ae60", fg="white", font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        tk.Button(result_btn_frame, text="🌐 Open", command=self.open_url,
                 bg="#9b59b6", fg="white", font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        tk.Button(result_btn_frame, text="📱 Generate QR", command=self.generate_qr,
                 bg="#e74c3c", fg="white", font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        # QR Code display
        qr_frame = tk.LabelFrame(content_frame, text="QR Code",
                                font=("Arial", 11, "bold"))
        qr_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        self.qr_label = tk.Label(qr_frame, text="QR code will appear here",
                                bg="#f5f5f5", fg="#999",
                                font=("Arial", 12))
        self.qr_label.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        qr_btn_frame = tk.Frame(qr_frame)
        qr_btn_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Button(qr_btn_frame, text="💾 Save QR Code", command=self.save_qr,
                 bg="#16a085", fg="white", font=("Arial", 10)).pack(side=tk.LEFT, padx=5)
        
        # URL History
        history_frame = tk.LabelFrame(content_frame, text="URL History",
                                     font=("Arial", 11, "bold"))
        history_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Treeview
        tree_frame = tk.Frame(history_frame)
        tree_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        scrollbar = tk.Scrollbar(tree_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.tree = ttk.Treeview(tree_frame, yscrollcommand=scrollbar.set,
                                selectmode='browse', height=6)
        self.tree.pack(fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.tree.yview)
        
        self.tree['columns'] = ('Short', 'Long', 'Clicks', 'Date')
        self.tree.column('#0', width=0, stretch=False)
        self.tree.column('Short', width=150, minwidth=100)
        self.tree.column('Long', width=300, minwidth=200)
        self.tree.column('Clicks', width=80, minwidth=60)
        self.tree.column('Date', width=150, minwidth=100)
        
        self.tree.heading('Short', text='Short URL')
        self.tree.heading('Long', text='Original URL')
        self.tree.heading('Clicks', text='Clicks')
        self.tree.heading('Date', text='Created')
        
        self.tree.bind('<Double-Button-1>', self.load_from_history)
        
        # History buttons
        history_btn_frame = tk.Frame(history_frame)
        history_btn_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Button(history_btn_frame, text="Load Selected", command=self.load_from_history,
                 bg="#3498db", fg="white", font=("Arial", 9)).pack(side=tk.LEFT, padx=5)
        tk.Button(history_btn_frame, text="Delete Selected", command=self.delete_selected,
                 bg="#e74c3c", fg="white", font=("Arial", 9)).pack(side=tk.LEFT, padx=5)
        tk.Button(history_btn_frame, text="Clear All", command=self.clear_history,
                 bg="#95a5a6", fg="white", font=("Arial", 9)).pack(side=tk.LEFT, padx=5)
        tk.Button(history_btn_frame, text="Export", command=self.export_history,
                 bg="#16a085", fg="white", font=("Arial", 9)).pack(side=tk.LEFT, padx=5)
        
        # Status bar
        self.status_bar = tk.Label(self.root, text="Ready", bd=1, relief=tk.SUNKEN,
                                   anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
    
    def generate_short_code(self, url, custom_alias=None):
        """Generate a short code for the URL"""
        if custom_alias:
            # Check if alias already exists
            for short, data in self.urls.items():
                if short == custom_alias:
                    return None
            return custom_alias
        
        # Generate hash-based short code
        hash_object = hashlib.md5(url.encode())
        short_code = hash_object.hexdigest()[:6]
        
        # Ensure uniqueness
        counter = 0
        while short_code in self.urls:
            counter += 1
            hash_object = hashlib.md5(f"{url}{counter}".encode())
            short_code = hash_object.hexdigest()[:6]
        
        return short_code
    
    def shorten_url(self):
        long_url = self.long_url_entry.get().strip()
        custom_alias = self.alias_entry.get().strip()
        
        if not long_url:
            messagebox.showwarning("Warning", "Please enter a URL to shorten")
            return
        
        # Add http:// if not present
        if not long_url.startswith(('http://', 'https://')):
            long_url = 'https://' + long_url
        
        # Generate short code
        short_code = self.generate_short_code(long_url, custom_alias if custom_alias else None)
        
        if short_code is None:
            messagebox.showerror("Error", "This custom alias is already taken")
            return
        
        # Save URL
        self.urls[short_code] = {
            'long_url': long_url,
            'clicks': 0,
            'created': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        self.save_urls()
        
        # Display short URL
        short_url = f"short.ly/{short_code}"
        self.short_url_var.set(short_url)
        
        # Update history
        self.load_url_list()
        
        self.status_bar.config(text=f"URL shortened successfully: {short_url}")
        messagebox.showinfo("Success", f"URL shortened!\n\n{short_url}")
    
    def paste_url(self):
        try:
            import pyperclip
            url = pyperclip.paste()
            self.long_url_entry.delete(0, tk.END)
            self.long_url_entry.insert(0, url)
        except:
            try:
                url = self.root.clipboard_get()
                self.long_url_entry.delete(0, tk.END)
                self.long_url_entry.insert(0, url)
            except:
                messagebox.showerror("Error", "Failed to paste from clipboard")
    
    def clear_inputs(self):
        self.long_url_entry.delete(0, tk.END)
        self.alias_entry.delete(0, tk.END)
        self.short_url_var.set("Your shortened URL will appear here")
        self.qr_label.config(image='', text="QR code will appear here")
        self.current_qr = None
    
    def copy_short_url(self):
        short_url = self.short_url_var.get()
        
        if short_url == "Your shortened URL will appear here":
            messagebox.showinfo("Info", "No URL to copy")
            return
        
        try:
            import pyperclip
            pyperclip.copy(short_url)
            self.status_bar.config(text=f"Copied: {short_url}")
        except:
            self.root.clipboard_clear()
            self.root.clipboard_append(short_url)
            self.status_bar.config(text=f"Copied: {short_url}")
        
        messagebox.showinfo("Copied", f"Copied to clipboard:\n{short_url}")
    
    def open_url(self):
        short_url = self.short_url_var.get()
        
        if short_url == "Your shortened URL will appear here":
            messagebox.showinfo("Info", "No URL to open")
            return
        
        # Extract short code
        short_code = short_url.split('/')[-1]
        
        if short_code in self.urls:
            long_url = self.urls[short_code]['long_url']
            
            # Increment click counter
            self.urls[short_code]['clicks'] += 1
            self.save_urls()
            self.load_url_list()
            
            webbrowser.open(long_url)
            self.status_bar.config(text=f"Opening: {long_url}")
        else:
            messagebox.showerror("Error", "URL not found")
    
    def generate_qr(self):
        if not QR_AVAILABLE:
            messagebox.showerror("Error", 
                "QR code generation requires:\npip install qrcode pillow")
            return
        
        short_url = self.short_url_var.get()
        
        if short_url == "Your shortened URL will appear here":
            messagebox.showinfo("Info", "Please shorten a URL first")
            return
        
        try:
            # Generate QR code
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(short_url)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Resize for display
            img = img.resize((250, 250), Image.Resampling.LANCZOS)
            
            # Convert to PhotoImage
            photo = ImageTk.PhotoImage(img)
            
            self.qr_label.config(image=photo, text="")
            self.qr_label.image = photo  # Keep reference
            self.current_qr = img
            
            self.status_bar.config(text="QR code generated successfully")
        
        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate QR code: {str(e)}")
    
    def save_qr(self):
        if self.current_qr is None:
            messagebox.showinfo("Info", "Please generate a QR code first")
            return
        
        file_path = filedialog.asksaveasfilename(
            defaultextension=".png",
            filetypes=[("PNG files", "*.png"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                # Save at higher resolution
                qr = qrcode.QRCode(version=1, box_size=10, border=4)
                qr.add_data(self.short_url_var.get())
                qr.make(fit=True)
                
                img = qr.make_image(fill_color="black", back_color="white")
                img.save(file_path)
                
                messagebox.showinfo("Success", f"QR code saved to:\n{file_path}")
                self.status_bar.config(text=f"QR code saved: {file_path}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save QR code: {str(e)}")
    
    def load_url_list(self):
        # Clear tree
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Sort by date (newest first)
        sorted_urls = sorted(self.urls.items(), 
                           key=lambda x: x[1]['created'], 
                           reverse=True)
        
        for short_code, data in sorted_urls:
            short_url = f"short.ly/{short_code}"
            long_url = data['long_url']
            if len(long_url) > 50:
                long_url = long_url[:47] + "..."
            
            self.tree.insert('', 'end', values=(
                short_url,
                long_url,
                data['clicks'],
                data['created']
            ))
    
    def load_from_history(self, event=None):
        selection = self.tree.selection()
        if not selection:
            return
        
        item = self.tree.item(selection[0])
        short_url = item['values'][0]
        short_code = short_url.split('/')[-1]
        
        if short_code in self.urls:
            long_url = self.urls[short_code]['long_url']
            
            self.long_url_entry.delete(0, tk.END)
            self.long_url_entry.insert(0, long_url)
            
            self.short_url_var.set(short_url)
            self.status_bar.config(text=f"Loaded: {short_url}")
    
    def delete_selected(self):
        selection = self.tree.selection()
        if not selection:
            messagebox.showinfo("Info", "Please select a URL to delete")
            return
        
        item = self.tree.item(selection[0])
        short_url = item['values'][0]
        short_code = short_url.split('/')[-1]
        
        if messagebox.askyesno("Confirm", f"Delete {short_url}?"):
            if short_code in self.urls:
                del self.urls[short_code]
                self.save_urls()
                self.load_url_list()
                self.status_bar.config(text=f"Deleted: {short_url}")
    
    def clear_history(self):
        if not self.urls:
            messagebox.showinfo("Info", "History is already empty")
            return
        
        if messagebox.askyesno("Confirm", "Clear all URL history?"):
            self.urls = {}
            self.save_urls()
            self.load_url_list()
            self.status_bar.config(text="History cleared")
    
    def export_history(self):
        if not self.urls:
            messagebox.showinfo("Info", "No URLs to export")
            return
        
        file_path = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("CSV files", "*.csv"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write("URL Shortener Export\n")
                    f.write("=" * 80 + "\n\n")
                    
                    for short_code, data in self.urls.items():
                        f.write(f"Short URL: short.ly/{short_code}\n")
                        f.write(f"Long URL: {data['long_url']}\n")
                        f.write(f"Clicks: {data['clicks']}\n")
                        f.write(f"Created: {data['created']}\n")
                        f.write("-" * 80 + "\n\n")
                
                messagebox.showinfo("Success", f"Exported to:\n{file_path}")
                self.status_bar.config(text=f"Exported: {file_path}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to export: {str(e)}")
    
    def load_urls(self):
        if os.path.exists(self.urls_file):
            try:
                with open(self.urls_file, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def save_urls(self):
        try:
            with open(self.urls_file, 'w') as f:
                json.dump(self.urls, f, indent=2)
        except Exception as e:
            print(f"Error saving URLs: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = URLShortener(root)
    root.mainloop()
