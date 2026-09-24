import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/opiate_theme.dart';
import '../providers/quran_provider.dart';
import '../screens/reciter_selection_screen.dart';

class AudioPlayerSheet extends StatefulWidget {
  const AudioPlayerSheet({super.key});

  @override
  State<AudioPlayerSheet> createState() => _AudioPlayerSheetState();
}

class _AudioPlayerSheetState extends State<AudioPlayerSheet> with SingleTickerProviderStateMixin {
  late AnimationController _waveAnim;
  final Random _random = Random();
  final List<double> _bars = List.generate(20, (i) => 0.3);

  @override
  void initState() {
    super.initState();
    _waveAnim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 120),
    )..addListener(() {
        if (mounted) {
          final provider = context.read<QuranProvider>();
          if (provider.isPlaying) {
            setState(() {
              for (int i = 0; i < _bars.length; i++) {
                _bars[i] = 0.15 + _random.nextDouble() * 0.75;
              }
            });
          }
        }
      });
    _waveAnim.repeat();
  }

  @override
  void dispose() {
    _waveAnim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<QuranProvider>();
    final surah = provider.currentSurah;
    if (surah == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: OpiateTheme.deepEmerald,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        border: Border.all(color: OpiateTheme.borderGold, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.5),
            blurRadius: 16,
            spreadRadius: 2,
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ReciterSelectionScreen()),
                    );
                  },
                  child: const CircleAvatar(
                    radius: 20,
                    backgroundColor: OpiateTheme.sacredGold,
                    child: Icon(Icons.record_voice_over, color: OpiateTheme.celestialMidnight, size: 20),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${surah.nameEnglish} (${surah.nameArabic})',
                        style: GoogleFonts.cinzel(
                          color: OpiateTheme.sacredGold,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        provider.selectedReciter.name,
                        style: GoogleFonts.outfit(color: OpiateTheme.textMuted, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: Icon(
                    provider.isPlaying ? Icons.pause_circle_filled : Icons.play_circle_fill,
                    color: OpiateTheme.sacredGold,
                    size: 38,
                  ),
                  onPressed: provider.togglePlayPause,
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Waveform bar
            if (provider.isPlaying)
              SizedBox(
                height: 24,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(_bars.length, (i) {
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 80),
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      width: 4,
                      height: 20 * _bars[i],
                      decoration: BoxDecoration(
                        color: OpiateTheme.sacredGold,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    );
                  }),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
