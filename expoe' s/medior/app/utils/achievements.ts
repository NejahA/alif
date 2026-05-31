// app/utils/achievements.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProgress } from "./progressStorage";

// ────────────────────────────────────────────────────────────────
// Storage Keys
// ────────────────────────────────────────────────────────────────

const ACHIEVEMENTS_KEY = "@meditation_achievements"; // list of unlocked achievement IDs
const SESSION_COUNTS_KEY = "@meditation_session_counts"; // { "sereneForest": 3, "moonlight": 1, ... }

// ────────────────────────────────────────────────────────────────
// Achievement Definition
// ────────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Ionicons name
  unlockedAt?: string; // ISO timestamp when unlocked
  condition: (params: AchievementCheckParams) => boolean;
  category: 'streak' | 'time' | 'sessions' | 'special';
  requirement: number;
  progress?: number;

}

interface AchievementCheckParams {
  totalMinutes: number;
  streak: number;
  sessionMinutes: number; // minutes in current session
  sessionKey: string; // e.g. "sereneForest"
  sessionCompleted: boolean; // true if session was fully/near-fully completed
  isEarlyMorning: boolean;
  isLateNight: boolean;
  sessionCounts: Record<string, number>;
}

// ────────────────────────────────────────────────────────────────
// List of Achievements
// ────────────────────────────────────────────────────────────────

const achievements: Achievement[] = [
  // Basic milestones
  {
    id: "first_session",
    title: "First Steps",
    description: "Complete your very first meditation session",
    icon: "leaf-outline",
    category: "sessions",
    requirement: 1,
    condition: ({ sessionCompleted }) => sessionCompleted,
  },
  {
    id: "five_minutes_total",
    title: "Five-Minute Calm",
    description: "Accumulate 5 minutes of meditation",
    icon: "time-outline",
    category: "time",
    requirement: 5,
    condition: ({ totalMinutes }) => totalMinutes >= 5,
  },
  {
    id: "thirty_minutes_total",
    title: "Half-Hour Harmony",
    description: "Reach 30 minutes of total meditation time",
    icon: "hourglass-outline",
    category: "time",
    requirement: 30,
    condition: ({ totalMinutes }) => totalMinutes >= 30,
  },
  {
    id: "one_hour_total",
    title: "Hour of Peace",
    description: "Reach 60 minutes of total meditation time",
    icon: "sparkles-outline",
    category: "time",
    requirement: 60,
    condition: ({ totalMinutes }) => totalMinutes >= 60,
  },

  // Streaks
  {
    id: "streak_3",
    title: "3-Day Streak",
    description: "Meditate 3 days in a row",
    icon: "flame-outline",
    category: "streak",
    requirement: 3,
    condition: ({ streak }) => streak >= 3,
  },
  {
    id: "streak_7",
    title: "Week of Mindfulness",
    description: "Meditate 7 days in a row",
    icon: "trophy-outline",
    category: "streak",
    requirement: 7,
    condition: ({ streak }) => streak >= 7,
  },

  // Time of day
  {
    id: "early_bird",
    title: "Early Bird",
    description: "Meditate before 7 AM",
    icon: "sunny-outline",
    category: "special",
    requirement: 1,
    condition: ({ isEarlyMorning, sessionCompleted }) =>
      isEarlyMorning && sessionCompleted,
  },
  {
    id: "night_owl",
    title: "Night Owl",
    description: "Meditate after 10 PM",
    icon: "moon-outline",
    category: "special",
    requirement: 1,
    condition: ({ isLateNight, sessionCompleted }) =>
      isLateNight && sessionCompleted,
  },

  // Session-specific
  {
    id: "forest_whisperer_3",
    title: "Forest Whisperer",
    description: 'Complete "Whispers of the Serene Forest" 3 times',
    icon: "leaf",
    category: "sessions",
    requirement: 3,
    condition: ({ sessionKey, sessionCompleted, sessionCounts }) =>
      sessionKey === "sereneForest" &&
      sessionCompleted &&
      (sessionCounts["sereneForest"] || 0) >= 3,
  },
  {
    id: "moonlight_meditator_3",
    title: "Moonlight Meditator",
    description: 'Complete "Whispers Beneath the Moonlight" 3 times',
    icon: "moon",
    category: "sessions",
    requirement: 3,
    condition: ({ sessionKey, sessionCompleted, sessionCounts }) =>
      sessionKey === "moonlight" &&
      sessionCompleted &&
      (sessionCounts["moonlight"] || 0) >= 3,
  },
];

// ────────────────────────────────────────────────────────────────
// Session Count Helpers
// ────────────────────────────────────────────────────────────────

