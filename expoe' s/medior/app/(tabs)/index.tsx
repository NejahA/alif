import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { getAchievements } from "../utils/achievements";
import { MEDITATION_SESSIONS } from "../utils/categories ";
import { getRecentSessions } from "../utils/favorites";
import { getAllSessionProgress, getProgress } from "../utils/progressStorage";

// build a map for quick lookup
const sessionMap: Record<string, { title: string; description: string }> = {};
MEDITATION_SESSIONS.forEach((s) => {
  sessionMap[s.audioKey] = { title: s.title, description: s.description };
});

const QUOTES = [
  "The mind is everything. What you think you become. — Buddha",
  "Meditation is not evasion; it is a serene encounter with reality. — Thích Nhất Hạnh",
  "In the midst of movement and chaos, keep stillness inside of you. — Deepak Chopra",
  "The thing about meditation is you become more and more you. — David Lynch",
  "Quiet the mind and the soul will speak. — Ma Jaya Sati Bhagavati",
  "Meditation is the tongue of the soul and the language of our spirit. — Jeremy Taylor",
  "Your calm mind is the ultimate weapon against your challenges. — Bryant McGill",
  "Peace comes from within. Do not seek it without. — Buddha",
  "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor. — Thích Nhất Hạnh",
  "The best way to capture moments is to pay attention. — Jon Kabat-Zinn",
];

function getDailyQuote(): string {
  const today = new Date().toISOString().split("T")[0];
  const seed = today.split("-").reduce((a, v) => a + parseInt(v, 10), 0);
  return QUOTES[seed % QUOTES.length];
}

