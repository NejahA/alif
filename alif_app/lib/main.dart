import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'models/pet_evolution.dart';
import 'models/achievements_and_streaks.dart';
import 'models/life_quests.dart';
import 'widgets/lucky_wheel_modal.dart';
import 'games/void_meteor_rush.dart';
import 'games/flappy_alifi.dart';
import 'games/nebula_rhythm.dart';
import 'games/quantum_breakout.dart';
import 'games/astral_snake.dart';
import 'games/galaxy_defender.dart';
import 'games/gravity_sling.dart';
import 'games/starlight_match3.dart';
import 'games/hyperspace_racer.dart';
import 'games/cosmic_pinball.dart';
import 'games/cosmic_2048.dart';
import 'games/stellar_slicer.dart';
import 'games/bubble_shooter.dart';
import 'games/constellation_flip.dart';
import 'games/black_hole_whack.dart';
import 'games/stardust_tower.dart';

void main() {
  runApp(const AlifApp());
}

class AlifApp extends StatelessWidget {
  const AlifApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'point.o',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0D0B26),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      home: const MainPetScreen(),
    );
  }
}

class DailyQuest {
  final String id;
  final String title;
  final String description;
  int currentProgress;
  final int targetProgress;
  final int coinReward;
  final int xpReward;
  bool isClaimed;
  final IconData icon;

  DailyQuest({
    required this.id,
    required this.title,
    required this.description,
    this.currentProgress = 0,
    required this.targetProgress,
    required this.coinReward,
    required this.xpReward,
    this.isClaimed = false,
    required this.icon,
  });
}

class MainPetScreen extends StatefulWidget {
  const MainPetScreen({super.key});

  @override
  State<MainPetScreen> createState() => _MainPetScreenState();
}

class _MainPetScreenState extends State<MainPetScreen> with SingleTickerProviderStateMixin {
  int _currentTab = 0;

  // Pet Stats
  double _happiness = 0.85;
  double _fullness = 0.70;
  double _energy = 0.90;
  int _coins = 150;
  int _level = 1;
  int _xp = 40;
  final int _xpToNextLevel = 100;

  // Lifetime Stats
  int _totalSnacksFed = 0;
  int _totalGamesPlayed = 0;
  int _totalPetTaps = 0;

  // Real-Life Gamification
  late List<LifeQuest> _lifeQuests;
  int _totalLifeLogs = 0;
  int _lifePointsEarned = 0;

  // Gamification & Evolution Attributes
  bool _freeWheelSpinAvailable = true;
  int _streakDay = 1;
  bool _streakClaimedToday = false;
  late List<PetAchievement> _achievements;
  int _voidRushHighScore = 0;
  PetEvolution get _currentEvolution => PetEvolution.fromLevel(_level);

  // Pet State & Wardrobe
  String _petMood = 'Happy'; // Happy, Hungry, Sleepy, Party, Eating
  String _equippedHat = 'None';
  String _currentHabitat = 'Deep Space';
  bool _isSleeping = false;
  bool _isDancing = false;
  bool _showConfetti = false;

  late AnimationController _bounceController;
  Timer? _statDecayTimer;

  // Hat Shop
  final Map<String, int> _hatPrices = {
    'Crown': 50,
    'Sunglasses': 80,
    'Wizard': 120,
    'Astro': 200,
    'Halo': 250,
    'Neon Glasses': 100,
  };
  final List<String> _unlockedHats = ['None'];

  // Habitat Shop
  final Map<String, int> _habitatPrices = {
    'Deep Space': 0,
    'Saturn Rings': 100,
    'Crystal Cavern': 180,
    'Starlight Beach': 250,
  };
  final List<String> _unlockedHabitats = ['Deep Space'];

  // Quests
  late List<DailyQuest> _quests;

  @override
  void initState() {
    super.initState();
    _bounceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
      lowerBound: 0.95,
      upperBound: 1.08,
    )..repeat(reverse: true);

    _initQuests();
    _achievements = PetAchievement.initialList();
    _lifeQuests = LifeQuest.dailyDefaults();

