import customtkinter as ctk
from audio_engine import AudioEngine

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title("Cancel - Audio Engine")
        self.geometry("600x750")
        
        self.audio_engine = AudioEngine()
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)
        
        self.create_widgets()
        self.populate_devices()
        
    def create_widgets(self):
        # Main Frame
        self.main_frame = ctk.CTkFrame(self)
        self.main_frame.grid(row=0, column=0, padx=20, pady=20, sticky="nsew")
        self.main_frame.grid_columnconfigure(0, weight=1)
        
        # Audio Devices Section
        self.lbl_devices = ctk.CTkLabel(self.main_frame, text="Audio Routing", font=ctk.CTkFont(size=18, weight="bold"))
        self.lbl_devices.grid(row=0, column=0, pady=(20, 10), sticky="w", padx=20)
        
        self.input_var = ctk.StringVar(value="Select Input")
        self.output_var = ctk.StringVar(value="Select Output")
        
        self.opt_input = ctk.CTkOptionMenu(self.main_frame, variable=self.input_var, dynamic_resizing=False, width=350)
        self.opt_input.grid(row=1, column=0, pady=5, padx=20, sticky="w")
        
        self.opt_output = ctk.CTkOptionMenu(self.main_frame, variable=self.output_var, dynamic_resizing=False, width=350)
        self.opt_output.grid(row=2, column=0, pady=5, padx=20, sticky="w")
        
        self.btn_toggle = ctk.CTkButton(self.main_frame, text="Start Engine", command=self.toggle_engine, fg_color="green", hover_color="darkgreen")
        self.btn_toggle.grid(row=3, column=0, pady=15, padx=20, sticky="w")
        
        self.lbl_status = ctk.CTkLabel(self.main_frame, text="Status: Stopped", text_color="gray")
        self.lbl_status.grid(row=3, column=1, pady=15, sticky="w")
        
        # System Wide Audio Guide
        guide_text = "To filter System, Youtube, & Spotify audio:\n1. Install VB-Cable free software.\n2. Set Windows' Default Playback Device to 'CABLE Input'.\n3. Set this App's Select Input to 'CABLE Output'.\n4. Set this App's Select Output to your actual Speakers."
        self.lbl_guide = ctk.CTkLabel(self.main_frame, text=guide_text, text_color="turquoise", justify="left")
        self.lbl_guide.grid(row=4, column=0, columnspan=2, padx=20, pady=5, sticky="w")
        
        # Features Section
        self.lbl_fx = ctk.CTkLabel(self.main_frame, text="Effects & Processing", font=ctk.CTkFont(size=18, weight="bold"))
        self.lbl_fx.grid(row=5, column=0, pady=(20, 10), sticky="w", padx=20)
        
        # Noise Cancellation
        self.switch_nc = ctk.CTkSwitch(self.main_frame, text="AI Noise Cancellation", command=self.toggle_nc)
        self.switch_nc.grid(row=6, column=0, pady=10, padx=20, sticky="w")
        
        # Volume
        self.lbl_vol = ctk.CTkLabel(self.main_frame, text="Volume Gain")
        self.lbl_vol.grid(row=7, column=0, sticky="w", padx=20)
        self.slider_vol = ctk.CTkSlider(self.main_frame, from_=0.0, to=2.0, command=self.update_vol)
        self.slider_vol.set(1.0)
        self.slider_vol.grid(row=8, column=0, pady=(0, 20), padx=20, sticky="ew")
        
        # EQ Section
        self.lbl_eq = ctk.CTkLabel(self.main_frame, text="Equalizer (Bass / Mid / Treble)")
        self.lbl_eq.grid(row=9, column=0, sticky="w", padx=20)
        
        self.eq_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        self.eq_frame.grid(row=10, column=0, padx=20, pady=10, sticky="ew")
        self.eq_frame.grid_columnconfigure((0,1,2), weight=1)
        
        self.slider_low = ctk.CTkSlider(self.eq_frame, from_=-12, to=12, orientation="vertical", command=lambda v: self.update_eq("low", v))
        self.slider_low.set(0)
        self.slider_low.grid(row=0, column=0, pady=5)
        self.lbl_low = ctk.CTkLabel(self.eq_frame, text="Bass")
        self.lbl_low.grid(row=1, column=0)
        
        self.slider_mid = ctk.CTkSlider(self.eq_frame, from_=-12, to=12, orientation="vertical", command=lambda v: self.update_eq("mid", v))
        self.slider_mid.set(0)
        self.slider_mid.grid(row=0, column=1, pady=5)
        self.lbl_mid = ctk.CTkLabel(self.eq_frame, text="Mid")
        self.lbl_mid.grid(row=1, column=1)
        
        self.slider_high = ctk.CTkSlider(self.eq_frame, from_=-12, to=12, orientation="vertical", command=lambda v: self.update_eq("high", v))
        self.slider_high.set(0)
        self.slider_high.grid(row=0, column=2, pady=5)
        self.lbl_high = ctk.CTkLabel(self.eq_frame, text="Treble")
        self.lbl_high.grid(row=1, column=2)
        
    def populate_devices(self):
        inputs, outputs = self.audio_engine.get_devices()
        
        self.inputs_map = {f"{d['index']}: {d['name']}": d['index'] for d in inputs}
        self.outputs_map = {f"{d['index']}: {d['name']}": d['index'] for d in outputs}
        
        if self.inputs_map:
            names = list(self.inputs_map.keys())
            self.opt_input.configure(values=names)
            self.opt_input.set(names[0])
            
        if self.outputs_map:
            names = list(self.outputs_map.keys())
            self.opt_output.configure(values=names)
            self.opt_output.set(names[0])

    def toggle_engine(self):
        if not self.audio_engine.is_running:
            # Start
            in_name = self.input_var.get()
            out_name = self.output_var.get()
            
            if in_name in self.inputs_map and out_name in self.outputs_map:
                in_idx = self.inputs_map[in_name]
                out_idx = self.outputs_map[out_name]
                
                self.audio_engine.set_devices(in_idx, out_idx)
                success, msg = self.audio_engine.start()
                
                if success:
                    self.btn_toggle.configure(text="Stop Engine", fg_color="red", hover_color="darkred")
                    self.lbl_status.configure(text="Status: Running", text_color="green")
                else:
                    self.lbl_status.configure(text=f"Error: {msg}", text_color="red")
        else:
            # Stop
            self.audio_engine.stop()
            self.btn_toggle.configure(text="Start Engine", fg_color="green", hover_color="darkgreen")
            self.lbl_status.configure(text="Status: Stopped", text_color="gray")

    def toggle_nc(self):
        state = self.switch_nc.get()
        self.audio_engine.dsp.noise_reduction_enabled = bool(state)
        
    def update_vol(self, val):
        self.audio_engine.dsp.volume_gain = float(val)

    def update_eq(self, band, val):
        self.audio_engine.dsp.update_eq(band, float(val))
        
    def on_closing(self):
        self.audio_engine.terminate()
        self.destroy()

if __name__ == "__main__":
    app = App()
    app.protocol("WM_DELETE_WINDOW", app.on_closing)
    app.mainloop()
