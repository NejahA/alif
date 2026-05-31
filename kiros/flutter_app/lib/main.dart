import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:geolocator/geolocator.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WorldClope',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
          iconTheme: IconThemeData(color: Colors.white),
        ),
        floatingActionButtonTheme: const FloatingActionButtonThemeData(
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
        ),
      ),
      home: const WorldClope(),
    );
  }
}

class City {
  final String id;
  final String name;
  final String country;
  final String timezone;
  final String flag;
  final double utcOffset; // Hours from UTC
  final double lat;
  final double lng;

  City({
    required this.id,
    required this.name,
    required this.country,
    required this.timezone,
    required this.flag,
    required this.utcOffset,
    required this.lat,
    required this.lng,
  });
}

class CityTime {
  final City city;
  DateTime currentTime;
  bool isCurrentLocation;

  CityTime({
    required this.city,
    required this.currentTime,
    this.isCurrentLocation = false,
  });
}

class WorldClope extends StatefulWidget {
  const WorldClope({super.key});

  @override
  State<WorldClope> createState() => _WorldClopeState();
}

class _WorldClopeState extends State<WorldClope> {
  late List<CityTime> cities;
  late Timer _timer;
  Position? _currentPosition;
  bool _isLoadingLocation = false;
  String _locationError = '';
  
  // Available cities database
  final List<City> _allCities = [
    City(id: 'london', name: 'London', country: 'United Kingdom', timezone: 'GMT', flag: '🇬🇧', utcOffset: 0, lat: 51.5074, lng: -0.1278),
    City(id: 'newyork', name: 'New York', country: 'USA', timezone: 'EST', flag: '🇺🇸', utcOffset: -5, lat: 40.7128, lng: -74.0060),
    City(id: 'tokyo', name: 'Tokyo', country: 'Japan', timezone: 'JST', flag: '🇯🇵', utcOffset: 9, lat: 35.6762, lng: 139.6503),
    City(id: 'sydney', name: 'Sydney', country: 'Australia', timezone: 'AEST', flag: '🇦🇺', utcOffset: 10, lat: -33.8688, lng: 151.2093),
    City(id: 'paris', name: 'Paris', country: 'France', timezone: 'CET', flag: '🇫🇷', utcOffset: 1, lat: 48.8566, lng: 2.3522),
    City(id: 'dubai', name: 'Dubai', country: 'UAE', timezone: 'GST', flag: '🇦🇪', utcOffset: 4, lat: 25.2048, lng: 55.2708),
    City(id: 'mumbai', name: 'Mumbai', country: 'India', timezone: 'IST', flag: '🇮🇳', utcOffset: 5.5, lat: 19.0760, lng: 72.8777),
    City(id: 'beijing', name: 'Beijing', country: 'China', timezone: 'CST', flag: '🇨🇳', utcOffset: 8, lat: 39.9042, lng: 116.4074),
    City(id: 'cairo', name: 'Cairo', country: 'Egypt', timezone: 'EET', flag: '🇪🇬', utcOffset: 2, lat: 30.0444, lng: 31.2357),
    City(id: 'moscow', name: 'Moscow', country: 'Russia', timezone: 'MSK', flag: '🇷🇺', utcOffset: 3, lat: 55.7558, lng: 37.6173),
    City(id: 'riodejaneiro', name: 'Rio de Janeiro', country: 'Brazil', timezone: 'BRT', flag: '🇧🇷', utcOffset: -3, lat: -22.9068, lng: -43.1729),
    City(id: 'capetown', name: 'Cape Town', country: 'South Africa', timezone: 'SAST', flag: '🇿🇦', utcOffset: 2, lat: -33.9249, lng: 18.4241),
    City(id: 'singapore', name: 'Singapore', country: 'Singapore', timezone: 'SGT', flag: '🇸🇬', utcOffset: 8, lat: 1.3521, lng: 103.8198),
    City(id: 'seoul', name: 'Seoul', country: 'South Korea', timezone: 'KST', flag: '🇰🇷', utcOffset: 9, lat: 37.5665, lng: 126.9780),
    City(id: 'mexicocity', name: 'Mexico City', country: 'Mexico', timezone: 'CST', flag: '🇲🇽', utcOffset: -6, lat: 19.4326, lng: -99.1332),
    City(id: 'tunis', name: 'Tunis', country: 'Tunisia', timezone: 'CET', flag: '🇹🇳', utcOffset: 1, lat: 36.8065, lng: 10.1815),
  ];

