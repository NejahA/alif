import tkinter as tk
from tkinter import ttk, messagebox, colorchooser
import random
import colorsys

class ColorPicker:
    def __init__(self, root):
        self.root = root
        self.root.title("Color Picker & Palette Generator")
        self.root.geometry("900x700")
        self.root.configure(bg="#1e1e1e")
        
        self.current_color = "#3498db"
        self.palette_colors = []
        self.saved_palettes = []
        
        self.setup_ui()
        self.update_color_display()
    
    def setup_ui(self):
        # Title
        title_frame = tk.Frame(self.root, bg="#2c3e50", height=70)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        tk.Label(title_frame, text="🎨 Color Picker & Palette Generator", 
                font=("Arial", 20, "bold"),
                bg="#2c3e50", fg="#ecf0f1").pack(pady=20)
        
        # Main content
        content_frame = tk.Frame(self.root, bg="#1e1e1e")
        content_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Left side - Color picker
        left_frame = tk.Frame(content_frame, bg="#2d2d2d")
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        
        # Color display
        tk.Label(left_frame, text="Current Color", font=("Arial", 12, "bold"),
                bg="#2d2d2d", fg="#ecf0f1").pack(pady=10)
        
        self.color_display = tk.Canvas(left_frame, width=300, height=200, 
                                      bg=self.current_color, highlightthickness=2,
                                      highlightbackground="#555555")
        self.color_display.pack(pady=10)
        
        # Color values
        values_frame = tk.LabelFrame(left_frame, text="Color Values", 
                                    font=("Arial", 10, "bold"),
                                    bg="#2d2d2d", fg="#ecf0f1")
        values_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # HEX
        hex_frame = tk.Frame(values_frame, bg="#2d2d2d")
        hex_frame.pack(fill=tk.X, padx=10, pady=5)
        tk.Label(hex_frame, text="HEX:", font=("Arial", 10), 
                bg="#2d2d2d", fg="#ecf0f1", width=8).pack(side=tk.LEFT)
        self.hex_entry = tk.Entry(hex_frame, font=("Courier", 11), width=15)
        self.hex_entry.pack(side=tk.LEFT, padx=5)
        self.hex_entry.bind('<Return>', lambda e: self.set_color_from_hex())
        tk.Button(hex_frame, text="📋", command=lambda: self.copy_value(self.hex_entry.get()),
                 font=("Arial", 10)).pack(side=tk.LEFT, padx=2)
        
        # RGB
        rgb_frame = tk.Frame(values_frame, bg="#2d2d2d")
        rgb_frame.pack(fill=tk.X, padx=10, pady=5)
        tk.Label(rgb_frame, text="RGB:", font=("Arial", 10),
                bg="#2d2d2d", fg="#ecf0f1", width=8).pack(side=tk.LEFT)
        self.rgb_entry = tk.Entry(rgb_frame, font=("Courier", 11), width=15)
        self.rgb_entry.pack(side=tk.LEFT, padx=5)
        tk.Button(rgb_frame, text="📋", command=lambda: self.copy_value(self.rgb_entry.get()),
                 font=("Arial", 10)).pack(side=tk.LEFT, padx=2)
        
        # HSL
        hsl_frame = tk.Frame(values_frame, bg="#2d2d2d")
        hsl_frame.pack(fill=tk.X, padx=10, pady=5)
        tk.Label(hsl_frame, text="HSL:", font=("Arial", 10),
                bg="#2d2d2d", fg="#ecf0f1", width=8).pack(side=tk.LEFT)
        self.hsl_entry = tk.Entry(hsl_frame, font=("Courier", 11), width=15)
        self.hsl_entry.pack(side=tk.LEFT, padx=5)
        tk.Button(hsl_frame, text="📋", command=lambda: self.copy_value(self.hsl_entry.get()),
                 font=("Arial", 10)).pack(side=tk.LEFT, padx=2)
        
        # Color sliders
        sliders_frame = tk.LabelFrame(left_frame, text="Adjust Color",
                                     font=("Arial", 10, "bold"),
                                     bg="#2d2d2d", fg="#ecf0f1")
        sliders_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # Red
        tk.Label(sliders_frame, text="Red:", bg="#2d2d2d", fg="#ff6b6b",
                font=("Arial", 9, "bold")).pack(anchor=tk.W, padx=10, pady=(5,0))
        self.red_var = tk.IntVar(value=52)
        self.red_slider = tk.Scale(sliders_frame, from_=0, to=255, orient=tk.HORIZONTAL,
                                   variable=self.red_var, command=self.update_from_sliders,
                                   bg="#2d2d2d", fg="#ecf0f1", highlightthickness=0,
                                   troughcolor="#ff6b6b")
        self.red_slider.pack(fill=tk.X, padx=10)
        
        # Green
        tk.Label(sliders_frame, text="Green:", bg="#2d2d2d", fg="#51cf66",
                font=("Arial", 9, "bold")).pack(anchor=tk.W, padx=10, pady=(5,0))
        self.green_var = tk.IntVar(value=152)
        self.green_slider = tk.Scale(sliders_frame, from_=0, to=255, orient=tk.HORIZONTAL,
                                     variable=self.green_var, command=self.update_from_sliders,
                                     bg="#2d2d2d", fg="#ecf0f1", highlightthickness=0,
                                     troughcolor="#51cf66")
        self.green_slider.pack(fill=tk.X, padx=10)
        
        # Blue
        tk.Label(sliders_frame, text="Blue:", bg="#2d2d2d", fg="#4dabf7",
                font=("Arial", 9, "bold")).pack(anchor=tk.W, padx=10, pady=(5,0))
        self.blue_var = tk.IntVar(value=219)
        self.blue_slider = tk.Scale(sliders_frame, from_=0, to=255, orient=tk.HORIZONTAL,
                                    variable=self.blue_var, command=self.update_from_sliders,
                                    bg="#2d2d2d", fg="#ecf0f1", highlightthickness=0,
                                    troughcolor="#4dabf7")
        self.blue_slider.pack(fill=tk.X, padx=10, pady=(0,10))
        
        # Action buttons
        btn_frame = tk.Frame(left_frame, bg="#2d2d2d")
        btn_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Button(btn_frame, text="🎨 Pick Color", command=self.pick_color,
                 bg="#9b59b6", fg="white", font=("Arial", 10, "bold")).pack(fill=tk.X, pady=2)
        tk.Button(btn_frame, text="🎲 Random Color", command=self.random_color,
                 bg="#3498db", fg="white", font=("Arial", 10, "bold")).pack(fill=tk.X, pady=2)
        tk.Button(btn_frame, text="➕ Add to Palette", command=self.add_to_palette,
                 bg="#27ae60", fg="white", font=("Arial", 10, "bold")).pack(fill=tk.X, pady=2)
        
        # Right side - Palette generator
        right_frame = tk.Frame(content_frame, bg="#2d2d2d")
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=5)
        
        tk.Label(right_frame, text="Palette Generator", font=("Arial", 12, "bold"),
                bg="#2d2d2d", fg="#ecf0f1").pack(pady=10)
        
        # Generator buttons
        gen_frame = tk.Frame(right_frame, bg="#2d2d2d")
        gen_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Button(gen_frame, text="Complementary", command=lambda: self.generate_palette("complementary"),
                 bg="#e74c3c", fg="white", font=("Arial", 9)).grid(row=0, column=0, padx=2, pady=2, sticky="ew")
        tk.Button(gen_frame, text="Analogous", command=lambda: self.generate_palette("analogous"),
                 bg="#f39c12", fg="white", font=("Arial", 9)).grid(row=0, column=1, padx=2, pady=2, sticky="ew")
        tk.Button(gen_frame, text="Triadic", command=lambda: self.generate_palette("triadic"),
                 bg="#9b59b6", fg="white", font=("Arial", 9)).grid(row=1, column=0, padx=2, pady=2, sticky="ew")
        tk.Button(gen_frame, text="Monochromatic", command=lambda: self.generate_palette("monochromatic"),
                 bg="#3498db", fg="white", font=("Arial", 9)).grid(row=1, column=1, padx=2, pady=2, sticky="ew")
        tk.Button(gen_frame, text="Shades", command=lambda: self.generate_palette("shades"),
                 bg="#34495e", fg="white", font=("Arial", 9)).grid(row=2, column=0, padx=2, pady=2, sticky="ew")
        tk.Button(gen_frame, text="Tints", command=lambda: self.generate_palette("tints"),
                 bg="#ecf0f1", fg="black", font=("Arial", 9)).grid(row=2, column=1, padx=2, pady=2, sticky="ew")
        
        gen_frame.columnconfigure(0, weight=1)
        gen_frame.columnconfigure(1, weight=1)
        
        # Current palette
        palette_frame = tk.LabelFrame(right_frame, text="Current Palette",
                                     font=("Arial", 10, "bold"),
                                     bg="#2d2d2d", fg="#ecf0f1")
        palette_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.palette_canvas = tk.Canvas(palette_frame, bg="#1e1e1e", 
                                       highlightthickness=0, height=300)
        self.palette_canvas.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.palette_canvas.bind('<Button-1>', self.palette_click)
        
        # Palette actions
        palette_actions = tk.Frame(right_frame, bg="#2d2d2d")
        palette_actions.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Button(palette_actions, text="📋 Copy All HEX", command=self.copy_palette_hex,
                 bg="#16a085", fg="white", font=("Arial", 9)).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        tk.Button(palette_actions, text="💾 Save Palette", command=self.save_palette,
                 bg="#27ae60", fg="white", font=("Arial", 9)).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        tk.Button(palette_actions, text="🗑️ Clear", command=self.clear_palette,
                 bg="#e74c3c", fg="white", font=("Arial", 9)).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)
        
        # Status bar
        self.status_label = tk.Label(self.root, text="Ready", bd=1, relief=tk.SUNKEN,
                                     anchor=tk.W, bg="#34495e", fg="#ecf0f1")
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)
    
    def hex_to_rgb(self, hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def rgb_to_hex(self, r, g, b):
        return f'#{r:02x}{g:02x}{b:02x}'
    
    def rgb_to_hsl(self, r, g, b):
        h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)
        return int(h * 360), int(s * 100), int(l * 100)
    
    def update_color_display(self):
        r = self.red_var.get()
        g = self.green_var.get()
        b = self.blue_var.get()
        
        self.current_color = self.rgb_to_hex(r, g, b)
        self.color_display.config(bg=self.current_color)
        
        # Update text entries
        self.hex_entry.delete(0, tk.END)
        self.hex_entry.insert(0, self.current_color.upper())
        
        self.rgb_entry.delete(0, tk.END)
        self.rgb_entry.insert(0, f"rgb({r}, {g}, {b})")
        
        h, s, l = self.rgb_to_hsl(r, g, b)
        self.hsl_entry.delete(0, tk.END)
        self.hsl_entry.insert(0, f"hsl({h}, {s}%, {l}%)")
    
    def update_from_sliders(self, event=None):
        self.update_color_display()
    
    def set_color_from_hex(self):
        hex_color = self.hex_entry.get().strip()
        if not hex_color.startswith('#'):
            hex_color = '#' + hex_color
        
        try:
            r, g, b = self.hex_to_rgb(hex_color)
            self.red_var.set(r)
            self.green_var.set(g)
            self.blue_var.set(b)
            self.update_color_display()
        except:
            messagebox.showerror("Error", "Invalid HEX color")
    
    def pick_color(self):
        color = colorchooser.askcolor(initialcolor=self.current_color)
        if color[1]:
            r, g, b = self.hex_to_rgb(color[1])
            self.red_var.set(r)
            self.green_var.set(g)
            self.blue_var.set(b)
            self.update_color_display()
            self.status_label.config(text=f"Color picked: {color[1]}")
    
    def random_color(self):
        r = random.randint(0, 255)
        g = random.randint(0, 255)
        b = random.randint(0, 255)
        
        self.red_var.set(r)
        self.green_var.set(g)
        self.blue_var.set(b)
        self.update_color_display()
        self.status_label.config(text="Random color generated")
    
    def add_to_palette(self):
        if len(self.palette_colors) >= 10:
            messagebox.showinfo("Info", "Palette is full (max 10 colors)")
            return
        
        self.palette_colors.append(self.current_color)
        self.draw_palette()
        self.status_label.config(text=f"Added {self.current_color} to palette")
    
    def generate_palette(self, scheme):
        r = self.red_var.get()
        g = self.green_var.get()
        b = self.blue_var.get()
        
        h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)
        
        self.palette_colors = [self.current_color]
        
        if scheme == "complementary":
            # Opposite on color wheel
            h2 = (h + 0.5) % 1.0
            r2, g2, b2 = colorsys.hls_to_rgb(h2, l, s)
            self.palette_colors.append(self.rgb_to_hex(int(r2*255), int(g2*255), int(b2*255)))
            
        elif scheme == "analogous":
            # Adjacent colors on wheel
            for offset in [-0.083, 0.083]:  # ±30 degrees
                h2 = (h + offset) % 1.0
                r2, g2, b2 = colorsys.hls_to_rgb(h2, l, s)
                self.palette_colors.append(self.rgb_to_hex(int(r2*255), int(g2*255), int(b2*255)))
                
        elif scheme == "triadic":
            # 120 degrees apart
            for offset in [0.333, 0.666]:
                h2 = (h + offset) % 1.0
                r2, g2, b2 = colorsys.hls_to_rgb(h2, l, s)
                self.palette_colors.append(self.rgb_to_hex(int(r2*255), int(g2*255), int(b2*255)))
                
        elif scheme == "monochromatic":
            # Same hue, different lightness
            for l2 in [0.2, 0.4, 0.6, 0.8]:
                r2, g2, b2 = colorsys.hls_to_rgb(h, l2, s)
                self.palette_colors.append(self.rgb_to_hex(int(r2*255), int(g2*255), int(b2*255)))
                
        elif scheme == "shades":
            # Darker versions
            for i in range(1, 5):
                l2 = max(0, l - i * 0.15)
                r2, g2, b2 = colorsys.hls_to_rgb(h, l2, s)
                self.palette_colors.append(self.rgb_to_hex(int(r2*255), int(g2*255), int(b2*255)))
                
        elif scheme == "tints":
            # Lighter versions
            for i in range(1, 5):
                l2 = min(1, l + i * 0.15)
                r2, g2, b2 = colorsys.hls_to_rgb(h, l2, s)
                self.palette_colors.append(self.rgb_to_hex(int(r2*255), int(g2*255), int(b2*255)))
        
        self.draw_palette()
        self.status_label.config(text=f"Generated {scheme} palette")
    
    def draw_palette(self):
        self.palette_canvas.delete("all")
        
        if not self.palette_colors:
            self.palette_canvas.create_text(250, 150, text="No colors in palette",
                                           fill="#7f8c8d", font=("Arial", 12))
            return
        
        width = self.palette_canvas.winfo_width()
        if width <= 1:
            width = 500
        
        color_width = width // len(self.palette_colors)
        
        for i, color in enumerate(self.palette_colors):
            x1 = i * color_width
            x2 = x1 + color_width
            
            # Draw color block
            self.palette_canvas.create_rectangle(x1, 0, x2, 200, fill=color, outline="")
            
            # Draw hex text
            self.palette_canvas.create_text(x1 + color_width//2, 220, 
                                           text=color.upper(),
                                           fill="#ecf0f1", font=("Courier", 9, "bold"))
    
    def palette_click(self, event):
        if not self.palette_colors:
            return
        
        width = self.palette_canvas.winfo_width()
        color_width = width // len(self.palette_colors)
        index = event.x // color_width
        
        if 0 <= index < len(self.palette_colors):
            color = self.palette_colors[index]
            r, g, b = self.hex_to_rgb(color)
            self.red_var.set(r)
            self.green_var.set(g)
            self.blue_var.set(b)
            self.update_color_display()
            self.status_label.config(text=f"Selected: {color}")
    
    def copy_value(self, value):
        try:
            import pyperclip
            pyperclip.copy(value)
            self.status_label.config(text=f"Copied: {value}")
        except:
            self.root.clipboard_clear()
            self.root.clipboard_append(value)
            self.status_label.config(text=f"Copied: {value}")
    
    def copy_palette_hex(self):
        if not self.palette_colors:
            messagebox.showinfo("Info", "No colors in palette")
            return
        
        hex_list = ", ".join(self.palette_colors)
        self.copy_value(hex_list)
    
    def save_palette(self):
        if not self.palette_colors:
            messagebox.showinfo("Info", "No colors to save")
            return
        
        self.saved_palettes.append(self.palette_colors.copy())
        messagebox.showinfo("Success", f"Palette saved! Total saved: {len(self.saved_palettes)}")
        self.status_label.config(text=f"Palette saved ({len(self.saved_palettes)} total)")
    
    def clear_palette(self):
        if self.palette_colors:
            self.palette_colors = []
            self.draw_palette()
            self.status_label.config(text="Palette cleared")

if __name__ == "__main__":
    root = tk.Tk()
    app = ColorPicker(root)
    root.mainloop()
