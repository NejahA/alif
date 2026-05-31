import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../models/deity.dart';

const _storageKey = 'h_ref_deities';
const _uuid = Uuid();

class DeityProvider extends ChangeNotifier {
  List<Deity> _deities = [];
  String _searchQuery = '';
  DeityCategory? _filterCategory;
  bool _showFavoritesOnly = false;
  bool _isLoading = true;

  List<Deity> get deities {
    var list = _deities.where((d) {
      final matchesSearch = _searchQuery.isEmpty ||
          d.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          d.origin.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          d.domain.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          d.aliases
              .any((a) => a.toLowerCase().contains(_searchQuery.toLowerCase()));
      final matchesCategory =
          _filterCategory == null || d.category == _filterCategory;
      final matchesFavorite = !_showFavoritesOnly || d.isFavorite;
      return matchesSearch && matchesCategory && matchesFavorite;
    }).toList();
    list.sort((a, b) => a.name.compareTo(b.name));
    return list;
  }

  bool get isLoading => _isLoading;
  String get searchQuery => _searchQuery;
  DeityCategory? get filterCategory => _filterCategory;
  bool get showFavoritesOnly => _showFavoritesOnly;
  int get totalCount => _deities.length;

  DeityProvider() {
    _init();
  }

  Future<void> _init() async {
    await _loadFromStorage();
    if (_deities.isEmpty) {
      _seedData();
      await _saveToStorage();
    }
    _isLoading = false;
    notifyListeners();
  }

  // ── CREATE ──────────────────────────────────────────────────────────────────
  Future<void> addDeity({
    required String name,
    required String origin,
    required String domain,
    required String description,
    required String symbol,
    required DeityCategory category,
    List<String> aliases = const [],
  }) async {
    final now = DateTime.now();
    final deity = Deity(
      id: _uuid.v4(),
      name: name,
      origin: origin,
      domain: domain,
      description: description,
      symbol: symbol,
      category: category,
      aliases: aliases,
      createdAt: now,
      updatedAt: now,
    );
    _deities.add(deity);
    await _saveToStorage();
    notifyListeners();
  }

  // ── READ ────────────────────────────────────────────────────────────────────
  Deity? getById(String id) {
    try {
      return _deities.firstWhere((d) => d.id == id);
    } catch (_) {
      return null;
    }
  }

  Map<DeityCategory, int> get categoryCounts {
    final counts = <DeityCategory, int>{};
    for (final d in _deities) {
      counts[d.category] = (counts[d.category] ?? 0) + 1;
    }
    return counts;
  }

  // ── UPDATE ──────────────────────────────────────────────────────────────────
  Future<void> updateDeity({
    required String id,
    required String name,
    required String origin,
    required String domain,
    required String description,
    required String symbol,
    required DeityCategory category,
    List<String> aliases = const [],
  }) async {
    final index = _deities.indexWhere((d) => d.id == id);
    if (index == -1) return;
    _deities[index] = _deities[index].copyWith(
      name: name,
      origin: origin,
      domain: domain,
      description: description,
      symbol: symbol,
      category: category,
      aliases: aliases,
      updatedAt: DateTime.now(),
    );
    await _saveToStorage();
    notifyListeners();
  }

  Future<void> toggleFavorite(String id) async {
    final index = _deities.indexWhere((d) => d.id == id);
    if (index == -1) return;
    _deities[index] = _deities[index].copyWith(
      isFavorite: !_deities[index].isFavorite,
      updatedAt: DateTime.now(),
    );
    await _saveToStorage();
    notifyListeners();
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────
  Future<void> deleteDeity(String id) async {
    _deities.removeWhere((d) => d.id == id);
    await _saveToStorage();
    notifyListeners();
  }

  Future<void> deleteAll() async {
    _deities.clear();
    await _saveToStorage();
    notifyListeners();
  }

  // ── FILTER / SEARCH ─────────────────────────────────────────────────────────
  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setFilterCategory(DeityCategory? category) {
    _filterCategory = category;
    notifyListeners();
  }

  void toggleFavoritesOnly() {
    _showFavoritesOnly = !_showFavoritesOnly;
    notifyListeners();
  }

  void clearFilters() {
    _searchQuery = '';
    _filterCategory = null;
    _showFavoritesOnly = false;
    notifyListeners();
  }

  // ── PERSISTENCE ─────────────────────────────────────────────────────────────
  Future<void> _saveToStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonList = _deities.map((d) => d.toJson()).toList();
    await prefs.setString(_storageKey, jsonEncode(jsonList));
  }

