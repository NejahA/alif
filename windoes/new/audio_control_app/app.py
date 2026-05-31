from flask import Flask, render_template, jsonify, request, send_file
from ctypes import cast, POINTER
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume, ISimpleAudioVolume
import pythoncom
import numpy as np
import sounddevice as sd
import threading
import queue
import pyaudiowpatch as pyaudio
import librosa
import soundfile as sf
import os
from werkzeug.utils import secure_filename
import tempfile

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma'}

# Solfeggio frequencies
SOLFEGGIO_FREQUENCIES = {
    '396': {'freq': 396, 'name': 'Liberation from Fear', 'color': '#FF6B6B'},
    '417': {'freq': 417, 'name': 'Undoing Situations', 'color': '#FFA500'},
    '528': {'freq': 528, 'name': 'DNA Repair', 'color': '#FFD700'},
    '639': {'freq': 639, 'name': 'Relationships', 'color': '#90EE90'},
    '741': {'freq': 741, 'name': 'Awakening Intuition', 'color': '#87CEEB'},
    '852': {'freq': 852, 'name': 'Spiritual Order', 'color': '#9370DB'},
    '963': {'freq': 963, 'name': 'Divine Consciousness', 'color': '#DDA0DD'}
}

# Musical note frequencies for reference (A4 = 440Hz standard)
NOTE_FREQUENCIES = {
    'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
    'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
    'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
}

# Global state for solfeggio playback
solfeggio_state = {
    'playing': False,
    'frequency': None,
    'volume': 0.3,
    'stream': None,
    'thread': None
}

# Global state for audio transformation
transform_state = {
    'active': False,
    'target_frequency': 528,
    'intensity': 0.5,
    'pyaudio_instance': None,
    'input_stream': None,
    'output_stream': None,
    'thread': None,
    'audio_queue': None
}

