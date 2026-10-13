import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class ChronoVerseScreen extends StatefulWidget {
  final UserProfile? profile;
  const ChronoVerseScreen({super.key, required this.profile});

  @override
  State<ChronoVerseScreen> createState() => _ChronoVerseScreenState();
}

class _ChronoVerseScreenState extends State<ChronoVerseScreen> {
  List<TimeCapsule> capsules = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCapsules();
  }

  void _loadCapsules() async {
    final fetched = await ApiService.fetchTimeCapsules();
    if (!mounted) return;
    setState(() {
      capsules = fetched;
      isLoading = false;
    });
  }

  void _showCreateCapsuleDialog() {
    final titleCtrl = TextEditingController();
    final contentCtrl = TextEditingController();
    final levelCtrl = TextEditingController(text: '5');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161B22),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          '⏳ Seal New Time Capsule',
          style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Capsule Title',
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF7000FF))),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: contentCtrl,
              maxLines: 3,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Secret Note / Goal Content',
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF7000FF))),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: levelCtrl,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Required RPG Level to Unlock',
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF7000FF))),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF7000FF)),
            onPressed: () async {
              if (titleCtrl.text.isNotEmpty && contentCtrl.text.isNotEmpty) {
                await ApiService.createCapsule(
                  titleCtrl.text,
                  contentCtrl.text,
                  int.tryParse(levelCtrl.text) ?? 1,
                );
                _loadCapsules();
                if (ctx.mounted) Navigator.pop(ctx);
              }
            },
            child: Text('Seal Capsule', style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF7000FF).withValues(alpha: 0.3),
                  const Color(0xFF161B22),
                ],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF7000FF).withValues(alpha: 0.5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.hourglass_top, size: 44, color: Color(0xFF7000FF)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ChronoVerse Vault',
                        style: GoogleFonts.outfit(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Preserve your memories & goals. Locked until future dates or level up milestones.',
                        style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '🔒 Memory Time Capsules',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7000FF),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.lock_clock, color: Colors.white, size: 18),
                label: Text('Seal New', style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold)),
                onPressed: _showCreateCapsuleDialog,
              )
            ],
          ),

          const SizedBox(height: 16),

          if (isLoading)
            const Center(child: CircularProgressIndicator(color: Color(0xFF7000FF)))
          else if (capsules.isEmpty)
            Text('No capsules in vault. Seal one now!', style: GoogleFonts.outfit(color: Colors.white54))
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: capsules.length,
              itemBuilder: (ctx, idx) {
                final cap = capsules[idx];
                final userLevel = widget.profile?.level ?? 1;
                final bool canUnlock = userLevel >= cap.requiredLevel;

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: cap.isUnlocked || canUnlock ? const Color(0xFF1E293B) : const Color(0xFF161B22),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: cap.isUnlocked || canUnlock ? const Color(0xFF7000FF) : Colors.white12,
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
                              Icon(
                                cap.isUnlocked || canUnlock ? Icons.lock_open : Icons.lock,
                                color: cap.isUnlocked || canUnlock ? const Color(0xFF00F5FF) : Colors.redAccent,
                              ),
                              const SizedBox(width: 10),
                              Text(
                                cap.title,
                                style: GoogleFonts.outfit(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF7000FF).withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'LVL ${cap.requiredLevel} Req',
                              style: GoogleFonts.outfit(color: const Color(0xFF00F5FF), fontSize: 11),
                            ),
                          )
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (cap.isUnlocked || canUnlock)
                        Text(
                          cap.content,
                          style: GoogleFonts.outfit(color: Colors.white70, fontSize: 14),
                        )
                      else
                        Text(
                          '🔒 ENCRYPTED: Reach Level ${cap.requiredLevel} to decrypt this vault capsule.',
                          style: GoogleFonts.outfit(color: Colors.redAccent.withValues(alpha: 0.8), fontSize: 13),
                        ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Sealed on: ${cap.createdAt}',
                            style: GoogleFonts.outfit(color: Colors.white38, fontSize: 11),
                          ),
                          Text(
                            'Target Unlock: ${cap.unlockDate}',
                            style: GoogleFonts.outfit(color: Colors.white38, fontSize: 11),
                          ),
                        ],
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
