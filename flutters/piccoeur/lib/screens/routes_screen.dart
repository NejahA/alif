import 'package:flutter/material.dart';
import '../data/tunisia_data.dart';
import '../models/route_info.dart';
import 'add_route_screen.dart';

class RoutesScreen extends StatelessWidget {
  final List<RouteInfo> routes;
  final Set<String> favorites;
  final void Function(String routeId) onToggleFavorite;
  final bool loading;
  final Future<void> Function() onRefresh;

  const RoutesScreen({
    super.key,
    required this.routes,
    required this.favorites,
    required this.onToggleFavorite,
    required this.loading,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Routes Populaires'),
        backgroundColor: theme.colorScheme.primaryContainer,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Center(
              child: Text('${favorites.length} favoris', style: theme.textTheme.bodySmall),
            ),
          ),
        ],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : routes.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.route, size: 64, color: Colors.grey[300]),
                      const SizedBox(height: 12),
                      Text('Aucune route', style: theme.textTheme.titleMedium?.copyWith(color: Colors.grey[500])),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      ...routes.map((r) => _routeCard(theme, r)),
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(context, MaterialPageRoute(
            builder: (_) => AddRouteScreen(onRouteAdded: onRefresh),
          ));
        },
        icon: const Icon(Icons.add),
        label: const Text('Ajouter'),
      ),
    );
  }

  Widget _routeCard(ThemeData theme, RouteInfo r) {
    final routeId = '${r.from}→${r.to}';
    final isFav = favorites.contains(routeId);
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
                  icon: Icon(isFav ? Icons.favorite : Icons.favorite_border, color: isFav ? Colors.red : Colors.grey),
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
