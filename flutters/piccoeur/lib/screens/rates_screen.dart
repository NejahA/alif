import 'package:flutter/material.dart';
import '../data/tunisia_data.dart';

class RatesScreen extends StatelessWidget {
  const RatesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final categories = TunisiaData.rateCategories;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tarifs Transport'),
        backgroundColor: theme.colorScheme.primaryContainer,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Tous les prix en Dinars Tunisiens (DT)', style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey[600])),
          const SizedBox(height: 12),
          ...categories.map((cat) => Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(cat.name, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Divider(),
                    ...cat.items.map((item) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(child: Text(item.label)),
                          Text(item.price, style: const TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )),
                  ],
                ),
              ),
            ),
          )),
        ],
      ),
    );
  }
}
