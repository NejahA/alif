/**
 * Seed data for initial question content
 * Requirements: 2.1, 6.1, 6.3, 6.4
 */

import { Category, Question } from '../models';

/**
 * Generate seed questions for all categories
 * Each question is open-ended and cannot be answered with yes/no
 * Requirements: 6.1, 6.3, 6.4
 */
export const seedQuestions: Question[] = [
  // Fun & Light category (20+ questions)
  {
    id: 'fl_001',
    text: 'What would your perfect day look like from start to finish?',
    category: Category.FUN_AND_LIGHT,
    tags: ['imagination', 'lifestyle'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_002',
    text: 'If you could have dinner with any three people, living or dead, who would they be and why?',
    category: Category.FUN_AND_LIGHT,
    tags: ['imagination', 'people'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_003',
    text: 'What hobby or skill have you always wanted to learn?',
    category: Category.FUN_AND_LIGHT,
    tags: ['interests', 'goals'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_004',
    text: 'What song or album has been on repeat for you lately?',
    category: Category.FUN_AND_LIGHT,
    tags: ['music', 'current'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_005',
    text: 'If you could travel anywhere in the world right now, where would you go?',
    category: Category.FUN_AND_LIGHT,
    tags: ['travel', 'imagination'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_006',
    text: 'What movie or TV show could you watch over and over again?',
    category: Category.FUN_AND_LIGHT,
    tags: ['entertainment', 'favorites'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_007',
    text: 'What food could you eat every day and never get tired of?',
    category: Category.FUN_AND_LIGHT,
    tags: ['food', 'preferences'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_008',
    text: 'What superpower would you choose and how would you use it?',
    category: Category.FUN_AND_LIGHT,
    tags: ['imagination', 'fun'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_009',
    text: 'What was the last thing that made you laugh really hard?',
    category: Category.FUN_AND_LIGHT,
    tags: ['humor', 'recent'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_010',
    text: 'If you could master any musical instrument instantly, which would you choose?',
    category: Category.FUN_AND_LIGHT,
    tags: ['music', 'imagination'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_011',
    text: 'What book has had the biggest impact on you?',
    category: Category.FUN_AND_LIGHT,
    tags: ['books', 'influence'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_012',
    text: 'What would you do if you won the lottery tomorrow?',
    category: Category.FUN_AND_LIGHT,
    tags: ['imagination', 'money'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_013',
    text: 'What animal do you think best represents your personality?',
    category: Category.FUN_AND_LIGHT,
    tags: ['personality', 'fun'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_014',
    text: 'What season of the year is your favorite and why?',
    category: Category.FUN_AND_LIGHT,
    tags: ['preferences', 'nature'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_015',
    text: 'What fictional world would you most want to live in?',
    category: Category.FUN_AND_LIGHT,
    tags: ['imagination', 'fiction'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_016',
    text: 'What talent or skill do you wish you had?',
    category: Category.FUN_AND_LIGHT,
    tags: ['aspirations', 'skills'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_017',
    text: 'What was your favorite game to play as a child?',
    category: Category.FUN_AND_LIGHT,
    tags: ['childhood', 'games'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_018',
    text: 'If you could have any job for just one day, what would it be?',
    category: Category.FUN_AND_LIGHT,
    tags: ['career', 'imagination'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_019',
    text: 'What celebrity would you most want to be friends with?',
    category: Category.FUN_AND_LIGHT,
    tags: ['people', 'celebrities'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_020',
    text: 'What would your dream vacation look like?',
    category: Category.FUN_AND_LIGHT,
    tags: ['travel', 'dreams'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_021',
    text: 'What podcast or YouTube channel have you been enjoying lately?',
    category: Category.FUN_AND_LIGHT,
    tags: ['media', 'current'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'fl_022',
    text: 'What sport or physical activity do you most enjoy?',
    category: Category.FUN_AND_LIGHT,
    tags: ['sports', 'activities'],
    createdAt: new Date('2024-01-01'),
  },

  // Philosophical category (20+ questions)
  {
    id: 'ph_001',
    text: 'What do you think is the meaning of a life well-lived?',
    category: Category.PHILOSOPHICAL,
    tags: ['meaning', 'life'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_002',
    text: 'How do you define success for yourself?',
    category: Category.PHILOSOPHICAL,
    tags: ['success', 'values'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_003',
    text: 'What role does failure play in personal growth?',
    category: Category.PHILOSOPHICAL,
    tags: ['failure', 'growth'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_004',
    text: 'What values are most important to you in life?',
    category: Category.PHILOSOPHICAL,
    tags: ['values', 'principles'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_005',
    text: 'How do you think technology is changing human relationships?',
    category: Category.PHILOSOPHICAL,
    tags: ['technology', 'relationships'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_006',
    text: 'What does happiness mean to you?',
    category: Category.PHILOSOPHICAL,
    tags: ['happiness', 'emotions'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_007',
    text: 'If you could change one thing about the world, what would it be?',
    category: Category.PHILOSOPHICAL,
    tags: ['change', 'world'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_008',
    text: 'What do you think happens after we die?',
    category: Category.PHILOSOPHICAL,
    tags: ['death', 'afterlife'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_009',
    text: 'How do you balance living in the moment with planning for the future?',
    category: Category.PHILOSOPHICAL,
    tags: ['time', 'balance'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_010',
    text: 'What makes a person truly free?',
    category: Category.PHILOSOPHICAL,
    tags: ['freedom', 'philosophy'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_011',
    text: 'How do you think we should measure the value of a human life?',
    category: Category.PHILOSOPHICAL,
    tags: ['value', 'life'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_012',
    text: 'What responsibility do we have to future generations?',
    category: Category.PHILOSOPHICAL,
    tags: ['responsibility', 'future'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_013',
    text: 'What role does suffering play in the human experience?',
    category: Category.PHILOSOPHICAL,
    tags: ['suffering', 'experience'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_014',
    text: 'How do you distinguish between right and wrong?',
    category: Category.PHILOSOPHICAL,
    tags: ['morality', 'ethics'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_015',
    text: 'What does it mean to live authentically?',
    category: Category.PHILOSOPHICAL,
    tags: ['authenticity', 'self'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_016',
    text: 'How much control do we really have over our lives?',
    category: Category.PHILOSOPHICAL,
    tags: ['control', 'fate'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_017',
    text: 'What makes a relationship meaningful?',
    category: Category.PHILOSOPHICAL,
    tags: ['relationships', 'meaning'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_018',
    text: 'How do you think consciousness works?',
    category: Category.PHILOSOPHICAL,
    tags: ['consciousness', 'mind'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_019',
    text: 'What is the relationship between knowledge and wisdom?',
    category: Category.PHILOSOPHICAL,
    tags: ['knowledge', 'wisdom'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_020',
    text: 'How do you think we should balance individual freedom with collective responsibility?',
    category: Category.PHILOSOPHICAL,
    tags: ['freedom', 'responsibility'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_021',
    text: 'What gives your life purpose?',
    category: Category.PHILOSOPHICAL,
    tags: ['purpose', 'meaning'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ph_022',
    text: 'How do you think art and creativity contribute to human existence?',
    category: Category.PHILOSOPHICAL,
    tags: ['art', 'creativity'],
    createdAt: new Date('2024-01-01'),
  },

  // About Your Past category (20+ questions)
  {
    id: 'ap_001',
    text: 'What is your earliest childhood memory?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['childhood', 'memory'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_002',
    text: 'Who was your biggest role model growing up?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['role-model', 'influence'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_003',
    text: 'What was your favorite subject in school and why?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['school', 'education'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_004',
    text: 'What was the most important lesson your parents taught you?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['parents', 'lessons'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_005',
    text: 'What was your dream job when you were a child?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['childhood', 'dreams'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_006',
    text: 'What experience from your past shaped who you are today?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['experience', 'growth'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_007',
    text: 'What was your most memorable birthday celebration?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['birthday', 'celebration'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_008',
    text: 'What was the hardest decision you ever had to make?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['decisions', 'challenges'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_009',
    text: 'What tradition from your childhood do you still carry with you?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['traditions', 'family'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_010',
    text: 'What was your first job and what did you learn from it?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['work', 'lessons'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_011',
    text: 'What place from your past holds the most memories for you?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['places', 'memories'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_012',
    text: 'What was the biggest risk you ever took?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['risk', 'courage'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_013',
    text: 'What friendship from your past do you miss the most?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['friendship', 'nostalgia'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_014',
    text: 'What was your favorite family vacation growing up?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['family', 'travel'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_015',
    text: 'What mistake from your past taught you the most?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['mistakes', 'learning'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_016',
    text: 'What was your proudest achievement as a teenager?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['achievement', 'youth'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_017',
    text: 'What teacher or mentor had the biggest impact on your life?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['mentors', 'influence'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_018',
    text: 'What was the scariest moment of your life?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['fear', 'challenges'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_019',
    text: 'What hobby or interest from your past do you wish you had continued?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['hobbies', 'regrets'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_020',
    text: 'What was your relationship like with your siblings growing up?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['siblings', 'family'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_021',
    text: 'What moment from your past would you relive if you could?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['memories', 'nostalgia'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ap_022',
    text: 'What was the most adventurous thing you did in your youth?',
    category: Category.ABOUT_YOUR_PAST,
    tags: ['adventure', 'youth'],
    createdAt: new Date('2024-01-01'),
  },
];

/**
 * Seed the database with initial question content
 * Only seeds if database is empty
 * Requirements: 2.1, 6.1, 6.3, 6.4
 */
export async function seedDatabase(databaseService: any): Promise<void> {
  try {
    const isSeeded = await databaseService.isSeeded();
    
    if (isSeeded) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database with initial questions...');
    await databaseService.insertQuestions(seedQuestions);
    
    // Verify seeding
    const funCount = await databaseService.getQuestionCount(Category.FUN_AND_LIGHT);
    const philCount = await databaseService.getQuestionCount(Category.PHILOSOPHICAL);
    const pastCount = await databaseService.getQuestionCount(Category.ABOUT_YOUR_PAST);
    
    console.log(`Database seeded successfully:`);
    console.log(`  - Fun & Light: ${funCount} questions`);
    console.log(`  - Philosophical: ${philCount} questions`);
    console.log(`  - About Your Past: ${pastCount} questions`);
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
}
