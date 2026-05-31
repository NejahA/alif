import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/negation_provider.dart';
import '../widgets/negation_card.dart';
import 'dart:ui';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _inputController = TextEditingController();
  bool _showNegated = false;

  void _addObject() {
    if (_inputController.text.trim().isNotEmpty) {
      context.read<NegationProvider>().addObject(_inputController.text.trim());
      _inputController.clear();
      FocusScope.of(context).unfocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<NegationProvider>();
    final displayList = _showNegated ? provider.negatedObjects : provider.activeObjects;

    return Scaffold(
      body: Stack(
        children: [
          // Background
          Positioned.fill(
            child: Container(
              color: const Color(0xFF0A0A14),
              child: CustomPaint(
                painter: GridPainter(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.05),
                ),
              ),
            ),
          ),
          
          // Content
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                _buildToggle(),
                Expanded(
                  child: displayList.isEmpty 
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        itemCount: displayList.length,
                        itemBuilder: (context, index) {
                          final object = displayList[index];
                          return NegationCard(
                            key: ValueKey(object.id),
                            object: object,
                            onNegate: () => provider.negateObject(object.id),
                          );
                        },
                      ),
                ),
                _buildInputSection(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'THE VOID',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w200,
                  letterSpacing: 8,
                  color: Colors.white.withOpacity(0.9),
                ),
              ),
              if (_showNegated)
                TextButton(
                  onPressed: () => context.read<NegationProvider>().clearNegated(),
                  child: Text(
                    'PURGE',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.tertiary,
                      letterSpacing: 2,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            height: 1,
            width: 60,
            color: Theme.of(context).colorScheme.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildToggle() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Row(
        children: [
          _ToggleItem(
            label: 'PRESENCE',
            isActive: !_showNegated,
            onTap: () => setState(() => _showNegated = false),
          ),
          const SizedBox(width: 24),
          _ToggleItem(
            label: 'NEGATION',
            isActive: _showNegated,
            onTap: () => setState(() => _showNegated = true),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Opacity(
        opacity: 0.3,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _showNegated ? Icons.visibility_off_outlined : Icons.add_circle_outline,
              size: 48,
              color: Colors.white,
            ),
            const SizedBox(height: 16),
            Text(
              _showNegated ? 'THE VOID IS EMPTY' : 'NO OBJECTS IN FOCUS',
              style: const TextStyle(
                letterSpacing: 2,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputSection() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF12121F).withOpacity(0.8),
        border: Border(
          top: BorderSide(
            color: Colors.white.withOpacity(0.05),
          ),
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: Colors.white.withOpacity(0.1),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _inputController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'DEFINE FOCUS...',
                      hintStyle: TextStyle(
                        color: Colors.white.withOpacity(0.3),
                        letterSpacing: 2,
                        fontSize: 12,
                      ),
                      border: InputBorder.none,
                    ),
                    onSubmitted: (_) => _addObject(),
                  ),
                ),
                IconButton(
                  onPressed: _addObject,
                  icon: Icon(
                    Icons.arrow_upward_rounded,
                    color: Theme.of(context).colorScheme.secondary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ToggleItem extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _ToggleItem({
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              letterSpacing: 2,
              color: isActive ? Colors.white : Colors.white.withOpacity(0.3),
            ),
          ),
          const SizedBox(height: 4),
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            height: 2,
            width: isActive ? 20 : 0,
            color: Theme.of(context).colorScheme.secondary,
          ),
        ],
      ),
    );
  }
}

class GridPainter extends CustomPainter {
  final Color color;

  GridPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;

    const spacing = 40.0;
    
    for (double i = 0; i < size.width; i += spacing) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }
    
    for (double i = 0; i < size.height; i += spacing) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
