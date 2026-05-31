import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { checkAndUnlockAchievements } from "../utils/achievements";
import { updateProgress } from "../utils/progressStorage";
// Breathing patterns (all times in seconds)
export const BREATHING_PATTERNS = [
  {
    id: "box",
    name: "Box Breathing",
    description: "Equal 4-count breathing for stress relief",
    icon: "⬜",
    color: "#10B981",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 10,
  },
  {
    id: "478",
    name: "4-7-8 Technique",
    description: "Dr. Weil's relaxation breath",
    icon: "💤",
    color: "#6366F1",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 8,
  },
  {
    id: "deep",
    name: "Deep Calm",
    description: "Long exhales for deep relaxation",
    icon: "🌊",
    color: "#0EA5E9",
    inhale: 4,
    hold1: 2,
    exhale: 6,
    hold2: 2,
    cycles: 12,
  },
  {
    id: "energize",
    name: "Energizing Breath",
    description: "Quick breathing to boost energy",
    icon: "⚡",
    color: "#F59E0B",
    inhale: 3,
    hold1: 0,
    exhale: 3,
    hold2: 0,
    cycles: 15,
  },
  {
    id: "coherent",
    name: "Coherent Breathing",
    description: "5-5 rhythm for balance",
    icon: "☯️",
    color: "#8B5CF6",
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
    cycles: 12,
  },
];

type Phase = "setup" | "get-ready" | "breathing" | "done";
type BreathPhase = "inhale" | "hold1" | "exhale" | "hold2";

