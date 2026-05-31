import tkinter as tk
from tkinter import ttk, messagebox
import requests
import json
import threading
import time

class RiderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Rider - Live Streams")
        self.root.geometry("900x600")
        self.root.configure(bg="#f0f0f0")
        
        self.client_id = ""  # Add your Twitch Client ID here
        self.client_secret = ""  # Add your Twitch Client Secret here
        self.access_token = None
        
        # Header
        header = tk.Frame(root, bg="#9146FF", height=60)
        header.pack(fill=tk.X)
        
        tk.Label(header, text="Rider", fg="white", bg="#9146FF", 
                font=("Arial", 18, "bold")).pack(side=tk.LEFT, padx=15)
        
        # Search box
        search_frame = tk.Frame(header, bg="#9146FF")
        search_frame.pack(side=tk.LEFT, padx=10)
        
        tk.Label(search_frame, text="Search:", fg="white", bg="#9146FF").pack(side=tk.LEFT)
        self.search_var = tk.StringVar()
        search_entry = tk.Entry(search_frame, textvariable=self.search_var, width=30)
        search_entry.pack(side=tk.LEFT, padx=5)
        search_entry.bind('<Return>', lambda e: self.search_streams())
        
        # Go Live button
        go_live_btn = tk.Button(header, text="Go Live", bg="#4CAF50", fg="white",
                               font=("Arial", 10, "bold"), command=self.go_live,
                               relief=tk.FLAT, padx=20, pady=5)
        go_live_btn.pack(side=tk.RIGHT, padx=10)
        
        # Refresh button
        refresh_btn = tk.Button(header, text="Refresh", bg="#2196F3", fg="white",
                               font=("Arial", 10, "bold"), command=self.load_streams,
                               relief=tk.FLAT, padx=20, pady=5)
        refresh_btn.pack(side=tk.RIGHT, padx=5)
        
        # Stream list
        list_frame = tk.Frame(root, bg="#f0f0f0")
        list_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        columns = ("Title", "Streamer", "Viewers", "Category", "Live")
        self.tree = ttk.Treeview(list_frame, columns=columns, show="headings", height=15)
        
        for col in columns:
            self.tree.heading(col, text=col)
            if col == "Title":
                self.tree.column(col, width=250)
            elif col == "Streamer":
                self.tree.column(col, width=120)
            elif col == "Viewers":
                self.tree.column(col, width=80)
            elif col == "Category":
                self.tree.column(col, width=150)
            elif col == "Live":
                self.tree.column(col, width=60)
        
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(list_frame, orient="vertical", command=self.tree.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        # Status bar
        status_bar = tk.Label(root, text="Loading streams...", bg="#e0e0e0", anchor=tk.W)
        status_bar.pack(fill=tk.X, side=tk.BOTTOM)
        
        self.status_bar = status_bar
        
        # Load streams on startup
        self.load_streams()
    
    def get_access_token(self):
        if self.access_token:
            return self.access_token
        
        if not self.client_id or not self.client_secret:
            return None
        
        try:
            response = requests.post(
                "https://id.twitch.tv/oauth2/token",
                params={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "grant_type": "client_credentials"
                }
            )
            data = response.json()
            self.access_token = data.get("access_token")
            return self.access_token
        except Exception as e:
            print(f"Error getting token: {e}")
            return None
    
    def load_streams(self):
        self.status_bar.config(text="Loading streams...")
        self.root.update()
        
        def fetch():
            token = self.get_access_token()
            if not token:
                self.root.after(0, lambda: self.status_bar.config(text="Please add Twitch Client ID and Secret"))
                return
            
            try:
                headers = {"Client-Id": self.client_id, "Authorization": f"Bearer {token}"}
                response = requests.get(
                    "https://api.twitch.tv/helix/streams",
                    headers=headers,
                    params={"first": 20}
                )
                data = response.json()
                
                self.root.after(0, lambda: self.update_streams(data.get("data", [])))
                self.root.after(0, lambda: self.status_bar.config(text=f"Loaded {len(data.get('data', []))} streams"))
            except Exception as e:
                self.root.after(0, lambda: self.status_bar.config(text=f"Error: {e}"))
        
        threading.Thread(target=fetch, daemon=True).start()
    
    def update_streams(self, streams):
        # Clear existing items
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Add new streams
        for stream in streams:
            title = stream.get("title", "Unknown")
            user_name = stream.get("user_name", "Unknown")
            viewer_count = stream.get("viewer_count", 0)
            game_name = stream.get("game_name", "Unknown")
            
            # Format viewer count
            if viewer_count >= 1000:
                viewers = f"{viewer_count // 1000}K"
            else:
                viewers = str(viewer_count)
            
            self.tree.insert("", tk.END, values=(title, user_name, viewers, game_name, "LIVE"))
    
    def search_streams(self):
        query = self.search_var.get().strip()
        if not query:
            self.load_streams()
            return
        
        self.status_bar.config(text=f"Searching for '{query}'...")
        self.root.update()
        
        def fetch():
            token = self.get_access_token()
            if not token:
                self.root.after(0, lambda: self.status_bar.config(text="Please add Twitch Client ID and Secret"))
                return
            
            try:
                headers = {"Client-Id": self.client_id, "Authorization": f"Bearer {token}"}
                response = requests.get(
                    "https://api.twitch.tv/helix/streams",
                    headers=headers,
                    params={"first": 20, "game_name": query}
                )
                data = response.json()
                
                self.root.after(0, lambda: self.update_streams(data.get("data", [])))
                self.root.after(0, lambda: self.status_bar.config(text=f"Found {len(data.get('data', []))} streams"))
            except Exception as e:
                self.root.after(0, lambda: self.status_bar.config(text=f"Error: {e}"))
        
        threading.Thread(target=fetch, daemon=True).start()
    
    def go_live(self):
        self.status_bar.config(text="Opening Twitch to start streaming...")
        self.root.update()
        import webbrowser
        webbrowser.open("https://www.twitch.tv/broadcast/dashboard")

if __name__ == "__main__":
    root = tk.Tk()
    app = RiderApp(root)
    root.mainloop()