    // Passive stat decrease over time
    _statDecayTimer = Timer.periodic(const Duration(seconds: 8), (timer) {
      if (!mounted) return;
      setState(() {
        if (!_isSleeping) {
          _fullness = (_fullness - 0.03).clamp(0.0, 1.0);
          _energy = (_energy - 0.02).clamp(0.0, 1.0);
          if (_fullness < 0.3) {
            _happiness = (_happiness - 0.04).clamp(0.0, 1.0);
            _petMood = 'Hungry';
          }
        } else {
          _energy = (_energy + 0.08).clamp(0.0, 1.0);
          if (_energy >= 0.99) {
            _isSleeping = false;
            _petMood = 'Happy';
          }
        }
      });
    });
  }

  void _initQuests() {
    _quests = [
      DailyQuest(
        id: 'tap_pet',
        title: 'Show Love',
        description: 'Tap Alifi 5 times to show affection',
        targetProgress: 5,
        coinReward: 25,
        xpReward: 15,
        icon: Icons.favorite,
      ),
      DailyQuest(
        id: 'feed_snack',
        title: 'Snack Time',
        description: 'Feed Alifi 3 delicious snacks',
        targetProgress: 3,
        coinReward: 35,
        xpReward: 25,
        icon: Icons.fastfood,
      ),
      DailyQuest(
        id: 'play_game',
        title: 'Arcade Champion',
        description: 'Play 2 arcade mini-games',
        targetProgress: 2,
        coinReward: 50,
        xpReward: 35,
        icon: Icons.sports_esports,
      ),
      DailyQuest(
        id: 'style_pet',
        title: 'Fashion Star',
        description: 'Equip any hat accessory',
        targetProgress: 1,
        coinReward: 30,
        xpReward: 20,
        icon: Icons.checkroom,
      ),
    ];
  }

  @override
  void dispose() {
    _bounceController.dispose();
    _statDecayTimer?.cancel();
    super.dispose();
  }

  void _incrementQuestProgress(String questId, [int amount = 1]) {
    setState(() {
      for (var q in _quests) {
        if (q.id == questId && !q.isClaimed) {
          q.currentProgress = (q.currentProgress + amount).clamp(0, q.targetProgress);
        }
      }
    });
  }

  void _claimQuestReward(DailyQuest quest) {
    if (quest.currentProgress >= quest.targetProgress && !quest.isClaimed) {
      setState(() {
        quest.isClaimed = true;
        _coins += quest.coinReward;
      });
      _gainXP(quest.xpReward);
      _triggerCelebration('Quest Completed! +${quest.coinReward} Coins, +${quest.xpReward} XP! 🎉');
    }
  }

  void _claimStreakDay() {
    if (_streakClaimedToday) return;
    final reward = StreakReward.sevenDays[(_streakDay - 1) % 7];
    setState(() {
      _streakClaimedToday = true;
      _coins += reward.coins;
      if (reward.bonusHat != null && !_unlockedHats.contains(reward.bonusHat!)) {
        _unlockedHats.add(reward.bonusHat!);
      }
      _streakDay = (_streakDay % 7) + 1;
    });
    _gainXP(reward.xp);
    _triggerCelebration('Day Reward Claimed! +${reward.coins} Coins & +${reward.xp} XP! ⚡');
  }

  void _gainXP(int amount) {
    final scaled = (amount * _currentEvolution.xpMultiplier).round();
    setState(() {
      _xp += scaled;
      if (_xp >= _xpToNextLevel) {
        final oldStage = _currentEvolution.stage;
        _level += 1;
        _xp -= _xpToNextLevel;
        final bonusCoins = (50 * _currentEvolution.coinMultiplier).round();
        _coins += bonusCoins;

        final newStage = _currentEvolution.stage;
        if (newStage > oldStage) {
          _showEvolutionModal(_currentEvolution);
        } else {
          _triggerCelebration('LEVEL UP! Reached Level $_level (+$bonusCoins Coins!)');
        }

        _checkAndIncrementAchievement('evolution_leap', _level);
      }
    });
  }

  void _checkAndIncrementAchievement(String id, [int amount = 1]) {
    setState(() {
      for (final a in _achievements) {
        if (a.id == id && !a.isClaimed) {
          a.currentValue += amount;
        }
      }
    });
  }

  void _claimAchievementReward(PetAchievement achievement) {
    if (achievement.isCompleted && !achievement.isClaimed) {
      setState(() {
        achievement.isClaimed = true;
        _coins += achievement.coinReward;
      });
      _gainXP(achievement.xpReward);
      _triggerCelebration('Achievement: ${achievement.title}! +${achievement.coinReward} Coins! 🏆');
    }
  }

  void _logLifeQuest(LifeQuest quest) {
    if (quest.isClaimed || quest.isCompleted) return;
    setState(() {
      quest.currentProgress = (quest.currentProgress + 1).clamp(0, quest.targetProgress);
      _totalLifeLogs += 1;
    });
    _gainXP(3);
    if (quest.isCompleted) {
      _showMessage('${quest.title} complete! Claim your reward 🎯');
    } else {
      _showMessage('Logged: ${quest.title} (+3 XP)');
    }
  }

  void _claimLifeQuest(LifeQuest quest) {
    if (!quest.isCompleted || quest.isClaimed) return;
    final points = (quest.coinReward * _currentEvolution.coinMultiplier).round();
    setState(() {
      quest.isClaimed = true;
      _coins += points;
      _lifePointsEarned += points;
    });
    _gainXP(quest.xpReward);
    _triggerCelebration('Life Quest cleared: ${quest.title}! +$points Points, +${quest.xpReward} XP! 🌱');
  }

  int get _lifeQuestsCleared => _lifeQuests.where((q) => q.isClaimed).length;

  void _openLuckyWheel() {
    showDialog(
      context: context,
      builder: (ctx) => LuckyWheelModal(
        currentCoins: _coins,
        hasFreeSpin: _freeWheelSpinAvailable,
        onRewardClaimed: (coins, xp, usedFreeSpin) {
          final scaledCoins = (coins * _currentEvolution.coinMultiplier).round();
          final scaledXp = (xp * _currentEvolution.xpMultiplier).round();
          setState(() {
            _coins += scaledCoins;
            if (usedFreeSpin) {
              _freeWheelSpinAvailable = false;
            } else {
              _coins = max(0, _coins - 30);
            }
          });
          _gainXP(scaledXp);
        },
      ),
    );
  }

  void _showEvolutionModal(PetEvolution evo) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(28),
          side: BorderSide(color: evo.primaryAura, width: 2.5),
        ),
        title: Row(
          children: [
            Icon(Icons.auto_awesome, color: evo.primaryAura, size: 28),
            const SizedBox(width: 8),
            const Expanded(
              child: Text(
                'CELESTIAL METAMORPHOSIS!',
                style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: evo.primaryAura.withValues(alpha: 0.2),
                boxShadow: [
                  BoxShadow(color: evo.primaryAura.withValues(alpha: 0.5), blurRadius: 20, spreadRadius: 2),
                ],
              ),
              child: Icon(Icons.pets, color: evo.accentAura, size: 52),
            ),
            const SizedBox(height: 16),
            Text(
              evo.title,
              style: TextStyle(color: evo.primaryAura, fontSize: 22, fontWeight: FontWeight.w900),
            ),
            Text(
              evo.formName,
              style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Text(
              evo.description,
              style: const TextStyle(color: Colors.white60, fontSize: 13),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: evo.primaryAura.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: evo.primaryAura),
              ),
              child: Text(
                'Passive Bonus: ${evo.statBonusText}',
                style: TextStyle(color: evo.primaryAura, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: evo.primaryAura,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('EMBRACE EVOLUTION!', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _triggerCelebration(String message) {
    setState(() {
      _showConfetti = true;
      _isDancing = true;
      _petMood = 'Party';
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.stars_rounded, color: Colors.amber),
            const SizedBox(width: 8),
            Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14))),
          ],
        ),
        backgroundColor: const Color(0xFFEC4899),
        duration: const Duration(seconds: 3),
      ),
    );

    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _showConfetti = false;
          _isDancing = false;
          _petMood = 'Happy';
        });
      }
    });
  }

  void _feedPet(String snackName, double fillVal, int cost) {
    if (_coins < cost) {
      _showMessage('Not enough coins for $snackName!');
      return;
    }
    setState(() {
      _coins -= cost;
      _fullness = (_fullness + fillVal).clamp(0.0, 1.0);
      _happiness = (_happiness + 0.05).clamp(0.0, 1.0);
      _petMood = 'Eating';
      _totalSnacksFed += 1;
    });
    _gainXP(15);
    _incrementQuestProgress('feed_snack');
    _checkAndIncrementAchievement('gourmet');

    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted && _petMood == 'Eating') {
        setState(() => _petMood = 'Happy');
      }
    });
  }

  void _tapPet() {
    if (_isSleeping) {
      _showMessage('Shh! Alifi is taking a cozy nap... 😴');
      return;
    }
    setState(() {
      _happiness = (_happiness + 0.08).clamp(0.0, 1.0);
      _coins += 2;
      _petMood = 'Happy';
      _totalPetTaps += 1;
    });
    _gainXP(5);
    _incrementQuestProgress('tap_pet');
    _checkAndIncrementAchievement('tap_master');
  }

  void _toggleSleep() {
    setState(() {
      _isSleeping = !_isSleeping;
      _petMood = _isSleeping ? 'Sleepy' : 'Happy';
    });
    if (_isSleeping) {
      _showMessage('Alifi is going to sleep! Energy restoring... 🌙');
    }
  }

  void _showMessage(String text) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(text, style: const TextStyle(fontWeight: FontWeight.bold)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  List<Color> _getHabitatGradients() {
    if (_isDancing) {
      return [const Color(0xFF5B21B6), const Color(0xFFBE185D), const Color(0xFF047857)];
    }
    if (_isSleeping) {
      return [const Color(0xFF050515), const Color(0xFF0F172A)];
    }
    switch (_currentHabitat) {
      case 'Saturn Rings':
        return [const Color(0xFF451A03), const Color(0xFF78350F), const Color(0xFF0F172A)];
      case 'Crystal Cavern':
        return [const Color(0xFF134E4A), const Color(0xFF065F46), const Color(0xFF022C22)];
      case 'Starlight Beach':
        return [const Color(0xFF831843), const Color(0xFF9D174D), const Color(0xFF4C0519)];
      case 'Deep Space':
      default:
        return [const Color(0xFF1E1B4B), const Color(0xFF312E81), const Color(0xFF0F172A)];
    }
  }

  String _getFriendshipTitle() {
    if (_level < 3) return 'New Friend 🐾';
    if (_level < 6) return 'Playful Buddy ⭐';
    if (_level < 10) return 'Cosmic Companion 🚀';
    return 'Eternal Soulmate 💖';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: _getHabitatGradients(),
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Top Bar: Level, Coins, XP
              _buildTopHeader(),

              // Main Tab Body
              Expanded(
                child: IndexedStack(
                  index: _currentTab,
                  children: [
                    _buildHomePetView(),
                    _buildLifeQuestsView(),
                    _buildMiniGamesView(),
                    _buildWardrobeView(),
                    _buildQuestsAndStatsView(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentTab,
        onDestinationSelected: (idx) => setState(() => _currentTab = idx),
        backgroundColor: const Color(0xFF0F172A).withValues(alpha: 0.9),
        indicatorColor: const Color(0xFFEC4899).withValues(alpha: 0.3),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.pets_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.pets, color: Color(0xFFF472B6)),
            label: 'Pet Care',
          ),
          NavigationDestination(
            icon: Icon(Icons.bolt_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.bolt, color: Color(0xFFF472B6)),
            label: 'Life',
          ),
          NavigationDestination(
            icon: Icon(Icons.sports_esports_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.sports_esports, color: Color(0xFFF472B6)),
            label: 'Arcade',
          ),
          NavigationDestination(
            icon: Icon(Icons.checkroom_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.checkroom, color: Color(0xFFF472B6)),
            label: 'Shop & Style',
          ),
          NavigationDestination(
            icon: Icon(Icons.assignment_turned_in_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.assignment_turned_in, color: Color(0xFFF472B6)),
            label: 'Quests & Stats',
          ),
        ],
      ),
    );
  }

  Widget _buildTopHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.25),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Level & XP Bar
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Color(0xFF8B5CF6),
                  shape: BoxShape.circle,
                ),
                child: Text(
                  'Lvl $_level',
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Colors.white),
                ),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('XP: $_xp / $_xpToNextLevel', style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  SizedBox(
                    width: 90,
                    height: 8,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: _xp / _xpToNextLevel,
                        backgroundColor: Colors.white24,
                        valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFA78BFA)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Lucky Wheel Center Button
          InkWell(
            onTap: _openLuckyWheel,
            borderRadius: BorderRadius.circular(20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFFFFEA00), Color(0xFFF59E0B)]),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFFFD700).withValues(alpha: 0.5),
                    blurRadius: 8,
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Icon(Icons.stars_rounded, color: Colors.black, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    _freeWheelSpinAvailable ? 'FREE SPIN!' : 'LUCKY SPIN',
                    style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 10.5),
                  ),
                ],
              ),
            ),
          ),

          // Coins Counter
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFF59E0B).withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFF59E0B), width: 1.5),
            ),
            child: Row(
              children: [
                const Icon(Icons.monetization_on, color: Color(0xFFFBBF24), size: 20),
                const SizedBox(width: 6),
                Text(
                  '$_coins',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFFFBBF24)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHomePetView() {
    return Stack(
      children: [
        if (_showConfetti) Positioned.fill(child: CustomPaint(painter: ConfettiPainter())),
        Column(
          children: [
            const SizedBox(height: 12),
            // Stat Meters
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  Expanded(child: _buildStatBar('Happiness', _happiness, const Color(0xFFEC4899), Icons.favorite)),
                  const SizedBox(width: 10),
                  Expanded(child: _buildStatBar('Fullness', _fullness, const Color(0xFF10B981), Icons.restaurant)),
                  const SizedBox(width: 10),
                  Expanded(child: _buildStatBar('Energy', _energy, const Color(0xFF3B82F6), Icons.bolt)),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Evolution Stage Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
              decoration: BoxDecoration(
                color: _currentEvolution.primaryAura.withValues(alpha: 0.18),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: _currentEvolution.primaryAura, width: 1.5),
                boxShadow: [
                  BoxShadow(color: _currentEvolution.primaryAura.withValues(alpha: 0.25), blurRadius: 10),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.auto_awesome, color: _currentEvolution.primaryAura, size: 14),
                  const SizedBox(width: 6),
                  Text(
                    '${_currentEvolution.title} (Stage ${_currentEvolution.stage})',
                    style: TextStyle(color: _currentEvolution.primaryAura, fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.8),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: _currentEvolution.primaryAura,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _currentEvolution.statBonusText,
                      style: const TextStyle(color: Colors.black, fontSize: 9.5, fontWeight: FontWeight.w900),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),

            // Habitat Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white10,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'Habitat: $_currentHabitat',
                style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),

            // Pet Display Stage
            Expanded(
              child: GestureDetector(
                onTap: _tapPet,
                child: Center(
                  child: ScaleTransition(
                    scale: _bounceController,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildPetAvatar(),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.4),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            _isSleeping
                                ? '💤 ZZZ... Sleeping'
                                : _isDancing
                                    ? '🎉 Dancing Party!'
                                    : _petMood == 'Eating'
                                        ? '😋 Nom Nom Nom!'
                                        : _happiness > 0.8
                                            ? '💖 Super Happy!'
                                            : _fullness < 0.3
                                                ? '🥺 Feed me please!'
                                                : '😊 Tap me to play!',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // Care Action Toolbar
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B).withValues(alpha: 0.8),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildActionButton(
                    icon: Icons.fastfood_rounded,
                    label: 'Feed Snacks',
                    color: const Color(0xFF10B981),
                    onTap: () => _showSnackMenu(),
                  ),
                  _buildActionButton(
                    icon: _isSleeping ? Icons.wb_sunny_rounded : Icons.nightlight_round,
                    label: _isSleeping ? 'Wake Up' : 'Sleep',
                    color: const Color(0xFF6366F1),
                    onTap: _toggleSleep,
                  ),
                  _buildActionButton(
                    icon: Icons.party_mode_rounded,
                    label: 'Party Mode',
                    color: const Color(0xFFEC4899),
                    onTap: () => _triggerCelebration('Party Mode Activated! 🎉'),
                  ),
                  _buildActionButton(
                    icon: Icons.stars_rounded,
                    label: 'Lucky Spin',
                    color: const Color(0xFFFFD700),
                    onTap: _openLuckyWheel,
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPetAvatar() {
    final evo = _currentEvolution;

    return Stack(
      alignment: Alignment.center,
      clipBehavior: Clip.none,
      children: [
        // Evolution Stage 3+ Celestial Nebula Wings
        if (evo.stage >= 3) ...[
          Positioned(
            left: -36,
            child: Transform.rotate(
              angle: -0.25,
              child: Container(
                width: 60,
                height: 90,
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.horizontal(left: Radius.circular(50)),
                  gradient: LinearGradient(
                    colors: [evo.primaryAura.withValues(alpha: 0.8), evo.accentAura.withValues(alpha: 0.1)],
                  ),
                  boxShadow: [
                    BoxShadow(color: evo.primaryAura.withValues(alpha: 0.5), blurRadius: 18),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            right: -36,
            child: Transform.rotate(
              angle: 0.25,
              child: Container(
                width: 60,
                height: 90,
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.horizontal(right: Radius.circular(50)),
                  gradient: LinearGradient(
                    colors: [evo.accentAura.withValues(alpha: 0.1), evo.primaryAura.withValues(alpha: 0.8)],
                  ),
                  boxShadow: [
                    BoxShadow(color: evo.primaryAura.withValues(alpha: 0.5), blurRadius: 18),
                  ],
                ),
              ),
            ),
          ),
        ],

        // Evolution Stage 2+ Orbital Starlight Ring
        if (evo.stage >= 2)
          Positioned(
            child: Transform.rotate(
              angle: -0.38,
              child: Container(
                width: 195,
                height: 64,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: evo.accentAura.withValues(alpha: 0.85), width: 2.5),
                  boxShadow: [
                    BoxShadow(color: evo.accentAura.withValues(alpha: 0.45), blurRadius: 14),
                  ],
                ),
              ),
            ),
          ),

        // Evolution Stage 4 Chronos Transcendent Chronometer Ring
        if (evo.stage >= 4)
          Positioned(
            child: Container(
              width: 180,
              height: 180,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFFFD700).withValues(alpha: 0.6), width: 2),
                boxShadow: [
                  BoxShadow(color: const Color(0xFFFFD700).withValues(alpha: 0.4), blurRadius: 24, spreadRadius: 3),
                ],
              ),
            ),
          ),

        // Glow backdrop
        Container(
          width: 170,
          height: 170,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: (_isDancing
                    ? const Color(0xFFEC4899)
                    : _isSleeping
                        ? const Color(0xFF312E81)
                        : evo.primaryAura)
                .withValues(alpha: 0.35),
            boxShadow: [
              BoxShadow(
                color: evo.primaryAura.withValues(alpha: 0.55),
                blurRadius: 30,
                spreadRadius: 6,
              ),
            ],
          ),
        ),

        // Alien Pet Character Body
        Container(
          width: 150,
          height: 150,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: _isSleeping
                  ? [const Color(0xFF6366F1), const Color(0xFF312E81)]
                  : [evo.accentAura, evo.primaryAura],
              center: Alignment.topLeft,
            ),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Alien Antenna / Star Crest
              Positioned(
                top: 10,
                child: Container(
                  width: evo.stage >= 3 ? 18 : 14,
                  height: evo.stage >= 3 ? 18 : 14,
                  decoration: BoxDecoration(
                    color: evo.accentAura,
                    shape: BoxShape.circle,
                    boxShadow: [BoxShadow(color: evo.accentAura, blurRadius: 12)],
                  ),
                  child: evo.stage >= 3 ? const Icon(Icons.star, color: Colors.white, size: 12) : null,
                ),
              ),

              // Eyes
              Positioned(
                top: 50,
                child: Row(
                  children: [
                    _buildEye(),
                    const SizedBox(width: 24),
                    _buildEye(),
                  ],
                ),
              ),

              // Mouth
              Positioned(
                bottom: 35,
                child: _isSleeping
                    ? const Text('~', style: TextStyle(fontSize: 24, color: Colors.white70, fontWeight: FontWeight.bold))
                    : _petMood == 'Eating'
                        ? const Text('O', style: TextStyle(fontSize: 24, color: Colors.white, fontWeight: FontWeight.bold))
                        : Container(
                            width: 28,
                            height: 14,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.vertical(bottom: Radius.circular(14)),
                            ),
                          ),
              ),

              // Rosy Cheeks
              Positioned(
                bottom: 45,
                child: SizedBox(
                  width: 90,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(width: 14, height: 14, decoration: BoxDecoration(color: const Color(0xFFF472B6).withValues(alpha: 0.6), shape: BoxShape.circle)),
                      Container(width: 14, height: 14, decoration: BoxDecoration(color: const Color(0xFFF472B6).withValues(alpha: 0.6), shape: BoxShape.circle)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

        // Equipped Hat Overlay
        if (_equippedHat != 'None')
          Positioned(
            top: -24,
            child: _buildHatWidget(_equippedHat),
          ),
      ],
    );
  }

  Widget _buildEye() {
    if (_isSleeping) {
      return const Text('v', style: TextStyle(fontSize: 22, color: Colors.white, fontWeight: FontWeight.bold));
    }
    return Container(
      width: 24,
      height: 24,
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Container(
          width: 12,
          height: 12,
          decoration: const BoxDecoration(
            color: Color(0xFF0F172A),
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }

  Widget _buildHatWidget(String hatName) {
    IconData icon;
    Color color;
    switch (hatName) {
      case 'Crown':
        icon = Icons.workspace_premium;
        color = const Color(0xFFF59E0B);
        break;
      case 'Sunglasses':
        icon = Icons.dark_mode;
        color = Colors.lightBlueAccent;
        break;
      case 'Wizard':
        icon = Icons.auto_awesome;
        color = const Color(0xFFA855F7);
        break;
      case 'Astro':
        icon = Icons.flight_takeoff;
        color = Colors.white;
        break;
      case 'Halo':
        icon = Icons.wb_sunny;
        color = Colors.amberAccent;
        break;
      case 'Neon Glasses':
        icon = Icons.visibility;
        color = Colors.cyanAccent;
        break;
      default:
        icon = Icons.toys;
        color = Colors.white;
    }
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.9),
        shape: BoxShape.circle,
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 8)],
      ),
      child: Icon(icon, color: Colors.white, size: 28),
    );
  }

  Widget _buildStatBar(String label, double value, Color color, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 14),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(
            value: value,
            minHeight: 8,
            backgroundColor: Colors.white10,
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton({required IconData icon, required String label, required Color color, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color, width: 1.5),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 26),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  void _showSnackMenu() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Cosmic Bakery & Snacks', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildSnackTile('Cookie', 0.2, 5, Icons.cookie),
                  _buildSnackTile('Star Fruit', 0.4, 12, Icons.star),
                  _buildSnackTile('Space Pizza', 0.7, 25, Icons.local_pizza),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSnackTile(String name, double fill, int cost, IconData icon) {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context);
        _feedPet(name, fill, cost);
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          children: [
            Icon(icon, color: const Color(0xFFFBBF24), size: 36),
            const SizedBox(height: 8),
            Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 4),
            Text('$cost Coins', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildLifeQuestsView() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Row(
          children: const [
            Icon(Icons.bolt, color: Color(0xFFF472B6), size: 30),
            SizedBox(width: 8),
            Text('point.o', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
          ],
        ),
        const SizedBox(height: 4),
        const Text(
          'Gamify your real life. Log real actions, earn Points & XP, and level up everything.',
          style: TextStyle(color: Colors.white70, fontSize: 13),
        ),
        const SizedBox(height: 16),

        _buildLifeScoreCard(),

        const SizedBox(height: 24),
        const Text('Real-Life Quests', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 12),

        ..._lifeQuests.map((quest) => _buildLifeQuestTile(quest)),
      ],
    );
  }

  Widget _buildLifeScoreCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFFEC4899)]),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFEC4899).withValues(alpha: 0.35),
            blurRadius: 16,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Row(
        children: [
          _buildLifeScoreStat('$_totalLifeLogs', 'Habits Logged'),
          _buildLifeScoreStat('$_lifeQuestsCleared/${_lifeQuests.length}', 'Quests Cleared'),
          _buildLifeScoreStat('$_lifePointsEarned', 'Life Points'),
        ],
      ),
    );
  }

  Widget _buildLifeScoreStat(String value, String label) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
          const SizedBox(height: 2),
          Text(label, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildLifeQuestTile(LifeQuest quest) {
    final isDone = quest.isCompleted;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: quest.isClaimed ? Colors.white10 : (isDone ? quest.themeColor : Colors.white12),
          width: isDone && !quest.isClaimed ? 1.8 : 1.0,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: quest.themeColor.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(quest.icon, color: quest.themeColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(quest.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                Text(quest.description, style: const TextStyle(color: Colors.white60, fontSize: 12)),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: quest.progressPct,
                    minHeight: 6,
                    backgroundColor: Colors.white10,
                    valueColor: AlwaysStoppedAnimation<Color>(isDone ? quest.themeColor : const Color(0xFF8B5CF6)),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '${quest.currentProgress}/${quest.targetProgress} · +${quest.coinReward} Points · +${quest.xpReward} XP',
                  style: TextStyle(color: quest.themeColor, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          if (quest.isClaimed)
            const Text('Done ✔', style: TextStyle(color: Colors.white38, fontWeight: FontWeight.bold, fontSize: 12))
          else
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: isDone ? quest.themeColor : const Color(0xFF8B5CF6),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
              ),
              onPressed: isDone ? () => _claimLifeQuest(quest) : () => _logLifeQuest(quest),
              child: Text(isDone ? 'Claim' : quest.logLabel),
            ),
        ],
      ),
    );
  }

  Widget _buildMiniGamesView() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Cosmic Arcade', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 6),
          const Text('Play games to earn Coins & XP for Alifi!', style: TextStyle(color: Colors.white70, fontSize: 14)),
          const SizedBox(height: 20),
          Expanded(
            child: ListView(
              children: [
                _buildGameCard(
                  title: 'Star Catcher',
                  description: 'Tap glowing space stars rapidly before time expires!',
                  icon: Icons.stars_rounded,
                  color: const Color(0xFFEC4899),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => StarCatcherGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            setState(() {
                              _coins += earnedCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(earnedXP);
                            _incrementQuestProgress('play_game');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Cosmic Memory Match',
                  description: 'Test your memory by matching space symbol pairs!',
                  icon: Icons.grid_view_rounded,
                  color: const Color(0xFF8B5CF6),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => CosmicMemoryGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Void Meteor Rush',
                  description: 'Steer Alifi through space debris! Dodge fiery meteors & collect star crystals!',
                  icon: Icons.flight_takeoff_rounded,
                  color: const Color(0xFFFF5252),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => VoidMeteorRushGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                              if (earnedCoins / 4 > _voidRushHighScore) {
                                _voidRushHighScore = (earnedCoins / 4).round();
                              }
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                            if ((earnedCoins / 4) >= 15) {
                              _checkAndIncrementAchievement('meteor_survivor', (earnedCoins / 4).round());
                            }
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Flappy Alifi: Stargate Flight',
                  description: 'Flap & glide through cosmic laser portals! Dodge obstacles & grab stardust crystals!',
                  icon: Icons.rocket_rounded,
                  color: const Color(0xFF00E5FF),
                  badgeText: 'NEW',
                  badgeColor: const Color(0xFF00E5FF),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => FlappyAlifiGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Nebula Rhythm Beats',
                  description: 'Tap along to cosmic musical energy! Hit falling notes across 4 neon lanes for massive combos!',
                  icon: Icons.audiotrack_rounded,
                  color: const Color(0xFFEC4899),
                  badgeText: 'HOT',
                  badgeColor: const Color(0xFFEC4899),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => NebulaRhythmGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Quantum Breakout',
                  description: 'Shatter celestial brick formations! Steer the quantum energy paddle and clear galaxies!',
                  icon: Icons.view_module_rounded,
                  color: const Color(0xFF8B5CF6),
                  badgeText: 'NEW',
                  badgeColor: const Color(0xFF8B5CF6),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => QuantumBreakoutGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Astral Comet Snake',
                  description: 'Guide Alifi\'s glowing comet tail! Gobble stardust orbs and avoid space boundary breaches!',
                  icon: Icons.gesture_rounded,
                  color: const Color(0xFF10B981),
                  badgeText: 'CLASSIC',
                  badgeColor: const Color(0xFF10B981),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => AstralSnakeGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Galaxy Defender',
                  description: 'Classic arcade space invader defense! Intercept alien fleets with dual plasma cannons!',
                  icon: Icons.shield_moon_rounded,
                  color: const Color(0xFFFF5252),
                  badgeText: 'ACTION',
                  badgeColor: const Color(0xFFFF5252),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => GalaxyDefenderGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Gravity Slingshot',
                  description: 'Pull back & slingshot Alifi around planetary gravity wells! Collect orbital gems & warp out!',
                  icon: Icons.public_rounded,
                  color: const Color(0xFF6366F1),
                  badgeText: 'PHYSICS',
                  badgeColor: const Color(0xFF6366F1),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => GravitySlingGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Starlight Match-3',
                  description: 'Swap glowing celestial gems to create supernova cascades before the cosmic timer runs out!',
                  icon: Icons.diamond_rounded,
                  color: const Color(0xFFFFD700),
                  badgeText: 'PUZZLE',
                  badgeColor: const Color(0xFFFFD700),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => StarlightMatch3GameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Cosmic Hyperspace Racer',
                  description: 'High-speed 3-lane hover speeder racing down the warp tunnel! Grab turbos & dodge obstacles!',
                  icon: Icons.speed_rounded,
                  color: const Color(0xFF00E5FF),
                  badgeText: 'TURBO',
                  badgeColor: const Color(0xFF00E5FF),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => HyperspaceRacerGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Cosmic Pinball',
                  description: 'Arcade pinball with glowing celestial bumpers, dual flippers, and high-energy physics!',
                  icon: Icons.stars_rounded,
                  color: const Color(0xFFEC4899),
                  badgeText: 'PINBALL',
                  badgeColor: const Color(0xFFEC4899),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => CosmicPinballGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Cosmic 2048 Fusion',
                  description: 'Slide & merge matching celestial bodies into moons, stars, supernovas, and black holes!',
                  icon: Icons.grid_view_rounded,
                  color: const Color(0xFF8B5CF6),
                  badgeText: 'FUSION',
                  badgeColor: const Color(0xFF8B5CF6),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => Cosmic2048GameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Stellar Blade Slicer',
                  description: 'Swipe your laser blade across flying space fruits! Slice combos and dodge antimatter bombs!',
                  icon: Icons.content_cut_rounded,
                  color: const Color(0xFF00E5FF),
                  badgeText: 'ACTION',
                  badgeColor: const Color(0xFF00E5FF),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => StellarSlicerGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Nebula Bubble Shooter',
                  description: 'Aim and shoot colorful stardust bubbles to match clusters of 3+ and clear constellations!',
                  icon: Icons.bubble_chart_rounded,
                  color: const Color(0xFFEC4899),
                  badgeText: 'POP',
                  badgeColor: const Color(0xFFEC4899),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => BubbleShooterGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Constellation Flip',
                  description: 'Flip a glowing star node to toggle its neighbours — light up the whole constellation to solve the puzzle!',
                  icon: Icons.auto_awesome_rounded,
                  color: const Color(0xFFF59E0B),
                  badgeText: 'NEW',
                  badgeColor: const Color(0xFFF59E0B),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ConstellationFlipGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Black Hole Whack',
                  description: 'Void creatures pop out of 3x3 portholes — whack them fast for huge combos, but never touch an empty hole!',
                  icon: Icons.blur_on_rounded,
                  color: const Color(0xFF8B5CF6),
                  badgeText: 'NEW',
                  badgeColor: const Color(0xFF8B5CF6),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => BlackHoleWhackGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildGameCard(
                  title: 'Stardust Tower',
                  description: 'One tap to drop each sliding block — stack stardust perfectly, land dead-centre for perfect combos, and build the tallest tower!',
                  icon: Icons.layers_rounded,
                  color: const Color(0xFF00E5FF),
                  badgeText: 'NEW',
                  badgeColor: const Color(0xFF00E5FF),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => StardustTowerGameScreen(
                          onGameFinished: (earnedCoins, earnedXP) {
                            final scaledCoins = (earnedCoins * _currentEvolution.coinMultiplier).round();
                            final scaledXP = (earnedXP * _currentEvolution.xpMultiplier).round();
                            setState(() {
                              _coins += scaledCoins;
                              _totalGamesPlayed += 1;
                            });
                            _gainXP(scaledXP);
                            _incrementQuestProgress('play_game');
                            _checkAndIncrementAchievement('arcade_champion');
                          },
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGameCard({
    required String title,
    required String description,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
    String? badgeText,
    Color? badgeColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: color.withValues(alpha: 0.4), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.15),
            blurRadius: 15,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 36),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(title, style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
                    ),
                    if (badgeText != null) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: (badgeColor ?? color).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: badgeColor ?? color, width: 1),
                        ),
                        child: Text(
                          badgeText,
                          style: TextStyle(color: badgeColor ?? color, fontSize: 10, fontWeight: FontWeight.w900),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(description, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: color,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: onTap,
                    icon: const Icon(Icons.play_arrow, color: Colors.white, size: 20),
                    label: const Text('Play Now', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWardrobeView() {
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          const TabBar(
            indicatorColor: Color(0xFFEC4899),
            labelColor: Color(0xFFEC4899),
            unselectedLabelColor: Colors.white70,
            tabs: [
              Tab(text: 'Hats & Accessories', icon: Icon(Icons.checkroom)),
              Tab(text: 'Habitat Backgrounds', icon: Icon(Icons.landscape)),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                _buildHatsGrid(),
                _buildHabitatsList(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHatsGrid() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: GridView.count(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        children: _hatPrices.keys.map((hat) {
          final isUnlocked = _unlockedHats.contains(hat);
          final isEquipped = _equippedHat == hat;
          final price = _hatPrices[hat]!;

          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isEquipped ? const Color(0xFFEC4899) : Colors.white10, width: 2),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildHatWidget(hat),
                Text(hat, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                if (isUnlocked)
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isEquipped ? Colors.grey : const Color(0xFF6366F1),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      setState(() {
                        _equippedHat = isEquipped ? 'None' : hat;
                      });
                      _incrementQuestProgress('style_pet');
                    },
                    child: Text(isEquipped ? 'Equipped' : 'Equip', style: const TextStyle(color: Colors.white)),
                  )
                else
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF59E0B),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      if (_coins >= price) {
                        setState(() {
                          _coins -= price;
                          _unlockedHats.add(hat);
                          _equippedHat = hat;
                        });
                        _showMessage('Unlocked $hat hat!');
                        _incrementQuestProgress('style_pet');
                        _checkAndIncrementAchievement('fashion_icon');
                      } else {
                        _showMessage('Need $price coins!');
                      }
                    },
                    icon: const Icon(Icons.monetization_on, size: 16, color: Colors.white),
                    label: Text('$price', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildHabitatsList() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: ListView(
        children: _habitatPrices.keys.map((habitat) {
          final isUnlocked = _unlockedHabitats.contains(habitat);
          final isSelected = _currentHabitat == habitat;
          final price = _habitatPrices[habitat]!;

          return Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isSelected ? const Color(0xFF10B981) : Colors.white10, width: 2),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.auto_awesome, color: Color(0xFFA78BFA)),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(habitat, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(isSelected ? 'Active Theme' : (isUnlocked ? 'Unlocked' : '$price Coins'),
                            style: TextStyle(color: isSelected ? const Color(0xFF10B981) : Colors.white54, fontSize: 12)),
                      ],
                    ),
                  ],
                ),
                if (isUnlocked)
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isSelected ? Colors.grey : const Color(0xFF10B981),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      setState(() => _currentHabitat = habitat);
                    },
                    child: Text(isSelected ? 'Selected' : 'Apply', style: const TextStyle(color: Colors.white)),
                  )
                else
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF59E0B),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      if (_coins >= price) {
                        setState(() {
                          _coins -= price;
                          _unlockedHabitats.add(habitat);
                          _currentHabitat = habitat;
                        });
                        _showMessage('Unlocked $habitat environment!');
                      } else {
                        _showMessage('Need $price coins!');
                      }
                    },
                    icon: const Icon(Icons.monetization_on, size: 16, color: Colors.white),
                    label: Text('$price', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildQuestsAndStatsView() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: ListView(
        children: [
          // 7-Day Login Streak Tracker
          _buildStreakCalendar(),
          const SizedBox(height: 24),

          // Daily Quests Header
          const Text('Daily Missions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 12),

          ..._quests.map((quest) => _buildQuestTile(quest)),

          const SizedBox(height: 24),

          // Celestial Achievements Section
          _buildAchievementsSection(),
          const SizedBox(height: 24),

          // Lifetime Stats Card
          const Text('Pet Stats & Status', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white10),
            ),
            child: Column(
              children: [
                _buildStatRow('Evolution Stage', '${_currentEvolution.title} (Stage ${_currentEvolution.stage})'),
                const Divider(color: Colors.white10),
                _buildStatRow('Passive Perk', _currentEvolution.statBonusText),
                const Divider(color: Colors.white10),
                _buildStatRow('Friendship Status', _getFriendshipTitle()),
                const Divider(color: Colors.white10),
                _buildStatRow('Total Snacks Fed', '$_totalSnacksFed 🍪'),
                const Divider(color: Colors.white10),
                _buildStatRow('Arcade Games Played', '$_totalGamesPlayed 🎮'),
                const Divider(color: Colors.white10),
                _buildStatRow('Total Pet Taps', '$_totalPetTaps 🐾'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStreakCalendar() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFFEC4899)]),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFEC4899).withValues(alpha: 0.35),
            blurRadius: 16,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.local_fire_department_rounded, color: Colors.amber, size: 28),
                  SizedBox(width: 8),
                  Text('7-Day Login Streak', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                ],
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: _streakClaimedToday ? Colors.black38 : Colors.white,
                  foregroundColor: _streakClaimedToday ? Colors.white54 : const Color(0xFF8B5CF6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                ),
                onPressed: _streakClaimedToday ? null : _claimStreakDay,
                child: Text(_streakClaimedToday ? 'Claimed ✔' : 'Claim Day $_streakDay', style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: StreakReward.sevenDays.map((reward) {
              final isCurrent = reward.day == _streakDay;
              final isPassed = reward.day < _streakDay || (isCurrent && _streakClaimedToday);

              return Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: isPassed
                        ? Colors.black26
                        : isCurrent
                            ? Colors.white.withValues(alpha: 0.25)
                            : Colors.black12,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isCurrent ? Colors.white : Colors.white24,
                      width: isCurrent ? 2 : 1,
                    ),
                  ),
                  child: Column(
                    children: [
                      Text('D${reward.day}', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Icon(reward.icon, size: 16, color: isCurrent ? Colors.amberAccent : Colors.white70),
                      const SizedBox(height: 2),
                      Text('+${reward.coins}', style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildAchievementsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Celestial Achievements', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 12),
        ..._achievements.map((ach) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: ach.isClaimed ? Colors.white10 : (ach.isCompleted ? ach.themeColor : Colors.white12),
                width: ach.isCompleted && !ach.isClaimed ? 1.8 : 1.0,
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: ach.themeColor.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(ach.icon, color: ach.themeColor, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(ach.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                      Text(ach.description, style: const TextStyle(color: Colors.white60, fontSize: 11)),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: ach.progressPct,
                          minHeight: 5,
                          backgroundColor: Colors.white10,
                          valueColor: AlwaysStoppedAnimation<Color>(ach.themeColor),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                if (ach.isClaimed)
                  const Text('Claimed ✔', style: TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold))
                else
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ach.isCompleted ? ach.themeColor : Colors.white10,
                      foregroundColor: ach.isCompleted ? Colors.black : Colors.white38,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    ),
                    onPressed: ach.isCompleted ? () => _claimAchievementReward(ach) : null,
                    child: Text(
                      ach.isCompleted ? '+${ach.coinReward}C' : '${ach.currentValue}/${ach.targetValue}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildQuestTile(DailyQuest quest) {
    final isDone = quest.currentProgress >= quest.targetProgress;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: quest.isClaimed ? Colors.white10 : (isDone ? const Color(0xFF10B981) : Colors.white10)),
      ),
      child: Row(
        children: [
          Icon(quest.icon, color: isDone ? const Color(0xFF10B981) : const Color(0xFFF472B6), size: 28),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(quest.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                Text(quest.description, style: const TextStyle(color: Colors.white60, fontSize: 12)),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: quest.currentProgress / quest.targetProgress,
                    minHeight: 6,
                    backgroundColor: Colors.white10,
                    valueColor: AlwaysStoppedAnimation<Color>(isDone ? const Color(0xFF10B981) : const Color(0xFFEC4899)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          if (quest.isClaimed)
            const Text('Done ✔', style: TextStyle(color: Colors.white38, fontWeight: FontWeight.bold))
          else
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: isDone ? const Color(0xFF10B981) : Colors.white10,
                foregroundColor: isDone ? Colors.white : Colors.white38,
              ),
              onPressed: isDone ? () => _claimReward(quest) : null,
              child: Text(isDone ? 'Claim' : '${quest.currentProgress}/${quest.targetProgress}'),
            ),
        ],
      ),
    );
  }

  void _claimReward(DailyQuest quest) {
    _claimQuestReward(quest);
  }

  Widget _buildStatRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 14)),
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
        ],
      ),
    );
  }
}

class StarCatcherGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const StarCatcherGameScreen({super.key, required this.onGameFinished});

  @override
  State<StarCatcherGameScreen> createState() => _StarCatcherGameScreenState();
}

class _StarCatcherGameScreenState extends State<StarCatcherGameScreen> {
  int _score = 0;
  int _timeLeft = 15;
  Timer? _timer;
  double _starX = 0.5;
  double _starY = 0.5;
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _spawnStar();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_timeLeft > 1) {
        setState(() => _timeLeft -= 1);
      } else {
        t.cancel();
        _endGame();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _spawnStar() {
    setState(() {
      _starX = 0.15 + _random.nextDouble() * 0.7;
      _starY = 0.2 + _random.nextDouble() * 0.55;
    });
  }

  void _catchStar() {
    setState(() {
      _score += 1;
    });
    _spawnStar();
  }

  void _endGame() {
    final coinsEarned = _score * 3;
    final xpEarned = _score * 4;
    widget.onGameFinished(coinsEarned, xpEarned);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('🌟 Time Up!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          'You caught $_score stars!\nEarned: +$coinsEarned Coins & +$xpEarned XP',
          style: const TextStyle(color: Colors.white70, fontSize: 16),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Return to main screen
            },
            child: const Text('Awesome!', style: TextStyle(color: Color(0xFFEC4899), fontWeight: FontWeight.bold, fontSize: 16)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: const Color(0xFF0D0B26),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: const Text('Star Catcher', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: Stack(
        children: [
          // Score and Timer Header
          Positioned(
            top: 20,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Score: $_score', style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 20, fontWeight: FontWeight.bold)),
                Text('Time: ${_timeLeft}s', style: const TextStyle(color: Color(0xFFF472B6), fontSize: 20, fontWeight: FontWeight.bold)),
              ],
            ),
          ),

          // Star Target
          Positioned(
            left: _starX * size.width - 30,
            top: _starY * size.height - 30,
            child: GestureDetector(
              onTap: _catchStar,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: const BoxDecoration(
                  color: Color(0xFFF59E0B),
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: Color(0xFFFBBF24), blurRadius: 20, spreadRadius: 4)],
                ),
                child: const Icon(Icons.star_rounded, color: Colors.white, size: 40),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class CosmicMemoryGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const CosmicMemoryGameScreen({super.key, required this.onGameFinished});

  @override
  State<CosmicMemoryGameScreen> createState() => _CosmicMemoryGameScreenState();
}

class _CosmicMemoryGameScreenState extends State<CosmicMemoryGameScreen> {
  final List<IconData> _symbols = [
    Icons.public,
    Icons.rocket_launch,
    Icons.auto_awesome,
    Icons.bolt,
  ];

  late List<IconData> _cards;
  late List<bool> _flipped;
  late List<bool> _matched;
  int? _selectedIndex;
  bool _isBusy = false;
  int _matchesFound = 0;
  int _moves = 0;
  int _timeLeft = 25;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startNewGame();
  }

  void _startNewGame() {
    _cards = [..._symbols, ..._symbols]..shuffle();
    _flipped = List.filled(8, false);
    _matched = List.filled(8, false);
    _selectedIndex = null;
    _isBusy = false;
    _matchesFound = 0;
    _moves = 0;
    _timeLeft = 25;

    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_timeLeft > 1) {
        setState(() => _timeLeft -= 1);
      } else {
        t.cancel();
        _endGame(false);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _onCardTap(int index) {
    if (_isBusy || _flipped[index] || _matched[index]) return;

    setState(() {
      _flipped[index] = true;
    });

    if (_selectedIndex == null) {
      _selectedIndex = index;
    } else {
      _moves++;
      final first = _selectedIndex!;
      _selectedIndex = null;

      if (_cards[first] == _cards[index]) {
        // Match!
        setState(() {
          _matched[first] = true;
          _matched[index] = true;
          _matchesFound++;
        });
        if (_matchesFound == _symbols.length) {
          _timer?.cancel();
          _endGame(true);
        }
      } else {
        // No match - flip back
        _isBusy = true;
        Future.delayed(const Duration(milliseconds: 700), () {
          if (mounted) {
            setState(() {
              _flipped[first] = false;
              _flipped[index] = false;
              _isBusy = false;
            });
          }
        });
      }
    }
  }

  void _endGame(bool won) {
    final coinsEarned = won ? (35 + (25 - _moves) * 2).clamp(20, 80) : 10;
    final xpEarned = won ? 40 : 15;
    widget.onGameFinished(coinsEarned, xpEarned);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: Text(won ? '🎉 You Won!' : '⌛ Time Expired!', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          won
              ? 'Matched all pairs in $_moves moves!\nEarned: +$coinsEarned Coins & +$xpEarned XP'
              : 'Found $_matchesFound pairs.\nEarned: +$coinsEarned Coins & +$xpEarned XP',
          style: const TextStyle(color: Colors.white70, fontSize: 16),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Awesome!', style: TextStyle(color: Color(0xFF8B5CF6), fontWeight: FontWeight.bold, fontSize: 16)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0B26),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: const Text('Cosmic Memory Match', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Moves: $_moves', style: const TextStyle(color: Color(0xFFA78BFA), fontSize: 18, fontWeight: FontWeight.bold)),
                Text('Time: ${_timeLeft}s', style: const TextStyle(color: Color(0xFFF472B6), fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 30),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.2,
                ),
                itemCount: 8,
                itemBuilder: (context, index) {
                  final isFlipped = _flipped[index] || _matched[index];
                  return GestureDetector(
                    onTap: () => _onCardTap(index),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      decoration: BoxDecoration(
                        color: isFlipped ? const Color(0xFF6D28D9) : const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _matched[index] ? const Color(0xFF10B981) : (isFlipped ? const Color(0xFFA78BFA) : Colors.white10),
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: isFlipped
                            ? Icon(_cards[index], size: 44, color: Colors.white)
                            : const Icon(Icons.help_outline_rounded, size: 36, color: Colors.white38),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ConfettiPainter extends CustomPainter {
  final Random random = Random();

  @override
  void paint(Canvas canvas, Size size) {
    final colors = [Colors.red, Colors.blue, Colors.green, Colors.yellow, Colors.pink, Colors.purple];
    for (int i = 0; i < 40; i++) {
      final paint = Paint()..color = colors[i % colors.length];
      final x = random.nextDouble() * size.width;
      final y = random.nextDouble() * size.height;
      canvas.drawCircle(Offset(x, y), 4 + random.nextDouble() * 4, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
