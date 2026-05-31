import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { checkAndUnlockAchievements } from "../utils/achievements";
import { updateProgress } from "../utils/progressStorage";

const DURATIONS = [
  { label: "1 min", seconds: 60 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "20 min", seconds: 1200 },
  { label: "30 min", seconds: 1800 },
  { label: "45 min", seconds: 2700 },
  { label: "60 min", seconds: 3600 },
];

const BELLS = [
  { label: "None", seconds: 0 },
  { label: "Every 1 min", seconds: 60 },
  { label: "Every 3 min", seconds: 180 },
  { label: "Every 5 min", seconds: 300 },
  { label: "Every 10 min", seconds: 600 },
];

type Phase = "setup" | "running" | "paused" | "done";

export default function TimerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // setup
  const [duration, setDuration] = useState(300);
  const [bellSecs, setBellSecs] = useState(0);
  const [showBellDrop, setShowBellDrop] = useState(false);

  // runtime
  const [phase, setPhase] = useState<Phase>("setup");
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // refs — cleared on every reset so resume works cleanly
  const tickRef = useRef<any>(null);
  const bellRef = useRef<any>(null);
  const elapsedRef = useRef(0); // shadow of elapsed for use inside interval closures

  // breathing
  const scale = useRef(new Animated.Value(1)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const breathe = useCallback(() => {
    animRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.55,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(scale, {
          toValue: 1.0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ]),
    );
    animRef.current.start();
  }, [scale]);

  const stopBreathe = useCallback(() => {
    animRef.current?.stop();
    animRef.current = null;
    scale.setValue(1);
  }, [scale]);

  // ── helpers ─────────────────────────────────────────────────
  const clearTimers = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (bellRef.current) {
      clearInterval(bellRef.current);
      bellRef.current = null;
    }
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── start / resume ──────────────────────────────────────────
  const startFrom = (startElapsed: number, totalDuration: number) => {
    elapsedRef.current = startElapsed;
    setPhase("running");
    breathe();

    tickRef.current = setInterval(() => {
      elapsedRef.current += 1;
      const left = totalDuration - elapsedRef.current;
      setElapsed(elapsedRef.current);
      setRemaining(left);

      if (left <= 0) {
        clearTimers();
        stopBreathe();
        setPhase("done");
        onComplete(totalDuration);
      }
    }, 1000);

    // bell ticker (separate interval so bell logic is clean)
    if (bellSecs > 0) {
      let bellCounter = startElapsed; // start from current elapsed so existing ticks align
      bellRef.current = setInterval(() => {
        bellCounter += 1;
        if (bellCounter % bellSecs === 0) {
          console.log("[Timer] 🔔 bell");
          // In production play a bell.mp3 here via expo-av
        }
      }, 1000);
    }
  };

  const handleStart = () => {
    setElapsed(0);
    setRemaining(duration);
    startFrom(0, duration);
  };
  const handlePause = () => {
    clearTimers();
    stopBreathe();
    setPhase("paused");
  };
  const handleResume = () => {
    startFrom(elapsed, duration);
  };
  const handleReset = () => {
    clearTimers();
    stopBreathe();
    setPhase("setup");
    setElapsed(0);
    setRemaining(0);
  };

  // ── completion ──────────────────────────────────────────────
  const onComplete = async (totalSecs: number) => {
    try {
      await updateProgress("custom_timer", totalSecs, totalSecs);
      await checkAndUnlockAchievements("timer", totalSecs);
    } catch (e) {
      console.error("[Timer] save error:", e);
    }
  };

  // ── cleanup on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimers();
      stopBreathe();
    };
  }, [stopBreathe]);

  const progress = duration > 0 ? elapsed / duration : 0; // 0 → 1

  // ═══════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ═══════════════════════════════════════════════════════════
  if (phase === "setup") {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* header */}
        <View
          style={{ backgroundColor: colors.primary }}
          className="pt-16 pb-5 px-6"
        >
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">Custom Timer</Text>
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
          {/* duration chips */}
          <Text
            className="text-lg font-bold mb-3"
            style={{ color: colors.text }}
          >
            Choose Duration
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {DURATIONS.map((d) => {
              const on = duration === d.seconds;
              return (
                <TouchableOpacity
                  key={d.seconds}
                  className="px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: on ? colors.primary : colors.surface,
                    borderWidth: on ? 0 : 1,
                    borderColor: colors.border,
                  }}
                  onPress={() => setDuration(d.seconds)}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: on ? "white" : colors.text }}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* bell dropdown */}
          <Text
            className="text-lg font-bold mb-3"
            style={{ color: colors.text }}
          >
            Interval Bell
          </Text>
          <TouchableOpacity
            className="rounded-xl px-4 py-3 flex-row items-center justify-between mb-2"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => setShowBellDrop(!showBellDrop)}
          >
            <Text className="text-base" style={{ color: colors.text }}>
              {BELLS.find((b) => b.seconds === bellSecs)?.label ?? "None"}
            </Text>
            <Ionicons
              name={showBellDrop ? "chevron-up" : "chevron-down"}
              size={20}
              style={{ color: colors.textSecondary }}
            />
          </TouchableOpacity>

          {showBellDrop && (
            <View
              className="rounded-xl overflow-hidden mb-6"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {BELLS.map((b, i) => {
                const on = bellSecs === b.seconds;
                return (
                  <TouchableOpacity
                    key={b.seconds}
                    className="px-4 py-3 flex-row items-center justify-between"
                    style={{
                      borderBottomWidth: i < BELLS.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border,
                      backgroundColor: on
                        ? `${colors.primary}15`
                        : "transparent",
                    }}
                    onPress={() => {
                      setBellSecs(b.seconds);
                      setShowBellDrop(false);
                    }}
                  >
                    <Text className="text-base" style={{ color: colors.text }}>
                      {b.label}
                    </Text>
                    {on && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* summary card */}
          <View
            className="rounded-2xl p-5 mt-4"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              className="text-xs font-bold mb-3"
              style={{ color: colors.textSecondary }}
            >
              SESSION SUMMARY
            </Text>
            <View className="flex-row justify-between">
              <View>
                <Text
                  className="text-4xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {fmt(duration)}
                </Text>
                <Text
                  className="text-sm mt-1"
                  style={{ color: colors.textSecondary }}
                >
                  Duration
                </Text>
              </View>
              <View className="items-end">
                <Text
                  className="text-4xl font-bold"
                  style={{
                    color: bellSecs > 0 ? colors.primary : colors.textSecondary,
                  }}
                >
                  {bellSecs > 0 ? `${bellSecs / 60}m` : "—"}
                </Text>
                <Text
                  className="text-sm mt-1"
                  style={{ color: colors.textSecondary }}
                >
                  Bell
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* start button */}
        <View
          className="absolute left-0 right-0 px-6"
          style={{ bottom: insets.bottom + 90 }} // Ensure it's above the bottom nav
        >
          <TouchableOpacity
            className="w-full py-4 rounded-2xl items-center shadow-lg"
            style={{ backgroundColor: colors.primary }}
            onPress={handleStart}
          >
            <Text className="text-white text-lg font-bold">Start Timer</Text>
          </TouchableOpacity>
        </View>
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
          className="w-40 h-40 rounded-full items-center justify-center mb-8"
          style={{ backgroundColor: `${colors.primary}20` }}
        >
          <Text style={{ fontSize: 72 }}>🎉</Text>
        </View>

        <Text
          className="text-3xl font-bold text-center mb-2"
          style={{ color: colors.text }}
        >
          Session Complete!
        </Text>
        <Text
          className="text-base text-center"
          style={{ color: colors.textSecondary }}
        >
          You meditated for
        </Text>
        <Text
          className="text-5xl font-bold mt-2 mb-8"
          style={{ color: colors.primary }}
        >
          {fmt(duration)}
        </Text>

        <TouchableOpacity
          className="w-full py-4 rounded-2xl items-center mb-3"
          style={{ backgroundColor: colors.primary }}
          onPress={handleReset}
        >
          <Text className="text-white text-lg font-bold">New Session</Text>
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
  // RUNNING / PAUSED
  // ═══════════════════════════════════════════════════════════
  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: colors.background }}
    >
      {/* close */}
      <TouchableOpacity
        className="absolute top-16 left-6"
        onPress={handleReset}
      >
        <Ionicons
          name="close"
          size={28}
          style={{ color: colors.textSecondary }}
        />
      </TouchableOpacity>

      {/* ring + breathing */}
      <View className="relative w-72 h-72 items-center justify-center mb-10">
        {/* track ring */}
        <View
          className="absolute w-72 h-72 rounded-full"
          style={{ borderWidth: 6, borderColor: colors.border }}
        />
        {/* progress arc — simple quadrant approach */}
        <View
          className="absolute w-72 h-72 rounded-full"
          style={{
            borderWidth: 6,
            borderColor: colors.primary,
            borderRightColor: progress < 0.25 ? "transparent" : colors.primary,
            borderBottomColor: progress < 0.5 ? "transparent" : colors.primary,
            borderLeftColor: progress < 0.75 ? "transparent" : colors.primary,
            borderTopColor: colors.primary,
            transform: [{ rotate: "-90deg" }],
          }}
        />

        {/* breathing circles */}
        <Animated.View
          className="absolute w-56 h-56 rounded-full"
          style={{
            backgroundColor: `${colors.primary}15`,
            transform: [{ scale }],
          }}
        />
        <Animated.View
          className="absolute w-40 h-40 rounded-full"
          style={{
            backgroundColor: `${colors.primary}25`,
            transform: [{ scale }],
          }}
        />

        {/* time */}
        <View className="items-center z-10">
          <Text className="text-5xl font-bold" style={{ color: colors.text }}>
            {fmt(remaining)}
          </Text>
          <Text
            className="text-sm mt-1"
            style={{ color: colors.textSecondary }}
          >
            {phase === "paused" ? "Paused" : "remaining"}
          </Text>
        </View>
      </View>

      {/* bell badge */}
      {bellSecs > 0 && (
        <View className="flex-row items-center mb-6">
          <Ionicons
            name="notifications-outline"
            size={15}
            style={{ color: colors.textSecondary }}
          />
          <Text
            className="text-sm ml-1.5"
            style={{ color: colors.textSecondary }}
          >
            Bell every {bellSecs / 60} min
          </Text>
        </View>
      )}

      {/* controls */}
      <View className="flex-row items-center gap-6">
        <TouchableOpacity
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.surface }}
          onPress={handleReset}
        >
          <Ionicons name="stop" size={28} style={{ color: colors.text }} />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-24 h-24 rounded-full items-center justify-center shadow-lg"
          style={{ backgroundColor: colors.primary }}
          onPress={phase === "running" ? handlePause : handleResume}
        >
          <Ionicons
            name={phase === "running" ? "pause" : "play"}
            size={44}
            color="white"
          />
        </TouchableOpacity>

        {/* spacer to keep play centred */}
        <View className="w-16 h-16" />
      </View>
    </View>
  );
}
