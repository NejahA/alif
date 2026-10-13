import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class GuildsScreen extends StatefulWidget {
  const GuildsScreen({super.key});

  @override
  State<GuildsScreen> createState() => _GuildsScreenState();
}

class _GuildsScreenState extends State<GuildsScreen> {
  List<TravelerGuild> guilds = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadGuilds();
  }

  void _loadGuilds() async {
    final fetched = await ApiService.fetchGuilds();
    if (!mounted) return;
    setState(() {
      guilds = fetched;
      isLoading = false;
    });
  }

  void _joinGuild(TravelerGuild g) async {
    final updatedList = await ApiService.joinGuild(g.id);
    if (mounted && updatedList.isNotEmpty) {
      setState(() => guilds = updatedList);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF00F5FF),
          content: Text(
            '🛡️ Joined ${g.name} ${g.tag}! Welcome to the Guild Hall!',
            style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.bold),
          ),
        ),
      );
    }
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
                  const Color(0xFF00F5FF).withValues(alpha: 0.3),
                  const Color(0xFF161B22),
                ],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF00F5FF).withValues(alpha: 0.5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.groups, size: 44, color: Color(0xFF00F5FF)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Traveler Guild Halls',
                        style: GoogleFonts.outfit(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Unite with other Alchemists into focus guilds to pool collective focus hours!',
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
            const Center(child: CircularProgressIndicator(color: Color(0xFF00F5FF)))
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: guilds.length,
              itemBuilder: (ctx, idx) {
                final g = guilds[idx];

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: g.isJoined ? const Color(0xFF1E293B) : const Color(0xFF161B22),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: g.isJoined ? const Color(0xFF00F5FF) : Colors.white12,
                      width: g.isJoined ? 2 : 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Text(
                                g.name,
                                style: GoogleFonts.outfit(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                g.tag,
                                style: GoogleFonts.outfit(color: const Color(0xFF00F5FF), fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF7000FF),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'LVL ${g.guildLevel} Guild',
                              style: GoogleFonts.outfit(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          )
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '💬 "${g.motto}"',
                        style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13, fontStyle: FontStyle.italic),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('👥 Members: ${g.membersCount} Active', style: GoogleFonts.outfit(color: Colors.white54, fontSize: 12)),
                          Text('⏱️ Cumulative Focus: ${g.totalFocusHours} hrs', style: GoogleFonts.outfit(color: const Color(0xFFFFB800), fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Align(
                        alignment: Alignment.centerRight,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: g.isJoined ? Colors.grey : const Color(0xFF00F5FF),
                          ),
                          onPressed: g.isJoined ? null : () => _joinGuild(g),
                          child: Text(
                            g.isJoined ? 'Joined Member' : 'Join Guild Squad',
                            style: GoogleFonts.outfit(
                              color: g.isJoined ? Colors.white70 : Colors.black,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
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
