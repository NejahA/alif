import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:starlight/providers/star_provider.dart';
import 'package:starlight/providers/achievement_provider.dart';
import 'package:starlight/theme/starlight_theme.dart';
import 'package:starlight/widgets/celestial_background.dart';
import 'package:starlight/widgets/stellar_shell.dart';
import 'package:starlight/widgets/pulse_server.dart';
import 'package:starlight/views/history_view.dart';

class HomeView extends ConsumerStatefulWidget {
  const HomeView({super.key});

  @override
  ConsumerState<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends ConsumerState<HomeView> {
  LocalPulseServer? _server;

  @override
  void initState() {
    super.initState();
    _startServer();
  }

  Future<void> _startServer() async {
    _server = LocalPulseServer(ref);
    await _server!.start();
  }

  @override
  void dispose() {
    _server?.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final starState = ref.watch(starProvider);
    final achState  = ref.watch(achievementProvider);
    final notifier  = ref.read(starProvider.notifier);

    // Achievement unlock overlay trigger
    ref.listen<AchievementState>(achievementProvider, (prev, next) {
      if (next.newlyUnlocked != null && next.newlyUnlocked != prev?.newlyUnlocked) {
        final a = next.achievements.firstWhere((a) => a.id == next.newlyUnlocked);
        showDialog(
          context: context,
          barrierColor: Colors.black87,
          builder: (_) => _AchievementOverlay(achievement: a),
        ).then((_) => ref.read(achievementProvider.notifier).clearNewlyUnlocked());
      }
    });

    return Scaffold(
      body: TweenAnimationBuilder<Color?>(
        duration: const Duration(seconds: 2), // Celestial Bloom - Phase 9
        tween: ColorTween(begin: starState.branchColor, end: starState.branchColor),
        builder: (context, color, child) {
          return CelestialBackground(
            accentColor: color ?? StarlightTheme.stellarBlue,
            snippets: starState.capturedSnippets,
            child: child!,
          );
        },
        child: Stack(
          children: [
            SafeArea(
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
            
            // Stellar Shell CLI (Phase 3)
            Positioned(
              left: 20,
              bottom: 20,
              child: const StellarShell().animate().fade().slideX(begin: -0.2, end: 0),
            ),

            // Daily Streak Badge (Phase 10)
            if (achState.currentStreak > 0)
              Positioned(
                top: 20,
                left: 20,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: StarlightTheme.glassDecoration,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('🔥 ', style: TextStyle(fontSize: 14)),
                      Text('${achState.currentStreak}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orangeAccent)),
                    ],
                  ),
                ).animate(onPlay: (c) => c.repeat(reverse: true)).scale(begin: const Offset(1,1), end: const Offset(1.05, 1.05), duration: 2.seconds),
              ),

              left: 20,
              bottom: 20,
              child: const StellarShell().animate().fade().slideX(begin: -0.2, end: 0),
            ),

            if (starState.phase == StarPhase.briefing)
              _BriefingOverlay(
                onStart: (intent) => notifier.startFocus(intent),
                onCancel: () => notifier.reset(),
              ),
          ],
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
          Builder(
            builder: (context) => IconButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const HistoryView()),
                );
              },
              icon: const Icon(Icons.auto_awesome_mosaic, color: Colors.white70),
            ),
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
          _StarGraphic(
            color: state.currentColor, 
            hasRings: state.hasRings,
            isPulsing: state.isPulsing,
            species: state.species,
          ),
          const SizedBox(height: 40),
          if (state.currentIntent != null)
             Text(
               state.currentIntent!.toUpperCase(),
               style: const TextStyle(fontSize: 10, letterSpacing: 3, fontWeight: FontWeight.bold, color: Colors.white60),
             ).animate().fade().slideY(begin: 0.2, end: 0),
          const SizedBox(height: 10),
          _formatDuration(state.timeLeft)
              .animate(target: (state.phase == StarPhase.growth || state.phase == StarPhase.birth) ? 1 : 0)
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
        child: (state.phase == StarPhase.idle || state.phase == StarPhase.rest)
            ? _buildStartButtons(context, notifier)
            : _buildActiveControls(context, state, notifier),
      ),
    );
  }

  Widget _buildStartButtons(BuildContext context, StarNotifier notifier) {
    return Column(
      children: [
        const Text(
          'SELECT_NEURAL_DURATION',
          style: TextStyle(fontSize: 9, letterSpacing: 2, fontWeight: FontWeight.bold, color: Colors.white24),
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _FocusButton(
              label: '25_MIN',
              color: StarlightTheme.stellarBlue,
              onPressed: () => notifier.openBriefing(const Duration(minutes: 25)),
            ),
            const SizedBox(width: 20),
            _FocusButton(
              label: '50_MIN',
              color: StarlightTheme.nebulaPink,
              onPressed: () => notifier.openBriefing(const Duration(minutes: 50)),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActiveControls(BuildContext context, StarState state, StarNotifier notifier) {
    if (state.phase == StarPhase.rest || state.phase == StarPhase.briefing) return const SizedBox.shrink();

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              state.phase.name.toUpperCase(),
              style: const TextStyle(fontSize: 12, letterSpacing: 4, fontWeight: FontWeight.bold, color: Colors.white38),
            ),
            if (state.capturedSnippets.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(left: 12),
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: StarlightTheme.stellarBlue.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  '${state.capturedSnippets.length}_SNIPPETS',
                  style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: StarlightTheme.stellarBlue),
                ),
              ).animate().fade().scale(),
          ],
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            GestureDetector(
              onTap: () {
                notifier.captureSnippet();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('NEURAL_SNIPPET_CAPTURED'), duration: Duration(seconds: 1)),
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: StarlightTheme.glassDecoration.copyWith(
                  border: Border.all(color: StarlightTheme.stellarBlue.withOpacity(0.3)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.copy_all, size: 14, color: StarlightTheme.stellarBlue),
                    SizedBox(width: 8),
                    Text('CAPTURE_SNIPPET', style: TextStyle(fontSize: 10, letterSpacing: 1, fontWeight: FontWeight.bold, color: Colors.white70)),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 16),
            GestureDetector(
              onLongPress: () {
                notifier.reset();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('MISSION_ABORTED'), duration: Duration(seconds: 1)),
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: StarlightTheme.glassDecoration,
                child: const Text('HOLD_TO_ABORT', style: TextStyle(fontSize: 10, letterSpacing: 2, fontWeight: FontWeight.bold, color: Colors.redAccent)),
              ),
            ),
          ],
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

class _BriefingOverlay extends StatefulWidget {
  final Function(String) onStart;
  final VoidCallback onCancel;

  const _BriefingOverlay({required this.onStart, required this.onCancel});

  @override
  State<_BriefingOverlay> createState() => _BriefingOverlayState();
}

class _BriefingOverlayState extends State<_BriefingOverlay> {
  final TextEditingController _controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.9),
      child: Center(
        child: Container(
          width: 320,
          padding: const EdgeInsets.all(32),
          decoration: StarlightTheme.glassDecoration.copyWith(
            color: Colors.white.withOpacity(0.05),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'NEURAL_OBJECTIVE',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 3, color: Colors.white),
              ),
              const SizedBox(height: 8),
              const Text(
                'DEFINE_YOUR_MISSION_INTENT',
                style: TextStyle(fontSize: 9, letterSpacing: 1, color: Colors.white38),
              ),
              const SizedBox(height: 32),
              TextField(
                controller: _controller,
                autofocus: true,
                style: const TextStyle(color: StarlightTheme.stellarBlue, fontWeight: FontWeight.bold, letterSpacing: 1),
                decoration: InputDecoration(
                  hintText: 'coding_the_future...',
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.1)),
                  enabledBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Colors.white12)),
                  focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: StarlightTheme.stellarBlue)),
                ),
              ),
              const SizedBox(height: 48),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: widget.onCancel,
                    child: const Text('CANCEL', style: TextStyle(color: Colors.white38, fontSize: 10, letterSpacing: 2)),
                  ),
                  _FocusButton(
                    label: 'ENGAGE',
                    color: StarlightTheme.stellarBlue,
                    onPressed: () {
                      if (_controller.text.isNotEmpty) {
                        widget.onStart(_controller.text);
                      }
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ).animate().fade().scale(begin: const Offset(0.9, 0.9), curve: Curves.easeOutCubic),
    );
  }
}

