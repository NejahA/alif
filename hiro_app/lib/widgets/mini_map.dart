// Mini‑map widget for the Hiro garden editor
import 'package:flutter/material.dart';
import '../services/garden_service.dart';
import '../models/synapse_model.dart';
import '../models/cluster_model.dart';

class MiniMap extends StatelessWidget {
  final GardenService service;
  final TransformationController zoomController;
  final double size; // width & height of the mini‑map square

  const MiniMap({
    super.key,
    required this.service,
    required this.zoomController,
    this.size = 150,
  });

  // World bounds – we assume a large enough canvas (3000 x 3000)
  static const double _worldSize = 3000.0;

  @override
  Widget build(BuildContext context) {
    // Scale factor from world coordinates to mini‑map coordinates
    final double scale = size / _worldSize;

    // Current visible rect in world space
    final Matrix4 m = zoomController.value;
    final double zoom = m.getMaxScaleOnAxis();
    final Offset translation = Offset(m.storage[12], m.storage[13]);
    final Size screen = MediaQuery.of(context).size;
    // Visible region in world coordinates (approximation)
    final Rect visibleWorld = Rect.fromLTWH(
      -translation.dx / zoom,
      -translation.dy / zoom,
      screen.width / zoom,
      screen.height / zoom,
    );

    return GestureDetector(
      onPanUpdate: (details) {
        // Compute new translation based on drag delta on mini‑map
        final dx = -details.delta.dx / scale;
        final dy = -details.delta.dy / scale;
        final Matrix4 newMatrix = zoomController.value.clone();
        newMatrix.translate(dx, dy);
        zoomController.value = newMatrix;
      },
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: Colors.black54,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.white70, width: 1),
        ),
        child: CustomPaint(
          painter: _MiniMapPainter(
            service: service,
            scale: scale,
            visibleWorld: visibleWorld,
          ),
        ),
      ),
    );
  }
}

class _MiniMapPainter extends CustomPainter {
  final GardenService service;
  final double scale;
  final Rect visibleWorld;

  _MiniMapPainter({
    required this.service,
    required this.scale,
    required this.visibleWorld,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Draw synapses as small circles
    final synapsePaint = Paint()
      ..color = Colors.white70
      ..style = PaintingStyle.fill;
    for (final SynapseModel s in service.visibleSynapses) {
      final Offset pos = Offset(s.x * scale, s.y * scale);
      canvas.drawCircle(pos, 2.0, synapsePaint);
    }

    // Draw clusters as translucent rectangles
    final clusterPaint = Paint()
      ..color = Colors.yellowAccent.withOpacity(0.2)
      ..style = PaintingStyle.fill;
    for (final ClusterModel cluster in service.clusters) {
      // Compute bounds of cluster members
      double minX = double.infinity, minY = double.infinity;
      double maxX = -double.infinity, maxY = -double.infinity;
      for (final id in cluster.synapseIds) {
        final syn = service.findSynapseById(id);
        if (syn != null) {
          minX = minX < syn.x ? minX : syn.x;
          minY = minY < syn.y ? minY : syn.y;
          maxX = maxX > syn.x ? maxX : syn.x;
          maxY = maxY > syn.y ? maxY : syn.y;
        }
      }
      if (minX == double.infinity) continue;
      final rect = Rect.fromLTRB(
        minX * scale,
        minY * scale,
        maxX * scale,
        maxY * scale,
      );
      canvas.drawRect(rect, clusterPaint);
    }

    // Draw viewport rectangle
    final viewportPaint = Paint()
      ..color = Colors.cyanAccent
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    final Rect viewport = Rect.fromLTWH(
      visibleWorld.left * scale,
      visibleWorld.top * scale,
      visibleWorld.width * scale,
      visibleWorld.height * scale,
    );
    canvas.drawRect(viewport, viewportPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

