import 'dart:math';
import 'package:flutter/material.dart';
import '../models/bloom.dart';
import '../models/flight_path.dart';

/// Paints the sunny meadow: sky, grass, drifting bees, flight paths, and blooms.
class MeadowPainter extends CustomPainter {
  final List<Bloom> blooms;
  final List<FlightPath> paths;
  final String? selectedId;
  final String? linkingFromId;
  final Offset? linkPreviewEnd;
  final double zoom;
  final Offset pan;

  MeadowPainter({
    required this.blooms,
    required this.paths,
    this.selectedId,
    this.linkingFromId,
    this.linkPreviewEnd,
    this.zoom = 1.0,
    this.pan = Offset.zero,
  });

  /// Convert normalized (0..1) bloom coords to screen coords.
  Offset toScreen(Bloom b, Size size) {
    final base = Offset(b.x * size.width, b.y * size.height);
    return (base - pan) * zoom + Offset(size.width / 2, size.height / 2);
  }

  @override
  void paint(Canvas canvas, Size size) {
    _paintBackground(canvas, size);
    _paintPaths(canvas, size);
    _paintLinkPreview(canvas, size);
    _paintBees(canvas, size);
    _paintBlooms(canvas, size);
  }

  void _paintBackground(Canvas canvas, Size size) {
    // Sunny sky gradient.
    final rect = Offset.zero & size;
    final sky = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [
        const Color(0xFF87CEEB),
        const Color(0xFFB8E4F0),
        const Color(0xFFE8F7C9),
      ],
    ).createShader(rect);
    canvas.drawRect(rect, Paint()..shader = sky);

    // Sun glow in the corner.
    final sun = RadialGradient(
      colors: [
        const Color(0xFFFFF3B0).withValues(alpha: 0.55),
        Colors.transparent,
      ],
    ).createShader(Rect.fromCircle(
      center: Offset(size.width * 0.88, size.height * 0.12),
      radius: size.width * 0.22,
    ));
    canvas.drawRect(rect, Paint()..shader = sun);

