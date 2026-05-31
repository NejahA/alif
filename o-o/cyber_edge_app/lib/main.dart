import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math' as math;
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(const CyberEdgeApp());
}

class CyberEdgeApp extends StatelessWidget {
  const CyberEdgeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CyberEdge DevHub Real',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF010102),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00FF9F),
          secondary: Color(0xFFFF0055),
          tertiary: Color(0xFF00E5FF),
          surface: Color(0xFF08080A),
          onSurface: Colors.white,
        ),
        textTheme: const TextTheme(
          displayLarge: TextStyle(fontFamily: 'Courier', fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF00FF9F), letterSpacing: 1.5),
          bodyMedium: TextStyle(fontFamily: 'Courier', fontSize: 11, color: Colors.white70),
        ),
      ),
      home: const CyberDevHub(),
    );
  }
}

class CyberDevHub extends StatefulWidget {
  const CyberDevHub({super.key});

  @override
  State<CyberDevHub> createState() => _CyberDevHubState();
}

class _CyberDevHubState extends State<CyberDevHub> with TickerProviderStateMixin {
  late AnimationController _glitchController;
  
  // Real-time Data
  DateTime _now = DateTime.now();
  String _publicIp = "FETCHING...";
  String _ghStatus = "CHECKING...";
  List<Map<String, dynamic>> _news = [];
  Map<String, dynamic>? _repoStats;
  Map<String, dynamic>? _userProfile;
  Map<String, dynamic> _crypto = {"BTC": "...", "ETH": "..."};
  
  Timer? _dataTimer;
  final List<String> _terminal = ["[SYS] REAL_DATA_SYNC_INIT", "[NET] CONNECTING_TO_NODES..."];
  final TextEditingController _terminalInputController = TextEditingController();
  final ScrollController _terminalScrollController = ScrollController();
  
  @override
  void initState() {
    super.initState();
    _glitchController = AnimationController(vsync: this, duration: const Duration(milliseconds: 500))..repeat(reverse: true);
    
    _startClock();
    _fetchRealWorldData();
    
    // Refresh data every 5 minutes
    _dataTimer = Timer.periodic(const Duration(minutes: 5), (t) => _fetchRealWorldData());
  }

  void _startClock() {
    Timer.periodic(const Duration(seconds: 1), (t) {
      if (mounted) setState(() => _now = DateTime.now());
    });
  }

  Future<void> _fetchRealWorldData() async {
    _log("SYNCING_REMOTE_DATA", type: "NET");
    await Future.wait([
      _getPublicIp(),
      _getGithubStatus(),
      _getTechNews(),
      _getUserProfile("NejahA"),
      _getRepoStats("NejahA/Service_Provider"),
      _getCryptoPrices(),
    ]);
    _log("DATA_SYNC_COMPLETE", type: "SYS");
  }