async function getSessionCount(sessionKey: string): Promise<number> {
  try {
    const json = await AsyncStorage.getItem(SESSION_COUNTS_KEY);
    const counts = json ? JSON.parse(json) : {};
    return counts[sessionKey] || 0;
  } catch (e) {
    console.error("Error reading session counts:", e);
    return 0;
  }
}

async function incrementSessionCount(sessionKey: string) {
  try {
    const counts = await getSessionCount(sessionKey);
    const json = await AsyncStorage.getItem(SESSION_COUNTS_KEY);
    const newCounts = {
      ...(json ? JSON.parse(json) : {}),
      [sessionKey]: counts + 1,
    };
    await AsyncStorage.setItem(SESSION_COUNTS_KEY, JSON.stringify(newCounts));
  } catch (e) {
    console.error("Error incrementing session count:", e);
  }
}

// ────────────────────────────────────────────────────────────────
// Core Functions
// ────────────────────────────────────────────────────────────────

async function getUnlockedAchievements(): Promise<{ id: string; unlockedAt: string }[]> {
  try {
    const json = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    // Migration: handle old string[] format
    return parsed.map((item: any) => {
      if (typeof item === "string") {
        return { id: item, unlockedAt: new Date().toISOString() };
      }
      return item;
    });
  } catch (e) {
    console.error("Error reading achievements:", e);
    return [];
  }
}

async function saveUnlockedAchievements(data: { id: string; unlockedAt: string }[]) {
  try {
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving achievements:", e);
  }
}

/**
 * Call this after a session completes or significant progress is made
 * @returns newly unlocked achievements
 */
export async function checkAndUnlockAchievements(
  sessionKey: string,
  sessionDurationSeconds: number,
) {
  const progress = await getProgress();
  const unlocked = await getUnlockedAchievements();
  const unlockedIds = unlocked.map((u) => u.id);

  const now = new Date();
  const hour = now.getHours();
  const isEarlyMorning = hour < 7;
  const isLateNight = hour >= 22;
  const sessionCompleted = sessionDurationSeconds >= 60; // consider meaningful if >= 1 min

  const newlyUnlocked: Achievement[] = [];

  // Fetch all counts once
  const allCountsJson = await AsyncStorage.getItem(SESSION_COUNTS_KEY);
  const sessionCounts = allCountsJson ? JSON.parse(allCountsJson) : {};

  // Increment session-specific count only if meaningful
  if (sessionCompleted && sessionKey) {
    await incrementSessionCount(sessionKey);
    // update local counts for the check
    sessionCounts[sessionKey] = (sessionCounts[sessionKey] || 0) + 1;
  }

  for (const ach of achievements) {
    if (unlockedIds.includes(ach.id)) continue;

    const params = {
      totalMinutes: progress.totalMinutes,
      streak: progress.streak,
      sessionMinutes: sessionDurationSeconds / 60,
      sessionKey,
      sessionCompleted,
      isEarlyMorning,
      isLateNight,
      sessionCounts,
    };

    if (ach.condition(params)) {
      const unlockData = {
        id: ach.id,
        unlockedAt: now.toISOString(),
      };
      newlyUnlocked.push({
        ...ach,
        unlockedAt: unlockData.unlockedAt,
      });
      unlocked.push(unlockData);
    }
  }

  if (newlyUnlocked.length > 0) {
    await saveUnlockedAchievements(unlocked);
    console.log(
      "New achievements unlocked:",
      newlyUnlocked.map((a) => a.title),
    );
  }

  return newlyUnlocked;
}

// ────────────────────────────────────────────────────────────────
// Get stats for stats.tsx
// ────────────────────────────────────────────────────────────────

export async function getAchievementStats() {
  const unlocked = await getUnlockedAchievements();
  const total = achievements.length;

  return {
    unlocked: unlocked.length,
    total,
    percentage: total > 0 ? Math.round((unlocked.length / total) * 100) : 0,
  };
}

export async function getAchievements(): Promise<(Achievement & { unlocked: boolean })[]> {
  const unlocked = await getUnlockedAchievements();
  const progress = await getProgress();

  return achievements.map((a) => {
    const unlockInfo = unlocked.find((u) => u.id === a.id);
    const isUnlocked = !!unlockInfo;

    // Calculate progress based on category
    let currentProgress = 0;
    if (a.category === "time") {
      currentProgress = progress.totalMinutes;
    } else if (a.category === "streak") {
      currentProgress = progress.streak;
    } else if (a.category === "sessions") {
      // For sessions category, it depends on the specific achievement
      // If it's the first session, it's 1 if total sessions > 0
      if (a.id === "first_session") {
        currentProgress = progress.totalMinutes > 0 ? 1 : 0;
      }
    }

    return {
      ...a,
      unlocked: isUnlocked,
      unlockedAt: unlockInfo?.unlockedAt,
      progress: isUnlocked ? a.requirement : currentProgress,
    };
  });
}
