import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { createJournalEntry } from "../utils/meditationJournal";
const CHECK_IN_KEY = "@last_checkin_date";

const MOODS = [
  { level: 5, emoji: "😄", label: "Excellent", color: "#10B981" },
  { level: 4, emoji: "🙂", label: "Good", color: "#84CC16" },
  { level: 3, emoji: "😐", label: "Okay", color: "#EAB308" },
  { level: 2, emoji: "😔", label: "Low", color: "#F97316" },
  { level: 1, emoji: "😢", label: "Difficult", color: "#EF4444" },
];

const QUICK_INTENTIONS = [
  { text: "Be present", icon: "🎯" },
  { text: "Stay calm", icon: "🌊" },
  { text: "Show gratitude", icon: "🙏" },
  { text: "Be kind", icon: "💖" },
  { text: "Let go", icon: "🍃" },
  { text: "Stay focused", icon: "✨" },
];

const ENERGY_LEVELS = [
  { level: 1, label: "Tired", icon: "😴" },
  { level: 2, label: "Low", icon: "🔋" },
  { level: 3, label: "Okay", icon: "⚡" },
  { level: 4, label: "Good", icon: "🔥" },
  { level: 5, label: "High", icon: "⚡⚡" },
];

type Step = "mood" | "energy" | "intention" | "reflection" | "done";

