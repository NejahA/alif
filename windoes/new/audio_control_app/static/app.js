// Master Volume Control
let masterVolumeSlider = document.getElementById('masterVolume');
let masterVolumeValue = document.getElementById('masterVolumeValue');
let masterMuteBtn = document.getElementById('masterMute');

async function loadMasterVolume() {
    const response = await fetch('/api/master/volume');
    const data = await response.json();
    masterVolumeSlider.value = data.level;
    masterVolumeValue.textContent = data.level + '%';
    masterMuteBtn.textContent = data.muted ? '🔇' : '🔊';
    masterMuteBtn.classList.toggle('muted', data.muted);
}

masterVolumeSlider.addEventListener('input', async (e) => {
    const level = e.target.value;
    masterVolumeValue.textContent = level + '%';
    
    await fetch('/api/master/volume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: parseInt(level) })
    });
});

masterMuteBtn.addEventListener('click', async () => {
    const isMuted = masterMuteBtn.classList.contains('muted');
    
    await fetch('/api/master/mute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mute: !isMuted })
    });
    
    await loadMasterVolume();
});

// Sessions Control
async function loadSessions() {
    const response = await fetch('/api/sessions');
    const sessions = await response.json();
    
    const sessionsList = document.getElementById('sessionsList');
    sessionsList.innerHTML = '';
    
    if (sessions.length === 0) {
        sessionsList.innerHTML = '<p style="color: #999;">No active audio sessions</p>';
        return;
    }
    
    sessions.forEach(session => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-item';
        
        sessionDiv.innerHTML = `
            <div class="session-header">
                <div>
                    <div class="session-name">${session.name}</div>
                    <div class="session-pid">PID: ${session.pid}</div>
                </div>
            </div>
            <div class="volume-control">
                <button class="mute-btn session-mute" data-pid="${session.pid}">
                    ${session.muted ? '🔇' : '🔊'}
                </button>
                <input type="range" class="session-volume" data-pid="${session.pid}" 
                       min="0" max="100" value="${session.volume}">
                <span class="volume-value">${session.volume}%</span>
            </div>
        `;
        
        sessionsList.appendChild(sessionDiv);
    });
    
    // Add event listeners
    document.querySelectorAll('.session-volume').forEach(slider => {
        slider.addEventListener('input', async (e) => {
            const pid = e.target.dataset.pid;
            const level = e.target.value;
            e.target.nextElementSibling.textContent = level + '%';
            
            await fetch(`/api/sessions/${pid}/volume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level: parseInt(level) })
            });
        });
    });
    
    document.querySelectorAll('.session-mute').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const pid = e.target.dataset.pid;
            const isMuted = e.target.textContent.includes('🔇');
            
            await fetch(`/api/sessions/${pid}/mute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mute: !isMuted })
            });
            
            await loadSessions();
        });
    });
}

document.getElementById('refreshSessions').addEventListener('click', loadSessions);

// Devices
async function loadDevices() {
    const response = await fetch('/api/devices');
    const devices = await response.json();
    
    const devicesList = document.getElementById('devicesList');
    devicesList.innerHTML = '';
    
    if (devices.length === 0) {
        devicesList.innerHTML = '<p style="color: #999;">No devices found</p>';
        return;
    }
    
    devices.forEach(device => {
        const deviceDiv = document.createElement('div');
        deviceDiv.className = 'device-item';
        deviceDiv.innerHTML = `
            <div class="device-header">
                <div class="device-name">${device.name}</div>
            </div>
        `;
        devicesList.appendChild(deviceDiv);
    });
}

// Initialize
loadMasterVolume();
loadSessions();
loadDevices();

// Auto-refresh sessions every 5 seconds
setInterval(loadSessions, 5000);


// Solfeggio Frequencies
let currentFrequency = null;

async function loadSolfeggioFrequencies() {
    const response = await fetch('/api/solfeggio/frequencies');
    const frequencies = await response.json();
    
    const grid = document.getElementById('solfeggioFrequencies');
    grid.innerHTML = '';
    
    for (const [key, data] of Object.entries(frequencies)) {
        const card = document.createElement('div');
        card.className = 'frequency-card';
        card.style.setProperty('--freq-color', data.color);
        card.dataset.frequency = key;
        
        card.innerHTML = `
            <div class="frequency-value">${data.freq}</div>
            <div class="frequency-name">${data.name}</div>
            <div class="frequency-hz">Hz</div>
        `;
        
        card.addEventListener('click', () => toggleSolfeggio(key, card));
        grid.appendChild(card);
    }
}

async function toggleSolfeggio(frequency, cardElement) {
    if (currentFrequency === frequency) {
        // Stop current frequency
        await fetch('/api/solfeggio/stop', { method: 'POST' });
        currentFrequency = null;
        updateSolfeggioUI(null);
    } else {
        // Play new frequency
        const volume = document.getElementById('solfeggioVolume').value;
        
        const response = await fetch('/api/solfeggio/play', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frequency, volume: parseInt(volume) / 100 })
        });
        
        const result = await response.json();
        if (result.success) {
            currentFrequency = frequency;
            updateSolfeggioUI(frequency);
        }
    }
}

