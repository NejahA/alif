import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "../../contexts/ThemeContext";
import { getMoodEntries, MoodEntry, MoodType, saveMoodEntry } from '../utils/moodtracker';

const MOODS: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: 'excellent', emoji: '😄', label: 'Excellent', color: '#10B981' },
  { type: 'good', emoji: '🙂', label: 'Good', color: '#3B82F6' },
  { type: 'okay', emoji: '😐', label: 'Okay', color: '#F59E0B' },
  { type: 'bad', emoji: '😔', label: 'Bad', color: '#F97316' },
  { type: 'terrible', emoji: '😢', label: 'Terrible', color: '#EF4444' },
];

export default function MoodTrackerScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRecentEntries();
    }, [])
  );

  const loadRecentEntries = async () => {
    setRecentEntries(await getMoodEntries(14)); // Increased to 2 weeks
  };

  const handleSaveMood = async () => {
    if (!selectedMood) return;
    setIsSaving(true);
    await saveMoodEntry(selectedMood, note);
    setSelectedMood(null);
    setNote('');
    await loadRecentEntries();
    setIsSaving(false);
  };

  const getMoodColor = (type: MoodType) => MOODS.find(m => m.type === type)?.color || colors.primary;
  const getMoodEmoji = (type: MoodType) => MOODS.find(m => m.type === type)?.emoji || '😐';
  const getMoodLabel = (type: MoodType) => MOODS.find(m => m.type === type)?.label || 'Unknown';

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
            <Text className="text-3xl font-bold text-text-primary dark:text-gray-50">Mood Tracker</Text>
            <Text className="text-base text-text-secondary mt-1">How are you feeling today?</Text>
          </View>

          {/* Mood picker */}
          <View className="mx-4 mb-6 p-5 rounded-3xl bg-card-light dark:bg-card-dark shadow-sm border border-gray-100 dark:border-gray-800">
            <Text className="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wide">Select Your Mood</Text>

            <View className="flex-row flex-wrap justify-between gap-y-4">
              {MOODS.map(mood => {
                const active = selectedMood === mood.type;
                return (
                  <TouchableOpacity
                    key={mood.type}
                    className="items-center justify-center p-3 rounded-2xl w-[18%]"
                    style={{
                      backgroundColor: active ? mood.color + '20' : 'transparent',
                      transform: [{ scale: active ? 1.1 : 1 }]
                    }}
                    onPress={() => setSelectedMood(mood.type)}
                  >
                    <Text style={{ fontSize: 32 }}>{mood.emoji}</Text>
                    {active && (
                      <View className="w-1.5 h-1.5 rounded-full mt-1" style={{ backgroundColor: mood.color }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected Label */}
            <View className="items-center mt-2 h-6">
              <Text className="text-base font-semibold" style={{ color: selectedMood ? getMoodColor(selectedMood) : 'transparent' }}>
                {selectedMood ? MOODS.find(m => m.type === selectedMood)?.label : ''}
              </Text>
            </View>

            {/* Optional note */}
            <TextInput
              className="rounded-2xl p-4 mt-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-text-primary dark:text-white text-base"
              style={{ minHeight: 80, textAlignVertical: 'top' }}
              placeholder="Add a note (optional)…"
              placeholderTextColor={colors.placeholder}
              value={note}
              onChangeText={setNote}
              multiline
            />

            {/* Save button */}
            <TouchableOpacity
              className="mt-4 py-4 rounded-2xl items-center shadow-lg transform transition-all"
              style={{
                backgroundColor: selectedMood ? (MOODS.find(m => m.type === selectedMood)?.color || colors.primary) : colors.border,
                opacity: selectedMood ? 1 : 0.5
              }}
              disabled={!selectedMood || isSaving}
              onPress={handleSaveMood}
            >
              <Text className="text-white text-center text-lg font-bold">
                {isSaving ? 'Saving…' : 'Log Mood'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent entries */}
          <View className="px-6">
            <Text className="text-lg font-bold text-text-primary dark:text-gray-100 mb-4 px-2">Recent Entries</Text>

            {recentEntries.length === 0 ? (
              <View className="items-center justify-center py-12 opacity-60">
                <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-3">
                  <Ionicons name="heart-outline" size={32} color={colors.textSecondary} />
                </View>
                <Text className="text-center text-text-secondary w-2/3">
                  No mood entries yet. Start tracking to see your emotional journey!
                </Text>
              </View>
            ) : (
              recentEntries.map((entry, index) => {
                const moodColor = getMoodColor(entry.mood);
                return (
                  <View
                    key={index}
                    className="flex-row rounded-3xl p-4 mb-3 bg-card-light dark:bg-card-dark shadow-sm border border-gray-100 dark:border-gray-800"
                  >
                    {/* Mood Indicator Strip */}
                    <View className="w-1.5 rounded-full mr-4" style={{ backgroundColor: moodColor }} />

                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center">
                          <Text className="text-2xl mr-2">{getMoodEmoji(entry.mood)}</Text>
                          <Text className="text-base font-bold text-text-primary dark:text-gray-100">
                            {getMoodLabel(entry.mood)}
                          </Text>
                        </View>
                        <Text className="text-xs font-medium text-text-secondary">
                          {new Date(entry.timestamp).toLocaleDateString(undefined, {
                            weekday: 'short', month: 'short', day: 'numeric'
                          })}
                        </Text>
                      </View>

                      {entry.note ? (
                        <Text className="text-sm text-text-secondary mt-1 leading-relaxed pl-1 border-l-2 border-gray-100 dark:border-gray-700 ml-1">
                          {entry.note}
                        </Text>
                      ) : null}

                      <Text className="text-[10px] text-text-secondary/50 mt-2 text-right">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Insight banner */}
          {recentEntries.length >= 5 && (
            <View className="mx-6 mb-6 mt-2">
              <View
                className="rounded-2xl p-4 flex-row items-start border bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800"
              >
                <View className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
                  <Ionicons name="bulb" size={20} color="#9333ea" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-sm text-purple-900 dark:text-purple-300 mb-1">
                    Insight Unlocked
                  </Text>
                  <Text className="text-xs text-purple-700 dark:text-purple-400 leading-relaxed">
                    Great job tracking! You've logged {recentEntries.length} entries heavily recently. Check your stats page for more trends.
                  </Text>
                </View>
              </View>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
