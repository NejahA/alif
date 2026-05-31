/**
 * Database service for managing SQLite database
 * Requirements: 8.1
 */

import * as SQLite from 'expo-sqlite';
import { Category, Question, QuestionRow, SessionStateRow } from '../models';

const DATABASE_NAME = 'conveys.db';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  /**
   * Initialize database connection and create tables
   * Requirements: 8.1
   */
  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create database tables if they don't exist
   * Requirements: 8.1
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Create questions table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT,
        created_at INTEGER NOT NULL,
        CONSTRAINT category_check CHECK (category IN ('fun_and_light', 'philosophical', 'about_your_past'))
      );
    `);

    // Create index on category for faster queries
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
    `);

    // Create session_state table for persistence
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS session_state (
        category TEXT PRIMARY KEY,
        current_index INTEGER DEFAULT 0,
        shuffle_seed INTEGER,
        viewed_questions TEXT,
        last_updated INTEGER
      );
    `);

    console.log('Database tables created successfully');
  }

  /**
   * Insert a question into the database
   * Requirements: 6.1, 6.4
   */
  async insertQuestion(question: Question): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const row: QuestionRow = {
      id: question.id,
      text: question.text,
      category: question.category,
      tags: JSON.stringify(question.tags),
      created_at: question.createdAt.getTime(),
    };

    await this.db.runAsync(
      'INSERT OR REPLACE INTO questions (id, text, category, tags, created_at) VALUES (?, ?, ?, ?, ?)',
      [row.id, row.text, row.category, row.tags, row.created_at]
    );
  }

  /**
   * Insert multiple questions in a transaction
   * Requirements: 6.1, 6.4
   */
  async insertQuestions(questions: Question[]): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.withTransactionAsync(async () => {
      for (const question of questions) {
        const row: QuestionRow = {
          id: question.id,
          text: question.text,
          category: question.category,
          tags: JSON.stringify(question.tags),
          created_at: question.createdAt.getTime(),
        };

        await this.db!.runAsync(
          'INSERT OR REPLACE INTO questions (id, text, category, tags, created_at) VALUES (?, ?, ?, ?, ?)',
          [row.id, row.text, row.category, row.tags, row.created_at]
        );
      }
    });
  }

  /**
   * Get all questions for a specific category
   * Requirements: 2.2, 6.4
   */
  async getQuestionsByCategory(category: Category): Promise<Question[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const results = await this.db.getAllAsync<QuestionRow>(
      'SELECT * FROM questions WHERE category = ? ORDER BY created_at',
      [category]
    );

    return results.map(row => ({
      id: row.id,
      text: row.text,
      category: row.category as Category,
      tags: JSON.parse(row.tags || '[]'),
      createdAt: new Date(row.created_at),
    }));
  }

  /**
   * Get all questions from the database
   * Requirements: 6.1, 6.4
   */
  async getAllQuestions(): Promise<Question[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const results = await this.db.getAllAsync<QuestionRow>(
      'SELECT * FROM questions ORDER BY category, created_at'
    );

    return results.map(row => ({
      id: row.id,
      text: row.text,
      category: row.category as Category,
      tags: JSON.parse(row.tags || '[]'),
      createdAt: new Date(row.created_at),
    }));
  }

  /**
   * Get question count for a specific category
   * Requirements: 6.4
   */
  async getQuestionCount(category: Category): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM questions WHERE category = ?',
      [category]
    );

    return result?.count || 0;
  }

  /**
   * Check if database has been seeded with questions
   * Requirements: 6.4
   */
  async isSeeded(): Promise<boolean> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM questions'
    );

    return (result?.count || 0) > 0;
  }

  /**
   * Save session state for a category
   * Requirements: 1.4
   */
  async saveSessionState(
    category: Category,
    currentIndex: number,
    shuffleSeed: number,
    viewedQuestions: string[]
  ): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const row: SessionStateRow = {
      category,
      current_index: currentIndex,
      shuffle_seed: shuffleSeed,
      viewed_questions: JSON.stringify(viewedQuestions),
      last_updated: Date.now(),
    };

    await this.db.runAsync(
      'INSERT OR REPLACE INTO session_state (category, current_index, shuffle_seed, viewed_questions, last_updated) VALUES (?, ?, ?, ?, ?)',
      [
        row.category,
        row.current_index,
        row.shuffle_seed,
        row.viewed_questions,
        row.last_updated,
      ]
    );
  }

  /**
   * Load session state for a category
   * Requirements: 1.4
   */
  async loadSessionState(category: Category): Promise<{
    currentIndex: number;
    shuffleSeed: number;
    viewedQuestions: string[];
  } | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const result = await this.db.getFirstAsync<SessionStateRow>(
      'SELECT * FROM session_state WHERE category = ?',
      [category]
    );

    if (!result) {
      return null;
    }

    return {
      currentIndex: result.current_index,
      shuffleSeed: result.shuffle_seed,
      viewedQuestions: JSON.parse(result.viewed_questions || '[]'),
    };
  }

  /**
   * Clear all session state (for testing or reset)
   */
  async clearSessionState(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.runAsync('DELETE FROM session_state');
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log('Database connection closed');
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
