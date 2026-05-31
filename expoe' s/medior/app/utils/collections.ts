import AsyncStorage from "@react-native-async-storage/async-storage";
import { MEDITATION_SESSIONS, MeditationSession } from "./categories ";

const COLLECTIONS_KEY = "@meditation_collections";
const USER_PROGRESS_KEY = "@collection_progress";

export interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sessionKeys: string[]; // Array of audioKeys in order
  isPremium?: boolean;
  createdAt: string;
  isUserCreated?: boolean;
}

export interface CollectionProgress {
  collectionId: string;
  completedSessions: string[]; // Array of completed audioKeys
  currentIndex: number; // Index of next session to play
  lastAccessed: string;
}

// ═══════════════════════════════════════════════════════════
// BUILT-IN COLLECTIONS
// ═══════════════════════════════════════════════════════════

export const BUILT_IN_COLLECTIONS: Collection[] = [
  {
    id: "beginner_week",
    name: "7 Days to Calm",
    description: "A week-long journey for meditation beginners",
    icon: "🌱",
    color: "#10B981",
    sessionKeys: ["sereneForest", "moonlight"], // Would add 5 more
    createdAt: new Date().toISOString(),
  },
  {
    id: "sleep_mastery",
    name: "Sleep Mastery",
    description: "Master the art of falling asleep peacefully",
    icon: "🌙",
    color: "#6366F1",
    sessionKeys: ["moonlight"], // Would add more sleep sessions
    createdAt: new Date().toISOString(),
  },
  {
    id: "focus_boost",
    name: "Focus Boost",
    description: "Sharpen your concentration over 5 days",
    icon: "🎯",
    color: "#0EA5E9",
    sessionKeys: ["sereneForest"], // Would add more focus sessions
    createdAt: new Date().toISOString(),
  },
];

/**
 * Get all collections (built-in + user-created)
 */
export async function getAllCollections(): Promise<Collection[]> {
  try {
    const data = await AsyncStorage.getItem(COLLECTIONS_KEY);
    const userCollections: Collection[] = data ? JSON.parse(data) : [];
    return [...BUILT_IN_COLLECTIONS, ...userCollections];
  } catch (error) {
    console.error("Error getting collections:", error);
    return BUILT_IN_COLLECTIONS;
  }
}

/**
 * Get a specific collection by ID
 */
export async function getCollectionById(
  id: string,
): Promise<Collection | null> {
  const all = await getAllCollections();
  return all.find((c) => c.id === id) || null;
}

/**
 * Create a new user collection
 */
export async function createCollection(
  name: string,
  description: string,
  sessionKeys: string[],
  icon: string = "📚",
  color: string = "#8B5CF6",
): Promise<Collection> {
  try {
    const newCollection: Collection = {
      id: `user_${Date.now()}`,
      name,
      description,
      icon,
      color,
      sessionKeys,
      createdAt: new Date().toISOString(),
      isUserCreated: true,
    };

    const data = await AsyncStorage.getItem(COLLECTIONS_KEY);
    const existing: Collection[] = data ? JSON.parse(data) : [];
    existing.push(newCollection);

    await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(existing));
    console.log(`[Collections] Created: ${name}`);
    return newCollection;
  } catch (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
}

/**
 * Delete a user-created collection
 */
export async function deleteCollection(id: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(COLLECTIONS_KEY);
    if (!data) return;

    const collections: Collection[] = JSON.parse(data);
    const filtered = collections.filter((c) => c.id !== id);

    await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(filtered));
    console.log(`[Collections] Deleted: ${id}`);
  } catch (error) {
    console.error("Error deleting collection:", error);
  }
}

/**
 * Update a collection
 */
export async function updateCollection(
  id: string,
  updates: Partial<Collection>,
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(COLLECTIONS_KEY);
    if (!data) return;

    const collections: Collection[] = JSON.parse(data);
    const index = collections.findIndex((c) => c.id === id);

    if (index !== -1) {
      collections[index] = { ...collections[index], ...updates };
      await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
      console.log(`[Collections] Updated: ${id}`);
    }
  } catch (error) {
    console.error("Error updating collection:", error);
  }
}

