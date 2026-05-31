import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

const MIXER_PRESETS_KEY = "@sound_mixer_presets";

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  audioFile: any; // require() result
  color: string;
}

export interface SoundLayer {
  soundId: string;
  volume: number; // 0-1
  isPlaying: boolean;
}

export interface MixerPreset {
  id: string;
  name: string;
  layers: SoundLayer[];
  createdAt: string;
}

// Available ambient sounds
export const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: "rain",
    name: "Rain",
    icon: "🌧️",
    audioFile: require("../../assets/audio/loops/rain.mp3"), // You'd add these
    color: "#0EA5E9",
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    icon: "🌊",
    audioFile: require("../../assets/audio/loops/ocean.mp3"),
    color: "#06B6D4",
  },
  {
    id: "forest",
    name: "Forest",
    icon: "🌲",
    audioFile: require("../../assets/audio/loops/forest.mp3"),
    color: "#10B981",
  },
  {
    id: "wind",
    name: "Wind",
    icon: "💨",
    audioFile: require("../../assets/audio/loops/wind.mp3"),
    color: "#94A3B8",
  },
  {
    id: "fire",
    name: "Fireplace",
    icon: "🔥",
    audioFile: require("../../assets/audio/loops/fire.mp3"),
    color: "#F59E0B",
  },
  {
    id: "birds",
    name: "Birds",
    icon: "🐦",
    audioFile: require("../../assets/audio/loops/birds.mp3"),
    color: "#FBBF24",
  },
  {
    id: "thunder",
    name: "Thunder",
    icon: "⚡",
    audioFile: require("../../assets/audio/loops/thunder.mp3"),
    color: "#6366F1",
  },
  {
    id: "stream",
    name: "Stream",
    icon: "💧",
    audioFile: require("../../assets/audio/loops/stream.mp3"),
    color: "#14B8A6",
  },
  {
    id: "bells",
    name: "Singing Bowls",
    icon: "🔔",
    audioFile: require("../../assets/audio/loops/bells.mp3"),
    color: "#8B5CF6",
  },
];

export class SoundMixer {
  private sounds: Map<string, Audio.Sound> = new Map();
  private volumes: Map<string, number> = new Map();

  /**
   * Load a sound layer
   */
  async loadSound(soundId: string): Promise<void> {
    try {
      const ambientSound = AMBIENT_SOUNDS.find((s) => s.id === soundId);
      if (!ambientSound) {
        console.warn(`Sound ${soundId} not found`);
        return;
      }

      // Check if already loaded
      if (this.sounds.has(soundId)) {
        return;
      }

      const { sound } = await Audio.Sound.createAsync(ambientSound.audioFile, {
        shouldPlay: false,
        isLooping: true,
        volume: 0.5,
      });

      this.sounds.set(soundId, sound);
      this.volumes.set(soundId, 0.5);

      console.log(`[Mixer] Loaded sound: ${soundId}`);
    } catch (error) {
      console.error(`Error loading sound ${soundId}:`, error);
    }
  }

  /**
   * Play a sound layer
   */
  async playSound(soundId: string): Promise<void> {
    try {
      const sound = this.sounds.get(soundId);
      if (!sound) {
        await this.loadSound(soundId);
        const loadedSound = this.sounds.get(soundId);
        if (loadedSound) {
          await loadedSound.playAsync();
        }
      } else {
        await sound.playAsync();
      }
      console.log(`[Mixer] Playing: ${soundId}`);
    } catch (error) {
      console.error(`Error playing sound ${soundId}:`, error);
    }
  }

  /**
   * Pause a sound layer
   */
  async pauseSound(soundId: string): Promise<void> {
    try {
      const sound = this.sounds.get(soundId);
      if (sound) {
        await sound.pauseAsync();
        console.log(`[Mixer] Paused: ${soundId}`);
      }
    } catch (error) {
      console.error(`Error pausing sound ${soundId}:`, error);
    }
  }

