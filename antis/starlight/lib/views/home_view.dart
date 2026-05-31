import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:starlight/providers/star_provider.dart';
import 'package:starlight/theme/starlight_theme.dart';
import 'package:starlight/widgets/celestial_background.dart';

class HomeView extends ConsumerWidget {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final starState = ref.watch(starProvider);
    final notifier = ref.read(starProvider.notifier);

    return Scaffold(
      body: CelestialBackground(
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(context, starState),
              const Spacer(),
              _buildStarDisplay(starState),
              const Spacer(),
              _buildControls(context, starState, notifier),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, StarState state) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'STAR_LIGHT',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  letterSpacing: 4,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                ),
              ),
              Text(
                '0x${state.stardust}_NEURAL_STARDUST',
                style: const TextStyle(
                  fontSize: 10,
                  letterSpacing: 2,
                  color: StarlightTheme.stellarBlue,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.auto_awesome, color: Colors.white70),
          ),
        ],
      ),
    );
  }

  Widget _buildStarDisplay(StarState state) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _StarGraphic(phase: state.phase),
          const SizedBox(height: 40),
          _formatDuration(state.timeLeft)
              .animate(target: state.phase == StarPhase.growth ? 1 : 0)
              .fade()
              .scale(begin: const Offset(0.8, 0.8), end: const Offset(1, 1)),
        ],
      ),
    );
  }

  Widget _buildControls(BuildContext context, StarState state, StarNotifier notifier) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 500),
        child: state.phase == StarPhase.idle
            ? _buildStartButtons(context, notifier)
            : _buildActiveControls(context, state, notifier),
      ),
    );
  }

  Widget _buildStartButtons(BuildContext context, StarNotifier notifier) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _FocusButton(
          label: '25_MIN',
          color: StarlightTheme.stellarBlue,
          onPressed: () => notifier.startFocus(const Duration(minutes: 25)),
        ),
        const SizedBox(width: 20),
        _FocusButton(
          label: '50_MIN',
          color: StarlightTheme.nebulaPink,
          onPressed: () => notifier.startFocus(const Duration(minutes: 50)),
        ),
      ],
    );
  }

  Widget _buildActiveControls(BuildContext context, StarState state, StarNotifier notifier) {
    return Column(
      children: [
        Text(
          state.phase.name.toUpperCase(),
          style: const TextStyle(fontSize: 12, letterSpacing: 4, fontWeight: FontWeight.bold, color: Colors.white38),
        ),
        const SizedBox(height: 10),
        GestureDetector(
          onTap: () => notifier.reset(),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: StarlightTheme.glassDecoration,
            child: const Text('ABORT_MISSION', style: TextStyle(fontSize: 10, letterSpacing: 2, fontWeight: FontWeight.bold, color: Colors.redAccent)),
          ),
        ),
      ],
    );
  }

  Widget _formatDuration(Duration d) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(d.inMinutes % 60);
    final seconds = twoDigits(d.inSeconds % 60);
    return Text(
      '$minutes:$seconds',
      style: GoogleFonts.spaceGrotesk(
        fontSize: 64,
        fontWeight: FontWeight.w900,
        color: Colors.white,
        letterSpacing: -2,
      ),
    );
  }
}

class _StarGraphic extends StatelessWidget {
  final StarPhase phase;
  const _StarGraphic({required this.phase});

  @override
  Widget build(BuildContext context) {
    final double size = phase == StarPhase.growth ? 120 : (phase == StarPhase.birth ? 40 : 80);
    final Color color = phase == StarPhase.supernova 
        ? Colors.white 
        : (phase == StarPhase.birth ? StarlightTheme.stellarBlue : StarlightTheme.nebulaPink);

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.6),
            blurRadius: size,
            spreadRadius: size / 4,
          ),
        ],
      ),
    ).animate(target: phase == StarPhase.idle ? 0 : 1)
     .shimmer(duration: 2.seconds, color: Colors.white24)
     .scale(duration: 1.seconds, curve: Curves.elasticOut)
     .boxShadow(begin: const BoxShadow(blurRadius: 10), end: const BoxShadow(blurRadius: 40)).animate(onComplete: (c) => c.repeat(reverse: true))
     .scale(begin: const Offset(1, 1), end: const Offset(1.1, 1.1), duration: 2.seconds);
  }
}

class _FocusButton extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onPressed;

  const _FocusButton({required this.label, required this.color, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        height: 60,
        width: 120,
        decoration: StarlightTheme.glassDecoration.copyWith(
          border: Border.all(color: color.withOpacity(0.3), width: 1.5),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 2, color: color),
          ),
        ),
      ),
    ).animate(onPlay: (c) => c.repeat(reverse: true))
     .shimmer(duration: 3.seconds, color: color.withOpacity(0.1));
  }
}
