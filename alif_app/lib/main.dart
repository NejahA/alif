import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';

void main() {
  runApp(const AlifApp());
}

class AlifApp extends StatelessWidget {
  const AlifApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Alifi - Cosmic Pet & Games',
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
  bool _dailyBonusClaimed = false;

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

  void _claimDailyBonus() {
    if (_dailyBonusClaimed) return;
    setState(() {
      _dailyBonusClaimed = true;
      _coins += 50;
    });
    _gainXP(30);
    _triggerCelebration('Daily Bonus Claimed! +50 Coins & +30 XP! 🎁');
  }

  void _gainXP(int amount) {
    setState(() {
      _xp += amount;
      if (_xp >= _xpToNextLevel) {
        _level += 1;
        _xp -= _xpToNextLevel;
        _coins += 50;
        _triggerCelebration('LEVEL UP! Reached Level $_level (+50 Coins!)');
      }
    });
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
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPetAvatar() {
    return Stack(
      alignment: Alignment.center,
      clipBehavior: Clip.none,
      children: [
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
                        : const Color(0xFF8B5CF6))
                .withValues(alpha: 0.35),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF8B5CF6).withValues(alpha: 0.5),
                blurRadius: 30,
                spreadRadius: 5,
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
                  : [const Color(0xFFA78BFA), const Color(0xFF6D28D9)],
              center: Alignment.topLeft,
            ),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Alien Antenna
              Positioned(
                top: 10,
                child: Container(
                  width: 14,
                  height: 14,
                  decoration: const BoxDecoration(
                    color: Color(0xFFF472B6),
                    shape: BoxShape.circle,
                    boxShadow: [BoxShadow(color: Color(0xFFF472B6), blurRadius: 10)],
                  ),
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
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
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
          // Daily Login Bonus Banner
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFFEC4899)]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                const Icon(Icons.card_giftcard, color: Colors.white, size: 36),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Daily Login Reward', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      Text('Claim 50 free coins + 30 XP every day!', style: TextStyle(color: Colors.white90, fontSize: 12)),
                    ],
                  ),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _dailyBonusClaimed ? Colors.black38 : Colors.white,
                    foregroundColor: _dailyBonusClaimed ? Colors.white54 : const Color(0xFF8B5CF6),
                  ),
                  onPressed: _dailyBonusClaimed ? null : _claimDailyBonus,
                  child: Text(_dailyBonusClaimed ? 'Claimed' : 'Claim'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Daily Quests Header
          const Text('Daily Missions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 12),

          ..._quests.map((quest) => _buildQuestTile(quest)),

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
