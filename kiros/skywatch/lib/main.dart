import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';
import 'package:weather_icons/weather_icons.dart';
import 'package:shimmer/shimmer.dart';
import 'dart:async';

void main() {
  runApp(const SkyWatchApp());
}

class SkyWatchApp extends StatelessWidget {
  const SkyWatchApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SkyWatch',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      darkTheme: ThemeData.dark(),
      themeMode: ThemeMode.dark,
      home: const WeatherScreen(),
    );
  }
}

class WeatherScreen extends StatefulWidget {
  const WeatherScreen({super.key});

  @override
  State<WeatherScreen> createState() => _WeatherScreenState();
}

class _WeatherScreenState extends State<WeatherScreen> {
  WeatherData? _weatherData;
  bool _isLoading = true;
  String _error = '';
  String _cityName = 'New York, US';
  List<String> _cities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney'];
  int _currentCityIndex = 0;
  Timer? _autoRefreshTimer;

  @override
  void initState() {
    super.initState();
    _getWeather();
    // Auto-refresh every 5 minutes
    _autoRefreshTimer = Timer.periodic(const Duration(minutes: 5), (timer) {
      _getWeather();
    });
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _getWeather() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      // Simulate API delay
      await Future.delayed(const Duration(seconds: 1));

      // Mock weather data for different cities
      final mockWeatherData = {
        'New York': WeatherData(
          temperature: 22.5,
          condition: 'Clear',
          description: 'Clear sky',
          humidity: 65.0,
          windSpeed: 5.2,
          pressure: 1013.0,
          visibility: 10.0,
          sunrise: DateTime.now().subtract(const Duration(hours: 2)),
          sunset: DateTime.now().add(const Duration(hours: 6)),
          cityName: 'New York',
          country: 'US',
          feelsLike: 23.0,
          uvIndex: 6.0,
          precipitation: 0.0,
        ),
        'London': WeatherData(
          temperature: 15.3,
          condition: 'Clouds',
          description: 'Partly cloudy',
          humidity: 78.0,
          windSpeed: 3.8,
          pressure: 1015.0,
          visibility: 8.0,
          sunrise: DateTime.now().subtract(const Duration(hours: 1)),
          sunset: DateTime.now().add(const Duration(hours: 7)),
          cityName: 'London',
          country: 'UK',
          feelsLike: 14.0,
          uvIndex: 3.0,
          precipitation: 20.0,
        ),
        'Tokyo': WeatherData(
          temperature: 28.7,
          condition: 'Rain',
          description: 'Light rain',
          humidity: 85.0,
          windSpeed: 2.5,
          pressure: 1010.0,
          visibility: 5.0,
          sunrise: DateTime.now().subtract(const Duration(hours: 3)),
          sunset: DateTime.now().add(const Duration(hours: 5)),
          cityName: 'Tokyo',
          country: 'JP',
          feelsLike: 30.0,
          uvIndex: 8.0,
          precipitation: 60.0,
        ),
        'Paris': WeatherData(
          temperature: 19.8,
          condition: 'Clear',
          description: 'Sunny',
          humidity: 60.0,
          windSpeed: 4.1,
          pressure: 1012.0,
          visibility: 12.0,
          sunrise: DateTime.now().subtract(const Duration(hours: 1, minutes: 30)),
          sunset: DateTime.now().add(const Duration(hours: 6, minutes: 30)),
          cityName: 'Paris',
          country: 'FR',
          feelsLike: 19.0,
          uvIndex: 5.0,
          precipitation: 0.0,
        ),
        'Sydney': WeatherData(
          temperature: 25.4,
          condition: 'Clouds',
          description: 'Mostly cloudy',
          humidity: 70.0,
          windSpeed: 6.3,
          pressure: 1014.0,
          visibility: 9.0,
          sunrise: DateTime.now().subtract(const Duration(hours: 4)),
          sunset: DateTime.now().add(const Duration(hours: 4)),
          cityName: 'Sydney',
          country: 'AU',
          feelsLike: 26.0,
          uvIndex: 7.0,
          precipitation: 10.0,
        ),
      };

      final currentCity = _cities[_currentCityIndex];
      setState(() {
        _weatherData = mockWeatherData[currentCity];
        _cityName = '$currentCity, ${_weatherData!.country}';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to get weather data: $e';
        _isLoading = false;
      });
    }
  }

  void _nextCity() {
    setState(() {
      _currentCityIndex = (_currentCityIndex + 1) % _cities.length;
    });
    _getWeather();
  }

  void _previousCity() {
    setState(() {
      _currentCityIndex = (_currentCityIndex - 1 + _cities.length) % _cities.length;
    });
    _getWeather();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SkyWatch'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _getWeather,
          ),
        ],
      ),
      body: _isLoading
          ? _buildLoading()
          : _error.isNotEmpty
              ? _buildError()
              : _buildWeatherContent(),
    );
  }

  Widget _buildLoading() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(),
          const SizedBox(height: 20),
          const Text('Fetching weather data...'),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: Colors.red),
          const SizedBox(height: 20),
          Text(
            _error,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 16),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _getWeather,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildWeatherContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // City selector
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios),
                    onPressed: _previousCity,
                  ),
                  Expanded(
                    child: Column(
                      children: [
                        Text(
                          _cityName,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
                          style: const TextStyle(
                            fontSize: 16,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.arrow_forward_ios),
                    onPressed: _nextCity,
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Temperature and condition
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Text(
                    '${_weatherData!.temperature.toStringAsFixed(1)}°C',
                    style: const TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _weatherData!.condition,
                    style: const TextStyle(fontSize: 20),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _weatherData!.description,
                    style: const TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.thermostat, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        'Feels like ${_weatherData!.feelsLike.toStringAsFixed(1)}°C',
                        style: const TextStyle(fontSize: 14),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Weather details grid
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            childAspectRatio: 1.5,
            children: [
              _buildWeatherDetail('Humidity', '${_weatherData!.humidity}%', Icons.water_drop, Colors.blue),
              _buildWeatherDetail('Wind', '${_weatherData!.windSpeed} m/s', Icons.air, Colors.green),
              _buildWeatherDetail('Pressure', '${_weatherData!.pressure} hPa', Icons.speed, Colors.orange),
              _buildWeatherDetail('Visibility', '${_weatherData!.visibility} km', Icons.visibility, Colors.purple),
              _buildWeatherDetail('UV Index', '${_weatherData!.uvIndex}', Icons.wb_sunny, Colors.yellow),
              _buildWeatherDetail('Precipitation', '${_weatherData!.precipitation}%', Icons.cloud, Colors.blueGrey),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Sunrise/Sunset
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    children: [
                      const Icon(Icons.wb_twilight, color: Colors.orange, size: 32),
                      const SizedBox(height: 8),
                      const Text('Sunrise', style: TextStyle(fontSize: 12)),
                      Text(
                        _weatherData!.sunrise.toString().substring(11, 16),
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      const Icon(Icons.nightlight, color: Colors.blue, size: 32),
                      const SizedBox(height: 8),
                      const Text('Sunset', style: TextStyle(fontSize: 12)),
                      Text(
                        _weatherData!.sunset.toString().substring(11, 16),
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Weather forecast for next 5 days
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '5-Day Forecast',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ...List.generate(5, (index) {
                    final day = DateTime.now().add(Duration(days: index));
                    final temp = _weatherData!.temperature + (index * 2) - 4;
                    final conditions = ['Sunny', 'Cloudy', 'Rain', 'Clear', 'Partly Cloudy'];
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            index == 0 ? 'Today' : day.toString().substring(0, 10),
                            style: const TextStyle(fontSize: 16),
                          ),
                          Text(
                            conditions[index % conditions.length],
                            style: const TextStyle(fontSize: 16),
                          ),
                          Text(
                            '${temp.toStringAsFixed(1)}°C',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWeatherDetail(String label, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}

class WeatherData {
  final double temperature;
  final String condition;
  final String description;
  final double humidity;
  final double windSpeed;
  final double pressure;
  final double visibility;
  final DateTime sunrise;
  final DateTime sunset;
  final String cityName;
  final String country;
  final double feelsLike;
  final double uvIndex;
  final double precipitation;

  WeatherData({
    required this.temperature,
    required this.condition,
    required this.description,
    required this.humidity,
    required this.windSpeed,
    required this.pressure,
    required this.visibility,
    required this.sunrise,
    required this.sunset,
    required this.cityName,
    required this.country,
    required this.feelsLike,
    required this.uvIndex,
    required this.precipitation,
  });
}