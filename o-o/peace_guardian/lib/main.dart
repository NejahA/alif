import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:async';
import 'dart:math' as math;

void main() {
  runApp(const PeaceGuardianApp());
}

class PeaceGuardianApp extends StatelessWidget {
  const PeaceGuardianApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Peace Guardian - Global Stability',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0A0E12),
        primaryColor: const Color(0xFF00FF9F),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00FF9F),
          secondary: Color(0xFF00D1FF),
          tertiary: Color(0xFFFFB800),
          error: Color(0xFFFF4B4B),
          surface: Color(0xFF161B22),
          onSurface: Colors.white,
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      ),
      home: const PeaceDashboard(),
    );
  }
}

class PeaceDashboard extends StatefulWidget {
  const PeaceDashboard({super.key});

  @override
  State<PeaceDashboard> createState() => _PeaceDashboardState();
}

class _PeaceDashboardState extends State<PeaceDashboard> with TickerProviderStateMixin {
  double _stabilityIndex = 84.5;
  int _defconLevel = 5;
  bool _treatySigned = false;
  
  final List<Map<String, dynamic>> _hotspots = [
    {"region": "Pacific Rim", "tension": 45.0, "status": "Stable"},
    {"region": "Eastern Europe", "tension": 78.0, "status": "High Tension"},
    {"region": "Middle East", "tension": 62.0, "status": "Unstable"},
    {"region": "Arctic Frontier", "tension": 12.0, "status": "Calm"},
  ];
  
  final List<String> _diplomacyLog = [
    "[INFO] Peace Guardian System Online.",
    "[DIPLOMACY] Treaty signed between Node-A and Node-B.",
    "[SCAN] Monitoring global stability...",
  ];

  final List<String> _globalFeed = [
    "UN Secretary General calls for immediate de-escalation in Eastern Europe.",
    "New peace treaty proposed for Arctic resources sharing.",
    "Global stability index shows 2% improvement in last 24 hours.",
    "Silo maintenance scheduled for North American sector.",
    "Diplomatic breakthrough in Middle East summit.",
  ];

