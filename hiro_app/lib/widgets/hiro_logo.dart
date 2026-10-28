import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../theme/hiro_theme.dart';

enum HiroLogoSize {
  compact, // AppBar (height ~38)
  medium,  // Dialogs / Sheets (height ~56)
  large,   // Hero / About Screen (height ~110)
}

/// Official brand logo widget for hi§ro
///
/// Features:
/// - Symmetrical neuroplasticity brain tree & synaptic double-helix (§)
/// - Bioluminescent breathing glow & pulse ring
/// - Custom typography with cyan -> violet gradient
/// - Flexible sizes & display variants
class HiroLogo extends StatefulWidget {
  final HiroLogoSize size;
  final bool showText;
  final bool showTagline;
  final VoidCallback? onTap;

  const HiroLogo({
    super.key,
    this.size = HiroLogoSize.compact,
    this.showText = true,
    this.showTagline = false,
    this.onTap,
  });

  @override
  State<HiroLogo> createState() => _HiroLogoState();
}

class _HiroLogoState extends State<HiroLogo> with SingleTickerProviderStateMixin {
  late final AnimationController _animController;
  late final Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2800),
    )..repeat(reverse: true);

    _pulseAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  double get _badgeSize {
    switch (widget.size) {
      case HiroLogoSize.compact:
        return 34.0;
      case HiroLogoSize.medium:
        return 48.0;
      case HiroLogoSize.large:
        return 96.0;
    }
  }

  double get _fontSize {
    switch (widget.size) {
      case HiroLogoSize.compact:
        return 19.0;
      case HiroLogoSize.medium:
        return 26.0;
      case HiroLogoSize.large:
        return 44.0;
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget emblem = AnimatedBuilder(
      animation: _pulseAnimation,
      builder: (context, child) {
        final glowOpacity = 0.25 + (_pulseAnimation.value * 0.45);
        final glowSpread = 2.0 + (_pulseAnimation.value * 4.0);

        return Container(
          width: _badgeSize,
          height: _badgeSize,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(_badgeSize * 0.26),
            boxShadow: [
              BoxShadow(
                color: HiroColors.neonCyan.withOpacity(glowOpacity * 0.7),
                blurRadius: 10 + glowSpread,
                spreadRadius: 1,
              ),
              BoxShadow(
                color: HiroColors.astralViolet.withOpacity(glowOpacity * 0.6),
                blurRadius: 14 + glowSpread,
                spreadRadius: 0,
              ),
            ],
            border: Border.all(
              color: Color.lerp(
                HiroColors.neonCyan.withOpacity(0.5),
                HiroColors.astralViolet.withOpacity(0.5),
                _pulseAnimation.value,
              )!,
              width: 1.5,
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(_badgeSize * 0.24),
            child: Stack(
              fit: StackFit.expand,
              children: [
                // High-res logo asset
                Image.asset(
                  'assets/images/hiro_logo.jpg',
                  fit: BoxFit.cover,
                  errorBuilder: (ctx, err, stack) {
                    // Fallback procedural painter if asset is loading
                    return CustomPaint(
                      painter: _HiroProceduralPainter(pulse: _pulseAnimation.value),
                    );
                  },
                ),
                // Subtle bio-luminescent overlay sweep
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.white.withOpacity(0.12 * _pulseAnimation.value),
                        Colors.transparent,
                        HiroColors.astralViolet.withOpacity(0.08),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );

    if (!widget.showText) {
      return GestureDetector(
        onTap: widget.onTap,
        child: emblem,
      );
    }

    // Typography Group
    final textGroup = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [
              HiroColors.electricTeal,
              HiroColors.neonCyan,
              HiroColors.mysticOrchid,
              HiroColors.astralViolet,
              HiroColors.hotPink,
            ],
            stops: [0.0, 0.35, 0.50, 0.65, 1.0],
          ).createShader(bounds),
          child: Text(
            'hi§ro',
            style: GoogleFonts.outfit(
              fontSize: _fontSize,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
              color: Colors.white,
            ),
          ),
        ),
        if (widget.showTagline)
          Text(
            'NEUROPLASTICITY & GROWTH',
            style: GoogleFonts.outfit(
              fontSize: math.max(7.5, _fontSize * 0.36),
              fontWeight: FontWeight.w600,
              letterSpacing: 1.5,
              color: HiroColors.textSecondary,
            ),
          ),
      ],
    );

    return InkWell(
      onTap: widget.onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            emblem,
            const SizedBox(width: 10),
            textGroup,
          ],
        ),
      ),
    );
  }
}

/// Fallback custom vector painter representing the neuroplastic arbor & double helix
class _HiroProceduralPainter extends CustomPainter {
  final double pulse;

  _HiroProceduralPainter({required this.pulse});

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final center = Offset(w / 2, h / 2);

    // Dark background
    final bgPaint = Paint()..color = const Color(0xFF070814);
    canvas.drawRect(Rect.fromLTWH(0, 0, w, h), bgPaint);

    // Left hemisphere arc
    final leftPaint = Paint()
      ..color = HiroColors.neonCyan
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final leftPath = Path()
      ..moveTo(center.dx - 2, h * 0.7)
      ..cubicTo(center.dx - w * 0.35, h * 0.6, center.dx - w * 0.35, h * 0.25, center.dx - 2, h * 0.25);
    canvas.drawPath(leftPath, leftPaint);

    // Right hemisphere arc
    final rightPaint = Paint()
      ..color = HiroColors.astralViolet
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final rightPath = Path()
      ..moveTo(center.dx + 2, h * 0.7)
      ..cubicTo(center.dx + w * 0.35, h * 0.6, center.dx + w * 0.35, h * 0.25, center.dx + 2, h * 0.25);
    canvas.drawPath(rightPath, rightPaint);

    // Center helix section spark
    final sparkPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, 2.5 + (pulse * 1.5), sparkPaint);
  }

  @override
  bool shouldRepaint(covariant _HiroProceduralPainter oldDelegate) => oldDelegate.pulse != pulse;
}
