import 'package:flutter/material.dart';

/// Progress indicator widget
/// Requirements: 1.3, 9.2
class ProgressIndicatorWidget extends StatelessWidget {
  final int current;
  final int total;
  final bool hasMoreQuestions;
  final VoidCallback onResetDeck;

  const ProgressIndicatorWidget({
    super.key,
    required this.current,
    required this.total,
    required this.hasMoreQuestions,
    required this.onResetDeck,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Text(
            '$current / $total',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (!hasMoreQuestions) ...[
            const SizedBox(height: 16),
            const Text(
              'No more questions in this category',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: onResetDeck,
              child: const Text('Reset Deck'),
            ),
          ],
        ],
      ),
    );
  }
}
