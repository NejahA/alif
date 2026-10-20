import 'package:flutter/material.dart';

class VirtualJoystick extends StatefulWidget {
  final ValueChanged<Offset> onDirectionChanged;
  final double radius;

  const VirtualJoystick({
    super.key,
    required this.onDirectionChanged,
    this.radius = 60.0,
  });

  @override
  State<VirtualJoystick> createState() => _VirtualJoystickState();
}

class _VirtualJoystickState extends State<VirtualJoystick> {
  Offset _dragOffset = Offset.zero;

  void _updateOffset(Offset localPos) {
    final center = Offset(widget.radius, widget.radius);
    final delta = localPos - center;
    final dist = delta.distance;

    if (dist <= widget.radius) {
      _dragOffset = delta;
    } else {
      _dragOffset = (delta / dist) * widget.radius;
    }

    final normalized = _dragOffset / widget.radius;
    widget.onDirectionChanged(normalized);
    setState(() {});
  }

  void _reset() {
    _dragOffset = Offset.zero;
    widget.onDirectionChanged(Offset.zero);
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: (details) => _updateOffset(details.localPosition),
      onPanUpdate: (details) => _updateOffset(details.localPosition),
      onPanEnd: (_) => _reset(),
      onPanCancel: () => _reset(),
      child: Container(
        width: widget.radius * 2,
        height: widget.radius * 2,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: const Color(0xFF0F172A).withValues(alpha: 0.55),
          border: Border.all(
            color: const Color(0xFF00E5FF).withValues(alpha: 0.4),
            width: 2.0,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF00E5FF).withValues(alpha: 0.15),
              blurRadius: 16,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Center(
          child: Transform.translate(
            offset: _dragOffset,
            child: Container(
              width: widget.radius * 0.75,
              height: widget.radius * 0.75,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const RadialGradient(
                  colors: [Color(0xFF00E5FF), Color(0xFF0091EA)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF00E5FF).withValues(alpha: 0.6),
                    blurRadius: 10,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
