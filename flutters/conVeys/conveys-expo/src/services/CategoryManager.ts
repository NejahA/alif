/**
 * CategoryManager service for managing category selection and metadata
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import { Category, CategoryInfo } from '../models';
import { databaseService } from './database';

/**
 * CategoryManager class for handling category selection and state persistence
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export class CategoryManager {
  private activeCategory: Category = Category.FUN_AND_LIGHT;
  private categoryMetadata: Map<Category, CategoryInfo> = new Map();
  private initialized: boolean = false;
  
  // Performance tracking
  private lastCategorySwitchDuration: number = 0;

  /**
   * Initialize the CategoryManager by loading category metadata
   * Requirements: 2.1
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Load question counts for each category
    const categories = this.getCategories();
    
    for (const category of categories) {
      const questionCount = await databaseService.getQuestionCount(category);
      
      // Set metadata for each category
      const info = this.createCategoryInfo(category, questionCount);
      this.categoryMetadata.set(category, info);
    }

    this.initialized = true;
  }

  /**
   * Create category info with metadata
   * Requirements: 2.1, 2.3
   */
  private createCategoryInfo(category: Category, questionCount: number): CategoryInfo {
    const metadata: Record<Category, Omit<CategoryInfo, 'questionCount'>> = {
      [Category.FUN_AND_LIGHT]: {
        name: 'Fun & Light',
        description: 'Lighthearted questions to break the ice and keep things playful',
        icon: '🎉',
      },
      [Category.PHILOSOPHICAL]: {
        name: 'Philosophical',
        description: 'Deep questions about life, values, and perspectives',
        icon: '🤔',
      },
      [Category.ABOUT_YOUR_PAST]: {
        name: 'About Your Past',
        description: 'Questions about memories, experiences, and personal history',
        icon: '📖',
      },
    };

    return {
      ...metadata[category],
      questionCount,
    };
  }

  /**
   * Get all available categories
   * Requirements: 2.1
   */
  getCategories(): Category[] {
    return [
      Category.FUN_AND_LIGHT,
      Category.PHILOSOPHICAL,
      Category.ABOUT_YOUR_PAST,
    ];
  }

  /**
   * Set the active category
   * Requirements: 2.2, 2.4, 7.2
   */
  setActiveCategory(category: Category): void {
    const startTime = performance.now();
    
    // Validate that the category exists
    if (!this.getCategories().includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }

    this.activeCategory = category;
    
    const endTime = performance.now();
    this.lastCategorySwitchDuration = endTime - startTime;
    
    // Log warning if category switch exceeds 300ms threshold
    if (this.lastCategorySwitchDuration > 300) {
      console.warn(`Category switch performance warning: ${this.lastCategorySwitchDuration.toFixed(2)}ms (threshold: 300ms)`);
    }
  }

  /**
   * Get the current active category
   * Requirements: 2.3
   */
  getActiveCategory(): Category {
    return this.activeCategory;
  }

  /**
   * Get category metadata information
   * Requirements: 2.1, 2.3
   */
  getCategoryInfo(category: Category): CategoryInfo {
    const info = this.categoryMetadata.get(category);
    
    if (!info) {
      throw new Error(`Category info not found for: ${category}`);
    }

    return info;
  }

  /**
   * Get all category info objects
   * Requirements: 2.1
   */
  getAllCategoryInfo(): CategoryInfo[] {
    return this.getCategories().map(category => this.getCategoryInfo(category));
  }

  /**
   * Refresh question count for a category (useful after seeding)
   * Requirements: 2.1
   */
  async refreshCategoryInfo(category: Category): Promise<void> {
    const questionCount = await databaseService.getQuestionCount(category);
    const info = this.createCategoryInfo(category, questionCount);
    this.categoryMetadata.set(category, info);
  }

  /**
   * Refresh all category info
   * Requirements: 2.1
   */
  async refreshAllCategoryInfo(): Promise<void> {
    const categories = this.getCategories();
    
    for (const category of categories) {
      await this.refreshCategoryInfo(category);
    }
  }

  /**
   * Get the last category switch duration in milliseconds
   * Requirements: 7.2
   */
  getLastCategorySwitchDuration(): number {
    return this.lastCategorySwitchDuration;
  }
}

// Export singleton instance
export const categoryManager = new CategoryManager();
