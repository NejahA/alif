import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(const NeigeyApp());
}

class NeigeyApp extends StatelessWidget {
  const NeigeyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Neigey DevDash',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: const Color(0xFF38BDF8),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF38BDF8),
          secondary: Color(0xFF818CF8),
          surface: Color(0xFF1E293B),
          background: Color(0xFF0F172A),
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      ),
      home: const Dashboard(),
    );
  }
}

class Dashboard extends StatefulWidget {
  const Dashboard({super.key});

  @override
  State<Dashboard> createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> with TickerProviderStateMixin {
  final String apiUrl = "http://localhost:5000/api";
  
  // --- Navigation State ---
  String _currentView = "dashboard";
  
  // New: Theme State
  Color _accentColor = const Color(0xFF38BDF8);

  // --- Clock State ---
  late Timer _clockTimer;
  DateTime _now = DateTime.now();

  // --- Pomodoro State ---
  Timer? _pomodoroTimer;
  int _secondsRemaining = 25 * 60;
  bool _isRunning = false;

  // New: Resource State
  double _cpuLoad = 12.0;
  double _ramLoad = 45.0;

  // --- Data Lists ---
  List<dynamic> _notes = [];
  List<dynamic> _tasks = [];
  List<dynamic> _snippets = [];
  Map<String, dynamic> _portfolio = {};
  
  @override
  void initState() {
    super.initState();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (mounted) setState(() {
        _now = DateTime.now();
        // Simulate jitter
        _cpuLoad = 10 + (DateTime.now().second % 10).toDouble();
        _ramLoad = 40 + (DateTime.now().second % 5).toDouble();
      });
    });
    _initTaskTimer();
    _fetchAllData();
    _fetchTechData();
  }

  Future<void> _fetchAllData() async {
    try {
      final resNotes = await http.get(Uri.parse('$apiUrl/notes'));
      final resTasks = await http.get(Uri.parse('$apiUrl/tasks'));
      final resSnippets = await http.get(Uri.parse('$apiUrl/snippets'));
      final resPort = await http.get(Uri.parse('$apiUrl/portfolio'));

      if (mounted) {
        setState(() {
          _notes = json.decode(resNotes.body);
          _tasks = json.decode(resTasks.body);
          _snippets = json.decode(resSnippets.body);
          _portfolio = json.decode(resPort.body);
          if (_snippets.isEmpty) {
            _snippets = [
              {"name": "Python HTTP Server", "code": "python -m http.server 8000"},
              {"name": "Docker Clean", "code": "docker system prune -a"},
              {"name": "Git Undo Commit", "code": "git reset --soft HEAD~1"},
            ];
          }
        });
      }
    } catch (e) {
      debugPrint("Error fetching data: $e");
    }
  }

  // --- Notes Logic ---
  Future<void> _addNote(String text) async {
    if (text.isEmpty) return;
    try {
      await http.post(
        Uri.parse('$apiUrl/notes'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'text': text}),
      );
      _fetchAllData();
    } catch (e) {
      debugPrint("Error adding note: $e");
    }
  }

  Future<void> _deleteNote(String id) async {
    try {
      await http.delete(Uri.parse('$apiUrl/notes/$id'));
      _fetchAllData();
    } catch (e) {
      debugPrint("Error deleting note: $e");
    }
  }

  // --- Task Logic ---
  Future<void> _addTask(String text) async {
    try {
      await http.post(
        Uri.parse('$apiUrl/tasks'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'text': text, 'priority': 'medium'}),
      );
      _fetchAllData();
    } catch (e) {
      debugPrint("Error adding task: $e");
    }
  }

  Future<void> _updateTask(String id, String status) async {
    try {
      await http.put(
        Uri.parse('$apiUrl/tasks/$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'status': status}),
      );
      _fetchAllData();
    } catch (e) {
      debugPrint("Error updating task: $e");
    }
  }

  Future<void> _deleteTask(String id) async {
    try {
      await http.delete(Uri.parse('$apiUrl/tasks/$id'));
      _fetchAllData();
    } catch (e) {
      debugPrint("Error deleting task: $e");
    }
  }

  // --- Snippet Logic ---
  Future<void> _addSnippet(String name, String code) async {
    try {
      await http.post(
        Uri.parse('$apiUrl/snippets'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'name': name, 'code': code}),
      );
      _fetchAllData();
    } catch (e) {
      debugPrint("Error adding snippet: $e");
    }
  }

  Future<void> _deleteSnippet(String id) async {
    try {
      await http.delete(Uri.parse('$apiUrl/snippets/$id'));
      _fetchAllData();
    } catch (e) {
      debugPrint("Error deleting snippet: $e");
    }
  }

  // --- Dev Toolbox State ---
  final TextEditingController _toolInput = TextEditingController();
  String _toolOutput = "";
  
  // --- Currency State ---
  double _currencyAmount = 1.0;
  String _fromCurrency = "USD";
  String _toCurrency = "EUR";
  double _currencyResult = 0.94;

  // --- Network Tools State ---
  final TextEditingController _hostController = TextEditingController();
  String _dnsResult = "";
  bool _isDnsLoading = false;

  // --- Terminal State ---
  final TextEditingController _terminalController = TextEditingController();
  final List<Map<String, String>> _terminalLogs = [
    {"type": "sys", "msg": "NEJAHA_OS_V2.0_READY"},
    {"type": "net", "msg": "NETWORK_SYNC_COMPLETE"},
  ];

  void _handleTerminalCommand(String cmd) {
    if (cmd.trim().isEmpty) return;
    String input = cmd.trim().toLowerCase();
    _terminalController.clear();
    setState(() {
      _terminalLogs.add({"type": "sys", "msg": "> ${input.toUpperCase()}"});
      if (input == "clear") {
        _terminalLogs.clear();
      } else if (input == "help") {
        _terminalLogs.add({"type": "net", "msg": "AVAIL_CMD: CLEAR, HELP, STATS, TIME, RELOAD"});
      } else if (input == "stats") {
        _terminalLogs.add({"type": "net", "msg": "CPU: ${_cpuLoad.toStringAsFixed(1)}% | RAM: ${_ramLoad.toStringAsFixed(1)}%"});
      } else if (input == "time") {
        _terminalLogs.add({"type": "net", "msg": "OS_TIME: ${DateFormat('HH:mm:ss').format(_now)}"});
      } else if (input == "reload") {
        _fetchAllData();
      } else {
        _terminalLogs.add({"type": "err", "msg": "CMD_ERR: ${input.toUpperCase()} NOT FOUND"});
      }
    });
  }

  // --- Tech News ---
  String _ip = "FETCHING...";
  List<dynamic> _news = [];

  Future<void> _fetchTechData() async {
    try {
      final ipRes = await http.get(Uri.parse('https://api.ipify.org?format=json'));
      if (ipRes.statusCode == 200) setState(() => _ip = json.decode(ipRes.body)['ip']);
      
      final newsRes = await http.get(Uri.parse('https://hacker-news.firebaseio.com/v0/topstories.json'));
      if (newsRes.statusCode == 200) {
        List ids = json.decode(newsRes.body).take(5).toList();
        List<Map<String, dynamic>> temp = [];
        for (var id in ids) {
          final item = await http.get(Uri.parse('https://hacker-news.firebaseio.com/v0/item/$id.json'));
          temp.add(json.decode(item.body));
        }
        setState(() => _news = temp);
      }
    } catch (_) {}
  }

  // --- Task Timer Logic ---
  Map<String, bool> _taskTimers = {};
  Map<String, int> _taskTimeSpent = {};
  Timer? _globalTaskTimer;

  void _initTaskTimer() {
    _globalTaskTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          _taskTimers.forEach((id, isRunning) {
            if (isRunning) {
              _taskTimeSpent[id] = (_taskTimeSpent[id] ?? 0) + 1;
            }
          });
        });
      }
    });
  }

  String _formatTaskTime(int seconds) {
    int hrs = seconds ~/ 3600;
    int mins = (seconds % 3600) ~/ 60;
    int secs = seconds % 60;
    return "${hrs.toString().padLeft(2, '0')}:${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}";
  }

  void _toggleTaskTimer(String id) {
    setState(() {
      _taskTimers[id] = !(_taskTimers[id] ?? false);
    });
  }

  // --- Pomodoro Logic ---
  void _toggleTimer() {
    if (_isRunning) {
      _pomodoroTimer?.cancel();
    } else {
      _pomodoroTimer = Timer.periodic(const Duration(seconds: 1), (t) {
        if (_secondsRemaining > 0) {
          setState(() => _secondsRemaining--);
        } else {
          t.cancel();
          setState(() => _isRunning = false);
        }
      });
    }
    setState(() => _isRunning = !_isRunning);
  }

  void _resetTimer() {
    _pomodoroTimer?.cancel();
    setState(() {
      _secondsRemaining = 25 * 60;
      _isRunning = false;
    });
  }

  // --- Dev Toolbox Logic ---
  void _base64Encode() {
    setState(() => _toolOutput = base64Encode(utf8.encode(_toolInput.text)));
  }

  void _base64Decode() {
    try {
      setState(() => _toolOutput = utf8.decode(base64Decode(_toolInput.text)));
    } catch (e) {
      setState(() => _toolOutput = "INVALID BASE64");
    }
  }

  // --- Currency Logic ---
  void _convertCurrency() {
    setState(() {
      double rate = _fromCurrency == "USD" ? 0.94 : 1.06;
      _currencyResult = _currencyAmount * rate;
    });
  }

  // --- Network Tools Logic ---
  Future<void> _dnsLookup() async {
    if (_hostController.text.isEmpty) return;
    setState(() {
      _isDnsLoading = true;
      _dnsResult = "LOOKING UP...";
    });
    try {
      // In a real Flutter app, use InternetAddress.lookup
      // For web/simulated dashboard, we'll use a public API or simulated result
      final res = await http.get(Uri.parse('https://dns.google/resolve?name=${_hostController.text}'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final answers = data['Answer'] as List?;
        if (answers != null && answers.isNotEmpty) {
          setState(() => _dnsResult = answers.map((a) => a['data']).join("\n"));
        } else {
          setState(() => _dnsResult = "NO RECORDS FOUND");
        }
      }
    } catch (e) {
      setState(() => _dnsResult = "ERROR: $e");
    } finally {
      setState(() => _isDnsLoading = false);
    }
  }

  @override
  void dispose() {
    _clockTimer.cancel();
    _pomodoroTimer?.cancel();
    _toolInput.dispose();
    _hostController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Sidebar / Menu
          Container(
            width: 80,
            color: const Color(0xFF1E293B),
            child: Column(
              children: [
                const SizedBox(height: 40),
                const Icon(Icons.ac_unit, color: Colors.white70, size: 32),
                const Spacer(),
                _sideIcon(Icons.dashboard_outlined, "dashboard"),
                _sideIcon(Icons.timer_outlined, "timer"),
                _sideIcon(Icons.notes_outlined, "notes"),
                _sideIcon(Icons.view_kanban_outlined, "board"),
                _sideIcon(Icons.code_outlined, "snippets"),
                _sideIcon(Icons.security, "cyber"),
                _sideIcon(Icons.school_outlined, "course"),
                _sideIcon(Icons.person_outline, "portfolio"),
                _sideIcon(Icons.terminal_outlined, "toolbox"),
                const Spacer(),
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Colors.grey, Colors.white]),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  alignment: Alignment.center,
                  child: const Text("N", style: TextStyle(color: Colors.black, fontSize: 14, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
          // Main Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(),
                  const SizedBox(height: 40),
                  _buildCurrentView(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sideIcon(IconData icon, String viewName) {
    bool active = _currentView == viewName;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: IconButton(
        onPressed: () => setState(() => _currentView = viewName),
        icon: Icon(icon, color: active ? const Color(0xFF38BDF8) : Colors.white24, size: 24),
      ),
    );
  }

  Widget _buildCurrentView() {
    if (_currentView == "dashboard") return _buildDashboardView();
    if (_currentView == "timer") return _buildTimerView();
    if (_currentView == "notes") return _buildNotesView();
    if (_currentView == "board") return _buildBoardView();
    if (_currentView == "snippets") return _buildSnippetsView();
    if (_currentView == "cyber") return _buildCyberView();
    if (_currentView == "course") return _buildCourseView();
    if (_currentView == "portfolio") return _buildPortfolioView();
    if (_currentView == "toolbox") return _buildToolboxView();
    return _buildDashboardView();
  }

  Widget _buildCourseView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("CYBER ACADEMY PRO", style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
        const SizedBox(height: 8),
        const Text("Elite_Initiate | Path: Full_Stack_Security_Engineer", style: TextStyle(fontSize: 10, color: Colors.white38, letterSpacing: 1.2)),
        const SizedBox(height: 32),
        _courseModule("CIA", "01. THE CIA TRIAD", "Foundation of security architecture.", true),
        _courseModule("ATTACK", "02. ATTACK VECTORS", "Analyzing entry points & exploits.", false),
        _courseModule("NET", "03. NETWORK DEFENSE", "Hardening infrastructure.", false),
        _courseModule("CRYPTO", "04. CRYPTOGRAPHY", "Secrets of data obfuscation.", false),
        _courseModule("WEB", "05. WEB APP SEC", "OWASP Top 10 & payload analysis.", false),
        _courseModule("CLOUD", "06. CLOUD SECURITY", "Shared responsibility & IAM.", false),
        _courseModule("HACK", "07. ETHICAL HACKING", "Adopting the adversary mindset.", false),
      ],
    );
  }

  Widget _courseModule(String id, String title, String desc, bool completed) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: completed ? Colors.tealAccent.withOpacity(0.2) : Colors.white10),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(completed ? Icons.check_circle : Icons.radio_button_unchecked, color: completed ? Colors.tealAccent : Colors.white24),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: completed ? Colors.white : Colors.white70)),
                    Text(desc, style: const TextStyle(fontSize: 12, color: Colors.white38)),
                  ],
                ),
              ),
              ElevatedButton(
                onPressed: () {
                  showModalBottomSheet(
                    context: context,
                    backgroundColor: const Color(0xFF0F172A),
                    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(32))),
                    builder: (ctx) => _buildLessonDetails(id, title),
                  );
                },
                style: ElevatedButton.styleFrom(backgroundColor: completed ? Colors.white10 : _accentColor.withOpacity(0.1)),
                child: Text(completed ? "REVIEW" : "START"),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLessonDetails(String id, String title) {
    List<Map<String, String>> items = [];
    if (id == "CIA") {
      items = [
        {"t": "Confidentiality", "d": "Encryption, Access Control. [TryHackMe: Intro to Cyber]", "url": "https://tryhackme.com/module/intro-to-cyber-security"},
        {"t": "Integrity", "d": "Hashing, Digital Signatures. [Cybrary: IT & Cybersecurity]", "url": "https://www.cybrary.it/course/intro-to-it-and-cybersecurity"},
        {"t": "Availability", "d": "Redundancy, DDoS Protection. [Coursera: Foundations]", "url": "https://www.coursera.org/learn/foundations-of-cybersecurity"}
      ];
    } else if (id == "CRYPTO") {
      items = [
        {"t": "Symmetric", "d": "Same key for lock/unlock. [Cryptopals Challenges]", "url": "https://cryptopals.com/"},
        {"t": "Asymmetric", "d": "Public/Private key pairs. [Khan Academy: Crypto]", "url": "https://www.khanacademy.org/computing/computer-science/cryptography"},
        {"t": "Hashing", "d": "One-way math. [TryHackMe: Crypto for Beginners]", "url": "https://tryhackme.com/room/cryptographyforbeginners"}
      ];
    } else if (id == "WEB") {
      items = [
        {"t": "SQL Injection", "d": "Protecting queries. [TryHackMe: SQLi]", "url": "https://tryhackme.com/room/sqlivulnerabilities"},
        {"t": "XSS", "d": "Preventing malicious scripts. [TryHackMe: XSS]", "url": "https://tryhackme.com/room/xss"},
        {"t": "OWASP Top 10", "d": "Modern web security standards.", "url": "https://owasp.org/www-project-top-ten/"}
      ];
    } else if (id == "CLOUD") {
      items = [
        {"t": "IAM Governance", "d": "Identity & Access. [TryHackMe: IAM]", "url": "https://tryhackme.com/room/introtoiam"},
        {"t": "S3 Security", "d": "Protecting cloud storage. [TryHackMe: S3]", "url": "https://tryhackme.com/room/s3security"},
        {"t": "Shared Resp", "d": "Provider vs User duties.", "url": "https://aws.amazon.com/compliance/shared-responsibility-model/"}
      ];
    } else if (id == "ATTACK") {
      items = [
        {"t": "Social Engineering", "d": "Phishing, Pretexting. [TryHackMe: Social Eng]", "url": "https://tryhackme.com/room/socialengineering"},
        {"t": "Malware", "d": "Viruses, Ransomware. [Malware Traffic Analysis]", "url": "https://www.malware-traffic-analysis.net/"},
        {"t": "Network Attacks", "d": "MitM, Sniffing. [HTB: Starting Point]", "url": "https://hackthebox.com/hacker/starting-point"}
      ];
    }

    return Container(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          ...items.map((item) => Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(16)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['t']!, style: TextStyle(color: _accentColor, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(item['d']!, style: const TextStyle(fontSize: 12, color: Colors.white70)),
              ],
            ),
          )).toList(),
        ],
      ),
    );
  }

  Widget _buildCyberView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("CYBER SECURITY SUITE", style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
        const SizedBox(height: 24),
        GridView.count(
          shrinkWrap: true,
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.2,
          children: [
            _cyberToolCard("HASH GENERATOR", Icons.fingerprint, Colors.tealAccent),
            _cyberToolCard("PORT SCANNER", Icons.radar, Colors.pinkAccent),
            _cyberToolCard("CVE DATABASE", Icons.bug_report, Colors.amberAccent),
            _cyberToolCard("SUBNET CALC", Icons.network_check, Colors.blueAccent),
          ],
        ),
      ],
    );
  }

  Widget _cyberToolCard(String title, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(24), border: Border.all(color: color.withOpacity(0.1))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const Spacer(),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(backgroundColor: color.withOpacity(0.1), foregroundColor: color),
            child: const Text("LAUNCH"),
          ),
        ],
      ),
    );
  }

  Widget _buildBoardView() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildColumn("todo", Colors.orangeAccent),
        const SizedBox(width: 16),
        _buildColumn("progress", Colors.blueAccent),
        const SizedBox(width: 16),
        _buildColumn("done", Colors.greenAccent),
      ],
    );
  }

  Widget _buildColumn(String status, Color color) {
    final filteredTasks = _tasks.where((t) => t['status'] == status).toList();
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(24)),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(status.toUpperCase(), style: TextStyle(fontWeight: FontWeight.bold, color: color)),
                CircleAvatar(radius: 10, backgroundColor: Colors.white10, child: Text(filteredTasks.length.toString(), style: const TextStyle(fontSize: 10))),
              ],
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView.builder(
                itemCount: filteredTasks.length,
                itemBuilder: (context, index) {
                  final t = filteredTasks[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(16)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(t['text'], style: const TextStyle(fontSize: 13)),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            const Icon(Icons.timer_outlined, size: 12, color: Colors.white38),
                            const SizedBox(width: 4),
                            Text(_formatTaskTime(_taskTimeSpent[t['_id']] ?? t['timeSpent'] ?? 0), style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: Colors.white38)),
                            const Spacer(),
                            IconButton(
                              icon: Icon((_taskTimers[t['_id']] ?? false) ? Icons.pause_circle_outline : Icons.play_circle_outline, size: 20, color: (_taskTimers[t['_id']] ?? false) ? Colors.orangeAccent : Colors.greenAccent),
                              onPressed: () => _toggleTaskTimer(t['_id']),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            if (status != 'todo') IconButton(icon: const Icon(Icons.arrow_back, size: 16), onPressed: () => _updateTask(t['_id'], status == 'done' ? 'progress' : 'todo')),
                            const Spacer(),
                            IconButton(icon: const Icon(Icons.delete_outline, size: 16, color: Colors.redAccent), onPressed: () => _deleteTask(t['_id'])),
                            if (status != 'done') IconButton(icon: const Icon(Icons.arrow_forward, size: 16), onPressed: () => _updateTask(t['_id'], status == 'todo' ? 'progress' : 'done')),
                          ],
                        )
                      ],
                    ),
                  );
                },
              ),
            ),
            TextButton(onPressed: () {
              String text = "";
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text("New Task"),
                  content: TextField(onChanged: (v) => text = v, decoration: const InputDecoration(labelText: "Task Description")),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Cancel")),
                    TextButton(onPressed: () { _addTask(text); Navigator.pop(ctx); }, child: const Text("Add")),
                  ],
                ),
              );
            }, child: const Text("+ ADD TASK")),
          ],
        ),
      ),
    );
  }

  Widget _buildSnippetsView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text("CODE REPOSITORY", style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
            ElevatedButton(
              onPressed: () {
                String name = "";
                String code = "";
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text("New Snippet"),
                    content: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        TextField(onChanged: (v) => name = v, decoration: const InputDecoration(labelText: "Name")),
                        TextField(onChanged: (v) => code = v, decoration: const InputDecoration(labelText: "Code")),
                      ],
                    ),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Cancel")),
                      TextButton(onPressed: () { _addSnippet(name, code); Navigator.pop(ctx); }, child: const Text("Save")),
                    ],
                  ),
                );
              },
              child: const Text("+ New Snippet"),
            ),
          ],
        ),
        const SizedBox(height: 24),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 16, mainAxisSpacing: 16, childAspectRatio: 1.5),
          itemCount: _snippets.length,
          itemBuilder: (context, index) {
            final s = _snippets[index];
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(20)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(s['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                      IconButton(onPressed: () => _deleteSnippet(s['_id']), icon: const Icon(Icons.delete, size: 16, color: Colors.redAccent)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.black45, borderRadius: BorderRadius.circular(12)),
                      child: SingleChildScrollView(child: Text(s['code'], style: const TextStyle(fontFamily: 'monospace', fontSize: 12, color: Colors.greenAccent))),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildPortfolioView() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(40),
          decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(40)),
          child: Row(
            children: [
              CircleAvatar(radius: 50, backgroundColor: _accentColor, child: Text(_portfolio['name']?[0] ?? 'N', style: const TextStyle(fontSize: 40, color: Colors.white))),
              const SizedBox(width: 32),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_portfolio['name'] ?? 'Nejah Achref', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900)),
                  Text(_portfolio['role'] ?? 'Lead Ecosystem Architect', style: TextStyle(color: _accentColor, fontWeight: FontWeight.bold, letterSpacing: 2)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: (_portfolio['skills'] as List? ?? []).map((s) => Chip(label: Text(s.toString()))).toList(),
        ),
      ],
    );
  }

  Widget _buildDashboardView() {
    return Column(
      children: [
        _buildHealthStats(),
        const SizedBox(height: 24),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(flex: 2, child: _buildMainGrid()),
            const SizedBox(width: 24),
            Expanded(child: _buildSidePanel()),
          ],
        ),
      ],
    );
  }

  Widget _buildHealthStats() {
    return Row(
      children: [
        _healthCard("CPU_LOAD", "${_cpuLoad.toStringAsFixed(1)}%", _accentColor),
        const SizedBox(width: 16),
        _healthCard("RAM_USE", "${_ramLoad.toStringAsFixed(1)}%", Colors.purpleAccent),
        const SizedBox(width: 16),
        _healthCard("DISK_IO", "78%", Colors.tealAccent),
        const SizedBox(width: 16),
        _healthCard("NET_SYNC", "98%", Colors.amberAccent),
      ],
    );
  }

  Widget _healthCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A).withOpacity(0.5),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: color.withOpacity(0.1), width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label, style: const TextStyle(fontSize: 9, color: Colors.white24, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                Icon(Icons.bolt, size: 12, color: color.withOpacity(0.3)),
              ],
            ),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: color, letterSpacing: -0.5)),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: LinearProgressIndicator(
                value: double.tryParse(value.replaceAll('%', ''))! / 100,
                backgroundColor: Colors.white.withOpacity(0.05),
                valueColor: AlwaysStoppedAnimation<Color>(color),
                minHeight: 2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimerView() {
    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 500),
        child: Column(
          children: [
            const SizedBox(height: 40),
            _buildFocusCard(),
            const SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _timerPresetButton("WORK", 25),
                _timerPresetButton("SHORT", 5),
                _timerPresetButton("LONG", 15),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _timerPresetButton(String label, int mins) {
    return ElevatedButton(
      onPressed: () => setState(() {
        _secondsRemaining = mins * 60;
        _isRunning = false;
        _pomodoroTimer?.cancel();
      }),
      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1E293B)),
      child: Text(label),
    );
  }

  Widget _buildNotesView() {
    return Container(
      constraints: const BoxConstraints(maxWidth: 800),
      child: _buildSidePanel(),
    );
  }

  Widget _buildToolboxView() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _buildDevToolbox()),
            const SizedBox(width: 24),
            Expanded(child: _buildCurrencyConverter()),
          ],
        ),
        const SizedBox(height: 24),
        _buildNetworkTools(),
        const SizedBox(height: 24),
        _buildCodeSnippets(),
      ],
    );
  }

  Widget _buildCurrencyConverter() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(24)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("CURRENCY CONVERTER", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white38)),
          const SizedBox(height: 16),
          TextField(
            onChanged: (v) => _currencyAmount = double.tryParse(v) ?? 1.0,
            decoration: const InputDecoration(labelText: "Amount", border: OutlineInputBorder()),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: Text("FROM: $_fromCurrency")),
              IconButton(onPressed: () {}, icon: const Icon(Icons.swap_horiz)),
              Expanded(child: Text("TO: $_toCurrency")),
            ],
          ),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _convertCurrency, child: const Text("CONVERT")),
          const SizedBox(height: 16),
          Text("RESULT: ${_currencyResult.toStringAsFixed(2)} $_toCurrency", style: const TextStyle(fontSize: 18, color: Color(0xFF38BDF8))),
        ],
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
            Text("Welcome back, Nejah", style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            Row(
              children: [
                Text(DateFormat('EEEE, MMMM d').format(_now), style: GoogleFonts.inter(fontSize: 14, color: Colors.white38)),
                const SizedBox(width: 10),
                const Icon(Icons.sunny, size: 14, color: Colors.orangeAccent),
                const SizedBox(width: 4),
                const Text("24°C Casablanca", style: TextStyle(fontSize: 12, color: Colors.white38)),
              ],
            ),
          ],
        ),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(16)),
          child: Text(DateFormat('HH:mm:ss').format(_now), style: GoogleFonts.jetBrainsMono(fontSize: 24, fontWeight: FontWeight.bold, color: const Color(0xFF38BDF8))),
        ),
      ],
    );
  }

  Widget _buildMainGrid() {
    return Column(
      children: [
        _buildFocusCard(),
        const SizedBox(height: 24),
        _buildDevToolbox(),
        const SizedBox(height: 24),
        _buildTerminal(),
        const SizedBox(height: 24),
        _buildCodeSnippets(),
        const SizedBox(height: 24),
        _buildNewsFeed(),
      ],
    );
  }

  Widget _buildTerminal() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.white10)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("SYSTEM_LOG", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white38)),
              const Icon(Icons.terminal, size: 12, color: Colors.white24),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 150,
            child: ListView(
              children: [
                ..._terminalLogs.map((log) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      Text("[${log['type']!.toUpperCase()}]", style: TextStyle(fontSize: 10, fontFamily: 'Courier', color: log['type'] == 'sys' ? const Color(0xFF38BDF8) : log['type'] == 'err' ? Colors.redAccent : Colors.greenAccent)),
                      const SizedBox(width: 10),
                      Text(log['msg']!, style: const TextStyle(fontSize: 10, fontFamily: 'Courier', color: Colors.white70)),
                    ],
                  ),
                )).toList(),
              ],
            ),
          ),
          const Divider(color: Colors.white10),
          Row(
            children: [
              const Text("USER@NEJAHA:~\$ ", style: TextStyle(fontSize: 10, fontFamily: 'Courier', color: Colors.greenAccent, fontWeight: FontWeight.bold)),
              Expanded(
                child: TextField(
                  controller: _terminalController,
                  onSubmitted: _handleTerminalCommand,
                  style: const TextStyle(fontSize: 10, fontFamily: 'Courier', color: Colors.white),
                  decoration: const InputDecoration(border: InputBorder.none, isDense: true, hintText: "type help...", hintStyle: TextStyle(color: Colors.white10, fontSize: 10)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNetworkTools() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(24)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("NETWORK TOOLS", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white38)),
          const SizedBox(height: 16),
          TextField(
            controller: _hostController,
            decoration: InputDecoration(
              hintText: "Enter host (e.g. google.com)",
              filled: true,
              fillColor: const Color(0xFF0F172A),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: _isDnsLoading ? null : _dnsLookup,
            child: Text(_isDnsLoading ? "RESOLVING..." : "DNS LOOKUP"),
          ),
          if (_dnsResult.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(12)),
              child: Text(_dnsResult, style: GoogleFonts.jetBrainsMono(fontSize: 12, color: const Color(0xFF38BDF8))),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCodeSnippets() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(24)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("CODE SNIPPETS", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white38)),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 2.5),
            itemCount: _snippets.length,
            itemBuilder: (context, index) {
              final s = _snippets[index];
              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white10)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(s['name'] ?? "Snippet", style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8))),
                    const Spacer(),
                    Text(s['code'] ?? "", style: GoogleFonts.jetBrainsMono(fontSize: 9, color: Colors.white38), overflow: TextOverflow.ellipsis),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildFocusCard() {
    String minutes = (_secondsRemaining ~/ 60).toString().padLeft(2, '0');
    String seconds = (_secondsRemaining % 60).toString().padLeft(2, '0');
    
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF38BDF8), Color(0xFF818CF8)]),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("FOCUS TIMER", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white60)),
              Text("$minutes:$seconds", style: GoogleFonts.jetBrainsMono(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.white)),
            ],
          ),
          const Spacer(),
          IconButton(
            onPressed: _toggleTimer,
            icon: Icon(_isRunning ? Icons.pause_circle_filled : Icons.play_circle_filled, size: 64, color: Colors.white),
          ),
          IconButton(
            onPressed: _resetTimer,
            icon: const Icon(Icons.refresh, size: 32, color: Colors.white60),
          ),
        ],
      ),
    );
  }

  Widget _buildDevToolbox() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(24)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("DEVELOPER TOOLBOX", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white38)),
          const SizedBox(height: 16),
          TextField(
            controller: _toolInput,
            decoration: InputDecoration(
              hintText: "Enter text to encode/decode...",
              filled: true,
              fillColor: const Color(0xFF0F172A),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              ElevatedButton(onPressed: _base64Encode, child: const Text("B64 ENCODE")),
              const SizedBox(width: 8),
              ElevatedButton(onPressed: _base64Decode, child: const Text("B64 DECODE")),
            ],
          ),
          if (_toolOutput.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(12)),
              child: SelectableText(_toolOutput, style: GoogleFonts.jetBrainsMono(fontSize: 12, color: const Color(0xFF38BDF8))),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNewsFeed() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(24)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("TECH RADAR", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white38)),
              Text("IP: $_ip", style: const TextStyle(fontSize: 10, color: Color(0xFF38BDF8))),
            ],
          ),
          const SizedBox(height: 16),
          ..._news.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: InkWell(
              onTap: () => launchUrl(Uri.parse(item['url'] ?? "")),
              child: Row(
                children: [
                  const Icon(Icons.article_outlined, size: 16, color: Colors.white24),
                  const SizedBox(width: 12),
                  Expanded(child: Text(item['title'] ?? "", style: const TextStyle(fontSize: 13, color: Colors.white70), overflow: TextOverflow.ellipsis)),
                ],
              ),
            ),
          )).toList(),
        ],
      ),
    );
  }

  Widget _buildSidePanel() {
    final TextEditingController localNoteController = TextEditingController();
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(24)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("QUICK NOTES", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white38)),
          const SizedBox(height: 16),
          TextField(
            controller: localNoteController,
            onSubmitted: (v) => _addNote(v),
            decoration: InputDecoration(
              hintText: "Type a note and press enter...",
              hintStyle: const TextStyle(fontSize: 12),
              suffixIcon: IconButton(icon: const Icon(Icons.add), onPressed: () => _addNote(localNoteController.text)),
              border: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 400,
            child: ListView.builder(
              itemCount: _notes.length,
              itemBuilder: (context, index) {
                final note = _notes[index];
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(note['text'] ?? "", style: const TextStyle(fontSize: 13)),
                  trailing: IconButton(icon: const Icon(Icons.delete_outline, size: 18), onPressed: () => _deleteNote(note['_id'])),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