export default function BreathingExerciseScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Setup state
  const [selectedPattern, setSelectedPattern] = useState(BREATHING_PATTERNS[0]);

  // Exercise state
  const [phase, setPhase] = useState<Phase>("setup");
  const [currentCycle, setCurrentCycle] = useState(0);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("inhale");
  const [countdown, setCountdown] = useState(0);

  // Animation
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Timers
  const tickRef = useRef<any>(null);
  const phaseRef = useRef<any>(null);

  // Start exercise
  const handleStart = () => {
    setPhase("get-ready");
    setCurrentCycle(0);
    setCountdown(3);

    // 3-2-1 countdown
    let count = 3;
    const countInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countInterval);
        startBreathing();
      }
    }, 1000);
  };

  // Main breathing cycle
  const startBreathing = () => {
    setPhase("breathing");
    setCurrentCycle(1);
    nextPhase("inhale", selectedPattern.inhale);
  };

  const nextPhase = (phase: BreathPhase, duration: number) => {
    if (duration === 0) {
      // Skip this phase
      const nextPhaseType = getNextPhase(phase);
      if (nextPhaseType) {
        const nextDuration = selectedPattern[nextPhaseType];
        nextPhase(nextPhaseType, nextDuration);
      }
      return;
    }

    setBreathPhase(phase);
    animateForPhase(phase, duration);

    // Tick countdown
    let remaining = duration;
    setCountdown(remaining);

    tickRef.current = setInterval(() => {
      remaining--;
      setCountdown(remaining);
      if (remaining <= 0 && tickRef.current) {
        clearInterval(tickRef.current);
      }
    }, 1000);

    // Move to next phase after duration
    phaseRef.current = setTimeout(() => {
      const next = getNextPhase(phase);

      if (next) {
        nextPhase(next, selectedPattern[next]);
      } else {
        // Cycle complete
        completeCycle();
      }
    }, duration * 1000);
  };

  const getNextPhase = (current: BreathPhase): BreathPhase | null => {
    const sequence: BreathPhase[] = ["inhale", "hold1", "exhale", "hold2"];
    const currentIndex = sequence.indexOf(current);
    return currentIndex < sequence.length - 1
      ? sequence[currentIndex + 1]
      : null;
  };

  const completeCycle = () => {
    if (currentCycle >= selectedPattern.cycles) {
      // All cycles done
      completeExercise();
    } else {
      // Start next cycle
      setCurrentCycle((c) => c + 1);
      nextPhase("inhale", selectedPattern.inhale);
    }
  };

  const completeExercise = () => {
    clearTimers();
    setPhase("done");

    // Calculate total time
    const totalSeconds =
      (selectedPattern.inhale +
        selectedPattern.hold1 +
        selectedPattern.exhale +
        selectedPattern.hold2) *
      selectedPattern.cycles;

    // Save progress
    updateProgress("breathing_exercise", totalSeconds, totalSeconds);
    checkAndUnlockAchievements("breathing", totalSeconds);
  };

  // Animations for each phase
  const animateForPhase = (phase: BreathPhase, duration: number) => {
    const durationMs = duration * 1000;

    if (phase === "inhale") {
      Animated.timing(scale, {
        toValue: 1.6,
        duration: durationMs,
        useNativeDriver: false,
      }).start();
      Animated.timing(opacity, {
        toValue: 1,
        duration: durationMs,
        useNativeDriver: false,
      }).start();
    } else if (phase === "exhale") {
      Animated.timing(scale, {
        toValue: 0.6,
        duration: durationMs,
        useNativeDriver: false,
      }).start();
      Animated.timing(opacity, {
        toValue: 0.4,
        duration: durationMs,
        useNativeDriver: false,
      }).start();
    }
    // Hold phases keep current size
  };

  // Cleanup
  const clearTimers = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (phaseRef.current) clearTimeout(phaseRef.current);
  };

  const handleStop = () => {
    clearTimers();
    setPhase("setup");
    scale.setValue(1);
    opacity.setValue(1);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Phase labels
  const getPhaseLabel = (): string => {
    switch (breathPhase) {
      case "inhale":
        return "Breathe In";
      case "hold1":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      case "hold2":
        return "Hold";
    }
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
            <Text className="text-white text-2xl font-bold">
              Breathing Exercise
            </Text>
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
            <Text
              className="text-base"
              style={{ color: colors.textSecondary }}
            >
              Choose a breathing pattern to practice mindful breathing
            </Text>
          </View>

          {/* Pattern cards */}
          {BREATHING_PATTERNS.map((pattern) => {
            const selected = selectedPattern.id === pattern.id;
            return (
              <TouchableOpacity
                key={pattern.id}
                className="rounded-2xl p-5 mb-3"
                style={{
                  backgroundColor: selected
                    ? `${pattern.color}15`
                    : colors.card,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? pattern.color : colors.border,
                }}
                onPress={() => setSelectedPattern(pattern)}
              >
                <View className="flex-row items-start">
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${pattern.color}20` }}
                  >
                    <Text style={{ fontSize: 28 }}>{pattern.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-bold mb-1"
                      style={{ color: colors.text }}
                    >
                      {pattern.name}
                    </Text>
                    <Text
                      className="text-sm mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      {pattern.description}
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      <View
                        className="bg-opacity-10 px-2 py-1 rounded"
                        style={{ backgroundColor: `${pattern.color}15` }}
                      >
                        <Text
                          className="text-xs"
                          style={{ color: pattern.color }}
                        >
                          {pattern.cycles} cycles
                        </Text>
                      </View>
                      <View
                        className="bg-opacity-10 px-2 py-1 rounded"
                        style={{ backgroundColor: `${pattern.color}15` }}
                      >
                        <Text
                          className="text-xs"
                          style={{ color: pattern.color }}
                        >
                          ~
                          {Math.floor(
                            ((pattern.inhale +
                              pattern.hold1 +
                              pattern.exhale +
                              pattern.hold2) *
                              pattern.cycles) /
                            60,
                          )}{" "}
                          min
                        </Text>
                      </View>
                    </View>
                  </View>
                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={pattern.color}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Start button */}
        <View
          className="absolute left-0 right-0 px-6"
          style={{ bottom: insets.bottom + 90 }}
        >
          <TouchableOpacity
            className="w-full py-4 rounded-2xl items-center shadow-lg"
            style={{ backgroundColor: selectedPattern.color }}
            onPress={handleStart}
          >
            <Text className="text-white text-lg font-bold">Start Exercise</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // GET READY SCREEN
  // ═══════════════════════════════════════════════════════════
  if (phase === "get-ready") {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text
          className="text-2xl font-bold mb-4"
          style={{ color: colors.text }}
        >
          Get Ready
        </Text>
        <Text
          className="text-8xl font-bold"
          style={{ color: selectedPattern.color }}
        >
          {countdown}
        </Text>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // DONE SCREEN
  // ═══════════════════════════════════════════════════════════
  if (phase === "done") {
    return (
      <View
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: colors.background }}
      >
        <View
          className="w-32 h-32 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: `${selectedPattern.color}20` }}
        >
          <Text style={{ fontSize: 64 }}>{selectedPattern.icon}</Text>
        </View>

        <Text
          className="text-3xl font-bold text-center mb-2"
          style={{ color: colors.text }}
        >
          Well Done!
        </Text>
        <Text
          className="text-base text-center mb-2"
          style={{ color: colors.textSecondary }}
        >
          You completed {selectedPattern.cycles} cycles of
        </Text>
        <Text
          className="text-xl font-semibold mb-8"
          style={{ color: selectedPattern.color }}
        >
          {selectedPattern.name}
        </Text>

        <TouchableOpacity
          className="w-full py-4 rounded-2xl items-center mb-3"
          style={{ backgroundColor: selectedPattern.color }}
          onPress={handleStart}
        >
          <Text className="text-white text-lg font-bold">Practice Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full py-4 rounded-2xl items-center"
          style={{ backgroundColor: colors.surface }}
          onPress={() => router.back()}
        >
          <Text
            className="text-base font-semibold"
            style={{ color: colors.text }}
          >
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // BREATHING SCREEN
  // ═══════════════════════════════════════════════════════════
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.background }}
    >
      {/* Close button */}
      <TouchableOpacity className="absolute top-16 left-6" onPress={handleStop}>
        <Ionicons
          name="close"
          size={28}
          style={{ color: colors.textSecondary }}
        />
      </TouchableOpacity>

      {/* Cycle counter */}
      <View className="absolute top-16 right-6">
        <Text
          className="text-base font-semibold"
          style={{ color: colors.textSecondary }}
        >
          {currentCycle} / {selectedPattern.cycles}
        </Text>
      </View>

      {/* Breathing circle */}
      <View className="items-center justify-center mb-12">
        <Animated.View
          className="rounded-full items-center justify-center"
          style={{
            width: 280,
            height: 280,
            backgroundColor: selectedPattern.color,
            opacity,
            transform: [{ scale }],
          }}
        >
          <Text className="text-white text-6xl font-bold">{countdown}</Text>
        </Animated.View>
      </View>

      {/* Instructions */}
      <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
        {getPhaseLabel()}
      </Text>
      <Text className="text-base" style={{ color: colors.textSecondary }}>
        {selectedPattern.name}
      </Text>
    </View>
  );
}
