import 'dart:math';
import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:starlight/theme/starlight_theme.dart';

class CelestialBackground extends StatelessWidget {
  final Widget? child;
  final bool showHUD;
  final List<String> snippets;
  final Color accentColor;

  const CelestialBackground({
    super.key, 
    this.child, 
    this.showHUD = true,
    this.snippets = const [],
    this.accentColor = StarlightTheme.stellarBlue,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: CustomPaint(
            painter: StarfieldPainter(accentColor),
          ),
        ),
        // Ghost Stream (Code Echo) - Phase 7
        if (snippets.isNotEmpty)
          Positioned.fill(
            child: Opacity(
              opacity: 0.03,
              child: CustomPaint(
                painter: GhostStreamPainter(snippets, accentColor),
              ),
            ),
          ),
        
        // Subtle grid overlay for hacker feel
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: Alignment.center,
                radius: 1.2,
                colors: [
                  accentColor.withOpacity(0.1),
                  const Color(0xFF020205).withOpacity(0.8),
                  const Color(0xFF000000),
                ],
                stops: const [0.0, 0.6, 1.0],
              ),
            ),
          ),
        ),
        
        // Glitch Engine Overlay
        Positioned.fill(
          child: IgnorePointer(
            child: CustomPaint(
              painter: GlitchPainter(accentColor),
            ),
          ),
        ),

        // Scanlines / CRT Effect
        Positioned.fill(
          child: IgnorePointer(
            child: Container(
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: const NetworkImage('https://www.transparenttextures.com/patterns/carbon-fibre.png'),
                  repeat: ImageRepeat.repeat,
                  opacity: 0.05,
                ),
              ),
            ),
          ),
        ),

        if (showHUD) const _TelemetryHUD(),

        if (child != null) Positioned.fill(child: child!),
      ],
    );
  }
}

class _TelemetryHUD extends StatefulWidget {
  const _TelemetryHUD();

  @override
  State<_TelemetryHUD> createState() => _TelemetryHUDState();
}

class _TelemetryHUDState extends State<_TelemetryHUD> {
  String _branch = 'DETACHED';
  String _status = 'UNCERTAIN';
  String _objective = 'NONE';
  int _stackDensity = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _refreshHUD();
    _timer = Timer.periodic(const Duration(seconds: 10), (t) => _refreshHUD());
  }

  Future<void> _refreshHUD() async {
    await Future.wait([
      _fetchGitInfo(),
      _fetchTodoTask(),
      _fetchStackDensity(),
    ]);
  }

  Future<void> _fetchStackDensity() async {
    try {
      final file = File('pubspec.yaml');
      if (await file.exists()) {
        final content = await file.readAsString();
        final depIndex = content.indexOf('dependencies:');
        final devDepIndex = content.indexOf('dev_dependencies:');
        
        if (depIndex != -1) {
          final depsSection = content.substring(depIndex, devDepIndex != -1 ? devDepIndex : content.length);
          final count = depsSection.split('\n').where((l) => l.trim().startsWith(RegExp(r'[a-z]')) && !l.trim().startsWith('dependencies')).length;
          if (mounted) {
            setState(() {
              _stackDensity = count;
            });
          }
        }
      }
    } catch (e) {
      // Silent fail
    }
  }

  Future<void> _fetchGitInfo() async {
    try {
      final bResult = await Process.run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
      final sResult = await Process.run('git', ['status', '--porcelain']);
      
      if (mounted) {
        setState(() {
          _branch = bResult.stdout.toString().trim().toUpperCase();
          _status = sResult.stdout.toString().isEmpty ? 'CLEAN' : 'DIRTY';
        });
      }
    } catch (e) {
      // Not a git repo or git not found
    }
  }

  Future<void> _fetchTodoTask() async {
    try {
      final file = File('TODO.md');
      if (await file.exists()) {
        final lines = await file.readAsLines();
        final todo = lines.firstWhere(
          (l) => l.trim().startsWith('- [ ]'),
          orElse: () => 'NONE_PENDING',
        );
        if (mounted) {
          setState(() {
            _objective = todo.replaceFirst('- [ ]', '').trim().toUpperCase();
            if (_objective.length > 20) _objective = '${_objective.substring(0, 17)}...';
          });
        }
      }
    } catch (e) {
      // Silent fail
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
             _HudItem(label: 'CORE_TEMP', value: '42.8°C'),
             _HudItem(label: 'GIT_BRANCH', value: _branch),
             _HudItem(label: 'REPO_STATUS', value: _status),
             _HudItem(label: 'ACTIVE_OBJECTIVE', value: _objective),
             _HudItem(label: 'STACK_DENSITY', value: '$_stackDensity^D'),
             const Spacer(),
             Row(
               mainAxisAlignment: MainAxisAlignment.spaceBetween,
               children: [
                 _HudItem(label: 'X_COORD', value: '0xA45'),
                 _HudItem(label: 'Y_COORD', value: '0x1F2'),
               ],
             ),
          ],
        ),
      ),
    );
  }
}

