import { Audio } from 'expo-av';

export type PlaybackSpeed = 0.5 | 0.75 | 1.0 | 1.25 | 1.5;

export const SPEED_OPTIONS: { value: PlaybackSpeed; label: string }[] = [
  { value: 0.5, label: '0.5×' },
  { value: 0.75, label: '0.75×' },
  { value: 1.0, label: 'Normal' },
  { value: 1.25, label: '1.25×' },
  { value: 1.5, label: '1.5×' },
];

/**
 * Set playback speed for a sound
 */
export async function setPlaybackSpeed(
  sound: Audio.Sound,
  speed: PlaybackSpeed
): Promise<void> {
  try {
    await sound.setRateAsync(speed, true, Audio.PitchCorrectionQuality.High);
    console.log(`[AudioSpeed] Set to ${speed}×`);
  } catch (error) {
    console.error('[AudioSpeed] Error setting speed:', error);
  }
}

/**
 * Get current playback speed
 */
export async function getPlaybackSpeed(sound: Audio.Sound): Promise<number> {
  try {
    const status = await sound.getStatusAsync();
    return status.isLoaded ? status.rate : 1.0;
  } catch (error) {
    console.error('[AudioSpeed] Error getting speed:', error);
    return 1.0;
  }
}

/**
 * Save user's preferred speed for future sessions
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPEED_KEY = '@preferred_playback_speed';

export async function savePreferredSpeed(speed: PlaybackSpeed): Promise<void> {
  try {
    await AsyncStorage.setItem(SPEED_KEY, speed.toString());
  } catch (error) {
    console.error('[AudioSpeed] Error saving preferred speed:', error);
  }
}

export async function getPreferredSpeed(): Promise<PlaybackSpeed> {
  try {
    const saved = await AsyncStorage.getItem(SPEED_KEY);
    return saved ? (parseFloat(saved) as PlaybackSpeed) : 1.0;
  } catch (error) {
    return 1.0;
  }
}

/**
 * Calculate adjusted duration based on speed
 */
export function calculateAdjustedDuration(
  originalDuration: number,
  speed: PlaybackSpeed
): number {
  return originalDuration / speed;
}

/**
 * Format speed for display
 */
export function formatSpeed(speed: number): string {
  return speed === 1.0 ? 'Normal' : `${speed}×`;
}

/**
 * Usage in Player:
 * 
 * const [speed, setSpeed] = useState<PlaybackSpeed>(1.0);
 * 
 * // Load preferred speed on mount
 * useEffect(() => {
 *   (async () => {
 *     const preferred = await getPreferredSpeed();
 *     setSpeed(preferred);
 *     if (sound) {
 *       await setPlaybackSpeed(sound, preferred);
 *     }
 *   })();
 * }, []);
 * 
 * // Change speed
 * const handleSpeedChange = async (newSpeed: PlaybackSpeed) => {
 *   setSpeed(newSpeed);
 *   if (sound) {
 *     await setPlaybackSpeed(sound, newSpeed);
 *     await savePreferredSpeed(newSpeed);
 *   }
 * };
 */
