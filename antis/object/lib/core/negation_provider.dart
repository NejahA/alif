import 'package:flutter/material.dart';
import 'dart:collection';

class NegatedObject {
  final String id;
  final String title;
  final DateTime timestamp;
  bool isNegated;

  NegatedObject({
    required this.id,
    required this.title,
    required this.timestamp,
    this.isNegated = false,
  });
}

class NegationProvider with ChangeNotifier {
  final List<NegatedObject> _objects = [];

  UnmodifiableListView<NegatedObject> get objects => UnmodifiableListView(_objects);
  
  List<NegatedObject> get activeObjects => _objects.where((o) => !o.isNegated).toList();
  List<NegatedObject> get negatedObjects => _objects.where((o) => o.isNegated).toList();

  void addObject(String title) {
    final newObject = NegatedObject(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: title,
      timestamp: DateTime.now(),
    );
    _objects.insert(0, newObject);
    notifyListeners();
  }

  void negateObject(String id) {
    final index = _objects.indexWhere((o) => o.id == id);
    if (index != -1) {
      _objects[index].isNegated = true;
      notifyListeners();
    }
  }

  void removeObject(String id) {
    _objects.removeWhere((o) => o.id == id);
    notifyListeners();
  }

  void clearNegated() {
    _objects.removeWhere((o) => o.isNegated);
    notifyListeners();
  }
}
