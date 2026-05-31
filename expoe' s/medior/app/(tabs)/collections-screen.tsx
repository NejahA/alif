import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "../../contexts/ThemeContext";
import { MEDITATION_SESSIONS } from '../utils/categories ';
import {
  Collection,
  createCollection,
  getAllCollections,
  getCollectionProgress,
  getCompletionPercentage,
  getNextSession,
  markSessionCompleted,
  resetCollectionProgress
} from '../utils/collections';

type View_ = 'list' | 'detail' | 'create';

export default function CollectionsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [view, setView] = useState<View_>('list');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState<Collection | null>(null);
  const [completionMap, setCompletionMap] = useState<Record<string, number>>({});
  const [completedSessions, setCompletedSessions] = useState<string[]>([]);

  // create-form state
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createSessions, setCreateSessions] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadCollections();
    }, [])
  );

  const loadCollections = async () => {
    const all = await getAllCollections();
    setCollections(all);

    // Pre-fetch completion percentages
    const map: Record<string, number> = {};
    for (const c of all) {
      map[c.id] = await getCompletionPercentage(c.id);
    }
    setCompletionMap(map);
  };

  const openDetail = async (collection: Collection) => {
    setSelected(collection);
    const progress = await getCollectionProgress(collection.id);
    setCompletedSessions(progress?.completedSessions || []);
    setView('detail');
  };

  const handlePlay = async () => {
    if (!selected) return;
    const next = await getNextSession(selected.id);
    if (next) {
      router.push(`/player?audioKey=${next.audioKey}`);
    } else {
      Alert.alert('Collection Complete', 'You\'ve finished every session in this collection!', [
        { text: 'Reset & Replay', onPress: () => resetCollectionProgress(selected.id).then(loadCollections) },
        { text: 'OK' },
      ]);
    }
  };

  const handleMarkComplete = async (audioKey: string) => {
    if (!selected) return;
    await markSessionCompleted(selected.id, audioKey);
    const progress = await getCollectionProgress(selected.id);
    setCompletedSessions(progress?.completedSessions || []);
    const newPct = await getCompletionPercentage(selected.id);
    setCompletionMap(prev => ({ ...prev, [selected.id]: newPct }));
  };

  const handleCreate = async () => {
    if (!createName.trim() || createSessions.length === 0) {
      Alert.alert('Missing Info', 'Enter a name and pick at least one session.');
      return;
    }
    await createCollection(createName.trim(), createDesc.trim(), createSessions);
    setCreateName('');
    setCreateDesc('');
    setCreateSessions([]);
    setView('list');
    loadCollections();
  };

  const toggleCreateSession = (key: string) => {
    setCreateSessions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // ═══════════════════════════════════════════════════════════
  // LIST
  // ═══════════════════════════════════════════════════════════
  if (view === 'list') {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <SafeAreaView edges={['top']} className="flex-1">
          {/* Header */}
          <View className="px-6 py-8 flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-text-primary dark:text-gray-50">Programs</Text>
              <Text className="text-base text-text-secondary mt-1">Guided multi-session journeys</Text>
            </View>
            <TouchableOpacity
              onPress={() => setView('create')}
              className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 120 }}
            showsVerticalScrollIndicator={false}
          >
            {collections.map(c => {
              const pct = completionMap[c.id] || 0;
              return (
                <TouchableOpacity
                  key={c.id}
                  className="rounded-3xl p-5 mb-5 bg-card-light dark:bg-card-dark shadow-sm border border-gray-100 dark:border-gray-800"
                  onPress={() => openDetail(c)}
                  activeOpacity={0.9}
                >
                  <View className="flex-row items-start">
                    <View
                      className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                      style={{ backgroundColor: c.color + '15' }} // 15% opacity
                    >
                      <Text style={{ fontSize: 32 }}>{c.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-text-primary dark:text-gray-100 leading-tight">{c.name}</Text>
                      <Text className="text-sm mt-1 text-text-secondary line-clamp-2" numberOfLines={2}>{c.description}</Text>

                      <View className="mt-4">
                        <View className="flex-row justify-between mb-1.5 items-center">
                          <Text className="text-xs font-semibold text-text-secondary">
                            {c.sessionKeys.length} Sessions
                          </Text>
                          <Text className="text-xs font-bold" style={{ color: c.color }}>{Math.round(pct)}%</Text>
                        </View>
                        <View className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                          <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {collections.length === 0 && (
              <View className="items-center justify-center py-20 opacity-60">
                <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                  <Ionicons name="library-outline" size={40} color={colors.textSecondary} />
                </View>
                <Text className="text-lg font-medium text-text-secondary">No programs yet</Text>
                <Text className="text-sm mt-2 text-text-secondary text-center px-10">
                  Tap the + button above to create your first meditation program
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
  if (view === 'detail' && selected) {
    const pct = completionMap[selected.id] || 0;
    // Find the index of the next uncompleted session
    const nextIdx = selected.sessionKeys.findIndex(k => !completedSessions.includes(k));

    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        {/* Header Background */}
        <View style={{ backgroundColor: selected.color }} className="absolute top-0 left-0 right-0 h-64 opacity-10 dark:opacity-20" />

        <SafeAreaView edges={['top']} className="flex-1">
          <View className="px-6 py-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => setView('list')}
              className="w-10 h-10 rounded-full bg-white/50 dark:bg-black/20 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}>
            {/* Collection Info */}
            <View className="px-6 mb-8 items-center">
              <View className="w-24 h-24 rounded-3xl items-center justify-center mb-4 shadow-sm bg-white dark:bg-gray-800">
                <Text style={{ fontSize: 48 }}>{selected.icon}</Text>
              </View>
              <Text className="text-2xl font-bold text-center text-text-primary dark:text-white mb-2">{selected.name}</Text>
              <Text className="text-center text-text-secondary leading-6 px-4">{selected.description}</Text>

              {/* Main Progress */}
              <View className="flex-row items-center mt-6 gap-4">
                <View className="items-center px-4 py-2 rounded-xl bg-card-light dark:bg-card-dark shadow-sm">
                  <Text className="text-lg font-bold" style={{ color: selected.color }}>{Math.round(pct)}%</Text>
                  <Text className="text-[10px] uppercase text-text-secondary tracking-wider font-semibold">Complete</Text>
                </View>
                <View className="items-center px-4 py-2 rounded-xl bg-card-light dark:bg-card-dark shadow-sm">
                  <Text className="text-lg font-bold text-text-primary dark:text-gray-100">{completedSessions.length}/{selected.sessionKeys.length}</Text>
                  <Text className="text-[10px] uppercase text-text-secondary tracking-wider font-semibold">Sessions</Text>
                </View>
              </View>
            </View>

            {/* Sessions List */}
            <View className="px-4">
              <Text className="text-base font-bold text-text-primary dark:text-gray-100 mb-4 px-2">Sessions</Text>
              {selected.sessionKeys.map((key, i) => {
                const session = MEDITATION_SESSIONS.find(s => s.audioKey === key);
                const completed = completedSessions.includes(key);
                const isNext = i === nextIdx;

                return (
                  <View
                    key={key}
                    className={`rounded-2xl p-4 mb-3 flex-row items-center ${isNext ? 'bg-white dark:bg-gray-800 shadow-sm border-2' : 'bg-transparent border-b border-gray-100 dark:border-gray-800'}`}
                    style={{
                      borderColor: isNext ? selected.color : undefined
                    }}
                  >
                    {/* Step number / check */}
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-4 shadow-sm"
                      style={{ backgroundColor: completed ? colors.success : isNext ? selected.color : colors.surface }}
                    >
                      {completed ? (
                        <Ionicons name="checkmark" size={20} color="white" />
                      ) : (
                        <Text className="text-sm font-bold" style={{ color: completed || isNext ? 'white' : colors.textSecondary }}>
                          {i + 1}
                        </Text>
                      )}
                    </View>

                    <View className="flex-1 py-1">
                      <Text className={`text-base font-semibold ${isNext ? 'text-text-primary dark:text-white' : 'text-text-primary/80 dark:text-gray-300'}`}>
                        {session?.title || key}
                      </Text>
                      {session?.description && (
                        <Text className="text-xs text-text-secondary mt-0.5" numberOfLines={1}>
                          {session.description}
                        </Text>
                      )}
                      {isNext && (
                        <Text className="text-xs font-bold mt-1" style={{ color: selected.color }}>● Current Session</Text>
                      )}
                    </View>

                    {/* Mark complete button (for sessions already attempted) */}
                    {!completed && (
                      <TouchableOpacity onPress={() => handleMarkComplete(key)} className="p-2">
                        <Ionicons name="checkmark-circle-outline" size={24} color={colors.border} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Continue / Reset footer */}
          <View
            className="absolute left-0 right-0 p-6 bg-white/90 dark:bg-gray-900/90 border-t border-gray-100 dark:border-gray-800 blur-md"
            style={{ bottom: insets.bottom + 70 }}
          >
            <TouchableOpacity
              className="w-full py-4 rounded-2xl items-center mb-3 shadow-lg shadow-black/5"
              style={{ backgroundColor: selected.color }}
              onPress={handlePlay}
            >
              <Text className="text-white text-lg font-bold">
                {pct === 0 ? 'Start Program' : pct >= 100 ? 'Replay Program' : 'Continue Journey'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full py-2 items-center"
              onPress={() => resetCollectionProgress(selected.id).then(() => { setCompletedSessions([]); loadCollections(); })}
            >
              <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Reset progress</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // CREATE
  // ═══════════════════════════════════════════════════════════
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="px-6 py-4 flex-row items-center border-b border-gray-100 dark:border-gray-800">
          <TouchableOpacity onPress={() => setView('list')} className="mr-4">
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text-primary dark:text-white">Create Program</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 180 }}>
          {/* Name */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">Program Details</Text>
            <TextInput
              className="rounded-2xl p-4 bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-700 text-text-primary dark:text-white text-base mb-3"
              placeholder="Program Name (e.g. Sleep Routine)"
              placeholderTextColor={colors.placeholder}
              value={createName}
              onChangeText={setCreateName}
            />
            <TextInput
              className="rounded-2xl p-4 bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-700 text-text-primary dark:text-white text-base"
              style={{ minHeight: 100, textAlignVertical: 'top' }}
              placeholder="Description..."
              placeholderTextColor={colors.placeholder}
              value={createDesc}
              onChangeText={setCreateDesc}
              multiline
            />
          </View>

          {/* Pick sessions */}
          <View className="mb-4 flex-row justify-between items-end">
            <Text className="text-sm font-bold text-text-secondary uppercase tracking-wide">
              Select Sessions
            </Text>
            <Text className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
              {createSessions.length} Selected
            </Text>
          </View>

          {MEDITATION_SESSIONS.map(s => {
            const picked = createSessions.includes(s.audioKey);
            return (
              <TouchableOpacity
                key={s.audioKey}
                className={`rounded-2xl p-4 mb-3 flex-row items-center transition-all ${picked ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card-light dark:bg-card-dark border-transparent'}`}
                style={{
                  borderWidth: 1,
                  borderColor: picked ? colors.primary : 'transparent'
                }}
                onPress={() => toggleCreateSession(s.audioKey)}
                activeOpacity={0.8}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-4 transition-all ${picked ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-700'}`}
                >
                  <Ionicons name={picked ? 'checkmark' : 'add'} size={20} color={picked ? 'white' : colors.textSecondary} />
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-semibold ${picked ? 'text-primary' : 'text-text-primary dark:text-gray-200'}`}>{s.title}</Text>
                  <Text className="text-xs text-text-secondary">{s.category}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Create button */}
        <View
          className="absolute left-0 right-0 p-6 bg-white/90 dark:bg-gray-900/90 border-t border-gray-100 dark:border-gray-800"
          style={{ bottom: insets.bottom + 70 }}
        >
          <TouchableOpacity
            className={`w-full py-4 rounded-2xl items-center shadow-lg ${!createName.trim() || createSessions.length === 0 ? 'bg-gray-300 dark:bg-gray-700' : 'bg-primary shadow-primary/30'}`}
            onPress={handleCreate}
            disabled={!createName.trim() || createSessions.length === 0}
          >
            <Text className="text-white text-lg font-bold">Create Program</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
