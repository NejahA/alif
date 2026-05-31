import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useTheme } from "../../contexts/ThemeContext";
import {
  SoundMixer,
  AMBIENT_SOUNDS,
  SoundLayer,
  getSavedPresets,
  savePreset,
  deletePreset,
  MixerPreset,
} from "../utils/soundmixer";

export default function SoundMixerScreen() {
  const { colors } = useTheme();
  const mixerRef = useRef(new SoundMixer());

  const [layers, setLayers] = useState<Map<string, SoundLayer>>(new Map());
  const [presets, setPresets] = useState<MixerPreset[]>([]);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");

  useEffect(() => {
    loadPresets();

    // Cleanup on unmount
    return () => {
      mixerRef.current.cleanup();
    };
  }, []);

  const loadPresets = async () => {
    const saved = await getSavedPresets();
    setPresets(saved);
  };

  const toggleSound = async (soundId: string) => {
    const currentLayer = layers.get(soundId);
    const isCurrentlyPlaying = currentLayer?.isPlaying || false;

    if (isCurrentlyPlaying) {
      await mixerRef.current.pauseSound(soundId);
      setLayers((prev) => {
        const newLayers = new Map(prev);
        const layer = newLayers.get(soundId) || {
          soundId,
          volume: 0.5,
          isPlaying: false,
        };
        newLayers.set(soundId, { ...layer, isPlaying: false });
        return newLayers;
      });
    } else {
      await mixerRef.current.playSound(soundId);
      setLayers((prev) => {
        const newLayers = new Map(prev);
        const layer = newLayers.get(soundId) || {
          soundId,
          volume: 0.5,
          isPlaying: false,
        };
        newLayers.set(soundId, { ...layer, isPlaying: true });
        return newLayers;
      });
    }
  };

  const updateVolume = async (soundId: string, volume: number) => {
    await mixerRef.current.setVolume(soundId, volume);
    setLayers((prev) => {
      const newLayers = new Map(prev);
      const layer = newLayers.get(soundId) || {
        soundId,
        volume: 0.5,
        isPlaying: false,
      };
      newLayers.set(soundId, { ...layer, volume });
      return newLayers;
    });
  };

  const stopAll = async () => {
    await mixerRef.current.stopAll();
    setLayers((prev) => {
      const newLayers = new Map();
      prev.forEach((layer, soundId) => {
        newLayers.set(soundId, { ...layer, isPlaying: false });
      });
      return newLayers;
    });
  };

  const loadPresetConfig = async (preset: MixerPreset) => {
    await mixerRef.current.loadPreset(preset);

    const newLayers = new Map<string, SoundLayer>();
    preset.layers.forEach((layer) => {
      newLayers.set(layer.soundId, layer);
    });
    setLayers(newLayers);
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      Alert.alert("Error", "Please enter a preset name");
      return;
    }

    const activeLayers = Array.from(layers.values()).filter((l) => l.isPlaying);

    if (activeLayers.length === 0) {
      Alert.alert("Error", "Please activate at least one sound layer");
      return;
    }

    try {
      await savePreset(presetName, activeLayers);
      await loadPresets();
      setShowSavePreset(false);
      setPresetName("");
      Alert.alert("Success", `Preset "${presetName}" saved!`);
    } catch (error) {
      Alert.alert("Error", "Failed to save preset");
    }
  };

  const handleDeletePreset = (presetId: string, presetName: string) => {
    if (presetId.startsWith("default_")) {
      Alert.alert("Cannot Delete", "Default presets cannot be deleted");
      return;
    }

    Alert.alert(
      "Delete Preset",
      `Are you sure you want to delete "${presetName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deletePreset(presetId);
            await loadPresets();
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{ backgroundColor: colors.primary }}
        className="pt-16 pb-8 px-6"
      >
        <Text className="text-white text-3xl font-bold mb-2">Sound Mixer</Text>
        <Text className="text-white text-base opacity-90">
          Combine ambient sounds to create your perfect atmosphere
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Action Buttons */}
        <View className="flex-row px-6 pt-6 pb-4 gap-3">
          <TouchableOpacity
            className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
            style={{ backgroundColor: colors.error }}
            onPress={stopAll}
          >
            <Ionicons name="stop" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Stop All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
            style={{ backgroundColor: colors.primary }}
            onPress={() => setShowSavePreset(true)}
          >
            <Ionicons name="save" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Save Preset</Text>
          </TouchableOpacity>
        </View>

        {/* Sound Layers */}
        <View className="px-6 pb-6">
          <Text
            className="text-xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            Sound Layers
          </Text>

          {AMBIENT_SOUNDS.map((sound) => {
            const layer = layers.get(sound.id);
            const isPlaying = layer?.isPlaying || false;
            const volume = layer?.volume || 0.5;

            return (
              <View
                key={sound.id}
                className="rounded-2xl p-4 mb-3 border"
                style={{
                  backgroundColor: colors.card,
                  borderColor: isPlaying ? sound.color : colors.border,
                  borderWidth: isPlaying ? 2 : 1,
                }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${sound.color}20` }}
                    >
                      <Text className="text-2xl">{sound.icon}</Text>
                    </View>
                    <View>
                      <Text
                        className="text-base font-semibold"
                        style={{ color: colors.text }}
                      >
                        {sound.name}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        {isPlaying ? "Playing" : "Stopped"}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: isPlaying ? sound.color : colors.surface,
                    }}
                    onPress={() => toggleSound(sound.id)}
                  >
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={24}
                      color={isPlaying ? "white" : colors.text}
                    />
                  </TouchableOpacity>
                </View>

                {/* Volume Slider */}
                {isPlaying && (
                  <View>
                    <View className="flex-row justify-between items-center mb-1">
                      <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Volume
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        {Math.round(volume * 100)}%
                      </Text>
                    </View>
                    <Slider
                      style={{ width: "100%", height: 30 }}
                      minimumValue={0}
                      maximumValue={1}
                      value={volume}
                      minimumTrackTintColor={sound.color}
                      maximumTrackTintColor={colors.border}
                      thumbTintColor={sound.color}
                      onValueChange={(value) => updateVolume(sound.id, value)}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Presets */}
        <View className="px-6 pb-6">
          <Text
            className="text-xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            Saved Presets
          </Text>

          {presets.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              className="rounded-2xl p-4 mb-3 border flex-row items-center justify-between"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              onPress={() => loadPresetConfig(preset)}
            >
              <View className="flex-1">
                <Text
                  className="text-lg font-semibold mb-1"
                  style={{ color: colors.text }}
                >
                  {preset.name}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {preset.layers.length} sounds
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                {!preset.id.startsWith("default_") && (
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => handleDeletePreset(preset.id, preset.name)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                )}
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  style={{ color: colors.textSecondary }}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Save Preset Modal */}
      {showSavePreset && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="m-6 rounded-2xl p-6 w-full max-w-sm"
            style={{ backgroundColor: colors.card }}
          >
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: colors.text }}
            >
              Save Preset
            </Text>

            <TextInput
              className="border rounded-xl px-4 py-3 mb-4 text-base"
              style={{
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
              }}
              placeholder="Enter preset name..."
              placeholderTextColor={colors.placeholder}
              value={presetName}
              onChangeText={setPresetName}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl"
                style={{ backgroundColor: colors.surface }}
                onPress={() => {
                  setShowSavePreset(false);
                  setPresetName("");
                }}
              >
                <Text
                  className="text-center font-semibold"
                  style={{ color: colors.text }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 rounded-xl"
                style={{ backgroundColor: colors.primary }}
                onPress={handleSavePreset}
              >
                <Text className="text-center font-semibold text-white">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
