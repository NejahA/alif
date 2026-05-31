// Category definitions for meditation sessions

export type CategoryType =
  | "sleep"
  | "focus"
  | "anxiety"
  | "energy"
  | "gratitude"
  | "general";

export interface Category {
  id: CategoryType;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: [string, string];
}

export const CATEGORIES: Category[] = [
  {
    id: "sleep",
    name: "Sleep",
    description: "Wind down and prepare for restful sleep",
    icon: "🌙",
    color: "#6366F1",
    gradient: ["#6366F1", "#8B5CF6"],
  },
  {
    id: "focus",
    name: "Focus",
    description: "Enhance concentration and mental clarity",
    icon: "🎯",
    color: "#0EA5E9",
    gradient: ["#0EA5E9", "#06B6D4"],
  },
  {
    id: "anxiety",
    name: "Calm",
    description: "Reduce stress and anxiety",
    icon: "🌊",
    color: "#10B981",
    gradient: ["#10B981", "#14B8A6"],
  },
  {
    id: "energy",
    name: "Energy",
    description: "Boost vitality and motivation",
    icon: "⚡",
    color: "#F59E0B",
    gradient: ["#F59E0B", "#FBBF24"],
  },
  {
    id: "gratitude",
    name: "Gratitude",
    description: "Cultivate appreciation and positivity",
    icon: "💖",
    color: "#EC4899",
    gradient: ["#EC4899", "#F472B6"],
  },
  {
    id: "general",
    name: "General",
    description: "Balanced mindfulness practice",
    icon: "✨",
    color: "#8B5CF6",
    gradient: ["#8B5CF6", "#A78BFA"],
  },
];

export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "10 min"
  audioKey: string;
  category: CategoryType;
  difficulty?: "beginner" | "intermediate" | "advanced";
  isNew?: boolean;
  isPremium?: boolean;
}

// Example sessions organized by category
export const MEDITATION_SESSIONS: MeditationSession[] = [
  // SLEEP
  {
    id: "sleep_1",
    title: "Whispers Beneath the Moonlight",
    description:
      "Calm nocturnal soundscape with subtle lunar whispers and night serenity.",
    duration: "≈ 4 min",
    audioKey: "moonlight",
    category: "sleep",
    difficulty: "beginner",
  },
  // {
  //   id: "sleep_2",
  //   title: "Deep Sleep Journey",
  //   description:
  //     "Progressive relaxation to guide you into deep, restorative sleep.",
  //   duration: "≈ 9 min",
  //   audioKey: "deep_sleep",
  //   category: "sleep",
  //   difficulty: "beginner",
  //   isNew: true,
  // },

  // FOCUS
  {
    id: "focus_1",
    title: "Whispers of the Serene Forest",
    description:
      "Gentle forest ambiance with soft whispers of wind and distant birds.",
    duration: "≈ 4 min",
    audioKey: "sereneForest",
    category: "focus",
    difficulty: "beginner",
  },
  // {
  //   id: "focus_2",
  //   title: "Mountain Clarity",
  //   description: "Crystal-clear focus meditation with alpine soundscapes.",
  //   duration: "≈ 5 min",
  //   audioKey: "mountain",
  //   category: "focus",
  //   difficulty: "intermediate",
  // },

  // // CALM/ANXIETY
  // {
  //   id: "calm_1",
  //   title: "Ocean Waves of Peace",
  //   description: "Gentle ocean sounds to wash away stress and tension.",
  //   duration: "≈ 4 min",
  //   audioKey: "ocean",
  //   category: "anxiety",
  //   difficulty: "beginner",
  // },
  // {
  //   id: "calm_2",
  //   title: "Rainforest Serenity",
  //   description: "Soothing rain and jungle sounds for deep relaxation.",
  //   duration: "≈ 3 min",
  //   audioKey: "rainforest",
  //   category: "anxiety",
  //   difficulty: "beginner",
  // },

  // // ENERGY
  // {
  //   id: "energy_1",
  //   title: "Morning Sunrise",
  //   description: "Energizing meditation to start your day with vitality.",
  //   duration: "≈ 5 min",
  //   audioKey: "sunrise",
  //   category: "energy",
  //   difficulty: "beginner",
  // },

  // // GRATITUDE
  // {
  //   id: "gratitude_1",
  //   title: "Heart of Gratitude",
  //   description: "Cultivate appreciation and open your heart to abundance.",
  //   duration: "≈ 8 min",
  //   audioKey: "gratitude",
  //   category: "gratitude",
  //   difficulty: "beginner",
  // },
];

/**
 * Get sessions by category
 */
export function getSessionsByCategory(
  categoryId: CategoryType,
): MeditationSession[] {
  return MEDITATION_SESSIONS.filter(
    (session) => session.category === categoryId,
  );
}

/**
 * Get category by ID
 */
export function getCategoryById(
  categoryId: CategoryType,
): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === categoryId);
}

/**
 * Get all categories
 */
export function getAllCategories(): Category[] {
  return CATEGORIES;
}

/**
 * Get session by ID
 */
export function getSessionById(
  sessionId: string,
): MeditationSession | undefined {
  return MEDITATION_SESSIONS.filter((s) => !s.isPremium).find(
    (s) => s.id === sessionId,
  );
}

/**
 * Get all sessions (optionally filter out premium)
 */
export function getAllSessions(
  includePremium: boolean = false,
): MeditationSession[] {
  if (includePremium) {
    return MEDITATION_SESSIONS;
  }
  return MEDITATION_SESSIONS.filter((s) => !s.isPremium);
}

/**
 * Get new sessions
 */
export function getNewSessions(): MeditationSession[] {
  return MEDITATION_SESSIONS.filter((s) => s.isNew && !s.isPremium);
}

/**
 * Get beginner-friendly sessions
 */
export function getBeginnerSessions(): MeditationSession[] {
  return MEDITATION_SESSIONS.filter(
    (s) => s.difficulty === "beginner" && !s.isPremium,
  );
}

/**
 * Search sessions by query
 */
export function searchSessions(query: string): MeditationSession[] {
  const lowerQuery = query.toLowerCase();
  return MEDITATION_SESSIONS.filter(
    (session) =>
      session.title.toLowerCase().includes(lowerQuery) ||
      session.description.toLowerCase().includes(lowerQuery) ||
      session.category.toLowerCase().includes(lowerQuery),
  );
}
