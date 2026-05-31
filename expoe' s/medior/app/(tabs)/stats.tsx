import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "../../contexts/ThemeContext";
import { getAchievementStats } from '../utils/achievements';
import { getMoodStats } from '../utils/moodtracker';
import { getAllSessionProgress, getProgress } from '../utils/progressStorage';

export default function StatsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState({
    streak: 0,
    totalMinutes: 0,
    totalHours: 0,
    completedSessions: 0,
    averageSessionLength: 0,
    daysActive: 0,
  });

  const [moodStats, setMoodStats] = useState({
    totalEntries: 0,
    averageMood: 0,
    recentTrend: null as 'improving' | 'declining' | 'stable' | null,
  });

  const [achievementStats, setAchievementStats] = useState({
    unlocked: 0,
    total: 0,
    percentage: 0,
  });

  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useFocusEffect(
    useCallback(() => {
      loadAllStats();
    }, [])
  );

  const loadAllStats = async () => {
    const progress = await getProgress();
    const sessions = await getAllSessionProgress();

    const completed = sessions.filter(
      s => s.duration > 0 && s.position / s.duration >= 0.9
    ).length;

    const totalMinutes = progress.totalMinutes;

    const uniqueDates = new Set(
      sessions.map(s => new Date(s.lastPlayed).toISOString().split('T')[0])
    );

    setStats({
      streak: progress.streak,
      totalMinutes,
      totalHours: Math.floor(totalMinutes / 60),
      completedSessions: completed,
      averageSessionLength: completed > 0 ? totalMinutes / completed : 0,
      daysActive: uniqueDates.size,
    });

    // Weekly
    const today = new Date();
    const weekly = new Array(7).fill(0);
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      weekly[i] = Math.floor(
        sessions
          .filter(s => s.lastPlayed.split('T')[0] === dateStr)
          .reduce((sum, s) => sum + s.position / 60, 0)
      );
    }
    setWeeklyData(weekly);

    const mood = await getMoodStats();
    setMoodStats({
      totalEntries: mood.totalEntries,
      averageMood: mood.averageMood || 0,
      recentTrend: mood.recentTrend,
    });

    setAchievementStats(await getAchievementStats());
  };

  const getDayLabel = (index: number) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return days[date.getDay()];
  };

  const maxWeekly = Math.max(...weeklyData, 1);

  const MetricCard = ({
    icon,
    iconColor,
    value,
    label,
    sub,
  }: {
    icon: string;
    iconColor: string;
    value: string;
    label: string;
    sub: string;
  }) => (
    <View
      className="rounded-3xl p-5 mb-4 bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm"
      style={{
        width: '48%',
      }}
    >
      <View className="w-10 h-10 rounded-full items-center justify-center mb-3" style={{ backgroundColor: iconColor + '15' }}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <Text className="text-3xl font-bold text-text-primary dark:text-gray-100">
        {value}
      </Text>
      <Text className="text-xs font-bold uppercase tracking-wider text-text-secondary mt-1">
        {label}
      </Text>
      <Text className="text-xs text-text-secondary mt-2 opacity-70">
        {sub}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-6 py-8">
            <Text className="text-3xl font-bold text-text-primary dark:text-gray-50 mb-1">Your Journey</Text>
            <Text className="text-base text-text-secondary">Track your meditation progress</Text>
          </View>

          {/* Metric grid */}
          <View className="px-6 pb-2">
            <View className="flex-row flex-wrap justify-between">
              <MetricCard
                icon="time"
                iconColor={colors.achievementTime}
                value={`${stats.totalHours}`}
                label="Hours"
                sub={`${stats.totalMinutes} minutes total`}
              />
              <MetricCard
                icon="flame"
                iconColor={colors.achievementStreak}
                value={`${stats.streak}`}
                label="Days Streak"
                sub="Keep it going! 🔥"
              />
              <MetricCard
                icon="checkmark-circle"
                iconColor={colors.success}
                value={`${stats.completedSessions}`}
                label="Sessions"
                sub="Completed perfectly"
              />
              <MetricCard
                icon="calendar"
                iconColor={colors.info}
                value={`${stats.daysActive}`}
                label="Days Active"
                sub="Unique visiting days"
              />
            </View>
          </View>

          {/* Weekly bar chart */}
          <View className="px-6 pb-6">
            <View className="rounded-3xl p-6 bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-lg font-bold text-text-primary dark:text-gray-100">
                  Activity
                </Text>
                <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Last 7 Days</Text>
              </View>

              <View className="flex-row items-end justify-between" style={{ height: 140 }}>
                {weeklyData.map((minutes, i) => {
                  const heightPct = Math.max((minutes / maxWeekly) * 100, minutes > 0 ? 8 : 4);
                  const isToday = i === 6;
                  return (
                    <View key={i} className="items-center flex-1">
                      <View className="w-full items-center justify-end" style={{ height: 110 }}>
                        {minutes > 0 && (
                          <Text className="text-[10px] mb-1 font-medium text-text-secondary">
                            {minutes}
                          </Text>
                        )}
                        <View
                          className="w-8 rounded-xl"
                          style={{
                            height: `${heightPct}%`,
                            backgroundColor: isToday ? colors.primary : colors.primaryLight,
                            opacity: isToday ? 1 : 0.6,
                            borderRadius: 6
                          }}
                        />
                      </View>
                      <Text
                        className="text-xs mt-3 text-center"
                        style={{
                          color: isToday ? colors.primary : colors.textSecondary,
                          fontWeight: isToday ? 'bold' : 'normal',
                        }}
                      >
                        {getDayLabel(i)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Insights */}
          <View className="px-6 pb-6">
            <Text className="text-xl font-bold mb-4 px-2 text-text-primary dark:text-gray-100">
              Insights
            </Text>

            {/* Average session */}
            <View className="rounded-3xl p-4 mb-3 bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm flex-row items-center">
              <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: colors.achievementTime + '15' }}>
                <Ionicons name="trending-up" size={24} color={colors.achievementTime} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-text-primary dark:text-gray-100">Average Session</Text>
                <Text className="text-sm text-text-secondary mt-0.5">{Math.floor(stats.averageSessionLength)} minutes per session</Text>
              </View>
              <Text className="text-xl font-bold" style={{ color: colors.primary }}>{Math.floor(stats.averageSessionLength)}m</Text>
            </View>

            {/* Achievement progress */}
            <View className="rounded-3xl p-5 mb-3 bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: colors.achievementStreak + '15' }}>
                    <Ionicons name="trophy" size={24} color={colors.achievementStreak} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-text-primary dark:text-gray-100">Achievements</Text>
                    <Text className="text-sm text-text-secondary mt-0.5">{achievementStats.unlocked} of {achievementStats.total} unlocked</Text>
                  </View>
                </View>
                <Text className="text-xl font-bold" style={{ color: colors.primary }}>{achievementStats.percentage}%</Text>
              </View>
              <View className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${achievementStats.percentage}%`,
                    backgroundColor: colors.achievementStreak,
                  }}
                />
              </View>
            </View>

            {/* Mood trend */}
            {moodStats.totalEntries > 0 && (
              <View className="rounded-3xl p-4 mb-3 bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm flex-row items-center">
                <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: colors.achievementSpecial + '15' }}>
                  <Ionicons name="happy" size={24} color={colors.achievementSpecial} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-text-primary dark:text-gray-100">Mood Trend</Text>
                  <Text className="text-sm text-text-secondary mt-0.5">{moodStats.totalEntries} entries logged</Text>
                </View>

                {moodStats.recentTrend && (
                  <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl">
                    <Ionicons
                      name={
                        moodStats.recentTrend === 'improving' ? 'trending-up' : moodStats.recentTrend === 'declining' ? 'trending-down' : 'remove'
                      }
                      size={16}
                      color={
                        moodStats.recentTrend === 'improving' ? colors.success : moodStats.recentTrend === 'declining' ? colors.error : colors.textSecondary
                      }
                    />
                    <Text
                      className="ml-1 text-xs font-bold"
                      style={{
                        color: moodStats.recentTrend === 'improving' ? colors.success : moodStats.recentTrend === 'declining' ? colors.error : colors.textSecondary,
                      }}
                    >
                      {moodStats.recentTrend === 'improving' ? 'Up' : moodStats.recentTrend === 'declining' ? 'Down' : 'Flat'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Milestone text */}
          <Text className="text-center text-xs text-text-secondary/60 pb-8 px-10">
            {stats.streak > 0
              ? `You're on a ${stats.streak}-day streak! Keep consistency to build a lasting habit.`
              : 'Consistency is key. Start your streak today!'}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