export default function HomeScreen() {
  const { colors, activeTheme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState({
    streak: 0,
    totalMinutes: 0,
    sessionsCompleted: 0,
  });
  const [lastSession, setLastSession] = useState<{
    audioKey: string;
    title: string;
    description: string;
  } | null>(null);
  const [recentBadges, setRecentBadges] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
      loadLastSession();
      loadRecentBadges();
    }, []),
  );

  const loadStats = async () => {
    const progress = await getProgress();
    const sessions = await getAllSessionProgress();
    const completed = sessions.filter(
      (s) => s.duration > 0 && s.position / s.duration >= 0.9,
    ).length;
    setStats({
      streak: progress.streak,
      totalMinutes: progress.totalMinutes,
      sessionsCompleted: completed,
    });
  };

  const loadLastSession = async () => {
    // 1. recent-sessions list (written by player when playback starts)
    const recent = await getRecentSessions(1);
    if (recent.length > 0) {
      setLastSession({
        audioKey: recent[0].audioKey,
        title: recent[0].title,
        description: recent[0].description,
      });
      return;
    }
    // 2. fall back: progress by timestamp
    const sessions = await getAllSessionProgress();
    if (sessions.length === 0) {
      setLastSession(null);
      return;
    }
    const most = sessions.sort(
      (a, b) =>
        new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime(),
    )[0];
    const info = sessionMap[most.sessionKey];
    setLastSession({
      audioKey: most.sessionKey,
      title: info?.title ?? "Session",
      description: info?.description ?? "Pick up where you left off",
    });
  };

  const loadRecentBadges = async () => {
    const all = await getAchievements();
    setRecentBadges(
      all
        .filter((a) => a.unlocked)
        .sort(
          (a, b) =>
            new Date(b.unlockedAt!).getTime() -
            new Date(a.unlockedAt!).getTime(),
        )
        .slice(0, 3),
    );
  };

  const navigateToPlayer = () => {
    if (lastSession) {
      router.push({
        pathname: "/player",
        params: {
          title: lastSession.title,
          audioKey: lastSession.audioKey,
          description: lastSession.description,
        }
      });
    }
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-6 mb-8 flex-row justify-between items-center">
            <View>
              <Text className="text-sm font-semibold text-primary uppercase tracking-wider">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </Text>
              <Text className="text-3xl font-bold text-text-primary dark:text-gray-50 mt-1">
                Welcome Back
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              className="w-12 h-12 rounded-full bg-card-light dark:bg-card-dark items-center justify-center border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <Ionicons name="person" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Daily Quote Card */}
          <View className="mx-6 mb-8 rounded-[32px] p-8 bg-primary shadow-xl shadow-primary/40 relative overflow-hidden">
            <View className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16" />
            <View className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />

            <Ionicons name="chatbubble-ellipses" size={32} color="rgba(255,255,255,0.8)" />
            <Text className="text-white text-xl font-medium leading-relaxed mt-4 mb-2">
              {getDailyQuote()}
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="h-1 w-8 bg-white/50 rounded-full" />
              <Text className="text-white/80 text-xs ml-3 font-semibold tracking-widest uppercase">Daily Wisdom</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View className="px-6 mb-8">
            <View className="flex-row gap-4">
              <View className="flex-1 bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm items-center">
                <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-2">
                  <Ionicons name="flame" size={22} color="#F97316" />
                </View>
                <Text className="text-xl font-bold text-text-primary dark:text-gray-100">{stats.streak}</Text>
                <Text className="text-xs text-text-secondary">Day Streak</Text>
              </View>

              <View className="flex-1 bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm items-center">
                <View className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 items-center justify-center mb-2">
                  <Ionicons name="time" size={22} color="#8B5CF6" />
                </View>
                <Text className="text-xl font-bold text-text-primary dark:text-gray-100">{stats.totalMinutes}</Text>
                <Text className="text-xs text-text-secondary">Minutes</Text>
              </View>

              <View className="flex-1 bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm items-center">
                <View className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center mb-2">
                  <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                </View>
                <Text className="text-xl font-bold text-text-primary dark:text-gray-100">{stats.sessionsCompleted}</Text>
                <Text className="text-xs text-text-secondary">Sessions</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Grid */}
          <View className="px-6 mb-8">
            <Text className="text-lg font-bold text-text-primary dark:text-gray-100 mb-4">Quick Actions</Text>
            <View className="flex-row flex-wrap gap-4">
              {/* Timer */}
              <Link href="/timer" asChild>
                <TouchableOpacity className="w-[47%] bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <View className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-4">
                    <Ionicons name="timer-outline" size={24} color="#3B82F6" />
                  </View>
                  <Text className="text-base font-bold text-text-primary dark:text-gray-50">Timer</Text>
                  <Text className="text-xs text-text-secondary mt-1">Custom session</Text>
                </TouchableOpacity>
              </Link>

              {/* Journal */}
              <Link href="/journal-screen" asChild>
                <TouchableOpacity className="w-[47%] bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <View className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-4">
                    <Ionicons name="book-outline" size={24} color="#F97316" />
                  </View>
                  <Text className="text-base font-bold text-text-primary dark:text-gray-50">Journal</Text>
                  <Text className="text-xs text-text-secondary mt-1">Daily reflection</Text>
                </TouchableOpacity>
              </Link>

              {/* Check-In */}
              <Link href="/mood-tracker" asChild>
                <TouchableOpacity className="w-[47%] bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <View className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 items-center justify-center mb-4">
                    <Ionicons name="heart-outline" size={24} color="#EC4899" />
                  </View>
                  <Text className="text-base font-bold text-text-primary dark:text-gray-50">Check-In</Text>
                  <Text className="text-xs text-text-secondary mt-1">Log mood</Text>
                </TouchableOpacity>
              </Link>

              {/* Breathing */}
              <Link href="/breathing-exercise" asChild>
                <TouchableOpacity className="w-[47%] bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <View className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 items-center justify-center mb-4">
                    <Ionicons name="leaf-outline" size={24} color="#14B8A6" />
                  </View>
                  <Text className="text-base font-bold text-text-primary dark:text-gray-50">Breathing</Text>
                  <Text className="text-xs text-text-secondary mt-1">Relax now</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Continue Playing */}
          {lastSession && (
            <View className="px-6 mb-8">
              <Text className="text-lg font-bold text-text-primary dark:text-gray-100 mb-4">Jump Back In</Text>
              <TouchableOpacity
                onPress={navigateToPlayer}
                className="flex-row items-center p-6 rounded-[24px] bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mr-5 border-4 border-white dark:border-gray-700">
                  <Ionicons name="play" size={32} color={colors.primary} style={{ marginLeft: 4 }} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-text-primary dark:text-gray-50 leading-tight mb-1">{lastSession.title}</Text>
                  <Text className="text-sm text-text-secondary">{lastSession.description}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Recent Badges */}
          {recentBadges.length > 0 && (
            <View className="px-6 pb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-text-primary dark:text-gray-100">Recent Awards</Text>
                <Link href="/achievements-screen" asChild>
                  <TouchableOpacity>
                    <Text className="text-primary font-semibold">View All</Text>
                  </TouchableOpacity>
                </Link>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                {recentBadges.map((badge, i) => (
                  <View key={i} className="mr-4 w-32 p-5 rounded-[24px] bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm items-center">
                    <Ionicons name={badge.icon as any} size={32} color={colors.primary} style={{ marginBottom: 12 }} />
                    <Text className="text-sm font-bold text-center text-text-primary dark:text-gray-50 leading-tight" numberOfLines={2}>
                      {badge.title}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