  @override
  void initState() {
    super.initState();
    _initializeCities();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _updateTimes();
    });
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _initializeCities() {
    final now = DateTime.now().toUtc();
    
    // Start with 5 default cities including Tunis
    cities = [
      _createCityTime(_allCities[0], now), // London
      _createCityTime(_allCities[1], now), // New York
      _createCityTime(_allCities[2], now), // Tokyo
      _createCityTime(_allCities[3], now), // Sydney
      _createCityTime(_allCities[15], now), // Tunis
    ];
  }

  CityTime _createCityTime(City city, DateTime utcNow) {
    return CityTime(
      city: city,
      currentTime: utcNow.add(Duration(hours: city.utcOffset.toInt())),
    );
  }

  void _updateTimes() {
    setState(() {
      final now = DateTime.now().toUtc();
      cities = cities.map((cityTime) {
        return CityTime(
          city: cityTime.city,
          currentTime: now.add(Duration(hours: cityTime.city.utcOffset.toInt())),
          isCurrentLocation: cityTime.isCurrentLocation,
        );
      }).toList();
    });
  }

  Future<void> _getCurrentLocation() async {
    setState(() {
      _isLoadingLocation = true;
      _locationError = '';
    });

    try {
      // Check permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _locationError = 'Location permission denied';
            _isLoadingLocation = false;
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _locationError = 'Location permission permanently denied';
          _isLoadingLocation = false;
        });
        return;
      }

      // Get current position
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      );

      setState(() {
        _currentPosition = position;
        _isLoadingLocation = false;
        
        // Find nearest city or create custom location
        final nearestCity = _findNearestCity(position.latitude, position.longitude);
        if (nearestCity != null) {
          // Check if already in list
          final existingIndex = cities.indexWhere((ct) => ct.city.id == nearestCity.id);
          if (existingIndex == -1) {
            // Add as current location
            final now = DateTime.now().toUtc();
            cities.insert(0, CityTime(
              city: nearestCity,
              currentTime: now.add(Duration(hours: nearestCity.utcOffset.toInt())),
              isCurrentLocation: true,
            ));
          }
        }
      });
    } catch (e) {
      setState(() {
        _locationError = 'Failed to get location: $e';
        _isLoadingLocation = false;
      });
    }
  }

  City? _findNearestCity(double lat, double lng) {
    if (_allCities.isEmpty) return null;
    
    City nearest = _allCities[0];
    double minDistance = _calculateDistance(lat, lng, nearest.lat, nearest.lng);
    
    for (var city in _allCities) {
      final distance = _calculateDistance(lat, lng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = city;
      }
    }
    
    return nearest;
  }

  double _calculateDistance(double lat1, double lng1, double lat2, double lng2) {
    // Simple distance calculation (not accurate for long distances, but works for our purpose)
    return (lat1 - lat2).abs() + (lng1 - lng2).abs();
  }

  void _showCitySelection() {
    showDialog(
      context: context,
      builder: (context) => CitySelectionDialog(
        allCities: _allCities,
        selectedCities: cities.map((ct) => ct.city).toList(),
        onCitiesSelected: (selectedCities) {
          _updateSelectedCities(selectedCities);
        },
      ),
    );
  }

  void _updateSelectedCities(List<City> selectedCities) {
    setState(() {
      final now = DateTime.now().toUtc();
      cities = selectedCities.map((city) {
        final existing = cities.firstWhere(
          (ct) => ct.city.id == city.id,
          orElse: () => CityTime(
            city: city,
            currentTime: now.add(Duration(hours: city.utcOffset.toInt())),
          ),
        );
        
        // Preserve current location flag
        if (existing.isCurrentLocation) {
          return CityTime(
            city: city,
            currentTime: now.add(Duration(hours: city.utcOffset.toInt())),
            isCurrentLocation: true,
          );
        }
        
        return CityTime(
          city: city,
          currentTime: now.add(Duration(hours: city.utcOffset.toInt())),
        );
      }).toList();
    });
  }

  void _removeCity(String cityId) {
    setState(() {
      cities.removeWhere((cityTime) => cityTime.city.id == cityId);
    });
  }

  String _formatTime(DateTime time) {
    return DateFormat('HH:mm:ss').format(time);
  }

  String _formatDate(DateTime time) {
    return DateFormat('EEE, MMM d').format(time);
  }

  Color _getTimeColor(DateTime time) {
    final hour = time.hour;
    if (hour >= 6 && hour < 18) {
      return Colors.blue; // Daytime
    } else if (hour >= 18 && hour < 22) {
      return Colors.orange; // Evening
    } else {
      return Colors.deepPurple; // Night
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.access_time, color: Colors.white),
            const SizedBox(width: 8),
            const Text('WorldClope'),
          ],
        ),
        backgroundColor: Colors.blue.shade700,
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _getCurrentLocation,
            tooltip: 'Get Current Location',
          ),
          IconButton(
            icon: const Icon(Icons.location_city),
            onPressed: _showCitySelection,
            tooltip: 'Select Cities',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _updateTimes,
            tooltip: 'Refresh Times',
          ),
        ],
      ),
      body: Column(
        children: [
          // Current location status
          if (_isLoadingLocation || _locationError.isNotEmpty || _currentPosition != null)
            Container(
              padding: const EdgeInsets.all(12),
              color: _isLoadingLocation ? Colors.blue.shade100 : 
                     _locationError.isNotEmpty ? Colors.orange.shade100 : Colors.green.shade100,
              child: Row(
                children: [
                  Icon(
                    _isLoadingLocation ? Icons.gps_fixed : 
                    _locationError.isNotEmpty ? Icons.gps_off : Icons.gps_not_fixed,
                    color: _isLoadingLocation ? Colors.blue : 
                           _locationError.isNotEmpty ? Colors.orange : Colors.green,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _isLoadingLocation ? 'Getting your location...' :
                      _locationError.isNotEmpty ? _locationError :
                      _currentPosition != null ? 
                      'Location: ${_currentPosition!.latitude.toStringAsFixed(4)}°, ${_currentPosition!.longitude.toStringAsFixed(4)}°' :
                      'Location not available',
                      style: TextStyle(
                        color: _isLoadingLocation ? Colors.blue : 
                               _locationError.isNotEmpty ? Colors.orange : Colors.green,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          
          // Current time display
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
            ),
            child: Column(
              children: [
                const Icon(Icons.access_time_filled, 
                  color: Colors.blue, 
                  size: 40,
                ),
                const SizedBox(height: 8),
                StreamBuilder(
                  stream: Stream.periodic(const Duration(seconds: 1)),
                  builder: (context, snapshot) {
                    return Text(
                      DateFormat('HH:mm:ss').format(DateTime.now()),
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
                    );
                  },
                ),
                const SizedBox(height: 4),
                Text(
                  DateFormat('EEEE, MMMM d, yyyy').format(DateTime.now()),
                  style: const TextStyle(
                    color: Colors.blue,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Local Time • ${cities.length} cities',
                  style: TextStyle(
                    color: Colors.blue.shade700,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          
          // World cities list
          Expanded(
            child: cities.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.location_off, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text(
                          'No cities selected',
                          style: TextStyle(fontSize: 18, color: Colors.grey),
                        ),
                        Text(
                          'Tap the city icon to add cities',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: cities.length,
                    itemBuilder: (context, index) {
                      final cityTime = cities[index];
                      final timeColor = _getTimeColor(cityTime.currentTime);
                      
                      return Dismissible(
                        key: Key(cityTime.city.id),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          color: Colors.red,
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          child: const Icon(Icons.delete, color: Colors.white),
                        ),
                        onDismissed: (direction) {
                          _removeCity(cityTime.city.id);
                        },
                        child: Card(
                          margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: timeColor.withOpacity(0.2),
                              child: Stack(
                                children: [
                                  Center(
                                    child: Text(
                                      cityTime.city.flag,
                                      style: const TextStyle(fontSize: 20),
                                    ),
                                  ),
                                  if (cityTime.isCurrentLocation)
                                    Positioned(
                                      right: 0,
                                      bottom: 0,
                                      child: Container(
                                        padding: const EdgeInsets.all(2),
                                        decoration: BoxDecoration(
                                          color: Colors.green,
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: const Icon(
                                          Icons.my_location,
                                          size: 12,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            title: Row(
                              children: [
                                Text(
                                  cityTime.city.name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 18,
                                  ),
                                ),
                                if (cityTime.isCurrentLocation)
                                  Container(
                                    margin: const EdgeInsets.only(left: 8),
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.green.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      'Current',
                                      style: TextStyle(
                                        color: Colors.green.shade700,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: timeColor.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    cityTime.city.timezone,
                                    style: TextStyle(
                                      color: timeColor,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(cityTime.city.country),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(Icons.access_time, color: timeColor, size: 16),
                                    const SizedBox(width: 4),
                                    Text(
                                      _formatDate(cityTime.currentTime),
                                      style: TextStyle(color: timeColor),
                                    ),
                                    const SizedBox(width: 8),
                                    if (_currentPosition != null && !cityTime.isCurrentLocation)
                                      Text(
                                        '${_calculateDistance(
                                          _currentPosition!.latitude,
                                          _currentPosition!.longitude,
                                          cityTime.city.lat,
                                          cityTime.city.lng
                                        ).toStringAsFixed(1)}° away',
                                        style: const TextStyle(fontSize: 11, color: Colors.grey),
                                      ),
                                  ],
                                ),
                              ],
                            ),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  _formatTime(cityTime.currentTime),
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: timeColor,
                                  ),
                                ),
                                Text(
                                  cityTime.currentTime.hour < 12 ? 'AM' : 'PM',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: timeColor.withOpacity(0.7),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
          
          // Footer
          Container(
            padding: const EdgeInsets.all(12),
            color: Colors.grey.shade100,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Cities:'),
                Text(
                  '${cities.length} selected',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const Text('GPS:'),
                Icon(
                  _currentPosition != null ? Icons.check_circle : Icons.gps_off,
                  color: _currentPosition != null ? Colors.green : Colors.grey,
                  size: 16,
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCitySelection,
        backgroundColor: Colors.blue.shade700,
        child: const Icon(Icons.add_location, color: Colors.white),
      ),
    );
  }
}

class CitySelectionDialog extends StatefulWidget {
  final List<City> allCities;
  final List<City> selectedCities;
  final Function(List<City>) onCitiesSelected;

  const CitySelectionDialog({
    super.key,
    required this.allCities,
    required this.selectedCities,
    required this.onCitiesSelected,
  });

  @override
  State<CitySelectionDialog> createState() => _CitySelectionDialogState();
}

class _CitySelectionDialogState extends State<CitySelectionDialog> {
  List<City> _selectedCities = [];
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _selectedCities = List.from(widget.selectedCities);
  }

  List<City> get _filteredCities {
    if (_searchQuery.isEmpty) {
      return widget.allCities;
    }
    return widget.allCities.where((city) {
      return city.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
             city.country.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();
  }

  void _toggleCitySelection(City city) {
    setState(() {
      if (_selectedCities.any((c) => c.id == city.id)) {
        _selectedCities.removeWhere((c) => c.id == city.id);
      } else {
        _selectedCities.add(city);
      }
    });
  }

  void _selectAll() {
    setState(() {
      _selectedCities = List.from(widget.allCities);
    });
  }

  void _clearAll() {
    setState(() {
      _selectedCities.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Select Cities'),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Search bar
            TextField(
              decoration: const InputDecoration(
                hintText: 'Search cities...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
            ),
            const SizedBox(height: 16),
            
            // Selection controls
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_selectedCities.length} selected',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                Row(
                  children: [
                    TextButton(
                      onPressed: _selectAll,
                      child: const Text('Select All'),
                    ),
                    TextButton(
                      onPressed: _clearAll,
                      child: const Text('Clear All'),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),
            
            // Cities list
            SizedBox(
              height: 300,
              child: _filteredCities.isEmpty
                  ? const Center(
                      child: Text('No cities found'),
                    )
                  : ListView.builder(
                      itemCount: _filteredCities.length,
                      itemBuilder: (context, index) {
                        final city = _filteredCities[index];
                        final isSelected = _selectedCities.any((c) => c.id == city.id);
                        
                        return CheckboxListTile(
                          value: isSelected,
                          onChanged: (value) => _toggleCitySelection(city),
                          title: Row(
                            children: [
                              Text(city.flag),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      city.name,
                                      style: const TextStyle(fontWeight: FontWeight.bold),
                                    ),
                                    Text(
                                      city.country,
                                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                'UTC${city.utcOffset >= 0 ? '+' : ''}${city.utcOffset}',
                                style: const TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ],
                          ),
                          secondary: const Icon(Icons.location_city),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            widget.onCitiesSelected(_selectedCities);
            Navigator.pop(context);
          },
          child: const Text('Save Selection'),
        ),
      ],
    );
  }
}