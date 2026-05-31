import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

const SLEEP_DURATIONS = [
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
  { label: "15 min", minutes: 15 },
  { label: "20 min", minutes: 20 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "60 min", minutes: 60 },
  { label: "90 min", minutes: 90 },
];

const SLEEP_SOUNDS = [
  { id: "rain", name: "Rain", icon: "🌧️", color: "#0EA5E9" },
  { id: "ocean", name: "Ocean Waves", icon: "🌊", color: "#06B6D4" },
  { id: "forest", name: "Forest", icon: "🌲", color: "#10B981" },
  { id: "white-noise", name: "White Noise", icon: "📻", color: "#6B7280" },
  { id: "none", name: "Silence", icon: "🤫", color: "#8B5CF6" },
];

type Phase = "setup" | "playing" | "fading";

export default function SleepTimerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Setup
  const [duration, setDuration] = useState(30); // minutes
  const [selectedSound, setSelectedSound] = useState(SLEEP_SOUNDS[0]);
  const [fadeMinutes, setFadeMinutes] = useState(5); // fade-out duration

  // Runtime
  const [phase, setPhase] = useState<Phase>("setup");
  const [remaining, setRemaining] = useState(0); // seconds
  const [isFading, setIsFading] = useState(false);

  // Audio
  const soundRef = useRef<Audio.Sound | null>(null);
  const volumeAnim = useRef(new Animated.Value(1)).current;

  // Timers
  const tickRef = useRef<any>(null);

  // Start timer
  const handleStart = async () => {
    const totalSeconds = duration * 60;
    setRemaining(totalSeconds);
    setPhase("playing");

    // Load and play sound if not silence
    if (selectedSound.id !== "none") {
      try {
        // In production, you'd load actual sound files
        // For now, this is the structure
        console.log(`[SleepTimer] Would load ${selectedSound.id}.mp3`);
        // const { sound } = await Audio.Sound.createAsync(
        //   require(`../../assets/audio/sleep/${selectedSound.id}.mp3`),
        //   { isLooping: true, volume: 1.0 }
        // );
        // soundRef.current = sound;
        // await sound.playAsync();
      } catch (error) {
        console.error("[SleepTimer] Error loading sound:", error);
      }
    }

    // Start countdown
    let elapsed = 0;
    tickRef.current = setInterval(() => {
      elapsed += 1;
      const left = totalSeconds - elapsed;
      setRemaining(left);

      // Start fade-out
      const fadeStartTime = fadeMinutes * 60;
      if (left <= fadeStartTime && !isFading) {
        setIsFading(true);
        setPhase("fading");
        startFadeOut(fadeStartTime);
      }

      // Stop when done
      if (left <= 0) {
        if (tickRef.current) clearInterval(tickRef.current);
        stopTimer();
      }
    }, 1000);
  };

  // Fade out audio
  const startFadeOut = (fadeSeconds: number) => {
    Animated.timing(volumeAnim, {
      toValue: 0,
      duration: fadeSeconds * 1000,
      useNativeDriver: true,
    }).start();
  };

  // Stop timer
  const stopTimer = async () => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    setIsFading(false);
    setPhase("setup");

    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  // Cancel
  const handleCancel = async () => {
    if (tickRef.current) clearInterval(tickRef.current);

    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch { }
    }

    setPhase("setup");
    volumeAnim.setValue(1);
    setIsFading(false);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // ═══════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ═══════════════════════════════════════════════════════════
  if (phase === "setup") {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View
          style={{ backgroundColor: colors.primary }}
          className="pt-16 pb-6 px-6"
        >
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">Sleep Timer</Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 180
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-8 mb-4">
            <Text className="text-sm font-bold uppercase tracking-wider text-text-secondary opacity-70">
              Select Duration
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-4">
            {SLEEP_DURATIONS.map((d) => {
              const active = duration === d.minutes;
              return (
                <TouchableOpacity
                  key={d.minutes}
                  className="rounded-2xl p-4 flex-row items-center justify-between border"
                  style={{
                    width: "48%",
                    backgroundColor: active ? colors.primary + "15" : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  }}
                  onPress={() => setDuration(d.minutes)}
                >
                  <Text
                    className="text-lg font-bold"
                    style={{ color: active ? colors.primary : colors.text }}
                  >
                    {d.label}
                  </Text>
                  {active && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sound picker */}
          <View className="mt-10 mb-4">
            <Text className="text-sm font-bold uppercase tracking-wider text-text-secondary opacity-70">
              Sound Ambiance
            </Text>
          </View>
          {SLEEP_SOUNDS.map((sound) => {
            const selected = selectedSound.id === sound.id;
            return (
              <TouchableOpacity
                key={sound.id}
                className="rounded-2xl p-4 mb-3 flex-row items-center border"
                style={{
                  backgroundColor: selected ? `${sound.color}15` : colors.card,
                  borderColor: selected ? sound.color : colors.border,
                }}
                onPress={() => setSelectedSound(sound)}
              >
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: `${sound.color}20` }}
                >
                  <Text style={{ fontSize: 24 }}>{sound.icon}</Text>
                </View>
                <Text
                  className="text-base font-bold flex-1"
                  style={{ color: colors.text }}
                >
                  {sound.name}
                </Text>
                {selected && (
                  <Ionicons name="checkmark-circle" size={22} color={sound.color} />
                )}
              </TouchableOpacity>
            );
          })}

          {/* Fade duration */}
          <View className="mt-6 mb-4">
            <Text className="text-sm font-bold uppercase tracking-wider text-text-secondary opacity-70">
              Fade Out (Final Minutes)
            </Text>
          </View>
          <View className="flex-row gap-2">
            {[1, 3, 5, 10].map((min) => {
              const selected = fadeMinutes === min;
              return (
                <TouchableOpacity
                  key={min}
                  className="px-4 py-2 rounded-xl flex-1 border items-center shadow-sm"
                  style={{
                    backgroundColor: selected ? colors.primary : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                  }}
                  onPress={() => setFadeMinutes(min)}
                >
                  <Text
                    className="text-sm font-bold"
                    style={{ color: selected ? "white" : colors.text }}
                  >
                    {min} min
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Start button fixed at bottom above tab bar */}
        <View
          className="absolute left-0 right-0 px-6"
          style={{ bottom: insets.bottom + 90 }}
        >
          <TouchableOpacity
            className="w-full py-4 rounded-2xl items-center shadow-lg"
            style={{ backgroundColor: colors.primary }}
            onPress={handleStart}
          >
            <Text className="text-white text-lg font-bold">
              Start Sleep Timer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PLAYING / FADING SCREEN
  // ═══════════════════════════════════════════════════════════
  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Dimmed overlay for sleep ambiance */}
      <View
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      />

      <View className="flex-1 items-center justify-center px-8">
        {/* Moon icon */}
        <View
          className="w-32 h-32 rounded-full items-center justify-center mb-8"
          style={{ backgroundColor: `${colors.primary}20` }}
        >
          <Text style={{ fontSize: 64 }}>🌙</Text>
        </View>

        {/* Time remaining */}
        <Text
          className="text-6xl font-bold mb-4"
          style={{ color: colors.text }}
        >
          {formatTime(remaining)}
        </Text>

        {/* Status */}
        <Text className="text-lg mb-2" style={{ color: colors.textSecondary }}>
          {isFading ? "Fading to silence..." : "Sleep timer running"}
        </Text>

        {/* Sound playing */}
        {selectedSound.id !== "none" && (
          <View className="flex-row items-center mt-4 mb-8">
            <Text style={{ fontSize: 20 }}>{selectedSound.icon}</Text>
            <Text
              className="text-base ml-2"
              style={{ color: colors.textSecondary }}
            >
              Playing {selectedSound.name}
            </Text>
          </View>
        )}

        {/* Volume indicator (during fade) */}
        {isFading && (
          <View className="w-64 mb-8">
            <Animated.View
              className="h-2 rounded-full"
              style={{
                backgroundColor: colors.primary,
                width: volumeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>
        )}

        {/* Cancel button */}
        <TouchableOpacity
          className="px-8 py-3 rounded-2xl"
          style={{ backgroundColor: colors.surface }}
          onPress={handleCancel}
        >
          <Text
            className="text-base font-semibold"
            style={{ color: colors.text }}
          >
            Cancel Timer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
