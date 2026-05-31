import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';
import 'package:culinara/widgets/chef_widgets.dart';

class TimerSymphony extends ConsumerWidget {
  const TimerSymphony({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final timers = ref.watch(symphonyTimerProvider);

    return Column(
      children: [
        const SectionHeader(title: "SYMPHONY_TIMER", icon: LucideIcons.timer),
        const SizedBox(height: 24),
        Expanded(
          child: ListView.separated(
            itemCount: timers.length,
            separatorBuilder: (context, index) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final timer = timers[index];
              return _SymphonyTimerCard(timer: timer);
            },
          ),
        ),
      ],
    );
  }
}

class _SymphonyTimerCard extends ConsumerWidget {
  final TimerModel timer;

  const _SymphonyTimerCard({required this.timer});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: timer.isActive 
              ? GourmetTheme.copper.withOpacity(0.3) 
              : Colors.white.withOpacity(0.05)
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    timer.label,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2,
                      color: timer.isActive ? GourmetTheme.copper : GourmetTheme.parchment.withOpacity(0.3),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatTime(timer.remainingSeconds),
                    style: GoogleFonts.firaCode(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      color: GourmetTheme.parchment,
                    ),
                  ),
                ],
              ),
              IconButton.filled(
                onPressed: () => ref.read(symphonyTimerProvider.notifier).toggleTimer(timer.id),
                icon: Icon(timer.isActive ? LucideIcons.pause : LucideIcons.play, size: 18),
                style: IconButton.styleFrom(
                  backgroundColor: timer.isActive ? GourmetTheme.copper : Colors.white.withOpacity(0.05),
                  foregroundColor: timer.isActive ? GourmetTheme.onyx : GourmetTheme.parchment,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: timer.progress,
              minHeight: 2,
              backgroundColor: Colors.white.withOpacity(0.05),
              valueColor: AlwaysStoppedAnimation<Color>(
                timer.isActive ? GourmetTheme.copper : GourmetTheme.accentSage.withOpacity(0.3)
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(int seconds) {
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    return "${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}";
  }
}