class _HudItem extends StatelessWidget {
  final String label;
  final String value;
  const _HudItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(label, style: GoogleFonts.firaCode(fontSize: 8, color: Colors.white24, fontWeight: FontWeight.bold)),
          Text(value, style: GoogleFonts.firaCode(fontSize: 10, color: StarlightTheme.stellarBlue, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}

class GhostStreamPainter extends CustomPainter {
  final List<String> snippets;
  final Color accentColor;
  final Random random = Random();
  GhostStreamPainter(this.snippets, this.accentColor);

  @override
  void paint(Canvas canvas, Size size) {
    if (snippets.isEmpty) return;
    final textStyle = TextStyle(color: accentColor.withOpacity(0.5), fontSize: 8, fontWeight: FontWeight.bold);
    
    for (int i = 0; i < 20; i++) {
      final x = random.nextDouble() * size.width;
      final snippet = snippets[random.nextInt(snippets.length)];
      final text = snippet.length > 50 ? snippet.substring(0, 50) : snippet;
      
      final textPainter = TextPainter(
        text: TextSpan(text: text, style: textStyle),
        textDirection: TextDirection.ltr,
      )..layout();
      
      canvas.save();
      canvas.translate(x, random.nextDouble() * size.height);
      canvas.rotate(pi / 2); // Vertical scrolling feel
      textPainter.paint(canvas, Offset.zero);
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class GlitchPainter extends CustomPainter {
  final Color accentColor;
  final Random random = Random();
  GlitchPainter(this.accentColor);

  @override
  void paint(Canvas canvas, Size size) {
    if (random.nextDouble() > 0.92) { // 8% chance to glitch per frame
      final paint = Paint()..color = accentColor.withOpacity(0.1);
      
      for (int i = 0; i < 5; i++) {
        final rect = Rect.fromLTWH(
          0, 
          random.nextDouble() * size.height, 
          size.width, 
          random.nextDouble() * 2,
        );
        
        // Chromatic split feel using branch color
        final color = random.nextBool() ? Colors.white.withOpacity(0.1) : accentColor.withOpacity(0.1);
        paint.color = color;
        canvas.drawRect(rect.shift(Offset(random.nextDouble() * 4 - 2, 0)), paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class StarfieldPainter extends CustomPainter {
  final Color accentColor;
  final List<Star> stars = List.generate(200, (index) => Star());
  StarfieldPainter(this.accentColor);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white;
    final random = Random(42);

    for (var star in stars) {
      final x = random.nextDouble() * size.width;
      final y = random.nextDouble() * size.height;
      final radius = random.nextDouble() * 1.5;
      final opacity = random.nextDouble() * 0.7 + 0.3;

      paint.color = Colors.white.withOpacity(opacity);
      canvas.drawCircle(Offset(x, y), radius, paint);

      // Add a faint glow using branch color
      if (random.nextDouble() > 0.95) {
        final glowPaint = Paint()
          ..color = accentColor.withOpacity(0.1)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4);
        canvas.drawCircle(Offset(x, y), radius * 3, glowPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class Star {
  final Color color;
  Star() : color = _randomStarColor();

  static Color _randomStarColor() {
    final colors = [
      const Color(0xFF00E5FF),
      const Color(0xFFFF00D4),
      const Color(0xFFFFFFFF),
      const Color(0xFFFFFACD),
    ];
    return colors[Random().nextInt(colors.length)];
  }
}
