import 'package:flutter/material.dart';
import '../services/currency_service.dart';

class CurrencyProvider with ChangeNotifier {
  Map<String, dynamic> _rates = {};
  DateTime? _lastUpdate;
  bool _isLoading = false;

  Map<String, dynamic> get rates => _rates;
  String get lastUpdateStr => _lastUpdate == null ? 'Never' : _formatDate(_lastUpdate!);
  bool get isLoading => _isLoading;

  final _service = CurrencyService();

  Future<void> loadRates() async {
    _isLoading = true;
    notifyListeners();

    final fetchedRates = await _service.fetchRates();
    if (fetchedRates != null) {
      _rates = fetchedRates;
      _lastUpdate = DateTime.now();
    }
    _isLoading = false;
    notifyListeners();
  }

  String _formatDate(DateTime dt) {
    return '${dt.day}/${dt.month}/${dt.year} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
  }
}