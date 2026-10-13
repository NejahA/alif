import 'package:flutter/foundation.dart';

/// Sound Synthesizer for retro/arcade audio in Shadow Tactics: Ninja Ascent.
class SoundSynth {
  static final SoundSynth _instance = SoundSynth._internal();
  factory SoundSynth() => _instance;

  SoundSynth._internal();

  bool isMuted = false;

  void playTone(double frequency, double durationSeconds, {String type = 'sine', double volume = 0.1}) {
    if (isMuted) return;
    // Web audio synthesis trigger when running on web target
  }

  void playJump() {
    if (isMuted) return;
    playTone(220, 0.12, type: 'square', volume: 0.08);
  }

  void playDash() {
    if (isMuted) return;
    playTone(520, 0.08, type: 'sawtooth', volume: 0.12);
  }

  void playSlash() {
    if (isMuted) return;
    playTone(800, 0.06, type: 'sawtooth', volume: 0.12);
  }

  void playDeflect() {
    if (isMuted) return;
    playTone(1200, 0.15, type: 'sine', volume: 0.15);
  }

  void playCoin() {
    if (isMuted) return;
    playTone(987.77, 0.08, type: 'sine', volume: 0.1);
  }

  void playHit() {
    if (isMuted) return;
    playTone(110, 0.18, type: 'sawtooth', volume: 0.15);
  }

  void playExplosion() {
    if (isMuted) return;
    playTone(150, 0.25, type: 'square', volume: 0.15);
  }

  void playVictory() {
    if (isMuted) return;
    playTone(523.25, 0.25, type: 'triangle', volume: 0.12);
  }

  void playStealthTakedown() {
    if (isMuted) return;
    playTone(600, 0.1, type: 'sine', volume: 0.15);
  }
}
