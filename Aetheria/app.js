// AETHERIA // Cyberpunk Web Audio API Engine & Visualizer Workstation
const { ipcRenderer } = require('electron');

// --- Global Audio & Workstation State ---
let audioCtx = null;
let masterGain = null;
let masterAnalyser = null;
let delayNode = null;
let delayFeedback = null;
let destStreamNode = null;

// Sequencer State
let isPlayingSeq = false;
let seqTimerId = null;
let currentStep = 0;
let bpm = 120;
let swingPercent = 0;

// Presets Definition
const PRESETS = {
  cyberpunk: {
    wave: 'sawtooth',
    cutoff: 3800,
    reso: 5.0,
    attack: 0.03,
    decay: 0.35,
    sustain: 0.5,
    release: 0.7,
    bpm: 124,
    rain: 0.2,
    space: 0.3,
    pattern: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      clap: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      synthperc: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0]
    }
  },
  synthwave: {
    wave: 'square',
    cutoff: 2400,
    reso: 3.0,
    attack: 0.08,
    decay: 0.4,
    sustain: 0.7,
    release: 1.2,
    bpm: 110,
    vinyl: 0.25,
    rain: 0.1,
    pattern: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      synthperc: [0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0]
    }
  },
  ambient: {
    wave: 'sine',
    cutoff: 1200,
    reso: 1.5,
    attack: 0.4,
    decay: 1.2,
    sustain: 0.8,
    release: 2.5,
    bpm: 85,
    space: 0.6,
    rain: 0.4,
    pattern: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      hihat: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
      clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      synthperc: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
    }
  },
  lofi: {
    wave: 'triangle',
    cutoff: 1800,
    reso: 2.0,
    attack: 0.05,
    decay: 0.3,
    sustain: 0.6,
    release: 0.9,
    bpm: 78,
    vinyl: 0.5,
    city: 0.3,
    pattern: {
      kick: [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
      clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      synthperc: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0]
    }
  },
  industrial: {
    wave: 'sawtooth',
    cutoff: 6500,
    reso: 9.0,
    attack: 0.01,
    decay: 0.2,
    sustain: 0.4,
    release: 0.4,
    bpm: 135,
    city: 0.5,
    space: 0.2,
    pattern: {
      kick: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      clap: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      synthperc: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0]
    }
  }
};

let activePattern = JSON.parse(JSON.stringify(PRESETS.cyberpunk.pattern));
let trackMutes = { kick: false, snare: false, hihat: false, clap: false, synthperc: false };

// Synth Parameters
let currentOctave = 4;
let synthWaveform = 'sawtooth';
let synthCutoff = 3200;
let synthReso = 4.0;
let synthAttack = 0.05;
let synthDecay = 0.3;
let synthSustain = 0.6;
let synthRelease = 0.8;
let delayTimeVal = 0.3;
let delayFeedbackVal = 0.4;

// Ambient Noise Generators
let ambientNodes = { rain: null, space: null, city: null, vinyl: null };
let ambientGains = { rain: null, space: null, city: null, vinyl: null };

// Visualizer State
let visMode = 'spectrum';
let animFrameId = null;
let particles = [];

// Media Recorder State
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let recStartTime = 0;
let recTimerInterval = null;

// --- Initialize Audio Context & Engine ---
function initAudio() {
  if (audioCtx) return;
  
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioCtx();

  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.8, audioCtx.currentTime);

  masterAnalyser = audioCtx.createAnalyser();
  masterAnalyser.fftSize = 512;
  masterAnalyser.smoothingTimeConstant = 0.8;

  // Delay FX Loop
  delayNode = audioCtx.createDelay();
  delayNode.delayTime.setValueAtTime(delayTimeVal, audioCtx.currentTime);

  delayFeedback = audioCtx.createGain();
  delayFeedback.gain.setValueAtTime(delayFeedbackVal, audioCtx.currentTime);

  delayNode.connect(delayFeedback);
  delayFeedback.connect(delayNode);

  // Connect Audio Graph
  delayNode.connect(masterGain);
  masterGain.connect(masterAnalyser);
  masterAnalyser.connect(audioCtx.destination);

  // Create Stream Destination for Recorder
  destStreamNode = audioCtx.createMediaStreamDestination();
  masterGain.connect(destStreamNode);

  initAmbientGenerators();
}

