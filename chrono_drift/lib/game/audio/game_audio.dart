import 'package:flutter/services.dart';

class GameAudio {
  static bool soundEnabled = true;
  static bool hapticsEnabled = true;

  static void playShoot() {
    if (!soundEnabled) return;
    // Tactile light tick
    if (hapticsEnabled) {
      HapticFeedback.selectionClick();
    }
  }

  static void playRewind() {
    if (!soundEnabled) return;
    if (hapticsEnabled) {
      HapticFeedback.heavyImpact();
    }
    SystemSound.play(SystemSoundType.click);
  }

  static void playExplosion() {
    if (!soundEnabled) return;
    if (hapticsEnabled) {
      HapticFeedback.mediumImpact();
    }
  }

  static void playCoreCollect() {
    if (!soundEnabled) return;
    if (hapticsEnabled) {
      HapticFeedback.lightImpact();
    }
  }

  static void playLevelUp() {
    if (!soundEnabled) return;
    if (hapticsEnabled) {
      HapticFeedback.vibrate();
    }
    SystemSound.play(SystemSoundType.click);
  }

  static void playDash() {
    if (!soundEnabled) return;
    if (hapticsEnabled) {
      HapticFeedback.mediumImpact();
    }
    SystemSound.play(SystemSoundType.click);
  }

  static void playRefract() {
    if (!soundEnabled) return;
    if (hapticsEnabled) {
      HapticFeedback.lightImpact();
    }
  }

  static void playChronoCollapse() {
    if (!soundEnabled) return;
    if (hapticsEnabled) {
      HapticFeedback.heavyImpact();
    }
    SystemSound.play(SystemSoundType.alert);
  }

  static void playOverdrive() {
    if (!soundEnabled) return;
    if (hapticsEnabled) {
      HapticFeedback.vibrate();
    }
    SystemSound.play(SystemSoundType.click);
  }

  static void playGraze() {
    if (!soundEnabled) return;
    if (hapticsEnabled) {
      HapticFeedback.selectionClick();
    }
  }

  static void playParry() {
    if (!soundEnabled) return;
    if (hapticsEnabled) {
      HapticFeedback.heavyImpact();
    }
    SystemSound.play(SystemSoundType.click);
  }

  static void playTetherSever() {
    if (!soundEnabled) return;
    if (hapticsEnabled) {
      HapticFeedback.lightImpact();
    }
  }

  static void playBulletTime() {
    if (!soundEnabled) return;
    if (hapticsEnabled) {
      HapticFeedback.heavyImpact();
    }
    SystemSound.play(SystemSoundType.alert);
  }

  static void playAnchorRewind() {
    if (!soundEnabled) return;
    if (hapticsEnabled) {
      HapticFeedback.heavyImpact();
    }
    SystemSound.play(SystemSoundType.click);
  }
}
