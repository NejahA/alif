import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@favorite_sessions";
const RECENT_KEY = "@recent_sessions";

export interface FavoriteSession {
  audioKey: string;
  title: string;
  addedAt: string; // ISO date string
}

export interface RecentSession {
  audioKey: string;
  title: string;
  description: string;
  lastPlayedAt: string; // ISO date string
}

/**
 * Get all favorite sessions
 */
export async function getFavorites(): Promise<FavoriteSession[]> {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
}

/**
 * Check if a session is favorited
 */
export async function isFavorite(audioKey: string): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    return favorites.some((f) => f.audioKey === audioKey);
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
}

/**
 * Add a session to favorites
 */
export async function addFavorite(
  audioKey: string,
  title: string,
): Promise<void> {
  try {
    const favorites = await getFavorites();

    // Check if already favorited
    if (favorites.some((f) => f.audioKey === audioKey)) {
      return;
    }

    const newFavorite: FavoriteSession = {
      audioKey,
      title,
      addedAt: new Date().toISOString(),
    };

    const updated = [newFavorite, ...favorites];
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    console.log(`[Favorites] Added: ${title}`);
  } catch (error) {
    console.error("Error adding favorite:", error);
  }
}

/**
 * Remove a session from favorites
 */
export async function removeFavorite(audioKey: string): Promise<void> {
  try {
    const favorites = await getFavorites();
    const updated = favorites.filter((f) => f.audioKey !== audioKey);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    console.log(`[Favorites] Removed: ${audioKey}`);
  } catch (error) {
    console.error("Error removing favorite:", error);
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(
  audioKey: string,
  title: string,
): Promise<boolean> {
  try {
    const isCurrentlyFavorite = await isFavorite(audioKey);

    if (isCurrentlyFavorite) {
      await removeFavorite(audioKey);
      return false;
    } else {
      await addFavorite(audioKey, title);
      return true;
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return false;
  }
}

/**
 * Clear all favorites
 */
export async function clearFavorites(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
    console.log("[Favorites] All cleared");
  } catch (error) {
    console.error("Error clearing favorites:", error);
  }
}

// ═══════════════════════════════════════════════════════════
// RECENTLY PLAYED
// ═══════════════════════════════════════════════════════════

/**
 * Get recently played sessions
 */
export async function getRecentSessions(
  limit: number = 5,
): Promise<RecentSession[]> {
  try {
    const data = await AsyncStorage.getItem(RECENT_KEY);
    if (!data) return [];

    const sessions: RecentSession[] = JSON.parse(data);
    return sessions.slice(0, limit);
  } catch (error) {
    console.error("Error getting recent sessions:", error);
    return [];
  }
}

/**
 * Add a session to recent history
 */
export async function addToRecent(
  audioKey: string,
  title: string,
  description: string,
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(RECENT_KEY);
    let sessions: RecentSession[] = data ? JSON.parse(data) : [];

    // Remove if already exists (we'll re-add at top)
    sessions = sessions.filter((s) => s.audioKey !== audioKey);

    // Add to beginning
    const newSession: RecentSession = {
      audioKey,
      title,
      description,
      lastPlayedAt: new Date().toISOString(),
    };

    sessions.unshift(newSession);

    // Keep only last 20
    sessions = sessions.slice(0, 20);

    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(sessions));
    console.log(`[Recent] Added: ${title}`);
  } catch (error) {
    console.error("Error adding to recent:", error);
  }
}

/**
 * Clear recent history
 */
export async function clearRecent(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENT_KEY);
    console.log("[Recent] History cleared");
  } catch (error) {
    console.error("Error clearing recent:", error);
  }
}

/**
 * Get favorite count
 */
export async function getFavoriteCount(): Promise<number> {
  try {
    const favorites = await getFavorites();
    return favorites.length;
  } catch (error) {
    return 0;
  }
}
