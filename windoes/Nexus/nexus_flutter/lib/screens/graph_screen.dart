import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../main.dart';
import '../services/database_service.dart';
import 'dart:math';

class GraphScreen extends StatefulWidget {
  const GraphScreen({super.key});

  @override
  State<GraphScreen> createState() => _GraphScreenState();
}

class _GraphScreenState extends State<GraphScreen> with AutomaticKeepAliveClientMixin {
  final TransformationController _transformationController = TransformationController();
  bool _linkMode = false;
  bool _deleteMode = false;
  bool _showLinkList = false;
  Note? _linkStartNode;
  Note? _hoveredNode;
  Link? _hoveredLink;
  final Map<int, Offset> _nodePositions = {};
  bool _isDraggingNode = false;
  
  @override
  void initState() {
    super.initState();
    // Start with view at origin
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _transformationController.value = Matrix4.identity();
      }
    });
  }
  
  @override
  bool get wantKeepAlive => true;
  
  @override
  void dispose() {
    _transformationController.dispose();
    super.dispose();
  }

  void _initializePositions(List<Note> notes, List<Link> links) {
    // Remove positions for deleted notes
    _nodePositions.removeWhere((id, _) => !notes.any((note) => note.id == id));
    
    // Add positions for new notes - place them in visible area
    bool hasNewNodes = false;
    int index = 0;
    for (var note in notes) {
      if (!_nodePositions.containsKey(note.id)) {
        // Arrange nodes in a circle pattern in the visible area
        final angle = (index * 2 * pi) / notes.length;
        final radius = 300.0;
        _nodePositions[note.id!] = Offset(
          500 + radius * cos(angle),
          500 + radius * sin(angle),
        );
        hasNewNodes = true;
        index++;
      }
    }
    
    if (hasNewNodes && notes.isNotEmpty) {
      // Auto-center view after positioning new nodes
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _centerView();
      });
    }
  }

  void _centerView() {
    if (_nodePositions.isEmpty) return;
    
    // Calculate the bounding box of all nodes
    double minX = double.infinity;
    double minY = double.infinity;
    double maxX = double.negativeInfinity;
    double maxY = double.negativeInfinity;
    
    for (var pos in _nodePositions.values) {
      if (pos.dx < minX) minX = pos.dx;
      if (pos.dy < minY) minY = pos.dy;
      if (pos.dx > maxX) maxX = pos.dx;
      if (pos.dy > maxY) maxY = pos.dy;
    }
    
    // Calculate center of all nodes
    final centerX = (minX + maxX) / 2;
    final centerY = (minY + maxY) / 2;
    
    print('📍 Centering view on ($centerX, $centerY)');
    print('   Bounds: ($minX, $minY) to ($maxX, $maxY)');
    
    // Get the current viewport size
    final RenderBox? renderBox = context.findRenderObject() as RenderBox?;
    if (renderBox == null) return;
    
    final viewportSize = renderBox.size;
    
    // Calculate scale to fit all nodes
    final width = maxX - minX + 200; // Add padding
    final height = maxY - minY + 200;
    final scaleX = viewportSize.width / width;
    final scaleY = viewportSize.height / height;
    final scale = (scaleX < scaleY ? scaleX : scaleY).clamp(0.5, 2.0);
    
    // Calculate translation to center
    final dx = viewportSize.width / 2 - centerX * scale;
    final dy = viewportSize.height / 2 - centerY * scale;
    
    final matrix = Matrix4.identity()
      ..translate(dx, dy)
      ..scale(scale);
    
    _transformationController.value = matrix;
  }

  void _simulateForces(List<Note> notes, List<Link> links) async {
    for (int iteration = 0; iteration < 100; iteration++) {
      final Map<int, Offset> velocities = {};
      
      // Repulsion between all nodes
      for (var i = 0; i < notes.length; i++) {
        for (var j = i + 1; j < notes.length; j++) {
          final pos1 = _nodePositions[notes[i].id]!;
          final pos2 = _nodePositions[notes[j].id]!;
          final dx = pos2.dx - pos1.dx;
          final dy = pos2.dy - pos1.dy;
          final dist = sqrt(dx * dx + dy * dy).clamp(1, double.infinity);
          final force = 3000 / (dist * dist);
          
          velocities[notes[i].id!] = (velocities[notes[i].id!] ?? Offset.zero) - Offset(dx * force, dy * force);
          velocities[notes[j].id!] = (velocities[notes[j].id!] ?? Offset.zero) + Offset(dx * force, dy * force);
        }
      }
      
      // Attraction along links
      for (var link in links) {
        final pos1 = _nodePositions[link.sourceId];
        final pos2 = _nodePositions[link.targetId];
        if (pos1 != null && pos2 != null) {
          final dx = pos2.dx - pos1.dx;
          final dy = pos2.dy - pos1.dy;
          final dist = sqrt(dx * dx + dy * dy);
          final force = dist * 0.02;
          
          velocities[link.sourceId] = (velocities[link.sourceId] ?? Offset.zero) + Offset(dx * force, dy * force);
          velocities[link.targetId] = (velocities[link.targetId] ?? Offset.zero) - Offset(dx * force, dy * force);
        }
      }
      
      // Apply velocities
      for (var note in notes) {
        final vel = velocities[note.id] ?? Offset.zero;
        _nodePositions[note.id!] = _nodePositions[note.id!]! + vel * 0.85;
      }
    }
    
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin
    
    return Consumer<NotesProvider>(
      builder: (context, provider, child) {
        return FutureBuilder<GraphData>(
          future: provider.getGraphData(),
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return const Center(
                child: CircularProgressIndicator(color: Color(0xFF7c3aed)),
              );
            }

            final graphData = snapshot.data!;
            
            if (graphData.nodes.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.account_tree, size: 64, color: Color(0xFFa78bfa)),
                    SizedBox(height: 16),
                    Text(
                      'No notes to display',
                      style: TextStyle(fontSize: 18, color: Color(0xFFa78bfa)),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Create notes with [[links]] to see connections',
                      style: TextStyle(color: Color(0xFF7c3aed)),
                    ),
                  ],
                ),
              );
            }

            _initializePositions(graphData.nodes, graphData.links);

            return Stack(
              children: [
                // Interactive graph canvas
                GestureDetector(
                  onTapDown: (details) => _handleTap(details, graphData, provider),
                  onPanStart: (details) => _handlePanStart(details, graphData),
                  onPanUpdate: (details) => _handlePan(details, graphData),
                  onPanEnd: (_) => setState(() {
                    _hoveredNode = null;
                    _isDraggingNode = false;
                  }),
                  child: Container(
                    color: const Color(0xFF0f0a1a),
                    child: InteractiveViewer(
                      transformationController: _transformationController,
                      boundaryMargin: const EdgeInsets.all(double.infinity),
                      minScale: 0.1,
                      maxScale: 5.0,
                      panEnabled: !_isDraggingNode && !_linkMode && !_deleteMode,
                      scaleEnabled: true,
                      child: SizedBox(
                        width: 2000,
                        height: 2000,
                        child: CustomPaint(
                          size: const Size(2000, 2000),
                          painter: GraphPainter(
                            nodes: graphData.nodes,
                            links: graphData.links,
                            nodePositions: _nodePositions,
                            linkStartNode: _linkStartNode,
                            hoveredNode: _hoveredNode,
                            hoveredLink: _hoveredLink,
                            linkMode: _linkMode,
                            deleteMode: _deleteMode,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                
                // Status bar
                Positioned(
                  top: 16,
                  left: 16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF7c3aed).withOpacity(0.9),
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF7c3aed).withOpacity(0.4),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _getStatusText(graphData),
                          style: const TextStyle(
                            color: Color(0xFFe9d5ff),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          'Positions: ${_nodePositions.length}',
                          style: const TextStyle(
                            color: Color(0xFFe9d5ff),
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Control buttons
                Positioned(
                  top: 16,
                  right: 16,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2d2438).withOpacity(0.95),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF7c3aed), width: 2),
                    ),
                    child: Column(
                      children: [
                        _buildControlButton(
                          icon: Icons.zoom_in,
                          onPressed: () {
                            final matrix = _transformationController.value.clone();
                            matrix.scale(1.2);
                            _transformationController.value = matrix;
                          },
                        ),
                        _buildControlButton(
                          icon: Icons.zoom_out,
                          onPressed: () {
                            final matrix = _transformationController.value.clone();
                            matrix.scale(0.8);
                            _transformationController.value = matrix;
                          },
                        ),
                        _buildControlButton(
                          icon: Icons.refresh,
                          onPressed: () async {
                            _transformationController.value = Matrix4.identity();
                            _nodePositions.clear();
                            final graphData = await provider.getGraphData();
                            _initializePositions(graphData.nodes, graphData.links);
                          },
                        ),
                        _buildControlButton(
                          icon: Icons.center_focus_strong,
                          label: 'Center',
                          onPressed: () => _centerView(),
                        ),
                        const Divider(color: Color(0xFF7c3aed), height: 16),
                        _buildControlButton(
                          icon: Icons.link,
                          label: 'Link',
                          isActive: _linkMode,
                          onPressed: () {
                            setState(() {
                              _linkMode = !_linkMode;
                              _deleteMode = false;
                              _linkStartNode = null;
                            });
                          },
                        ),
                        _buildControlButton(
                          icon: Icons.content_cut,
                          label: 'Delete',
                          isActive: _deleteMode,
                          activeColor: const Color(0xFFf59e0b),
                          onPressed: () {
                            setState(() {
                              _deleteMode = !_deleteMode;
                              _linkMode = false;
                              _linkStartNode = null;
                            });
                          },
                        ),
                        _buildControlButton(
                          icon: Icons.list,
                          label: 'List',
                          onPressed: () {
                            setState(() => _showLinkList = !_showLinkList);
                          },
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Link list panel
                if (_showLinkList)
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: Container(
                      constraints: const BoxConstraints(maxHeight: 250),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2d2438).withOpacity(0.95),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF7c3aed), width: 2),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                '🔗 All Connections',
                                style: TextStyle(
                                  color: Color(0xFFa78bfa),
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  onTap: () => setState(() => _showLinkList = false),
                                  borderRadius: BorderRadius.circular(20),
                                  child: Container(
                                    padding: const EdgeInsets.all(8),
                                    child: const Icon(Icons.close, color: Color(0xFFe9d5ff)),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Expanded(
                            child: graphData.links.isEmpty
                                ? const Center(
                                    child: Text(
                                      'No connections',
                                      style: TextStyle(color: Color(0xFFe9d5ff)),
                                    ),
                                  )
                                : ListView.builder(
                                    itemCount: graphData.links.length,
                                    itemBuilder: (context, index) {
                                      final link = graphData.links[index];
                                      final source = graphData.nodes.firstWhere((n) => n.id == link.sourceId);
                                      final target = graphData.nodes.firstWhere((n) => n.id == link.targetId);
                                      
                                      return Container(
                                        margin: const EdgeInsets.only(bottom: 8),
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF7c3aed).withOpacity(0.2),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Row(
                                          children: [
                                            Expanded(
                                              child: Text(
                                                '${source.title} → ${target.title}',
                                                style: const TextStyle(color: Color(0xFFe9d5ff)),
                                              ),
                                            ),
                                            Material(
                                              color: Colors.transparent,
                                              child: InkWell(
                                                onTap: () async {
                                                  await provider.deleteLink(link.sourceId, link.targetId);
                                                  setState(() {});
                                                },
                                                borderRadius: BorderRadius.circular(6),
                                                child: Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                  decoration: BoxDecoration(
                                                    color: const Color(0xFFdc2626),
                                                    borderRadius: BorderRadius.circular(6),
                                                  ),
                                                  child: const Text(
                                                    'Delete',
                                                    style: TextStyle(fontSize: 12, color: Colors.white),
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                                    },
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    String? label,
    bool isActive = false,
    Color? activeColor,
    required VoidCallback onPressed,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(6),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: isActive ? (activeColor ?? const Color(0xFFdc2626)) : const Color(0xFF7c3aed),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 18, color: Colors.white),
                if (label != null) ...[
                  const SizedBox(width: 6),
                  Text(label, style: const TextStyle(fontSize: 12, color: Colors.white)),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _getStatusText(GraphData graphData) {
    if (_linkMode && _linkStartNode != null) {
      return 'Selected: ${_linkStartNode!.title}';
    } else if (_linkMode) {
      return 'Click nodes to link';
    } else if (_deleteMode) {
      return 'Click line to delete';
    }
    return '${graphData.nodes.length} notes, ${graphData.links.length} links';
  }

  void _handleTap(TapDownDetails details, GraphData graphData, NotesProvider provider) {
    final matrix = _transformationController.value;
    final inverse = Matrix4.inverted(matrix);
    final transformed = MatrixUtils.transformPoint(inverse, details.localPosition);
    
    // Check if clicked on a link (delete mode)
    if (_deleteMode) {
      for (var link in graphData.links) {
        final source = _nodePositions[link.sourceId];
        final target = _nodePositions[link.targetId];
        if (source != null && target != null) {
          final dist = _distanceToLine(transformed, source, target);
          if (dist < 15) {
            provider.deleteLink(link.sourceId, link.targetId);
            setState(() {});
            return;
          }
        }
      }
    }
    
    // Check if clicked on a node
    for (var node in graphData.nodes) {
      final pos = _nodePositions[node.id];
      if (pos != null) {
        final distance = (transformed - pos).distance;
        if (distance < 30) {
          if (_linkMode) {
            if (_linkStartNode == null) {
              setState(() => _linkStartNode = node);
            } else if (_linkStartNode != node) {
              provider.createLink(_linkStartNode!.id!, node.id!);
              setState(() => _linkStartNode = null);
            }
          }
          return;
        }
      }
    }
  }

  void _handlePanStart(DragStartDetails details, GraphData graphData) {
    if (_linkMode || _deleteMode) return;
    
    final matrix = _transformationController.value;
    final inverse = Matrix4.inverted(matrix);
    final transformed = MatrixUtils.transformPoint(inverse, details.localPosition);
    
    // Check if starting drag on a node
    for (var node in graphData.nodes) {
      final pos = _nodePositions[node.id];
      if (pos != null && (transformed - pos).distance < 30) {
        setState(() => _isDraggingNode = true);
        return;
      }
    }
    setState(() => _isDraggingNode = false);
  }

  void _handlePan(DragUpdateDetails details, GraphData graphData) {
    if (_linkMode || _deleteMode) return;
    
    if (!_isDraggingNode) {
      // Pan the view
      return;
    }
    
    final matrix = _transformationController.value;
    final inverse = Matrix4.inverted(matrix);
    final transformed = MatrixUtils.transformPoint(inverse, details.localPosition);
    
    // Drag the node
    if (_hoveredNode != null) {
      setState(() {
        _nodePositions[_hoveredNode!.id!] = transformed;
      });
    } else {
      // Find which node we're dragging
      for (var node in graphData.nodes) {
        final pos = _nodePositions[node.id];
        if (pos != null) {
          final distance = (transformed - pos).distance;
          if (distance < 30) {
            setState(() {
              _hoveredNode = node;
              _nodePositions[node.id!] = transformed;
            });
            return;
          }
        }
      }
    }
  }

  double _distanceToLine(Offset point, Offset start, Offset end) {
    final a = point - start;
    final b = end - start;
    final dot = a.dx * b.dx + a.dy * b.dy;
    final lenSq = b.dx * b.dx + b.dy * b.dy;
    final param = lenSq != 0 ? (dot / lenSq).toDouble() : -1.0;
    
    Offset closest;
    if (param < 0) {
      closest = start;
    } else if (param > 1) {
      closest = end;
    } else {
      closest = start + b * param;
    }
    
    return (point - closest).distance;
  }
}

class GraphPainter extends CustomPainter {
  final List<Note> nodes;
  final List<Link> links;
  final Map<int, Offset> nodePositions;
  final Note? linkStartNode;
  final Note? hoveredNode;
  final Link? hoveredLink;
  final bool linkMode;
  final bool deleteMode;

  GraphPainter({
    required this.nodes,
    required this.links,
    required this.nodePositions,
    this.linkStartNode,
    this.hoveredNode,
    this.hoveredLink,
    required this.linkMode,
    required this.deleteMode,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Draw background grid to help visualize the canvas
    final gridPaint = Paint()
      ..color = const Color(0xFF2d2438).withOpacity(0.3)
      ..strokeWidth = 1;
    
    for (double i = 0; i < size.width; i += 200) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), gridPaint);
    }
    for (double i = 0; i < size.height; i += 200) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), gridPaint);
    }
    
    // Draw center marker
    final centerPaint = Paint()
      ..color = const Color(0xFFf59e0b)
      ..strokeWidth = 3;
    canvas.drawLine(
      Offset(size.width / 2 - 50, size.height / 2),
      Offset(size.width / 2 + 50, size.height / 2),
      centerPaint,
    );
    canvas.drawLine(
      Offset(size.width / 2, size.height / 2 - 50),
      Offset(size.width / 2, size.height / 2 + 50),
      centerPaint,
    );
    
    // Draw links
    final linkPaint = Paint()
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    for (var link in links) {
      final source = nodePositions[link.sourceId];
      final target = nodePositions[link.targetId];
      if (source != null && target != null) {
        final isHovered = hoveredLink?.sourceId == link.sourceId && hoveredLink?.targetId == link.targetId;
        linkPaint.color = isHovered ? const Color(0xFFf59e0b) : const Color(0xFF7c3aed);
        canvas.drawLine(source, target, linkPaint);
      }
    }

    // Draw nodes
    for (var node in nodes) {
      final pos = nodePositions[node.id];
      if (pos != null) {
        final isStart = linkStartNode?.id == node.id;
        final isHovered = hoveredNode?.id == node.id;
        
        // Node circle
        final gradient = RadialGradient(
          colors: isStart
              ? [const Color(0xFFef4444), const Color(0xFFdc2626)]
              : [const Color(0xFFa78bfa), const Color(0xFF7c3aed)],
        );
        
        final paint = Paint()
          ..shader = gradient.createShader(Rect.fromCircle(center: pos, radius: 40));
        
        canvas.drawCircle(pos, 40, paint);
        
        // Node border
        final borderPaint = Paint()
          ..color = const Color(0xFFe9d5ff)
          ..style = PaintingStyle.stroke
          ..strokeWidth = isHovered ? 6 : 4;
        canvas.drawCircle(pos, 40, borderPaint);
        
        // Node label
        final textPainter = TextPainter(
          text: TextSpan(
            text: node.title,
            style: const TextStyle(
              color: Color(0xFFe9d5ff),
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          textDirection: TextDirection.ltr,
        );
        textPainter.layout();
        textPainter.paint(
          canvas,
          Offset(pos.dx - textPainter.width / 2, pos.dy + 50),
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant GraphPainter oldDelegate) => true;
}
