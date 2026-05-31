import 'package:flutter/material.dart';
import '../core/negation_provider.dart';
import 'dart:ui';

class NegationCard extends StatefulWidget {
  final NegatedObject object;
  final VoidCallback onNegate;

  const NegationCard({
    super.key,
    required this.object,
    required this.onNegate,
  });

  @override
  State<NegationCard> createState() => _NegationCardState();
}

class _NegationCardState extends State<NegationCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _negationAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _negationAnimation = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutCubic),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleNegate() {
    _controller.forward().then((_) => widget.onNegate());
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _negationAnimation,
      builder: (context, child) {
        return Opacity(
          opacity: _negationAnimation.value,
          child: Transform.scale(
            scale: 0.95 + (0.05 * _negationAnimation.value),
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.1),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.object.title,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'OBJECT ID: ${widget.object.id.substring(widget.object.id.length - 6)}',
                                style: TextStyle(
                                  fontSize: 10,
                                  letterSpacing: 2,
                                  color: Colors.white.withOpacity(0.4),
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          onPressed: _handleNegate,
                          icon: Icon(
                            Icons.close_rounded,
                            color: Theme.of(context).colorScheme.tertiary,
                          ),
                          style: IconButton.styleFrom(
                            backgroundColor: Theme.of(context).colorScheme.tertiary.withOpacity(0.1),
                            padding: const EdgeInsets.all(12),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
