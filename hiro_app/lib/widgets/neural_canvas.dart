import 'dart:math';
import 'package:flutter/material.dart';

import '../models/synapse_model.dart';
import '../services/garden_service.dart';
import '../theme/hiro_theme.dart';

class NeuralCanvas extends StatefulWidget {
  final GardenService service;
  final Function(SynapseModel) onSelectSynapse;
  final VoidCallback onOpenTemplateSelector;

  const NeuralCanvas({
    super.key,
    required this.service,
    required this.onSelectSynapse,
    required this.onOpenTemplateSelector,
  });

  @override
  State<NeuralCanvas> createState() => _NeuralCanvasState();
}

class _NeuralCanvasState extends State<NeuralCanvas> {
  final TransformationController _transformController = TransformationController();
  SynapseModel? _draggedSynapse;
  Offset? _currentHoverWorldPos;

  @override
  void initState() {
    super.initState();
    // Center initial view slightly
    _transformController.value = Matrix4.identity()..setTranslationRaw(20.0, 20.0, 0.0);
  }

  Offset _screenToWorld(Offset screenPos) {
    final inverted = Matrix4.inverted(_transformController.value);
    return MatrixUtils.transformPoint(inverted, screenPos);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onDoubleTapDown: (details) {
        final worldPos = _screenToWorld(details.localPosition);
        widget.service.sproutSynapse(worldPos.dx, worldPos.dy);
      },
      child: InteractiveViewer(
        transformationController: _transformController,
        boundaryMargin: const EdgeInsets.all(2000),
        minScale: 0.25,
        maxScale: 3.0,
        panEnabled: _draggedSynapse == null && !widget.service.isConnectMode,
        scaleEnabled: _draggedSynapse == null,
        child: Listener(
          onPointerDown: (event) {
            final worldPos = _screenToWorld(event.localPosition);
            final hit = _findSynapseAt(worldPos);

            if (widget.service.isConnectMode) {
              if (hit != null) {
                widget.service.handleConnectClick(hit.id);
                setState(() {
                  _currentHoverWorldPos = null;
                });
              }
              return;
            }

            if (hit != null) {
              _draggedSynapse = hit;
              widget.service.selectSynapse(hit);
              widget.onSelectSynapse(hit);
            } else {
              widget.service.selectSynapse(null);
            }
          },
          onPointerMove: (event) {
            final worldPos = _screenToWorld(event.localPosition);
            if (widget.service.isConnectMode) {
              setState(() {
                _currentHoverWorldPos = worldPos;
              });
              return;
            }

            if (_draggedSynapse != null) {
              widget.service.moveSynapse(_draggedSynapse!.id, worldPos.dx, worldPos.dy);
            }
          },
          onPointerUp: (_) {
            if (_draggedSynapse != null) {
              _draggedSynapse = null;
              widget.service.endMoveSynapse();
            }
          },
          child: CustomPaint(
            size: const Size(3000, 3000),
            painter: NeuralCanvasPainter(
              service: widget.service,
              selectedSynapseId: widget.service.selectedSynapse?.id,
              connectingFromId: widget.service.connectingFromId,
              cursorWorldPos: _currentHoverWorldPos,
            ),
          ),
        ),
      ),
    );
  }

  SynapseModel? _findSynapseAt(Offset worldPos) {
    // Search visible synapses in reverse to select top node
    final visible = widget.service.visibleSynapses;
    for (int i = visible.length - 1; i >= 0; i--) {
      if (visible[i].hitTest(worldPos.dx, worldPos.dy)) {
        return visible[i];
      }
    }
    return null;
  }
}

class NeuralCanvasPainter extends CustomPainter {
  final GardenService service;
  final String? selectedSynapseId;
  final String? connectingFromId;
  final Offset? cursorWorldPos;

  NeuralCanvasPainter({
    required this.service,
    this.selectedSynapseId,
    this.connectingFromId,
    this.cursorWorldPos,
  });

  @override
  void paint(Canvas canvas, Size size) {
    _drawGrid(canvas, size);
    _drawClusters(canvas);
    _drawConnections(canvas);
    _drawSynapses(canvas);
  }

