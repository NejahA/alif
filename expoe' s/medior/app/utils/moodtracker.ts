import AsyncStorage from "@react-native-async-storage/async-storage";

const MOOD_ENTRIES_KEY = "@mood_entries";

export type MoodType = "excellent" | "good" | "okay" | "bad" | "terrible";

export interface MoodEntry {
  mood: MoodType;
  timestamp: string; // ISO date string
  note?: string;
}

/**
 * Save a new mood entry
 */
export async function saveMoodEntry(
  mood: MoodType,
  note?: string,
): Promise<void> {
  try {
    const entry: MoodEntry = {
      mood,
      timestamp: new Date().toISOString(),
      note,
    };

    // Get existing entries
    const existing = await getMoodEntries();

    // Add new entry at the beginning
    const updated = [entry, ...existing];

    // Keep only last 100 entries to avoid storage bloat
    const trimmed = updated.slice(0, 100);

    await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(trimmed));
    console.log(`[Mood Tracker] Saved entry: ${mood}`);
  } catch (error) {
    console.error("Error saving mood entry:", error);
  }
}

/**
 * Get mood entries
 * @param limit Optional limit on number of entries to return (defaults to all)
 */
export async function getMoodEntries(limit?: number): Promise<MoodEntry[]> {
  try {
    const data = await AsyncStorage.getItem(MOOD_ENTRIES_KEY);

    if (!data) return [];

    const entries: MoodEntry[] = JSON.parse(data);

    if (limit && limit > 0) {
      return entries.slice(0, limit);
    }

    return entries;
  } catch (error) {
    console.error("Error getting mood entries:", error);
    return [];
  }
}

/**
 * Get mood entries for a specific date range
 */
export async function getMoodEntriesInRange(
  startDate: Date,
  endDate: Date,
): Promise<MoodEntry[]> {
  try {
    const allEntries = await getMoodEntries();

    return allEntries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  } catch (error) {
    console.error("Error getting mood entries in range:", error);
    return [];
  }
}

/**
 * Get mood statistics
 */
export async function getMoodStats() {
  try {
    const entries = await getMoodEntries();

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageMood: null,
        moodDistribution: {},
        recentTrend: null,
      };
    }

    // Count mood distribution
    const distribution: Record<MoodType, number> = {
      excellent: 0,
      good: 0,
      okay: 0,
      bad: 0,
      terrible: 0,
    };

    const moodValues: Record<MoodType, number> = {
      excellent: 5,
      good: 4,
      okay: 3,
      bad: 2,
      terrible: 1,
    };

    let totalScore = 0;

    entries.forEach((entry) => {
      distribution[entry.mood]++;
      totalScore += moodValues[entry.mood];
    });

    const averageMood = totalScore / entries.length;

    // Get recent trend (last 7 entries vs previous 7)
    let recentTrend: "improving" | "declining" | "stable" | null = null;
    if (entries.length >= 14) {
      const recent7 = entries.slice(0, 7);
      const previous7 = entries.slice(7, 14);

      const recentAvg =
        recent7.reduce((sum, e) => sum + moodValues[e.mood], 0) / 7;
      const previousAvg =
        previous7.reduce((sum, e) => sum + moodValues[e.mood], 0) / 7;

      const difference = recentAvg - previousAvg;

      if (difference > 0.3) recentTrend = "improving";
      else if (difference < -0.3) recentTrend = "declining";
      else recentTrend = "stable";
    }

    return {
      totalEntries: entries.length,
      averageMood,
      moodDistribution: distribution,
      recentTrend,
    };
  } catch (error) {
    console.error("Error getting mood stats:", error);
    return {
      totalEntries: 0,
      averageMood: null,
      moodDistribution: {},
      recentTrend: null,
    };
  }
}

/**
 * Clear all mood entries
 */
export async function clearMoodEntries(): Promise<void> {
  try {
    await AsyncStorage.removeItem(MOOD_ENTRIES_KEY);
    console.log("[Mood Tracker] All entries cleared");
  } catch (error) {
    console.error("Error clearing mood entries:", error);
  }
}

/**
 * Get today's mood entries
 */
export async function getTodaysMoodEntries(): Promise<MoodEntry[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await getMoodEntriesInRange(today, tomorrow);
  } catch (error) {
    console.error("Error getting today's mood entries:", error);
    return [];
  }
}
