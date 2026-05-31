/**
 * QuestionManager service for managing questions, navigation, shuffling, and state persistence
 * Requirements: 1.1, 1.2, 1.3, 1.4, 9.1, 9.2, 9.3, 9.4
 */

import { Category, Question, CategoryProgress } from '../models';
import { databaseService } from './database';

/**
 * Seeded random number generator for consistent shuffling
 * Uses a simple Linear Congruential Generator (LCG)
 * Requirements: 9.3
 */
export function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    // LCG parameters (from Numerical Recipes)
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle algorithm with seeded RNG
 * Requirements: 9.3
 */
export function shuffleQuestions(questions: Question[], seed: number): Question[] {
  const rng = seededRandom(seed);
  const shuffled = [...questions];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * QuestionManager class for managing question retrieval, navigation, and deck management
 * Requirements: 1.1, 1.2, 1.3, 1.4, 9.1, 9.2, 9.3, 9.4
 */
export class QuestionManager {
  // In-memory cache of shuffled questions per category
  private shuffledDecks: Map<Category, Question[]> = new Map();
  
  // Current index per category
  private currentIndices: Map<Category, number> = new Map();
  
  // Shuffle seeds per category
  private shuffleSeeds: Map<Category, number> = new Map();
  
  // Viewed questions per category (for uniqueness tracking)
  private viewedQuestions: Map<Category, Set<string>> = new Map();
  
  // Flag to track if manager is initialized
  private initialized: boolean = false;
  
  // Performance tracking
  private lastNavigationDuration: number = 0;

  /**
   * Initialize the QuestionManager by loading questions and restoring state
   * Requirements: 1.4, 8.1
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Load all categories
    const categories = [
      Category.FUN_AND_LIGHT,
      Category.PHILOSOPHICAL,
      Category.ABOUT_YOUR_PAST,
    ];

    for (const category of categories) {
      // Load questions from database
      const questions = await databaseService.getQuestionsByCategory(category);
      
      // Try to restore session state from local storage
      const savedState = await databaseService.loadSessionState(category);
      
      if (savedState) {
        // Restore from saved state
        this.shuffleSeeds.set(category, savedState.shuffleSeed);
        this.currentIndices.set(category, savedState.currentIndex);
        this.viewedQuestions.set(category, new Set(savedState.viewedQuestions));
        
        // Shuffle with saved seed to restore order
        const shuffled = shuffleQuestions(questions, savedState.shuffleSeed);
        this.shuffledDecks.set(category, shuffled);
      } else {
        // Initialize new session for this category
        const seed = this.generateSeed();
        this.shuffleSeeds.set(category, seed);
        this.currentIndices.set(category, 0);
        this.viewedQuestions.set(category, new Set());
        
        // Shuffle questions with new seed
        const shuffled = shuffleQuestions(questions, seed);
        this.shuffledDecks.set(category, shuffled);
        
        // Save initial state
        await this.saveState(category);
      }
    }

    this.initialized = true;
  }

  /**
   * Generate a random seed for shuffling
   * Requirements: 9.3
   */
  private generateSeed(): number {
    return Math.floor(Math.random() * 4294967296);
  }

  /**
   * Save current state for a category to local storage
   * Requirements: 1.4
   */
  private async saveState(category: Category): Promise<void> {
    const currentIndex = this.currentIndices.get(category) || 0;
    const shuffleSeed = this.shuffleSeeds.get(category) || this.generateSeed();
    const viewedQuestions = Array.from(this.viewedQuestions.get(category) || new Set());

    await databaseService.saveSessionState(
      category,
      currentIndex,
      shuffleSeed,
      viewedQuestions
    );
  }

  /**
   * Get the current question for a category
   * Requirements: 1.1, 1.2
   */
  getCurrentQuestion(category: Category): Question | null {
    const deck = this.shuffledDecks.get(category);
    const index = this.currentIndices.get(category) || 0;

    if (!deck || deck.length === 0) {
      return null;
    }

    if (index >= deck.length) {
      return null; // End of deck
    }

    const question = deck[index];
    
    // Mark as viewed
    const viewed = this.viewedQuestions.get(category) || new Set();
    viewed.add(question.id);
    this.viewedQuestions.set(category, viewed);

    return question;
  }

  /**
   * Advance to the next question in the category
   * Returns true if successful, false if at end of deck
   * Requirements: 1.2, 7.1
   */
  async nextQuestion(category: Category): Promise<boolean> {
    const startTime = performance.now();
    
    const deck = this.shuffledDecks.get(category);
    const currentIndex = this.currentIndices.get(category) || 0;

    if (!deck || currentIndex >= deck.length - 1) {
      return false; // Already at end
    }

    this.currentIndices.set(category, currentIndex + 1);
    await this.saveState(category);
    
    const endTime = performance.now();
    this.lastNavigationDuration = endTime - startTime;
    
    // Log warning if navigation exceeds 200ms threshold
    if (this.lastNavigationDuration > 200) {
      console.warn(`Navigation performance warning: ${this.lastNavigationDuration.toFixed(2)}ms (threshold: 200ms)`);
    }
    
    return true;
  }

  /**
   * Go back to the previous question in the category
   * Returns true if successful, false if at beginning
   * Requirements: 1.2, 7.1
   */
  async previousQuestion(category: Category): Promise<boolean> {
    const startTime = performance.now();
    
    const currentIndex = this.currentIndices.get(category) || 0;

    if (currentIndex <= 0) {
      return false; // Already at beginning
    }

    this.currentIndices.set(category, currentIndex - 1);
    await this.saveState(category);
    
    const endTime = performance.now();
    this.lastNavigationDuration = endTime - startTime;
    
    // Log warning if navigation exceeds 200ms threshold
    if (this.lastNavigationDuration > 200) {
      console.warn(`Navigation performance warning: ${this.lastNavigationDuration.toFixed(2)}ms (threshold: 200ms)`);
    }
    
    return true;
  }

  /**
   * Check if there are more questions available in the category
   * Requirements: 1.3
   */
  hasMoreQuestions(category: Category): boolean {
    const deck = this.shuffledDecks.get(category);
    const currentIndex = this.currentIndices.get(category) || 0;

    if (!deck) {
      return false;
    }

    return currentIndex < deck.length - 1;
  }

  /**
   * Get progress information for a category
   * Requirements: 1.3
   */
  getProgress(category: Category): CategoryProgress {
    const deck = this.shuffledDecks.get(category);
    const currentIndex = this.currentIndices.get(category) || 0;

    return {
      current: currentIndex + 1, // 1-indexed for display
      total: deck?.length || 0,
    };
  }

  /**
   * Shuffle the deck for a category with a new seed
   * Requirements: 9.3, 9.4
   */
  async shuffleDeck(category: Category): Promise<void> {
    const questions = await databaseService.getQuestionsByCategory(category);
    const newSeed = this.generateSeed();
    
    const shuffled = shuffleQuestions(questions, newSeed);
    this.shuffledDecks.set(category, shuffled);
    this.shuffleSeeds.set(category, newSeed);
    
    await this.saveState(category);
  }

  /**
   * Reset the deck for a category (re-shuffle and start from beginning)
   * Requirements: 9.2, 9.4
   */
  async resetDeck(category: Category): Promise<void> {
    const questions = await databaseService.getQuestionsByCategory(category);
    const newSeed = this.generateSeed();
    
    // Re-shuffle with new seed
    const shuffled = shuffleQuestions(questions, newSeed);
    this.shuffledDecks.set(category, shuffled);
    this.shuffleSeeds.set(category, newSeed);
    
    // Reset index and viewed questions
    this.currentIndices.set(category, 0);
    this.viewedQuestions.set(category, new Set());
    
    await this.saveState(category);
  }

  /**
   * Get all viewed question IDs for a category
   * Requirements: 9.1
   */
  getViewedQuestions(category: Category): Set<string> {
    return this.viewedQuestions.get(category) || new Set();
  }

  /**
   * Get the current index for a category
   * Requirements: 1.4
   */
  getCurrentIndex(category: Category): number {
    return this.currentIndices.get(category) || 0;
  }

  /**
   * Get the shuffle seed for a category
   * Requirements: 9.3
   */
  getShuffleSeed(category: Category): number | undefined {
    return this.shuffleSeeds.get(category);
  }

  /**
   * Get all questions for a category in their current shuffled order
   * Requirements: 9.3
   */
  getShuffledDeck(category: Category): Question[] {
    return this.shuffledDecks.get(category) || [];
  }

  /**
   * Get the last navigation duration in milliseconds
   * Requirements: 7.1
   */
  getLastNavigationDuration(): number {
    return this.lastNavigationDuration;
  }
}

// Export singleton instance
export const questionManager = new QuestionManager();
