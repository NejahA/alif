import tkinter as tk
from tkinter import ttk, messagebox
import random
import string
import json
import os
from base64 import b64encode, b64decode
import hashlib

class PasswordManager:
    def __init__(self, root):
        self.root = root
        self.root.title("Password Manager")
        self.root.geometry("700x600")
        
        self.passwords_file = "passwords_encrypted.json"
        self.master_password = None
        self.passwords = {}
        
        self.show_login_screen()
    
    def show_login_screen(self):
        # Clear window
        for widget in self.root.winfo_children():
            widget.destroy()
        
        login_frame = tk.Frame(self.root)
        login_frame.place(relx=0.5, rely=0.5, anchor=tk.CENTER)
        
        tk.Label(login_frame, text="🔐 Password Manager", font=("Arial", 24, "bold")).pack(pady=20)
        
        if os.path.exists(self.passwords_file):
            tk.Label(login_frame, text="Enter Master Password:", font=("Arial", 12)).pack(pady=10)
            
            self.master_entry = tk.Entry(login_frame, show="*", font=("Arial", 14), width=25)
            self.master_entry.pack(pady=10)
            self.master_entry.bind('<Return>', lambda e: self.login())
            
            tk.Button(login_frame, text="Unlock", command=self.login,
                     bg="#4CAF50", fg="white", font=("Arial", 12, "bold"),
                     padx=30, pady=10).pack(pady=10)
            
            self.master_entry.focus()
        else:
            tk.Label(login_frame, text="Create Master Password:", font=("Arial", 12)).pack(pady=10)
            tk.Label(login_frame, text="(Remember this - it cannot be recovered!)", 
                    font=("Arial", 9), fg="red").pack()
            
            self.master_entry = tk.Entry(login_frame, show="*", font=("Arial", 14), width=25)
            self.master_entry.pack(pady=10)
            
            tk.Label(login_frame, text="Confirm Master Password:", font=("Arial", 12)).pack(pady=10)
            self.confirm_entry = tk.Entry(login_frame, show="*", font=("Arial", 14), width=25)
            self.confirm_entry.pack(pady=10)
            self.confirm_entry.bind('<Return>', lambda e: self.create_master())
            
            tk.Button(login_frame, text="Create", command=self.create_master,
                     bg="#4CAF50", fg="white", font=("Arial", 12, "bold"),
                     padx=30, pady=10).pack(pady=10)
    
    def create_master(self):
        password = self.master_entry.get()
        confirm = self.confirm_entry.get()
        
        if len(password) < 6:
            messagebox.showerror("Error", "Master password must be at least 6 characters")
            return
        
        if password != confirm:
            messagebox.showerror("Error", "Passwords do not match")
            return
        
        self.master_password = password
        self.passwords = {}
        self.save_passwords()
        self.show_main_screen()
    
    def login(self):
        password = self.master_entry.get()
        
        try:
            with open(self.passwords_file, 'r') as f:
                data = json.load(f)
            
            # Verify password
            stored_hash = data.get('master_hash', '')
            if self.hash_password(password) != stored_hash:
                messagebox.showerror("Error", "Incorrect master password")
                self.master_entry.delete(0, tk.END)
                return
            
            self.master_password = password
            self.passwords = self.decrypt_passwords(data.get('passwords', {}))
            self.show_main_screen()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load passwords: {str(e)}")
    
    def show_main_screen(self):
        # Clear window
        for widget in self.root.winfo_children():
            widget.destroy()
        
        # Title
        title_frame = tk.Frame(self.root, bg="#2196F3", height=60)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        tk.Label(title_frame, text="🔐 Password Manager", font=("Arial", 18, "bold"),
                bg="#2196F3", fg="white").pack(pady=15)
        
        # Main container
        main_frame = tk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Left side - Generator
        left_frame = tk.LabelFrame(main_frame, text="Password Generator", font=("Arial", 11, "bold"))
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        
        # Length slider
        tk.Label(left_frame, text="Password Length:", font=("Arial", 10)).pack(pady=5)
        self.length_var = tk.IntVar(value=16)
        length_frame = tk.Frame(left_frame)
        length_frame.pack(fill=tk.X, padx=10)
        
        tk.Scale(length_frame, from_=8, to=32, orient=tk.HORIZONTAL,
                variable=self.length_var, command=self.generate_password).pack(side=tk.LEFT, fill=tk.X, expand=True)
        tk.Label(length_frame, textvariable=self.length_var, width=3).pack(side=tk.LEFT)
        
        # Options
        self.use_uppercase = tk.BooleanVar(value=True)
        self.use_lowercase = tk.BooleanVar(value=True)
        self.use_numbers = tk.BooleanVar(value=True)
        self.use_symbols = tk.BooleanVar(value=True)
        
        tk.Checkbutton(left_frame, text="Uppercase (A-Z)", variable=self.use_uppercase,
                      command=self.generate_password).pack(anchor=tk.W, padx=20)
        tk.Checkbutton(left_frame, text="Lowercase (a-z)", variable=self.use_lowercase,
                      command=self.generate_password).pack(anchor=tk.W, padx=20)
        tk.Checkbutton(left_frame, text="Numbers (0-9)", variable=self.use_numbers,
                      command=self.generate_password).pack(anchor=tk.W, padx=20)
        tk.Checkbutton(left_frame, text="Symbols (!@#$%)", variable=self.use_symbols,
                      command=self.generate_password).pack(anchor=tk.W, padx=20)
        
        # Generated password display
        tk.Label(left_frame, text="Generated Password:", font=("Arial", 10, "bold")).pack(pady=(10, 5))
        
        self.generated_password = tk.StringVar()
        password_frame = tk.Frame(left_frame)
        password_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.password_display = tk.Entry(password_frame, textvariable=self.generated_password,
                                        font=("Courier", 12), state='readonly')
        self.password_display.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        tk.Button(password_frame, text="📋", command=self.copy_generated,
                 font=("Arial", 10)).pack(side=tk.LEFT, padx=2)
        
        # Strength indicator
        self.strength_label = tk.Label(left_frame, text="", font=("Arial", 9))
        self.strength_label.pack(pady=5)
        
        tk.Button(left_frame, text="Generate New Password", command=self.generate_password,
                 bg="#4CAF50", fg="white", font=("Arial", 11, "bold")).pack(pady=10)
        
        # Right side - Saved passwords
        right_frame = tk.LabelFrame(main_frame, text="Saved Passwords", font=("Arial", 11, "bold"))
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=5)
        
        # Add password form
        add_frame = tk.Frame(right_frame)
        add_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Label(add_frame, text="Website/App:", font=("Arial", 9)).grid(row=0, column=0, sticky=tk.W, pady=2)
        self.site_entry = tk.Entry(add_frame, font=("Arial", 10))
        self.site_entry.grid(row=0, column=1, sticky=tk.EW, pady=2)
        
        tk.Label(add_frame, text="Username:", font=("Arial", 9)).grid(row=1, column=0, sticky=tk.W, pady=2)
        self.username_entry = tk.Entry(add_frame, font=("Arial", 10))
        self.username_entry.grid(row=1, column=1, sticky=tk.EW, pady=2)
        
        tk.Label(add_frame, text="Password:", font=("Arial", 9)).grid(row=2, column=0, sticky=tk.W, pady=2)
        self.password_entry = tk.Entry(add_frame, font=("Arial", 10))
        self.password_entry.grid(row=2, column=1, sticky=tk.EW, pady=2)
        
        add_frame.columnconfigure(1, weight=1)
        
        btn_frame = tk.Frame(add_frame)
        btn_frame.grid(row=3, column=0, columnspan=2, pady=10)
        
        tk.Button(btn_frame, text="Use Generated", command=self.use_generated,
                 bg="#2196F3", fg="white").pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="Save Password", command=self.save_password,
                 bg="#4CAF50", fg="white", font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=2)
        
        # Search
        search_frame = tk.Frame(right_frame)
        search_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Label(search_frame, text="Search:", font=("Arial", 9)).pack(side=tk.LEFT)
        self.search_var = tk.StringVar()
        self.search_var.trace('w', self.filter_passwords)
        tk.Entry(search_frame, textvariable=self.search_var, font=("Arial", 10)).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        
        # Password list
        list_frame = tk.Frame(right_frame)
        list_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        scrollbar = tk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.password_listbox = tk.Listbox(list_frame, yscrollcommand=scrollbar.set,
                                          font=("Courier", 9))
        self.password_listbox.pack(fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.password_listbox.yview)
        
        self.password_listbox.bind('<Double-Button-1>', self.show_password_details)
        
        # Action buttons
        action_frame = tk.Frame(right_frame)
        action_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Button(action_frame, text="View", command=self.show_password_details,
                 bg="#2196F3", fg="white").pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        tk.Button(action_frame, text="Copy", command=self.copy_password,
                 bg="#FF9800", fg="white").pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        tk.Button(action_frame, text="Delete", command=self.delete_password,
                 bg="#f44336", fg="white").pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        
        # Status bar
        self.status_label = tk.Label(self.root, text=f"Loaded {len(self.passwords)} passwords",
                                     bd=1, relief=tk.SUNKEN, anchor=tk.W)
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Initial generation
        self.generate_password()
        self.update_password_list()
    
    def generate_password(self, event=None):
        length = self.length_var.get()
        chars = ""
        
        if self.use_uppercase.get():
            chars += string.ascii_uppercase
        if self.use_lowercase.get():
            chars += string.ascii_lowercase
        if self.use_numbers.get():
            chars += string.digits
        if self.use_symbols.get():
            chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
        if not chars:
            self.generated_password.set("")
            self.strength_label.config(text="Select at least one option", fg="red")
            return
        
        password = ''.join(random.choice(chars) for _ in range(length))
        self.generated_password.set(password)
        
        # Calculate strength
        strength = self.calculate_strength(password)
        if strength >= 80:
            self.strength_label.config(text="Strength: Very Strong 💪", fg="green")
        elif strength >= 60:
            self.strength_label.config(text="Strength: Strong 👍", fg="blue")
        elif strength >= 40:
            self.strength_label.config(text="Strength: Medium ⚠️", fg="orange")
        else:
            self.strength_label.config(text="Strength: Weak ❌", fg="red")
    
    def calculate_strength(self, password):
        score = 0
        score += len(password) * 4
        if any(c.isupper() for c in password):
            score += 10
        if any(c.islower() for c in password):
            score += 10
        if any(c.isdigit() for c in password):
            score += 10
        if any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            score += 15
        return min(score, 100)
    
    def copy_generated(self):
        try:
            import pyperclip
            pyperclip.copy(self.generated_password.get())
            self.status_label.config(text="Password copied to clipboard!")
        except ImportError:
            messagebox.showinfo("Info", "Install pyperclip for clipboard support: pip install pyperclip")
    
    def use_generated(self):
        self.password_entry.delete(0, tk.END)
        self.password_entry.insert(0, self.generated_password.get())
    
    def save_password(self):
        site = self.site_entry.get().strip()
        username = self.username_entry.get().strip()
        password = self.password_entry.get().strip()
        
        if not site or not password:
            messagebox.showerror("Error", "Website and Password are required")
            return
        
        self.passwords[site] = {
            'username': username,
            'password': password
        }
        
        self.save_passwords()
        self.update_password_list()
        
        self.site_entry.delete(0, tk.END)
        self.username_entry.delete(0, tk.END)
        self.password_entry.delete(0, tk.END)
        
        self.status_label.config(text=f"Saved password for {site}")
    
    def update_password_list(self):
        self.password_listbox.delete(0, tk.END)
        search = self.search_var.get().lower()
        
        for site in sorted(self.passwords.keys()):
            if search in site.lower() or search in self.passwords[site].get('username', '').lower():
                username = self.passwords[site].get('username', 'N/A')
                self.password_listbox.insert(tk.END, f"{site:<30} | {username}")
    
    def filter_passwords(self, *args):
        self.update_password_list()
    
    def show_password_details(self, event=None):
        selection = self.password_listbox.curselection()
        if not selection:
            return
        
        item = self.password_listbox.get(selection[0])
        site = item.split('|')[0].strip()
        
        if site in self.passwords:
            data = self.passwords[site]
            msg = f"Website: {site}\n"
            msg += f"Username: {data.get('username', 'N/A')}\n"
            msg += f"Password: {data['password']}"
            
            messagebox.showinfo("Password Details", msg)
    
    def copy_password(self):
        selection = self.password_listbox.curselection()
        if not selection:
            return
        
        item = self.password_listbox.get(selection[0])
        site = item.split('|')[0].strip()
        
        if site in self.passwords:
            try:
                import pyperclip
                pyperclip.copy(self.passwords[site]['password'])
                self.status_label.config(text=f"Password for {site} copied!")
            except ImportError:
                messagebox.showinfo("Info", "Install pyperclip: pip install pyperclip")
    
    def delete_password(self):
        selection = self.password_listbox.curselection()
        if not selection:
            return
        
        item = self.password_listbox.get(selection[0])
        site = item.split('|')[0].strip()
        
        if messagebox.askyesno("Confirm", f"Delete password for {site}?"):
            del self.passwords[site]
            self.save_passwords()
            self.update_password_list()
            self.status_label.config(text=f"Deleted password for {site}")
    
    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()
    
    def encrypt_passwords(self, passwords):
        # Simple XOR encryption (for demo - use proper encryption in production)
        key = self.hash_password(self.master_password)
        encrypted = {}
        
        for site, data in passwords.items():
            encrypted[site] = {
                'username': self.xor_encrypt(data.get('username', ''), key),
                'password': self.xor_encrypt(data['password'], key)
            }
        
        return encrypted
    
    def decrypt_passwords(self, encrypted):
        key = self.hash_password(self.master_password)
        decrypted = {}
        
        for site, data in encrypted.items():
            decrypted[site] = {
                'username': self.xor_decrypt(data.get('username', ''), key),
                'password': self.xor_decrypt(data['password'], key)
            }
        
        return decrypted
    
    def xor_encrypt(self, text, key):
        encrypted = bytearray()
        for i, char in enumerate(text.encode()):
            encrypted.append(char ^ ord(key[i % len(key)]))
        return b64encode(encrypted).decode()
    
    def xor_decrypt(self, encrypted, key):
        encrypted_bytes = b64decode(encrypted.encode())
        decrypted = bytearray()
        for i, byte in enumerate(encrypted_bytes):
            decrypted.append(byte ^ ord(key[i % len(key)]))
        return decrypted.decode()
    
    def save_passwords(self):
        data = {
            'master_hash': self.hash_password(self.master_password),
            'passwords': self.encrypt_passwords(self.passwords)
        }
        
        with open(self.passwords_file, 'w') as f:
            json.dump(data, f, indent=2)

if __name__ == "__main__":
    root = tk.Tk()
    app = PasswordManager(root)
    root.mainloop()