function ensureAudioStarted() {
  if (!audioCtx) initAudio();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// --- Synthesizer Voice Engine ---
function playSynthNote(freq) {
  ensureAudioStarted();

  const osc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const voiceGain = audioCtx.createGain();

  osc.type = synthWaveform;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(synthCutoff, audioCtx.currentTime);
  filter.Q.setValueAtTime(synthReso, audioCtx.currentTime);

  // Envelope ADSR
  const now = audioCtx.currentTime;
  voiceGain.gain.setValueAtTime(0, now);
  voiceGain.gain.linearRampToValueAtTime(0.7, now + synthAttack);
  voiceGain.gain.exponentialRampToValueAtTime(Math.max(0.001, 0.7 * synthSustain), now + synthAttack + synthDecay);

  // Release
  const noteDuration = synthAttack + synthDecay + 0.2;
  voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + noteDuration + synthRelease);

  // Connections
  osc.connect(filter);
  filter.connect(voiceGain);
  voiceGain.connect(masterGain);
  voiceGain.connect(delayNode);

  osc.start(now);
  osc.stop(now + noteDuration + synthRelease + 0.1);
}

// --- Procedural Drum Synthesizers ---
function triggerDrum(trackName) {
  ensureAudioStarted();
  if (trackMutes[trackName]) return;

  const now = audioCtx.currentTime;

  if (trackName === 'kick') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.3);
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  } 
  else if (trackName === 'snare') {
    // Noise buffer
    const bufferSize = audioCtx.sampleRate * 0.2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, now);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    // Osc tone
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    noise.start(now);
    noise.stop(now + 0.2);
    osc.start(now);
    osc.stop(now + 0.1);
  } 
  else if (trackName === 'hihat') {
    const bufferSize = audioCtx.sampleRate * 0.08;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(now);
    noise.stop(now + 0.08);
  }
  else if (trackName === 'clap') {
    const bufferSize = audioCtx.sampleRate * 0.25;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(now);
    noise.stop(now + 0.22);
  }
  else if (trackName === 'synthperc') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

// Quick SFX Trigger
function triggerSFX(type) {
  ensureAudioStarted();
  const now = audioCtx.currentTime;

  if (type === 'laser') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === 'subdrop') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 1.2);
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.2);
  } else if (type === 'riser') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 1.0);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.6, now + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.0);
  } else if (type === 'glitch') {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        playSynthNote(400 + Math.random() * 800);
      }, i * 40);
    }
  }
}

// --- Procedural Ambient Generators ---
function initAmbientGenerators() {
  const rainBuffer = createWhiteNoiseBuffer();
  
  // Rain
  const rainSource = audioCtx.createBufferSource();
  rainSource.buffer = rainBuffer;
  rainSource.loop = true;
  const rainFilter = audioCtx.createBiquadFilter();
  rainFilter.type = 'lowpass';
  rainFilter.frequency.setValueAtTime(1200, audioCtx.currentTime);
  ambientGains.rain = audioCtx.createGain();
  ambientGains.rain.gain.setValueAtTime(0, audioCtx.currentTime);

  rainSource.connect(rainFilter);
  rainFilter.connect(ambientGains.rain);
  ambientGains.rain.connect(masterGain);
  rainSource.start();

  // Space Cabin
  const spaceOsc = audioCtx.createOscillator();
  spaceOsc.type = 'sine';
  spaceOsc.frequency.setValueAtTime(55, audioCtx.currentTime);
  ambientGains.space = audioCtx.createGain();
  ambientGains.space.gain.setValueAtTime(0, audioCtx.currentTime);

  spaceOsc.connect(ambientGains.space);
  ambientGains.space.connect(masterGain);
  spaceOsc.start();

  // Cyber City Rumble
  const citySource = audioCtx.createBufferSource();
  citySource.buffer = rainBuffer;
  citySource.loop = true;
  const cityFilter = audioCtx.createBiquadFilter();
  cityFilter.type = 'bandpass';
  cityFilter.frequency.setValueAtTime(220, audioCtx.currentTime);
  ambientGains.city = audioCtx.createGain();
  ambientGains.city.gain.setValueAtTime(0, audioCtx.currentTime);

  citySource.connect(cityFilter);
  cityFilter.connect(ambientGains.city);
  ambientGains.city.connect(masterGain);
  citySource.start();

  // Vinyl Crackle
  const vinylSource = audioCtx.createBufferSource();
  vinylSource.buffer = rainBuffer;
  vinylSource.loop = true;
  const vinylFilter = audioCtx.createBiquadFilter();
  vinylFilter.type = 'highpass';
  vinylFilter.frequency.setValueAtTime(4000, audioCtx.currentTime);
  ambientGains.vinyl = audioCtx.createGain();
  ambientGains.vinyl.gain.setValueAtTime(0, audioCtx.currentTime);

  vinylSource.connect(vinylFilter);
  vinylFilter.connect(ambientGains.vinyl);
  ambientGains.vinyl.connect(masterGain);
  vinylSource.start();
}