export default function DailyCheckInScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("mood");
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);
  const [customIntention, setCustomIntention] = useState("");
  const [reflection, setReflection] = useState("");

  const handleMoodSelect = (level: number) => {
    setMood(level);
    setTimeout(() => setStep("energy"), 300);
  };

  const handleEnergySelect = (level: number) => {
    setEnergy(level);
    setTimeout(() => setStep("intention"), 300);
  };

  const toggleIntention = (text: string) => {
    setSelectedIntentions((prev) =>
      prev.includes(text) ? prev.filter((i) => i !== text) : [...prev, text],
    );
  };

  const handleComplete = async () => {
    try {
      // Log mood
      // if (mood) {
      //   await logMood(mood);
      // }

      // Create journal entry
      const allIntentions = [...selectedIntentions];
      if (customIntention.trim()) {
        allIntentions.push(customIntention.trim());
      }

      const content = `Energy: ${energy}/5\nIntentions: ${allIntentions.join(", ")}\n${reflection ? `\nReflection: ${reflection}` : ""}`;

      await createJournalEntry(content, "Daily Check-in", mood || undefined, [
        "check-in",
        "intention",
      ]);

      // Save today's check-in
      await AsyncStorage.setItem(CHECK_IN_KEY, new Date().toISOString());

      setStep("done");
    } catch (error) {
      console.error("[CheckIn] Error saving:", error);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // MOOD STEP
  // ═══════════════════════════════════════════════════════════
  if (step === "mood") {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <View
          style={{ backgroundColor: colors.primary }}
          className="pt-16 pb-6 px-6"
        >
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">
              Daily Check-In
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center justify-center px-8 py-10">
            <Text
              className="text-3xl font-bold text-center mb-2"
              style={{ color: colors.text }}
            >
              How are you feeling?
            </Text>
            <Text
              className="text-base text-center mb-12"
              style={{ color: colors.textSecondary }}
            >
              Take a moment to check in with yourself
            </Text>

            {MOODS.map((m, i) => (
              <TouchableOpacity
                key={i}
                className="w-full rounded-2xl p-5 mb-3 flex-row items-center"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={() => handleMoodSelect(m.level)}
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${m.color}20` }}
                >
                  <Text style={{ fontSize: 32 }}>{m.emoji}</Text>
                </View>
                <Text
                  className="text-lg font-medium"
                  style={{ color: colors.text }}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ENERGY STEP
  // ═══════════════════════════════════════════════════════════
  if (step === "energy") {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <View
          style={{ backgroundColor: colors.primary }}
          className="pt-16 pb-6 px-6"
        >
          <TouchableOpacity onPress={() => setStep("mood")}>
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center justify-center px-8 py-10">
            <Text
              className="text-3xl font-bold text-center mb-2"
              style={{ color: colors.text }}
            >
              What's your energy level?
            </Text>
            <Text
              className="text-base text-center mb-12"
              style={{ color: colors.textSecondary }}
            >
              Understanding your energy helps guide your practice
            </Text>

            {ENERGY_LEVELS.map((e, i) => (
              <TouchableOpacity
                key={i}
                className="w-full rounded-2xl p-5 mb-3 flex-row items-center"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={() => handleEnergySelect(e.level)}
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <Text style={{ fontSize: 28 }}>{e.icon}</Text>
                </View>
                <Text
                  className="text-lg font-medium"
                  style={{ color: colors.text }}
                >
                  {e.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // INTENTION STEP
  // ═══════════════════════════════════════════════════════════
  if (step === "intention") {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <View
          style={{ backgroundColor: colors.primary }}
          className="pt-16 pb-6 px-6"
        >
          <TouchableOpacity onPress={() => setStep("energy")}>
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 160 }} showsVerticalScrollIndicator={false}>
          <Text
            className="text-3xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            Set your intentions
          </Text>
          <Text
            className="text-base mb-8"
            style={{ color: colors.textSecondary }}
          >
            Choose one or more intentions for today
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-6">
            {QUICK_INTENTIONS.map((int, i) => {
              const selected = selectedIntentions.includes(int.text);
              return (
                <TouchableOpacity
                  key={i}
                  className="px-4 py-3 rounded-full flex-row items-center"
                  style={{
                    backgroundColor: selected
                      ? `${colors.primary}20`
                      : colors.card,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? colors.primary : colors.border,
                  }}
                  onPress={() => toggleIntention(int.text)}
                >
                  <Text style={{ fontSize: 18 }}>{int.icon}</Text>
                  <Text
                    className="text-sm font-medium ml-2"
                    style={{ color: colors.text }}
                  >
                    {int.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text
            className="text-base font-semibold mb-2"
            style={{ color: colors.text }}
          >
            Or create your own
          </Text>
          <TextInput
            className="rounded-xl p-4 mb-8"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
              fontSize: 16,
            }}
            placeholder="Enter custom intention..."
            placeholderTextColor={colors.textSecondary}
            value={customIntention}
            onChangeText={setCustomIntention}
          />

          <TouchableOpacity
            className="w-full py-4 rounded-2xl items-center"
            style={{ backgroundColor: colors.primary }}
            onPress={() => setStep("reflection")}
          >
            <Text className="text-white text-lg font-bold">Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // REFLECTION STEP (OPTIONAL)
  // ═══════════════════════════════════════════════════════════
  if (step === "reflection") {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <View
          style={{ backgroundColor: colors.primary }}
          className="pt-16 pb-6 px-6"
        >
          <TouchableOpacity onPress={() => setStep("intention")}>
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 160 }} showsVerticalScrollIndicator={false}>
          <Text
            className="text-3xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            Any reflections?
          </Text>
          <Text
            className="text-base mb-6"
            style={{ color: colors.textSecondary }}
          >
            Optional - capture any thoughts or insights
          </Text>

          <TextInput
            className="rounded-xl p-4 mb-6"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
              fontSize: 16,
              height: 200,
              textAlignVertical: "top",
            }}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textSecondary}
            value={reflection}
            onChangeText={setReflection}
            multiline
          />

          <TouchableOpacity
            className="w-full py-4 rounded-2xl items-center mb-3"
            style={{ backgroundColor: colors.primary }}
            onPress={handleComplete}
          >
            <Text className="text-white text-lg font-bold">
              Complete Check-In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-4 rounded-2xl items-center"
            style={{ backgroundColor: colors.surface }}
            onPress={handleComplete}
          >
            <Text
              className="text-base font-semibold"
              style={{ color: colors.text }}
            >
              Skip
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════════
  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: colors.background }}
    >
      <View
        className="w-32 h-32 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `${colors.primary}20` }}
      >
        <Text style={{ fontSize: 64 }}>✨</Text>
      </View>

      <Text
        className="text-3xl font-bold text-center mb-2"
        style={{ color: colors.text }}
      >
        Check-in complete!
      </Text>
      <Text
        className="text-base text-center mb-8"
        style={{ color: colors.textSecondary }}
      >
        Your intentions have been set for the day
      </Text>

      <TouchableOpacity
        className="w-full py-4 rounded-2xl items-center"
        style={{ backgroundColor: colors.primary }}
        onPress={() => router.back()}
      >
        <Text className="text-white text-lg font-bold">Done</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Check if user has checked in today
 */
export async function hasCheckedInToday(): Promise<boolean> {
  try {
    const lastCheckIn = await AsyncStorage.getItem(CHECK_IN_KEY);
    if (!lastCheckIn) return false;

    const lastDate = new Date(lastCheckIn).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    return lastDate === today;
  } catch {
    return false;
  }
}