class _StarGraphic extends StatelessWidget {
  final Color color;
  final bool hasRings;
  final bool isPulsing;
  final StarSpecies species;

  const _StarGraphic({
    required this.color, 
    this.hasRings = false,
    this.isPulsing = false,
    this.species = StarSpecies.standard,
  });

  @override
  Widget build(BuildContext context) {
    if (species == StarSpecies.binary) {
      return _buildBinaryStar();
    } else if (species == StarSpecies.neutron) {
      return _buildNeutronStar();
    }
    
    return _buildStandardStar();
  }

  Widget _buildStandardStar() {
    return Stack(
      alignment: Alignment.center,
      children: [
        if (isPulsing) _buildPulseWave(),
        _buildCore(80),
        if (hasRings) _buildRings(),
      ],
    ).animate().shimmer(duration: 3.seconds, color: Colors.white24);
  }

  Widget _buildBinaryStar() {
    return Stack(
      alignment: Alignment.center,
      children: [
        if (isPulsing) _buildPulseWave(),
        // Two stars orbiting
        _buildCore(40).animate(onPlay: (c) => c.repeat()).move(begin: const Offset(-30, 0), end: const Offset(30, 0), duration: 2.seconds, curve: Curves.easeInOutSine).then().move(begin: const Offset(30, 0), end: const Offset(-30, 0), duration: 2.seconds, curve: Curves.easeInOutSine),
        _buildCore(40).animate(onPlay: (c) => c.repeat()).move(begin: const Offset(30, 0), end: const Offset(-30, 0), duration: 2.seconds, curve: Curves.easeInOutSine).then().move(begin: const Offset(-30, 0), end: const Offset(30, 0), duration: 2.seconds, curve: Curves.easeInOutSine),
        if (hasRings) _buildRings(),
      ],
    );
  }