function createWhiteNoiseBuffer() {
  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function updateAmbientVolume(type, val) {
  ensureAudioStarted();
  if (ambientGains[type]) {
    ambientGains[type].gain.setTargetAtTime(val, audioCtx.currentTime, 0.05);
  }
}

// --- Sequencer Timer & Clock ---
function toggleSequencer() {
  isPlayingSeq = !isPlayingSeq;
  const playBtn = document.getElementById('btn-play-seq');

  if (isPlayingSeq) {
    playBtn.textContent = '⏸ PAUSE';
    playBtn.style.background = 'var(--primary-magenta)';
    currentStep = 0;
    scheduleNextStep();
  } else {
    playBtn.textContent = '▶ PLAY';
    playBtn.style.background = '';
    if (seqTimerId) clearTimeout(seqTimerId);
    clearStepHighlights();
  }
}

function scheduleNextStep() {
  if (!isPlayingSeq) return;

  // Trigger drum sounds for current step
  Object.keys(activePattern).forEach(track => {
    if (activePattern[track][currentStep] === 1) {
      triggerDrum(track);
    }
  });

  // Highlight active UI step
  highlightStepUI(currentStep);

  // Calculate step interval with BPM and Swing
  const stepTimeBase = (60 / bpm) / 4 * 1000;
  let delay = stepTimeBase;
  if (currentStep % 2 === 1 && swingPercent > 0) {
    delay += stepTimeBase * (swingPercent / 100);
  }

  currentStep = (currentStep + 1) % 16;
  seqTimerId = setTimeout(scheduleNextStep, delay);
}

function highlightStepUI(stepIdx) {
  clearStepHighlights();
  document.querySelectorAll(`.step-btn[data-step="${stepIdx}"]`).forEach(btn => {
    btn.classList.add('playing');
  });
}

function clearStepHighlights() {
  document.querySelectorAll('.step-btn').forEach(btn => btn.classList.remove('playing'));
}

// Render Sequencer Grid UI
function buildSequencerGridUI() {
  document.querySelectorAll('.seq-track').forEach(trackEl => {
    const trackName = trackEl.getAttribute('data-track');
    const container = trackEl.querySelector('.step-buttons');
    container.innerHTML = '';

    for (let i = 0; i < 16; i++) {
      const btn = document.createElement('button');
      btn.className = 'step-btn';
      btn.setAttribute('data-step', i);
      if (activePattern[trackName][i] === 1) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {
        activePattern[trackName][i] = activePattern[trackName][i] === 1 ? 0 : 1;
        btn.classList.toggle('active');
      });

      container.appendChild(btn);
    }

    // Mute button handler
    const muteBtn = trackEl.querySelector('.m-btn');
    muteBtn.addEventListener('click', () => {
      trackMutes[trackName] = !trackMutes[trackName];
      muteBtn.classList.toggle('active', trackMutes[trackName]);
    });
  });
}

// --- Interactive Piano Keyboard UI ---
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const KEY_MAP = {
  'a': 0,  // C
  'w': 1,  // C#
  's': 2,  // D
  'e': 3,  // D#
  'd': 4,  // E
  'f': 5,  // F
  't': 6,  // F#
  'g': 7,  // G
  'y': 8,  // G#
  'h': 9,  // A
  'u': 10, // A#
  'j': 11, // B
  'k': 12  // C (next octave)
};

