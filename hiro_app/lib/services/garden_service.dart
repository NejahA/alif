import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/cluster_model.dart';
import '../models/connection_model.dart';
import '../models/pomodoro_model.dart';
import '../models/rpg_model.dart';
import '../models/soundscape_model.dart';
import '../models/synapse_model.dart';

class GardenService extends ChangeNotifier {
  static String? customServerUrl;

  static String get serverBaseUrl {
    if (customServerUrl != null && customServerUrl!.isNotEmpty) {
      return customServerUrl!;
    }
    const envUrl = String.fromEnvironment('HIRO_SERVER_URL');
    if (envUrl.isNotEmpty) return envUrl;
    if (kIsWeb) return 'https://hiro-server-three.vercel.app';
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'https://hiro-server-three.vercel.app';
    }
    return 'https://hiro-server-three.vercel.app';
  }

  Future<void> setCustomServerUrl(String url) async {
    customServerUrl = url.trim();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('hiro_server_url', customServerUrl!);
    await checkCloudHealth();
    await _loadFromServer();
    notifyListeners();
  }

  static String get dataEndpoint => '$serverBaseUrl/api/hiro/data';
  static String get healthEndpoint => '$serverBaseUrl/api/hiro/health';

  List<SynapseModel> _synapses = [];
  List<ConnectionModel> _connections = [];
  List<ClusterModel> _clusters = [];

  SynapseModel? _selectedSynapse;
  String? _connectingFromId;
  bool _isConnectMode = false;
  bool _autoConnect = true;
  bool _gridSnap = false;
  final bool _decayEnabled = false;

  String _filterTag = '';
  bool _filterStarred = false;
  String _searchQuery = '';

  bool _isCloudConnected = false;
  bool _isSyncing = false;
  Timer? _syncDebounceTimer;
  Timer? _simulationTimer;
  Timer? _pomodoroTimer;

  final String _clientId =
      'flutter_${DateTime.now().millisecondsSinceEpoch}_${Random().nextInt(9999)}';
  String get clientId => _clientId;
  String _lastSyncedServerTimestamp = '';
  String? _draggedSynapseId;

  http.Client? _sseClient;
  StreamSubscription? _sseSubscription;
  Timer? _liveSyncPollTimer;
  bool _isConnectingSse = false;

  RpgModel _rpg = RpgModel();
  final PomodoroModel _pomodoro = PomodoroModel();
  SoundscapeModel _soundscape = SoundscapeModel();

  // Getters
  List<SynapseModel> get synapses => _synapses;
  List<ConnectionModel> get connections => _connections;
  List<ClusterModel> get clusters => _clusters;
  SynapseModel? get selectedSynapse => _selectedSynapse;
  String? get connectingFromId => _connectingFromId;
  bool get isConnectMode => _isConnectMode;
  bool get autoConnect => _autoConnect;
  bool get gridSnap => _gridSnap;
  bool get decayEnabled => _decayEnabled;
  String get filterTag => _filterTag;
  bool get filterStarred => _filterStarred;
  String get searchQuery => _searchQuery;
  bool get isCloudConnected => _isCloudConnected;
  bool get isSyncing => _isSyncing;
  RpgModel get rpg => _rpg;
  PomodoroModel get pomodoro => _pomodoro;
  SoundscapeModel get soundscape => _soundscape;

  List<SynapseModel> get visibleSynapses {
    return _synapses.where((s) {
      if (_filterStarred && !s.starred) return false;
      if (_filterTag.isNotEmpty && s.tag.toLowerCase() != _filterTag.toLowerCase()) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final inTitle = s.title.toLowerCase().contains(q);
        final inNotes = s.notes.toLowerCase().contains(q);
        final inTag = s.tag.toLowerCase().contains(q);
        if (!inTitle && !inNotes && !inTag) return false;
      }
      return true;
    }).toList();
  }

  Set<String> get allTags {
    final tags = <String>{};
    for (final s in _synapses) {
      if (s.tag.trim().isNotEmpty) tags.add(s.tag.trim());
    }
    return tags;
  }

  GardenService() {
    _init();
  }

  Future<void> _init() async {
    // 1. Try local storage first for instant startup
    await _loadFromLocal();

    // 2. Try MongoDB Atlas via hi§ro local server
    await checkCloudHealth();
    await _loadFromServer();

    // If completely empty, seed inspirational garden
    if (_synapses.isEmpty) {
      _seedDefaultGarden();
    }

    // 3. Start high-frequency physics/animation loop (60 FPS)
    _simulationTimer = Timer.periodic(const Duration(milliseconds: 16), (_) {
      _stepSimulation();
    });

    // 4. Start real-time live synchronization (SSE + background polling)
    _startLiveSync();
  }

  void _startLiveSync() {
    _liveSyncPollTimer?.cancel();
    _liveSyncPollTimer =
        Timer.periodic(const Duration(milliseconds: 1500), (_) {
      if (!_isSyncing) {
        _loadFromServer(isLiveSync: true);
      }
    });

    _connectSseStream();
  }

  void _connectSseStream() {
    if (_isConnectingSse) return;
    _isConnectingSse = true;

    try {
      _sseSubscription?.cancel();
      _sseClient?.close();
      _sseClient = http.Client();

      final sseUri = Uri.parse('$serverBaseUrl/api/events');
      final request = http.Request('GET', sseUri);
      request.headers['Accept'] = 'text/event-stream';
      request.headers['Cache-Control'] = 'no-cache';

      _sseClient!.send(request).then((streamedResponse) {
        _isConnectingSse = false;
        if (streamedResponse.statusCode == 200) {
          _isCloudConnected = true;
          notifyListeners();

          _sseSubscription = streamedResponse.stream
              .transform(utf8.decoder)
              .transform(const LineSplitter())
              .listen((line) {
            if (line.startsWith('data:')) {
              final raw = line.substring(5).trim();
              if (raw.isNotEmpty) {
                try {
                  final data = jsonDecode(raw);
                  if (data['type'] == 'update') {
                    final sender = data['senderId']?.toString() ?? '';
                    if (sender != _clientId) {
                      _loadFromServer(isLiveSync: true);
                    }
                  }
                } catch (_) {}
              }
            }
          }, onError: (_) {
            _isCloudConnected = false;
            Timer(const Duration(seconds: 5), _connectSseStream);
          }, onDone: () {
            Timer(const Duration(seconds: 3), _connectSseStream);
          });
        }
      }).catchError((_) {
        _isConnectingSse = false;
        Timer(const Duration(seconds: 5), _connectSseStream);
      });
    } catch (_) {
      _isConnectingSse = false;
    }
  }

  @override
  void dispose() {
    _syncDebounceTimer?.cancel();
    _simulationTimer?.cancel();
    _pomodoroTimer?.cancel();
    _liveSyncPollTimer?.cancel();
    _sseSubscription?.cancel();
    _sseClient?.close();
    super.dispose();
  }

  // --- MongoDB Cloud Sync & Health ---

  Future<bool> checkCloudHealth() async {
    try {
      final res = await http.get(Uri.parse(healthEndpoint)).timeout(
            const Duration(seconds: 3),
          );
      if (res.statusCode == 200) {
        final json = jsonDecode(res.body);
        _isCloudConnected = json['connected'] == true;
      } else {
        _isCloudConnected = false;
      }
    } catch (_) {
      _isCloudConnected = false;
    }
    notifyListeners();
    return _isCloudConnected;
  }

  Future<void> _loadFromServer({bool isLiveSync = false}) async {
    if (_isSyncing || _draggedSynapseId != null) return;

    try {
      final res = await http.get(Uri.parse(dataEndpoint)).timeout(
            const Duration(seconds: 3),
          );
      if (res.statusCode == 200) {
        final json = jsonDecode(res.body);
        if (json['ok'] == true && json['data'] != null) {
          final data = json['data'];
          Map<String, dynamic>? mainGarden;

          if (data['gardens'] != null && data['gardens']['main'] != null) {
            mainGarden = data['gardens']['main'] as Map<String, dynamic>;
          } else if (data['synapses'] != null) {
            mainGarden = data as Map<String, dynamic>;
          }

          if (mainGarden != null) {
            final serverUpdatedAt = json['updatedAt']?.toString() ??
                mainGarden['updatedAt']?.toString() ??
                '';
            if (isLiveSync &&
                serverUpdatedAt.isNotEmpty &&
                serverUpdatedAt == _lastSyncedServerTimestamp) {
              return;
            }
            _lastSyncedServerTimestamp = serverUpdatedAt;

            _restoreGardenData(mainGarden);
            _isCloudConnected = true;
            notifyListeners();
            return;
          }
        }
      }
    } catch (e) {
      if (!isLiveSync) {
        debugPrint("Could not load from hi§ro server: $e");
      }
    }
  }

  void _restoreGardenData(Map<String, dynamic> data) {
    if (data['synapses'] is List) {
      final serverSynapses = (data['synapses'] as List)
          .map((item) => SynapseModel.fromJson(item as Map<String, dynamic>))
          .toList();

      if (_synapses.isEmpty) {
        _synapses = serverSynapses;
      } else {
        final Map<String, SynapseModel> existingMap = {
          for (final s in _synapses) s.id.trim(): s
        };

        final updatedList = <SynapseModel>[];
        for (final incoming in serverSynapses) {
          final existing = existingMap[incoming.id.trim()];
          if (existing != null) {
            existing.title = incoming.title;
            existing.notes = incoming.notes;
            existing.type = incoming.type;
            existing.hue = incoming.hue;
            existing.tag = incoming.tag;
            existing.starred = incoming.starred;
            existing.charge = incoming.charge;
            existing.isCompleted = incoming.isCompleted;
            if (_draggedSynapseId != incoming.id) {
              existing.x = incoming.x;
              existing.y = incoming.y;
            }
            updatedList.add(existing);
          } else {
            updatedList.add(incoming);
          }
        }
        _synapses = updatedList;
      }
    }

    if (data['connections'] is List) {
      _connections = (data['connections'] as List)
          .map((item) => ConnectionModel.fromJson(item as Map<String, dynamic>))
          .where((c) =>
              c.fromId.isNotEmpty &&
              c.toId.isNotEmpty &&
              c.fromId != c.toId)
          .toList();
    }

    if (_autoConnect) {
      _rebuildAutoConnections();
    }

    if (data['clusters'] is List) {
      _clusters = (data['clusters'] as List)
          .map((item) => ClusterModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    if (data['rpg'] is Map) {
      _rpg = RpgModel.fromJson(data['rpg'] as Map<String, dynamic>);
    }
    if (data['soundscape'] is Map) {
      _soundscape =
          SoundscapeModel.fromJson(data['soundscape'] as Map<String, dynamic>);
    }
  }

  void _rebuildAutoConnections() {
    if (!_autoConnect) return;
    const double connectionRange = 220.0;

    final manualConns = _connections.where((c) => c.manual).toList();
    final newConns = <ConnectionModel>[...manualConns];

    for (int i = 0; i < _synapses.length; i++) {
      for (int j = i + 1; j < _synapses.length; j++) {
        final a = _synapses[i];
        final b = _synapses[j];
        final dist =
            sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
        if (dist <= connectionRange) {
          final alreadyCovered = newConns.any((c) => c.matches(a.id, b.id));
          if (!alreadyCovered) {
            newConns.add(ConnectionModel(fromId: a.id, toId: b.id, manual: false));
          }
        }
      }
    }
    _connections = newConns;
  }

  Future<void> pushSync() async {
    _isSyncing = true;
    notifyListeners();

    _syncDebounceTimer?.cancel();
    _syncDebounceTimer = Timer(const Duration(milliseconds: 200), () async {
      final payload = _serializeGarden();

      // Save locally
      await _saveToLocal(payload);

      // Save to cloud server
      try {
        final res = await http.post(
          Uri.parse(dataEndpoint),
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Id': _clientId,
          },
          body: jsonEncode({'data': payload}),
        ).timeout(const Duration(seconds: 4));

        _isCloudConnected = res.statusCode == 200;
        if (_isCloudConnected) {
          final resJson = jsonDecode(res.body);
          if (resJson['updatedAt'] != null) {
            _lastSyncedServerTimestamp = resJson['updatedAt'].toString();
          }
        }
      } catch (_) {
        _isCloudConnected = false;
      } finally {
        _isSyncing = false;
        notifyListeners();
      }
    });
  }

  Map<String, dynamic> _serializeGarden() {
    return {
      'gardens': {
        'main': {
          'name': 'main',
          'synapses': _synapses.map((s) => s.toJson()).toList(),
          'connections': _connections.map((c) => c.toJson()).toList(),
          'clusters': _clusters.map((cl) => cl.toJson()).toList(),
          'autoConnect': _autoConnect,
          'gridSnap': _gridSnap,
          'rpg': _rpg.toJson(),
          'soundscape': _soundscape.toJson(),
          'updatedAt': DateTime.now().toIso8601String(),
        }
      },
      'active': 'main',
    };
  }

  Future<void> _saveToLocal(Map<String, dynamic> payload) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('hiro_garden_data', jsonEncode(payload));
    } catch (e) {
      debugPrint("Error saving locally: $e");
    }
  }

  Future<void> _loadFromLocal() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedUrl = prefs.getString('hiro_server_url');
      if (savedUrl != null && savedUrl.trim().isNotEmpty) {
        customServerUrl = savedUrl.trim();
      }
      final raw = prefs.getString('hiro_garden_data');
      if (raw != null) {
        final json = jsonDecode(raw);
        if (json['gardens']?['main'] != null) {
          _restoreGardenData(json['gardens']['main']);
        }
      }
    } catch (e) {
      debugPrint("Error loading locally: $e");
    }
  }

  void _seedDefaultGarden() {
    _synapses = [
      SynapseModel(
        id: 'syn_seed_1',
        title: 'Cosmic Inception',
        notes: 'The spark of all thoughts in the neural garden.',
        x: 400,
        y: 280,
        type: 'idea',
        charge: 1.0,
        hue: 45,
        starred: true,
        tag: 'genesis',
      ),
      SynapseModel(
        id: 'syn_seed_2',
        title: 'Neural Synthesis',
        notes: 'Interweaving concepts to unlock deep eureka resonance.',
        x: 250,
        y: 450,
        type: 'task',
        charge: 0.85,
        hue: 160,
        tag: 'creation',
      ),
      SynapseModel(
        id: 'syn_seed_3',
        title: 'Flow State Chamber',
        notes: '432Hz ambient frequency tuning for hyper-focus.',
        x: 550,
        y: 430,
        type: 'resource',
        charge: 0.9,
        hue: 200,
        starred: true,
        tag: 'audio',
      ),
      SynapseModel(
        id: 'syn_seed_4',
        title: 'Soul Reincarnation',
        notes: 'Ascend through thought levels and harvest astral karma.',
        x: 420,
        y: 560,
        type: 'question',
        charge: 0.75,
        hue: 280,
        tag: 'rpg',
      ),
    ];

    _connections = [
      ConnectionModel(fromId: 'syn_seed_1', toId: 'syn_seed_2'),
      ConnectionModel(fromId: 'syn_seed_1', toId: 'syn_seed_3'),
      ConnectionModel(fromId: 'syn_seed_2', toId: 'syn_seed_4'),
      ConnectionModel(fromId: 'syn_seed_3', toId: 'syn_seed_4'),
    ];

    _clusters = [
      ClusterModel(
        id: 'cl_genesis',
        name: 'Genesis Core',
        synapseIds: ['syn_seed_1', 'syn_seed_2', 'syn_seed_3', 'syn_seed_4'],
        hue: 190,
      )
    ];

    notifyListeners();
  }

  // --- Physics & Pulse Simulation Loop ---

  void _stepSimulation() {
    bool hasVisualChange = false;

    // 1. Sprout expansion
    for (final s in _synapses) {
      if (s.sproutProgress < 1.0) {
        s.sproutProgress = min(1.0, s.sproutProgress + 0.05);
        hasVisualChange = true;
      }
      if (s.pulseWave > 0.0) {
        s.pulseWave = max(0.0, s.pulseWave - 0.025);
        hasVisualChange = true;
      }
    }

    // 2. Axon pulses transmission
    for (final conn in _connections) {
      if (conn.activePulses.isNotEmpty) {
        hasVisualChange = true;
        for (int i = conn.activePulses.length - 1; i >= 0; i--) {
          final p = conn.activePulses[i];
          p.progress += p.speed;
          if (p.progress >= 1.0) {
            conn.activePulses.removeAt(i);
            // Trigger target synapse activation!
            _onPulseArrived(conn.toId);
          }
        }
      }
    }

    // 3. Gentle node drift / damping
    for (final s in _synapses) {
      if (s.vx.abs() > 0.01 || s.vy.abs() > 0.01) {
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.88;
        s.vy *= 0.88;
        hasVisualChange = true;
      }
    }

    if (hasVisualChange) {
      notifyListeners();
    }
  }

  void _onPulseArrived(String targetId) {
    final syn = findSynapseById(targetId);
    if (syn != null) {
      syn.charge = min(1.0, syn.charge + 0.15);
      syn.pulseWave = 1.0;
      _rpg.harvestedSouls += 1;
      _rpg.gainXp(1);
    }
  }

  // --- Interactive Garden Actions ---

  SynapseModel sproutSynapse(
    double x,
    double y, {
    String title = '',
    String type = 'idea',
    String tag = '',
  }) {
    if (_gridSnap) {
      x = (x / 40).round() * 40.0;
      y = (y / 40).round() * 40.0;
    }

    final id = 'syn_${DateTime.now().millisecondsSinceEpoch}_${Random().nextInt(999)}';
    final syn = SynapseModel(
      id: id,
      title: title.isEmpty ? 'Synapse #${id.substring(id.length - 4)}' : title,
      x: x,
      y: y,
      type: type,
      tag: tag,
      sproutProgress: 0.1,
      pulseWave: 1.0,
      charge: 1.0,
    );

    _synapses.add(syn);
    _selectedSynapse = syn;

    // Gain RPG rewards
    _rpg.gainXp(15);
    _rpg.harvestedSouls += 1;
    _rpg.karmaBalance += 2;

    if (_autoConnect) {
      _autoConnectNearest(syn);
    }

    pushSync();
    notifyListeners();
    return syn;
  }

  void selectSynapse(SynapseModel? syn) {
    _selectedSynapse = syn;
    notifyListeners();
  }

  void moveSynapse(String id, double x, double y) {
    _draggedSynapseId = id;
    final syn = findSynapseById(id);
    if (syn != null) {
      if (_gridSnap) {
        x = (x / 40).round() * 40.0;
        y = (y / 40).round() * 40.0;
      }
      syn.x = x;
      syn.y = y;
      if (_autoConnect) {
        _rebuildAutoConnections();
      }
      notifyListeners();
    }
  }

  void endMoveSynapse() {
    _draggedSynapseId = null;
    if (_autoConnect) {
      _rebuildAutoConnections();
    }
    pushSync();
    notifyListeners();
  }

  void updateSynapse(
    String id, {
    String? title,
    String? notes,
    String? type,
    double? hue,
    String? tag,
    bool? starred,
    bool? isCompleted,
  }) {
    final syn = findSynapseById(id);
    if (syn != null) {
      if (title != null) syn.title = title;
      if (notes != null) syn.notes = notes;
      if (type != null) syn.type = type;
      if (hue != null) syn.hue = hue;
      if (tag != null) syn.tag = tag;
      if (starred != null) syn.starred = starred;
      if (isCompleted != null) {
        syn.isCompleted = isCompleted;
        if (isCompleted) {
          _rpg.gainXp(25);
          _rpg.karmaBalance += 5;
        }
      }
      pushSync();
      notifyListeners();
    }
  }

  void deleteSynapse(String id) {
    _synapses.removeWhere((s) => s.id == id);
    _connections.removeWhere((c) => c.involves(id));
    for (final cl in _clusters) {
      cl.synapseIds.remove(id);
    }
    if (_selectedSynapse?.id == id) {
      _selectedSynapse = null;
    }
    pushSync();
    notifyListeners();
  }

  void fireSynapse(String id) {
    final syn = findSynapseById(id);
    if (syn == null) return;

    syn.charge = 1.0;
    syn.pulseWave = 1.0;
    _rpg.gainXp(5);

    // Send pulses along all outbound connections
    for (final conn in _connections) {
      if (conn.fromId == id) {
        conn.activePulses.add(
          AxonPulse(progress: 0.0, speed: 0.035, hue: syn.hue),
        );
      } else if (conn.toId == id) {
        conn.activePulses.add(
          AxonPulse(progress: 0.0, speed: 0.035, hue: syn.hue),
        );
      }
    }

    notifyListeners();
  }

  // --- Connection Mechanics ---

  void toggleConnectMode() {
    _isConnectMode = !_isConnectMode;
    _connectingFromId = null;
    notifyListeners();
  }

  void handleConnectClick(String synapseId) {
    if (_connectingFromId == null) {
      _connectingFromId = synapseId;
    } else if (_connectingFromId == synapseId) {
      _connectingFromId = null;
    } else {
      addConnection(_connectingFromId!, synapseId);
      _connectingFromId = null;
      _isConnectMode = false;
    }
    notifyListeners();
  }

  void addConnection(String fromId, String toId) {
    final cleanFrom = fromId.trim();
    final cleanTo = toId.trim();
    if (cleanFrom.isEmpty || cleanTo.isEmpty || cleanFrom == cleanTo) return;
    final exists = _connections.any((c) => c.matches(cleanFrom, cleanTo));
    if (!exists) {
      _connections.add(
          ConnectionModel(fromId: cleanFrom, toId: cleanTo, manual: true));
      _rpg.gainXp(10);
      _rpg.karmaBalance += 1;
      pushSync();
      notifyListeners();
    }
  }

  void removeConnection(String a, String b) {
    _connections.removeWhere((c) => c.matches(a, b));
    pushSync();
    notifyListeners();
  }

  void _autoConnectNearest(SynapseModel target) {
    if (_synapses.length < 2) return;
    SynapseModel? nearest;
    double minDist = 320.0; // max auto-connect reach

    for (final s in _synapses) {
      if (s.id == target.id) continue;
      final dist = sqrt((s.x - target.x) * (s.x - target.x) + (s.y - target.y) * (s.y - target.y));
      if (dist < minDist) {
        minDist = dist;
        nearest = s;
      }
    }

    if (nearest != null) {
      addConnection(nearest.id, target.id);
    }
  }

  void autoLayout() {
    if (_synapses.isEmpty) return;

    // Force-directed graph layout algorithm step
    final k = 140.0; // ideal spring length
    final cRepulse = 35000.0;
    final cAttract = 0.04;

    for (int iter = 0; iter < 12; iter++) {
      // Repulsion between all nodes
      for (int i = 0; i < _synapses.length; i++) {
        for (int j = i + 1; j < _synapses.length; j++) {
          final s1 = _synapses[i];
          final s2 = _synapses[j];
          double dx = s2.x - s1.x;
          double dy = s2.y - s1.y;
          double dist = sqrt(dx * dx + dy * dy);
          if (dist < 1.0) dist = 1.0;
          final force = cRepulse / (dist * dist);
          final fx = (dx / dist) * force;
          final fy = (dy / dist) * force;
          s1.vx -= fx * 0.05;
          s1.vy -= fy * 0.05;
          s2.vx += fx * 0.05;
          s2.vy += fy * 0.05;
        }
      }

      // Attraction along connections
      for (final conn in _connections) {
        final s1 = findSynapseById(conn.fromId);
        final s2 = findSynapseById(conn.toId);
        if (s1 != null && s2 != null) {
          double dx = s2.x - s1.x;
          double dy = s2.y - s1.y;
          double dist = sqrt(dx * dx + dy * dy);
          if (dist < 1.0) dist = 1.0;
          final force = (dist - k) * cAttract;
          final fx = (dx / dist) * force;
          final fy = (dy / dist) * force;
          s1.vx += fx * 0.1;
          s1.vy += fy * 0.1;
          s2.vx -= fx * 0.1;
          s2.vy -= fy * 0.1;
        }
      }
    }

    pushSync();
    notifyListeners();
  }

  // --- AI Mind-Map Oracle ---

  void generateOracleMindMap(String topic) {
    if (topic.trim().isEmpty) return;

    final centerX = 450.0;
    final centerY = 350.0;
    final root = sproutSynapse(centerX, centerY, title: topic, type: 'idea');
    root.starred = true;

    final subtopics = _getOracleSubtopics(topic);
    final count = subtopics.length;
    final radius = 180.0;

    for (int i = 0; i < count; i++) {
      final angle = (2 * pi / count) * i;
      final sx = centerX + radius * cos(angle);
      final sy = centerY + radius * sin(angle);
      final sub = subtopics[i];
      final child = sproutSynapse(sx, sy, title: sub['title']!, type: sub['type']!);
      addConnection(root.id, child.id);
    }

    _rpg.gainXp(50);
    _rpg.karmaBalance += 10;
    pushSync();
    notifyListeners();
  }

  List<Map<String, String>> _getOracleSubtopics(String topic) {
    final lower = topic.toLowerCase();
    if (lower.contains('quantum')) {
      return [
        {'title': 'Superposition & Qubits', 'type': 'resource'},
        {'title': 'Quantum Entanglement', 'type': 'question'},
        {'title': 'Decoherence & Shielding', 'type': 'warning'},
        {'title': 'Quantum Algorithms (Shor/Grover)', 'type': 'task'},
      ];
    } else if (lower.contains('focus') || lower.contains('productivity')) {
      return [
        {'title': 'Binaural Theta Cycles', 'type': 'resource'},
        {'title': 'Pomodoro Time-Boxing', 'type': 'task'},
        {'title': 'Distraction Blocker', 'type': 'warning'},
        {'title': 'Deep Work Synthesis', 'type': 'idea'},
      ];
    } else {
      return [
        {'title': 'Foundational Principles', 'type': 'idea'},
        {'title': 'Critical Questions & Unknowns', 'type': 'question'},
        {'title': 'Actionable Implementation', 'type': 'task'},
        {'title': 'Key References & Citations', 'type': 'resource'},
      ];
    }
  }

  // --- RPG Soul Codex & Karma ---

  void performSeance() {
    if (_rpg.spiritualEnergy >= 25) {
      _rpg.spiritualEnergy -= 25;
      _rpg.harvestedSouls += 5;
      _rpg.karmaBalance += 15;
      _rpg.gainXp(40);

      // Fire random synapses
      if (_synapses.isNotEmpty) {
        final randomSyn = _synapses[Random().nextInt(_synapses.length)];
        fireSynapse(randomSyn.id);
      }

      pushSync();
      notifyListeners();
    }
  }

  // --- Pomodoro Timer ---

  void startPomodoro() {
    _pomodoro.isRunning = true;
    _pomodoroTimer?.cancel();
    _pomodoroTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_pomodoro.remainingSeconds > 0) {
        _pomodoro.remainingSeconds -= 1;
        notifyListeners();
      } else {
        _pomodoro.isRunning = false;
        _pomodoro.sessionsCompleted += 1;
        timer.cancel();

        // Award RPG XP and fire bound synapse!
        _rpg.gainXp(50);
        _rpg.karmaBalance += 10;
        if (_pomodoro.boundSynapseId != null) {
          fireSynapse(_pomodoro.boundSynapseId!);
        }
        notifyListeners();
      }
    });
    notifyListeners();
  }

  void pausePomodoro() {
    _pomodoro.isRunning = false;
    _pomodoroTimer?.cancel();
    notifyListeners();
  }

  void resetPomodoro() {
    _pomodoro.isRunning = false;
    _pomodoroTimer?.cancel();
    _pomodoro.remainingSeconds = _pomodoro.totalSeconds;
    notifyListeners();
  }

  void setPomodoroMode(String mode) {
    _pomodoro.mode = mode;
    _pomodoro.totalSeconds = (mode == 'work' ? 25 : 5) * 60;
    _pomodoro.remainingSeconds = _pomodoro.totalSeconds;
    _pomodoro.isRunning = false;
    _pomodoroTimer?.cancel();
    notifyListeners();
  }

  void bindPomodoroSynapse(String? synId) {
    _pomodoro.boundSynapseId = synId;
    notifyListeners();
  }

  // --- Soundscape Controls ---

  void updateSoundscape({
    double? droneVolume,
    double? rainVolume,
    double? binauralVolume,
    bool? pentatonicNotesEnabled,
    bool? isPlaying,
  }) {
    if (droneVolume != null) _soundscape.droneVolume = droneVolume;
    if (rainVolume != null) _soundscape.rainVolume = rainVolume;
    if (binauralVolume != null) _soundscape.binauralVolume = binauralVolume;
    if (pentatonicNotesEnabled != null) {
      _soundscape.pentatonicNotesEnabled = pentatonicNotesEnabled;
    }
    if (isPlaying != null) _soundscape.isPlaying = isPlaying;
    pushSync();
    notifyListeners();
  }

  // --- Search & Filters ---

  void setSearchQuery(String q) {
    _searchQuery = q;
    notifyListeners();
  }

  void setFilterTag(String tag) {
    _filterTag = tag;
    notifyListeners();
  }

  void toggleStarFilter() {
    _filterStarred = !_filterStarred;
    notifyListeners();
  }

  void toggleAutoConnect() {
    _autoConnect = !_autoConnect;
    if (_autoConnect) {
      _rebuildAutoConnections();
    }
    pushSync();
    notifyListeners();
  }

  void toggleGridSnap() {
    _gridSnap = !_gridSnap;
    notifyListeners();
  }

  void clearAll() {
    _synapses.clear();
    _connections.clear();
    _clusters.clear();
    _selectedSynapse = null;
    pushSync();
    notifyListeners();
  }

  SynapseModel? findSynapseById(String id) {
    final cleanId = id.trim();
    if (cleanId.isEmpty) return null;
    for (final s in _synapses) {
      if (s.id.trim() == cleanId) return s;
    }
    return null;
  }
}