  Widget _buildNeutronStar() {
    return Stack(
      alignment: Alignment.center,
      children: [
        if (isPulsing) _buildPulseWave(),
        // Intense core with horizontal rays
        _buildCore(60),
        ...List.generate(4, (i) => Container(
          width: 200,
          height: 1,
          color: color.withOpacity(0.3),
        ).animate(onPlay: (c) => c.repeat()).scale(duration: 100.ms, begin: const Offset(0.8, 1), end: const Offset(1.2, 1))),
        if (hasRings) _buildRings(),
      ],
    );
  }

  Widget _buildCore(double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.5),
            blurRadius: size / 2,
            spreadRadius: size / 4,
          ),
        ],
        gradient: RadialGradient(
          colors: [
            Colors.white,
            color.withOpacity(0.8),
            color.withOpacity(0.2),
          ],
        ),
      ),
    );
  }

  Widget _buildPulseWave() {
    return Container(
      width: 120,
      height: 120,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: color.withOpacity(0.5), width: 2),
      ),
    ).animate(onPlay: (controller) => controller.repeat())
     .scale(begin: const Offset(1, 1), end: const Offset(2.5, 2.5), duration: 2.seconds, curve: Curves.easeOut)
     .fade(begin: 0.5, end: 0, duration: 2.seconds);
  }

  Widget _buildRings() {
    return Container(
      width: 140,
      height: 40,
      decoration: BoxDecoration(
        border: Border.all(color: color.withOpacity(0.2), width: 2),
        borderRadius: const BorderRadius.all(Radius.elliptical(140, 40)),
      ),
    ).animate(onPlay: (controller) => controller.repeat())
     .rotate(duration: 10.seconds);
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
        height: 50,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        decoration: StarlightTheme.glassDecoration.copyWith(
          border: Border.all(color: color.withOpacity(0.3), width: 1.5),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2, color: color),
          ),
        ),
      ),
    ).animate(onPlay: (c) => c.repeat(reverse: true))
     .shimmer(duration: 3.seconds, color: color.withOpacity(0.1));
  }
}

class _AchievementOverlay extends StatelessWidget {
  final Achievement achievement;
  
  const _AchievementOverlay({required this.achievement});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 320,
        padding: const EdgeInsets.all(24),
        decoration: StarlightTheme.glassDecoration.copyWith(
          border: Border.all(color: Colors.amberAccent.withOpacity(0.5), width: 2),
          color: Colors.black87,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(achievement.emoji, style: const TextStyle(fontSize: 64)),
            const SizedBox(height: 16),
            const Text('ACHIEVEMENT UNLOCKED', style: TextStyle(fontSize: 10, color: Colors.amberAccent, letterSpacing: 2, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(achievement.title, style: const TextStyle(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(achievement.description, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, color: Colors.white70)),
            const SizedBox(height: 24),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('ACKNOWLEDGE', style: TextStyle(color: Colors.amberAccent, letterSpacing: 1)),
            ),
          ],
        ),
      ).animate().scale(begin: const Offset(0.8, 0.8), curve: Curves.elasticOut, duration: 800.ms).fadeIn(),
    );
  }
}
