/**
 * Mock implementation of database service for testing
 */

import { Category, Question, QuestionRow, SessionStateRow } from '../../models';

class MockDatabaseService {
  private questions: Map<string, Question> = new Map();
  private sessionStates: Map<Category, {
    currentIndex: number;
    shuffleSeed: number;
    viewedQuestions: string[];
  }> = new Map();
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async insertQuestion(question: Question): Promise<void> {
    this.questions.set(question.id, question);
  }

  async insertQuestions(questions: Question[]): Promise<void> {
    for (const question of questions) {
      this.questions.set(question.id, question);
    }
  }

  async getQuestionsByCategory(category: Category): Promise<Question[]> {
    const questions: Question[] = [];
    for (const question of this.questions.values()) {
      if (question.category === category) {
        questions.push(question);
      }
    }
    return questions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getAllQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestionCount(category: Category): Promise<number> {
    let count = 0;
    for (const question of this.questions.values()) {
      if (question.category === category) {
        count++;
      }
    }
    return count;
  }

  async isSeeded(): Promise<boolean> {
    return this.questions.size > 0;
  }

  async saveSessionState(
    category: Category,
    currentIndex: number,
    shuffleSeed: number,
    viewedQuestions: string[]
  ): Promise<void> {
    this.sessionStates.set(category, {
      currentIndex,
      shuffleSeed,
      viewedQuestions,
    });
  }

  async loadSessionState(category: Category): Promise<{
    currentIndex: number;
    shuffleSeed: number;
    viewedQuestions: string[];
  } | null> {
    return this.sessionStates.get(category) || null;
  }

  async clearSessionState(): Promise<void> {
    this.sessionStates.clear();
  }

  async close(): Promise<void> {
    this.initialized = false;
  }

  // Test helper methods
  reset(): void {
    this.questions.clear();
    this.sessionStates.clear();
    this.initialized = false;
  }
}

export const databaseService = new MockDatabaseService();
