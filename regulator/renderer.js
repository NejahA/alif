// ============================
// Regulator — 440 Hz → 432 Hz
// Pitch conversion engine
// ============================

const TARGET_RATIO = 432 / 440; // 0.981818...
const PITCH_SHIFT_CENTS = 1200 * Math.log2(TARGET_RATIO); // ≈ -31.77

// DOM refs
const dropZone = document.getElementById('dropZone');
const selectBtn = document.getElementById('selectBtn');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeBtn = document.getElementById('removeBtn');
const convertBtn = document.getElementById('convertBtn');
const convertBtnText = document.getElementById('convertBtnText');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const previewBtn = document.getElementById('previewBtn');
const saveBtn = document.getElementById('saveBtn');
const statusMessage = document.getElementById('statusMessage');
const toast = document.getElementById('toast');
const canvas = document.getElementById('visualizer');

// State
let selectedFile = null;
let audioBuffer = null;
let convertedBuffer = null;
let isConverting = false;
let isPreviewing = false;
let previewSource = null;
let audioContext = null;
let analyserNode = null;
let animationFrame = null;

// ============================
// Audio Context (lazy init)
// ============================
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// ============================
// Toast notifications
// ==========================
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 3000);
}

// ============================
// Status messages
// ============================
function setStatus(msg, type = 'info') {
  statusMessage.textContent = msg;
  statusMessage.className = 'status-message ' + type;
  statusMessage.classList.remove('hidden');
}

function clearStatus() {
  statusMessage.classList.add('hidden');
  statusMessage.textContent = '';
}

// ============================
// File size formatting
// ============================
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// ============================
// File handling
// ============================
function handleFile(file) {
  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'audio/aac'];
  const validExts = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac'];
  const ext = '.' + file.name.split('.').pop().toLowerCase();

  if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
    showToast('Unsupported file format. Please use MP3, WAV, FLAC, OGG, or M4A.');
    return;
  }

  selectedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = formatSize(file.size);
  dropZone.classList.add('hidden');
  fileInfo.classList.remove('hidden');
  convertBtn.disabled = false;
  clearStatus();
  convertedBuffer = null;
  previewBtn.disabled = true;
  saveBtn.disabled = true;

  readAudioFile(file);
}

function readAudioFile(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const ctx = getAudioContext();
      const arrayBuffer = e.target.result;
      audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      showToast(`Loaded: ${file.name} (${audioBuffer.duration.toFixed(1)}s)`);
      visualizeBuffer(audioBuffer);
    } catch (err) {
      showToast('Failed to decode audio file.');
      console.error(err);
    }
  };
  reader.readAsArrayBuffer(file);
}

function resetFile() {
  selectedFile = null;
  audioBuffer = null;
  convertedBuffer = null;
  dropZone.classList.remove('hidden');
  fileInfo.classList.add('hidden');
  convertBtn.disabled = true;
  previewBtn.disabled = true;
  saveBtn.disabled = true;
  clearStatus();
  progressContainer.classList.add('hidden');
  stopPreview();
  clearCanvas();
}

// ============================
// Drag & Drop
// ============================
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});

