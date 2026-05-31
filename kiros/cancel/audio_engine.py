import pyaudio
import numpy as np
import threading
from dsp_effects import DSPEngine

class AudioEngine:
    def __init__(self):
        self.p = pyaudio.PyAudio()
        self.chunk_size = 2048 # Larger chunk for better NR performance
        self.sample_rate = 44100
        self.dsp = DSPEngine(sample_rate=self.sample_rate)
        self.stream = None
        self.is_running = False
        self.thread = None
        
        self.input_device_index = None
        self.output_device_index = None
        
    def get_devices(self):
        inputs = []
        outputs = []
        for i in range(self.p.get_device_count()):
            dev_info = self.p.get_device_info_by_index(i)
            name = dev_info.get('name')
            
            if dev_info.get('maxInputChannels') > 0:
                inputs.append({"index": i, "name": name})
            if dev_info.get('maxOutputChannels') > 0:
                outputs.append({"index": i, "name": name})
        return inputs, outputs
        
    def set_devices(self, input_idx, output_idx):
        self.input_device_index = input_idx
        self.output_device_index = output_idx
        
    def start(self):
        if self.is_running:
            return
            
        try:
            self.stream = self.p.open(format=pyaudio.paFloat32,
                                    channels=1,
                                    rate=self.sample_rate,
                                    input=True,
                                    output=True,
                                    input_device_index=self.input_device_index,
                                    output_device_index=self.output_device_index,
                                    frames_per_buffer=self.chunk_size)
            self.is_running = True
            self.thread = threading.Thread(target=self._process_loop)
            self.thread.daemon = True
            self.thread.start()
            return True, "Started successfully"
        except Exception as e:
            self.is_running = False
            return False, str(e)
            
    def stop(self):
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=1.0)
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None
            
    def _process_loop(self):
        while self.is_running:
            try:
                # Read audio
                in_data = self.stream.read(self.chunk_size, exception_on_overflow=False)
                audio_np = np.frombuffer(in_data, dtype=np.float32)
                
                # DSP Processing
                out_np = self.dsp.process_chunk(audio_np)
                
                # Write audio
                out_data = out_np.astype(np.float32).tobytes()
                self.stream.write(out_data)
            except Exception as e:
                print(f"Stream error: {e}")
                
    def terminate(self):
        self.stop()
        self.p.terminate()
