import * as Tone from 'tone';

class MasterBusEngine {
  constructor() {
    this.initialized = false;
    this.channels = {};
    this.panners = {};
    this.effects = {};
  }

  init() {
    if (this.initialized) return;

    // Output Chain
    this.limiter = new Tone.Limiter(-1).toDestination();
    this.softClipper = new Tone.Limiter(-0.5).connect(this.limiter);
    this.masterBalance = new Tone.Panner(0).connect(this.softClipper);

    // Meters
    this.preLimiterMeter = new Tone.Meter();
    this.postLimiterMeter = new Tone.Meter();

    this.widener = new Tone.StereoWidener(0.5).connect(this.masterBalance);
    this.widener.fan(this.preLimiterMeter);
    this.limiter.fan(this.postLimiterMeter);

    this.chorus = new Tone.Chorus({
      frequency: 4,
      delayTime: 2.5,
      depth: 0.5,
      wet: 0
    }).connect(this.widener);

    this.phaser = new Tone.Phaser({
      frequency: 15,
      octaves: 5,
      baseFrequency: 1000,
      wet: 0
    }).connect(this.chorus);

    this.tapeDistortion = new Tone.Distortion({
      distortion: 0,
      wet: 0
    }).connect(this.phaser);

    this.tapeFilter = new Tone.Filter({
      frequency: 20000,
      type: 'lowpass'
    }).connect(this.tapeDistortion);

    this.masterFilter = new Tone.Filter({
      frequency: 20000,
      type: 'lowpass',
      rolloff: -24
    }).connect(this.tapeFilter);

    this.glitchDelay = new Tone.FeedbackDelay({
      delayTime: '16n',
      feedback: 0.8,
      wet: 0
    }).connect(this.masterFilter);

    this.reverb = new Tone.Reverb({
      decay: 2.5,
      wet: 0
    }).connect(this.glitchDelay);

    this.galaxyReverb = new Tone.Freeverb({
      roomSize: 0.9,
      dampening: 3000,
      wet: 0
    }).connect(this.reverb);

    this.eq = new Tone.EQ3({
      low: 0,
      mid: 0,
      high: 0
    }).connect(this.reverb);

    this.bitcrusher = new Tone.BitCrusher({
      bits: 16,
      wet: 0
    }).connect(this.eq);

    this.delay = new Tone.FeedbackDelay({
      delayTime: '8n',
      feedback: 0.3,
      wet: 0
    }).connect(this.bitcrusher);

    this.compressor = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.01,
      release: 0.25
    }).connect(this.delay);

    // Channel Mixer
    ['piano', 'violin', 'cello', 'guitar', 'drums', 'pads', 'sampler', 'synth', 'seq', 'bass', 'vocal', 'ambient'].forEach(id => {
      this.panners[id] = new Tone.Panner(0).connect(this.compressor);
      this.channels[id] = new Tone.Gain(1).connect(this.panners[id]);
    });

    this.initialized = true;
  }

  // Exported helpers for MasterFX and other components
  setReverbWet = (val) => { this.init(); this.reverb.wet.rampTo(val, 0.1); }
  setDelayWet = (val) => { this.init(); this.delay.wet.rampTo(val, 0.1); }
  setReverbDecay = (val) => { this.init(); this.reverb.decay = val; }
  setDelayFeedback = (val) => { this.init(); this.delay.feedback.rampTo(val, 0.1); }
  setEQLow = (val) => { this.init(); this.eq.low.rampTo(val, 0.1); }
  setEQMid = (val) => { this.init(); this.eq.mid.rampTo(val, 0.1); }
  setEQHigh = (val) => { this.init(); this.eq.high.rampTo(val, 0.1); }
  setBitcrusherWet = (val) => { this.init(); this.bitcrusher.wet.rampTo(val, 0.1); }
  setBitcrusherBits = (val) => { this.init(); this.bitcrusher.bits = val; }
  setChorusWet = (val) => { this.init(); this.chorus.wet.rampTo(val, 0.1); }
  setWidenerWidth = (val) => { this.init(); this.widener.width.rampTo(val, 0.1); }
  setTapeSaturation = (val) => { this.init(); this.tapeDistortion.distortion = val; this.tapeDistortion.wet.rampTo(val > 0 ? 1 : 0, 0.1); }
  setTapeWarmth = (val) => { 
    this.init(); 
    // Linear scale mapping from 20000Hz to 2000Hz
    const freq = 20000 - (val * 18000);
    this.tapeFilter.frequency.rampTo(freq, 0.1); 
  }
  setGalaxyReverb = (val) => { this.init(); this.galaxyReverb.wet.rampTo(val, 0.1); }
  setMasterFilterFreq = (val) => { this.init(); this.masterFilter.frequency.rampTo(val, 0.1); }
  setGlitchWet = (val) => { this.init(); this.glitchDelay.wet.rampTo(val, 0.1); }
  setPhaserWet = (val) => { this.init(); this.phaser.wet.rampTo(val, 0.1); }
  setSwing = (val) => { this.init(); Tone.Transport.swing = val; }
  setMasterBalance = (val) => { this.init(); this.masterBalance.pan.rampTo(val, 0.1); }
  setSoftClipThreshold = (val) => { this.init(); this.softClipper.threshold.rampTo(val, 0.1); }
  setMasterLimiterThreshold = (val) => { this.init(); this.limiter.threshold.rampTo(val, 0.1); }

  setChannelVolume(id, volume) {
    this.init();
    if (this.channels[id]) {
      this.channels[id].gain.rampTo(Tone.dbToGain(volume), 0.1);
    }
  }

  getChannel(id) {
    this.init();
    return this.channels[id];
  }

  connect(node) {
    this.init();
    this.limiter.connect(node);
  }

  getMasterReduction() {
    this.init();
    return this.compressor ? this.compressor.reduction : 0;
  }
}