  void _drawGrid(Canvas canvas, Size size) {
    final dotPaint = Paint()
      ..color = const Color(0x1A38BDF8)
      ..style = PaintingStyle.fill;

    const spacing = 40.0;
    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), 1.2, dotPaint);
      }
    }
  }

  void _drawClusters(Canvas canvas) {
    for (final cluster in service.clusters) {
      final members = service.synapses
          .where((s) => cluster.synapseIds.contains(s.id))
          .toList();
      if (members.isEmpty) continue;

      double minX = double.infinity, minY = double.infinity;
      double maxX = -double.infinity, maxY = -double.infinity;

      for (final s in members) {
        minX = min(minX, s.x - s.radius);
        maxX = max(maxX, s.x + s.radius);
        minY = min(minY, s.y - s.radius);
        maxY = max(maxY, s.y + s.radius);
      }

      final pad = 36.0;
      final rect = Rect.fromLTRB(minX - pad, minY - pad, maxX + pad, maxY + pad);
      final rrect = RRect.fromRectAndRadius(rect, const Radius.circular(24));

      final clusterColor = HSLColor.fromAHSL(1.0, cluster.hue, 0.65, 0.55).toColor();

      // Soft aura fill
      final fillPaint = Paint()
        ..color = clusterColor.withOpacity(0.06)
        ..style = PaintingStyle.fill;
      canvas.drawRRect(rrect, fillPaint);

      // Border glow
      final borderPaint = Paint()
        ..color = clusterColor.withOpacity(0.25)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5;
      canvas.drawRRect(rrect, borderPaint);

      // Cluster label
      final textSpan = TextSpan(
        text: '✦ ${cluster.name.toUpperCase()}',
        style: TextStyle(
          color: clusterColor.withOpacity(0.8),
          fontSize: 11,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.0,
        ),
      );
      final tp = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(rect.left + 16, rect.top + 10));
    }
  }

  void _drawConnections(Canvas canvas) {
    for (final conn in service.connections) {
      final fromSyn = service.findSynapseById(conn.fromId);
      final toSyn = service.findSynapseById(conn.toId);
      if (fromSyn == null || toSyn == null) continue;

      final p1 = Offset(fromSyn.x, fromSyn.y);
      final p2 = Offset(toSyn.x, toSyn.y);

      // Average hue for harmonic gradient
      final avgHue = (fromSyn.hue + toSyn.hue) / 2.0;
      final glowColor = HSLColor.fromAHSL(1.0, avgHue, 0.75, 0.6).toColor();

      // 1. Ambient luminous outer aura
      final glowPaint = Paint()
        ..color = glowColor.withOpacity(0.45)
        ..strokeWidth = (3.4 * conn.strength).clamp(2.5, 7.5)
        ..strokeCap = StrokeCap.round
        ..style = PaintingStyle.stroke;
      canvas.drawLine(p1, p2, glowPaint);

      // 2. Crisp bright laser core
      final corePaint = Paint()
        ..color = Colors.white.withOpacity(0.85)
        ..strokeWidth = (1.6 * conn.strength).clamp(1.2, 3.6)
        ..strokeCap = StrokeCap.round
        ..style = PaintingStyle.stroke;
      canvas.drawLine(p1, p2, corePaint);

      // 3. Anchor node connection junctions
      final anchorPaint = Paint()
        ..color = glowColor.withOpacity(0.8)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(p1, 3.0, anchorPaint);
      canvas.drawCircle(p2, 3.0, anchorPaint);

      // 4. Connection label if set
      if (conn.label.isNotEmpty) {
        final mid = Offset((p1.dx + p2.dx) / 2, (p1.dy + p2.dy) / 2);
        final tp = TextPainter(
          text: TextSpan(
            text: conn.label,
            style: TextStyle(
              color: glowColor.withOpacity(0.95),
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          textDirection: TextDirection.ltr,
        )..layout();

        final labelRect = RRect.fromRectAndRadius(
          Rect.fromCenter(
            center: mid,
            width: tp.width + 12,
            height: tp.height + 4,
          ),
          const Radius.circular(6),
        );
        canvas.drawRRect(
          labelRect,
          Paint()..color = HiroColors.surfaceElevated.withOpacity(0.9),
        );
        canvas.drawRRect(
          labelRect,
          Paint()
            ..color = glowColor.withOpacity(0.4)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 1,
        );
        tp.paint(canvas, mid - Offset(tp.width / 2, tp.height / 2));
      }

      // 5. Active traveling electrical pulses along the axon
      for (final pulse in conn.activePulses) {
        final currentPos = Offset.lerp(p1, p2, pulse.progress)!;
        final pulseColor =
            HSLColor.fromAHSL(1.0, pulse.hue, 0.9, 0.65).toColor();

        // Glowing outer halo
        final pulseGlow = Paint()
          ..color = pulseColor.withOpacity(0.6)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 7);
        canvas.drawCircle(currentPos, 7.5, pulseGlow);

        // Core electric spark
        final pulseCore = Paint()
          ..color = Colors.white
          ..style = PaintingStyle.fill;
        canvas.drawCircle(currentPos, 3.2, pulseCore);
      }
    }

    // 6. Connect Mode active aiming line from source node
    if (connectingFromId != null && cursorWorldPos != null) {
      final srcSyn = service.findSynapseById(connectingFromId!);
      if (srcSyn != null) {
        final srcPos = Offset(srcSyn.x, srcSyn.y);
        final aimGlow = Paint()
          ..color = HiroColors.solarAmber.withOpacity(0.5)
          ..strokeWidth = 3.0
          ..strokeCap = StrokeCap.round
          ..style = PaintingStyle.stroke;
        canvas.drawLine(srcPos, cursorWorldPos!, aimGlow);

        final aimCore = Paint()
          ..color = Colors.white
          ..strokeWidth = 1.5
          ..strokeCap = StrokeCap.round
          ..style = PaintingStyle.stroke;
        canvas.drawLine(srcPos, cursorWorldPos!, aimCore);
      }
    }
  }

  void _drawSynapses(Canvas canvas) {
    final visible = service.visibleSynapses;

    for (final syn in visible) {
      final center = Offset(syn.x, syn.y);
      final r = syn.radius * syn.sproutProgress;
      final nodeColor = HSLColor.fromAHSL(1.0, syn.hue, 0.75, 0.5).toColor();
      final isSelected = syn.id == selectedSynapseId;
      final isConnectingSource = syn.id == connectingFromId;

      // 1. Radiating pulse wave when fired
      if (syn.pulseWave > 0.0) {
        final waveR = r + (1.0 - syn.pulseWave) * 36.0;
        final wavePaint = Paint()
          ..color = nodeColor.withOpacity(syn.pulseWave * 0.6)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.5;
        canvas.drawCircle(center, waveR, wavePaint);
      }

      // 2. Selection / Connection aura
      if (isSelected || isConnectingSource) {
        final auraColor = isConnectingSource ? HiroColors.solarAmber : HiroColors.neonCyan;
        final auraPaint = Paint()
          ..color = auraColor.withOpacity(0.3)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 12);
        canvas.drawCircle(center, r + 14, auraPaint);

        final ringPaint = Paint()
          ..color = auraColor
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.0;
        canvas.drawCircle(center, r + 7, ringPaint);
      }

      // 3. Charge Ring (arc around the node based on vitality/charge)
      final chargePaint = Paint()
        ..color = nodeColor.withOpacity(0.85)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0
        ..strokeCap = StrokeCap.round;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: r + 3),
        -pi / 2,
        2 * pi * syn.charge,
        false,
        chargePaint,
      );

      // 4. Node Inner Body Gradient
      final bodyPaint = Paint()
        ..shader = RadialGradient(
          colors: [
            nodeColor.withOpacity(0.9),
            nodeColor.withOpacity(0.3),
            HiroColors.abyss.withOpacity(0.8),
          ],
          stops: const [0.2, 0.7, 1.0],
        ).createShader(Rect.fromCircle(center: center, radius: r));
      canvas.drawCircle(center, r, bodyPaint);

      final borderPaint = Paint()
        ..color = Colors.white.withOpacity(0.4)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.2;
      canvas.drawCircle(center, r, borderPaint);

      // 5. Center Emoji / Icon
      final emoji = HiroColors.templateEmoji(syn.type);
      final emojiSpan = TextSpan(
        text: emoji,
        style: TextStyle(fontSize: r * 0.8),
      );
      final emojiPainter = TextPainter(
        text: emojiSpan,
        textDirection: TextDirection.ltr,
      )..layout();
      emojiPainter.paint(
        canvas,
        center - Offset(emojiPainter.width / 2, emojiPainter.height / 2),
      );

      // 6. Star indicator if starred
      if (syn.starred) {
        final starSpan = const TextSpan(
          text: '⭐',
          style: TextStyle(fontSize: 12),
        );
        final starPainter = TextPainter(
          text: starSpan,
          textDirection: TextDirection.ltr,
        )..layout();
        starPainter.paint(canvas, center + Offset(r - 8, -r - 4));
      }

      // 7. Title Label Pill below node
      if (syn.title.isNotEmpty) {
        final textSpan = TextSpan(
          text: syn.title,
          style: const TextStyle(
            color: HiroColors.textPrimary,
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        );
        final tp = TextPainter(
          text: textSpan,
          textDirection: TextDirection.ltr,
        )..layout();

        final labelRect = RRect.fromRectAndRadius(
          Rect.fromCenter(
            center: center + Offset(0, r + 16),
            width: tp.width + 16,
            height: tp.height + 6,
          ),
          const Radius.circular(8),
        );

        canvas.drawRRect(
          labelRect,
          Paint()..color = HiroColors.surfaceElevated.withOpacity(0.85),
        );
        canvas.drawRRect(
          labelRect,
          Paint()
            ..color = nodeColor.withOpacity(0.4)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 1,
        );

        tp.paint(
          canvas,
          center + Offset(-tp.width / 2, r + 16 - tp.height / 2),
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant NeuralCanvasPainter oldDelegate) => true;
}
