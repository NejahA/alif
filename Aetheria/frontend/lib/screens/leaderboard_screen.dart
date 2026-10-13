import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  List<LeaderboardUser> users = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadLeaderboard();
  }

  void _loadLeaderboard() async {
    final fetched = await ApiService.fetchLeaderboard();
    if (!mounted) return;
    setState(() {
      users = fetched;
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
                const Icon(Icons.emoji_events, size: 44, color: Color(0xFFFFB800)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Aetheria Hall of Fame',
                        style: GoogleFonts.outfit(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Global Rankings of Top Alchemists & Focus Masters',
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
          else if (users.isEmpty)
            Text('No leaderboard records found.', style: GoogleFonts.outfit(color: Colors.white54))
          else ...[
            // Podium Card for Top 3
            if (users.length >= 3) _buildPodium(users.sublist(0, 3)),

            const SizedBox(height: 24),

            Text(
              '🏆 Global Rankings',
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: users.length,
              itemBuilder: (ctx, idx) {
                final u = users[idx];
                final bool isSelf = u.name.contains("(You)");

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isSelf ? const Color(0xFF1E293B) : const Color(0xFF161B22),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelf ? const Color(0xFF00F5FF) : Colors.white12,
                      width: isSelf ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: _getRankColor(u.rank),
                        child: Text(
                          '#${u.rank}',
                          style: GoogleFonts.outfit(
                            color: Colors.black,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  u.name,
                                  style: GoogleFonts.outfit(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: isSelf ? const Color(0xFF00F5FF) : Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(u.badge),
                              ],
                            ),
                            Text(
                              u.title,
                              style: GoogleFonts.outfit(color: Colors.white54, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'LVL ${u.level}',
                            style: GoogleFonts.outfit(
                              color: const Color(0xFFFFB800),
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            '${u.xp} XP',
                            style: GoogleFonts.outfit(color: Colors.white38, fontSize: 11),
                          ),
                        ],
                      )
                    ],
                  ),
                );
              },
            ),
          ]
        ],
      ),
    );
  }

  Widget _buildPodium(List<LeaderboardUser> top3) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF161B22),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFFFB800).withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // 2nd Place
          _buildPodiumSpot(top3[1], 100, const Color(0xFFC0C0C0), '2ND'),
          // 1st Place
          _buildPodiumSpot(top3[0], 130, const Color(0xFFFFD700), '1ST'),
          // 3rd Place
          _buildPodiumSpot(top3[2], 80, const Color(0xFFCD7F32), '3RD'),
        ],
      ),
    );
  }

  Widget _buildPodiumSpot(LeaderboardUser u, double height, Color color, String rankLabel) {
    return Column(
      children: [
        Text(u.badge, style: const TextStyle(fontSize: 28)),
        const SizedBox(height: 4),
        Text(
          u.name.split(' ')[0],
          style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
        ),
        Text(
          'LVL ${u.level}',
          style: GoogleFonts.outfit(color: color, fontSize: 11, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Container(
          width: 80,
          height: height,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color),
          ),
          alignment: Alignment.center,
          child: Text(
            rankLabel,
            style: GoogleFonts.outfit(color: color, fontWeight: FontWeight.bold, fontSize: 18),
          ),
        )
      ],
    );
  }

  Color _getRankColor(int rank) {
    if (rank == 1) return const Color(0xFFFFD700);
    if (rank == 2) return const Color(0xFFC0C0C0);
    if (rank == 3) return const Color(0xFFCD7F32);
    return Colors.white70;
  }
}
