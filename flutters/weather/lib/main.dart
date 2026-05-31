import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
import 'package:marquee/marquee.dart';
import 'services/location_service.dart';
import 'services/reverse_geocoding_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Weather & Night Sky',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const WeatherHomePage(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class WeatherHomePage extends StatefulWidget {
  const WeatherHomePage({super.key});

  @override
  State<WeatherHomePage> createState() => _WeatherHomePageState();
}

class _WeatherHomePageState extends State<WeatherHomePage> {
  String city = 'Loading...';
  String? countryCode;
  double? currentTemp;
  String? currentDescription;
  List<Map<String, dynamic>> dailyForecast = [];

  final TextEditingController _cityController = TextEditingController();
  final TextEditingController _noteController = TextEditingController();

  String currentTime = '';
  String currentDate = '';
  String? sunrise;
  String? sunset;
  String? placeDescription;
  String? cityImageUrl;
  String? flagUrl;

  bool isLoading = true;
  String hemisphere = 'Northern';

  late Timer _clockTimer;

  final List<Map<String, String>> allStars = [
    // Northern Hemisphere
    {
      'title': 'Sirius',
      'desc': 'The brightest star in the entire night sky. Located in Canis Major, known as the "Dog Star".',
      'url': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80'
    },
    {
      'title': 'Betelgeuse',
      'desc': 'Red supergiant star marking Orion\'s left shoulder. Famous for its orange-red color.',
      'url': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80'
    },
    {
      'title': 'Rigel',
      'desc': 'Brilliant blue-white supergiant in Orion\'s right foot. One of the most luminous stars visible.',
      'url': 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200&q=80'
    },
    {
      'title': 'Aldebaran',
      'desc': 'Bright orange giant star forming the fiery eye of Taurus the Bull.',
      'url': 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=1200&q=80'
    },
    {
      'title': 'Capella',
      'desc': 'Golden-yellow star in Auriga. Sixth brightest in the night sky.',
      'url': 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=1200&q=80'
    },
    {
      'title': 'Procyon',
      'desc': 'Bright star in Canis Minor, meaning "before the dog" as it rises before Sirius.',
      'url': 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200&q=80'
    },
    {
      'title': 'Pollux & Castor',
      'desc': 'The twin stars of Gemini. Pollux is the brighter, slightly orange one.',
      'url': 'https://images.unsplash.com/photo-1505506874110-6a7a69069a08?w=1200&q=80'
    },
    {
      'title': 'Pleiades (M45)',
      'desc': 'Stunning open cluster known as the "Seven Sisters". Easily visible to the naked eye.',
      'url': 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&q=80'
    },
    // Southern Hemisphere
    {
      'title': 'Canopus',
      'desc': 'Second brightest star in the night sky. White supergiant in Carina.',
      'url': 'https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?w=1200&q=80'
    },
    {
      'title': 'Alpha Centauri',
      'desc': 'Closest star system to Earth (4.3 light years). Rigil Kentaurus is the brightest component.',
      'url': 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200&q=80'
    },
    {
      'title': 'Achernar',
      'desc': 'Bright blue star marking the end of Eridanus the River.',
      'url': 'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=1200&q=80'
    },
    {
      'title': 'Antares',
      'desc': 'Red supergiant heart of Scorpius. Its name means "rival of Mars".',
      'url': 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1200&q=80'
    },
    {
      'title': 'Southern Cross (Crux)',
      'desc': 'Most famous southern constellation. Used for navigation in the Southern Hemisphere.',
      'url': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'
    },
  ];

  List<Map<String, String>> get visibleStars {
    if (hemisphere == 'Northern') {
      return allStars.sublist(0, 8);
    } else {
      return allStars.sublist(8);
    }
  }

  @override
  void initState() {
    super.initState();
    _startLiveClock();
    _getCurrentLocationWeather();
  }

  @override
  void dispose() {
    _clockTimer.cancel();
    _noteController.dispose();
    super.dispose();
  }

  // Live clock — updates every minute (only HH:mm)
  void _startLiveClock() {
    _updateClock();
    _clockTimer = Timer.periodic(const Duration(minutes: 1), (timer) {
      if (mounted) {
        _updateClock();
      }
    });
  }

  void _updateClock() {
    final now = DateTime.now();
    setState(() {
      currentTime = DateFormat('HH:mm').format(now);
      currentDate = DateFormat('EEEE, MMM d').format(now);
    });
  }

  Future<void> _loadNoteForCity() async {
    final prefs = await SharedPreferences.getInstance();
    final note = prefs.getString('note_$city') ?? '';
    setState(() {
      _noteController.text = note;
    });
  }

  Future<void> _saveNoteForCity() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('note_$city', _noteController.text);
  }

  String getWeatherDescription(int code) {
    switch (code) {
      case 0: return 'Clear sky';
      case 1: case 2: case 3: return 'Partly cloudy';
      case 45: case 48: return 'Fog';
      case 51: case 53: case 55: return 'Drizzle';
      case 61: case 63: case 65: return 'Rain';
      case 71: case 73: case 75: return 'Snow';
      case 95: case 96: case 99: return 'Thunderstorm';
      default: return 'Cloudy';
    }
  }

  String getFlagUrl(String code) => 'https://flagcdn.com/h120/${code.toLowerCase()}.png';

  Future<String?> _fetchPlaceDescription(String cityName) async {
    try {
      final url = 'https://en.wikipedia.org/api/rest_v1/page/summary/${Uri.encodeComponent(cityName)}';
      final response = await http.get(Uri.parse(url)).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['extract']?.toString().trim();
      }
    } catch (e) {}
    return null;
  }

  Future<void> _getCurrentLocationWeather() async {
    setState(() => isLoading = true);
    
    try {
      // Get GPS coordinates using LocationService
      final locationResult = await LocationService().getCurrentLocation();
      
      // Handle location errors
      if (locationResult.hasError) {
        switch (locationResult.error!) {
          case LocationError.serviceDisabled:
            _showError('Location services disabled');
            return;
          case LocationError.permissionDenied:
            _showError('Location permissions denied');
            return;
          case LocationError.permissionDeniedForever:
            _showError('Location permissions denied forever. Enable in settings.');
            return;
          case LocationError.timeout:
            _showError('Failed to get location: timeout');
            return;
          case LocationError.unknown:
            _showError('Failed to get location: unknown error');
            return;
        }
      }
      
      // Set hemisphere from location result
      setState(() => hemisphere = locationResult.hemisphere!);
      
      // Perform reverse geocoding
      final cityResult = await ReverseGeocodingService().reverseGeocode(
        locationResult.latitude!,
        locationResult.longitude!,
      );
      
      // Determine city name and country code
      String cityName;
      String? countryCode;
      
      if (cityResult.hasError) {
        // Fallback to "Your Location" if reverse geocoding fails
        cityName = 'Your Location';
        countryCode = null;
      } else {
        cityName = cityResult.cityName;
        countryCode = cityResult.countryCode;
      }
      
      // Auto-populate city input field
      _cityController.text = cityName;
      
      // Fetch weather with detected city
      await _fetchWeather(
        lat: locationResult.latitude!,
        lon: locationResult.longitude!,
        cityName: cityName,
        countryCode: countryCode,
      );
    } catch (e) {
      _showError('Failed to get location: $e');
    }
  }

  Future<void> _searchCity(String cityName) async {
    if (cityName.trim().isEmpty) return;
    setState(() => isLoading = true);
    try {
      final geoUrl = 'https://geocoding-api.open-meteo.com/v1/search?name=${Uri.encodeComponent(cityName)}&count=1&language=en';
      final response = await http.get(Uri.parse(geoUrl)).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['results'] != null && data['results'].isNotEmpty) {
          final result = data['results'][0];
          final fullName = '${result['name']}${result['admin1'] != null ? ', ${result['admin1']}' : ''}, ${result['country']}';
          setState(() => hemisphere = result['latitude'] >= 0 ? 'Northern' : 'Southern');
          await _fetchWeather(lat: result['latitude'], lon: result['longitude'], cityName: fullName, countryCode: result['country_code']);
        } else {
          _showError('City not found');
        }
      }
    } catch (e) {
      _showError('Search failed: $e');
    }
  }

  Future<void> _fetchWeather({
    required double lat,
    required double lon,
    required String cityName,
    required String? countryCode,
  }) async {
    try {
      final url = 'https://api.open-meteo.com/v1/forecast?'
          'latitude=$lat&longitude=$lon'
          '&current=temperature_2m,weather_code'
          '&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset'
          '&temperature_unit=celsius&timezone=auto';

      final response = await http.get(Uri.parse(url)).timeout(const Duration(seconds: 15));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final now = DateTime.now().toUtc().add(Duration(seconds: data['utc_offset_seconds']));
        final cityForWiki = cityName.split(',').first.trim();

        String? imgUrl;
        try {
          final wikiUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/${Uri.encodeComponent(cityForWiki)}';
          final wikiResp = await http.get(Uri.parse(wikiUrl));
          if (wikiResp.statusCode == 200) {
            final wikiData = json.decode(wikiResp.body);
            imgUrl = wikiData['thumbnail']?['source'];
          }
        } catch (e) {}

        final desc = await _fetchPlaceDescription(cityForWiki);

        setState(() {
          city = cityName;
          this.countryCode = countryCode;
          flagUrl = countryCode != null ? getFlagUrl(countryCode) : null;
          cityImageUrl = imgUrl;
          currentTemp = data['current']['temperature_2m'];
          currentDescription = getWeatherDescription(data['current']['weather_code']);
          currentTime = DateFormat('HH:mm').format(now);
          currentDate = DateFormat('EEEE, MMM d').format(now);
          sunrise = data['daily']['sunrise'][0].substring(11, 16);
          sunset = data['daily']['sunset'][0].substring(11, 16);
          placeDescription = desc ?? 'No description available';

          dailyForecast = [];
          for (int i = 0; i < data['daily']['time'].length; i++) {
            dailyForecast.add({
              'date': DateFormat('EEE').format(DateTime.parse(data['daily']['time'][i])),
              'max': data['daily']['temperature_2m_max'][i],
              'min': data['daily']['temperature_2m_min'][i],
              'code': data['daily']['weather_code'][i],
            });
          }
          isLoading = false;
        });

        await _loadNoteForCity();
      } else {
        _showError('Failed to load weather');
      }
    } catch (e) {
      _showError('Error: $e');
    }
  }

  void _showError(String msg) {
    setState(() => isLoading = false);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Weather & Night Sky')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _cityController,
                    decoration: const InputDecoration(labelText: 'Enter city', border: OutlineInputBorder()),
                    onSubmitted: _searchCity,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(icon: const Icon(Icons.search), onPressed: isLoading ? null : () => _searchCity(_cityController.text)),
              ],
            ),
            const SizedBox(height: 20),
            if (isLoading)
              const Center(child: CircularProgressIndicator())
            else if (currentTemp != null)
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (cityImageUrl != null)
                        ClipRRect(borderRadius: BorderRadius.circular(16), child: Image.network(cityImageUrl!, height: 200, width: double.infinity, fit: BoxFit.cover)),
                      const SizedBox(height: 20),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          if (flagUrl != null)
                            Padding(
                              padding: const EdgeInsets.only(right: 12.0),
                              child: Image.network(flagUrl!, height: 40),
                            ),
                          Expanded(
                            child: SizedBox(
                              height: 60,
                              child: city.length > 20 // Simple check to start scrolling only when needed
                                  ? Marquee(
                                      text: city,
                                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                                      scrollAxis: Axis.horizontal,
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      blankSpace: 100.0,
                                      velocity: 40.0,
                                      pauseAfterRound: const Duration(seconds: 2),
                                      startPadding: 10.0,
                                      accelerationDuration: const Duration(seconds: 1),
                                      accelerationCurve: Curves.linear,
                                      decelerationDuration: const Duration(seconds: 1),
                                      decelerationCurve: Curves.easeOut,
                                    )
                                  : Text(
                                      city,
                                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                                    ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Center(child: Text(currentDate, style: const TextStyle(fontSize: 20))),
                      Center(child: Text(currentTime, style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold))),
                      const SizedBox(height: 10),
                      Center(child: Text('$currentTemp°C', style: const TextStyle(fontSize: 64))),
                      Center(child: Text(currentDescription ?? '', style: const TextStyle(fontSize: 24))),
                      const SizedBox(height: 20),
                      Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
                        Column(children: [const Icon(Icons.nights_stay), Text('Sunset\n$sunset')]),
                        Column(children: [const Icon(Icons.wb_sunny), Text('Sunrise\n$sunrise')]),
                      ]),
                      const SizedBox(height: 30),
                      const Text('About this place', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                      const Divider(),
                      Text(placeDescription ?? '', style: const TextStyle(fontSize: 16), textAlign: TextAlign.justify),
                      const SizedBox(height: 30),
                      const Text('Your Notes for this Location', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                      const Divider(),
                      TextField(
                        controller: _noteController,
                        maxLines: 4,
                        decoration: const InputDecoration(
                          hintText: 'Write your personal notes here...',
                          border: OutlineInputBorder(),
                        ),
                        onChanged: (value) => _saveNoteForCity(),
                      ),
                      const SizedBox(height: 40),
                      Text(
                        'Visible Stars Tonight\n($hemisphere Hemisphere)',
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        height: 420,
                        child: PageView.builder(
                          itemCount: visibleStars.length,
                          itemBuilder: (context, index) {
                            final star = visibleStars[index];
                            return Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 4.0),
                              child: Stack(
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(20),
                                    child: Image.network(
                                      star['url']!,
                                      width: double.infinity,
                                      height: double.infinity,
                                      fit: BoxFit.cover,
                                      loadingBuilder: (c, child, progress) => progress == null
                                          ? child
                                          : Container(color: Colors.black, child: const Center(child: CircularProgressIndicator(color: Colors.white))),
                                      errorBuilder: (c, e, s) => Container(
                                        color: Colors.black,
                                        child: const Icon(Icons.error, color: Colors.white, size: 60),
                                      ),
                                    ),
                                  ),
                                  Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(20),
                                      gradient: LinearGradient(
                                        begin: Alignment.topCenter,
                                        end: Alignment.bottomCenter,
                                        colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
                                        stops: const [0.4, 1.0],
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    bottom: 20,
                                    left: 20,
                                    right: 20,
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          star['title']!,
                                          style: const TextStyle(
                                            fontSize: 28,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                            shadows: [Shadow(blurRadius: 10, color: Colors.black)],
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          star['desc']!,
                                          style: const TextStyle(
                                            fontSize: 18,
                                            color: Colors.white,
                                            shadows: [Shadow(blurRadius: 8, color: Colors.black)],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 30),
                      const Text('7-Day Forecast', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                      const Divider(),
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: dailyForecast.length,
                        itemBuilder: (c, i) {
                          final day = dailyForecast[i];
                          return Card(
                            child: ListTile(
                              leading: Text(day['date'], style: const TextStyle(fontSize: 18)),
                              title: Text('${day['max']}° / ${day['min']}°C', textAlign: TextAlign.center),
                              trailing: Text(getWeatherDescription(day['code']), style: const TextStyle(fontSize: 16)),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              )
            else
              const Center(child: Text('No data')),
          ],
        ), 
      ),
    );
  }
}