// Neural canvas widget with optional external zoom controller
import 'dart:math';
import 'package:flutter/material.dart';

import '../models/synapse_model.dart';
import '../services/garden_service.dart';
import '../theme/hiro_theme.dart';

class NeuralCanvas extends StatefulWidget {
  final GardenService service;
  final Function(SynapseModel) onSelectSynapse;
  final VoidCallback onOpenTemplateSelector;
  final TransformationController? externalController;

  const NeuralCanvas({
    super.key,
    required this.service,
    required this.onSelectSynapse,
    required this.onOpenTemplateSelector,
    this.externalController,
  });

  @override
  State<NeuralCanvas> createState() => _NeuralCanvasState();
}

class _NeuralCanvasState extends State<NeuralCanvas>
    with TickerProviderStateMixin {
  // Internal controller used when no external controller is supplied
  final TransformationController _internalController =
      TransformationController();
  late final AnimationController _animController;
  double _animValue = 0.0;
  Offset? _currentHoverWorldPos;

  // Synapse currently being dragged (null when not dragging).
  SynapseModel? _draggedSynapse;

  TransformationController get _controller =>
      widget.externalController ?? _internalController;

  @override
  void initState() {
    super.initState();
    // Center initial view slightly
    _controller.value = Matrix4.identity()..setTranslationRaw(20.0, 20.0, 0.0);
    // Animation controller for search-highlight pulsation
    _animController =
        AnimationController(vsync: this, duration: const Duration(seconds: 2))
          ..addListener(() {
            if (!mounted) return;
            setState(() => _animValue = _animController.value);
          })
          ..repeat();
  }

  @override
  void dispose() {
    _animController.dispose();
    _internalController.dispose();
    super.dispose();
  }

  /// Converts a point in *screen* (outer widget) coordinates to world
  /// coordinates. Only needed for events that arrive OUTSIDE the
  /// InteractiveViewer (e.g. the double-tap GestureDetector).
  Offset _screenToWorld(Offset screenPos) {
    final inverted = Matrix4.inverted(_controller.value);
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
        transformationController: _controller,
        boundaryMargin: const EdgeInsets.all(2000),
        minScale: 0.25,
        maxScale: 3.0,
        panEnabled: _draggedSynapse == null && !widget.service.isConnectMode,
        scaleEnabled: _draggedSynapse == null,
        child: Listener(
          // NOTE: this Listener lives INSIDE the InteractiveViewer, so
          // `event.localPosition` is already in world coordinates.
          onPointerDown: (event) {
            final worldPos = event.localPosition;
            final hit = _findSynapseAt(worldPos);

            if (widget.service.isConnectMode) {
              if (hit != null) {
                widget.service.handleConnectClick(hit.id);
                setState(() => _currentHoverWorldPos = null);
              }
              return;
            }

            if (hit != null) {
              // Multi-select: tap toggles membership in the selection.
              if (widget.service.multiSelectEnabled) {
                widget.service.toggleSynapseInSelection(hit.id);
              }
              setState(() => _draggedSynapse = hit);
              widget.service.selectSynapse(hit);
              widget.onSelectSynapse(hit);
            } else {
              widget.service.selectSynapse(null);
            }
          },
          onPointerMove: (event) {
            final worldPos = event.localPosition;
            if (widget.service.isConnectMode) {
              setState(() => _currentHoverWorldPos = worldPos);
              return;
            }
            final dragged = _draggedSynapse;
            if (dragged != null) {
              widget.service.moveSynapse(dragged.id, worldPos.dx, worldPos.dy);
            }
          },
          onPointerUp: (_) {
            if (_draggedSynapse != null) {
              setState(() => _draggedSynapse = null);
              widget.service.endMoveSynapse();
            }
          },
          onPointerCancel: (_) {
            if (_draggedSynapse != null) {
              setState(() => _draggedSynapse = null);
              widget.service.endMoveSynapse();
            }
          },
          child: CustomPaint(
            size: const Size(3000, 3000),
            painter: NeuralCanvasPainter(
              service: widget.service,
              selectedSynapseId: widget.service.selectedSynapse?.id,
              selectedSynapseIds: widget.service.selectedSynapseIds,
              connectingFromId: widget.service.connectingFromId,
              cursorWorldPos: _currentHoverWorldPos,
              animValue: _animValue,
            ),
          ),
        ),
      ),
    );
  }

  SynapseModel? _findSynapseAt(Offset worldPos) {
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
  final Set<String> selectedSynapseIds;
  final String? connectingFromId;
  final Offset? cursorWorldPos;

  /// 0.0 - 1.0 looping animation value (drives the search-highlight pulse).
  final double animValue;

  NeuralCanvasPainter({
    required this.service,
    this.selectedSynapseId,
    this.selectedSynapseIds = const {},
    this.connectingFromId,
    this.cursorWorldPos,
    this.animValue = 0.0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    _drawGrid(canvas, size);
    _drawClusters(canvas);
    _drawConnections(canvas);
    _drawSynapses(canvas);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;

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
      const pad = 36.0;
      final rect =
          Rect.fromLTRB(minX - pad, minY - pad, maxX + pad, maxY + pad);
      final rrect = RRect.fromRectAndRadius(rect, const Radius.circular(24));
      final clusterColor =
          HSLColor.fromAHSL(1.0, cluster.hue, 0.65, 0.55).toColor();
      final fillPaint = Paint()
        ..color = clusterColor.withValues(alpha: 0.06)
        ..style = PaintingStyle.fill;
      canvas.drawRRect(rrect, fillPaint);
      final borderPaint = Paint()
        ..color = clusterColor.withValues(alpha: 0.25)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5;
      canvas.drawRRect(rrect, borderPaint);
      final textSpan = TextSpan(
        text: '✦ ${cluster.name.toUpperCase()}',
        style: TextStyle(
          color: clusterColor.withValues(alpha: 0.8),
          fontSize: 11,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.0,
        ),
      );
      final tp = TextPainter(text: textSpan, textDirection: TextDirection.ltr)
        ..layout();
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
      final avgHue = (fromSyn.hue + toSyn.hue) / 2.0;
      final glowColor = HSLColor.fromAHSL(1.0, avgHue, 0.75, 0.6).toColor();
      final glowPaint = Paint()
        ..color = glowColor.withValues(alpha: 0.45)
        ..strokeWidth = (3.4 * conn.strength).clamp(2.5, 7.5)
        ..strokeCap = StrokeCap.round
        ..style = PaintingStyle.stroke;
      canvas.drawLine(p1, p2, glowPaint);
      final corePaint = Paint()
        ..color = Colors.white.withValues(alpha: 0.85)
        ..strokeWidth = (1.6 * conn.strength).clamp(1.2, 3.6)
        ..strokeCap = StrokeCap.round
        ..style = PaintingStyle.stroke;
      canvas.drawLine(p1, p2, corePaint);
      final anchorPaint = Paint()
        ..color = glowColor.withValues(alpha: 0.8)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(p1, 3.0, anchorPaint);
      canvas.drawCircle(p2, 3.0, anchorPaint);
    }
  }

  void _drawSynapses(Canvas canvas) {
    final query = service.searchQuery.trim().toLowerCase();

    for (final syn in service.synapses) {
      final center = Offset(syn.x, syn.y);

      // Base circle
      final Paint nodePaint = Paint()
        ..color = HSLColor.fromAHSL(1.0, syn.hue, 0.65, 0.55).toColor()
        ..style = PaintingStyle.fill;
      canvas.drawCircle(center, syn.radius, nodePaint);

      // Multi-select highlight (dashed-looking cyan ring)
      if (selectedSynapseIds.contains(syn.id)) {
        final Paint multiPaint = Paint()
          ..color = Colors.cyanAccent
          ..style = PaintingStyle.stroke
          ..strokeWidth = 3.0;
        canvas.drawCircle(center, syn.radius + 5, multiPaint);
      }

      // Border for selected node
      if (syn.id == selectedSynapseId) {
        final Paint selectedPaint = Paint()
          ..color = Colors.white
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.0;
        canvas.drawCircle(center, syn.radius + 2, selectedPaint);
      }

      // Search-highlight pulsating ring
      if (query.isNotEmpty) {
        final matches = syn.title.toLowerCase().contains(query) ||
            syn.notes.toLowerCase().contains(query) ||
            syn.tag.toLowerCase().contains(query);
        if (matches) {
          final double pulse = 4.0 * (0.5 + 0.5 * sin(animValue * 2 * pi));
          final Paint pulsePaint = Paint()
            ..color = Colors.yellowAccent.withValues(alpha: 0.6)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2.0;
          canvas.drawCircle(center, syn.radius + pulse, pulsePaint);
        }
      }
    }
  }
}