selectBtn.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.mp3,.wav,.flac,.ogg,.m4a,.aac,audio/*';
  input.onchange = (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  };
  input.click();
});

removeBtn.addEventListener('click', resetFile);

// ============================
// Pitch shift: 440 → 432 Hz
// ============================
async function convertTo432Hz() {
  if (!audioBuffer || isConverting) return;

  isConverting = true;
  convertBtn.disabled = true;
  convertBtnText.textContent = 'Converting...';
  progressContainer.classList.remove('hidden');
  progressFill.style.width = '0%';
  progressText.textContent = '0%';
  clearStatus();
  previewBtn.disabled = true;
  saveBtn.disabled = true;

  try {
    const ctx = getAudioContext();
    const srcRate = audioBuffer.sampleRate;
    const numChannels = audioBuffer.numberOfChannels;
    const srcLength = audioBuffer.length;
    const srcDuration = srcLength / srcRate;

    // For pitch shift, we render at adjusted sample rate
    // To shift 440→432 (ratio 0.9818), we render at srcRate * 0.9818
    // then the buffer will be shorter but when played at original rate, pitch drops
    const targetRate = Math.round(srcRate * TARGET_RATIO);
    const targetLength = Math.round(srcLength * TARGET_RATIO);
    const targetDuration = targetLength / targetRate;

    const offlineCtx = new OfflineAudioContext(numChannels, targetLength, targetRate);

    // Create buffer source
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    // Apply playback rate to fine-tune
    source.playbackRate.value = TARGET_RATIO;

    source.connect(offlineCtx.destination);
    source.start(0);

    // Render
    const renderedBuffer = await offlineCtx.startRendering();

    // Simulate progress for UX
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress = Math.min(progress + 8, 90);
      progressFill.style.width = progress + '%';
      progressText.textContent = progress + '%';
    }, 100);

    // Wait a tick for UI update
    await new Promise(r => setTimeout(r, 200));

    clearInterval(progressInterval);
    progressFill.style.width = '100%';
    progressText.textContent = '100%';

    // Store converted buffer at original sample rate for playback
    // Resample back to original rate for consistent playback
    const resampledCtx = new OfflineAudioContext(numChannels, srcLength, srcRate);
    const resampleSource = resampledCtx.createBufferSource();
    resampleSource.buffer = renderedBuffer;
    resampleSource.connect(resampledCtx.destination);
    resampleSource.start(0);
    convertedBuffer = await resampledCtx.startRendering();

    setStatus('Conversion complete! Ready for preview or save.', 'success');
    previewBtn.disabled = false;
    saveBtn.disabled = false;
    convertBtnText.textContent = 'Convert to 432 Hz';
    showToast('✓ Successfully converted to 432 Hz');

    visualizeBuffer(convertedBuffer);
  } catch (err) {
    console.error('Conversion error:', err);
    setStatus('Conversion failed: ' + err.message, 'error');
    showToast('Conversion failed.');
    convertBtnText.textContent = 'Convert to 432 Hz';
  } finally {
    isConverting = false;
    convertBtn.disabled = false;
    setTimeout(() => {
      progressContainer.classList.add('hidden');
    }, 1500);
  }
}

convertBtn.addEventListener('click', convertTo432Hz);

// ============================
// Preview (playback)
// ============================
function playBuffer(buffer) {
  stopPreview();
  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);

  // Setup analyser
  analyserNode = ctx.createAnalyser();
  analyserNode.fftSize = 2048;
  source.connect(analyserNode);
  analyserNode.connect(ctx.destination);

  source.start(0);
  previewSource = source;
  isPreviewing = true;
  previewBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
    Stop
  `;

  source.onended = () => {
    isPreviewing = false;
    previewBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
      Preview
    `;
    previewSource = null;
    stopVisualizer();
  };

  startVisualizer();
}

function stopPreview() {
  if (previewSource) {
    try { previewSource.stop(); } catch (_) {}
    previewSource = null;
  }
  isPreviewing = false;
  previewBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
    Preview
  `;
  stopVisualizer();
}

previewBtn.addEventListener('click', () => {
  if (isPreviewing) {
    stopPreview();
  } else if (convertedBuffer) {
    playBuffer(convertedBuffer);
  }
});

// ============================
// Visualizer
// ============================
function startVisualizer() {
  if (!analyserNode || !canvas) return;
  const ctx = canvas.getContext('2d');
  const W = (canvas.width = canvas.parentElement.clientWidth);
  const H = (canvas.height = canvas.parentElement.clientHeight);
  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

  function draw() {
    if (!isPreviewing) return;
    animationFrame = requestAnimationFrame(draw);
    analyserNode.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#a78bfa';
    ctx.beginPath();

    const sliceWidth = W / dataArray.length;
    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * H) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();
  }
  draw();
}

function stopVisualizer() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

function visualizeBuffer(buffer) {
  // Draw a static waveform
  const ctx = canvas.getContext('2d');
  const W = (canvas.width = canvas.parentElement.clientWidth);
  const H = (canvas.height = canvas.parentElement.clientHeight);
  const data = buffer.getChannelData(0);
  const step = Math.max(1, Math.floor(data.length / W));

  ctx.clearRect(0, 0, W, H);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.3)';
  ctx.beginPath();

  for (let x = 0; x < W; x++) {
    const i = Math.floor(x * step);
    const y = ((data[i] + 1) / 2) * H;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function clearCanvas() {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Resize observer for canvas
window.addEventListener('resize', () => {
  if (convertedBuffer) visualizeBuffer(convertedBuffer);
});

// ============================
// Save converted audio as WAV
// ============================
function bufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  // Interleave channels
  let interleaved;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    interleaved = new Float32Array(left.length * 2);
    for (let i = 0; i < left.length; i++) {
      interleaved[i * 2] = left[i];
      interleaved[i * 2 + 1] = right[i];
    }
  } else {
    interleaved = buffer.getChannelData(0);
  }

  const length = interleaved.length;
  const dataLength = length * (bitDepth / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;
  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < length; i++) {
    let sample = Math.max(-1, Math.min(1, interleaved[i]));
    sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset, sample, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// ============================
// Save / Download
// ============================
saveBtn.addEventListener('click', () => {
  if (!convertedBuffer) return;

  const blob = bufferToWav(convertedBuffer);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const baseName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'audio';
  a.download = `${baseName}_432hz.wav`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('File saved successfully');
});

// ============================
// Init
// ============================
clearCanvas();
console.log(`Regulator ready. Pitch shift: ${PITCH_SHIFT_CENTS.toFixed(2)} cents`);