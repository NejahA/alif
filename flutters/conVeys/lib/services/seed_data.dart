import '../models/category.dart' as models;
import '../models/question.dart';
import 'database_service.dart';
import 'package:flutter/foundation.dart';

/// Seed data for initial question content
/// Requirements: 2.1, 6.1, 6.3, 6.4

final List<Question> seedQuestions = [
  // Fun & Light category (22 questions)
  Question(
    id: 'fl_001',
    text: 'What would your perfect day look like from start to finish?',
    category: models.Category.funAndLight,
    tags: ['imagination', 'lifestyle'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_002',
    text: 'If you could have dinner with any three people, living or dead, who would they be and why?',
    category: models.Category.funAndLight,
    tags: ['imagination', 'people'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_003',
    text: 'What hobby or skill have you always wanted to learn?',
    category: models.Category.funAndLight,
    tags: ['interests', 'goals'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_004',
    text: 'What song or album has been on repeat for you lately?',
    category: models.Category.funAndLight,
    tags: ['music', 'current'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_005',
    text: 'If you could travel anywhere in the world right now, where would you go?',
    category: models.Category.funAndLight,
    tags: ['travel', 'imagination'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_006',
    text: 'What movie or TV show could you watch over and over again?',
    category: models.Category.funAndLight,
    tags: ['entertainment', 'favorites'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_007',
    text: 'What food could you eat every day and never get tired of?',
    category: models.Category.funAndLight,
    tags: ['food', 'preferences'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_008',
    text: 'What superpower would you choose and how would you use it?',
    category: models.Category.funAndLight,
    tags: ['imagination', 'fun'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_009',
    text: 'What was the last thing that made you laugh really hard?',
    category: models.Category.funAndLight,
    tags: ['humor', 'recent'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_010',
    text: 'If you could master any musical instrument instantly, which would you choose?',
    category: models.Category.funAndLight,
    tags: ['music', 'imagination'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_011',
    text: 'What book has had the biggest impact on you?',
    category: models.Category.funAndLight,
    tags: ['books', 'influence'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_012',
    text: 'What would you do if you won the lottery tomorrow?',
    category: models.Category.funAndLight,
    tags: ['imagination', 'money'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_013',
    text: 'What animal do you think best represents your personality?',
    category: models.Category.funAndLight,
    tags: ['personality', 'fun'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_014',
    text: 'What season of the year is your favorite and why?',
    category: models.Category.funAndLight,
    tags: ['preferences', 'nature'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_015',
    text: 'What fictional world would you most want to live in?',
    category: models.Category.funAndLight,
    tags: ['imagination', 'fiction'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_016',
    text: 'What talent or skill do you wish you had?',
    category: models.Category.funAndLight,
    tags: ['aspirations', 'skills'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_017',
    text: 'What was your favorite game to play as a child?',
    category: models.Category.funAndLight,
    tags: ['childhood', 'games'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_018',
    text: 'If you could have any job for just one day, what would it be?',
    category: models.Category.funAndLight,
    tags: ['career', 'imagination'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_019',
    text: 'What celebrity would you most want to be friends with?',
    category: models.Category.funAndLight,
    tags: ['people', 'celebrities'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_020',
    text: 'What would your dream vacation look like?',
    category: models.Category.funAndLight,
    tags: ['travel', 'dreams'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_021',
    text: 'What podcast or YouTube channel have you been enjoying lately?',
    category: models.Category.funAndLight,
    tags: ['media', 'current'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'fl_022',
    text: 'What sport or physical activity do you most enjoy?',
    category: models.Category.funAndLight,
    tags: ['sports', 'activities'],
    createdAt: DateTime(2024, 1, 1),
  ),

  // Philosophical category (22 questions)
  Question(
    id: 'ph_001',
    text: 'What do you think is the meaning of a life well-lived?',
    category: models.Category.philosophical,
    tags: ['meaning', 'life'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_002',
    text: 'How do you define success for yourself?',
    category: models.Category.philosophical,
    tags: ['success', 'values'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_003',
    text: 'What role does failure play in personal growth?',
    category: models.Category.philosophical,
    tags: ['failure', 'growth'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_004',
    text: 'What values are most important to you in life?',
    category: models.Category.philosophical,
    tags: ['values', 'principles'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_005',
    text: 'How do you think technology is changing human relationships?',
    category: models.Category.philosophical,
    tags: ['technology', 'relationships'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_006',
    text: 'What does happiness mean to you?',
    category: models.Category.philosophical,
    tags: ['happiness', 'emotions'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_007',
    text: 'If you could change one thing about the world, what would it be?',
    category: models.Category.philosophical,
    tags: ['change', 'world'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_008',
    text: 'What do you think happens after we die?',
    category: models.Category.philosophical,
    tags: ['death', 'afterlife'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_009',
    text: 'How do you balance living in the moment with planning for the future?',
    category: models.Category.philosophical,
    tags: ['time', 'balance'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_010',
    text: 'What makes a person truly free?',
    category: models.Category.philosophical,
    tags: ['freedom', 'philosophy'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_011',
    text: 'How do you think we should measure the value of a human life?',
    category: models.Category.philosophical,
    tags: ['value', 'life'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_012',
    text: 'What responsibility do we have to future generations?',
    category: models.Category.philosophical,
    tags: ['responsibility', 'future'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_013',
    text: 'What role does suffering play in the human experience?',
    category: models.Category.philosophical,
    tags: ['suffering', 'experience'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_014',
    text: 'How do you distinguish between right and wrong?',
    category: models.Category.philosophical,
    tags: ['morality', 'ethics'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_015',
    text: 'What does it mean to live authentically?',
    category: models.Category.philosophical,
    tags: ['authenticity', 'self'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_016',
    text: 'How much control do we really have over our lives?',
    category: models.Category.philosophical,
    tags: ['control', 'fate'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_017',
    text: 'What makes a relationship meaningful?',
    category: models.Category.philosophical,
    tags: ['relationships', 'meaning'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_018',
    text: 'How do you think consciousness works?',
    category: models.Category.philosophical,
    tags: ['consciousness', 'mind'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_019',
    text: 'What is the relationship between knowledge and wisdom?',
    category: models.Category.philosophical,
    tags: ['knowledge', 'wisdom'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_020',
    text: 'How do you think we should balance individual freedom with collective responsibility?',
    category: models.Category.philosophical,
    tags: ['freedom', 'responsibility'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_021',
    text: 'What gives your life purpose?',
    category: models.Category.philosophical,
    tags: ['purpose', 'meaning'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ph_022',
    text: 'How do you think art and creativity contribute to human existence?',
    category: models.Category.philosophical,
    tags: ['art', 'creativity'],
    createdAt: DateTime(2024, 1, 1),
  ),

  // About Your Past category (22 questions)
  Question(
    id: 'ap_001',
    text: 'What is your earliest childhood memory?',
    category: models.Category.aboutYourPast,
    tags: ['childhood', 'memory'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_002',
    text: 'Who was your biggest role model growing up?',
    category: models.Category.aboutYourPast,
    tags: ['role-model', 'influence'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_003',
    text: 'What was your favorite subject in school and why?',
    category: models.Category.aboutYourPast,
    tags: ['school', 'education'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_004',
    text: 'What was the most important lesson your parents taught you?',
    category: models.Category.aboutYourPast,
    tags: ['parents', 'lessons'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_005',
    text: 'What was your dream job when you were a child?',
    category: models.Category.aboutYourPast,
    tags: ['childhood', 'dreams'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_006',
    text: 'What experience from your past shaped who you are today?',
    category: models.Category.aboutYourPast,
    tags: ['experience', 'growth'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_007',
    text: 'What was your most memorable birthday celebration?',
    category: models.Category.aboutYourPast,
    tags: ['birthday', 'celebration'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_008',
    text: 'What was the hardest decision you ever had to make?',
    category: models.Category.aboutYourPast,
    tags: ['decisions', 'challenges'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_009',
    text: 'What tradition from your childhood do you still carry with you?',
    category: models.Category.aboutYourPast,
    tags: ['traditions', 'family'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_010',
    text: 'What was your first job and what did you learn from it?',
    category: models.Category.aboutYourPast,
    tags: ['work', 'lessons'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_011',
    text: 'What place from your past holds the most memories for you?',
    category: models.Category.aboutYourPast,
    tags: ['places', 'memories'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_012',
    text: 'What was the biggest risk you ever took?',
    category: models.Category.aboutYourPast,
    tags: ['risk', 'courage'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_013',
    text: 'What friendship from your past do you miss the most?',
    category: models.Category.aboutYourPast,
    tags: ['friendship', 'nostalgia'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_014',
    text: 'What was your favorite family vacation growing up?',
    category: models.Category.aboutYourPast,
    tags: ['family', 'travel'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_015',
    text: 'What mistake from your past taught you the most?',
    category: models.Category.aboutYourPast,
    tags: ['mistakes', 'learning'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_016',
    text: 'What was your proudest achievement as a teenager?',
    category: models.Category.aboutYourPast,
    tags: ['achievement', 'youth'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_017',
    text: 'What teacher or mentor had the biggest impact on your life?',
    category: models.Category.aboutYourPast,
    tags: ['mentors', 'influence'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_018',
    text: 'What was the scariest moment of your life?',
    category: models.Category.aboutYourPast,
    tags: ['fear', 'challenges'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_019',
    text: 'What hobby or interest from your past do you wish you had continued?',
    category: models.Category.aboutYourPast,
    tags: ['hobbies', 'regrets'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_020',
    text: 'What was your relationship like with your siblings growing up?',
    category: models.Category.aboutYourPast,
    tags: ['siblings', 'family'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_021',
    text: 'What moment from your past would you relive if you could?',
    category: models.Category.aboutYourPast,
    tags: ['memories', 'nostalgia'],
    createdAt: DateTime(2024, 1, 1),
  ),
  Question(
    id: 'ap_022',
    text: 'What was the most adventurous thing you did in your youth?',
    category: models.Category.aboutYourPast,
    tags: ['adventure', 'youth'],
    createdAt: DateTime(2024, 1, 1),
  ),
];

/// Seed the database with initial question content
/// Only seeds if database is empty
/// Requirements: 2.1, 6.1, 6.3, 6.4
Future<void> seedDatabase() async {
  try {
    final db = DatabaseService.instance;
    final isSeeded = await db.isSeeded();

    if (isSeeded) {
      debugPrint('Database already seeded, skipping...');
      return;
    }

    debugPrint('Seeding database with initial questions...');
    await db.insertQuestions(seedQuestions);

    // Verify seeding
    final funCount = await db.getQuestionCount(models.Category.funAndLight);
    final philCount = await db.getQuestionCount(models.Category.philosophical);
    final pastCount = await db.getQuestionCount(models.Category.aboutYourPast);

    debugPrint('Database seeded successfully:');
    debugPrint('  - Fun & Light: $funCount questions');
    debugPrint('  - Philosophical: $philCount questions');
    debugPrint('  - About Your Past: $pastCount questions');
  } catch (error) {
    debugPrint('Failed to seed database: $error');
    rethrow;
  }
}
