import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

interface ExportData {
  version: string;
  exportedAt: string;
  data: {
    progress: any;
    sessionProgress: any[];
    achievements: any[];
    moodEntries: any[];
    favorites: any[];
    recentSessions: any[];
    settings: any;
    collections: any[];
    goals: any[];
  };
}

const STORAGE_KEYS = {
  streak: '@meditation_streak',
  lastDate: '@last_meditation_date',
  totalMinutes: '@total_minutes',
  sessionProgressPrefix: '@session_progress_',
  achievements: '@meditation_achievements',
  moodEntries: '@mood_entries',
  favorites: '@favorite_sessions',
  recent: '@recent_sessions',
  settings: '@meditation_settings',
  collections: '@meditation_collections',
  goals: '@user_goals',
  theme: '@theme_preference',
};

/**
 * Export all user data to a JSON file
 */
export async function exportAllData(): Promise<string | null> {
  try {
    console.log('[Export] Starting data export...');

    // Gather all data
    const [
      streak,
      lastDate,
      totalMinutes,
      achievements,
      moodEntries,
      favorites,
      recent,
      settings,
      collections,
      goals,
      theme,
    ] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.streak),
      AsyncStorage.getItem(STORAGE_KEYS.lastDate),
      AsyncStorage.getItem(STORAGE_KEYS.totalMinutes),
      AsyncStorage.getItem(STORAGE_KEYS.achievements),
      AsyncStorage.getItem(STORAGE_KEYS.moodEntries),
      AsyncStorage.getItem(STORAGE_KEYS.favorites),
      AsyncStorage.getItem(STORAGE_KEYS.recent),
      AsyncStorage.getItem(STORAGE_KEYS.settings),
      AsyncStorage.getItem(STORAGE_KEYS.collections),
      AsyncStorage.getItem(STORAGE_KEYS.goals),
      AsyncStorage.getItem(STORAGE_KEYS.theme),
    ]);

    // Get all session progress entries
    const allKeys = await AsyncStorage.getAllKeys();
    const sessionKeys = allKeys.filter(k => k.startsWith(STORAGE_KEYS.sessionProgressPrefix));
    const sessionProgressEntries = await AsyncStorage.multiGet(sessionKeys);
    const sessionProgress = sessionProgressEntries.map(([key, value]) => ({
      key,
      value: value ? JSON.parse(value) : null,
    }));

    // Build export object
    const exportData: ExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        progress: {
          streak: streak ? parseInt(streak) : 0,
          lastDate,
          totalMinutes: totalMinutes ? parseInt(totalMinutes) : 0,
        },
        sessionProgress,
        achievements: achievements ? JSON.parse(achievements) : [],
        moodEntries: moodEntries ? JSON.parse(moodEntries) : [],
        favorites: favorites ? JSON.parse(favorites) : [],
        recentSessions: recent ? JSON.parse(recent) : [],
        settings: settings ? JSON.parse(settings) : {},
        collections: collections ? JSON.parse(collections) : [],
        goals: goals ? JSON.parse(goals) : [],
      },
    };

    // Save to file
    const fileName = `meditation_backup_${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(
      fileUri,
      JSON.stringify(exportData, null, 2),
      { encoding: FileSystem.EncodingType.UTF8 }
    );

    console.log('[Export] Data exported to:', fileUri);

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Meditation Data',
      });
    }

    return fileUri;
  } catch (error) {
    console.error('[Export] Error exporting data:', error);
    return null;
  }
}

/**
 * Import data from a backup file
 */
export async function importData(): Promise<boolean> {
  try {
    console.log('[Import] Starting data import...');

    // Pick file
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      console.log('[Import] User cancelled');
      return false;
    }

    // Read file
    const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const importData: ExportData = JSON.parse(fileContent);

    // Validate version
    if (importData.version !== '1.0.0') {
      console.error('[Import] Unsupported version:', importData.version);
      return false;
    }

    console.log('[Import] Restoring data from:', importData.exportedAt);

    // Restore progress
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.streak, importData.data.progress.streak.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.lastDate, importData.data.progress.lastDate || ''),
      AsyncStorage.setItem(STORAGE_KEYS.totalMinutes, importData.data.progress.totalMinutes.toString()),
    ]);

    // Restore session progress
    for (const session of importData.data.sessionProgress) {
      await AsyncStorage.setItem(session.key, JSON.stringify(session.value));
    }

    // Restore other data
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(importData.data.achievements)),
      AsyncStorage.setItem(STORAGE_KEYS.moodEntries, JSON.stringify(importData.data.moodEntries)),
      AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(importData.data.favorites)),
      AsyncStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(importData.data.recentSessions)),
      AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(importData.data.settings)),
      AsyncStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(importData.data.collections)),
      AsyncStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(importData.data.goals)),
    ]);

    console.log('[Import] Data restored successfully');
    return true;
  } catch (error) {
    console.error('[Import] Error importing data:', error);
    return false;
  }
}

/**
 * Get summary of what's in the current data
 */
export async function getDataSummary(): Promise<{
  totalSessions: number;
  totalMinutes: number;
  achievementsUnlocked: number;
  moodEntries: number;
  favorites: number;
  hasData: boolean;
}> {
  try {
    const [
      totalMinutes,
      achievements,
      moodEntries,
      favorites,
    ] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.totalMinutes),
      AsyncStorage.getItem(STORAGE_KEYS.achievements),
      AsyncStorage.getItem(STORAGE_KEYS.moodEntries),
      AsyncStorage.getItem(STORAGE_KEYS.favorites),
    ]);

    const allKeys = await AsyncStorage.getAllKeys();
    const sessionKeys = allKeys.filter(k => k.startsWith(STORAGE_KEYS.sessionProgressPrefix));

    const achievementsList = achievements ? JSON.parse(achievements) : [];
    const moodList = moodEntries ? JSON.parse(moodEntries) : [];
    const favList = favorites ? JSON.parse(favorites) : [];

    return {
      totalSessions: sessionKeys.length,
      totalMinutes: totalMinutes ? parseInt(totalMinutes) : 0,
      achievementsUnlocked: achievementsList.filter((a: any) => a.unlocked).length,
      moodEntries: moodList.length,
      favorites: favList.length,
      hasData: sessionKeys.length > 0 || parseInt(totalMinutes || '0') > 0,
    };
  } catch (error) {
    console.error('[Export] Error getting summary:', error);
    return {
      totalSessions: 0,
      totalMinutes: 0,
      achievementsUnlocked: 0,
      moodEntries: 0,
      favorites: 0,
      hasData: false,
    };
  }
}

/**
 * Clear all app data (use with caution!)
 */
export async function clearAllData(): Promise<void> {
  try {
    console.log('[Export] Clearing all data...');
    await AsyncStorage.clear();
    console.log('[Export] All data cleared');
  } catch (error) {
    console.error('[Export] Error clearing data:', error);
  }
}

/**
 * Usage Example:
 * 
 * // Export data
 * const fileUri = await exportAllData();
 * if (fileUri) {
 *   Alert.alert('Success', 'Data exported successfully!');
 * }
 * 
 * // Import data
 * const success = await importData();
 * if (success) {
 *   Alert.alert('Success', 'Data imported successfully!');
 *   // Reload app state
 * }
 * 
 * // Get summary
 * const summary = await getDataSummary();
 * console.log(`You have ${summary.totalSessions} sessions`);
 */