function updateSolfeggioUI(activeFrequency) {
    const cards = document.querySelectorAll('.frequency-card');
    const statusIndicator = document.getElementById('solfeggioStatus');
    
    cards.forEach(card => {
        if (card.dataset.frequency === activeFrequency) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    if (activeFrequency) {
        statusIndicator.classList.add('playing');
        statusIndicator.querySelector('.status-text').textContent = `Playing ${activeFrequency}Hz`;
    } else {
        statusIndicator.classList.remove('playing');
        statusIndicator.querySelector('.status-text').textContent = 'Stopped';
    }
}

document.getElementById('solfeggioVolume').addEventListener('input', async (e) => {
    const volume = e.target.value;
    document.getElementById('solfeggioVolumeValue').textContent = volume + '%';
    
    if (currentFrequency) {
        await fetch('/api/solfeggio/volume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ volume: parseInt(volume) })
        });
    }
});

async function loadSolfeggioStatus() {
    const response = await fetch('/api/solfeggio/status');
    const status = await response.json();
    
    if (status.playing && status.frequency) {
        currentFrequency = status.frequency;
        updateSolfeggioUI(status.frequency);
        document.getElementById('solfeggioVolume').value = status.volume;
        document.getElementById('solfeggioVolumeValue').textContent = status.volume + '%';
    }
}

// Initialize solfeggio
loadSolfeggioFrequencies();
loadSolfeggioStatus();

// Audio File Transformation
let uploadedFile = null;

document.getElementById('audioFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    uploadedFile = file;
    document.getElementById('fileName').textContent = `Selected: ${file.name}`;
    document.getElementById('processFile').disabled = false;
    
    // Show original audio preview
    const originalAudio = document.getElementById('originalAudio');
    originalAudio.src = URL.createObjectURL(file);
    
    updateProcessingStatus('ready', `Ready to process: ${file.name}`);
});

document.getElementById('processFile').addEventListener('click', async () => {
    if (!uploadedFile) return;
    
    const frequency = document.getElementById('transformFrequency').value;
    const intensity = document.getElementById('transformIntensity').value;
    
    // Upload file
    updateProcessingStatus('uploading', 'Uploading file...');
    
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
    try {
        const uploadResponse = await fetch('/api/file/upload', {
            method: 'POST',
            body: formData
        });
        
        const uploadResult = await uploadResponse.json();
        if (!uploadResult.success) {
            updateProcessingStatus('error', `Upload failed: ${uploadResult.error}`);
            return;
        }
        
        // Process file
        updateProcessingStatus('processing', `Processing with ${frequency}Hz solfeggio frequency...`);
        
        const processResponse = await fetch('/api/file/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                frequency: frequency,
                intensity: parseInt(intensity) / 100
            })
        });
        
        const processResult = await processResponse.json();
        if (!processResult.success) {
            updateProcessingStatus('error', `Processing failed: ${processResult.error}`);
            return;
        }
        
        // Enable download and show preview
        document.getElementById('downloadFile').disabled = false;
        document.getElementById('audioPreview').style.display = 'grid';
        
        // Load transformed audio preview
        const transformedAudio = document.getElementById('transformedAudio');
        transformedAudio.src = `/api/file/download?t=${Date.now()}`;
        
        updateProcessingStatus('complete', `✓ Processing complete! File ready for download.`);
        
    } catch (error) {
        updateProcessingStatus('error', `Error: ${error.message}`);
    }
});

document.getElementById('downloadFile').addEventListener('click', () => {
    window.location.href = '/api/file/download';
});

document.getElementById('transformIntensity').addEventListener('input', (e) => {
    const intensity = e.target.value;
    document.getElementById('transformIntensityValue').textContent = intensity + '%';
});

function updateProcessingStatus(state, message) {
    const statusIndicator = document.getElementById('processingStatus');
    const statusText = statusIndicator.querySelector('.status-text');
    
    statusIndicator.classList.remove('ready', 'uploading', 'processing', 'complete', 'error');
    statusIndicator.classList.add(state);
    statusText.textContent = message;
}


// Audio Transformation
let transformActive = false;

document.getElementById('startTransform').addEventListener('click', async () => {
    const frequency = document.getElementById('transformFrequency').value;
    const intensity = document.getElementById('transformIntensity').value;
    
    const response = await fetch('/api/transform/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            frequency: frequency,
            intensity: parseInt(intensity) / 100
        })
    });
    
    const result = await response.json();
    if (result.success) {
        transformActive = true;
        updateTransformUI(true);
    }
});

document.getElementById('stopTransform').addEventListener('click', async () => {
    await fetch('/api/transform/stop', { method: 'POST' });
    transformActive = false;
    updateTransformUI(false);
});

document.getElementById('transformIntensity').addEventListener('input', async (e) => {
    const intensity = e.target.value;
    document.getElementById('transformIntensityValue').textContent = intensity + '%';
    
    if (transformActive) {
        await fetch('/api/transform/intensity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intensity: parseInt(intensity) })
        });
    }
});

function updateTransformUI(active) {
    const statusIndicator = document.getElementById('transformStatus');
    const startBtn = document.getElementById('startTransform');
    const stopBtn = document.getElementById('stopTransform');
    const frequencySelect = document.getElementById('transformFrequency');
    
    if (active) {
        statusIndicator.classList.add('active');
        statusIndicator.querySelector('.status-text').textContent = 
            `Active - ${frequencySelect.options[frequencySelect.selectedIndex].text}`;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        frequencySelect.disabled = true;
    } else {
        statusIndicator.classList.remove('active');
        statusIndicator.querySelector('.status-text').textContent = 'Inactive';
        startBtn.disabled = false;
        stopBtn.disabled = true;
        frequencySelect.disabled = false;
    }
}

async function loadTransformStatus() {
    const response = await fetch('/api/transform/status');
    const status = await response.json();
    
    if (status.active) {
        transformActive = true;
        document.getElementById('transformIntensity').value = status.intensity;
        document.getElementById('transformIntensityValue').textContent = status.intensity + '%';
        updateTransformUI(true);
    }
}

// Initialize transform
loadTransformStatus();
