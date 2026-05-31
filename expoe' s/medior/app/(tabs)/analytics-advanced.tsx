import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  View
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { getAchievements } from "../utils/achievements";
import { getMoodEntries } from "../utils/moodtracker";
import { getAllSessionProgress, getProgress } from "../utils/progressStorage";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface TimePattern {
  hour: number;
  count: number;
  totalMinutes: number;
}

interface Insight {
  icon: string;
  title: string;
  value: string;
  description: string;
  color: string;
}

export default function AdvancedAnalyticsScreen() {
  const { colors } = useTheme();

  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageSession: 0,
    completionRate: 0,
  });

  const [timePatterns, setTimePatterns] = useState<TimePattern[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, []),
  );

  const loadAnalytics = async () => {
    const progress = await getProgress();
    const sessions = await getAllSessionProgress();
    const achievements = await getAchievements();
    const moods = await getMoodEntries(100);

    // ── Basic stats ──────────────────────────────────────────
    const totalSessions = sessions.length;
    const totalMinutes = progress.totalMinutes;
    const completed = sessions.filter(
      (s) => s.duration > 0 && s.position / s.duration >= 0.9,
    ).length;
    const completionRate =
      totalSessions > 0 ? (completed / totalSessions) * 100 : 0;
    const avgSession = totalSessions > 0 ? totalMinutes / totalSessions : 0;

    // Calculate longest streak (would need streak history - simplified here)
    const longestStreak = progress.streak; // In production, track this separately

    setStats({
      totalSessions,
      totalMinutes,
      currentStreak: progress.streak,
      longestStreak,
      averageSession: avgSession,
      completionRate,
    });

    // ── Time patterns ────────────────────────────────────────
    const patterns: Record<number, TimePattern> = {};
    sessions.forEach((s) => {
      const hour = new Date(s.lastPlayed).getHours();
      if (!patterns[hour]) patterns[hour] = { hour, count: 0, totalMinutes: 0 };
      patterns[hour].count++;
      patterns[hour].totalMinutes += Math.floor(s.position / 60);
    });

    const topTimes = Object.values(patterns)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    setTimePatterns(topTimes);

    // ── Weekly data ──────────────────────────────────────────
    const last7Days = Array(7).fill(0);
    const now = new Date();
    sessions.forEach((s) => {
      const sessionDate = new Date(s.lastPlayed);
      const diffDays = Math.floor(
        (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays >= 0 && diffDays < 7) {
        last7Days[6 - diffDays] += Math.floor(s.position / 60);
      }
    });
    setWeeklyData(last7Days);

    // ── Generate insights ────────────────────────────────────
    const generatedInsights: Insight[] = [];

    // Streak insight
    if (progress.streak >= 7) {
      generatedInsights.push({
        icon: "🔥",
        title: "On Fire!",
        value: `${progress.streak} days`,
        description: `You're on an amazing ${progress.streak}-day streak`,
        color: "#F59E0B",
      });
    }

    // Time investment
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      generatedInsights.push({
        icon: "⏰",
        title: "Time Invested",
        value: `${hours}h ${totalMinutes % 60}m`,
        description: "Total meditation time",
        color: "#8B5CF6",
      });
    }

    // Completion rate
    if (completionRate >= 80) {
      generatedInsights.push({
        icon: "✨",
        title: "Great Focus",
        value: `${Math.round(completionRate)}%`,
        description: "Session completion rate",
        color: "#10B981",
      });
    }

    // Achievements
    const unlockedCount = achievements.filter((a) => a.unlocked).length;
    if (unlockedCount > 0) {
      generatedInsights.push({
        icon: "🏆",
        title: "Achiever",
        value: `${unlockedCount}/16`,
        description: "Achievements unlocked",
        color: "#F59E0B",
      });
    }

    // Mood tracking
    if (moods.length >= 5) {
      const avgMood = moods.reduce((sum, m) => sum + m.level, 0) / moods.length;
      const moodLabel =
        avgMood >= 4 ? "Excellent" : avgMood >= 3 ? "Good" : "Improving";
      generatedInsights.push({
        icon: "😊",
        title: "Mood Trend",
        value: moodLabel,
        description: `Based on ${moods.length} entries`,
        color: "#EC4899",
      });
    }

    // Consistency
    if (totalSessions >= 10 && progress.streak >= 3) {
      generatedInsights.push({
        icon: "📈",
        title: "Consistent",
        value: `${totalSessions} sessions`,
        description: "Building a strong habit",
        color: "#06B6D4",
      });
    }

    setInsights(generatedInsights);
  };

  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour} ${period}`;
  };

  const maxWeekly = Math.max(...weeklyData, 1);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{ backgroundColor: colors.primary }}
        className="pt-16 pb-6 px-6"
      >
        <Text className="text-white text-3xl font-bold">Analytics</Text>
        <Text className="text-white text-base mt-1" style={{ opacity: 0.85 }}>
          Your meditation journey insights
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
        {/* Key Metrics Grid */}
        <View className="flex-row flex-wrap justify-between mb-6">
          {[
            {
              label: "Current Streak",
              value: stats.currentStreak,
              unit: "days",
              icon: "flame",
              color: "#F59E0B",
            },
            {
              label: "Longest Streak",
              value: stats.longestStreak,
              unit: "days",
              icon: "trophy",
              color: "#F59E0B",
            },
            {
              label: "Avg Session",
              value: Math.round(stats.averageSession),
              unit: "min",
              icon: "timer",
              color: "#8B5CF6",
            },
            {
              label: "Completion",
              value: Math.round(stats.completionRate),
              unit: "%",
              icon: "checkmark-circle",
              color: "#10B981",
            },
          ].map((metric, i) => (
            <View
              key={i}
              className="rounded-2xl p-4 mb-3"
              style={{
                width: "48%",
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons
                name={metric.icon as any}
                size={24}
                color={metric.color}
              />
              <Text
                className="text-3xl font-bold mt-2"
                style={{ color: colors.text }}
              >
                {metric.value}
                <Text
                  className="text-base font-normal"
                  style={{ color: colors.textSecondary }}
                >
                  {" "}
                  {metric.unit}
                </Text>
              </Text>
              <Text
                className="text-xs mt-1"
                style={{ color: colors.textSecondary }}
              >
                {metric.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Weekly Chart */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Last 7 Days
          </Text>

          <View
            className="flex-row items-end justify-between"
            style={{ height: 120 }}
          >
            {weeklyData.map((minutes, i) => {
              const heightPercent =
                maxWeekly > 0 ? (minutes / maxWeekly) * 100 : 0;
              return (
                <View key={i} className="items-center flex-1">
                  <View
                    className="w-full items-center justify-end"
                    style={{ height: 100 }}
                  >
                    {minutes > 0 && (
                      <View
                        className="w-8 rounded-t-lg"
                        style={{
                          height: `${Math.max(heightPercent, 8)}%`,
                          backgroundColor: colors.primary,
                        }}
                      />
                    )}
                  </View>
                  <Text
                    className="text-xs mt-2"
                    style={{ color: colors.textSecondary }}
                  >
                    {days[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Insights */}
        {insights.length > 0 && (
          <View className="mb-6">
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: colors.text }}
            >
              Insights
            </Text>
            {insights.map((insight, i) => (
              <View
                key={i}
                className="rounded-2xl p-4 mb-3 flex-row items-center"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${insight.color}15` }}
                >
                  <Text style={{ fontSize: 28 }}>{insight.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: colors.text }}
                  >
                    {insight.title}
                  </Text>
                  <Text
                    className="text-base font-semibold mt-0.5"
                    style={{ color: insight.color }}
                  >
                    {insight.value}
                  </Text>
                  <Text
                    className="text-sm mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    {insight.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Time Patterns */}
        {timePatterns.length > 0 && (
          <View className="mb-6">
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: colors.text }}
            >
              Your Best Times
            </Text>
            {timePatterns.map((pattern, i) => (
              <View
                key={i}
                className="rounded-2xl p-4 mb-3 flex-row items-center justify-between"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons
                    name="time-outline"
                    size={24}
                    color={colors.primary}
                  />
                  <View className="ml-3">
                    <Text
                      className="text-base font-semibold"
                      style={{ color: colors.text }}
                    >
                      {formatHour(pattern.hour)}
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {pattern.count} session{pattern.count > 1 ? "s" : ""},{" "}
                      {pattern.totalMinutes} min
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text
                    className="text-xs font-bold"
                    style={{ color: colors.primary }}
                  >
                    #{i + 1}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Summary Stats */}
        <View
          className="rounded-2xl p-5"
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            className="text-lg font-bold mb-3"
            style={{ color: colors.text }}
          >
            All Time
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-base" style={{ color: colors.textSecondary }}>
              Total Sessions
            </Text>
            <Text
              className="text-base font-semibold"
              style={{ color: colors.text }}
            >
              {stats.totalSessions}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-base" style={{ color: colors.textSecondary }}>
              Total Minutes
            </Text>
            <Text
              className="text-base font-semibold"
              style={{ color: colors.text }}
            >
              {stats.totalMinutes}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-base" style={{ color: colors.textSecondary }}>
              Average Per Session
            </Text>
            <Text
              className="text-base font-semibold"
              style={{ color: colors.text }}
            >
              {Math.round(stats.averageSession)} min
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
