import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import {
  CategoryType,
  getAllCategories,
  getSessionsByCategory,
  MEDITATION_SESSIONS,
} from "../utils/categories ";
import {
  getFavorites,
  getRecentSessions,
  toggleFavorite,
} from "../utils/favorites";

import { getAllSessionProgress } from "../utils/progressStorage";

export default function SessionsScreen() {
  const { colors, activeTheme } = useTheme();
  const [sessionProgress, setSessionProgress] = useState<
    Record<string, { position: number; duration: number }>
  >({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryType | "all" | "favorites" | "recent"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSessions, setRecentSessions] = useState<string[]>([]);

  const categories = getAllCategories();

  useFocusEffect(
    useCallback(() => {
      loadProgress();
      loadFavorites();
      loadRecent();
    }, []),
  );

  const loadProgress = async () => {
    const allProgress = await getAllSessionProgress();
    const progressMap: Record<string, { position: number; duration: number }> =
      {};

    allProgress.forEach((session) => {
      progressMap[session.sessionKey] = {
        position: session.position,
        duration: session.duration,
      };
    });

    setSessionProgress(progressMap);
  };

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setFavorites(new Set(favs.map((f) => f.audioKey)));
  };

  const loadRecent = async () => {
    const recent = await getRecentSessions(5);
    setRecentSessions(recent.map((r) => r.audioKey));
  };

  const handleToggleFavorite = async (
    audioKey: string,
    title: string,
    event: any,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const isFav = await toggleFavorite(audioKey, title);

    if (isFav) {
      setFavorites((prev) => new Set([...prev, audioKey]));
    } else {
      setFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(audioKey);
        return newSet;
      });
    }
  };

  const getProgressPercentage = (audioKey: string): number => {
    const progress = sessionProgress[audioKey];
    if (!progress || progress.duration === 0) return 0;
    return Math.min(100, (progress.position / progress.duration) * 100);
  };

  const formatProgress = (audioKey: string): string => {
    const progress = sessionProgress[audioKey];
    if (!progress) return "";

    const minutes = Math.floor(progress.position / 60);
    const seconds = Math.floor(progress.position % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Filter sessions based on selected category and search
  let displayedSessions = MEDITATION_SESSIONS;

  if (selectedCategory === "favorites") {
    displayedSessions = displayedSessions.filter((s) =>
      favorites.has(s.audioKey),
    );
  } else if (selectedCategory === "recent") {
    displayedSessions = displayedSessions.filter((s) =>
      recentSessions.includes(s.audioKey),
    );
  } else if (selectedCategory !== "all") {
    displayedSessions = getSessionsByCategory(selectedCategory as CategoryType);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    displayedSessions = displayedSessions.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query),
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{ backgroundColor: colors.primary }}
        className="pt-16 pb-4 px-6"
      >
        <Text className="text-white text-3xl font-bold mb-4">
          Meditation Sessions
        </Text>

        {/* Search Bar */}
        <View
          className="flex-row items-center px-4 py-3 rounded-xl"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <Ionicons name="search" size={20} color="white" />
          <TextInput
            className="flex-1 ml-3 text-white text-base"
            placeholder="Search sessions..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b"
        style={{
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          flexGrow: 0,
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          height: 44,
          alignItems: 'center',
          gap: 8
        }}
      >
        <TouchableOpacity
          className="px-4 py-1.5 rounded-full"
          style={{
            backgroundColor:
              selectedCategory === "all" ? colors.primary : colors.surface,
          }}
          onPress={() => setSelectedCategory("all")}
        >
          <Text
            className="font-medium"
            style={{
              color: selectedCategory === "all" ? "white" : colors.text,
            }}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="px-4 py-1.5 rounded-full"
          style={{
            backgroundColor:
              selectedCategory === "favorites"
                ? colors.primary
                : colors.surface,
          }}
          onPress={() => setSelectedCategory("favorites")}
        >
          <Text
            className="font-medium"
            style={{
              color: selectedCategory === "favorites" ? "white" : colors.text,
            }}
          >
            ⭐ Favorites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="px-4 py-1.5 rounded-full"
          style={{
            backgroundColor:
              selectedCategory === "recent" ? colors.primary : colors.surface,
          }}
          onPress={() => setSelectedCategory("recent")}
        >
          <Text
            className="font-medium"
            style={{
              color: selectedCategory === "recent" ? "white" : colors.text,
            }}
          >
            🕐 Recent
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            className="px-4 py-1.5 rounded-full"
            style={{
              backgroundColor:
                selectedCategory === cat.id ? colors.primary : colors.surface,
            }}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text
              className="font-medium"
              style={{
                color: selectedCategory === cat.id ? "white" : colors.text,
              }}
            >
              {cat.icon} {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sessions List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 }}
      >
        {displayedSessions.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons
              name="musical-notes-outline"
              size={64}
              style={{ color: colors.border }}
            />
            <Text
              className="text-lg mt-4"
              style={{ color: colors.textSecondary }}
            >
              {selectedCategory === "favorites"
                ? "No favorite sessions yet"
                : selectedCategory === "recent"
                  ? "No recent sessions"
                  : "No sessions found"}
            </Text>
          </View>
        ) : (
          displayedSessions.map((session) => {
            const progressPercent = getProgressPercentage(session.audioKey);
            const hasProgress = progressPercent > 0;
            const isFav = favorites.has(session.audioKey);

            return (
              <Link
                key={session.id}
                href={{
                  pathname: "/player",
                  params: {
                    title: session.title,
                    audioKey: session.audioKey,
                    description: session.description,
                  },
                }}
                asChild
              >
                <TouchableOpacity
                  className="rounded-2xl p-5 mb-4 shadow-sm border"
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  }}
                  activeOpacity={0.85}
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text
                          className="text-xl font-semibold"
                          style={{ color: colors.text }}
                        >
                          {session.title}
                        </Text>
                        {session.isNew && (
                          <View className="ml-2 bg-green-500 px-2 py-0.5 rounded-full">
                            <Text className="text-white text-xs font-bold">
                              NEW
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text
                        className="text-sm font-medium mb-2"
                        style={{ color: colors.primary }}
                      >
                        {session.duration}
                      </Text>
                    </View>

                    {/* Favorite Button */}
                    <TouchableOpacity
                      className="p-2"
                      onPress={(e) =>
                        handleToggleFavorite(session.audioKey, session.title, e)
                      }
                    >
                      <Ionicons
                        name={isFav ? "heart" : "heart-outline"}
                        size={24}
                        color={isFav ? "#EF4444" : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text
                    className="text-base mb-3"
                    style={{ color: colors.textSecondary }}
                  >
                    {session.description}
                  </Text>

                  {/* Progress bar */}
                  {hasProgress && (
                    <View className="mt-2">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          Progress: {formatProgress(session.audioKey)}
                        </Text>
                        <Text
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          {Math.round(progressPercent)}%
                        </Text>
                      </View>
                      <View
                        className="w-full h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${progressPercent}%`,
                            backgroundColor: colors.primary,
                          }}
                        />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </Link>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
