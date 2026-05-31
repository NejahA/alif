import * as Tone from 'tone';

// Create effects
const reverb = new Tone.Reverb({
  decay: 2.5,
  wet: 0
});

const eq = new Tone.EQ3({
  low: 0,
  mid: 0,
  high: 0
}).connect(reverb);

const bitcrusher = new Tone.BitCrusher({
  bits: 16,
  wet: 0
}).connect(eq);

const delay = new Tone.FeedbackDelay({
  delayTime: '8n',
  feedback: 0.3,
  wet: 0
}).connect(bitcrusher);

const compressor = new Tone.Compressor({
  threshold: -20,
  ratio: 4,
  attack: 0.01,
  release: 0.25
}).connect(delay);

const limiter = new Tone.Limiter(-1).toDestination();
reverb.connect(limiter);

const masterBus = compressor;

export const setReverbWet = (value) => {
  reverb.wet.rampTo(value, 0.1);
};

export const setDelayWet = (value) => {
  delay.wet.rampTo(value, 0.1);
};

export const setReverbDecay = (value) => {
  reverb.decay = value;
};

export const setDelayFeedback = (value) => {
  delay.feedback.rampTo(value, 0.1);
};

export const setEQLow = (value) => {
  eq.low.rampTo(value, 0.1);
};

export const setEQMid = (value) => {
  eq.mid.rampTo(value, 0.1);
};

export const setEQHigh = (value) => {
  eq.high.rampTo(value, 0.1);
};

export const setBitcrusherWet = (value) => {
  bitcrusher.wet.rampTo(value, 0.1);
};

export const setBitcrusherBits = (value) => {
  bitcrusher.bits = value;
};

export default masterBus;
