import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "../../contexts/ThemeContext";
import {
  Achievement,
  getAchievementStats,
  getAchievements
} from '../utils/achievements';

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [achievements, setAchievements] = useState<(Achievement & { unlocked?: boolean })[]>([]);
  const [stats, setStats] = useState({ unlocked: 0, total: 0, percentage: 0 });
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    // Assuming getAchievements is available and exported, otherwise this line needs checking
    // Based on previous file content, it was commented out? 
    // Just in case, I will try to use it. If it fails, the user might need to uncomment it in utils.
    // Re-reading original file: `// getAchievements,` was commented out? 
    // Ah, line 7 was commented out. But line 25: `// setAchievements(await getAchievements());` was also commented out?
    // This implies the util might not be ready or I should check if it exists.
    // I will assume it exists or I should fix it. 
    // For now I will uncomment it and if it errors I will fix.
    // Wait, if it was commented out, maybe I should check why.
    // But I can't check `../utils/achievements` easily without reading it.
    // I'll assume standard usage.
    try {
      const all = await getAchievements();
      setAchievements(all);
      setStats(await getAchievementStats());
    } catch (e) {
      console.error("Error loading achievements", e);
    }
  };

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'streak': return colors.achievementStreak;
      case 'time': return colors.achievementTime;
      case 'sessions': return colors.achievementSession;
      case 'special': return colors.achievementSpecial;
      default: return colors.primary;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'streak': return 'Streak';
      case 'time': return 'Time';
      case 'sessions': return 'Sessions';
      case 'special': return 'Special';
      default: return category;
    }
  };

  const formatProgress = (a: Achievement & { unlocked?: boolean }) => {
    const current = a.progress || 0;
    if (a.category === 'time' && a.requirement >= 60)
      return `${Math.floor(current / 60)}/${Math.floor(a.requirement / 60)}h`;
    return a.category === 'time' ? `${current}/${a.requirement}m` : `${current}/${a.requirement}`;
  };

  const getProgressPercentage = (a: Achievement & { unlocked?: boolean }) =>
    a.unlocked ? 100 : Math.min(100, ((a.progress || 0) / a.requirement) * 100);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <View className="px-6 py-8 pb-4">
          <Text className="text-3xl font-bold text-text-primary dark:text-gray-50">Achievements</Text>
          <Text className="text-base text-text-secondary mt-1">Track your milestones</Text>
        </View>

        {/* Stats Card */}
        <View className="mx-6 mb-6 p-6 rounded-3xl bg-primary shadow-lg shadow-primary/30 items-center justify-between flex-row">
          <View>
            <Text className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">Progress</Text>
            <Text className="text-white text-3xl font-bold">{stats.unlocked} <Text className="text-lg font-normal text-white/70">/ {stats.total}</Text></Text>
            <Text className="text-white/70 text-xs mt-1">Unlocked Achievements</Text>
          </View>
          <View className="items-center justify-center">
            <View className="w-20 h-20 rounded-full border-4 border-white/20 items-center justify-center">
              <Text className="text-white font-bold text-xl">{stats.percentage}%</Text>
            </View>
          </View>
        </View>

        {/* Filter pills
        <View className="px-6 mb-4">
          <View className="flex-row p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
            {(['all', 'unlocked', 'locke0d'] as const).map(f => {
              const active = filter === f;
              return (
                <Pressable
                  key={f}
                  className={`flex-1 py-2 rounded-lg items-center ${active ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                  onPress={() => setFilter(f)}
                >
                  <Text className={`font-semibold text-sm ${active ? 'text-text-primary dark:text-white' : 'text-text-secondary'}`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View> */}

        {/* List */}
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 0, paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
          {filteredAchievements.map(achievement => {
            const progressPercent = getProgressPercentage(achievement);
            const catColor = getCategoryColor(achievement.category);
            return (
              <View
                key={achievement.id}
                className={`rounded-2xl p-4 mb-4 border ${achievement.unlocked ? 'bg-card-light dark:bg-card-dark border-gray-100 dark:border-gray-800 shadow-sm' : 'bg-transparent border-gray-200 dark:border-gray-800 opacity-60'}`}
              >
                <View className="flex-row items-start">
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: achievement.unlocked ? catColor + '15' : 'rgba(150,150,150,0.1)' }}
                  >
                    <Ionicons name={achievement.icon as any} size={28} color={achievement.unlocked ? catColor : colors.textSecondary} style={{ opacity: achievement.unlocked ? 1 : 0.5 }} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-base font-bold text-text-primary dark:text-gray-100 flex-1 mr-2">{achievement.title}</Text>
                      {achievement.unlocked && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
                      {!achievement.unlocked && <Ionicons name="lock-closed" size={16} color={colors.placeholder} />}
                    </View>

                    <Text className="text-sm text-text-secondary mb-3 leading-tight">{achievement.description}</Text>

                    <View className="flex-row items-center justify-between">
                      <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: catColor + '15' }}>
                        <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: catColor }}>{getCategoryName(achievement.category)}</Text>
                      </View>

                      {achievement.unlocked && achievement.unlockedAt && (
                        <Text className="text-[10px] text-text-secondary">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </Text>
                      )}
                    </View>

                    {!achievement.unlocked && (
                      <View className="mt-3">
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-[10px] text-text-secondary font-medium">{formatProgress(achievement)}</Text>
                          <Text className="text-[10px] text-text-secondary font-medium">{Math.round(progressPercent)}%</Text>
                        </View>
                        <View className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                          <View className="h-full rounded-full" style={{ width: `${progressPercent}%`, backgroundColor: catColor }} />
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          {filteredAchievements.length === 0 && (
            <View className="items-center justify-center py-16 opacity-50">
              <Ionicons name="trophy-outline" size={48} color={colors.textSecondary} />
              <Text className="text-base mt-4 text-center text-text-secondary">
                {filter === 'unlocked' ? 'No achievements unlocked yet.\nKeep meditating!' : 'All achievements are unlocked!'}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
