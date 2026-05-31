import AsyncStorage from '@react-native-async-storage/async-storage';

const JOURNAL_KEY = '@meditation_journal';

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  prompt?: string;
  content: string;
  mood?: number; // 1-5
  tags?: string[];
  sessionKey?: string; // Optional link to meditation session
  duration?: number; // Duration of session if linked
}

export const JOURNAL_PROMPTS = [
  'What am I grateful for today?',
  'How do I feel right now?',
  'What did I notice during my meditation?',
  'What challenges did I face today?',
  'What intention do I set for tomorrow?',
  'What made me smile today?',
  'What lesson did I learn recently?',
  'How has meditation changed me?',
  'What does peace mean to me?',
  'What am I letting go of?',
  'What brings me joy?',
  'How can I be kinder to myself?',
  'What am I proud of this week?',
  'What does my ideal day look like?',
  'What do I need right now?',
];

/**
 * Create a new journal entry
 */
export async function createJournalEntry(
  content: string,
  prompt?: string,
  mood?: number,
  tags?: string[],
  sessionKey?: string,
  duration?: number
): Promise<JournalEntry> {
  try {
    const entry: JournalEntry = {
      id: `journal_${Date.now()}`,
      date: new Date().toISOString(),
      content,
      prompt,
      mood,
      tags,
      sessionKey,
      duration,
    };

    const entries = await getAllEntries();
    entries.unshift(entry);

    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
    console.log('[Journal] Entry created');
    return entry;
  } catch (error) {
    console.error('[Journal] Error creating entry:', error);
    throw error;
  }
}

/**
 * Get all journal entries
 */
export async function getAllEntries(): Promise<JournalEntry[]> {
  try {
    const data = await AsyncStorage.getItem(JOURNAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[Journal] Error getting entries:', error);
    return [];
  }
}

/**
 * Get a specific entry by ID
 */
export async function getEntryById(id: string): Promise<JournalEntry | null> {
  try {
    const entries = await getAllEntries();
    return entries.find(e => e.id === id) || null;
  } catch (error) {
    console.error('[Journal] Error getting entry:', error);
    return null;
  }
}

/**
 * Update an existing entry
 */
export async function updateEntry(
  id: string,
  updates: Partial<JournalEntry>
): Promise<void> {
  try {
    const entries = await getAllEntries();
    const index = entries.findIndex(e => e.id === id);

    if (index !== -1) {
      entries[index] = { ...entries[index], ...updates };
      await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
      console.log('[Journal] Entry updated');
    }
  } catch (error) {
    console.error('[Journal] Error updating entry:', error);
  }
}

/**
 * Delete an entry
 */
export async function deleteEntry(id: string): Promise<void> {
  try {
    const entries = await getAllEntries();
    const filtered = entries.filter(e => e.id !== id);
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(filtered));
    console.log('[Journal] Entry deleted');
  } catch (error) {
    console.error('[Journal] Error deleting entry:', error);
  }
}

/**
 * Get entries for a specific date
 */
export async function getEntriesByDate(date: Date): Promise<JournalEntry[]> {
  try {
    const entries = await getAllEntries();
    const targetDate = date.toISOString().split('T')[0];
    
    return entries.filter(e => {
      const entryDate = new Date(e.date).toISOString().split('T')[0];
      return entryDate === targetDate;
    });
  } catch (error) {
    console.error('[Journal] Error getting entries by date:', error);
    return [];
  }
}

/**
 * Get entries from the last N days
 */
export async function getRecentEntries(days: number = 7): Promise<JournalEntry[]> {
  try {
    const entries = await getAllEntries();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return entries.filter(e => new Date(e.date) >= cutoff);
  } catch (error) {
    console.error('[Journal] Error getting recent entries:', error);
    return [];
  }
}

/**
 * Search entries by content
 */
