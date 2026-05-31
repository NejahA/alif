import AsyncStorage from "@react-native-async-storage/async-storage";

const STREAK_KEY = "@meditation_streak";
const LAST_DATE_KEY = "@last_meditation_date";
const TOTAL_MINUTES_KEY = "@total_minutes";
const TOTAL_SESSIONS_KEY = "@total_sessions";
const SESSION_PROGRESS_PREFIX = "@session_progress_";

interface ProgressData {
  streak: number;
  lastDate: string | null;
  totalMinutes: number;
  totalSessions: number;
}

interface SessionProgress {
  sessionKey: string;
  position: number; // in seconds
  duration: number; // in seconds
  lastPlayed: string; // ISO date string
}

export async function getProgress(): Promise<ProgressData> {
  try {
    const [streakStr, lastDate, totalStr, sessionsStr] = await Promise.all([
      AsyncStorage.getItem(STREAK_KEY),
      AsyncStorage.getItem(LAST_DATE_KEY),
      AsyncStorage.getItem(TOTAL_MINUTES_KEY),
      AsyncStorage.getItem(TOTAL_SESSIONS_KEY),
    ]);

    return {
      streak: streakStr ? parseInt(streakStr, 10) : 0,
      lastDate,
      totalMinutes: totalStr ? parseInt(totalStr, 10) : 0,
      totalSessions: sessionsStr ? parseInt(sessionsStr, 10) : 0,
    };
  } catch (error) {
    console.error("Error reading progress:", error);
    return { streak: 0, lastDate: null, totalMinutes: 0, totalSessions: 0 };
  }
}

/**
 * Get progress for a specific session
 */
export async function getSessionProgress(
  sessionKey: string,
): Promise<SessionProgress | null> {
  try {
    const key = `${SESSION_PROGRESS_PREFIX}${sessionKey}`;
    const data = await AsyncStorage.getItem(key);

    if (!data) return null;

    return JSON.parse(data) as SessionProgress;
  } catch (error) {
    console.error(`Error reading session progress for ${sessionKey}:`, error);
    return null;
  }
}

/**
 * Update progress for a specific session
 * @param sessionKey - The unique key for the meditation session
 * @param positionSeconds - Current position in the audio (seconds)
 * @param durationSeconds - Total duration of the audio (seconds)
 */
export async function updateSessionProgress(
  sessionKey: string,
  positionSeconds: number,
  durationSeconds: number,
): Promise<void> {
  try {
    const sessionProgress: SessionProgress = {
      sessionKey,
      position: positionSeconds,
      duration: durationSeconds,
      lastPlayed: new Date().toISOString(),
    };

    const key = `${SESSION_PROGRESS_PREFIX}${sessionKey}`;
    await AsyncStorage.setItem(key, JSON.stringify(sessionProgress));

    console.log(
      `[Session Progress] Saved ${sessionKey}: ${Math.floor(positionSeconds)}s / ${Math.floor(durationSeconds)}s`,
    );
  } catch (error) {
    console.error(`Error saving session progress for ${sessionKey}:`, error);
  }
}

/**
 * Update overall meditation progress (streak and total minutes)
 * Call this when a session is completed or when saving progress
 */
export async function updateProgress(
  sessionKey: string,
  positionSeconds: number,
  durationSeconds: number,
) {
  try {
    // Save session-specific progress first
    await updateSessionProgress(sessionKey, positionSeconds, durationSeconds);

    // Update overall stats
    const today = new Date().toISOString().split("T")[0];
    const { streak, lastDate, totalMinutes, totalSessions } = await getProgress();

    let newStreak = streak;

    if (lastDate === today) {
      // same day → no streak change
    } else if (lastDate) {
      const last = new Date(lastDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        last.toISOString().split("T")[0] ===
        yesterday.toISOString().split("T")[0]
      ) {
        newStreak = streak + 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const minutesListened = Math.floor(positionSeconds / 60);
    const newTotal = totalMinutes + minutesListened;

    // Only increment total sessions if this is a completion or significant milestone
    // and we haven't already counted it recently or if it's explicitly finished.
    // For now, let's increment if it's a completion (pos == duration)
    let newSessions = totalSessions;
    if (positionSeconds >= durationSeconds && durationSeconds > 0) {
      newSessions = totalSessions + 1;
    }

    await Promise.all([
      AsyncStorage.setItem(STREAK_KEY, newStreak.toString()),
      AsyncStorage.setItem(LAST_DATE_KEY, today),
      AsyncStorage.setItem(TOTAL_MINUTES_KEY, newTotal.toString()),
      AsyncStorage.setItem(TOTAL_SESSIONS_KEY, newSessions.toString()),
    ]);

    console.log(
      `[Overall Progress] Streak: ${newStreak}, Total: ${newTotal} mins (+${minutesListened} mins), Sessions: ${newSessions}`,
    );

    return { streak: newStreak, totalMinutes: newTotal, totalSessions: newSessions };
  } catch (error) {
    console.error("Error updating progress:", error);
  }
}

/**
 * Clear progress for a specific session (useful for reset)
 */
export async function clearSessionProgress(sessionKey: string): Promise<void> {
  try {
    const key = `${SESSION_PROGRESS_PREFIX}${sessionKey}`;
    await AsyncStorage.removeItem(key);
    console.log(`[Session Progress] Cleared ${sessionKey}`);
  } catch (error) {
    console.error(`Error clearing session progress for ${sessionKey}:`, error);
  }
}

/**
 * Get all session progress data
 */
export async function getAllSessionProgress(): Promise<SessionProgress[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const sessionKeys = keys.filter((key) =>
      key.startsWith(SESSION_PROGRESS_PREFIX),
    );

    const sessions = await AsyncStorage.multiGet(sessionKeys);
    return sessions
      .map(([_, value]) => (value ? JSON.parse(value) : null))
      .filter(Boolean) as SessionProgress[];
  } catch (error) {
    console.error("Error getting all session progress:", error);
    return [];
  }
}
