"""
STREAMHUB - Complete Twitch Multi-Stream Viewer
A professional-grade stream viewing application
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import requests
import json
import threading
import webbrowser
from datetime import datetime
import sqlite3
from pathlib import Path

class StreamHub:
    def __init__(self, root):
        self.root = root
        self.root.title("StreamHub - Ultimate Stream Viewer")
        self.root.geometry("1400x900")
        self.root.configure(bg="#0e0e10")
        
        # Configuration
        self.config = self.load_config()
        self.client_id = self.config.get("twitch_client_id", "")
        self.client_secret = self.config.get("twitch_client_secret", "")
        self.access_token = None
        
        # Database setup
        self.setup_database()
        
        # Current view state
        self.current_view = "discover"  # discover, following, clips, analytics, settings
        self.selected_streams = []  # For multi-stream mode
        self.favorites = self.load_favorites()
        
        # Build UI
        self.create_ui()
        
        # Load initial data
        self.load_top_streams()
    
    def load_config(self):
        """Load configuration from config.json"""
        try:
            with open("config.json", "r") as f:
                return json.load(f)
        except:
            return {}
    
    def save_config(self):
        """Save configuration to config.json"""
        with open("config.json", "w") as f:
            json.dump(self.config, f, indent=4)
    
    def setup_database(self):
        """Setup SQLite database for favorites, clips, analytics"""
        self.db = sqlite3.connect("streamhub.db")
        cursor = self.db.cursor()
        
        # Favorites table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY,
                user_id TEXT UNIQUE,
                user_name TEXT,
                display_name TEXT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Clips table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS clips (
                id INTEGER PRIMARY KEY,
                clip_id TEXT UNIQUE,
                broadcaster_name TEXT,
                title TEXT,
                url TEXT,
                thumbnail_url TEXT,
                created_at TEXT,
                view_count INTEGER,
                downloaded BOOLEAN DEFAULT 0
            )
        """)
        
        # Analytics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analytics (
                id INTEGER PRIMARY KEY,
                user_id TEXT,
                viewer_count INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        self.db.commit()
    
    def load_favorites(self):
        """Load favorite streamers from database"""
        cursor = self.db.cursor()
        cursor.execute("SELECT user_id, user_name FROM favorites")
        return {row[0]: row[1] for row in cursor.fetchall()}
    
    def create_ui(self):
        """Create the main UI layout"""
        
        # ══════════════════════════════════════════════════════
        # SIDEBAR - Navigation
        # ══════════════════════════════════════════════════════
        sidebar = tk.Frame(self.root, bg="#18181b", width=220)
        sidebar.pack(side=tk.LEFT, fill=tk.Y)
        sidebar.pack_propagate(False)
        
        # Logo
        logo_frame = tk.Frame(sidebar, bg="#18181b", height=80)
        logo_frame.pack(fill=tk.X)
        tk.Label(
            logo_frame, 
            text="STREAMHUB", 
            font=("Arial", 20, "bold"),
            fg="#9147ff",
            bg="#18181b"
        ).pack(pady=20)
        
        # Navigation buttons
        nav_items = [
            ("🔍 Discover", "discover"),
            ("⭐ Following", "following"),
            ("🎬 Clips", "clips"),
            ("📊 Analytics", "analytics"),
            ("⚙️ Settings", "settings"),
        ]
        
        self.nav_buttons = {}
        for text, view in nav_items:
            btn = tk.Button(
                sidebar,
                text=text,
                font=("Arial", 11),
                bg="#18181b",
                fg="#efeff1",
                activebackground="#26262c",
                activeforeground="#ffffff",
                bd=0,
                relief=tk.FLAT,
                anchor=tk.W,
                padx=20,
                pady=12,
                cursor="hand2",
                command=lambda v=view: self.switch_view(v)
            )
            btn.pack(fill=tk.X)
            self.nav_buttons[view] = btn
        
        # Highlight active view
        self.nav_buttons["discover"].configure(bg="#26262c")
        
        # Spacer
        tk.Frame(sidebar, bg="#18181b", height=20).pack()
        
        # Quick Actions
        tk.Label(
            sidebar,
            text="QUICK ACTIONS",
            font=("Arial", 9, "bold"),
            fg="#6b6b7b",
            bg="#18181b"
        ).pack(anchor=tk.W, padx=20, pady=(10, 5))
        
        # Multi-stream button
        self.multi_stream_btn = tk.Button(
            sidebar,
            text="🎯 Multi-Stream (0)",
            font=("Arial", 10),
            bg="#9147ff",
            fg="white",
            activebackground="#772ce8",
            bd=0,
            relief=tk.FLAT,
            padx=15,
            pady=8,
            cursor="hand2",
            command=self.open_multi_stream
        )
        self.multi_stream_btn.pack(fill=tk.X, padx=15, pady=5)
        
        # Go Live button
        go_live_btn = tk.Button(
            sidebar,
            text="📡 Go Live",
            font=("Arial", 10),
            bg="#00f593",
            fg="#0e0e10",
            activebackground="#00d67e",
            bd=0,
            relief=tk.FLAT,
            padx=15,
            pady=8,
            cursor="hand2",
            command=self.go_live
        )
        go_live_btn.pack(fill=tk.X, padx=15, pady=5)
        
        # ══════════════════════════════════════════════════════
        # MAIN CONTENT AREA
        # ══════════════════════════════════════════════════════
        self.content_area = tk.Frame(self.root, bg="#0e0e10")
        self.content_area.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Create all view containers (hidden by default)
        self.views = {}
        self.views["discover"] = self.create_discover_view()
        self.views["following"] = self.create_following_view()
        self.views["clips"] = self.create_clips_view()
        self.views["analytics"] = self.create_analytics_view()
        self.views["settings"] = self.create_settings_view()
        
        # Show initial view
        self.views["discover"].pack(fill=tk.BOTH, expand=True)
    
    def create_discover_view(self):
        """Create the Discover streams view"""
        frame = tk.Frame(self.content_area, bg="#0e0e10")
        
        # Header
        header = tk.Frame(frame, bg="#18181b", height=80)
        header.pack(fill=tk.X)
        header.pack_propagate(False)
        
        # Title
        tk.Label(
            header,
            text="Discover Live Streams",
            font=("Arial", 24, "bold"),
            fg="#efeff1",
            bg="#18181b"
        ).pack(side=tk.LEFT, padx=30, pady=20)
        
        # Search bar
        search_frame = tk.Frame(header, bg="#18181b")
        search_frame.pack(side=tk.RIGHT, padx=30)
        
        self.search_var = tk.StringVar()
        search_entry = tk.Entry(
            search_frame,
            textvariable=self.search_var,
            font=("Arial", 11),
            bg="#26262c",
            fg="#efeff1",
            insertbackground="#efeff1",
            bd=0,
            relief=tk.FLAT,
            width=30
        )
        search_entry.pack(side=tk.LEFT, ipady=8, padx=(0, 10))
        search_entry.bind("<Return>", lambda e: self.search_streams())
        
        search_btn = tk.Button(
            search_frame,
            text="🔍 Search",
            font=("Arial", 10),
            bg="#9147ff",
            fg="white",
            activebackground="#772ce8",
            bd=0,
            relief=tk.FLAT,
            padx=15,
            pady=8,
            cursor="hand2",
            command=self.search_streams
        )
        search_btn.pack(side=tk.LEFT)
        
        # Filters
        filter_frame = tk.Frame(frame, bg="#0e0e10")
        filter_frame.pack(fill=tk.X, padx=30, pady=10)
        
        tk.Label(
            filter_frame,
            text="Filter by:",
            font=("Arial", 10),
            fg="#6b6b7b",
            bg="#0e0e10"
        ).pack(side=tk.LEFT, padx=(0, 10))
        
        filters = ["🔥 Top", "🎮 Gaming", "💬 Just Chatting", "🎵 Music", "🎨 Art"]
        for filter_text in filters:
            btn = tk.Button(
                filter_frame,
                text=filter_text,
                font=("Arial", 9),
                bg="#26262c",
                fg="#efeff1",
                activebackground="#3a3a3d",
                bd=0,
                relief=tk.FLAT,
                padx=12,
                pady=6,
                cursor="hand2",
                command=lambda f=filter_text: self.apply_filter(f)
            )
            btn.pack(side=tk.LEFT, padx=5)
        
        # Stream grid container
        grid_container = tk.Frame(frame, bg="#0e0e10")
        grid_container.pack(fill=tk.BOTH, expand=True, padx=30, pady=10)
        
        # Scrollable canvas
        canvas = tk.Canvas(grid_container, bg="#0e0e10", highlightthickness=0)
        scrollbar = ttk.Scrollbar(grid_container, orient="vertical", command=canvas.yview)
        self.stream_grid = tk.Frame(canvas, bg="#0e0e10")
        
        self.stream_grid.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=self.stream_grid, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Status bar
        self.status_label = tk.Label(
            frame,
            text="Loading streams...",
            font=("Arial", 9),
            fg="#6b6b7b",
            bg="#18181b",
            anchor=tk.W
        )
        self.status_label.pack(fill=tk.X, side=tk.BOTTOM, ipady=8, padx=30)
        
        return frame
    
    def create_stream_card(self, stream_data):
        """Create a stream card widget"""
        card = tk.Frame(self.stream_grid, bg="#18181b", relief=tk.FLAT, bd=0)
        card.pack(side=tk.LEFT, padx=10, pady=10)
        
        # Thumbnail (placeholder)
        thumbnail = tk.Frame(card, bg="#26262c", width=280, height=157)
        thumbnail.pack()
        thumbnail.pack_propagate(False)
        
        # Live badge
        live_badge = tk.Label(
            thumbnail,
            text="🔴 LIVE",
            font=("Arial", 9, "bold"),
            fg="white",
            bg="#ff0000",
            padx=6,
            pady=2
        )
        live_badge.place(x=5, y=5)
        
        # Viewer count
        viewers = stream_data.get("viewer_count", 0)
        viewer_label = tk.Label(
            thumbnail,
            text=f"👁 {self.format_number(viewers)}",
            font=("Arial", 9, "bold"),
            fg="white",
            bg="#000000aa",
            padx=6,
            pady=2
        )
        viewer_label.place(x=5, y=130)
        
        # Info section
        info_frame = tk.Frame(card, bg="#18181b")
        info_frame.pack(fill=tk.X, padx=8, pady=8)
        
        # Streamer name
        streamer = tk.Label(
            info_frame,
            text=stream_data.get("user_name", "Unknown"),
            font=("Arial", 11, "bold"),
            fg="#efeff1",
            bg="#18181b",
            anchor=tk.W
        )
        streamer.pack(fill=tk.X)
        
        # Title
        title = tk.Label(
            info_frame,
            text=stream_data.get("title", "")[:40] + "...",
            font=("Arial", 9),
            fg="#adadb8",
            bg="#18181b",
            anchor=tk.W,
            wraplength=260,
            justify=tk.LEFT
        )
        title.pack(fill=tk.X, pady=(2, 0))
        
        # Category
        category = tk.Label(
            info_frame,
            text=stream_data.get("game_name", "Unknown"),
            font=("Arial", 9),
            fg="#6b6b7b",
            bg="#18181b",
            anchor=tk.W
        )
        category.pack(fill=tk.X, pady=(4, 0))
        
        # Action buttons
        btn_frame = tk.Frame(card, bg="#18181b")
        btn_frame.pack(fill=tk.X, padx=8, pady=(0, 8))
        
        # Watch button
        watch_btn = tk.Button(
            btn_frame,
            text="▶️ Watch",
            font=("Arial", 9, "bold"),
            bg="#9147ff",
            fg="white",
            activebackground="#772ce8",
            bd=0,
            relief=tk.FLAT,
            padx=10,
            pady=5,
            cursor="hand2",
            command=lambda: self.watch_stream(stream_data)
        )
        watch_btn.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(0, 5))
        
        # Add to multi-stream
        add_btn = tk.Button(
            btn_frame,
            text="+",
            font=("Arial", 11, "bold"),
            bg="#26262c",
            fg="#efeff1",
            activebackground="#3a3a3d",
            bd=0,
            relief=tk.FLAT,
            width=3,
            cursor="hand2",
            command=lambda: self.add_to_multi_stream(stream_data)
        )
        add_btn.pack(side=tk.LEFT)
        
        return card
    
    def create_following_view(self):
        """Create the Following view"""
        frame = tk.Frame(self.content_area, bg="#0e0e10")
        
        tk.Label(
            frame,
            text="⭐ Following",
            font=("Arial", 24, "bold"),
            fg="#efeff1",
            bg="#0e0e10"
        ).pack(pady=50)
        
        tk.Label(
            frame,
            text="Your favorite streamers will appear here\nClick ⭐ on any stream to add to favorites",
            font=("Arial", 12),
            fg="#6b6b7b",
            bg="#0e0e10",
            justify=tk.CENTER
        ).pack()
        
        return frame
    
    def create_clips_view(self):
        """Create the Clips view"""
        frame = tk.Frame(self.content_area, bg="#0e0e10")
        
        # Header
        header = tk.Frame(frame, bg="#18181b", height=80)
        header.pack(fill=tk.X)
        header.pack_propagate(False)
        
        tk.Label(
            header,
            text="🎬 Clip Library",
            font=("Arial", 24, "bold"),
            fg="#efeff1",
            bg="#18181b"
        ).pack(side=tk.LEFT, padx=30, pady=20)
        
        # Download button
        download_btn = tk.Button(
            header,
            text="⬇️ Download Clips",
            font=("Arial", 10),
            bg="#9147ff",
            fg="white",
            activebackground="#772ce8",
            bd=0,
            relief=tk.FLAT,
            padx=15,
            pady=8,
            cursor="hand2",
            command=self.download_clips
        )
        download_btn.pack(side=tk.RIGHT, padx=30)
        
        # Content
        tk.Label(
            frame,
            text="Saved clips from your favorite streams\nAutomatically downloads top clips daily",
            font=("Arial", 12),
            fg="#6b6b7b",
            bg="#0e0e10",
            justify=tk.CENTER
        ).pack(pady=100)
        
        return frame
    
    def create_analytics_view(self):
        """Create the Analytics view"""
        frame = tk.Frame(self.content_area, bg="#0e0e10")
        
        # Header
        header = tk.Frame(frame, bg="#18181b", height=80)
        header.pack(fill=tk.X)
        header.pack_propagate(False)
        
        tk.Label(
            header,
            text="📊 Stream Analytics",
            font=("Arial", 24, "bold"),
            fg="#efeff1",
            bg="#18181b"
        ).pack(side=tk.LEFT, padx=30, pady=20)
        
        # Stats grid
        stats_container = tk.Frame(frame, bg="#0e0e10")
        stats_container.pack(fill=tk.BOTH, expand=True, padx=30, pady=30)
        
        # Example stats
        stats = [
            ("🎯 Streams Watched", "127", "#9147ff"),
            ("⏱️ Total Watch Time", "43h 21m", "#00f593"),
            ("⭐ Favorites", str(len(self.favorites)), "#f1c40f"),
            ("🎬 Clips Saved", "0", "#e74c3c"),
        ]
        
        for i, (label, value, color) in enumerate(stats):
            stat_card = tk.Frame(stats_container, bg="#18181b", relief=tk.FLAT, bd=0)
            stat_card.grid(row=i//2, column=i%2, padx=10, pady=10, sticky="nsew")
            
            stats_container.grid_columnconfigure(i%2, weight=1)
            stats_container.grid_rowconfigure(i//2, weight=1)
            
            tk.Label(
                stat_card,
                text=value,
                font=("Arial", 36, "bold"),
                fg=color,
                bg="#18181b"
            ).pack(pady=(30, 5))
            
            tk.Label(
                stat_card,
                text=label,
                font=("Arial", 12),
                fg="#6b6b7b",
                bg="#18181b"
            ).pack(pady=(0, 30))
        
        return frame
    
    def create_settings_view(self):
        """Create the Settings view"""
        frame = tk.Frame(self.content_area, bg="#0e0e10")
        
        # Header
        header = tk.Frame(frame, bg="#18181b", height=80)
        header.pack(fill=tk.X)
        header.pack_propagate(False)
        
        tk.Label(
            header,
            text="⚙️ Settings",
            font=("Arial", 24, "bold"),
            fg="#efeff1",
            bg="#18181b"
        ).pack(side=tk.LEFT, padx=30, pady=20)
        
        # Settings container
        settings_container = tk.Frame(frame, bg="#0e0e10")
        settings_container.pack(fill=tk.BOTH, expand=True, padx=50, pady=30)
        
        # Twitch API Credentials
        tk.Label(
            settings_container,
            text="Twitch API Credentials",
            font=("Arial", 14, "bold"),
            fg="#efeff1",
            bg="#0e0e10"
        ).pack(anchor=tk.W, pady=(0, 10))
        
        # Client ID
        tk.Label(
            settings_container,
            text="Client ID:",
            font=("Arial", 10),
            fg="#adadb8",
            bg="#0e0e10"
        ).pack(anchor=tk.W)
        
        self.client_id_entry = tk.Entry(
            settings_container,
            font=("Arial", 10),
            bg="#26262c",
            fg="#efeff1",
            insertbackground="#efeff1",
            bd=0,
            relief=tk.FLAT,
            width=50
        )
        self.client_id_entry.pack(anchor=tk.W, ipady=8, pady=(5, 15))
        self.client_id_entry.insert(0, self.client_id)
        
        # Client Secret
        tk.Label(
            settings_container,
            text="Client Secret:",
            font=("Arial", 10),
            fg="#adadb8",
            bg="#0e0e10"
        ).pack(anchor=tk.W)
        
        self.client_secret_entry = tk.Entry(
            settings_container,
            font=("Arial", 10),
            bg="#26262c",
            fg="#efeff1",
            insertbackground="#efeff1",
            bd=0,
            relief=tk.FLAT,
            width=50,
            show="*"
        )
        self.client_secret_entry.pack(anchor=tk.W, ipady=8, pady=(5, 20))
        self.client_secret_entry.insert(0, self.client_secret)
        
        # Save button
        save_btn = tk.Button(
            settings_container,
            text="💾 Save Settings",
            font=("Arial", 11, "bold"),
            bg="#9147ff",
            fg="white",
            activebackground="#772ce8",
            bd=0,
            relief=tk.FLAT,
            padx=20,
            pady=10,
            cursor="hand2",
            command=self.save_settings
        )
        save_btn.pack(anchor=tk.W, pady=10)
        
        # Help text
        tk.Label(
            settings_container,
            text="Get your API credentials from: https://dev.twitch.tv/console",
            font=("Arial", 9),
            fg="#6b6b7b",
            bg="#0e0e10"
        ).pack(anchor=tk.W, pady=(20, 0))
        
        return frame
    
    # ══════════════════════════════════════════════════════
    # VIEW SWITCHING
    # ══════════════════════════════════════════════════════
    
    def switch_view(self, view_name):
        """Switch between different views"""
        # Hide all views
        for view in self.views.values():
            view.pack_forget()
        
        # Show selected view
        self.views[view_name].pack(fill=tk.BOTH, expand=True)
        
        # Update navigation buttons
        for name, btn in self.nav_buttons.items():
            if name == view_name:
                btn.configure(bg="#26262c")
            else:
                btn.configure(bg="#18181b")
        
        self.current_view = view_name
    
    # ══════════════════════════════════════════════════════
    # TWITCH API FUNCTIONS
    # ══════════════════════════════════════════════════════
    
    def get_access_token(self):
        """Get Twitch OAuth token"""
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
    
    def load_top_streams(self):
        """Load top live streams from Twitch"""
        self.status_label.config(text="Loading streams...")
        self.root.update()
        
        def fetch():
            token = self.get_access_token()
            if not token:
                self.root.after(0, lambda: self.status_label.config(
                    text="⚠️ Please add Twitch API credentials in Settings"
                ))
                return
            
            try:
                headers = {
                    "Client-Id": self.client_id,
                    "Authorization": f"Bearer {token}"
                }
                response = requests.get(
                    "https://api.twitch.tv/helix/streams",
                    headers=headers,
                    params={"first": 20}
                )
                data = response.json()
                streams = data.get("data", [])
                
                self.root.after(0, lambda: self.display_streams(streams))
                self.root.after(0, lambda: self.status_label.config(
                    text=f"✓ Loaded {len(streams)} live streams"
                ))
            except Exception as e:
                self.root.after(0, lambda: self.status_label.config(
                    text=f"❌ Error: {str(e)}"
                ))
        
        threading.Thread(target=fetch, daemon=True).start()
    
    def display_streams(self, streams):
        """Display streams in the grid"""
        # Clear existing cards
        for widget in self.stream_grid.winfo_children():
            widget.destroy()
        
        # Create stream cards
        for stream in streams:
            self.create_stream_card(stream)
    
    def search_streams(self):
        """Search streams by game/category"""
        query = self.search_var.get().strip()
        if not query:
            self.load_top_streams()
            return
        
        self.status_label.config(text=f"Searching for '{query}'...")
        self.root.update()
        
        def fetch():
            token = self.get_access_token()
            if not token:
                return
            
            try:
                headers = {
                    "Client-Id": self.client_id,
                    "Authorization": f"Bearer {token}"
                }
                response = requests.get(
                    "https://api.twitch.tv/helix/search/categories",
                    headers=headers,
                    params={"query": query, "first": 1}
                )
                data = response.json()
                categories = data.get("data", [])
                
                if categories:
                    game_id = categories[0]["id"]
                    streams_response = requests.get(
                        "https://api.twitch.tv/helix/streams",
                        headers=headers,
                        params={"game_id": game_id, "first": 20}
                    )
                    streams = streams_response.json().get("data", [])
                    
                    self.root.after(0, lambda: self.display_streams(streams))
                    self.root.after(0, lambda: self.status_label.config(
                        text=f"✓ Found {len(streams)} streams for '{query}'"
                    ))
                else:
                    self.root.after(0, lambda: self.status_label.config(
                        text=f"No results for '{query}'"
                    ))
            except Exception as e:
                self.root.after(0, lambda: self.status_label.config(
                    text=f"❌ Error: {str(e)}"
                ))
        
        threading.Thread(target=fetch, daemon=True).start()
    
    # ══════════════════════════════════════════════════════
    # STREAM ACTIONS
    # ══════════════════════════════════════════════════════
    
    def watch_stream(self, stream_data):
        """Open stream in browser"""
        user_name = stream_data.get("user_login", stream_data.get("user_name", ""))
        url = f"https://www.twitch.tv/{user_name}"
        webbrowser.open(url)
        self.status_label.config(text=f"Opening stream: {user_name}")
    
    def add_to_multi_stream(self, stream_data):
        """Add stream to multi-stream queue"""
        if len(self.selected_streams) >= 6:
            messagebox.showwarning(
                "Multi-Stream Limit",
                "Maximum 6 streams can be added to multi-stream view"
            )
            return
        
        if stream_data not in self.selected_streams:
            self.selected_streams.append(stream_data)
            count = len(self.selected_streams)
            self.multi_stream_btn.config(text=f"🎯 Multi-Stream ({count})")
            self.status_label.config(
                text=f"✓ Added {stream_data.get('user_name')} to multi-stream ({count}/6)"
            )
    
    def open_multi_stream(self):
        """Open multi-stream view in browser"""
        if not self.selected_streams:
            messagebox.showinfo(
                "Multi-Stream",
                "Add streams using the + button on stream cards"
            )
            return
        
        # Build multitwitch URL
        usernames = [s.get("user_login", s.get("user_name", "")) for s in self.selected_streams]
        url = f"https://multistre.am/{'/'.join(usernames)}"
        webbrowser.open(url)
        self.status_label.config(text=f"Opening multi-stream with {len(usernames)} streams")
    
    def go_live(self):
        """Open Twitch broadcast dashboard"""
        webbrowser.open("https://www.twitch.tv/broadcast/dashboard")
        self.status_label.config(text="Opening Twitch dashboard...")
    
    def download_clips(self):
        """Download clips (placeholder)"""
        messagebox.showinfo(
            "Clip Downloader",
            "Clip download feature coming soon!\nThis will automatically download top clips from your favorites."
        )
    
    def apply_filter(self, filter_text):
        """Apply category filter"""
        self.status_label.config(text=f"Filtering by: {filter_text}")
        # Implement actual filtering logic here
    
    # ══════════════════════════════════════════════════════
    # SETTINGS
    # ══════════════════════════════════════════════════════
    
    def save_settings(self):
        """Save settings to config"""
        self.client_id = self.client_id_entry.get().strip()
        self.client_secret = self.client_secret_entry.get().strip()
        
        self.config["twitch_client_id"] = self.client_id
        self.config["twitch_client_secret"] = self.client_secret
        
        self.save_config()
        self.access_token = None  # Reset token
        
        messagebox.showinfo("Settings Saved", "API credentials saved successfully!")
        self.load_top_streams()  # Reload streams with new credentials
    
    # ══════════════════════════════════════════════════════
    # UTILITIES
    # ══════════════════════════════════════════════════════
    
    def format_number(self, num):
        """Format large numbers (1.2K, 3.4M, etc)"""
        if num >= 1_000_000:
            return f"{num/1_000_000:.1f}M"
        elif num >= 1_000:
            return f"{num/1_000:.1f}K"
        else:
            return str(num)

if __name__ == "__main__":
    root = tk.Tk()
    app = StreamHub(root)
    root.mainloop()
