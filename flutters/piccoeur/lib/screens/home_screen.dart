import 'package:flutter/material.dart';
import '../data/tunisia_data.dart';
import '../models/taxi_info.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Piccoeur - Tunisie'),
        backgroundColor: theme.colorScheme.primaryContainer,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Icon(Icons.local_taxi, size: 64, color: theme.colorScheme.primary),
                  const SizedBox(height: 12),
                  Text(
                    'Bienvenue sur Piccoeur',
                    style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Guide transport Tunisie',
                    style: theme.textTheme.bodyLarge?.copyWith(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text('Moyens de transport', style: theme.textTheme.titleLarge),
          const SizedBox(height: 12),
          ...TunisiaData.transportModes.map((info) => _transportTile(theme, info)),
          const SizedBox(height: 20),
          Text('Annonces', style: theme.textTheme.titleLarge),
          const SizedBox(height: 12),
          ...TunisiaData.announcements.map((a) => Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: theme.colorScheme.secondaryContainer,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline, color: theme.colorScheme.secondary),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(a.message, style: theme.textTheme.bodyMedium),
                      const SizedBox(height: 4),
                      Text(
                        '${a.date.day}/${a.date.month}/${a.date.year}',
                        style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey[500]),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _transportTile(ThemeData theme, TaxiInfo info) {
    return Card(
      child: ListTile(
        leading: Icon(TunisiaData.getIconData(info.icon), color: theme.colorScheme.primary, size: 32),
        title: Text(info.title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(info.subtitle),
      ),
    );
  }
}
