import 'package:flutter/material.dart';
import '../models/bloom.dart';
import '../services/hive_controller.dart';
import '../widgets/meadow_painter.dart';
import 'bloom_editor_screen.dart';
import 'insights_screen.dart';

/// The main interactive sunny-meadow view.
class MeadowScreen extends StatefulWidget {
  final HiveController controller;
  const MeadowScreen({super.key, required this.controller});

  @override
  State<MeadowScreen> createState() => _MeadowScreenState();
}

class _MeadowScreenState extends State<MeadowScreen> {
  double _zoom = 1.0;
  Offset _pan = Offset.zero;
  String? _selectedId;
  String? _linkingFromId;
  Offset? _linkPreviewEnd;
  bool _wasDragging = false;
  String? _draggingId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF87CEEB),
      body: Stack(
        children: [
          Positioned.fill(
            child: GestureDetector(
              onScaleStart: (details) {
                _wasDragging = false;
                final size = context.size;
                if (size != null) {
                  _draggingId = _hitTest(details.localFocalPoint, size);
                }
              },
              onScaleUpdate: (details) {
                setState(() {
                  if (_draggingId != null) {
                    _wasDragging = true;
                    final size = context.size;
                    if (size != null) {
                      final b = widget.controller.bloomById(_draggingId!);
                      if (b != null) {
                        final dx = (details.localFocalPoint.dx -
                                size.width / 2) /
                            _zoom +
                            _pan.dx;
                        final dy = (details.localFocalPoint.dy -
                                size.height / 2) /
                            _zoom +
                            _pan.dy;
                        widget.controller.moveBloom(
                            _draggingId!, dx / size.width, dy / size.height);
                      }
                    }
                  } else if (details.scale != 1.0 ||
                      details.focalPointDelta != Offset.zero) {
                    _zoom = (_zoom * details.scale).clamp(0.5, 3.0);
                    _pan += details.focalPointDelta;
                  }
                });
              },
              onScaleEnd: (_) {
                _draggingId = null;
              },
              onTapUp: (details) {
                if (_wasDragging) return;
                final size = context.size;
                if (size == null) return;
                final hit = _hitTest(details.localPosition, size);
                setState(() {
                  if (_linkingFromId != null && hit != null) {
                    _createPath(_linkingFromId!, hit);
                    _linkingFromId = null;
                    _linkPreviewEnd = null;
                  } else if (hit != null) {
                    _selectedId = hit;
                  } else {
                    _selectedId = null;
                  }
                });
              },
              onLongPressStart: (details) {
                final size = context.size;
                if (size == null) return;
                final hit = _hitTest(details.localPosition, size);
                if (hit != null) {
                  setState(() {
                    _linkingFromId = hit;
                    _linkPreviewEnd = details.localPosition;
                  });
                }
              },
              onLongPressMoveUpdate: (details) {
                if (_linkingFromId != null) {
                  setState(() => _linkPreviewEnd = details.localPosition);
                }
              },
              onLongPressEnd: (_) {
                setState(() {
                  _linkingFromId = null;
                  _linkPreviewEnd = null;
                });
              },
              child: CustomPaint(
                painter: MeadowPainter(
                  blooms: widget.controller.blooms,
                  paths: widget.controller.paths,
                  selectedId: _selectedId,
                  linkingFromId: _linkingFromId,
                  linkPreviewEnd: _linkPreviewEnd,
                  zoom: _zoom,
                  pan: _pan,
                ),
                size: Size.infinite,
              ),
            ),
          ),

          // Top bar.
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'RUSH',
                    style: TextStyle(
                      color: Color(0xFF5D4037),
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 4,
                    ),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.insights, color: Color(0xFF5D4037)),
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) =>
                                InsightsScreen(controller: widget.controller),
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add, color: Color(0xFF5D4037)),
                        onPressed: _openEditor,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Bottom hint.
          SafeArea(
            child: Align(
              alignment: Alignment.bottomCenter,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(
                  'Tap a bloom · Long-press to draw a flight path · Drag to move · Pinch to zoom',
                  style: TextStyle(
                    color: Colors.brown.shade800.withValues(alpha: 0.7),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String? _hitTest(Offset pos, Size size) {
    for (final b in widget.controller.blooms) {
      final screen = _toScreen(b, size);
      final radius = 10.0 + b.size * 8.0 + 10;
      if ((screen - pos).distance <= radius) return b.id;
    }
    return null;
  }

  Offset _toScreen(Bloom b, Size size) {
    final base = Offset(b.x * size.width, b.y * size.height);
    return (base - _pan) * _zoom + Offset(size.width / 2, size.height / 2);
  }

  void _createPath(String fromId, String toId) {
    if (fromId == toId) return;
    try {
      widget.controller.addPath(fromId: fromId, toId: toId);
    } catch (_) {
      // Duplicate path — ignore.
    }
  }

  void _openEditor() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => BloomEditorScreen(controller: widget.controller),
      ),
    );
    if (result != null && mounted) {
      setState(() => _selectedId = result as String);
    }
  }
}