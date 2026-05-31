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
        const SectionHeader(title: "Kitchen Timers", icon: LucideIcons.timer),
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
    final isComplete = timer.remainingSeconds == 0;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isComplete
            ? CuisineTheme.olive.withValues(alpha: 0.06)
            : CuisineTheme.darkWalnut.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isComplete
              ? CuisineTheme.olive.withValues(alpha: 0.25)
              : timer.isActive
                  ? CuisineTheme.terracotta.withValues(alpha: 0.3)
                  : CuisineTheme.cream.withValues(alpha: 0.04),
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
                  Row(
                    children: [
                      Text(
                        timer.label.replaceAll('_', ' '),
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1,
                          color: isComplete
                              ? CuisineTheme.olive
                              : timer.isActive
                                  ? CuisineTheme.terracotta
                                  : CuisineTheme.cream.withValues(alpha: 0.3),
                        ),
                      ),
                      if (isComplete) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: CuisineTheme.olive.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            "DONE",
                            style: GoogleFonts.inter(
                              fontSize: 7,
                              fontWeight: FontWeight.w900,
                              color: CuisineTheme.olive,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatTime(timer.remainingSeconds),
                    style: GoogleFonts.inter(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      color: CuisineTheme.cream,
                    ),
                  ),
                ],
              ),
              IconButton.filled(
                onPressed: isComplete
                    ? null
                    : () => ref.read(symphonyTimerProvider.notifier).toggleTimer(timer.id),
                icon: Icon(
                  isComplete
                      ? LucideIcons.checkCircle
                      : timer.isActive
                          ? LucideIcons.pause
                          : LucideIcons.play,
                  size: 18,
                ),
                style: IconButton.styleFrom(
                  backgroundColor: isComplete
                      ? CuisineTheme.olive.withValues(alpha: 0.2)
                      : timer.isActive
                          ? CuisineTheme.terracotta
                          : CuisineTheme.darkWalnut.withValues(alpha: 0.5),
                  foregroundColor: isComplete
                      ? CuisineTheme.olive
                      : timer.isActive
                          ? CuisineTheme.espresso
                          : CuisineTheme.cream,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: timer.progress,
              minHeight: 3,
              backgroundColor: CuisineTheme.darkWalnut,
              valueColor: AlwaysStoppedAnimation<Color>(
                isComplete
                    ? CuisineTheme.olive
                    : timer.isActive
                        ? CuisineTheme.terracotta
                        : CuisineTheme.olive.withValues(alpha: 0.3),
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
