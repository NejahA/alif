import 'package:flutter/material.dart';

class CosmicCard {
  final String id;
  final String title;
  final String quote;
  final String wisdom;
  final String category;
  final Color primaryColor;
  final Color secondaryColor;
  final IconData icon;

  CosmicCard({
    required this.id,
    required this.title,
    required this.quote,
    required this.wisdom,
    required this.category,
    required this.primaryColor,
    required this.secondaryColor,
    required this.icon,
  });
}
