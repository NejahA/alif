import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class AchievementsScreen extends StatefulWidget {
  const AchievementsScreen({super.key});

  @override
  State<AchievementsScreen> createState() => _AchievementsScreenState();
}

class _AchievementsScreenState extends State<AchievementsScreen> {
  List<AchievementItem> achievements = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAchievements();
  }

  void _loadAchievements() async {
    final fetched = await ApiService.fetchAchievements();
    if (!mounted) return;
    setState(() {
      achievements = fetched;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFFFFB800).withValues(alpha: 0.3),
                  const Color(0xFF161B22),
                ],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFFFB800).withValues(alpha: 0.5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.military_tech, size: 44, color: Color(0xFFFFB800)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Chronicles Achievement Tree',
                        style: GoogleFonts.outfit(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Unlock milestone trophies to earn rare XP rewards & badges!',
                        style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          if (isLoading)
            const Center(child: CircularProgressIndicator(color: Color(0xFFFFB800)))
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: achievements.length,
              itemBuilder: (ctx, idx) {
                final ach = achievements[idx];

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: ach.unlocked ? const Color(0xFF1E293B) : const Color(0xFF161B22),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: ach.unlocked ? const Color(0xFFFFB800) : Colors.white12,
                    ),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: ach.unlocked ? const Color(0xFFFFB800).withValues(alpha: 0.2) : Colors.white10,
                        child: Text(ach.icon, style: const TextStyle(fontSize: 20)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              ach.title,
                              style: GoogleFonts.outfit(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: ach.unlocked ? Colors.white : Colors.white54,
                              ),
                            ),
                            Text(
                              ach.desc,
                              style: GoogleFonts.outfit(color: Colors.white70, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: ach.unlocked ? const Color(0xFFFFB800) : Colors.white10,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          ach.unlocked ? '+${ach.rewardXp} XP' : 'LOCKED',
                          style: GoogleFonts.outfit(
                            color: ach.unlocked ? Colors.black : Colors.white38,
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
}