    // Rolling green hills.
    final hillFar = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: const [Color(0xFF9CCC65), Color(0xFF7CB342)],
      ).createShader(Rect.fromLTWH(0, size.height * 0.55, size.width, size.height * 0.45));
    canvas.drawArc(
      Rect.fromLTWH(-size.width * 0.3, size.height * 0.35, size.width * 1.6, size.height * 0.7),
      pi,
      pi,
      true,
      hillFar,
    );

    final hillNear = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: const [Color(0xFF8BC34A), Color(0xFF66BB4A)],
      ).createShader(Rect.fromLTWH(0, size.height * 0.68, size.width, size.height * 0.32));
    canvas.drawArc(
      Rect.fromLTWH(-size.width * 0.2, size.height * 0.5, size.width * 1.4, size.height * 0.6),
      pi,
      pi,
      true,
      hillNear,
    );

    // Tiny background flower dots (deterministic pseudo-random).
    final rng = Random(7);
    final dotPaint = Paint();
    for (var i = 0; i < 90; i++) {
      final x = rng.nextDouble() * size.width;
      final y = size.height * (0.6 + rng.nextDouble() * 0.4);
      final r = 0.8 + rng.nextDouble() * 1.6;
      dotPaint.color = Color.lerp(
        const Color(0xFFFFF176),
        const Color(0xFFE57373),
        rng.nextDouble(),
      )!.withValues(alpha: 0.35 + rng.nextDouble() * 0.4);
      canvas.drawCircle(Offset(x, y), r, dotPaint);
    }
  }

  void _paintPaths(Canvas canvas, Size size) {
    for (final path in paths) {
      final from = blooms.where((b) => b.id == path.fromId).firstOrNull;
      final to = blooms.where((b) => b.id == path.toId).firstOrNull;
      if (from == null || to == null) continue;

      final a = toScreen(from, size);
      final b = toScreen(to, size);

      // Dashed flight path.
      final paint = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5 + path.strength * 2.5
        ..color = Color.lerp(
          const Color(0xFF8D6E63),
          const Color(0xFFFFB300),
          path.strength,
        )!.withValues(alpha: 0.35 + path.strength * 0.4);

      // Wavy organic flight path.
      final mid = Offset((a.dx + b.dx) / 2, (a.dy + b.dy) / 2);
      final control = Offset(
        mid.dx + (b.dy - a.dy) * 0.18,
        mid.dy - (b.dx - a.dx) * 0.18,
      );
      final pathObj = Path()
        ..moveTo(a.dx, a.dy)
        ..quadraticBezierTo(control.dx, control.dy, b.dx, b.dy);
      _drawDashedPath(canvas, pathObj, paint);

      // Label at midpoint.
      final tp = TextPainter(
        text: TextSpan(
          text: path.label,
          style: TextStyle(
            color: Colors.brown.shade700,
            fontSize: 10,
            fontWeight: FontWeight.w600,
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, mid + const Offset(4, -14));
    }
  }

  void _drawDashedPath(Canvas canvas, Path path, Paint paint) {
    for (final metric in [path.computeMetrics().first]) {
      var distance = 0.0;
      const dashWidth = 8.0;
      const dashSpace = 6.0;
      while (distance < metric.length) {
        final end = min(distance + dashWidth, metric.length);
        canvas.drawPath(metric.extractPath(distance, end), paint);
        distance = end + dashSpace;
      }
    }
  }

  void _paintLinkPreview(Canvas canvas, Size size) {
    if (linkingFromId == null || linkPreviewEnd == null) return;
    final from = blooms.where((b) => b.id == linkingFromId).firstOrNull;
    if (from == null) return;

    final a = toScreen(from, size);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..color = Colors.brown.shade600.withValues(alpha: 0.7);
    canvas.drawLine(a, linkPreviewEnd!, paint);
  }

  void _paintBees(Canvas canvas, Size size) {
    // A few drifting bees (deterministic pseudo-random).
    final rng = Random(13);
    final beePaint = Paint();
    for (var i = 0; i < 8; i++) {
      final t = (DateTime.now().millisecondsSinceEpoch / 2000 + i * 0.7) % 1.0;
      final x = (rng.nextDouble() + t * 0.6) % 1.0 * size.width;
      final y = size.height * (0.25 + 0.5 * (0.5 + 0.5 * sin(t * 2 * pi + i)));
      final r = 3.0 + rng.nextDouble() * 2.0;

      // Body (yellow).
      beePaint.color = const Color(0xFFFFC107);
      canvas.drawOval(
        Rect.fromCenter(center: Offset(x, y), width: r * 2, height: r * 1.4),
        beePaint,
      );
      // Stripes (dark).
      beePaint.color = const Color(0xFF3E2723);
      canvas.drawLine(Offset(x - r * 0.3, y - r * 0.4), Offset(x - r * 0.3, y + r * 0.4), beePaint);
      canvas.drawLine(Offset(x + r * 0.2, y - r * 0.5), Offset(x + r * 0.2, y + r * 0.5), beePaint);
      // Wings.
      beePaint.color = Colors.white.withValues(alpha: 0.7);
      canvas.drawOval(
        Rect.fromCenter(center: Offset(x - r * 0.4, y - r * 0.9), width: r * 0.9, height: r * 0.55),
        beePaint,
      );
      canvas.drawOval(
        Rect.fromCenter(center: Offset(x + r * 0.4, y - r * 0.9), width: r * 0.9, height: r * 0.55),
        beePaint,
      );
    }
  }

  void _paintBlooms(Canvas canvas, Size size) {
    for (final b in blooms) {
      final pos = toScreen(b, size);
      final radius = 10.0 + b.size * 8.0;
      final isSelected = b.id == selectedId;
      final isLinking = b.id == linkingFromId;

      // Soft glow.
      final glow = RadialGradient(
        colors: [
          _nectarColor(b).withValues(alpha: 0.45),
          Colors.transparent,
        ],
      ).createShader(Rect.fromCircle(center: pos, radius: radius * 3));
      canvas.drawCircle(pos, radius * 3, Paint()..shader = glow);

      // Flower petals.
      final petalPaint = Paint()
        ..shader = RadialGradient(
          colors: [
            _nectarColor(b).withValues(alpha: 0.9),
            _nectarColor(b).withValues(alpha: 0.5),
          ],
        ).createShader(Rect.fromCircle(center: pos, radius: radius));
      for (var i = 0; i < 6; i++) {
        final angle = i * pi / 3;
        final petalCenter = Offset(
          pos.dx + cos(angle) * radius * 0.7,
          pos.dy + sin(angle) * radius * 0.7,
        );
        canvas.drawCircle(petalCenter, radius * 0.45, petalPaint);
      }

      // Flower center (yellow core).
      canvas.drawCircle(pos, radius * 0.55, Paint()..color = const Color(0xFFFFD54F));
      // Center dots.
      final dotPaint = Paint()..color = const Color(0xFF8D6E63);
      for (var i = 0; i < 5; i++) {
        final angle = i * 2 * pi / 5;
        canvas.drawCircle(
          Offset(pos.dx + cos(angle) * radius * 0.25, pos.dy + sin(angle) * radius * 0.25),
          1.2,
          dotPaint,
        );
      }

      // Stem (if enough space below).
      final stemPaint = Paint()
        ..strokeWidth = 2
        ..strokeCap = StrokeCap.round
        ..color = const Color(0xFF558B2F);
      canvas.drawLine(
        pos + Offset(0, radius * 0.5),
        pos + Offset(0, radius * 1.4),
        stemPaint,
      );

      // Selection ring.
      if (isSelected || isLinking) {
        final ring = Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.5
          ..color = Colors.white.withValues(alpha: 0.9);
        canvas.drawCircle(pos, radius + 6, ring);
      }

      // Title label.
      final tp = TextPainter(
        text: TextSpan(
          text: b.title,
          style: TextStyle(
            color: Colors.brown.shade800,
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
        textDirection: TextDirection.ltr,
        maxLines: 1,
        ellipsis: '…',
      )..layout(maxWidth: 120);
      tp.paint(canvas, pos + Offset(-tp.width / 2, radius + 16));
    }
  }

  Color _nectarColor(Bloom b) {
    // Cool/pale (low nectar) → warm/vibrant (high nectar).
    return Color.lerp(
      const Color(0xFFF8BBD0),
      const Color(0xFFFF7043),
      b.sweetness,
    )!;
  }

  @override
  bool shouldRepaint(covariant MeadowPainter old) =>
      old.blooms != blooms ||
      old.paths != paths ||
      old.selectedId != selectedId ||
      old.linkingFromId != linkingFromId ||
      old.linkPreviewEnd != linkPreviewEnd ||
      old.zoom != zoom ||
      old.pan != pan;
}