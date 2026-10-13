import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/linear_percent_indicator.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class SkillForgeScreen extends StatefulWidget {
  final UserProfile? profile;
  final Function() onProfileUpdated;

  const SkillForgeScreen({
    super.key,
    required this.profile,
    required this.onProfileUpdated,
  });

  @override
  State<SkillForgeScreen> createState() => _SkillForgeScreenState();
}

class _SkillForgeScreenState extends State<SkillForgeScreen> {
  List<Quest> quests = [];
  List<InventoryRelic> inventory = [];
  WorldBoss? worldBoss;
  bool isLoading = true;

  // Focus Raid Boss Timer State
  int focusSecondsRemaining = 25 * 60;
  bool isTimerRunning = false;
  Timer? focusTimer;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() async {
    final fetchedQuests = await ApiService.fetchQuests();
    final fetchedInventory = await ApiService.fetchInventory();
    final fetchedBoss = await ApiService.fetchWorldBoss();
    if (!mounted) return;
    setState(() {
      quests = fetchedQuests;
      inventory = fetchedInventory;
      worldBoss = fetchedBoss;
      isLoading = false;
    });
  }

  void _attackWorldBoss() async {
    final updatedBoss = await ApiService.attackWorldBoss(35);
    if (updatedBoss != null && mounted) {
      setState(() => worldBoss = updatedBoss);
      widget.onProfileUpdated();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFFFF007F),
          content: Text(
            '⚔️ Dealt 35 Focus Damage to ${updatedBoss.name}! (+50 XP)',
            style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
      );
    }
  }

  void _completeQuest(Quest quest) async {
    final updated = await ApiService.completeQuest(quest.id);
    if (updated != null && mounted) {
      widget.onProfileUpdated();
      _loadData();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF00F5FF),
          content: Text(
            '⚡ Quest Complete! +${quest.xpReward} XP Gained!',
            style: GoogleFonts.outfit(
              color: Colors.black,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      );
    }
  }

  void _equipRelicItem(InventoryRelic relic) async {
    final success = await ApiService.equipRelic(relic.id);
    if (success && mounted) {
      _loadData();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFFFFB800),
          content: Text(
            '👑 Equipped ${relic.name}! (${relic.statBoost})',
            style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.bold),
          ),
        ),
      );
    }
  }

  void _toggleFocusTimer() {
    if (isTimerRunning) {
      focusTimer?.cancel();
      setState(() => isTimerRunning = false);
    } else {
      setState(() => isTimerRunning = true);
      focusTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (focusSecondsRemaining > 0) {
          if (mounted) setState(() => focusSecondsRemaining--);
        } else {
          timer.cancel();
          if (mounted) setState(() => isTimerRunning = false);
          _loadData();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: const Color(0xFFFF007F),
                content: Text(
                  '🏆 Focus Raid Complete! Defeated Procrastination Phantom!',
                  style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            );
          }
        }
      });
    }
  }

  void _showAddQuestDialog() {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    String selectedStat = 'focus';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161B22),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          '🗡️ Craft New Life Quest',
          style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Quest Title',
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00F5FF))),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: descCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Description',
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00F5FF))),
              ),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: selectedStat,
              dropdownColor: const Color(0xFF161B22),
              style: const TextStyle(color: Colors.white),
              items: const [
                DropdownMenuItem(value: 'focus', child: Text('Focus (+5)')),
                DropdownMenuItem(value: 'creativity', child: Text('Creativity (+5)')),
                DropdownMenuItem(value: 'intellect', child: Text('Intellect (+5)')),
                DropdownMenuItem(value: 'vitality', child: Text('Vitality (+5)')),
              ],
              onChanged: (val) => selectedStat = val ?? 'focus',
              decoration: const InputDecoration(
                labelText: 'Target Attribute',
                labelStyle: TextStyle(color: Colors.white70),
              ),
            )
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00F5FF)),
            onPressed: () async {
              if (titleCtrl.text.isNotEmpty) {
                await ApiService.addQuest(
                  titleCtrl.text,
                  descCtrl.text,
                  selectedStat,
                  150,
                );
                _loadData();
                if (ctx.mounted) Navigator.pop(ctx);
              }
            },
            child: Text('Add Quest', style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext me) {
    final prof = widget.profile;
    final double xpPercent = (prof != null && prof.nextLevelXp > 0)
        ? (prof.xp / prof.nextLevelXp).clamp(0.0, 1.0)
        : 0.0;

    final mins = (focusSecondsRemaining ~/ 60).toString().padLeft(2, '0');
    final secs = (focusSecondsRemaining % 60).toString().padLeft(2, '0');

    final double bossHpPercent = (worldBoss != null && worldBoss!.maxHp > 0)
        ? (worldBoss!.currentHp / worldBoss!.maxHp).clamp(0.0, 1.0)
        : 1.0;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF1E2640).withValues(alpha: 0.8),
                  const Color(0xFF0D1117).withValues(alpha: 0.9),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF00F5FF).withValues(alpha: 0.3)),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF00F5FF).withValues(alpha: 0.1),
                  blurRadius: 20,
                  spreadRadius: 2,
                )
              ],
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: const Color(0xFF7000FF),
                      child: Text(
                        'LVL\n${prof?.level ?? 1}',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.outfit(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            prof?.name ?? 'Aether Traveler',
                            style: GoogleFonts.outfit(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            '✨ ${prof?.title ?? 'Novice Alchemist'}',
                            style: GoogleFonts.outfit(
                              color: const Color(0xFF00F5FF),
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'XP: ${prof?.xp ?? 0} / ${prof?.nextLevelXp ?? 1000}',
                      style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13),
                    ),
                    Text(
                      '${(xpPercent * 100).toStringAsFixed(0)}%',
                      style: GoogleFonts.outfit(color: const Color(0xFF00F5FF), fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                LinearPercentIndicator(
                  lineHeight: 10,
                  percent: xpPercent,
                  backgroundColor: Colors.white10,
                  progressColor: const Color(0xFF00F5FF),
                  barRadius: const Radius.circular(5),
                  padding: EdgeInsets.zero,
                ),
              ],
            ),
          ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1),

          const SizedBox(height: 24),

          // World Boss Co-op Raid Card
          if (worldBoss != null) ...[
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFFFF007F).withValues(alpha: 0.25),
                    const Color(0xFF161B22),
                  ],
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFFF007F).withValues(alpha: 0.5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(worldBoss!.bossImage, style: const TextStyle(fontSize: 32)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '⚔️ World Boss: ${worldBoss!.name}',
                              style: GoogleFonts.outfit(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              '👥 ${worldBoss!.raidersCount} Active Focus Raiders Live',
                              style: GoogleFonts.outfit(color: const Color(0xFF00F5FF), fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF007F)),
                        onPressed: _attackWorldBoss,
                        child: Text(
                          'Deal Raid Dmg',
                          style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Boss HP: ${worldBoss!.currentHp} / ${worldBoss!.maxHp}', style: GoogleFonts.outfit(color: Colors.white70, fontSize: 12)),
                      Text('${(bossHpPercent * 100).toStringAsFixed(0)}%', style: GoogleFonts.outfit(color: const Color(0xFFFF007F), fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  LinearPercentIndicator(
                    lineHeight: 8,
                    percent: bossHpPercent,
                    backgroundColor: Colors.white10,
                    progressColor: const Color(0xFFFF007F),
                    barRadius: const Radius.circular(4),
                    padding: EdgeInsets.zero,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],

          // Stats Attribute Grid
          Text(
            '📊 Attributes & Mastery',
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 4,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.1,
            children: [
              _buildStatCard('🎯 Focus', prof?.stats['focus'] ?? 0, const Color(0xFF00F5FF)),
              _buildStatCard('🎨 Creativity', prof?.stats['creativity'] ?? 0, const Color(0xFFFF007F)),
              _buildStatCard('🧠 Intellect', prof?.stats['intellect'] ?? 0, const Color(0xFF7000FF)),
              _buildStatCard('⚡ Vitality', prof?.stats['vitality'] ?? 0, const Color(0xFFFFB800)),
            ],
          ),

          const SizedBox(height: 24),

          // Focus Raid Boss Pomodoro Widget
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF161B22),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFFF007F).withValues(alpha: 0.4)),
            ),
            child: Row(
              children: [
                CircularPercentIndicator(
                  radius: 40,
                  lineWidth: 8,
                  percent: (focusSecondsRemaining / (25 * 60)).clamp(0.0, 1.0),
                  center: Text(
                    '$mins:$secs',
                    style: GoogleFonts.outfit(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  progressColor: const Color(0xFFFF007F),
                  backgroundColor: Colors.white12,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '👾 Procrastination Phantom',
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFFFF007F),
                        ),
                      ),
                      Text(
                        'Launch a 25-min focus raid to earn +150 XP & Focus level up!',
                        style: GoogleFonts.outfit(color: Colors.white70, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  iconSize: 36,
                  icon: Icon(
                    isTimerRunning ? Icons.pause_circle_filled : Icons.play_circle_filled,
                    color: const Color(0xFFFF007F),
                  ),
                  onPressed: _toggleFocusTimer,
                )
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Inventory Relic Artifacts Section
          Text(
            '🎒 Artifact Relics & Gear',
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 120,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: inventory.length,
              itemBuilder: (ctx, idx) {
                final item = inventory[idx];
                return GestureDetector(
                  onTap: () => _equipRelicItem(item),
                  child: Container(
                    width: 200,
                    margin: const EdgeInsets.only(right: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF161B22),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: item.isEquipped ? const Color(0xFFFFB800) : Colors.white12,
                        width: item.isEquipped ? 2 : 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(item.icon, style: const TextStyle(fontSize: 22)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: item.isEquipped ? const Color(0xFFFFB800) : Colors.white10,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                item.isEquipped ? 'EQUIPPED' : item.rarity,
                                style: GoogleFonts.outfit(
                                  color: item.isEquipped ? Colors.black : Colors.white70,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          item.name,
                          style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        Text(
                          item.statBoost,
                          style: GoogleFonts.outfit(color: const Color(0xFF00F5FF), fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 24),

          // Active Quests
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '⚔️ Active Life Quests',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.add_circle, color: Color(0xFF00F5FF)),
                onPressed: _showAddQuestDialog,
              )
            ],
          ),
          const SizedBox(height: 8),

          if (isLoading)
            const Center(child: CircularProgressIndicator(color: Color(0xFF00F5FF)))
          else if (quests.isEmpty)
            Text('No active quests. Click + to craft one!', style: GoogleFonts.outfit(color: Colors.white54))
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: quests.length,
              itemBuilder: (ctx, idx) {
                final q = quests[idx];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: q.completed ? const Color(0xFF0F172A) : const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: q.completed ? Colors.white12 : const Color(0xFF00F5FF).withValues(alpha: 0.3),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        q.completed ? Icons.check_circle : Icons.radio_button_unchecked,
                        color: q.completed ? Colors.grey : const Color(0xFF00F5FF),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              q.title,
                              style: GoogleFonts.outfit(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: q.completed ? Colors.grey : Colors.white,
                                decoration: q.completed ? TextDecoration.lineThrough : null,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              q.description,
                              style: GoogleFonts.outfit(
                                fontSize: 12,
                                color: q.completed ? Colors.grey : Colors.white70,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (!q.completed)
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF00F5FF),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                          onPressed: () => _completeQuest(q),
                          child: Text(
                            '+${q.xpReward} XP',
                            style: GoogleFonts.outfit(
                              color: Colors.black,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        )
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, int value, Color color) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF161B22),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(color: Colors.white70, fontSize: 11),
          ),
          const SizedBox(height: 4),
          Text(
            '$value',
            style: GoogleFonts.outfit(
              color: color,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