function noteToFreq(noteIndex, octave) {
  // A4 = 440 Hz -> note 57
  const absoluteNote = (octave + 1) * 12 + noteIndex;
  return 440 * Math.pow(2, (absoluteNote - 69) / 12);
}

function buildPianoKeyboard() {
  const container = document.getElementById('piano-keyboard');
  container.innerHTML = '';

  // Render 13 keys (1 full octave + 1 note)
  for (let i = 0; i <= 12; i++) {
    const noteName = NOTE_NAMES[i % 12];
    const isBlack = noteName.includes('#');
    const keyEl = document.createElement('div');

    keyEl.className = `key ${isBlack ? 'black' : 'white'}`;
    keyEl.setAttribute('data-note-idx', i);

    // Key hint label
    const keyBinding = Object.keys(KEY_MAP).find(k => KEY_MAP[k] === i);
    if (keyBinding) {
      keyEl.innerHTML = `<span class="key-label">${keyBinding.toUpperCase()}</span>`;
    }

    // Position black keys over white keys
    if (isBlack) {
      // Calculate position percentage
      const whiteCountBefore = NOTE_NAMES.slice(0, i).filter(n => !n.includes('#')).length;
      keyEl.style.left = `calc(${(whiteCountBefore / 8) * 100}% - 1.75%)`;
    }

    keyEl.addEventListener('mousedown', () => triggerKeyNote(i, keyEl));
    keyEl.addEventListener('touchstart', (e) => {
      e.preventDefault();
      triggerKeyNote(i, keyEl);
    });

    container.appendChild(keyEl);
  }
}

function triggerKeyNote(noteIdx, keyEl) {
  const freq = noteToFreq(noteIdx, currentOctave);
  playSynthNote(freq);

  if (keyEl) {
    keyEl.classList.add('active');
    setTimeout(() => keyEl.classList.remove('active'), 200);
  }
}

