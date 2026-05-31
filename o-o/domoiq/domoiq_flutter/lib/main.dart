import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'api_service.dart';
import 'models.dart';
import 'admin_screen.dart';

void main() {
  runApp(const DomoiqApp());
}

class DomoiqApp extends StatelessWidget {
  const DomoiqApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DOMOIQ',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF060712),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00F2FF),
          secondary: Color(0xFF7000FF),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF090A10),
          elevation: 0,
        ),
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _oracleController = TextEditingController();
  final _broadcastController = TextEditingController();
  final _scrollController = ScrollController();

  String _timeline = 'PRIME';
  String _category = 'All';
  String _oracleMode = 'Visionary';
  String _oracleResponse = '';
  final String _userName = 'MobileSeer';

  bool _isLoading = false;
  bool _isSubmittingOracle = false;
  bool _isSendingBroadcast = false;

  List<Insight> _insights = [];
  Stats? _stats;
  List<String> _news = [];
  List<Broadcast> _broadcasts = [];
  List<SystemEvent> _events = [];
  List<Mission> _missions = [];
  List<Anomaly> _anomalies = [];
  List<Seer> _seers = [];
  Weather? _weather;
  SystemState? _system;

  static const _timelines = ['PRIME', 'VOID', 'NEON'];
  static const _categories = [
    'All',
    'Technological',
    'Digital',
    'Biological',
    'Ecological',
    'Interstellar',
  ];

  Color get _timelineColor {
    if (_timeline == 'VOID') return const Color(0xFFFF0055);
    if (_timeline == 'NEON') return const Color(0xFF00FF41);
    return const Color(0xFF00F2FF);
  }

  @override
  void initState() {
    super.initState();
    _refreshAll();
  }

  Future<void> _refreshAll() async {
    setState(() => _isLoading = true);
    try {
      final insights = await ApiService.fetchInsights(_category, _timeline);
      final stats = await ApiService.fetchStats();
      final news = await ApiService.fetchNews(_timeline);
      final broadcasts = await ApiService.fetchBroadcasts();
      final events = await ApiService.fetchEvents(_timeline);
      final missions = await ApiService.fetchMissions();
      final anomalies = await ApiService.fetchAnomalies();
      final seers = await ApiService.fetchSeers();
      final weather = await ApiService.fetchWeather();
      final system = await ApiService.fetchSystemState();

      setState(() {
        _insights = insights;
        _stats = stats;
        _news = news;
        _broadcasts = broadcasts;
        _events = events;
        _missions = missions;
        _anomalies = anomalies;
        _seers = seers;
        _weather = weather;
        _system = system;
      });
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Unable to load data: $error'),
          backgroundColor: Colors.redAccent,
        ));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitOracle() async {
    if (_oracleController.text.trim().isEmpty) {
      return;
    }
    setState(() => _isSubmittingOracle = true);
    try {
      final response = await ApiService.postOracle(
        _oracleController.text.trim(),
        _oracleMode,
        _userName,
      );
      if (mounted) {
        setState(() {
          _oracleResponse = response;
        });
      }
      await _refreshAll();
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Oracle query failed: $error'),
          backgroundColor: Colors.redAccent,
        ));
      }
    } finally {
      if (mounted) setState(() => _isSubmittingOracle = false);
    }
  }

  Future<void> _sendBroadcast() async {
    if (_broadcastController.text.trim().isEmpty) {
      return;
    }
    setState(() => _isSendingBroadcast = true);
    try {
      await ApiService.postBroadcast(
        _userName,
        '[$_timeline] ${_broadcastController.text.trim()}',
      );
      _broadcastController.clear();
      await _refreshAll();
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Broadcast failed: $error'),
          backgroundColor: Colors.redAccent,
        ));
      }
    } finally {
      if (mounted) setState(() => _isSendingBroadcast = false);
    }
  }

  @override
  void dispose() {
    _oracleController.dispose();
    _broadcastController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: SvgPicture.asset('assets/images/app_icon.svg'),
        ),
        title: const Text('DOMOIQ'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const AdminScreen())),
            tooltip: 'System Management',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshAll,
            tooltip: 'Refresh data',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refreshAll,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildTopBanner(),
                    const SizedBox(height: 16),
                    _buildMetricRow(),
                    const SizedBox(height: 16),
                    _buildTimelineSelector(),
                    const SizedBox(height: 16),
                    _buildNewsSection(),
                    const SizedBox(height: 16),
                    _buildEventsSection(),
                    const SizedBox(height: 16),
                    _buildInsightSection(),
                    const SizedBox(height: 16),
                    _buildOracleSection(),
                    const SizedBox(height: 16),
                    _buildBroadcastSection(),
                    const SizedBox(height: 16),
                    _buildMissionSection(),
                    const SizedBox(height: 16),
                    _buildAnomalySection(),
                    const SizedBox(height: 16),
                    _buildSeerList(),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildTopBanner() {
    final temperature = _weather?.entropyBoost ?? 0.0;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0D16),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF112744)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('AETHER ORACLE', style: TextStyle(fontSize: 12, letterSpacing: 2, color: Colors.white70)),
          const SizedBox(height: 8),
          const Text('Quantum insights, real-time sync', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          Row(
            children: [
              Chip(label: Text(_timeline)),
              const SizedBox(width: 8),
              Chip(label: Text(_category)),
              const Spacer(),
              Text(_weather?.msg ?? 'Loading weather...', style: const TextStyle(color: Colors.white54)),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildBadge('Temperature', '${(temperature * 100).toStringAsFixed(0)}%'),
              const SizedBox(width: 8),
              _buildBadge('Mode', _oracleMode),
            ],
          ),
          if (_system != null) ...[
            const SizedBox(height: 8),
            Text('Stability: ${_system!.singularityProgress.toStringAsFixed(1)}%', style: const TextStyle(color: Colors.white54)),
          ],
        ],
      ),
    );
  }

  Widget _buildBadge(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF112744),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Text('$label: $value', style: const TextStyle(fontSize: 12, color: Colors.white70)),
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0B1220),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF13264A)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: const Color(0xFF00F2FF), size: 20),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(fontSize: 12, color: Colors.white60)),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricRow() {
    return Row(
      children: [
        _buildMetricCard('Insights', '${_stats?.totalInsights ?? 0}', Icons.insights),
        const SizedBox(width: 12),
        _buildMetricCard('Endorsements', '${_stats?.totalEndorsements ?? 0}', Icons.thumb_up),
      ],
    );
  }

  Widget _buildTimelineSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Timeline Selector',
          style: TextStyle(
            color: _timelineColor.withOpacity(0.7),
            fontSize: 12,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          children: _timelines.map((t) {
            final isSelected = _timeline == t;
            return ChoiceChip(
              label: Text(t),
              selected: isSelected,
              onSelected: (val) {
                if (val) {
                  setState(() => _timeline = t);
                  _refreshAll();
                }
              },
              selectedColor: _timelineColor,
              labelStyle: TextStyle(
                color: isSelected ? Colors.black : Colors.white,
                fontWeight: FontWeight.bold,
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: _categories.map((c) {
              final isSelected = _category == c;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(c),
                  selected: isSelected,
                  onSelected: (val) {
                    if (val) {
                      setState(() => _category = c);
                      _refreshAll();
                    }
                  },
                  selectedColor: _timelineColor.withOpacity(0.8),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.black : Colors.white,
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildEventsSection() {
    return _buildSectionContainer(
      title: 'Timeline Events',
      child: Column(
        children: _events.isEmpty
            ? [const Text('No events recorded in this sector.', style: TextStyle(color: Colors.white54))]
            : _events.map((e) {
                Color typeColor = _timelineColor;
                if (e.type == 'Critical') typeColor = Colors.redAccent;
                if (e.type == 'Warning') typeColor = Colors.orangeAccent;
                
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    border: Border(left: BorderSide(color: typeColor, width: 4)),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(e.title.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text(
                            '${e.timestamp.hour}:${e.timestamp.minute.toString().padLeft(2, '0')}',
                            style: const TextStyle(fontSize: 10, color: Colors.white38),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(e.description, style: const TextStyle(fontSize: 12, color: Colors.white70)),
                    ],
                  ),
                );
              }).toList(),
      ),
    );
  }

  Widget _buildNewsSection() {
    return _buildSectionContainer(
      title: 'Chronos News',
      child: _news.isEmpty
          ? const Padding(
              padding: EdgeInsets.all(16),
              child: Text('No timeline headlines available.', style: TextStyle(color: Colors.white54)),
            )
          : Column(
              children: _news
                  .take(4)
                  .map((headline) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('• ', style: TextStyle(color: Color(0xFF00F2FF))),
                            Expanded(child: Text(headline, style: const TextStyle(color: Colors.white70))),
                          ],
                        ),
                      ))
                  .toList(),
            ),
    );
  }

  Widget _buildInsightSection() {
    return _buildSectionContainer(
      title: 'Temporal Insights',
      child: _insights.isEmpty
          ? const Padding(
              padding: EdgeInsets.all(16),
              child: Text('No insights available for this timeline.', style: TextStyle(color: Colors.white54)),
            )
          : Column(
              children: _insights.take(5).map((insight) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _buildInsightTile(insight),
                );
              }).toList(),
            ),
    );
  }

  Widget _buildInsightTile(Insight insight) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF101826),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _timelineColor.withOpacity(0.2)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(insight.text, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(insight.category, style: TextStyle(color: _timelineColor.withOpacity(0.7), fontSize: 12)),
              Text('${insight.upvotes} upvotes • ${insight.stakes} stakes', style: const TextStyle(color: Colors.white38, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOracleSection() {
    return _buildSectionContainer(
      title: 'Consult the Chronos',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8,
            children: ['Analytical', 'Visionary', 'Cryptic'].map((mode) {
              final selected = _oracleMode == mode;
              return ChoiceChip(
                label: Text(mode),
                selected: selected,
                onSelected: (_) => setState(() => _oracleMode = mode),
                selectedColor: _timelineColor,
                backgroundColor: const Color(0xFF131B2D),
                labelStyle: TextStyle(color: selected ? Colors.black : Colors.white),
              );
            }).toList(),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _oracleController,
            decoration: InputDecoration(
              hintText: 'Ask the Oracle about the future...', 
              filled: true,
              fillColor: const Color(0xFF101826),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: _timelineColor)),
            ),
            maxLines: 2,
            style: const TextStyle(color: Colors.white),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: _isSubmittingOracle ? null : _submitOracle,
            style: ElevatedButton.styleFrom(
              backgroundColor: _timelineColor,
              foregroundColor: Colors.black,
            ),
            child: Text(_isSubmittingOracle ? 'Consulting…' : 'Consult Oracle'),
          ),
          if (_oracleResponse.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text('Oracle Response', style: TextStyle(color: _timelineColor.withOpacity(0.7), fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(_oracleResponse, style: const TextStyle(color: Colors.white70)),
          ],
        ],
      ),
    );
  }

  Widget _buildBroadcastSection() {
    return _buildSectionContainer(
      title: 'Quantum Broadcasts',
      child: Column(
        children: [
          TextField(
            controller: _broadcastController,
            decoration: InputDecoration(
              hintText: 'Send a timeline broadcast...', 
              filled: true,
              fillColor: const Color(0xFF101826),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: _timelineColor)),
            ),
            style: const TextStyle(color: Colors.white),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: _isSendingBroadcast ? null : _sendBroadcast,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF7000FF),
              foregroundColor: Colors.white,
            ),
            child: Text(_isSendingBroadcast ? 'Transmitting…' : 'Broadcast'),
          ),
          const SizedBox(height: 16),
          if (_broadcasts.isEmpty)
            const Text('No live broadcasts yet.', style: TextStyle(color: Colors.white54))
          else
            Column(
              children: _broadcasts.take(5).map((item) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF101826),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: _timelineColor.withOpacity(0.1)),
                    ),
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.sender, style: TextStyle(color: _timelineColor, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 6),
                        Text(item.message, style: const TextStyle(color: Colors.white70)),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildMissionSection() {
    return _buildSectionContainer(
      title: 'Mission Board',
      child: _missions.isEmpty
          ? const Padding(
              padding: EdgeInsets.all(16),
              child: Text('No missions available.', style: TextStyle(color: Colors.white54)),
            )
          : Column(
              children: _missions.map((mission) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF101826),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF13264A)),
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(mission.title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                            Text('${mission.reward} QC', style: const TextStyle(color: Color(0xFF00F2FF))),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(mission.description, style: const TextStyle(color: Colors.white54)),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
    );
  }

  Widget _buildAnomalySection() {
    return _buildSectionContainer(
      title: 'Active Anomalies',
      child: _anomalies.isEmpty
          ? const Padding(
              padding: EdgeInsets.all(16),
              child: Text('No anomalies detected.', style: TextStyle(color: Colors.white54)),
            )
          : Column(
              children: _anomalies.take(3).map((anomaly) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF101826),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF701120)),
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(anomaly.type, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.redAccent)),
                        const SizedBox(height: 8),
                        Text('Location: ${anomaly.location}', style: const TextStyle(color: Colors.white54)),
                        const SizedBox(height: 8),
                        Text('Severity: ${anomaly.severity}', style: const TextStyle(color: Colors.white60)),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
    );
  }

  Widget _buildSeerList() {
    return _buildSectionContainer(
      title: 'Co-Seer Network',
      child: _seers.isEmpty
          ? const Padding(
              padding: EdgeInsets.all(16),
              child: Text('No seer data available.', style: TextStyle(color: Colors.white54)),
            )
          : Column(
              children: _seers.map((seer) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF101826),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF13264A)),
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(seer.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 4),
                            Text(seer.rank, style: const TextStyle(color: Colors.white54)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('${seer.credits} QC', style: const TextStyle(color: Color(0xFF00F2FF), fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text('Divergence ${seer.divergence.toStringAsFixed(1)}%', style: const TextStyle(color: Colors.white60)),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
    );
  }

  Widget _buildSectionContainer({required String title, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1220),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF13264A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}
