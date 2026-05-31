import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "../../contexts/ThemeContext";
import {
  JournalEntry,
  createJournalEntry,
  deleteEntry,
  getAllEntries,
  getAllTags,
  getDailyPrompt,
  getJournalStats
} from '../utils/meditationJournal';

type View_ = 'list' | 'create' | 'detail';

const MOOD_LABELS = ['', 'Difficult', 'Low', 'Okay', 'Good', 'Excellent'];
const MOOD_EMOJIS = ['', '😢', '😔', '😐', '🙂', '😄'];

export default function JournalScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [view, setView] = useState<View_>('list');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [journalStats, setJournalStats] = useState<Awaited<ReturnType<typeof getJournalStats>> | null>(null);

  // create-form
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState<number | null>(null);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [usePrompt, setUsePrompt] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const loadEntries = async () => {
    setEntries(await getAllEntries());
    setTags(await getAllTags());
    setJournalStats(await getJournalStats());
  };

  const filteredEntries = entries.filter(e => {
    if (activeTag && !e.tags?.includes(activeTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.content.toLowerCase().includes(q) ||
        e.prompt?.toLowerCase().includes(q) ||
        e.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreate = async () => {
    if (!newContent.trim()) {
      Alert.alert('Empty Entry', 'Write something before saving.');
      return;
    }
    const prompt = usePrompt ? getDailyPrompt() : undefined;
    await createJournalEntry(newContent.trim(), prompt, newMood || undefined, newTags.length ? newTags : undefined);
    setNewContent('');
    setNewMood(null);
    setNewTags([]);
    setView('list');
    loadEntries();
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Entry', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        handler: async () => {
          await deleteEntry(id);
          setView('list');

          if (view === 'detail') {
            // go back if we are viewing the deleted entry
            // but 'detail' view code below handles selection. 
            // We should setView list first.
            // Actually redundant call, but safe.
          }
          loadEntries();
        },
      },
    ]);
  };

  const toggleNewTag = (tag: string) => {
    setNewTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // ═══════════════════════════════════════════════════════════
  // LIST
  // ═══════════════════════════════════════════════════════════
  if (view === 'list') {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <SafeAreaView edges={['top']} className="flex-1">
          {/* Header */}
          <View className="px-6 py-8 pb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-text-primary dark:text-gray-50">Journal</Text>
              <Text className="text-base text-text-secondary mt-1">Reflect on your journey</Text>
            </View>
            <TouchableOpacity
              onPress={() => setView('create')}
              className="w-12 h-12 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/30"
            >
              <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
          </View>

          {/* Stats mini-bar */}
          {journalStats && journalStats.totalEntries > 0 && (
            <View className="mx-6 mb-4 p-4 rounded-2xl bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm flex-row justify-around">
              {[
                { value: journalStats.totalEntries, label: 'Entries' },
                { value: journalStats.entriesThisWeek, label: 'This Week' },
                { value: journalStats.longestStreak, label: 'Streak' },
              ].map((s, i) => (
                <View key={i} className="items-center flex-1">
                  <Text className="text-xl font-bold text-primary">{s.value}</Text>
                  <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wide mt-1">{s.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Search bar */}
          <View className="px-6 mb-4">
            <View className="flex-row items-center rounded-2xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <Ionicons name="search-outline" size={20} color={colors.placeholder} />
              <TextInput
                className="flex-1 ml-3 text-base text-text-primary dark:text-white"
                placeholder="Search entries…"
                placeholderTextColor={colors.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.placeholder} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Tag filters */}
          {tags.length > 0 && (
            <View className="px-6 mb-2">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24 }}>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full mr-2 border ${activeTag === null ? 'bg-primary border-primary' : 'bg-transparent border-gray-200 dark:border-gray-700'}`}
                  onPress={() => setActiveTag(null)}
                >
                  <Text className={`text-xs font-bold ${activeTag === null ? 'text-white' : 'text-text-secondary'}`}>All</Text>
                </TouchableOpacity>
                {tags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    className={`px-4 py-2 rounded-full mr-2 border ${activeTag === tag ? 'bg-primary border-primary' : 'bg-transparent border-gray-200 dark:border-gray-700'}`}
                    onPress={() => setActiveTag(activeTag === tag ? null : tag)}
                  >
                    <Text className={`text-xs font-bold ${activeTag === tag ? 'text-white' : 'text-text-secondary'}`}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Entry list */}
          <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 16, paddingBottom: insets.bottom + 160 }} showsVerticalScrollIndicator={false}>
            {filteredEntries.map(entry => (
              <TouchableOpacity
                key={entry.id}
                className="rounded-3xl p-5 mb-4 bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm"
                onPress={() => { setSelectedEntry(entry); setView('detail'); }}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-primary mr-2" />
                    <Text className="text-sm font-bold text-text-secondary uppercase">{formatDate(entry.date)}</Text>
                  </View>
                  {entry.mood && (
                    <Text style={{ fontSize: 24 }}>{MOOD_EMOJIS[entry.mood]}</Text>
                  )}
                </View>

                {entry.prompt && (
                  <Text className="text-sm italic mb-3 text-primary/80 font-medium">"{entry.prompt}"</Text>
                )}

                <Text className="text-base leading-relaxed text-text-primary dark:text-gray-100 mb-3" numberOfLines={3}>
                  {entry.content}
                </Text>

                {entry.tags && entry.tags.length > 0 && (
                  <View className="flex-row flex-wrap gap-2">
                    {entry.tags.map(t => (
                      <View key={t} className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800/50">
                        <Text className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">#{t}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {filteredEntries.length === 0 && (
              <View className="items-center justify-center py-20 opacity-50">
                <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
                <Text className="text-lg mt-6 text-center text-text-secondary font-medium">
                  {searchQuery || activeTag ? 'No matching entries found.' : 'Your journal is empty.\nStart writing today!'}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // DETAIL
  // ═══════════════════════════════════════════════════════════
  if (view === 'detail' && selectedEntry) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="px-6 py-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setView('list')}
              className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View className="flex-row gap-2">
              {/* Could add Edit button here later */}
              <TouchableOpacity
                onPress={() => handleDelete(selectedEntry.id)}
                className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center"
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
            {/* Date + mood */}
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-2xl font-bold text-text-primary dark:text-gray-50">
                  {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric'
                  })}
                </Text>
                <Text className="text-base text-text-secondary mt-1">
                  {new Date(selectedEntry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              {selectedEntry.mood && (
                <View className="items-center bg-card-light dark:bg-card-dark p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <Text style={{ fontSize: 32 }}>{MOOD_EMOJIS[selectedEntry.mood]}</Text>
                  <Text className="text-[10px] mt-1 font-bold text-text-secondary uppercase">{MOOD_LABELS[selectedEntry.mood]}</Text>
                </View>
              )}
            </View>

            {/* Prompt */}
            {selectedEntry.prompt && (
              <View className="p-5 mb-6 rounded-2xl bg-primary/5 border border-primary/10">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="sparkles" size={16} color={colors.primary} />
                  <Text className="text-xs font-bold text-primary ml-1 uppercase tracking-wider">Prompt</Text>
                </View>
                <Text className="text-lg font-medium text-text-primary dark:text-gray-100 italic leading-relaxed">"{selectedEntry.prompt}"</Text>
              </View>
            )}

            {/* Content */}
            <Text className="text-lg leading-loose text-text-primary dark:text-gray-200">
              {selectedEntry.content}
            </Text>

            {/* Tags */}
            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                {selectedEntry.tags.map(t => (
                  <View key={t} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Text className="text-xs font-bold text-text-secondary">#{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // CREATE
  // ═══════════════════════════════════════════════════════════
  const dailyPrompt = getDailyPrompt();

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <TouchableOpacity
            onPress={() => setView('list')}
            className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 items-center justify-center"
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text-primary dark:text-gray-50">New Entry</Text>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!newContent.trim()}
            className={`px-4 py-2 rounded-full ${!newContent.trim() ? 'bg-gray-200 dark:bg-gray-800' : 'bg-primary'}`}
          >
            <Text className={`font-bold ${!newContent.trim() ? 'text-gray-400' : 'text-white'}`}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          {/* Prompt toggle + card */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-bold text-text-secondary uppercase tracking-wider">Today's Prompt</Text>
            <TouchableOpacity onPress={() => setUsePrompt(!usePrompt)} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              <Text className="text-xs font-bold text-text-secondary">
                {usePrompt ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
          {usePrompt && (
            <View className="rounded-2xl p-5 mb-6 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
              <Text className="text-lg font-medium text-purple-900 dark:text-purple-100 italic leading-relaxed">"{dailyPrompt}"</Text>
            </View>
          )}

          {/* Mood picker */}
          <Text className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">How are you feeling?</Text>
          <View className="flex-row justify-between mb-8 bg-card-light dark:bg-card-dark p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            {[1, 2, 3, 4, 5].map(level => {
              const active = newMood === level;
              return (
                <TouchableOpacity
                  key={level}
                  className="items-center justify-center"
                  onPress={() => setNewMood(level)}
                >
                  <View
                    className={`w-12 h-12 rounded-2xl items-center justify-center mb-1 transition-all ${active ? 'bg-primary scale-110' : 'bg-transparent'
                      }`}
                  >
                    <Text style={{ fontSize: 28 }}>{MOOD_EMOJIS[level]}</Text>
                  </View>
                  {active && <View className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Content */}
          <TextInput
            className="bg-transparent text-xl leading-relaxed text-text-primary dark:text-white mb-8"
            style={{ minHeight: 120 }}
            placeholder="Write your thoughts here..."
            placeholderTextColor={colors.placeholder}
            value={newContent}
            onChangeText={setNewContent}
            multiline
            textAlignVertical="top"
          />

          {/* Tags */}
          <Text className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Tags</Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {['gratitude', 'peace', 'calm', 'focus', 'growth', 'insight', 'struggle', 'joy'].map(tag => {
              const picked = newTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  className={`px-4 py-2 rounded-xl border ${picked ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                  onPress={() => toggleNewTag(tag)}
                >
                  <Text className={`text-xs font-bold ${picked ? 'text-white' : 'text-text-secondary'}`}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
