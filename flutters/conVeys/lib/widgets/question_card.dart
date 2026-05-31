import 'package:flutter/material.dart';
import '../models/question.dart';

/// Question card widget
/// Requirements: 1.1, 2.3
class QuestionCard extends StatelessWidget {
  final Question? question;
  final String categoryName;

  const QuestionCard({
    super.key,
    required this.question,
    required this.categoryName,
  });

  @override
  Widget build(BuildContext context) {
    if (question == null) {
      return const Card(
        margin: EdgeInsets.all(20),
        child: Padding(
          padding: EdgeInsets.all(40),
          child: Center(
            child: Text(
              'No questions available',
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
          ),
        ),
      );
    }

    return Card(
      elevation: 8,
      margin: const EdgeInsets.all(20),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        padding: const EdgeInsets.all(32),
        constraints: const BoxConstraints(minHeight: 300),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              categoryName,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.blue[700],
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 32),
            Text(
              question!.text,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w500,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