const instance = new MasterBusEngine();

// Functional exports to maintain compatibility with existing imports
export const setReverbWet = (val) => instance.setReverbWet(val);
export const setDelayWet = (val) => instance.setDelayWet(val);
export const setReverbDecay = (val) => instance.setReverbDecay(val);
export const setDelayFeedback = (val) => instance.setDelayFeedback(val);
export const setEQLow = (val) => instance.setEQLow(val);
export const setEQMid = (val) => instance.setEQMid(val);
export const setEQHigh = (val) => instance.setEQHigh(val);
export const setBitcrusherWet = (val) => instance.setBitcrusherWet(val);
export const setBitcrusherBits = (val) => instance.setBitcrusherBits(val);
export const setChorusWet = (val) => instance.setChorusWet(val);
export const setWidenerWidth = (val) => instance.setWidenerWidth(val);
export const setTapeSaturation = (val) => instance.setTapeSaturation(val);
export const setTapeWarmth = (val) => instance.setTapeWarmth(val);
export const setGalaxyReverb = (val) => instance.setGalaxyReverb(val);
export const setMasterFilterFreq = (val) => instance.setMasterFilterFreq(val);
export const setGlitchWet = (val) => instance.setGlitchWet(val);
export const setPhaserWet = (val) => instance.setPhaserWet(val);
export const setSwing = (val) => instance.setSwing(val);
export const setMasterBalance = (val) => instance.setMasterBalance(val);
export const setSoftClipThreshold = (val) => instance.setSoftClipThreshold(val);
export const setMasterLimiterThreshold = (val) => instance.setMasterLimiterThreshold(val);
export const setChannelVolume = (id, vol) => instance.setChannelVolume(id, vol);
export const setChannelPan = (id, pan) => instance.setChannelPan(id, pan);
export const getChannel = (id) => instance.getChannel(id);
export const getMasterReduction = () => instance.getMasterReduction();

// Add missing alias if needed
export const setMasterFilter = (val) => instance.setMasterFilterFreq(val);

export const masterBus = instance;
export default masterBus;