  Future<void> _loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    if (raw != null) {
      final jsonList = jsonDecode(raw) as List;
      _deities = jsonList.map((j) => Deity.fromJson(j)).toList();
    }
  }

  // ── SEED DATA ────────────────────────────────────────────────────────────────
  void _seedData() {
    final now = DateTime.now();

    final seeds = [
      // ── ANCIENT ─────────────────────────────────────────────────────────────
      Deity(
        id: _uuid.v4(),
        name: 'Zeus',
        origin: 'Ancient Greece',
        domain: 'King of the Gods, Sky & Thunder',
        description:
            'The supreme ruler of Mount Olympus and the Olympian gods. Zeus was the god of the sky, lightning, thunder, law, order, and justice. He wielded a thunderbolt and was known for both his power and his many romantic escapades.',
        symbol: '⚡',
        category: DeityCategory.ancient,
        aliases: ['Jupiter (Roman)', 'Dias'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),
      Deity(
        id: _uuid.v4(),
        name: 'Athena',
        origin: 'Ancient Greece',
        domain: 'Goddess of Wisdom, Warfare & Crafts',
        description:
            'Born fully armored from the head of Zeus, Athena was the goddess of wisdom, strategic warfare, and crafts. She was the patron deity of Athens and one of the most revered of the Olympian goddesses.',
        symbol: '🦉',
        category: DeityCategory.ancient,
        aliases: ['Minerva (Roman)'],
        isFavorite: true,
        createdAt: now,
        updatedAt: now,
      ),
      Deity(
        id: _uuid.v4(),
        name: 'Ra',
        origin: 'Ancient Egypt',
        domain: 'God of the Sun & Creation',
        description:
            'Ra was the ancient Egyptian deity of the sun and is one of the oldest and most central deities of the Egyptian pantheon. He was believed to travel through the sky by day in his solar barque and through the underworld at night.',
        symbol: '☀️',
        category: DeityCategory.ancient,
        aliases: ['Amun-Ra', 'Re'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),
      Deity(
        id: _uuid.v4(),
        name: 'Osiris',
        origin: 'Ancient Egypt',
        domain: 'God of the Dead, Resurrection & Agriculture',
        description:
            'Osiris was one of the most important gods in ancient Egypt. He was the god of the afterlife, death, life, resurrection, and agriculture. Murdered by his brother Set, he was resurrected by Isis and became ruler of the underworld.',
        symbol: '🌿',
        category: DeityCategory.ancient,
        aliases: ['Usir'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),
      Deity(
        id: _uuid.v4(),
        name: 'Poseidon',
        origin: 'Ancient Greece',
        domain: 'God of the Sea, Earthquakes & Horses',
        description:
            'Poseidon was the Olympian god of the sea, rivers, floods, droughts, earthquakes, and horses. He was second only to Zeus in power among the Olympians, and his mood was said to be as unpredictable as the ocean itself.',
        symbol: '🔱',
        category: DeityCategory.ancient,
        aliases: ['Neptune (Roman)'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),
      Deity(
        id: _uuid.v4(),
        name: 'Anubis',
        origin: 'Ancient Egypt',
        domain: 'God of Embalming & the Dead',
        description:
            'Anubis is the jackal-headed god associated with mummification and the afterlife in ancient Egyptian religion. He guides souls to the afterlife and presides over the weighing of the heart ceremony.',
        symbol: '🐺',
        category: DeityCategory.ancient,
        aliases: ['Inpu', 'Anpu'],
        isFavorite: true,
        createdAt: now,
        updatedAt: now,
      ),

      // ── ABRAHAMIC ────────────────────────────────────────────────────────────
      Deity(
        id: _uuid.v4(),
        name: 'Allah',
        origin: 'Islam',
        domain: 'The One God — Creator of All Things',
        description:
            'Allah is the Arabic word for God in Abrahamic religions. In Islam, Allah is the all-powerful, all-knowing, merciful Creator and Sustainer of the universe. Islam is strictly monotheistic: Allah has no partners, equals, or offspring. The 99 Beautiful Names of Allah describe His attributes, including Al-Rahman (the Most Merciful) and Al-Rahim (the Most Compassionate).',
        symbol: '☪️',
        category: DeityCategory.abrahamic,
        aliases: ['God (Arabic)', 'Al-Ilah'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),
      Deity(
        id: _uuid.v4(),
        name: 'Yahweh',
        origin: 'Judaism / Christianity',
        domain: 'The God of Israel — Creator, Lawgiver',
        description:
            'Yahweh is the national god of ancient Israel and Judah. The name comes from the Hebrew scriptures and is considered the personal name of God in the Old Testament. In Judaism and Christianity He is the sole creator of the universe, covenant-maker, and lawgiver.',
        symbol: '✡️',
        category: DeityCategory.abrahamic,
        aliases: ['YHWH', 'Jehovah', 'The LORD', 'Adonai'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),

      // ── NORSE ────────────────────────────────────────────────────────────────
      Deity(
        id: _uuid.v4(),
        name: 'Odin',
        origin: 'Norse Mythology',
        domain: 'Allfather — Wisdom, War, Death & Poetry',
        description:
            'Odin is the chief of the Aesir gods in Norse mythology. He sacrificed his eye at Mimir\'s well to gain cosmic wisdom, and hung himself on Yggdrasil for nine days to discover the runes. He is associated with wisdom, death, royalty, healing, sorcery, and poetry.',
        symbol: '🐦',
        category: DeityCategory.norse,
        aliases: ['Allfather', 'Woden', 'Wotan'],
        isFavorite: true,
        createdAt: now,
        updatedAt: now,
      ),
      Deity(
        id: _uuid.v4(),
        name: 'Thor',
        origin: 'Norse Mythology',
        domain: 'God of Thunder, Strength & Storms',
        description:
            'Thor is the hammer-wielding god of thunder, strength, and storms. Son of Odin and earth goddess Jörð, he wields Mjölnir and is the protector of mankind. He is associated with oak trees, strength, storms, and consecration.',
        symbol: '🔨',
        category: DeityCategory.norse,
        aliases: ['Donar', 'Þórr'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),
      Deity(
        id: _uuid.v4(),
        name: 'Loki',
        origin: 'Norse Mythology',
        domain: 'God of Mischief, Trickery & Shape-shifting',
        description:
            'Loki is a trickster god in Norse mythology. A shape-shifter and schemer, he is sometimes helpful to the gods but often causes great trouble. His children include the world serpent Jörmungandr, the wolf Fenrir, and Hel.',
        symbol: '🐍',
        category: DeityCategory.norse,
        aliases: ['Loptr', 'Hveðrungr'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),

      // ── EASTERN ─────────────────────────────────────────────────────────────
      Deity(
        id: _uuid.v4(),
        name: 'Shiva',
        origin: 'Hinduism',
        domain: 'The Destroyer — Cosmic Consciousness & Transformation',
        description:
            'Shiva is one of the principal deities of Hinduism. He is the destroyer within the Trimurti and is also known as Mahadeva. Shiva is associated with contradiction — he is the destroyer and the restorer, the great ascetic and the symbol of sensuality.',
        symbol: '🔱',
        category: DeityCategory.eastern,
        aliases: ['Mahadeva', 'Rudra', 'Shankar'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),
      Deity(
        id: _uuid.v4(),
        name: 'Kali',
        origin: 'Hinduism',
        domain: 'Goddess of Time, Death & Destruction',
        description:
            'Kali is the Hindu goddess of time, death, and liberation. She is the most powerful form of Shakti and the goddess of empowerment. Depicted with dark skin, four arms, and a garland of skulls, she represents the destruction of evil and the liberation of the divine.',
        symbol: '🌑',
        category: DeityCategory.eastern,
        aliases: ['Mahakali', 'Bhadrakali'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),
      Deity(
        id: _uuid.v4(),
        name: 'Amaterasu',
        origin: 'Shinto (Japan)',
        domain: 'Goddess of the Sun & Universe',
        description:
            'Amaterasu is the goddess of the sun and the universe in the Shinto religion of Japan. She is the ruler of the heavens and one of the most important deities in Japanese mythology. The Japanese Imperial Family claims descent from her.',
        symbol: '🌅',
        category: DeityCategory.eastern,
        aliases: ['Amaterasu-Ōmikami', 'Ōhirume-no-Muchi'],
        isFavorite: true,
        createdAt: now,
        updatedAt: now,
      ),

      // ── MESOAMERICAN ─────────────────────────────────────────────────────────
      Deity(
        id: _uuid.v4(),
        name: 'Quetzalcóatl',
        origin: 'Aztec / Mesoamerican',
        domain: 'Feathered Serpent — Wind, Air & Learning',
        description:
            'Quetzalcóatl is a deity in Aztec culture, often depicted as a feathered serpent. He is the creator deity, god of wind and air, and the patron of arts, crafts, and knowledge. He represents the duality of earth (serpent) and sky (quetzal bird).',
        symbol: '🐉',
        category: DeityCategory.mesoamerican,
        aliases: ['Kukulkan (Maya)', 'Feathered Serpent'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),

      // ── CELTIC ───────────────────────────────────────────────────────────────
      Deity(
        id: _uuid.v4(),
        name: 'The Dagda',
        origin: 'Celtic (Irish)',
        domain: 'Father God — Earth, Agriculture & Wisdom',
        description:
            'The Dagda is one of the most prominent gods in Irish mythology, a member of the Tuatha Dé Danann. He is a skilled warrior and craftsman, owner of a magic cauldron of abundance and a great club. He represents strength, wisdom, and the earth.',
        symbol: '🪄',
        category: DeityCategory.celtic,
        aliases: ['Eochaid Ollathair', 'Ruad Rofhessa'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),
      Deity(
        id: _uuid.v4(),
        name: 'Morrigan',
        origin: 'Celtic (Irish)',
        domain: 'Goddess of Fate, War & Death',
        description:
            'The Morrigan is a figure from Irish mythology associated with fate and war. She is a trio of goddesses who appear as a crow and can prophesy doom or victory in battle. She is both a goddess of strife and a symbol of sovereignty and sovereignty.',
        symbol: '🐦‍⬛',
        category: DeityCategory.celtic,
        aliases: ['The Phantom Queen', 'Badb', 'Macha', 'Nemain'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),

      // ── AFRICAN ──────────────────────────────────────────────────────────────
      Deity(
        id: _uuid.v4(),
        name: 'Oshun',
        origin: 'Yoruba (West Africa)',
        domain: 'Orisha of Love, Fertility & Sweet Water',
        description:
            'Oshun is the Yoruba orisha (divine spirit) of fresh water, love, fertility, and beauty. She is worshipped across West Africa and the African diaspora, including in Candomblé, Santería, and similar traditions. She is associated with rivers and sweet things.',
        symbol: '💛',
        category: DeityCategory.african,
        aliases: ['Ochun', 'Oxum'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),

      // ── MODERN ───────────────────────────────────────────────────────────────
      Deity(
        id: _uuid.v4(),
        name: 'Gaia',
        origin: 'Modern Spirituality / Neo-Paganism',
        domain: 'Earth Mother — Life, Nature & Ecology',
        description:
            'In modern spirituality and neo-paganism, Gaia is revered as the living Earth goddess, personification of nature and the biosphere. Drawing from the ancient Greek Gaia, this modern interpretation sees the Earth itself as a sacred, living entity deserving reverence.',
        symbol: '🌍',
        category: DeityCategory.modern,
        aliases: ['Mother Earth', 'Terra (Roman)'],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      ),
    ];

    _deities = seeds;
  }
}
