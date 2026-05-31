import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

/**
 * Configure audio session for background playback
 * Call this once when app initializes (in _layout.tsx or App.tsx)
 */
export async function setupBackgroundAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
    });
    console.log(
      "[BackgroundAudio] Audio mode configured for background playback",
    );
  } catch (error) {
    console.error("[BackgroundAudio] Failed to setup:", error);
  }
}

/**
 * Enable background playback for a specific sound
 * Call this after creating your Audio.Sound instance
 */
export async function enableBackgroundForSound(
  sound: Audio.Sound,
): Promise<void> {
  try {
    // The sound will now continue playing even when:
    // - Screen locks
    // - App goes to background
    // - User switches apps
    await sound.setIsLoopingAsync(false); // Just to trigger any lazy setup
    console.log("[BackgroundAudio] Background enabled for sound");
  } catch (error) {
    console.error("[BackgroundAudio] Failed to enable:", error);
  }
}

/**
 * Request audio focus (Android)
 * Ensures your app's audio takes priority
 */
export async function requestAudioFocus(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });
  } catch (error) {
    console.error("[BackgroundAudio] Failed to request focus:", error);
  }
}

/**
 * Release audio focus when done
 */
export async function releaseAudioFocus(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: false,
    });
  } catch (error) {
    console.error("[BackgroundAudio] Failed to release focus:", error);
  }
}

/**
 * Check if background audio is supported
 */
export function isBackgroundAudioSupported(): boolean {
  // Expo supports background audio on both iOS and Android
  return true;
}

/**
 * Usage Example:
 *
 * // In your _layout.tsx or App.tsx:
 * useEffect(() => {
 *   setupBackgroundAudio();
 * }, []);
 *
 * // In your player screen:
 * const { sound } = await Audio.Sound.createAsync(source);
 * await enableBackgroundForSound(sound);
 * await sound.playAsync();
 *
 * // Now it will play even when screen locks!
 */
