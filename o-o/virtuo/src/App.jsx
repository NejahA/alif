import { useState, useEffect } from 'react';
import { Music, Activity, Disc, Zap, Settings2, Guitar as GuitarIcon, Layout, Palette, Book, HelpCircle, Cloud, Volume2, AudioWaveform, Skull, Cpu, ListMusic, Mic, Brain, Users, Download, Upload, Lightbulb, Share2, Layers, Music2, FileMusic, Gamepad2, Heart, Star, Target, Waves, FileText, Award, Drum, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tone from 'tone';
import Piano from './components/Piano';
import Violin from './components/Violin';
import Guitar from './components/Guitar';
import DrumSequencer from './components/DrumSequencer';
import DrumPad from './components/DrumPad';
import Sampler from './components/Sampler';
import Synthesizer from './components/Synthesizer';
import MelodicSequencer from './components/MelodicSequencer';
import BassSynth from './components/BassSynth';
import AmbientPad from './components/AmbientPad';
import ScaleExplorer from './components/ScaleExplorer';
import AudioVisualizer from './components/AudioVisualizer';
import Metronome from './components/Metronome';
import Tuner from './components/Tuner';
import Looper from './components/Looper';
import MasterFX from './components/MasterFX';
import Arpeggiator from './components/Arpeggiator';
import ChordProgression from './components/ChordProgression';
import MidiManager from './components/MidiManager';
import SessionSettings from './components/SessionSettings';
import ChordDictionary from './components/ChordDictionary';
import Recorder from './components/Recorder';
import RecordingGallery from './components/RecordingGallery';
import VocalProcessor from './components/VocalProcessor';
import Soundboard from './components/Soundboard';
import AIMusicGenerator from './components/AIMusicGenerator';
import MusicTheoryAssistant from './components/MusicTheoryAssistant';
import CollaborationHub from './components/CollaborationHub';
import Lyre from './components/Lyre';
import Harp from './components/Harp';
import Beatbox from './components/Beatbox';
import Theremin from './components/Theremin';
import MusicNotation from './components/MusicNotation';
import ChordTrainer from './components/ChordTrainer';
import RhythmTrainer from './components/RhythmTrainer';
import EffectsRack from './components/EffectsRack';
import SongBuilder from './components/SongBuilder';
import EarTraining from './components/EarTraining';
import MusicTheoryQuiz from './components/MusicTheoryQuiz';
import ComposerTimeline from './components/ComposerTimeline';
import Kalimba from './components/Kalimba';
import Flute from './components/Flute';
import Marimba from './components/Marimba';
import Accordion from './components/Accordion';
import Ocarina from './components/Ocarina';
import Sitar from './components/Sitar';
import Chiptune from './components/Chiptune';
import Didgeridoo from './components/Didgeridoo';
import SteelPan from './components/SteelPan';
import Glockenspiel from './components/Glockenspiel';
import Banjo from './components/Banjo';
import Oscilloscope from './components/Oscilloscope';
import VinylSimulator from './components/VinylSimulator';
import MusicBox from './components/MusicBox';
import GlassArmonica from './components/GlassArmonica';
import Koto from './components/Koto';
import GlitchEffect from './components/GlitchEffect';
import Organ from './components/Organ';
import Choir from './components/Choir';
import Saxophone from './components/Saxophone';
import Cello from './components/Cello';
import Turntables from './components/Turntables';
import Ukulele from './components/Ukulele';
import Tabla from './components/Tabla';
import Trumpet from './components/Trumpet';
import Vibraphone from './components/Vibraphone';
import Harmonica from './components/Harmonica';
import Shamisen from './components/Shamisen';
import HangDrum from './components/HangDrum';
import Timpani from './components/Timpani';
import Kazoo from './components/Kazoo';
import GranularSynth from './components/GranularSynth';
import DJMixer from './components/DJMixer';
import PanFlute from './components/PanFlute';
import Erhu from './components/Erhu';
import Xylophone from './components/Xylophone';
import MultiTrackArranger from './components/MultiTrackArranger';
import Mellotron from './components/Mellotron';
import HurdyGurdy from './components/HurdyGurdy';
import Oboe from './components/Oboe';
import Gong from './components/Gong';
import Bagpipes from './components/Bagpipes';
import Autoharp from './components/Autoharp';
import Vocoder from './components/Vocoder';
import Waterphone from './components/Waterphone';
import Otamatone from './components/Otamatone';
import JawHarp from './components/JawHarp';
import FoleyStage from './components/FoleyStage';
import SpringReverb from './components/SpringReverb';
import TR808 from './components/TR808';
import TB303 from './components/TB303';
import Stylophone from './components/Stylophone';
import Kaossilator from './components/Kaossilator';
import Talkbox from './components/Talkbox';
import FrenchHorn from './components/FrenchHorn';
import DoubleBass from './components/DoubleBass';
import Clarinet from './components/Clarinet';
import Harpsichord from './components/Harpsichord';
import TubularBells from './components/TubularBells';
import Dulcimer from './components/Dulcimer';
import Balalaika from './components/Balalaika';
import Alphorn from './components/Alphorn';
import OndesMartenot from './components/OndesMartenot';
import Taiko from './components/Taiko';
import Oud from './components/Oud';
import Nyckelharpa from './components/Nyckelharpa';
import Launchpad from './components/Launchpad';
import Mridangam from './components/Mridangam';
import Santoor from './components/Santoor';
import Zither from './components/Zither';
import BeatSlicer from './components/BeatSlicer';
import ThemeManager from './components/ThemeManager';
import ProjectManager from './components/ProjectManager';
import SpectralAnalyzer from './components/SpectralAnalyzer';
import ModularSynth from './components/ModularSynth';
import BowedVibraphone from './components/BowedVibraphone';
import TapeEcho from './components/TapeEcho';
import EuclideanSequencer from './components/EuclideanSequencer';
import VectorSynth from './components/VectorSynth';
import PhaseDistortionSynth from './components/PhaseDistortionSynth';
import BitcrusherEffect from './components/BitcrusherEffect';
import SpectralDelay from './components/SpectralDelay';
import VocalHarmonizer from './components/VocalHarmonizer';
import WavetableEditor from './components/WavetableEditor';
import ChordProgressionGenerator from './components/ChordProgressionGenerator';
import ConvolutionReverb from './components/ConvolutionReverb';
import MasterMixer from './components/MasterMixer';
import FM4Synth from './components/FM4Synth';
import AdditiveSynth from './components/AdditiveSynth';
import KarplusStrongSynth from './components/KarplusStrongSynth';
import SubSynth from './components/SubSynth';
import FormantFilter from './components/FormantFilter';
import DistortionRack from './components/DistortionRack';
import StereoImager from './components/StereoImager';
import PatternArpeggiator from './components/PatternArpeggiator';
import LFOModulator from './components/LFOModulator';
import PerformanceMacro from './components/PerformanceMacro';
import AILyricsGenerator from './components/AILyricsGenerator';
import NeuralDrumSynth from './components/NeuralDrumSynth';
import TechnoKickDesigner from './components/TechnoKickDesigner';
import CloudTextureGenerator from './components/CloudTextureGenerator';
import MultibandDynamics from './components/MultibandDynamics';
import VocalTuner from './components/VocalTuner';
import SidechainPumper from './components/SidechainPumper';
import SpectralResonator from './components/SpectralResonator';
import TransientShaper from './components/TransientShaper';
import MasteringChain from './components/MasteringChain';
import AIBasslineGenerator from './components/AIBasslineGenerator';
import StutterRack from './components/StutterRack';
import TapeSatPro from './components/TapeSatPro';
import PolyArpPro from './components/PolyArpPro';
import Spectrogram3D from './components/Spectrogram3D';
import ReverseReverb from './components/ReverseReverb';
import HarmonicExciter from './components/HarmonicExciter';
import WavetableMorpher from './components/WavetableMorpher';
import MIDIEffectsHub from './components/MIDIEffectsHub';
import FrequencySidechain from './components/FrequencySidechain';
import NeuralSoundscape from './components/NeuralSoundscape';
import OrchestralStrings from './components/OrchestralStrings';
import PipeOrganPro from './components/PipeOrganPro';
import AIBPMDetector from './components/AIBPMDetector';
import MultibandLimiter from './components/MultibandLimiter';
import StereoWidenerPro from './components/StereoWidenerPro';
import ResonanceMapper from './components/ResonanceMapper';
import AIArrangementHelper from './components/AIArrangementHelper';
import NoiseEngine from './components/NoiseEngine';
const INSTRUMENT_CATEGORIES = {
  "Keys & Synths": ['piano', 'harpsichord', 'synth', 'modularsynth', 'bass', 'ambient', 'organ', 'pipeorgan', 'mellotron', 'ondesmartenot', 'chiptune', 'theremin', 'otamatone', 'tb303', 'stylophone', 'kaossilator', 'cloudtexture', 'wavetablemorph', 'phasedistortion'],
  "Strings": ['violin', 'doublebass', 'guitar', 'cello', 'orchestralstrings', 'shamisen', 'erhu', 'ukulele', 'banjo', 'lyre', 'harp', 'sitar', 'koto', 'hurdygurdy', 'autoharp', 'dulcimer', 'balalaika', 'oud', 'nyckelharpa', 'santoor', 'zither'],
  "Winds & Brass": ['trumpet', 'frenchhorn', 'saxophone', 'clarinet', 'flute', 'harmonica', 'panflute', 'ocarina', 'accordion', 'didgeridoo', 'alphorn', 'kazoo', 'oboe', 'bagpipes', 'jawharp'],
  "Percussion": ['drums', 'tr808', 'technokick', 'neuraldrums', 'tabla', 'tubularbells', 'vibraphone', 'bowedvibraphone', 'hangdrum', 'timpani', 'kalimba', 'marimba', 'steelpan', 'glockenspiel', 'xylophone', 'musicbox', 'gong', 'waterphone', 'foleystage', 'taiko', 'mridangam'],
  "Studio & FX": ['effects', 'mastermixer', 'masterchain', 'limiter', 'reverb', 'reversereverb', 'spectraldelay', 'bitcrusher', 'beatslicer', 'stutter', 'tapesat', 'exciter', 'widener', 'aimusicgenerator', 'ailyrics', 'aibassline', 'soundscape', 'composertimeline', 'arrangementhelper', 'collaborationhub', 'launchpad', 'multitrack', 'sampler', 'djmixer', 'turntables', 'granularsynth', 'vinyl', 'oscilloscope', 'spectrogram3d', 'spectralanalyzer', 'glassarmonica', 'glitch', 'tapeecho', 'beatbox', 'choir', 'vocal', 'vocaltuner', 'harmonizer', 'talkbox', 'pads', 'seq', 'euclidean', 'vocoder', 'springreverb'],
  "Advanced Synths": ['fm4', 'additive', 'pluck', 'subsynth'],
  "Signal Processing": ['formant', 'distortion', 'imager', 'multiband', 'sidechain', 'freqsidechain', 'shaper', 'resmapper'],
  "Pro Performance": ['patternarp', 'polyarp', 'midihub', 'bpmdetector', 'lfo', 'macro'],
  "Learning": ['musictheoryassistant', 'chordgen', 'scales', 'chords', 'rhythm', 'eartraining', 'quiz', 'notation', 'songbuilder'],
  "Experimental": ['vectorsynth', 'phasedistortion', 'wavetable', 'resonator', 'noiseengine']
};

function App() {
  const [activeTab, setActiveTab] = useState('piano'); // 'piano' | 'violin' | 'guitar' | 'drums' | 'pads' | 'sampler' | 'synth' | 'seq' | 'bass' | 'ambient' | 'scales' | 'studio' | 'vocal' | 'lyre' | 'harp' | 'beatbox' | 'theremin' | 'notation' | 'chords' | 'rhythm' | 'effects' | 'songbuilder' | 'eartraining' | 'kalimba' | 'flute' | 'marimba' | 'accordion' | 'ocarina' | 'sitar' | 'chiptune' | 'didgeridoo' | 'steelpan' | 'glockenspiel' | 'banjo' | 'oscilloscope' | 'vinyl' | 'musicbox' | 'glassarmonica' | 'koto' | 'glitch'
  const [recordings, setRecordings] = useState([]);
  const [showUtilities, setShowUtilities] = useState(false);
  const [showStudioTools, setShowStudioTools] = useState(false);
  const [theme, setTheme] = useState('default');
  const [showGuide, setShowGuide] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [customAccent, setCustomAccent] = useState('#8a2be2');
  const [metronomeBpm, setMetronomeBpm] = useState(120);
  const [metronomePlaying, setMetronomePlaying] = useState(false);

  const saveProject = () => {
    const projectData = JSON.stringify({ activeTab, masterVolume, theme, customAccent, recordings: recordings.map(r => ({ id: r.id, name: r.name, date: r.date })) });
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'virtuo-session.virtuo';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.virtuo';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const projectData = JSON.parse(event.target.result);
          handleProjectLoad(projectData);
        } catch (error) {
          alert('Error loading project: Invalid file format');
          console.error('Project load error:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleThemeChange = (themeObj) => {
    let t = themeObj;
    if (typeof themeObj === 'string') {
      const fallbackThemes = {
        'default': { id: 'default', accent: '#8a2be2', bg: '#0f172a', glassBg: 'rgba(30, 41, 59, 0.7)' },
        'cyberpunk': { id: 'cyberpunk', accent: '#facc15', bg: '#111827', glassBg: 'rgba(255, 0, 255, 0.1)' },
        'synthwave': { id: 'synthwave', accent: '#f97316', bg: '#2e1065', glassBg: 'rgba(124, 58, 237, 0.2)' },
        'studio-light': { id: 'studio-light', accent: '#3b82f6', bg: '#f1f5f9', glassBg: 'rgba(255, 255, 255, 0.7)' }
      };
      t = fallbackThemes[themeObj] || fallbackThemes['default'];
    }
    
    setTheme(t.id);
    setCustomAccent(t.accent);
    document.documentElement.style.setProperty('--accent-primary', t.accent);
    document.documentElement.style.setProperty('--bg-main', t.bg);
    document.documentElement.style.setProperty('--glass-bg', t.glassBg);
    document.documentElement.setAttribute('data-theme', t.id === 'default' ? '' : t.id);
    localStorage.setItem('virtuo_theme', t.id);
  };

  const handleProjectLoad = (data) => {
    if (data.activeTab) setActiveTab(data.activeTab);
    if (data.masterVolume !== undefined) setMasterVolume(data.masterVolume);
    if (data.theme) handleThemeChange(data.theme);
    alert("Project loaded successfully!");
  };
 
  useEffect(() => {
    let synth;
    let loop;
    if (metronomePlaying) {
      synth = new Tone.MembraneSynth().toDestination();
      Tone.Transport.bpm.value = metronomeBpm;
      loop = new Tone.Loop(time => {
        synth.triggerAttackRelease("C2", "8n", time);
      }, "4n").start(0);
      if (Tone.Transport.state !== 'started') Tone.Transport.start();
    } else {
      if (Tone.Transport.state === 'started') Tone.Transport.stop();
    }
    return () => {
      if (loop) loop.dispose();
      if (synth) synth.dispose();
    };
  }, [metronomePlaying, metronomeBpm]);

  const instrumentInfo = {
    piano: "Grand Piano - 88-key polyphonic synthesizer with realistic envelope.",
    violin: "Orchestral Strings - Expressive bowed string simulation with vibrato control.",
    guitar: "Electric Guitar - Plucked string synthesis with harmonic richness.",
    drums: "Drum Machine - 16-step grid sequencer for creating custom beats.",
    pads: "Performance Pads - Velocity-sensitive pads for finger drumming.",
    sampler: "Voice Sampler - Load and manipulate audio clips with real-time controls.",
    synth: "Wavetable Synth - Custom oscillator shapes and filter modulation.",
    seq: "Step Sequencer - Monophonic melodic sequencer for lead lines.",
    bass: "Deep Bass - Low-frequency monophonic synth for foundation lines.",
    ambient: "Atmospheric Pads - Ethereal, evolving soundscapes with long release.",
    vocal: "Vocal Processor - Real-time microphone input with pitch shifting.",
    scales: "Music Theory - Explore different scales and their harmonic structures.",
    studio: "Recording Studio - Manage and play back your captured performances.",
    ai: "AI Music Generator - Generate unique melodies and patterns using artificial intelligence.",
    theory: "Music Theory Assistant - Real-time chord analysis and progression suggestions.",
    collab: "Collaboration Hub - Share sessions and work with other musicians in real-time.",
    lyre: "Ancient Lyre - 7-string plucked instrument with authentic Greek tuning.",
    harp: "Concert Harp - 10-string orchestral harp with glissando effects.",
    beatbox: "Beatbox Studio - Vocal percussion sounds with loop sequencer.",
    theremin: "Electronic Theremin - Contactless instrument controlled by mouse movement.",
    notation: "Music Notation - Compose and play back scores with standard notation.",
    chords: "Chord Trainer - Learn to identify and play chords by ear.",
    rhythm: "Rhythm Trainer - Develop rhythm skills with pattern recognition.",
    effects: "Effects Rack - Professional audio processing with 8 effects.",
    songbuilder: "Song Builder - Arrange patterns into complete songs.",
    eartraining: "Ear Training - Develop your musical ear with interactive exercises.",
    quiz: "Music Theory Quiz - Test your knowledge with interactive quizzes.",
    composer: "Music History - Explore composers and historical periods.",
    kalimba: "Kalimba - Thumb piano with physical modeling synthesis.",
    flute: "Flute - Expressive woodwind with breath and vibrato controls.",
    marimba: "Marimba - Wooden mallet percussion with rich resonance.",
    accordion: "Accordion - Classic free-reed squeezebox with animated bellows.",
    ocarina: "Ocarina - Pure tone wind instrument with portamento glide.",
    sitar: "Sitar - Traditional Indian stringed instrument with resonant drone.",
    chiptune: "8-Bit Synth - Retro video game sounds with arpeggiator.",
    didgeridoo: "Didgeridoo - Low-frequency drone with rhythmic modulation.",
    steelpan: "Steel Pan - Metallic Caribbean instrument with circular layout.",
    glockenspiel: "Glockenspiel - Bright, high-pitched metallic mallet instrument.",
    banjo: "Banjo - Folk instrument with twangy plucked sound.",
    oscilloscope: "Oscilloscope - Real-time CRT waveform visualizer.",
    vinyl: "Vinyl Simulator - Global lo-fi effect with surface noise and pitch wow.",
    musicbox: "Music Box - Delicate, wind-up brass cylinder instrument.",
    glassarmonica: "Glass Armonica - Ethereal, resonant spinning glass bowls.",
    koto: "Koto - Traditional Japanese zither with pitch bending.",
    glitch: "Glitch Effect - Aggressive master-bus stutter and pitch shifting.",
    organ: "Tonewheel Organ - Classic additive synthesis with drawbars and Leslie speaker.",
    choir: "Vocal Choir - Synthesized vocal ensemble with adjustable formants.",
    saxophone: "Saxophone - Expressive woodwind synth with vibrato and breath attack.",
    cello: "Cello - Deep, resonant low strings with interactive bowing.",
    turntables: "Turntables - Virtual vinyl record for DJ scratching effects.",
    ukulele: "Ukulele - 4-string plucked acoustic instrument with strumming.",
    tabla: "Tabla - Traditional Indian hand drums with physical modeling.",
    trumpet: "Trumpet - Expressive brass lead with 3 playable valves.",
    vibraphone: "Vibraphone - Metallic mallets with a motorized tremolo effect.",
    harmonica: "Harmonica - Blues harp with interactive draw and blow mechanics.",
    shamisen: "Shamisen - Japanese 3-string lute with percussive bachi picking.",
    hangdrum: "Hang Drum - Ethereal handpan percussion with resonant overtones.",
    timpani: "Timpani - Orchestral kettle drum with pedal pitch bending.",
    kazoo: "Kazoo - Fun, buzzy, vocal-driven synth with slide pitch control.",
    granularsynth: "Granular Synth - Load audio and manipulate it using granular synthesis.",
    djmixer: "DJ Mixer - Dual-deck mixer with crossfader and 3-band EQs.",
    panflute: "Pan Flute - Peruvian wooden pipes with interactive blowing.",
    erhu: "Erhu - Chinese bowed strings with expressive portamento and vibrato.",
    xylophone: "Xylophone - Classic wooden mallet instrument.",
    multitrack: "Multi-Track - Timeline arrangement view for multiple audio layers.",
    mellotron: "Mellotron - Vintage tape-replay keyboard instrument.",
    hurdygurdy: "Hurdy Gurdy - Hand-cranked string instrument with drones.",
    oboe: "Oboe - Expressive double reed woodwind instrument.",
    gong: "Gong - Massive resonant percussion instrument.",
    bagpipes: "Bagpipes - Traditional wind instrument with continuous drones.",
    autoharp: "Autoharp - Strummable zither with chord bars.",
    vocoder: "Vocoder - Robotic voice synthesizer using mic input.",
    waterphone: "Waterphone - Eerie, bowed acoustic instrument perfect for horror scores.",
    otamatone: "Otamatone - Japanese electronic musical toy with a sliding ribbon controller.",
    jawharp: "Jaw Harp - Twangy folk instrument with mouth-shape filter modulation.",
    foleystage: "Foley Stage - A 12-pad sampler with synthesized cinematic sound effects.",
    springreverb: "Spring Reverb Tank - An interactive reverb tank that you can physically kick.",
    tr808: "TR-808 - Legendary 16-step drum machine with classic hip-hop and techno sounds.",
    tb303: "TB-303 - The iconic acid bassline synthesizer with extreme filter controls.",
    stylophone: "Stylophone - Retro 60s pocket synth. Drag your mouse across the metallic foil keys.",
    kaossilator: "Kaossilator - Glowing XY-pad synthesizer for fluidly sweeping pitch and filters.",
    talkbox: "Talkbox - Classic 70s vocal effect. Use your mic to modulate a gnarly synth.",
    frenchhorn: "French Horn - Majestic orchestral brass with a warm, swelling tone.",
    doublebass: "Double Bass - The massive foundation of the string section. Toggle between Arco and Pizzicato.",
    clarinet: "Clarinet - Classic woodwind instrument with a distinctive hollow, woody tone.",
    harpsichord: "Harpsichord - Classic Baroque keyboard. Plucks the strings for a bright, sharp attack.",
    tubularbells: "Tubular Bells - Large orchestral chimes for dramatic, cinematic resonance.",
    dulcimer: "Dulcimer - Traditional hammered string instrument with a bright metallic tone.",
    balalaika: "Balalaika - Russian triangular string instrument. Hold the frets for rapid tremolo picking.",
    vibraphone: "Vibraphone - Metallic keyboard with a motor speed slider for deep tremolo.",
    alphorn: "Alphorn - Massive, resonating mountain horn of the Swiss Alps.",
    ondesmartenot: "Ondes Martenot - Early electronic instrument. Slide the ring for pitch and press the key for volume.",
    taiko: "Taiko - Deep, cinematic Japanese drums for massive rhythmic power.",
    oud: "Oud - Middle Eastern plucked lute with a smooth fretless sound.",
    nyckelharpa: "Nyckelharpa - Swedish keyed fiddle with beautiful sympathetic resonance.",
    mridangam: "Mridangam - Traditional South Indian double-sided drum.",
    santoor: "Santoor - Indian hammered dulcimer with a shimmering tone.",
    zither: "Zither - Classic European folk stringed instrument.",
    launchpad: "Launchpad - 64-pad isomorphic grid controller for dynamic playing.",
    aimusicgenerator: "AI Music Generator - Create intelligent melodic patterns and chords instantly.",
    composertimeline: "Composer Timeline - Full track arranger for linear composition.",
    musictheoryassistant: "Theory Assistant - Smart chord, scale, and harmonic analysis.",
    collaborationhub: "Collaboration Hub - Connect and jam with other musicians globally.",
    eartraining: "Ear Training - Practice identifying intervals and chords by ear.",
    rhythm: "Rhythm Trainer - Improve your timing and rhythmic accuracy.",
    chords: "Chord Trainer - Master chord progressions and fingerings.",
    quiz: "Theory Quiz - Test your musical knowledge.",
    notation: "Music Notation - Write and arrange standard sheet music.",
    songbuilder: "Song Builder - Construct full songs block-by-block.",
    effects: "Effects Rack - Modular, drag-and-drop audio effect chain.",
    beatslicer: "Beat Slicer - Chop and sequence samples like an MPC.",
    multitrack: "Multi-Track Arranger - Arrange multiple layers of audio and MIDI on a timeline.",
    sampler: "Sampler - Load, pitch, and trigger custom audio layers.",
    granularsynth: "Granular Synth - Create massive atmospheric layers by manipulating audio grains.",
    djmixer: "DJ Mixer - Pro club mixer with 3-band EQs and crossfader.",
    glassarmonica: "Glass Armonica - Ethereal friction tones from spinning glass bowls.",
    glitch: "Glitch Effect - Stutter, chop, and destroy your audio in real-time.",
    beatbox: "Beatbox - Acoustic mouth percussion kit.",
    oscilloscope: "Oscilloscope - Real-time visual waveform analysis.",
    springreverb: "Spring Reverb - Vintage physical modeling reverb tank.",
    spectralanalyzer: "Spectral Analyzer - Real-time master output frequency spectrum.",
    modularsynth: "Modular Synth - Node-based interactive synthesizer.",
    bowedvibraphone: "Bowed Vibraphone - Ethereal, sustained metallic mallets.",
    tapeecho: "Tape Echo - Vintage magnetic tape delay simulation.",
    euclidean: "Euclidean Sequencer - Mathematical rhythm generator based on the Bjorklund algorithm.",
    vectorsynth: "Vector Synth - 4-way morphing synthesis with interactive XY-pad control.",
    phasedistortion: "Phase Distortion - Gritty 80s digital synthesis with 12-bit resampling emulation.",
    bitcrusher: "Bitcrusher FX - Lo-fi destruction with adjustable bit-depth and harmonic grit.",
    spectraldelay: "Spectral Delay - Multi-band frequency delay for atmospheric spatial textures.",
    harmonizer: "Vocal Harmonizer - Real-time artificial choir generation using pitch shifting.",
    wavetable: "Wavetable Editor - Draw custom oscillator shapes for unique synthesizer tones.",
    chordgen: "Chord Progression Generator - Intelligent harmonic engine with genre-based presets.",
    reverb: "Convolution Reverb - Realistic acoustic space modeling using impulse responses.",
    mastermixer: "Master Mixer - Professional final mix channel strip with VU meters and limiting.",
    fm4: "FM4 Synth - 4-operator digital frequency modulation synthesizer.",
    additive: "Additive Synth - Harmonic stacking engine with 16-partial control.",
    pluck: "Physical Pluck - Karplus-Strong string modeling with body resonance.",
    subsynth: "Sub Synth - Deep low-frequency generator with harmonic saturation.",
    formant: "Formant Morph - Vocal tract resonance filter with interactive XY vowel pad.",
    distortion: "Distortion Rack - Triple-mode saturation (Valve, Fuzz, Rectifier).",
    imager: "Stereo Imager - Spatial width control and phase correlation analysis.",
    patternarp: "Pattern Arp - Rhythmic step-based arpeggiator with transpose offsets.",
    lfo: "LFO Modulator - Global modulation source for any audio parameter.",
    macro: "Performance Dashboard - Multi-parameter macro control and XY performance pads.",
    ailyrics: "AI Lyrics Generator - Generate thematic lyrics using simulated neural patterns.",
    neuraldrums: "Neural Drum Synth - Deep-learning inspired percussion synthesis engine.",
    technokick: "Techno Kick Designer - Dedicated synthesizer for crafting powerful club kicks.",
    cloudtexture: "Cloud Texture Generator - Generative ambient soundscapes and ethereal clouds.",
    multiband: "Multiband Dynamics - Precision dynamic control across three frequency bands.",
    vocaltuner: "Vocal Tuner Pro - Real-time pitch correction and formant shifting.",
    sidechain: "Sidechain Pumper - Iconic volume ducking for dance music production.",
    resonator: "Spectral Resonator - Experimental harmonic resonance and spectral filtering.",
    shaper: "Transient Shaper - Control attack and sustain to sharpen or smooth sounds.",
    masterchain: "Mastering Chain - Comprehensive final-stage processor for a professional polish.",
    aibassline: "AI Bassline Generator - Neural-inspired patterns for deep melodic low-end.",
    stutter: "Stutter Rack - Rhythmic glitch and buffer repeating engine.",
    tapesat: "Tape Saturation Pro - High-fidelity magnetic tape simulation and warmth.",
    polyarp: "PolyArp Pro - Advanced polyphonic arpeggiator with custom step logic.",
    spectrogram3d: "Spectrogram 3D - Immersive temporal frequency visualization suite.",
    reversereverb: "Reverse Reverb - Ethereal, blooming space with temporal reflections.",
    exciter: "Harmonic Exciter - Add harmonic clarity and presence to high frequencies.",
    wavetablemorph: "Wavetable Morpher - Step-based morphing between oscillator wavetables.",
    midihub: "MIDI Effects Hub - Central processing for chords, velocity, and humanization.",
    freqsidechain: "Frequency Sidechain - Surgical band-specific volume ducking.",
    soundscape: "Neural Soundscape - AI-driven environmental atmosphere synthesis.",
    orchestralstrings: "Orchestral Strings Pro - Lush cinematic ensemble strings.",
    pipeorgan: "Pipe Organ Majestic - Grand cathedral organ with authentic stops.",
    bpmdetector: "AI BPM Detector - Real-time neural tempo analysis.",
    limiter: "Multiband Limiter Pro - 4-band professional mastering limiter.",
    widener: "Stereo Widener Pro - Advanced Mid/Side spatial enhancement.",
    phasedistortion: "Phase Distortion Synth - Classic futuristic digital synthesis.",
    resmapper: "Resonance Mapper - Surgical frequency resonance surgical tool.",
    arrangementhelper: "AI Arrangement Helper - Neural song structure analysis.",
    noiseengine: "Experimental Noise Engine - Chaotic texture and foley generator."
  };

  // Persistence: Load recordings on mount
  useEffect(() => {
    const savedRecordings = localStorage.getItem('virtuo_recordings');
    if (savedRecordings) {
      try {
        // We can't save Blobs directly to localStorage as strings efficiently,
        // so for now we persist metadata and names. 
        // Real song mode would save MIDI/JSON sequences.
        // For this task, we'll implement session-based persistence for settings.
        const savedTheme = localStorage.getItem('virtuo_theme');
        if (savedTheme) handleThemeChange(savedTheme);
      } catch (e) { console.error("Persistence error", e); }
    }
  }, []);

  useEffect(() => {
    Tone.Destination.volume.rampTo(masterVolume, 0.1);
  }, [masterVolume]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate CPU load based on audio context state
      setCpuUsage(Math.round(Tone.context.lookAhead * 1000 + Math.random() * 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const themes = [
    { id: 'default', name: 'Cyberpunk', color: '#8a2be2' },
    { id: 'emerald', name: 'Emerald', color: '#10b981' },
    { id: 'ocean', name: 'Ocean', color: '#3b82f6' },
    { id: 'sunset', name: 'Sunset', color: '#f43f5e' }
  ];



  const addRecording = (blob) => {
    const newRecording = {
      id: Date.now(),
      blob: blob,
      date: new Date().toLocaleString(),
      name: `Recording ${recordings.length + 1}`
    };
    setRecordings(prev => [newRecording, ...prev]);
  };

  const handleMidiNoteOn = (note, velocity) => {
    window.dispatchEvent(new CustomEvent('virtuo-midi-on', { detail: { note, velocity } }));
  };

  const handleMidiNoteOff = (note) => {
    window.dispatchEvent(new CustomEvent('virtuo-midi-off', { detail: { note } }));
  };

  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(midiAccess => {
        for (let input of midiAccess.inputs.values()) {
          input.onmidimessage = getMIDIMessage;
        }
      }, () => console.error("Could not access your MIDI devices."));
    }
    
    function getMIDIMessage(message) {
      const command = message.data[0];
      const note = message.data[1];
      const velocity = (message.data.length > 2) ? message.data[2] : 0;
      
      const noteName = Tone.Frequency(note, "midi").toNote();
      
      if (command === 144 && velocity > 0) {
        handleMidiNoteOn(noteName, velocity / 127);
      } else if (command === 128 || (command === 144 && velocity === 0)) {
        handleMidiNoteOff(noteName);
      }
    }
  }, []);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div style={{ height: '30px', WebkitAppRegion: 'drag', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', opacity: 0.6, color: 'var(--text-main)' }}>VIRTUO</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', opacity: 0.5, fontSize: '10px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Cpu size={12} />
              <span>{cpuUsage}ms</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              <span>ENGINE READY</span>
            </div>
          </div>
        </div>

      <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)', gap: '20px' }}>
        <div style={{ flexShrink: 0 }}>
          <h1 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0 }}>Veritutz</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Interactive Music Studio</p>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <nav style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '5px', scrollbarWidth: 'thin', scrollbarColor: 'var(--accent-primary) rgba(255,255,255,0.05)' }}>
          {hoveredTab && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: 'absolute',
                top: '-50px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.8)',
                padding: '8px 15px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: 'white',
                border: '1px solid var(--accent-primary)',
                zIndex: 100,
                whiteSpace: 'nowrap',
                pointerEvents: 'none'
              }}
            >
              {instrumentInfo[hoveredTab]}
            </motion.div>
          )}
          <Recorder onRecordingComplete={addRecording} />
           
          <select 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value)}
            className="btn-glass"
            style={{ padding: '10px 15px', fontSize: '14px', minWidth: '250px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--accent-primary)', borderRadius: '8px', cursor: 'pointer' }}
          >
            {Object.entries(INSTRUMENT_CATEGORIES).map(([catName, instruments]) => (
              <optgroup key={catName} label={catName} style={{ background: '#111', color: '#a855f7' }}>
                {instruments.map(inst => (
                  <option key={inst} value={inst} style={{ color: '#fff' }}>
                    {instrumentInfo[inst] ? instrumentInfo[inst].split(' - ')[0] : inst}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          
          <div style={{ flex: 1 }} />

          <button className="btn-glass" onClick={saveProject} style={{ marginLeft: '10px' }} title="Save Project">
            <Download size={16} /> Save
          </button>
          
          <button className="btn-glass" onClick={loadProject} style={{ marginLeft: '5px' }} title="Load Project">
            <Upload size={16} /> Load
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '10px', background: 'rgba(0,0,0,0.2)', padding: '5px 10px', borderRadius: '8px' }}>
            <button 
              className={`btn-glass ${metronomePlaying ? 'active' : ''}`}
              onClick={() => {
                if (Tone.context.state !== 'running') Tone.start();
                setMetronomePlaying(!metronomePlaying);
              }}
              style={{ padding: '5px', border: metronomePlaying ? '1px solid var(--accent-primary)' : 'none' }}
              title="Global Metronome"
            >
              <Activity size={16} color={metronomePlaying ? 'var(--accent-primary)' : 'var(--text-muted)'} />
            </button>
            <input 
              type="number" 
              value={metronomeBpm} 
              onChange={(e) => setMetronomeBpm(Number(e.target.value))}
              style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', fontSize: '12px', textAlign: 'center' }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>BPM</span>
          </div>
          
          <button 
            className={`btn-glass ${showUtilities ? 'active' : ''}`}
            onClick={() => setShowUtilities(!showUtilities)}
            style={{ marginLeft: '10px', border: '1px solid var(--accent-primary)' }}
          >
            <Settings2 size={16} /> Tools
          </button>

          <button 
            className={`btn-glass ${activeTab === 'midimanager' ? 'active' : ''}`}
            onClick={() => setActiveTab('midimanager')}
            style={{ marginLeft: '10px' }}
            title="MIDI Manager"
          >
            <Cpu size={16} /> MIDI
          </button>

          <button 
            className={`btn-glass ${activeTab === 'recordinggallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('recordinggallery')}
            style={{ marginLeft: '5px' }}
            title="Recording Gallery"
          >
            <FileMusic size={16} /> Gallery
          </button>

          <button 
            className={`btn-glass ${activeTab === 'soundboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('soundboard')}
            style={{ marginLeft: '5px', border: '1px solid var(--accent-primary)' }}
            title="Soundboard"
          >
            <Layout size={16} /> Soundboard
          </button>

          <button 
            className={`btn-glass ${showStudioTools ? 'active' : ''}`}
            onClick={() => setShowStudioTools(!showStudioTools)}
            style={{ marginLeft: '10px', border: '1px solid #10b981' }}
            title="Studio Panel"
          >
            <Layers size={16} /> Studio Panel
          </button>

          <button 
            className="btn-glass"
            onClick={() => setShowGuide(true)}
            style={{ marginLeft: '5px', padding: '10px' }}
          >
            <HelpCircle size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px', background: 'rgba(0,0,0,0.2)', padding: '5px 15px', borderRadius: '20px' }}>
            <Volume2 size={14} color="var(--text-muted)" />
            <input 
              type="range" min="-60" max="0" step="1" 
              value={masterVolume} 
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              style={{ width: '80px', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '5px', marginLeft: '10px', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '20px' }}>
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: t.color,
                  border: theme === t.id ? '2px solid white' : 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                title={t.name}
              />
            ))}
          </div>
        </nav>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <div style={{ flex: 1, padding: '20px 40px', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'aimusicgenerator' && (
              <motion.div
                key="aimusicgenerator"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <AIMusicGenerator />
              </motion.div>
            )}

            {activeTab === 'composertimeline' && (
              <motion.div
                key="composertimeline"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1200px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <ComposerTimeline />
              </motion.div>
            )}

            {activeTab === 'musictheoryassistant' && (
              <motion.div
                key="musictheoryassistant"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <MusicTheoryAssistant />
              </motion.div>
            )}

            {activeTab === 'collaborationhub' && (
              <motion.div
                key="collaborationhub"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <CollaborationHub />
              </motion.div>
            )}

            {activeTab === 'launchpad' && (
              <motion.div
                key="launchpad"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Launchpad Controller</h2>
                <Launchpad />
              </motion.div>
            )}

            {activeTab === 'eartraining' && (
              <motion.div
                key="eartraining"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <EarTraining />
              </motion.div>
            )}

            {activeTab === 'rhythm' && (
              <motion.div
                key="rhythm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <RhythmTrainer />
              </motion.div>
            )}

            {activeTab === 'chords' && (
              <motion.div
                key="chords"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <ChordTrainer />
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <MusicTheoryQuiz />
              </motion.div>
            )}

            {activeTab === 'notation' && (
              <motion.div
                key="notation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <MusicNotation />
              </motion.div>
            )}

            {activeTab === 'songbuilder' && (
              <motion.div
                key="songbuilder"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <SongBuilder />
              </motion.div>
            )}

            {activeTab === 'effects' && (
              <motion.div
                key="effects"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Advanced Effects Rack</h2>
                <EffectsRack />
              </motion.div>
            )}

            {activeTab === 'vinyl' && (
              <motion.div
                key="vinyl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', gap: '20px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <VinylSimulator />
                  <VinylCrackle />
                </div>
              </motion.div>
            )}

            {activeTab === 'multitrack' && (
              <motion.div
                key="multitrack"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1200px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <MultiTrackArranger />
              </motion.div>
            )}

            {activeTab === 'sampler' && (
              <motion.div
                key="sampler"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Sampler />
              </motion.div>
            )}

            {activeTab === 'granularsynth' && (
              <motion.div
                key="granularsynth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <GranularSynth />
              </motion.div>
            )}

            {activeTab === 'djmixer' && (
              <motion.div
                key="djmixer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <DJMixer />
              </motion.div>
            )}

            {activeTab === 'glassarmonica' && (
              <motion.div
                key="glassarmonica"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <GlassArmonica />
              </motion.div>
            )}

            {activeTab === 'glitch' && (
              <motion.div
                key="glitch"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <GlitchEffect />
              </motion.div>
            )}

            {activeTab === 'beatbox' && (
              <motion.div
                key="beatbox"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Beatbox />
              </motion.div>
            )}

            {activeTab === 'oscilloscope' && (
              <motion.div
                key="oscilloscope"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Oscilloscope />
              </motion.div>
            )}

            {activeTab === 'springreverb' && (
              <motion.div
                key="springreverb"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <SpringReverb />
              </motion.div>
            )}

            {activeTab === 'midimanager' && (
              <motion.div
                key="midimanager"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <MidiManager />
              </motion.div>
            )}

            {activeTab === 'recordinggallery' && (
              <motion.div
                key="recordinggallery"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <RecordingGallery recordings={recordings} />
              </motion.div>
            )}

            {activeTab === 'soundboard' && (
              <motion.div
                key="soundboard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Soundboard />
              </motion.div>
            )}

            {activeTab === 'tapestop' && (
              <motion.div
                key="tapestop"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <TapeStop />
              </motion.div>
            )}

            {activeTab === 'vocal' && (
              <motion.div
                key="vocal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <VocalProcessor />
              </motion.div>
            )}

            {activeTab === 'vocoder' && (
              <motion.div
                key="vocoder"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Vocoder />
              </motion.div>
            )}

            {activeTab === 'talkbox' && (
              <motion.div
                key="talkbox"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Talkbox />
              </motion.div>
            )}

            {activeTab === 'beatslicer' && (
              <motion.div
                key="beatslicer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>MPC Beat Slicer</h2>
                <BeatSlicer />
              </motion.div>
            )}


            {activeTab === 'turntables' && (
              <motion.div
                key="turntables"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Dual Turntables</h2>
                <Turntables />
              </motion.div>
            )}

            {activeTab === 'mridangam' && (
              <motion.div
                key="mridangam"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Mridangam />
              </motion.div>
            )}

            {activeTab === 'santoor' && (
              <motion.div
                key="santoor"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Santoor />
              </motion.div>
            )}

            {activeTab === 'zither' && (
              <motion.div
                key="zither"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Zither />
              </motion.div>
            )}

            {activeTab === 'piano' && (
              <motion.div
                key="piano"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Grand Piano</h2>
                <Piano />
              </motion.div>
            )}

            {activeTab === 'violin' && (
              <motion.div
                key="violin"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Synthesized Violin</h2>
                <Violin />
              </motion.div>
            )}

            {activeTab === 'taiko' && (
              <motion.div
                key="taiko"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Taiko />
              </motion.div>
            )}

            {activeTab === 'oud' && (
              <motion.div
                key="oud"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Oud />
              </motion.div>
            )}

            {activeTab === 'nyckelharpa' && (
              <motion.div
                key="nyckelharpa"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Nyckelharpa />
              </motion.div>
            )}

            {activeTab === 'guitar' && (
              <motion.div
                key="guitar"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Virtual Guitar</h2>
                <Guitar />
              </motion.div>
            )}

            {activeTab === 'drums' && (
              <motion.div
                key="drums"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Drum Sequencer</h2>
                <DrumSequencer />
              </motion.div>
            )}

            {activeTab === 'pads' && (
              <motion.div
                key="pads"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '600px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Drum Pads</h2>
                <DrumPad />
              </motion.div>
            )}
    
            {activeTab === 'sampler' && (
              <motion.div
                key="sampler"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Sound Sampler</h2>
                <Sampler />
              </motion.div>
            )}

            {activeTab === 'synth' && (
              <motion.div
                key="synth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Custom Synthesizer</h2>
                <Synthesizer />
              </motion.div>
            )}

            {activeTab === 'seq' && (
              <motion.div
                key="seq"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Melodic Step Sequencer</h2>
                <MelodicSequencer />
              </motion.div>
            )}

            {activeTab === 'bass' && (
              <motion.div
                key="bass"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Monophonic Bass Synth</h2>
                <BassSynth />
              </motion.div>
            )}

            {activeTab === 'ambient' && (
              <motion.div
                key="ambient"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Ambient Pad Synth</h2>
                <AmbientPad />
              </motion.div>
            )}

            {activeTab === 'vocal' && (
              <motion.div
                key="vocal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Vocal Processor</h2>
                <VocalProcessor />
              </motion.div>
            )}

            {activeTab === 'scales' && (
              <motion.div
                key="scales"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Scale Explorer</h2>
                <ScaleExplorer />
              </motion.div>
            )}

            {activeTab === 'studio' && (
              <motion.div
                key="studio"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Recording Studio</h2>
                <RecordingGallery recordings={recordings} />
              </motion.div>
            )}

            {activeTab === 'lyre' && (
              <motion.div
                key="lyre"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Ancient Lyre</h2>
                <Lyre />
              </motion.div>
            )}

            {activeTab === 'harp' && (
              <motion.div
                key="harp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Concert Harp</h2>
                <Harp />
              </motion.div>
            )}

            {activeTab === 'beatbox' && (
              <motion.div
                key="beatbox"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Beatbox Studio</h2>
                <Beatbox />
              </motion.div>
            )}

            {activeTab === 'theremin' && (
              <motion.div
                key="theremin"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Electronic Theremin</h2>
                <Theremin />
              </motion.div>
            )}

            {activeTab === 'notation' && (
              <motion.div
                key="notation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Music Notation</h2>
                <MusicNotation />
              </motion.div>
            )}

            {activeTab === 'chords' && (
              <motion.div
                key="chords"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Chord Trainer</h2>
                <ChordTrainer />
              </motion.div>
            )}

            {activeTab === 'rhythm' && (
              <motion.div
                key="rhythm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Rhythm Trainer</h2>
                <RhythmTrainer />
              </motion.div>
            )}

            {activeTab === 'effects' && (
              <motion.div
                key="effects"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1200px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Effects Rack</h2>
                <EffectsRack />
              </motion.div>
            )}

            {activeTab === 'songbuilder' && (
              <motion.div
                key="songbuilder"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1200px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Song Builder</h2>
                <SongBuilder />
              </motion.div>
            )}

            {activeTab === 'eartraining' && (
              <motion.div
                key="eartraining"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <EarTraining />
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <MusicTheoryQuiz />
              </motion.div>
            )}

            {activeTab === 'kalimba' && (
              <motion.div
                key="kalimba"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Kalimba</h2>
                <Kalimba />
              </motion.div>
            )}

            {activeTab === 'flute' && (
              <motion.div
                key="flute"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Flute</h2>
                <Flute />
              </motion.div>
            )}

            {activeTab === 'marimba' && (
              <motion.div
                key="marimba"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Marimba</h2>
                <Marimba />
              </motion.div>
            )}

            {activeTab === 'accordion' && (
              <motion.div
                key="accordion"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Accordion</h2>
                <Accordion />
              </motion.div>
            )}

            {activeTab === 'ocarina' && (
              <motion.div
                key="ocarina"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Ocarina</h2>
                <Ocarina />
              </motion.div>
            )}

            {activeTab === 'sitar' && (
              <motion.div
                key="sitar"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Sitar</h2>
                <Sitar />
              </motion.div>
            )}

            {activeTab === 'chiptune' && (
              <motion.div
                key="chiptune"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Chiptune />
              </motion.div>
            )}

            {activeTab === 'didgeridoo' && (
              <motion.div
                key="didgeridoo"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Didgeridoo</h2>
                <Didgeridoo />
              </motion.div>
            )}

            {activeTab === 'steelpan' && (
              <motion.div
                key="steelpan"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Steel Pan</h2>
                <SteelPan />
              </motion.div>
            )}

            {activeTab === 'glockenspiel' && (
              <motion.div
                key="glockenspiel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Glockenspiel</h2>
                <Glockenspiel />
              </motion.div>
            )}

            {activeTab === 'banjo' && (
              <motion.div
                key="banjo"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Banjo</h2>
                <Banjo />
              </motion.div>
            )}

            {activeTab === 'oscilloscope' && (
              <motion.div
                key="oscilloscope"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Oscilloscope</h2>
                <Oscilloscope />
              </motion.div>
            )}

            {activeTab === 'vinyl' && (
              <motion.div
                key="vinyl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Vinyl Simulator</h2>
                <VinylSimulator />
              </motion.div>
            )}

            {activeTab === 'musicbox' && (
              <motion.div
                key="musicbox"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Music Box</h2>
                <MusicBox />
              </motion.div>
            )}

            {activeTab === 'glassarmonica' && (
              <motion.div
                key="glassarmonica"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Glass Armonica</h2>
                <GlassArmonica />
              </motion.div>
            )}

            {activeTab === 'koto' && (
              <motion.div
                key="koto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Koto</h2>
                <Koto />
              </motion.div>
            )}

            {activeTab === 'glitch' && (
              <motion.div
                key="glitch"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8, color: '#ff0055' }}>Glitch Effect</h2>
                <GlitchEffect />
              </motion.div>
            )}
                
            {activeTab === 'organ' && (
              <motion.div
                key="organ"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Tonewheel Organ</h2>
                <Organ />
              </motion.div>
            )}

            {activeTab === 'choir' && (
              <motion.div
                key="choir"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Synthesized Choir</h2>
                <Choir />
              </motion.div>
            )}

            {activeTab === 'saxophone' && (
              <motion.div
                key="saxophone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Expressive Saxophone</h2>
                <Saxophone />
              </motion.div>
            )}

            {activeTab === 'cello' && (
              <motion.div
                key="cello"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Resonant Cello</h2>
                <Cello />
              </motion.div>
            )}

            {activeTab === 'turntables' && (
              <motion.div
                key="turntables"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Virtual Turntables</h2>
                <Turntables />
              </motion.div>
            )}

            {activeTab === 'ukulele' && (
              <motion.div
                key="ukulele"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Acoustic Ukulele</h2>
                <Ukulele />
              </motion.div>
            )}

            {activeTab === 'tabla' && (
              <motion.div
                key="tabla"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Tabla</h2>
                <Tabla />
              </motion.div>
            )}

            {activeTab === 'trumpet' && (
              <motion.div
                key="trumpet"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Trumpet</h2>
                <Trumpet />
              </motion.div>
            )}

            {activeTab === 'vibraphone' && (
              <motion.div
                key="vibraphone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Vibraphone</h2>
                <Vibraphone />
              </motion.div>
            )}

            {activeTab === 'harmonica' && (
              <motion.div
                key="harmonica"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Harmonica</h2>
                <Harmonica />
              </motion.div>
            )}

            {activeTab === 'shamisen' && (
              <motion.div
                key="shamisen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Shamisen</h2>
                <Shamisen />
              </motion.div>
            )}

            {activeTab === 'hangdrum' && (
              <motion.div
                key="hangdrum"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Hang Drum</h2>
                <HangDrum />
              </motion.div>
            )}

            {activeTab === 'timpani' && (
              <motion.div
                key="timpani"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Timpani</h2>
                <Timpani />
              </motion.div>
            )}

            {activeTab === 'kazoo' && (
              <motion.div
                key="kazoo"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Kazoo</h2>
                <Kazoo />
              </motion.div>
            )}

            {activeTab === 'granularsynth' && (
              <motion.div
                key="granularsynth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Granular Synth</h2>
                <GranularSynth />
              </motion.div>
            )}

            {activeTab === 'djmixer' && (
              <motion.div
                key="djmixer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>DJ Mixer</h2>
                <DJMixer />
              </motion.div>
            )}

            {activeTab === 'panflute' && (
              <motion.div
                key="panflute"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Pan Flute</h2>
                <PanFlute />
              </motion.div>
            )}

            {activeTab === 'erhu' && (
              <motion.div
                key="erhu"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Erhu</h2>
                <Erhu />
              </motion.div>
            )}

            {activeTab === 'xylophone' && (
              <motion.div
                key="xylophone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Xylophone</h2>
                <Xylophone />
              </motion.div>
            )}

            {activeTab === 'multitrack' && (
              <motion.div
                key="multitrack"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Multi-Track Arranger</h2>
                <MultiTrackArranger />
              </motion.div>
            )}

            {activeTab === 'mellotron' && (
              <motion.div
                key="mellotron"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Mellotron</h2>
                <Mellotron />
              </motion.div>
            )}

            {activeTab === 'hurdygurdy' && (
              <motion.div
                key="hurdygurdy"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Hurdy Gurdy</h2>
                <HurdyGurdy />
              </motion.div>
            )}

            {activeTab === 'oboe' && (
              <motion.div
                key="oboe"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Oboe</h2>
                <Oboe />
              </motion.div>
            )}

            {activeTab === 'gong' && (
              <motion.div
                key="gong"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Gong</h2>
                <Gong />
              </motion.div>
            )}

            {activeTab === 'bagpipes' && (
              <motion.div
                key="bagpipes"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Bagpipes</h2>
                <Bagpipes />
              </motion.div>
            )}

            {activeTab === 'autoharp' && (
              <motion.div
                key="autoharp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Autoharp</h2>
                <Autoharp />
              </motion.div>
            )}

            {activeTab === 'vocoder' && (
              <motion.div
                key="vocoder"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Vocoder</h2>
                <Vocoder />
              </motion.div>
            )}

            {activeTab === 'waterphone' && (
              <motion.div
                key="waterphone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Waterphone</h2>
                <Waterphone />
              </motion.div>
            )}

            {activeTab === 'otamatone' && (
              <motion.div
                key="otamatone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Otamatone</h2>
                <Otamatone />
              </motion.div>
            )}

            {activeTab === 'jawharp' && (
              <motion.div
                key="jawharp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Jaw Harp</h2>
                <JawHarp />
              </motion.div>
            )}

            {activeTab === 'foleystage' && (
              <motion.div
                key="foleystage"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Foley Stage</h2>
                <FoleyStage />
              </motion.div>
            )}

            {activeTab === 'springreverb' && (
              <motion.div
                key="springreverb"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Spring Reverb Tank</h2>
                <SpringReverb />
              </motion.div>
            )}

            {activeTab === 'tr808' && (
              <motion.div
                key="tr808"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>TR-808 Drum Machine</h2>
                <TR808 />
              </motion.div>
            )}

            {activeTab === 'tb303' && (
              <motion.div
                key="tb303"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>TB-303 Acid Bass</h2>
                <TB303 />
              </motion.div>
            )}

            {activeTab === 'stylophone' && (
              <motion.div
                key="stylophone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Stylophone</h2>
                <Stylophone />
              </motion.div>
            )}

            {activeTab === 'kaossilator' && (
              <motion.div
                key="kaossilator"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Kaossilator</h2>
                <Kaossilator />
              </motion.div>
            )}

            {activeTab === 'talkbox' && (
              <motion.div
                key="talkbox"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Talkbox</h2>
                <Talkbox />
              </motion.div>
            )}

            {activeTab === 'frenchhorn' && (
              <motion.div
                key="frenchhorn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>French Horn</h2>
                <FrenchHorn />
              </motion.div>
            )}

            {activeTab === 'doublebass' && (
              <motion.div
                key="doublebass"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Double Bass</h2>
                <DoubleBass />
              </motion.div>
            )}

            {activeTab === 'clarinet' && (
              <motion.div
                key="clarinet"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Clarinet</h2>
                <Clarinet />
              </motion.div>
            )}

            {activeTab === 'harpsichord' && (
              <motion.div
                key="harpsichord"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Harpsichord</h2>
                <Harpsichord />
              </motion.div>
            )}

            {activeTab === 'tubularbells' && (
              <motion.div
                key="tubularbells"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Tubular Bells</h2>
                <TubularBells />
              </motion.div>
            )}

            {activeTab === 'dulcimer' && (
              <motion.div
                key="dulcimer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Dulcimer</h2>
                <Dulcimer />
              </motion.div>
            )}

            {activeTab === 'balalaika' && (
              <motion.div
                key="balalaika"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Balalaika</h2>
                <Balalaika />
              </motion.div>
            )}

            {activeTab === 'vibraphone' && (
              <motion.div
                key="vibraphone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Vibraphone</h2>
                <Vibraphone />
              </motion.div>
            )}

            {activeTab === 'alphorn' && (
              <motion.div
                key="alphorn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Alphorn</h2>
                <Alphorn />
              </motion.div>
            )}

            {activeTab === 'ondesmartenot' && (
              <motion.div
                key="ondesmartenot"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Ondes Martenot</h2>
                <OndesMartenot />
              </motion.div>
            )}

            {activeTab === 'spectralanalyzer' && (
              <motion.div
                key="spectralanalyzer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <SpectralAnalyzer />
              </motion.div>
            )}

            {activeTab === 'modularsynth' && (
              <motion.div
                key="modularsynth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <ModularSynth />
              </motion.div>
            )}

            {activeTab === 'bowedvibraphone' && (
              <motion.div
                key="bowedvibraphone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <BowedVibraphone />
              </motion.div>
            )}

            {activeTab === 'tapeecho' && (
              <motion.div
                key="tapeecho"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <TapeEcho />
              </motion.div>
            )}

            {activeTab === 'euclidean' && (
              <motion.div
                key="euclidean"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <EuclideanSequencer />
              </motion.div>
            )}

            {activeTab === 'vectorsynth' && (
              <motion.div
                key="vectorsynth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <VectorSynth />
              </motion.div>
            )}

            {activeTab === 'phasedistortion' && (
              <motion.div
                key="phasedistortion"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <PhaseDistortionSynth />
              </motion.div>
            )}

            {activeTab === 'bitcrusher' && (
              <motion.div
                key="bitcrusher"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <BitcrusherEffect />
              </motion.div>
            )}

            {activeTab === 'spectraldelay' && (
              <motion.div
                key="spectraldelay"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <SpectralDelay />
              </motion.div>
            )}

            {activeTab === 'harmonizer' && (
              <motion.div
                key="harmonizer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <VocalHarmonizer />
              </motion.div>
            )}

            {activeTab === 'wavetable' && (
              <motion.div
                key="wavetable"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <WavetableEditor />
              </motion.div>
            )}

            {activeTab === 'chordgen' && (
              <motion.div
                key="chordgen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <ChordProgressionGenerator />
              </motion.div>
            )}

            {activeTab === 'reverb' && (
              <motion.div
                key="reverb"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <ConvolutionReverb />
              </motion.div>
            )}

            {activeTab === 'mastermixer' && (
              <motion.div
                key="mastermixer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1100px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <MasterMixer />
              </motion.div>
            )}

            {activeTab === 'fm4' && (
              <motion.div
                key="fm4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1200px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <FM4Synth />
              </motion.div>
            )}

            {activeTab === 'additive' && (
              <motion.div
                key="additive"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1100px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <AdditiveSynth />
              </motion.div>
            )}

            {activeTab === 'pluck' && (
              <motion.div
                key="pluck"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <KarplusStrongSynth />
              </motion.div>
            )}

            {activeTab === 'subsynth' && (
              <motion.div
                key="subsynth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <SubSynth />
              </motion.div>
            )}

            {activeTab === 'formant' && (
              <motion.div
                key="formant"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <FormantFilter />
              </motion.div>
            )}

            {activeTab === 'distortion' && (
              <motion.div
                key="distortion"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <DistortionRack />
              </motion.div>
            )}

            {activeTab === 'imager' && (
              <motion.div
                key="imager"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <StereoImager />
              </motion.div>
            )}

            {activeTab === 'patternarp' && (
              <motion.div
                key="patternarp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1100px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <PatternArpeggiator />
              </motion.div>
            )}

            {activeTab === 'lfo' && (
              <motion.div
                key="lfo"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <LFOModulator />
              </motion.div>
            )}

            {activeTab === 'macro' && (
              <motion.div
                key="macro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1300px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <PerformanceMacro />
              </motion.div>
            )}

            {activeTab === 'ailyrics' && (
              <motion.div
                key="ailyrics"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <AILyricsGenerator />
              </motion.div>
            )}

            {activeTab === 'neuraldrums' && (
              <motion.div
                key="neuraldrums"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <NeuralDrumSynth />
              </motion.div>
            )}

            {activeTab === 'technokick' && (
              <motion.div
                key="technokick"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <TechnoKickDesigner />
              </motion.div>
            )}

            {activeTab === 'cloudtexture' && (
              <motion.div
                key="cloudtexture"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <CloudTextureGenerator />
              </motion.div>
            )}

            {activeTab === 'multiband' && (
              <motion.div
                key="multiband"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <MultibandDynamics />
              </motion.div>
            )}

            {activeTab === 'vocaltuner' && (
              <motion.div
                key="vocaltuner"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <VocalTuner />
              </motion.div>
            )}

            {activeTab === 'sidechain' && (
              <motion.div
                key="sidechain"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <SidechainPumper />
              </motion.div>
            )}

            {activeTab === 'resonator' && (
              <motion.div
                key="resonator"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <SpectralResonator />
              </motion.div>
            )}

            {activeTab === 'shaper' && (
              <motion.div
                key="shaper"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <TransientShaper />
              </motion.div>
            )}

            {activeTab === 'masterchain' && (
              <motion.div
                key="masterchain"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1100px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <MasteringChain />
              </motion.div>
            )}

            {activeTab === 'aibassline' && (
              <motion.div
                key="aibassline"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <AIBasslineGenerator />
              </motion.div>
            )}

            {activeTab === 'stutter' && (
              <motion.div
                key="stutter"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <StutterRack />
              </motion.div>
            )}

            {activeTab === 'tapesat' && (
              <motion.div
                key="tapesat"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <TapeSatPro />
              </motion.div>
            )}

            {activeTab === 'polyarp' && (
              <motion.div
                key="polyarp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <PolyArpPro />
              </motion.div>
            )}

            {activeTab === 'spectrogram3d' && (
              <motion.div
                key="spectrogram3d"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <Spectrogram3D />
              </motion.div>
            )}

            {activeTab === 'reversereverb' && (
              <motion.div
                key="reversereverb"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <ReverseReverb />
              </motion.div>
            )}

            {activeTab === 'exciter' && (
              <motion.div
                key="exciter"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <HarmonicExciter />
              </motion.div>
            )}

            {activeTab === 'wavetablemorph' && (
              <motion.div
                key="wavetablemorph"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <WavetableMorpher />
              </motion.div>
            )}

            {activeTab === 'midihub' && (
              <motion.div
                key="midihub"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <MIDIEffectsHub />
              </motion.div>
            )}

            {activeTab === 'freqsidechain' && (
              <motion.div
                key="freqsidechain"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <FrequencySidechain />
              </motion.div>
            )}

            {activeTab === 'soundscape' && (
              <motion.div
                key="soundscape"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <NeuralSoundscape />
              </motion.div>
            )}

            {activeTab === 'orchestralstrings' && (
              <motion.div
                key="orchestralstrings"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <OrchestralStrings />
              </motion.div>
            )}

            {activeTab === 'pipeorgan' && (
              <motion.div
                key="pipeorgan"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <PipeOrganPro />
              </motion.div>
            )}

            {activeTab === 'bpmdetector' && (
              <motion.div
                key="bpmdetector"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <AIBPMDetector />
              </motion.div>
            )}

            {activeTab === 'limiter' && (
              <motion.div
                key="limiter"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <MultibandLimiter />
              </motion.div>
            )}

            {activeTab === 'widener' && (
              <motion.div
                key="widener"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <StereoWidenerPro />
              </motion.div>
            )}

            {activeTab === 'phasedistortion' && (
              <motion.div
                key="phasedistortion"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <PhaseDistortionSynth />
              </motion.div>
            )}

            {activeTab === 'resmapper' && (
              <motion.div
                key="resmapper"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <ResonanceMapper />
              </motion.div>
            )}

            {activeTab === 'arrangementhelper' && (
              <motion.div
                key="arrangementhelper"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1100px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <AIArrangementHelper />
              </motion.div>
            )}

            {activeTab === 'noiseengine' && (
              <motion.div
                key="noiseengine"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <NoiseEngine />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Persistent Visualizer at bottom */}
        <div style={{ height: '80px', padding: '0 40px', marginBottom: '10px' }}>
          <AudioVisualizer />
        </div>

        {/* Collapsible Utility Panel */}
        <AnimatePresence>
          {showUtilities && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ 
                background: 'rgba(0,0,0,0.3)', 
                borderTop: '1px solid var(--glass-border)',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '20px 40px', display: 'flex', gap: '20px', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
                <ThemeManager currentTheme={theme} onThemeChange={handleThemeChange} />
                <ProjectManager onSave={saveProject} onLoad={handleProjectLoad} />
                <MasterFX />
                <SessionSettings />
                <Arpeggiator />
                <Soundboard />
                <ChordProgression />
                <MidiManager onNoteOn={handleMidiNoteOn} onNoteOff={handleMidiNoteOff} />
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', width: '200px', alignItems: 'center', justifyContent: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ef4444' }}>Emergency</h4>
                  <button 
                    className="btn-glass"
                    onClick={() => {
                      Tone.Destination.mute = true;
                      setTimeout(() => { Tone.Destination.mute = false; }, 100);
                      Tone.Transport.stop();
                    }}
                    style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    <Skull size={16} /> PANIC
                  </button>
                </div>
                <Tuner />
                <Metronome />
                <Looper />
                <ChordDictionary />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Studio Tools Panel */}
        <AnimatePresence>
          {showStudioTools && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '400px',
                background: 'var(--glass-bg)',
                borderTop: '1px solid var(--glass-border)',
                backdropFilter: 'blur(20px)',
                zIndex: 50,
                overflowY: 'auto'
              }}
            >
              <div style={{ padding: '20px 40px', display: 'flex', gap: '20px', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '100%', maxWidth: '800px', marginBottom: '20px' }}>
                  <AudioVisualizer />
                </div>
                <DrumSequencer />
                <MelodicSequencer />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setShowGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '600px', padding: '40px', position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '20px' }}>Welcome to Veritutz</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-main)', opacity: 0.9, lineHeight: 1.6 }}>
                <section>
                  <h4 style={{ color: 'var(--accent-primary)', marginBottom: '5px' }}>Multi-Instrument Studio</h4>
                  <p>Switch between Piano, Violin, Guitar, and Synths using the top navigation bar. Each instrument is optimized for a unique playing experience.</p>
                </section>
                <section>
                  <h4 style={{ color: 'var(--accent-primary)', marginBottom: '5px' }}>Production Tools</h4>
                  <p>Click the <strong>Tools</strong> button to access the Master FX Rack, Tuner, Metronome, and Loop Station.</p>
                </section>
                <section>
                  <h4 style={{ color: 'var(--accent-primary)', marginBottom: '5px' }}>Recording & Studio</h4>
                  <p>Use the <strong>Recorder</strong> in the header to capture your performance. Visit the <strong>Studio</strong> tab to playback and download your sessions.</p>
                </section>
              </div>
              <button 
                className="btn-glass active" 
                onClick={() => setShowGuide(false)}
                style={{ width: '100%', justifyContent: 'center', marginTop: '30px' }}
              >
                Let's Jam!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