export async function searchEntries(query: string): Promise<JournalEntry[]> {
  try {
    const entries = await getAllEntries();
    const lowerQuery = query.toLowerCase();

    return entries.filter(e =>
      e.content.toLowerCase().includes(lowerQuery) ||
      e.prompt?.toLowerCase().includes(lowerQuery) ||
      e.tags?.some(t => t.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error('[Journal] Error searching entries:', error);
    return [];
  }
}

/**
 * Get entries by tag
 */
export async function getEntriesByTag(tag: string): Promise<JournalEntry[]> {
  try {
    const entries = await getAllEntries();
    return entries.filter(e => e.tags?.includes(tag));
  } catch (error) {
    console.error('[Journal] Error getting entries by tag:', error);
    return [];
  }
}

/**
 * Get all unique tags
 */
export async function getAllTags(): Promise<string[]> {
  try {
    const entries = await getAllEntries();
    const tagSet = new Set<string>();

    entries.forEach(e => {
      e.tags?.forEach(tag => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  } catch (error) {
    console.error('[Journal] Error getting tags:', error);
    return [];
  }
}

/**
 * Get a random prompt
 */
export function getRandomPrompt(): string {
  return JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
}

/**
 * Get daily prompt (same prompt for the whole day)
 */
export function getDailyPrompt(): string {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  return JOURNAL_PROMPTS[seed % JOURNAL_PROMPTS.length];
}

/**
 * Get journal statistics
 */
export async function getJournalStats(): Promise<{
  totalEntries: number;
  entriesThisWeek: number;
  entriesThisMonth: number;
  averageMood: number;
  mostUsedTags: string[];
  longestStreak: number;
}> {
  try {
    const entries = await getAllEntries();
    const now = new Date();

    // This week
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = entries.filter(e => new Date(e.date) >= weekAgo).length;

    // This month
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const thisMonth = entries.filter(e => new Date(e.date) >= monthAgo).length;

    // Average mood
    const moodEntries = entries.filter(e => e.mood);
    const avgMood = moodEntries.length > 0
      ? moodEntries.reduce((sum, e) => sum + (e.mood || 0), 0) / moodEntries.length
      : 0;

    // Most used tags
    const tagCounts: Record<string, number> = {};
    entries.forEach(e => {
      e.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const mostUsedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    // Longest streak (simplified - just consecutive days)
    let longestStreak = 0;
    let currentStreak = 0;
    const sortedDates = entries
      .map(e => new Date(e.date).toISOString().split('T')[0])
      .filter((v, i, a) => a.indexOf(v) === i) // unique dates
      .sort()
      .reverse();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
          currentStreak = 1;
        }
      }
    }
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    return {
      totalEntries: entries.length,
      entriesThisWeek: thisWeek,
      entriesThisMonth: thisMonth,
      averageMood: avgMood,
      mostUsedTags,
      longestStreak,
    };
  } catch (error) {
    console.error('[Journal] Error getting stats:', error);
    return {
      totalEntries: 0,
      entriesThisWeek: 0,
      entriesThisMonth: 0,
      averageMood: 0,
      mostUsedTags: [],
      longestStreak: 0,
    };
  }
}

/**
 * Export all entries as text
 */
export async function exportAsText(): Promise<string> {
  try {
    const entries = await getAllEntries();
    
    let text = '=== MEDITATION JOURNAL ===\n\n';
    
    entries.forEach(entry => {
      const date = new Date(entry.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      text += `${date}\n`;
      if (entry.prompt) {
        text += `Prompt: ${entry.prompt}\n`;
      }
      if (entry.mood) {
        text += `Mood: ${'⭐'.repeat(entry.mood)}\n`;
      }
      if (entry.tags && entry.tags.length > 0) {
        text += `Tags: ${entry.tags.join(', ')}\n`;
      }
      text += `\n${entry.content}\n`;
      text += '\n' + '─'.repeat(50) + '\n\n';
    });

    return text;
  } catch (error) {
    console.error('[Journal] Error exporting:', error);
    return '';
  }
}