  Future<void> _getCryptoPrices() async {
    try {
      final res = await http.get(Uri.parse('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() => _crypto = {
          "BTC": "\$${data['bitcoin']['usd'].toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}",
          "ETH": "\$${data['ethereum']['usd'].toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}",
        });
      }
    } catch (_) {}
  }

  Future<void> _getUserProfile(String user) async {
    try {
      final res = await http.get(Uri.parse('https://api.github.com/users/$user'));
      if (res.statusCode == 200) {
        setState(() => _userProfile = json.decode(res.body));
      }
    } catch (_) {}
  }

  Future<void> _getPublicIp() async {
    try {
      final res = await http.get(Uri.parse('https://api.ipify.org?format=json'));
      if (res.statusCode == 200) {
        setState(() => _publicIp = json.decode(res.body)['ip']);
      }
    } catch (_) {
      setState(() => _publicIp = "OFFLINE");
    }
  }

  Future<void> _getGithubStatus() async {
    try {
      final res = await http.get(Uri.parse('https://www.githubstatus.com/api/v2/status.json'));
      if (res.statusCode == 200) {
        setState(() => _ghStatus = json.decode(res.body)['status']['description'].toUpperCase());
      }
    } catch (_) {
      setState(() => _ghStatus = "UNKNOWN");
    }
  }

  Future<void> _getTechNews() async {
    try {
      // Fetch top stories from Hacker News
      final res = await http.get(Uri.parse('https://hacker-news.firebaseio.com/v0/topstories.json'));
      if (res.statusCode == 200) {
        List ids = json.decode(res.body).take(3).toList();
        List<Map<String, dynamic>> tempNews = [];
        for (var id in ids) {
          final itemRes = await http.get(Uri.parse('https://hacker-news.firebaseio.com/v0/item/$id.json'));
          tempNews.add(json.decode(itemRes.body));
        }
        setState(() => _news = tempNews);
      }
    } catch (_) {}
  }

  Future<void> _getRepoStats(String repo) async {
    try {
      final res = await http.get(Uri.parse('https://api.github.com/repos/$repo'));
      if (res.statusCode == 200) {
        setState(() => _repoStats = json.decode(res.body));
      }
    } catch (_) {}
  }

  void _log(String msg, {String type = "LOG"}) {
    setState(() {
      _terminal.add("[$type] ${DateFormat('HH:mm:ss').format(DateTime.now())} $msg");
      if (_terminal.length > 10) _terminal.removeAt(0);
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_terminalScrollController.hasClients) {
        _terminalScrollController.animateTo(
          _terminalScrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _handleTerminalCommand(String cmd) {
    if (cmd.isEmpty) return;
    _terminalInputController.clear();
    _log("> $cmd", type: "USR");
    
    final input = cmd.toLowerCase().trim();
    if (input == "clear") {
      setState(() => _terminal.clear());
      _log("TERMINAL_CLEARED", type: "SYS");
    } else if (input == "refresh") {
      _fetchRealWorldData();
    } else if (input == "whoami") {
      _log("USER: NEJAHA | ROLE: LEAD_DEV | STATUS: ACTIVE", type: "SYS");
    } else if (input == "help") {
      _log("AVAIL_CMDS: CLEAR, REFRESH, WHOAMI, HELP", type: "SYS");
    } else {
      _log("ERR: UNKNOWN_COMMAND '$cmd'", type: "ERR");
    }
  }

  Future<void> _launch(String url) async {
    if (!await launchUrl(Uri.parse(url))) {
      _log("ERR_LAUNCHING_URL", type: "ERR");
    }
  }

  @override
  void dispose() {
    _glitchController.dispose();
    _dataTimer?.cancel();
    _terminalInputController.dispose();
    _terminalScrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 20),
              _buildNetworkGrid(),
              const SizedBox(height: 20),
              _buildSectionHeader("CRYPTO_PULSE", Icons.currency_bitcoin),
              _buildCryptoGrid(),
              const SizedBox(height: 20),
              _buildSectionHeader("NEJAHA_PROFILE", Icons.person_outline),
              _buildUserProfileCard(),
              const SizedBox(height: 20),
              _buildSectionHeader("REALTIME_GIT_FEED", Icons.hub_outlined),
              _buildGithubRepoCard(),
              const SizedBox(height: 20),
              _buildSectionHeader("TECH_RADAR", Icons.rss_feed),
              Expanded(child: _buildNewsList()),
              const SizedBox(height: 15),
              _buildTerminal(),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.small(
        onPressed: _fetchRealWorldData,
        backgroundColor: const Color(0xFF00FF9F),
        child: const Icon(Icons.refresh, color: Colors.black),
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
            Text(DateFormat('EEE, MMM d | HH:mm:ss').format(_now), style: const TextStyle(fontSize: 10, color: Colors.white38)),
            const SizedBox(height: 4),
            AnimatedBuilder(
              animation: _glitchController,
              builder: (context, child) => Text("NEJAHA_OS_V2.0", 
                style: Theme.of(context).textTheme.displayLarge?.copyWith(
                  shadows: [
                    Shadow(color: const Color(0xFFFF0055).withOpacity(0.5), offset: Offset(_glitchController.value * 3, 0)),
                    Shadow(color: const Color(0xFF00E5FF).withOpacity(0.5), offset: Offset(-_glitchController.value * 3, 0)),
                  ]
                )),
            ),
          ],
        ),
        _buildStatusBadge(),
      ],
    );
  }

  Widget _buildStatusBadge() {
    return AnimatedBuilder(
      animation: _glitchController,
      builder: (context, child) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.black,
            border: Border.all(
              color: (_ghStatus.contains("ALL SYSTEMS") ? const Color(0xFF00FF9F) : Colors.orange)
                  .withOpacity(0.5 + (_glitchController.value * 0.5)), 
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: (_ghStatus.contains("ALL SYSTEMS") ? const Color(0xFF00FF9F) : Colors.orange).withOpacity(0.2 * _glitchController.value),
                blurRadius: 10,
                spreadRadius: 2,
              )
            ]
          ),
          child: Column(
            children: [
              const Text("GH_SERVICES", style: TextStyle(fontSize: 7, color: Colors.white38, fontWeight: FontWeight.bold)),
              Text(_ghStatus, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: _ghStatus.contains("ALL SYSTEMS") ? const Color(0xFF00FF9F) : Colors.orange)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildNetworkGrid() {
    return Row(
      children: [
        _buildNetCard("PUBLIC_IP", _publicIp, const Color(0xFF00E5FF)),
        const SizedBox(width: 12),
        _buildNetCard("PING", "24ms", const Color(0xFF00FF9F)),
        const SizedBox(width: 12),
        _buildNetCard("LOCATION", "OS_LOC", const Color(0xFFFF0055)),
      ],
    );
  }

  Widget _buildCryptoGrid() {
    return Row(
      children: [
        _buildNetCard("BTC/USD", _crypto['BTC'], const Color(0xFFF7931A)),
        const SizedBox(width: 12),
        _buildNetCard("ETH/USD", _crypto['ETH'], const Color(0xFF627EEA)),
      ],
    );
  }

  Widget _buildNetCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: Theme.of(context).colorScheme.surface, border: Border.all(color: Colors.white10)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 8, color: Colors.white38, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text(value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color, fontFamily: 'Courier')),
          ],
        ),
      ),
    );
  }

  Widget _buildUserProfileCard() {
    if (_userProfile == null) return const Center(child: CircularProgressIndicator(strokeWidth: 1));
    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border.all(color: const Color(0xFFFF0055).withOpacity(0.2)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundImage: NetworkImage(_userProfile!['avatar_url']),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_userProfile!['login'].toUpperCase(), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFFFF0055))),
                const SizedBox(height: 4),
                Text(_userProfile!['bio'] ?? "No bio available", maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 10, color: Colors.white54)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildRepoMetric(Icons.people_outline, "${_userProfile!['followers']} followers"),
                    const SizedBox(width: 15),
                    _buildRepoMetric(Icons.folder_outlined, "${_userProfile!['public_repos']} repos"),
                  ],
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () => _launch(_userProfile!['html_url']),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF0055).withOpacity(0.1),
              side: const BorderSide(color: Color(0xFFFF0055), width: 1),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            child: const Text("VIEW_PROFILE", style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFFFF0055))),
          ),
        ],
      ),
    );
  }

  Widget _buildGithubRepoCard() {
    if (_repoStats == null) return const Center(child: CircularProgressIndicator(strokeWidth: 1));
    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border.all(color: const Color(0xFF00FF9F).withOpacity(0.2)),
      ),
      child: InkWell(
        onTap: () => _launch(_repoStats!['html_url']),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(_repoStats!['full_name'].toUpperCase(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF00FF9F))),
                const Icon(Icons.open_in_new, size: 14, color: Colors.white24),
              ],
            ),
            const SizedBox(height: 8),
            Text(_repoStats!['description'] ?? "No description", maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 10, color: Colors.white54)),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildRepoMetric(Icons.star_outline, _repoStats!['stargazers_count'].toString()),
                const SizedBox(width: 15),
                _buildRepoMetric(Icons.call_split, _repoStats!['forks_count'].toString()),
                const SizedBox(width: 15),
                _buildRepoMetric(Icons.error_outline, _repoStats!['open_issues_count'].toString()),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRepoMetric(IconData icon, String val) {
    return Row(
      children: [
        Icon(icon, size: 12, color: const Color(0xFF00E5FF)),
        const SizedBox(width: 4),
        Text(val, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, fontFamily: 'Courier')),
      ],
    );
  }

  Widget _buildNewsList() {
    if (_news.isEmpty) return const Center(child: CircularProgressIndicator(strokeWidth: 1));
    return ListView.builder(
      itemCount: _news.length,
      itemBuilder: (context, index) {
        final item = _news[index];
        return Container(
          margin: const EdgeInsets.only(top: 10),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.02), border: Border(left: BorderSide(color: Theme.of(context).colorScheme.secondary, width: 2))),
          child: InkWell(
            onTap: () => _launch(item['url'] ?? ""),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['title'] ?? "NO_TITLE", style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text("${item['score']} points | by ${item['by']}", style: const TextStyle(fontSize: 8, color: Colors.white24)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTerminal() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.black, border: Border.all(color: Colors.white10)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("DAW_SYNC_LOG", style: TextStyle(fontSize: 8, color: Color(0xFF00FF9F), fontWeight: FontWeight.bold)),
              Text("${_terminal.length}/10_LINES", style: const TextStyle(fontSize: 7, color: Colors.white24)),
            ],
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 80,
            child: ListView.builder(
              controller: _terminalScrollController,
              itemCount: _terminal.length,
              itemBuilder: (context, index) => Text(_terminal[index], style: const TextStyle(fontSize: 9, color: Color(0xFF00FF9F), fontFamily: 'Courier')),
            ),
          ),
          const Divider(color: Colors.white10, height: 16),
          Row(
            children: [
              const Text("> ", style: TextStyle(fontSize: 10, color: Color(0xFF00FF9F), fontWeight: FontWeight.bold)),
              Expanded(
                child: TextField(
                  controller: _terminalInputController,
                  onSubmitted: _handleTerminalCommand,
                  style: const TextStyle(fontSize: 10, color: Color(0xFF00FF9F), fontFamily: 'Courier'),
                  cursorColor: const Color(0xFF00FF9F),
                  decoration: const InputDecoration(
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                    border: InputBorder.none,
                    hintText: "ENTER COMMAND (HELP)",
                    hintStyle: TextStyle(fontSize: 8, color: Colors.white10),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String label, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 14, color: const Color(0xFFFF0055)),
        const SizedBox(width: 10),
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
        const Expanded(child: Divider(indent: 10, color: Colors.white10)),
      ],
    );
  }
}
  