# File processing state
file_processing = {
    'original_file': None,
    'transformed_file': None,
    'processing': False
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_master_volume():
    pythoncom.CoInitialize()
    devices = AudioUtilities.GetSpeakers()
    interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
    volume = cast(interface, POINTER(IAudioEndpointVolume))
    return volume

def get_all_sessions():
    pythoncom.CoInitialize()
    sessions = AudioUtilities.GetAllSessions()
    return sessions

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/master/volume', methods=['GET', 'POST'])
def master_volume():
    volume = get_master_volume()
    
    if request.method == 'POST':
        data = request.json
        level = float(data.get('level', 0)) / 100.0
        volume.SetMasterVolumeLevelScalar(level, None)
    
    current = volume.GetMasterVolumeLevelScalar()
    mute = volume.GetMute()
    
    return jsonify({
        'level': int(current * 100),
        'muted': bool(mute)
    })

@app.route('/api/master/mute', methods=['POST'])
def master_mute():
    volume = get_master_volume()
    data = request.json
    mute_state = data.get('mute', False)
    volume.SetMute(mute_state, None)
    
    return jsonify({'muted': mute_state})

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    sessions = get_all_sessions()
    session_list = []
    
    for session in sessions:
        if session.Process:
            volume = session.SimpleAudioVolume
            session_list.append({
                'pid': session.Process.pid,
                'name': session.Process.name(),
                'volume': int(volume.GetMasterVolume() * 100),
                'muted': bool(volume.GetMute())
            })
    
    return jsonify(session_list)

@app.route('/api/sessions/<int:pid>/volume', methods=['POST'])
def set_session_volume(pid):
    sessions = get_all_sessions()
    data = request.json
    level = float(data.get('level', 0)) / 100.0
    
    for session in sessions:
        if session.Process and session.Process.pid == pid:
            volume = session.SimpleAudioVolume
            volume.SetMasterVolume(level, None)
            return jsonify({'success': True})
    
    return jsonify({'success': False, 'error': 'Session not found'}), 404

@app.route('/api/sessions/<int:pid>/mute', methods=['POST'])
def set_session_mute(pid):
    sessions = get_all_sessions()
    data = request.json
    mute_state = data.get('mute', False)
    
    for session in sessions:
        if session.Process and session.Process.pid == pid:
            volume = session.SimpleAudioVolume
            volume.SetMute(mute_state, None)
            return jsonify({'success': True})
    
    return jsonify({'success': False, 'error': 'Session not found'}), 404

@app.route('/api/devices', methods=['GET'])
def get_devices():
    pythoncom.CoInitialize()
    devices = []
    
    # Get all audio devices
    all_devices = AudioUtilities.GetAllDevices()
    
    for device in all_devices:
        devices.append({
            'id': device.id,
            'name': device.FriendlyName
        })
    
    return jsonify(devices)

def generate_solfeggio_tone(frequency, duration, sample_rate=44100, volume=0.3):
    """Generate a solfeggio frequency tone"""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    tone = np.sin(frequency * 2 * np.pi * t) * volume
    return tone.astype(np.float32)

def play_solfeggio_continuous(frequency, volume):
    """Play solfeggio frequency continuously"""
    sample_rate = 44100
    duration = 1.0  # Generate 1 second chunks
    
    def callback(outdata, frames, time, status):
        if status:
            print(status)
        tone = generate_solfeggio_tone(frequency, duration, sample_rate, volume)
        outdata[:] = tone[:frames].reshape(-1, 1)
    
    try:
        stream = sd.OutputStream(
            samplerate=sample_rate,
            channels=1,
            callback=callback,
            blocksize=int(sample_rate * duration)
        )
        stream.start()
        solfeggio_state['stream'] = stream
        
        while solfeggio_state['playing']:
            sd.sleep(100)
        
        stream.stop()
        stream.close()
    except Exception as e:
        print(f"Error playing solfeggio: {e}")
        solfeggio_state['playing'] = False

@app.route('/api/solfeggio/frequencies', methods=['GET'])
def get_solfeggio_frequencies():
    """Get list of available solfeggio frequencies"""
    return jsonify(SOLFEGGIO_FREQUENCIES)

@app.route('/api/solfeggio/play', methods=['POST'])
def play_solfeggio():
    """Start playing a solfeggio frequency"""
    data = request.json
    freq_key = str(data.get('frequency', '528'))
    volume = float(data.get('volume', 0.3))
    
    if freq_key not in SOLFEGGIO_FREQUENCIES:
        return jsonify({'success': False, 'error': 'Invalid frequency'}), 400
    
    # Stop current playback if any
    if solfeggio_state['playing']:
        solfeggio_state['playing'] = False
        if solfeggio_state['thread']:
            solfeggio_state['thread'].join(timeout=2)
    
    # Start new playback
    frequency = SOLFEGGIO_FREQUENCIES[freq_key]['freq']
    solfeggio_state['playing'] = True
    solfeggio_state['frequency'] = freq_key
    solfeggio_state['volume'] = volume
    
    thread = threading.Thread(
        target=play_solfeggio_continuous,
        args=(frequency, volume),
        daemon=True
    )
    thread.start()
    solfeggio_state['thread'] = thread
    
    return jsonify({
        'success': True,
        'frequency': freq_key,
        'name': SOLFEGGIO_FREQUENCIES[freq_key]['name']
    })

@app.route('/api/solfeggio/stop', methods=['POST'])
def stop_solfeggio():
    """Stop playing solfeggio frequency"""
    solfeggio_state['playing'] = False
    solfeggio_state['frequency'] = None
    
    if solfeggio_state['stream']:
        try:
            solfeggio_state['stream'].stop()
            solfeggio_state['stream'].close()
        except:
            pass
        solfeggio_state['stream'] = None
    
    return jsonify({'success': True})

@app.route('/api/solfeggio/status', methods=['GET'])
def get_solfeggio_status():
    """Get current solfeggio playback status"""
    return jsonify({
        'playing': solfeggio_state['playing'],
        'frequency': solfeggio_state['frequency'],
        'volume': int(solfeggio_state['volume'] * 100)
    })

@app.route('/api/solfeggio/volume', methods=['POST'])
def set_solfeggio_volume():
    """Adjust solfeggio volume"""
    data = request.json
    volume = float(data.get('volume', 30)) / 100.0
    solfeggio_state['volume'] = volume
    
    # Restart playback with new volume if currently playing
    if solfeggio_state['playing'] and solfeggio_state['frequency']:
        freq_key = solfeggio_state['frequency']
        solfeggio_state['playing'] = False
        if solfeggio_state['thread']:
            solfeggio_state['thread'].join(timeout=2)
        
        frequency = SOLFEGGIO_FREQUENCIES[freq_key]['freq']
        solfeggio_state['playing'] = True
        
        thread = threading.Thread(
            target=play_solfeggio_continuous,
            args=(frequency, volume),
            daemon=True
        )
        thread.start()
        solfeggio_state['thread'] = thread
    
    return jsonify({'success': True, 'volume': int(volume * 100)})

def calculate_pitch_shift_semitones(target_freq):
    """Calculate pitch shift in semitones to align with solfeggio frequency"""
    # Find the closest musical note to the target frequency
    reference_freq = 440.0  # A4
    
    # Calculate semitones from A4 to target frequency
    semitones = 12 * np.log2(target_freq / reference_freq)
    
    # Round to nearest semitone for musical alignment
    return round(semitones)

def apply_solfeggio_pitch_shift(audio_data, target_freq, intensity, sample_rate=44100):
    """Apply pitch shifting to align audio with solfeggio frequency"""
    if len(audio_data) == 0 or np.all(audio_data == 0):
        return audio_data
    
    try:
        # Calculate pitch shift in semitones
        n_steps = calculate_pitch_shift_semitones(target_freq)
        
        # Apply pitch shifting using librosa
        # Adjust shift amount based on intensity
        shift_amount = n_steps * intensity
        
        # Pitch shift the audio
        shifted = librosa.effects.pitch_shift(
            audio_data.astype(np.float32),
            sr=sample_rate,
            n_steps=shift_amount
        )
        
        # Add subtle solfeggio carrier wave for enhancement
        t = np.linspace(0, len(audio_data) / sample_rate, len(audio_data), False)
        carrier = np.sin(2 * np.pi * target_freq * t) * 0.05 * intensity
        
        # Mix original, shifted, and carrier
        mixed = (
            audio_data * (1 - intensity) +  # Original
            shifted * intensity +            # Pitch-shifted
            carrier                          # Solfeggio carrier
        )
        
        # Normalize to prevent clipping
        max_val = np.max(np.abs(mixed))
        if max_val > 0:
            mixed = mixed / max_val * 0.95
        
        return mixed.astype(np.float32)
    
    except Exception as e:
        print(f"Error in pitch shift: {e}")
        return audio_data

def audio_transform_loop():
    """Real-time audio transformation loop using microphone input"""
    try:
        # Initialize PyAudio
        p = pyaudio.PyAudio()
        transform_state['pyaudio_instance'] = p
        
        # List available input devices
        print("\n=== Available Input Devices ===")
        for i in range(p.get_device_count()):
            info = p.get_device_info_by_index(i)
            if info['maxInputChannels'] > 0:
                print(f"Device {i}: {info['name']} (Channels: {info['maxInputChannels']})")
        
        # Get default input device (microphone)
        default_input = p.get_default_input_device_info()
        
        sample_rate = int(default_input["defaultSampleRate"])
        channels = min(2, default_input["maxInputChannels"])  # Use stereo if available, else mono
        chunk_size = 4096
        
        audio_queue = queue.Queue(maxsize=10)
        transform_state['audio_queue'] = audio_queue
        
        def input_callback(in_data, frame_count, time_info, status):
            if transform_state['active']:
                audio_queue.put(in_data)
            return (in_data, pyaudio.paContinue)
        
        # Open input stream (microphone)
        input_stream = p.open(
            format=pyaudio.paInt16,
            channels=channels,
            rate=sample_rate,
            input=True,
            frames_per_buffer=chunk_size,
            input_device_index=default_input["index"],
            stream_callback=input_callback
        )
        
        # Open output stream (speakers)
        output_stream = p.open(
            format=pyaudio.paInt16,
            channels=channels,
            rate=sample_rate,
            output=True,
            frames_per_buffer=chunk_size
        )
        
        transform_state['input_stream'] = input_stream
        transform_state['output_stream'] = output_stream
        
        input_stream.start_stream()
        
        print(f"\n🎤 Audio transform started - Input: {default_input['name']}")
        print(f"Sample rate: {sample_rate}Hz, Channels: {channels}")
        print(f"Target frequency: {transform_state['target_frequency']}Hz")
        print(f"Intensity: {int(transform_state['intensity'] * 100)}%\n")
        
        while transform_state['active']:
            try:
                # Get audio data from queue
                in_data = audio_queue.get(timeout=1)
                
                # Convert bytes to numpy array
                audio_array = np.frombuffer(in_data, dtype=np.int16)
                
                # Convert to float32 for processing
                audio_float = audio_array.astype(np.float32) / 32768.0
                
                # Process each channel separately if stereo
                if channels == 2:
                    left = audio_float[0::2]
                    right = audio_float[1::2]
                    
                    # Apply transformation
                    left_transformed = apply_solfeggio_pitch_shift(
                        left,
                        transform_state['target_frequency'],
                        transform_state['intensity'],
                        sample_rate
                    )
                    right_transformed = apply_solfeggio_pitch_shift(
                        right,
                        transform_state['target_frequency'],
                        transform_state['intensity'],
                        sample_rate
                    )
                    
                    # Interleave channels
                    transformed = np.empty(len(audio_float), dtype=np.float32)
                    transformed[0::2] = left_transformed
                    transformed[1::2] = right_transformed
                else:
                    # Mono processing
                    transformed = apply_solfeggio_pitch_shift(
                        audio_float,
                        transform_state['target_frequency'],
                        transform_state['intensity'],
                        sample_rate
                    )
                
                # Convert back to int16
                output_array = (transformed * 32767).astype(np.int16)
                
                # Play transformed audio
                output_stream.write(output_array.tobytes())
                
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Error processing audio: {e}")
                continue
        
        # Cleanup
        input_stream.stop_stream()
        input_stream.close()
        output_stream.close()
        p.terminate()
        
        print("🛑 Audio transform stopped")
        
    except Exception as e:
        print(f"❌ Error in audio transform loop: {e}")
        import traceback
        traceback.print_exc()
        transform_state['active'] = False

@app.route('/api/transform/start', methods=['POST'])
def start_transform():
    """Start real-time audio transformation from microphone input"""
    data = request.json
    freq_key = str(data.get('frequency', '528'))
    intensity = float(data.get('intensity', 0.5))
    
    if freq_key not in SOLFEGGIO_FREQUENCIES:
        return jsonify({'success': False, 'error': 'Invalid frequency'}), 400
    
    # Stop current transformation if any
    if transform_state['active']:
        transform_state['active'] = False
        if transform_state['thread']:
            transform_state['thread'].join(timeout=3)
    
    # Start new transformation
    transform_state['active'] = True
    transform_state['target_frequency'] = SOLFEGGIO_FREQUENCIES[freq_key]['freq']
    transform_state['intensity'] = intensity
    
    thread = threading.Thread(
        target=audio_transform_loop,
        daemon=True
    )
    thread.start()
    transform_state['thread'] = thread
    
    return jsonify({
        'success': True,
        'frequency': freq_key,
        'intensity': intensity,
        'message': f'Transforming microphone input to {SOLFEGGIO_FREQUENCIES[freq_key]["freq"]}Hz'
    })

@app.route('/api/transform/stop', methods=['POST'])
def stop_transform():
    """Stop audio transformation"""
    transform_state['active'] = False
    
    # Wait for thread to finish
    if transform_state['thread']:
        transform_state['thread'].join(timeout=3)
    
    # Cleanup
    if transform_state['input_stream']:
        try:
            transform_state['input_stream'].stop_stream()
            transform_state['input_stream'].close()
        except:
            pass
        transform_state['input_stream'] = None
    
    if transform_state['output_stream']:
        try:
            transform_state['output_stream'].close()
        except:
            pass
        transform_state['output_stream'] = None
    
    if transform_state['pyaudio_instance']:
        try:
            transform_state['pyaudio_instance'].terminate()
        except:
            pass
        transform_state['pyaudio_instance'] = None
    
    return jsonify({'success': True})

@app.route('/api/transform/status', methods=['GET'])
def get_transform_status():
    """Get transformation status"""
    return jsonify({
        'active': transform_state['active'],
        'frequency': transform_state['target_frequency'],
        'intensity': int(transform_state['intensity'] * 100)
    })

@app.route('/api/transform/intensity', methods=['POST'])
def set_transform_intensity():
    """Adjust transformation intensity"""
    data = request.json
    intensity = float(data.get('intensity', 50)) / 100.0
    transform_state['intensity'] = intensity
    
    return jsonify({'success': True, 'intensity': int(intensity * 100)})

@app.route('/api/file/upload', methods=['POST'])
def upload_file():
    """Upload audio file for processing"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'error': 'Invalid file type'}), 400
    
    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f'original_{filename}')
        file.save(filepath)
        
        file_processing['original_file'] = filepath
        
        return jsonify({
            'success': True,
            'filename': filename,
            'message': 'File uploaded successfully'
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/file/process', methods=['POST'])
def process_file():
    """Process uploaded audio file with solfeggio transformation"""
    if file_processing['processing']:
        return jsonify({'success': False, 'error': 'Already processing a file'}), 400
    
    if not file_processing['original_file']:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400
    
    data = request.json
    freq_key = str(data.get('frequency', '528'))
    intensity = float(data.get('intensity', 0.5))
    
    if freq_key not in SOLFEGGIO_FREQUENCIES:
        return jsonify({'success': False, 'error': 'Invalid frequency'}), 400
    
    file_processing['processing'] = True
    
    try:
        # Load audio file
        print(f"Loading audio file: {file_processing['original_file']}")
        audio_data, sample_rate = librosa.load(file_processing['original_file'], sr=None, mono=False)
        
        target_freq = SOLFEGGIO_FREQUENCIES[freq_key]['freq']
        
        print(f"Processing audio - Target: {target_freq}Hz, Intensity: {intensity}")
        
        # Process audio (handle both mono and stereo)
        if audio_data.ndim == 1:
            # Mono
            transformed = apply_solfeggio_pitch_shift(
                audio_data,
                target_freq,
                intensity,
                sample_rate
            )
        else:
            # Stereo
            left = audio_data[0]
            right = audio_data[1]
            
            left_transformed = apply_solfeggio_pitch_shift(
                left,
                target_freq,
                intensity,
                sample_rate
            )
            right_transformed = apply_solfeggio_pitch_shift(
                right,
                target_freq,
                intensity,
                sample_rate
            )
            
            transformed = np.array([left_transformed, right_transformed])
        
        # Save transformed audio
        original_filename = os.path.basename(file_processing['original_file'])
        output_filename = f'transformed_{freq_key}hz_{original_filename.replace("original_", "")}'
        output_filename = output_filename.rsplit('.', 1)[0] + '.wav'
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
        
        sf.write(output_path, transformed.T if transformed.ndim > 1 else transformed, sample_rate)
        
        file_processing['transformed_file'] = output_path
        file_processing['processing'] = False
        
        print(f"Processing complete: {output_path}")
        
        return jsonify({
            'success': True,
            'message': 'File processed successfully',
            'output_filename': output_filename
        })
    
    except Exception as e:
        file_processing['processing'] = False
        print(f"Error processing file: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/file/download', methods=['GET'])
def download_file():
    """Download transformed audio file"""
    if not file_processing['transformed_file']:
        return jsonify({'success': False, 'error': 'No transformed file available'}), 404
    
    try:
        return send_file(
            file_processing['transformed_file'],
            as_attachment=True,
            download_name=os.path.basename(file_processing['transformed_file'])
        )
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/file/status', methods=['GET'])
def get_file_status():
    """Get file processing status"""
    return jsonify({
        'processing': file_processing['processing'],
        'has_original': file_processing['original_file'] is not None,
        'has_transformed': file_processing['transformed_file'] is not None
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