// ═══════════════════════════════════════════════════════════
// PROGRESS TRACKING
// ═══════════════════════════════════════════════════════════

/**
 * Get progress for a specific collection
 */
export async function getCollectionProgress(
  collectionId: string,
): Promise<CollectionProgress | null> {
  try {
    const data = await AsyncStorage.getItem(
      `${USER_PROGRESS_KEY}_${collectionId}`,
    );
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error("Error getting collection progress:", error);
    return null;
  }
}

/**
 * Mark a session as completed in a collection
 */
export async function markSessionCompleted(
  collectionId: string,
  sessionKey: string,
): Promise<void> {
  try {
    let progress = await getCollectionProgress(collectionId);

    if (!progress) {
      progress = {
        collectionId,
        completedSessions: [],
        currentIndex: 0,
        lastAccessed: new Date().toISOString(),
      };
    }

    if (!progress.completedSessions.includes(sessionKey)) {
      progress.completedSessions.push(sessionKey);
    }

    // Advance to next uncompleted session
    const collection = await getCollectionById(collectionId);
    if (collection) {
      const nextIndex = collection.sessionKeys.findIndex(
        (key) => !progress!.completedSessions.includes(key),
      );
      progress.currentIndex =
        nextIndex !== -1 ? nextIndex : collection.sessionKeys.length;
    }

    progress.lastAccessed = new Date().toISOString();

    await AsyncStorage.setItem(
      `${USER_PROGRESS_KEY}_${collectionId}`,
      JSON.stringify(progress),
    );
    console.log(
      `[Collections] Marked completed: ${sessionKey} in ${collectionId}`,
    );
  } catch (error) {
    console.error("Error marking session completed:", error);
  }
}

/**
 * Get next session to play in a collection
 */
export async function getNextSession(
  collectionId: string,
): Promise<MeditationSession | null> {
  try {
    const collection = await getCollectionById(collectionId);
    if (!collection) return null;

    const progress = await getCollectionProgress(collectionId);
    const currentIndex = progress?.currentIndex || 0;

    if (currentIndex >= collection.sessionKeys.length) {
      return null; // Collection completed
    }

    const nextKey = collection.sessionKeys[currentIndex];
    return MEDITATION_SESSIONS.find((s) => s.audioKey === nextKey) || null;
  } catch (error) {
    console.error("Error getting next session:", error);
    return null;
  }
}

/**
 * Get completion percentage for a collection
 */
export async function getCompletionPercentage(
  collectionId: string,
): Promise<number> {
  try {
    const collection = await getCollectionById(collectionId);
    if (!collection || collection.sessionKeys.length === 0) return 0;

    const progress = await getCollectionProgress(collectionId);
    if (!progress) return 0;

    return (
      (progress.completedSessions.length / collection.sessionKeys.length) * 100
    );
  } catch (error) {
    console.error("Error calculating completion:", error);
    return 0;
  }
}

/**
 * Reset progress for a collection
 */
export async function resetCollectionProgress(
  collectionId: string,
): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${USER_PROGRESS_KEY}_${collectionId}`);
    console.log(`[Collections] Reset progress: ${collectionId}`);
  } catch (error) {
    console.error("Error resetting progress:", error);
  }
}

/**
 * Get all in-progress collections
 */
export async function getInProgressCollections(): Promise<Collection[]> {
  try {
    const all = await getAllCollections();
    const inProgress: Collection[] = [];

    for (const collection of all) {
      const progress = await getCollectionProgress(collection.id);
      if (
        progress &&
        progress.completedSessions.length > 0 &&
        progress.completedSessions.length < collection.sessionKeys.length
      ) {
        inProgress.push(collection);
      }
    }

    return inProgress.sort((a, b) => {
      const aProgress = getCollectionProgress(a.id);
      const bProgress = getCollectionProgress(b.id);
      return 0; // Would sort by lastAccessed
    });
  } catch (error) {
    console.error("Error getting in-progress collections:", error);
    return [];
  }
}
