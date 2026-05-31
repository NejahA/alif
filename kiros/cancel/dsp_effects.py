import numpy as np
import scipy.signal as signal
import noisereduce as nr

class DSPEngine:
    def __init__(self, sample_rate=44100):
        self.sample_rate = sample_rate
        self.noise_reduction_enabled = False
        self.volume_gain = 1.0
        
        # EQ settings: Low, Mid, High gains (linear multiplier)
        self.eq_gains = {"low": 1.0, "mid": 1.0, "high": 1.0}
        
        # Design Filters (Butterworth)
        # Lowpass (bass) < 250 Hz
        nyquist = sample_rate / 2
        self.b_low, self.a_low = signal.butter(2, 250 / nyquist, btype='low')
        # Bandpass (mid) 250 Hz - 4000 Hz
        self.b_mid, self.a_mid = signal.butter(2, [250 / nyquist, 4000 / nyquist], btype='band')
        # Highpass (treble) > 4000 Hz
        self.b_high, self.a_high = signal.butter(2, 4000 / nyquist, btype='high')
        
        # Initialize filter states for continuous streaming to avoid clicks
        self.zi_low = np.zeros((max(len(self.b_low), len(self.a_low)) - 1,))
        self.zi_mid = np.zeros((max(len(self.b_mid), len(self.a_mid)) - 1,))
        self.zi_high = np.zeros((max(len(self.b_high), len(self.a_high)) - 1,))

    def process_chunk(self, data):
        # Noise Reduction
        if self.noise_reduction_enabled:
            # nr.reduce_noise processes the whole chunk
            data = nr.reduce_noise(y=data, sr=self.sample_rate, stationary=True)
            
        # Split into bands and apply gain
        low_band, self.zi_low = signal.lfilter(self.b_low, self.a_low, data, zi=self.zi_low)
        mid_band, self.zi_mid = signal.lfilter(self.b_mid, self.a_mid, data, zi=self.zi_mid)
        high_band, self.zi_high = signal.lfilter(self.b_high, self.a_high, data, zi=self.zi_high)
        
        data = (low_band * self.eq_gains["low"] + 
                mid_band * self.eq_gains["mid"] + 
                high_band * self.eq_gains["high"])
                
        # Volume
        data = data * self.volume_gain
        
        # Clip to avoid distortion when converting to float32 bounds (-1.0 to 1.0)
        data = np.clip(data, -1.0, 1.0)
        return data

    def update_eq(self, band, gain_db):
        """Update EQ from DB. 0 DB = 1.0 gain, +6 DB ~ 2.0, -6 DB ~ 0.5"""
        linear_gain = 10 ** (gain_db / 20.0)
        self.eq_gains[band] = linear_gain