// --- Dynamic Canvas Audio Visualizer ---
function initVisualizer() {
  const canvas = document.getElementById('vis-canvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize Particles
  particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      color: Math.random() > 0.5 ? '#00f3ff' : '#ff007f'
    });
  }

  function renderFrame() {
    animFrameId = requestAnimationFrame(renderFrame);

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (!masterAnalyser) {
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const bufferLength = masterAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    if (visMode === 'spectrum') {
      masterAnalyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
        grad.addColorStop(0, '#00f3ff');
        grad.addColorStop(0.5, '#ff007f');
        grad.addColorStop(1, '#ffaa00');

        ctx.fillStyle = grad;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    } 
    else if (visMode === 'particles') {
      masterAnalyser.getByteFrequencyData(dataArray);
      let avgFreq = 0;
      for (let i = 0; i < bufferLength; i++) avgFreq += dataArray[i];
      avgFreq /= bufferLength;

      const energyFactor = 1 + (avgFreq / 255) * 2;

      particles.forEach(p => {
        p.x += p.vx * energyFactor;
        p.y += p.vy * energyFactor;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * energyFactor, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }
    else if (visMode === 'cybergrid') {
      masterAnalyser.getByteFrequencyData(dataArray);
      const bassVal = dataArray[5] || 0;

      ctx.strokeStyle = `rgba(0, 243, 255, ${0.2 + (bassVal / 255) * 0.5})`;
      ctx.lineWidth = 1;

      const horizonY = height * 0.4;
      const step = 30;

      // Perspective Grid Lines
      for (let x = -width; x < width * 2; x += step * 2) {
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(width / 2, horizonY);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = horizonY; y < height; y += (y - horizonY + 5) * 0.3) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    else if (visMode === 'oscilloscope') {
      masterAnalyser.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00f3ff';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00f3ff';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  renderFrame();
}

// --- Preset Switcher ---
function applyPreset(presetName) {
  const p = PRESETS[presetName];
  if (!p) return;

  synthWaveform = p.wave;
  synthCutoff = p.cutoff;
  synthReso = p.reso;
  synthAttack = p.attack;
  synthDecay = p.decay;
  synthSustain = p.sustain;
  synthRelease = p.release;
  bpm = p.bpm;

  activePattern = JSON.parse(JSON.stringify(p.pattern));

  // Update UI Elements
  document.getElementById('param-cutoff').value = synthCutoff;
  document.getElementById('val-cutoff').textContent = `${synthCutoff} Hz`;
  document.getElementById('param-reso').value = synthReso;
  document.getElementById('val-reso').textContent = synthReso;
  document.getElementById('param-attack').value = synthAttack;
  document.getElementById('val-attack').textContent = `${synthAttack}s`;
  document.getElementById('param-decay').value = synthDecay;
  document.getElementById('val-decay').textContent = `${synthDecay}s`;
  document.getElementById('param-sustain').value = synthSustain;
  document.getElementById('val-sustain').textContent = synthSustain;
  document.getElementById('param-release').value = synthRelease;
  document.getElementById('val-release').textContent = `${synthRelease}s`;
  document.getElementById('seq-bpm').value = bpm;
  document.getElementById('bpm-val').textContent = `${bpm} BPM`;
  document.getElementById('bpm-display').textContent = bpm;

  document.querySelectorAll('.wave-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-wave') === synthWaveform);
  });

  // Reset ambient sliders
  ['rain', 'space', 'city', 'vinyl'].forEach(key => {
    const val = p[key] || 0;
    document.getElementById(`amb-${key}`).value = val;
    document.getElementById(`val-amb-${key}`).textContent = `${Math.round(val * 100)}%`;
    updateAmbientVolume(key, val);
  });

  buildSequencerGridUI();
}

// --- Live Audio Recording Engine ---
function toggleAudioRecording() {
  ensureAudioStarted();

  const recBtn = document.getElementById('btn-record');
  const recLabel = document.getElementById('rec-label');

  if (!isRecording) {
    recordedChunks = [];
    const stream = destStreamNode.stream;
    
    try {
      mediaRecorder = new MediaRecorder(stream);
    } catch (e) {
      console.error('MediaRecorder not supported:', e);
      return;
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = downloadRecordedAudio;

    mediaRecorder.start();
    isRecording = true;
    recBtn.classList.add('recording');
    recLabel.textContent = 'STOP';

    recStartTime = Date.now();
    recTimerInterval = setInterval(updateRecTimer, 1000);
  } else {
    mediaRecorder.stop();
    isRecording = false;
    recBtn.classList.remove('recording');
    recLabel.textContent = 'REC';
    clearInterval(recTimerInterval);
    document.getElementById('rec-timer').textContent = '00:00';
  }
}

function updateRecTimer() {
  const elapsedSec = Math.floor((Date.now() - recStartTime) / 1000);
  const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
  const secs = String(elapsedSec % 60).padStart(2, '0');
  document.getElementById('rec-timer').textContent = `${mins}:${secs}`;
}

function downloadRecordedAudio() {
  const blob = new Blob(recordedChunks, { type: 'audio/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `Aetheria_Jam_${Date.now()}.webm`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

// --- UI Event Listeners Setup ---
function setupEventListeners() {
  // Titlebar buttons
  document.getElementById('btn-min').addEventListener('click', () => ipcRenderer.send('window-minimize'));
  document.getElementById('btn-max').addEventListener('click', () => ipcRenderer.send('window-maximize'));
  document.getElementById('btn-close').addEventListener('click', () => ipcRenderer.send('window-close'));

  // Preset Select
  document.getElementById('preset-select').addEventListener('change', (e) => applyPreset(e.target.value));

  // Record Button
  document.getElementById('btn-record').addEventListener('click', toggleAudioRecording);

  // Visualizer Mode Buttons
  document.querySelectorAll('.vis-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vis-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      visMode = btn.getAttribute('data-mode');
    });
  });

  // Waveform Selectors
  document.querySelectorAll('.wave-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.wave-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      synthWaveform = btn.getAttribute('data-wave');
    });
  });

  // Synth Faders
  document.getElementById('param-cutoff').addEventListener('input', (e) => {
    synthCutoff = parseFloat(e.target.value);
    document.getElementById('val-cutoff').textContent = `${synthCutoff} Hz`;
  });
  document.getElementById('param-reso').addEventListener('input', (e) => {
    synthReso = parseFloat(e.target.value);
    document.getElementById('val-reso').textContent = synthReso;
  });
  document.getElementById('param-attack').addEventListener('input', (e) => {
    synthAttack = parseFloat(e.target.value);
    document.getElementById('val-attack').textContent = `${synthAttack}s`;
  });
  document.getElementById('param-decay').addEventListener('input', (e) => {
    synthDecay = parseFloat(e.target.value);
    document.getElementById('val-decay').textContent = `${synthDecay}s`;
  });
  document.getElementById('param-sustain').addEventListener('input', (e) => {
    synthSustain = parseFloat(e.target.value);
    document.getElementById('val-sustain').textContent = synthSustain;
  });
  document.getElementById('param-release').addEventListener('input', (e) => {
    synthRelease = parseFloat(e.target.value);
    document.getElementById('val-release').textContent = `${synthRelease}s`;
  });
  document.getElementById('param-delay-time').addEventListener('input', (e) => {
    delayTimeVal = parseFloat(e.target.value);
    document.getElementById('val-delay-time').textContent = `${Math.round(delayTimeVal * 1000)}ms`;
    if (delayNode) delayNode.delayTime.setValueAtTime(delayTimeVal, audioCtx.currentTime);
  });
  document.getElementById('param-delay-fb').addEventListener('input', (e) => {
    delayFeedbackVal = parseFloat(e.target.value);
    document.getElementById('val-delay-fb').textContent = `${Math.round(delayFeedbackVal * 100)}%`;
    if (delayFeedback) delayFeedback.gain.setValueAtTime(delayFeedbackVal, audioCtx.currentTime);
  });

  // Sequencer Controls
  document.getElementById('btn-play-seq').addEventListener('click', toggleSequencer);
  document.getElementById('btn-clear-seq').addEventListener('click', () => {
    Object.keys(activePattern).forEach(tr => {
      activePattern[tr] = Array(16).fill(0);
    });
    buildSequencerGridUI();
  });
  document.getElementById('seq-bpm').addEventListener('input', (e) => {
    bpm = parseInt(e.target.value);
    document.getElementById('bpm-val').textContent = `${bpm} BPM`;
    document.getElementById('bpm-display').textContent = bpm;
  });
  document.getElementById('seq-swing').addEventListener('input', (e) => {
    swingPercent = parseInt(e.target.value);
    document.getElementById('swing-val').textContent = `${swingPercent}%`;
  });

  // Ambient Faders
  ['rain', 'space', 'city', 'vinyl'].forEach(type => {
    const slider = document.getElementById(`amb-${type}`);
    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      document.getElementById(`val-amb-${type}`).textContent = `${Math.round(val * 100)}%`;
      updateAmbientVolume(type, val);
    });
  });

  // Master Gain
  document.getElementById('param-master-vol').addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('val-master-vol').textContent = `${Math.round(val * 100)}%`;
    if (masterGain) masterGain.gain.setValueAtTime(val, audioCtx.currentTime);
  });

  // Quick SFX Pads
  document.querySelectorAll('.sfx-pad').forEach(pad => {
    pad.addEventListener('click', () => {
      const sfxType = pad.getAttribute('data-sfx');
      triggerSFX(sfxType);
    });
  });

  // Octave Shift Buttons
  document.getElementById('oct-down').addEventListener('click', () => {
    if (currentOctave > 2) {
      currentOctave--;
      document.getElementById('oct-val').textContent = `OCT ${currentOctave}`;
    }
  });
  document.getElementById('oct-up').addEventListener('click', () => {
    if (currentOctave < 6) {
      currentOctave++;
      document.getElementById('oct-val').textContent = `OCT ${currentOctave}`;
    }
  });

  // Keyboard Keybindings
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    if (KEY_MAP.hasOwnProperty(key)) {
      const noteIdx = KEY_MAP[key];
      const keyEl = document.querySelector(`.key[data-note-idx="${noteIdx}"]`);
      triggerKeyNote(noteIdx, keyEl);
    }
  });
}

// --- Application Startup ---
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  buildSequencerGridUI();
  buildPianoKeyboard();
  initVisualizer();
  applyPreset('cyberpunk');
});
