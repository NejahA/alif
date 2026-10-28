import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import '../services/jungle_state.dart';
import '../theme/jungle_theme.dart';

class BreathTechnique {
  final String name;
  final String subtitle;
  final int inhaleSeconds;
  final int holdSeconds;
  final int exhaleSeconds;
  final int restSeconds;

  const BreathTechnique({
    required this.name,
    required this.subtitle,
    required this.inhaleSeconds,
    required this.holdSeconds,
    required this.exhaleSeconds,
    required this.restSeconds,
  });

  int get totalCycleSeconds => inhaleSeconds + holdSeconds + exhaleSeconds + restSeconds;
}

class AltarScreen extends StatefulWidget {
  final JungleState state;

  const AltarScreen({
    super.key,
    required this.state,
  });

  @override
  State<AltarScreen> createState() => _AltarScreenState();
}

class _AltarScreenState extends State<AltarScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  Timer? _sessionTimer;
  Timer? _tickTimer;

  final List<BreathTechnique> _techniques = const [
    BreathTechnique(
      name: 'Deep Sanctuary',
      subtitle: '4-7-8 Nervous System Reset',
      inhaleSeconds: 4,
      holdSeconds: 7,
      exhaleSeconds: 8,
      restSeconds: 1,
    ),
    BreathTechnique(
      name: 'Sentinel Box',
      subtitle: '4-4-4-4 High Focus Alertness',
      inhaleSeconds: 4,
      holdSeconds: 4,
      exhaleSeconds: 4,
      restSeconds: 4,
    ),
    BreathTechnique(
      name: 'Coherent Prana',
      subtitle: '5-5 Heart & Vagus Resonance',
      inhaleSeconds: 5,
      holdSeconds: 0,
      exhaleSeconds: 5,
      restSeconds: 0,
    ),
  ];

  int _selectedTechniqueIndex = 0;
  bool _isActive = false;
  int _secondsRemaining = 180; // 3 minutes session
  int _cycleElapsed = 0;

  BreathTechnique get currentTechnique => _techniques[_selectedTechniqueIndex];

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: Duration(seconds: currentTechnique.totalCycleSeconds),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    _sessionTimer?.cancel();
    _tickTimer?.cancel();
    super.dispose();
  }

  void _startSession() {
    setState(() {
      _isActive = true;
      _secondsRemaining = 180;
      _cycleElapsed = 0;
    });

    widget.state.triggerBowlChime();
    _animController.duration = Duration(seconds: currentTechnique.totalCycleSeconds);
    _animController.repeat();

    _tickTimer?.cancel();
    _tickTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_isActive) return;

      setState(() {
        if (_secondsRemaining > 0) {
          _secondsRemaining--;
          _cycleElapsed = (_cycleElapsed + 1) % currentTechnique.totalCycleSeconds;

          // Chime on cycle start
          if (_cycleElapsed == 0) {
            widget.state.triggerBowlChime();
          }
        } else {
          _endSession();
        }
      });
    });
  }

  void _pauseSession() {
    setState(() {
      _isActive = false;
    });
    _animController.stop();
    _tickTimer?.cancel();
  }

  void _endSession() {
    _pauseSession();
    widget.state.completeBreathworkSession(3);

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: JungleColors.deepCanopy,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: const BorderSide(color: JungleColors.emerald, width: 1.5),
          ),
          title: Row(
            children: const [
              Icon(Icons.spa_rounded, color: JungleColors.neonJade, size: 28),
              SizedBox(width: 10),
              Text(
                'Altar Harmony Achieved',
                style: TextStyle(
                  color: JungleColors.textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text(
                'Your sacred breath cycle has resonated through the canopy. The Sacred Ceiba Tree has absorbed your tranquil energy.',
                style: TextStyle(color: JungleColors.textSecondary, height: 1.5),
              ),
              SizedBox(height: 14),
              Text(
                '+90 Vitality XP Earned • Daily Quest Completed',
                style: TextStyle(
                  color: JungleColors.sunAmber,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: JungleColors.emerald,
                foregroundColor: JungleColors.abyss,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Return to Sanctuary'),
            ),
          ],
        );
      },
    );
  }

  String _getCurrentPhaseText() {
    if (!_isActive) return 'Rest at the Altar';

    final t = currentTechnique;
    int cur = _cycleElapsed;

    if (cur < t.inhaleSeconds) {
      return 'Breathe In Deeply...';
    }
    cur -= t.inhaleSeconds;

    if (t.holdSeconds > 0 && cur < t.holdSeconds) {
      return 'Hold Sacred Calm...';
    }
    cur -= t.holdSeconds;

    if (cur < t.exhaleSeconds) {
      return 'Release Slowly...';
    }

    return 'Rest in Stillness...';
  }

  Color _getCurrentPhaseColor() {
    if (!_isActive) return JungleColors.textSubtle;
    final t = currentTechnique;
    int cur = _cycleElapsed;

    if (cur < t.inhaleSeconds) return JungleColors.neonJade;
    cur -= t.inhaleSeconds;
    if (t.holdSeconds > 0 && cur < t.holdSeconds) return JungleColors.sunAmber;
    cur -= t.holdSeconds;
    if (cur < t.exhaleSeconds) return JungleColors.azureLagoon;
    return JungleColors.mysticOrchid;
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      children: [
        // Title Banner
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: JungleColors.deepCanopy,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: JungleColors.foliageBorder),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: JungleColors.emerald.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.self_improvement_rounded,
                  color: JungleColors.neonJade,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'MAYAN FOCUS ALTAR',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.0,
                        color: JungleColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Mindful breathwork & biophilic coherence',
                      style: TextStyle(
                        fontSize: 12,
                        color: JungleColors.textSecondary.withOpacity(0.85),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: JungleColors.foliageSurface,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${widget.state.totalMeditationMinutes}m Logged',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: JungleColors.sunAmber,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Concentric Stone Altar Custom Painter
        Center(
          child: SizedBox(
            width: 280,
            height: 280,
            child: AnimatedBuilder(
              animation: _animController,
              builder: (context, _) {
                return CustomPaint(
                  painter: _MayanAltarPainter(
                    animValue: _animController.value,
                    isActive: _isActive,
                    phaseColor: _getCurrentPhaseColor(),
                    cycleProgress: _isActive
                        ? (_cycleElapsed / currentTechnique.totalCycleSeconds)
                        : 0.0,
                  ),
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _getCurrentPhaseText(),
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: _getCurrentPhaseColor(),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${(_secondsRemaining ~/ 60).toString().padLeft(2, '0')}:${(_secondsRemaining % 60).toString().padLeft(2, '0')}',
                          style: const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            color: JungleColors.textPrimary,
                            letterSpacing: 2,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
        const SizedBox(height: 28),

        // Action Buttons
        Center(
          child: ElevatedButton.icon(
            onPressed: () {
              if (_isActive) {
                _pauseSession();
              } else {
                _startSession();
              }
            },
            icon: Icon(_isActive ? Icons.pause_rounded : Icons.play_arrow_rounded, size: 24),
            label: Text(_isActive ? 'Pause Meditation' : 'Commence 3m Sanctuary Cycle'),
            style: ElevatedButton.styleFrom(
              backgroundColor: JungleColors.emerald,
              foregroundColor: JungleColors.abyss,
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
              elevation: 0,
            ),
          ),
        ),
        const SizedBox(height: 28),

        // Technique Selector
        Row(
          children: const [
            Icon(Icons.tune_rounded, size: 16, color: JungleColors.neonJade),
            SizedBox(width: 6),
            Text(
              'PRANA BREATH PATTERNS',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
                color: JungleColors.textMuted,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _techniques.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (context, index) {
            final t = _techniques[index];
            final isSelected = _selectedTechniqueIndex == index;

            return Container(
              decoration: BoxDecoration(
                color: JungleColors.deepCanopy,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: isSelected ? JungleColors.emerald : JungleColors.foliageBorder,
                  width: isSelected ? 1.5 : 1.0,
                ),
              ),
              child: ListTile(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                onTap: () {
                  if (!_isActive) {
                    setState(() {
                      _selectedTechniqueIndex = index;
                    });
                  }
                },
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? JungleColors.emerald.withOpacity(0.2)
                        : JungleColors.understory,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.air_rounded,
                    color: isSelected ? JungleColors.neonJade : JungleColors.textSubtle,
                    size: 20,
                  ),
                ),
                title: Text(
                  t.name,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: isSelected ? JungleColors.textPrimary : JungleColors.textSecondary,
                  ),
                ),
                subtitle: Text(
                  t.subtitle,
                  style: const TextStyle(fontSize: 12, color: JungleColors.textSecondary),
                ),
                trailing: isSelected
                    ? const Icon(Icons.check_circle_rounded, color: JungleColors.neonJade)
                    : null,
              ),
            );
          },
        ),
      ],
    );
  }
}

class _MayanAltarPainter extends CustomPainter {
  final double animValue;
  final bool isActive;
  final Color phaseColor;
  final double cycleProgress;

  _MayanAltarPainter({
    required this.animValue,
    required this.isActive,
    required this.phaseColor,
    required this.cycleProgress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxR = size.width / 2 - 12;

    // Outer Mayan Stone Glyph Ring
    final stonePaint = Paint()
      ..color = JungleColors.foliageBorder.withOpacity(0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    canvas.drawCircle(center, maxR, stonePaint);
    canvas.drawCircle(center, maxR - 18, stonePaint);

    // Stone notch markings
    final notchPaint = Paint()
      ..color = JungleColors.neonJade.withOpacity(0.3)
      ..strokeWidth = 2.0;

    for (int i = 0; i < 24; i++) {
      final angle = (i / 24) * 2 * pi;
      final p1 = Offset(center.dx + (maxR - 16) * cos(angle), center.dy + (maxR - 16) * sin(angle));
      final p2 = Offset(center.dx + (maxR - 2) * cos(angle), center.dy + (maxR - 2) * sin(angle));
      canvas.drawLine(p1, p2, notchPaint);
    }

    // Dynamic Pulsing Bioluminescent Breathing Sphere
    double expansion = 0.5;
    if (isActive) {
      // Sine breathing wave
      expansion = 0.35 + 0.55 * (0.5 + 0.5 * sin(animValue * 2 * pi - pi / 2));
    }

    final dynamicR = (maxR - 35) * expansion;

    // Outer glow
    final glowPaint = Paint()
      ..color = phaseColor.withOpacity(isActive ? 0.25 : 0.08)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, dynamicR + 14, glowPaint);

    // Core sphere
    final corePaint = Paint()
      ..shader = RadialGradient(
        colors: [
          phaseColor.withOpacity(isActive ? 0.9 : 0.3),
          phaseColor.withOpacity(isActive ? 0.2 : 0.05),
        ],
      ).createShader(Rect.fromCircle(center: center, radius: dynamicR));
    canvas.drawCircle(center, dynamicR, corePaint);

    // Progress arc around stone ring
    if (isActive) {
      final progressPaint = Paint()
        ..color = phaseColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = 4.0
        ..strokeCap = StrokeCap.round;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: maxR + 4),
        -pi / 2,
        cycleProgress * 2 * pi,
        false,
        progressPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _MayanAltarPainter oldDelegate) => true;
}