  late Timer _dataTimer;
  late AnimationController _pulseController;
  late AnimationController _glitchController;
  final ScrollController _feedScrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _glitchController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    )..repeat(reverse: true);

    _startSimulation();
    _startFeedAutoScroll();
  }

  void _startSimulation() {
    _dataTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (mounted && !_treatySigned) {
        setState(() {
          _stabilityIndex += (math.Random().nextDouble() - 0.5) * 2;
          _stabilityIndex = _stabilityIndex.clamp(0, 100);
          
          // Auto-calculate DEFCON based on stability
          if (_stabilityIndex > 90) {
            _defconLevel = 5;
          } else if (_stabilityIndex > 70) {
            _defconLevel = 4;
          } else if (_stabilityIndex > 50) {
            _defconLevel = 3;
          } else if (_stabilityIndex > 30) {
            _defconLevel = 2;
          } else {
            _defconLevel = 1;
          }

          if (math.Random().nextDouble() > 0.8) {
            _addLogEntry("[SCAN] Stability fluctuate: ${_stabilityIndex.toStringAsFixed(1)}%");
          }
        });
      }
    });
  }

  void _startFeedAutoScroll() {
    Timer.periodic(const Duration(seconds: 5), (timer) {
      if (mounted && _feedScrollController.hasClients) {
        final maxScroll = _feedScrollController.position.maxScrollExtent;
        final currentScroll = _feedScrollController.offset;
        final nextScroll = (currentScroll + 100) > maxScroll ? 0.0 : currentScroll + 100;
        
        _feedScrollController.animateTo(
          nextScroll,
          duration: const Duration(seconds: 1),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  void _addLogEntry(String msg) {
    setState(() {
      _diplomacyLog.insert(0, "[${DateTime.now().hour}:${DateTime.now().minute}:${DateTime.now().second}] $msg");
      if (_diplomacyLog.length > 20) _diplomacyLog.removeLast();
    });
  }

  void _editHotspot(int index) {
    final h = _hotspots[index];
    double newTension = h['tension'].toDouble();
    final nameController = TextEditingController(text: h['region']);

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF161B22),
          title: Text("EDIT HOTSPOT", style: GoogleFonts.orbitron(color: const Color(0xFF00FF9F))),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: "Region Name", labelStyle: TextStyle(color: Colors.white54)),
              ),
              const SizedBox(height: 20),
              Text("Tension Level: ${newTension.toStringAsFixed(1)}%", style: GoogleFonts.spaceMono()),
              Slider(
                value: newTension,
                min: 0,
                max: 100,
                activeColor: _getTensionColor(newTension),
                onChanged: (val) => setDialogState(() => newTension = val),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text("CANCEL")),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _hotspots[index]['region'] = nameController.text;
                  _hotspots[index]['tension'] = newTension;
                  _hotspots[index]['status'] = _getStatusFromTension(newTension);
                  _calculateGlobalStability();
                });
                Navigator.pop(context);
                _addLogEntry("[CONFIG] Hotspot '${nameController.text}' manually updated.");
              },
              child: const Text("SAVE"),
            ),
          ],
        ),
      ),
    );
  }

  void _calculateGlobalStability() {
    double totalTension = 0;
    for (var h in _hotspots) {
      totalTension += h['tension'];
    }
    setState(() {
      _stabilityIndex = 100 - (totalTension / _hotspots.length);
    });
  }

  void _deescalateHotspot(int index) {
    setState(() {
      _hotspots[index]['tension'] = math.max(0.0, _hotspots[index]['tension'] - 15.0);
      _hotspots[index]['status'] = _getStatusFromTension(_hotspots[index]['tension']);
      _calculateGlobalStability();
    });
    _addLogEntry("[ACTION] De-escalation initiated in ${_hotspots[index]['region']}.");
  }

  void _initiateGlobalPeace() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF161B22),
        title: Text("PEACE TREATY SIGNATURE", style: GoogleFonts.orbitron(color: const Color(0xFF00FF9F))),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text("By signing this document, you authorize the global de-activation of all strategic nuclear assets."),
            const SizedBox(height: 24),
            Container(
              height: 150,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                border: Border.all(color: Colors.white10),
              ),
              child: Center(
                child: Text("SIGN HERE", style: GoogleFonts.caveat(fontSize: 32, color: Colors.white24)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("ABORT")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF9F), foregroundColor: Colors.black),
            onPressed: () {
              Navigator.pop(context);
              _triggerPeaceEffect();
            },
            child: const Text("SIGN & DEPLOY"),
          ),
        ],
      ),
    );
  }

  void _triggerPeaceEffect() {
    setState(() {
      _treatySigned = true;
      _stabilityIndex = 100.0;
      _defconLevel = 5;
      for (var hotspot in _hotspots) {
        hotspot['tension'] = 0.0;
        hotspot['status'] = "PEACE ACHIEVED";
      }
    });
    _addLogEntry("[CRITICAL] GLOBAL PEACE PROTOCOL ACTIVATED.");
    _addLogEntry("[STATUS] ALL NUCLEAR SILOS DEACTIVATED.");
    _addLogEntry("[SUCCESS] NUCLEAR WAR STOPPED FOREVER.");
  }

  @override
  void dispose() {
    _dataTimer.cancel();
    _pulseController.dispose();
    _glitchController.dispose();
    _feedScrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 16),
              _buildGlobalNewsFeed(),
              const SizedBox(height: 24),
              Expanded(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(flex: 3, child: _buildMainDashboard()),
                    const SizedBox(width: 24),
                    Expanded(flex: 2, child: _buildSidePanel()),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  "PEACE GUARDIAN",
                  style: GoogleFonts.orbitron(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF00FF9F),
                    letterSpacing: 2,
                  ),
                ),
                if (_treatySigned) ...[
                  const SizedBox(width: 12),
                  const Icon(Icons.verified, color: Color(0xFF00FF9F)),
                ],
              ],
            ),
            Text(
              "GLOBAL STABILITY MONITORING SYSTEM",
              style: GoogleFonts.spaceMono(
                fontSize: 12,
                color: Colors.white54,
                letterSpacing: 1.5,
              ),
            ),
          ],
        ),
        _buildDefconIndicator(),
      ],
    );
  }

  Widget _buildDefconIndicator() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _getDefconColor().withOpacity(0.1),
        border: Border.all(color: _getDefconColor()),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text("DEFCON", style: GoogleFonts.orbitron(fontSize: 10, color: _getDefconColor())),
          Text(
            "$_defconLevel",
            style: GoogleFonts.orbitron(fontSize: 24, fontWeight: FontWeight.bold, color: _getDefconColor()),
          ),
        ],
      ),
    );
  }

  Widget _buildGlobalNewsFeed() {
    return Container(
      height: 40,
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF161B22),
        border: Border.all(color: Colors.white10),
      ),
      child: ListView.builder(
        controller: _feedScrollController,
        scrollDirection: Axis.horizontal,
        itemCount: _globalFeed.length,
        itemBuilder: (context, index) => Center(
          child: Padding(
            padding: const EdgeInsets.only(right: 48.0),
            child: Row(
              children: [
                const Icon(Icons.radio, size: 14, color: Color(0xFF00D1FF)),
                const SizedBox(width: 8),
                Text(
                  _globalFeed[index].toUpperCase(),
                  style: GoogleFonts.spaceMono(fontSize: 10, color: Colors.white70),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMainDashboard() {
    return Column(
      children: [
        _buildStabilityCard(),
        const SizedBox(height: 24),
        Expanded(child: _buildHotspotsList()),
      ],
    );
  }

  Widget _buildStabilityCard() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: const Color(0xFF161B22),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        children: [
          Text("GLOBAL STABILITY INDEX", style: GoogleFonts.spaceMono(fontSize: 14, color: Colors.white70)),
          const SizedBox(height: 24),
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 180,
                height: 180,
                child: CircularProgressIndicator(
                  value: _stabilityIndex / 100,
                  strokeWidth: 12,
                  backgroundColor: Colors.white10,
                  valueColor: AlwaysStoppedAnimation<Color>(_getStabilityColor()),
                ),
              ),
              Column(
                children: [
                  Text(
                    "${_stabilityIndex.toStringAsFixed(1)}%",
                    style: GoogleFonts.orbitron(fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    _getStabilityStatus(),
                    style: GoogleFonts.spaceMono(fontSize: 12, color: _getStabilityColor()),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: _treatySigned ? const Color(0xFF00FF9F).withOpacity(0.1) : const Color(0xFFFF4B4B).withOpacity(0.1),
                side: BorderSide(color: _treatySigned ? const Color(0xFF00FF9F) : const Color(0xFFFF4B4B)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: _treatySigned ? null : _initiateGlobalPeace,
              child: Text(
                _treatySigned ? "PEACE SECURED" : "STOP NUCLEAR WAR PROTOCOL",
                style: GoogleFonts.orbitron(
                  color: _treatySigned ? const Color(0xFF00FF9F) : const Color(0xFFFF4B4B), 
                  fontWeight: FontWeight.bold
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHotspotsList() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF161B22),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("REGIONAL TENSION MONITOR", style: GoogleFonts.spaceMono(fontSize: 14, color: Colors.white70)),
              Text("EDITABLE DATA", style: GoogleFonts.spaceMono(fontSize: 10, color: const Color(0xFF00D1FF))),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.separated(
              itemCount: _hotspots.length,
              separatorBuilder: (context, index) => const Divider(color: Colors.white10),
              itemBuilder: (context, index) {
                final h = _hotspots[index];
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  onTap: () => _editHotspot(index),
                  title: Text(h['region'], style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text("Status: ${h['status']}", style: TextStyle(color: _getTensionColor(h['tension']), fontSize: 12)),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text("${h['tension'].toStringAsFixed(1)}%", style: GoogleFonts.spaceMono(color: _getTensionColor(h['tension']))),
                      const SizedBox(width: 8),
                      IconButton(
                        onPressed: () => _deescalateHotspot(index),
                        icon: const Icon(Icons.handshake_outlined, color: Color(0xFF00FF9F)),
                        tooltip: "Initiate Diplomacy",
                      ),
                      const Icon(Icons.edit, size: 14, color: Colors.white24),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidePanel() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1117),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("DIPLOMACY LOG", style: GoogleFonts.spaceMono(fontSize: 14, color: Colors.white70)),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: _diplomacyLog.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: Text(
                    _diplomacyLog[index],
                    style: GoogleFonts.spaceMono(fontSize: 11, color: _getLogColor(_diplomacyLog[index])),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Color _getStabilityColor() {
    if (_stabilityIndex > 80) return const Color(0xFF00FF9F);
    if (_stabilityIndex > 50) return const Color(0xFFFFB800);
    return const Color(0xFFFF4B4B);
  }

  String _getStabilityStatus() {
    if (_stabilityIndex > 80) return "GLOBAL STABILITY OPTIMAL";
    if (_stabilityIndex > 50) return "CAUTION: RISING TENSIONS";
    return "CRITICAL: WAR IMMINENT";
  }

  Color _getTensionColor(double tension) {
    if (tension < 30) return const Color(0xFF00FF9F);
    if (tension < 60) return const Color(0xFF00D1FF);
    if (tension < 80) return const Color(0xFFFFB800);
    return const Color(0xFFFF4B4B);
  }

  String _getStatusFromTension(double tension) {
    if (tension < 30) return "Stable";
    if (tension < 60) return "Calm";
    if (tension < 80) return "High Tension";
    return "Unstable";
  }

  Color _getDefconColor() {
    switch (_defconLevel) {
      case 5: return const Color(0xFF00FF9F);
      case 4: return const Color(0xFF00D1FF);
      case 3: return const Color(0xFFFFB800);
      case 2: return Colors.orange;
      case 1: return const Color(0xFFFF4B4B);
      default: return Colors.white;
    }
  }

  Color _getLogColor(String log) {
    if (log.contains("CRITICAL")) return const Color(0xFFFF4B4B);
    if (log.contains("SUCCESS")) return const Color(0xFF00FF9F);
    if (log.contains("ACTION")) return const Color(0xFF00D1FF);
    if (log.contains("CONFIG")) return const Color(0xFFFFB800);
    return Colors.white54;
  }
}
