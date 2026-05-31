import 'package:flutter/material.dart';
import '../models/route_info.dart';
import '../data/tunisia_data.dart';

class FavoritesScreen extends StatelessWidget {
  final List<RouteInfo> allRoutes;
  final Set<String> favorites;
  final void Function(String routeId) onToggleFavorite;

  const FavoritesScreen({
    super.key,
    required this.allRoutes,
    required this.favorites,
    required this.onToggleFavorite,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final favRoutes = allRoutes.where((r) => favorites.contains('${r.from}→${r.to}')).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes Favoris'),
        backgroundColor: theme.colorScheme.primaryContainer,
      ),
      body: favRoutes.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.favorite_outline, size: 80, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('Aucun favori', style: theme.textTheme.titleMedium?.copyWith(color: Colors.grey[500])),
                  const SizedBox(height: 8),
                  Text('Ajoutez des routes depuis l\'onglet Routes', style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey[400])),
                ],
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: favRoutes.map((r) => _favCard(theme, r)).toList(),
            ),
    );
  }

  Widget _favCard(ThemeData theme, RouteInfo r) {
    final routeId = '${r.from}→${r.to}';
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Icon(TunisiaData.getRouteIcon(r.type), color: theme.colorScheme.primary, size: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.circle, size: 10, color: Colors.green),
                          const SizedBox(width: 6),
                          Text(r.from, style: const TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                      const Padding(
                        padding: EdgeInsets.only(left: 4),
                        child: Icon(Icons.more_vert, size: 18, color: Colors.grey),
                      ),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 10, color: Colors.red),
                          const SizedBox(width: 6),
                          Text(r.to, style: const TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  onPressed: () => onToggleFavorite(routeId),
                ),
              ],
            ),
            const Divider(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _infoChip(Icons.straighten, r.distance),
                _infoChip(Icons.access_time, r.duration),
                _infoChip(Icons.attach_money, r.fare),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoChip(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey[600]),
        const SizedBox(width: 4),
        Text(text, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
      ],
    );
  }
}