  /**
   * Set volume for a sound layer
   */
  async setVolume(soundId: string, volume: number): Promise<void> {
    try {
      const sound = this.sounds.get(soundId);
      if (sound) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        await sound.setVolumeAsync(clampedVolume);
        this.volumes.set(soundId, clampedVolume);
        console.log(`[Mixer] Set volume for ${soundId}: ${clampedVolume}`);
      }
    } catch (error) {
      console.error(`Error setting volume for ${soundId}:`, error);
    }
  }

  /**
   * Get current volume for a sound
   */
  getVolume(soundId: string): number {
    return this.volumes.get(soundId) || 0.5;
  }

  /**
   * Check if a sound is playing
   */
  async isPlaying(soundId: string): Promise<boolean> {
    try {
      const sound = this.sounds.get(soundId);
      if (!sound) return false;

      const status = await sound.getStatusAsync();
      return status.isLoaded && status.isPlaying;
    } catch (error) {
      return false;
    }
  }

  /**
   * Stop all sounds
   */
  async stopAll(): Promise<void> {
    try {
      const promises = Array.from(this.sounds.values()).map((sound) =>
        sound.pauseAsync(),
      );
      await Promise.all(promises);
      console.log("[Mixer] Stopped all sounds");
    } catch (error) {
      console.error("Error stopping all sounds:", error);
    }
  }

  /**
   * Unload all sounds
   */
  async cleanup(): Promise<void> {
    try {
      const promises = Array.from(this.sounds.values()).map((sound) =>
        sound.unloadAsync(),
      );
      await Promise.all(promises);
      this.sounds.clear();
      this.volumes.clear();
      console.log("[Mixer] Cleaned up all sounds");
    } catch (error) {
      console.error("Error cleaning up sounds:", error);
    }
  }

  /**
   * Load a preset configuration
   */
  async loadPreset(preset: MixerPreset): Promise<void> {
    try {
      // Stop current sounds
      await this.stopAll();

      // Load and configure new sounds
      for (const layer of preset.layers) {
        await this.loadSound(layer.soundId);
        await this.setVolume(layer.soundId, layer.volume);

        if (layer.isPlaying) {
          await this.playSound(layer.soundId);
        }
      }

      console.log(`[Mixer] Loaded preset: ${preset.name}`);
    } catch (error) {
      console.error("Error loading preset:", error);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Preset Management
// ═══════════════════════════════════════════════════════════

/**
 * Get all saved presets
 */
export async function getSavedPresets(): Promise<MixerPreset[]> {
  try {
    const data = await AsyncStorage.getItem(MIXER_PRESETS_KEY);
    if (!data) return getDefaultPresets();

    const saved: MixerPreset[] = JSON.parse(data);
    return [...getDefaultPresets(), ...saved];
  } catch (error) {
    console.error("Error getting presets:", error);
    return getDefaultPresets();
  }
}

/**
 * Save a new preset
 */
export async function savePreset(
  name: string,
  layers: SoundLayer[],
): Promise<MixerPreset> {
  try {
    const preset: MixerPreset = {
      id: `preset_${Date.now()}`,
      name,
      layers,
      createdAt: new Date().toISOString(),
    };

    const presets = await getSavedPresets();
    const customPresets = presets.filter((p) => !p.id.startsWith("default_"));
    customPresets.push(preset);

    await AsyncStorage.setItem(
      MIXER_PRESETS_KEY,
      JSON.stringify(customPresets),
    );

    console.log(`[Mixer] Saved preset: ${name}`);
    return preset;
  } catch (error) {
    console.error("Error saving preset:", error);
    throw error;
  }
}

/**
 * Delete a preset
 */
export async function deletePreset(presetId: string): Promise<void> {
  try {
    const presets = await getSavedPresets();
    const updated = presets.filter(
      (p) => p.id !== presetId && !p.id.startsWith("default_"),
    );

    await AsyncStorage.setItem(MIXER_PRESETS_KEY, JSON.stringify(updated));
    console.log(`[Mixer] Deleted preset: ${presetId}`);
  } catch (error) {
    console.error("Error deleting preset:", error);
  }
}

/**
 * Get default presets
 */
function getDefaultPresets(): MixerPreset[] {
  return [
    {
      id: "default_rain_forest",
      name: "Rain in Forest",
      layers: [
        { soundId: "rain", volume: 0.7, isPlaying: true },
        { soundId: "forest", volume: 0.3, isPlaying: true },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: "default_ocean_storm",
      name: "Ocean Storm",
      layers: [
        { soundId: "ocean", volume: 0.6, isPlaying: true },
        { soundId: "thunder", volume: 0.2, isPlaying: true },
        { soundId: "rain", volume: 0.4, isPlaying: true },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: "default_peaceful_night",
      name: "Peaceful Night",
      layers: [
        { soundId: "fire", volume: 0.5, isPlaying: true },
        { soundId: "wind", volume: 0.2, isPlaying: true },
        { soundId: "bells", volume: 0.3, isPlaying: true },
      ],
      createdAt: new Date().toISOString(),
    },
  ];
}
