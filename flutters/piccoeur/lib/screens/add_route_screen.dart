import 'package:flutter/material.dart';
import '../models/route_info.dart';
import '../services/api_service.dart';
import '../data/tunisia_data.dart';

class AddRouteScreen extends StatefulWidget {
  final VoidCallback onRouteAdded;

  const AddRouteScreen({super.key, required this.onRouteAdded});

  @override
  State<AddRouteScreen> createState() => _AddRouteScreenState();
}

class _AddRouteScreenState extends State<AddRouteScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fromCtrl = TextEditingController();
  final _toCtrl = TextEditingController();
  final _distCtrl = TextEditingController();
  final _durCtrl = TextEditingController();
  final _fareCtrl = TextEditingController();
  RouteType _type = RouteType.city;
  bool _loading = false;

  @override
  void dispose() {
    _fromCtrl.dispose();
    _toCtrl.dispose();
    _distCtrl.dispose();
    _durCtrl.dispose();
    _fareCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);

    final route = RouteInfo(
      from: _fromCtrl.text.trim(),
      to: _toCtrl.text.trim(),
      distance: _distCtrl.text.trim(),
      duration: _durCtrl.text.trim(),
      fare: _fareCtrl.text.trim(),
      type: _type,
    );

    final ok = await ApiService.addRoute(route);
    if (!mounted) return;

    if (ok) {
      widget.onRouteAdded();
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erreur lors de l\'ajout. Vérifiez que le serveur est lancé.')),
      );
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ajouter une route'),
        backgroundColor: theme.colorScheme.primaryContainer,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _field('Départ', _fromCtrl, Icons.circle, 'Ex: Tunis Centre'),
            _field('Arrivée', _toCtrl, Icons.location_on, 'Ex: Sousse'),
            _field('Distance', _distCtrl, Icons.straighten, 'Ex: 140 km'),
            _field('Durée', _durCtrl, Icons.access_time, 'Ex: 1h45'),
            _field('Prix', _fareCtrl, Icons.attach_money, 'Ex: 12 DT'),
            const SizedBox(height: 16),
            Text('Type de route', style: theme.textTheme.titleSmall),
            const SizedBox(height: 8),
            DropdownButtonFormField<RouteType>(
              initialValue: _type,
              items: RouteType.values.map((t) => DropdownMenuItem(
                value: t,
                child: Row(
                  children: [
                    Icon(_typeIcon(t), size: 20, color: theme.colorScheme.primary),
                    const SizedBox(width: 8),
                    Text(_typeLabel(t)),
                  ],
                ),
              )).toList(),
              onChanged: (v) => setState(() => _type = v!),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _loading ? null : _submit,
              icon: _loading
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.add),
              label: Text(_loading ? 'Ajout...' : 'Ajouter la route'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _field(String label, TextEditingController ctrl, IconData icon, String hint) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: ctrl,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          prefixIcon: Icon(icon),
          border: const OutlineInputBorder(),
        ),
        validator: (v) => (v == null || v.trim().isEmpty) ? 'Requis' : null,
      ),
    );
  }

  IconData _typeIcon(RouteType t) => TunisiaData.getRouteIcon(t);
  String _typeLabel(RouteType t) {
    switch (t) {
      case RouteType.flight: return 'Aéroport / Vol';
      case RouteType.shopping: return 'Shopping';
      case RouteType.business: return 'Affaires';
      case RouteType.beach: return 'Plage / Touristique';
      case RouteType.train: return 'Train';
      case RouteType.city: return 'Ville';
      case RouteType.historic: return 'Historique / Culturel';
    }
  }
}
