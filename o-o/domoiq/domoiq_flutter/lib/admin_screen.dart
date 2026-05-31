import 'package:flutter/material.dart';
import 'api_service.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  String _activeTab = 'news';
  List<dynamic> _data = [];
  bool _isLoading = false;

  final Map<String, List<Map<String, dynamic>>> _fields = {
    'news': [
      {'key': 'timeline', 'label': 'Timeline', 'type': 'select', 'options': ['PRIME', 'VOID', 'NEON']},
      {'key': 'headline', 'label': 'Headline', 'type': 'text'},
    ],
    'weather': [
      {'key': 'type', 'label': 'Type', 'type': 'text'},
      {'key': 'icon', 'label': 'Icon', 'type': 'select', 'options': ['Sun', 'CloudLightning', 'Wind']},
      {'key': 'entropyBoost', 'label': 'Entropy Boost', 'type': 'number'},
      {'key': 'msg', 'label': 'Message', 'type': 'text'},
      {'key': 'active', 'label': 'Active', 'type': 'bool'},
    ],
    'insights': [
      {'key': 'text', 'label': 'Insight Text', 'type': 'text', 'multiline': true},
      {'key': 'category', 'label': 'Category', 'type': 'select', 'options': ['Technological', 'Biological', 'Digital', 'Interstellar', 'Ecological', 'General']},
      {'key': 'timeline', 'label': 'Timeline', 'type': 'select', 'options': ['PRIME', 'VOID', 'NEON']},
      {'key': 'upvotes', 'label': 'Upvotes', 'type': 'number'},
      {'key': 'stakes', 'label': 'Stakes', 'type': 'number'},
    ],
    'broadcasts': [
      {'key': 'sender', 'label': 'Sender', 'type': 'text'},
      {'key': 'message', 'label': 'Message', 'type': 'text', 'multiline': true},
    ],
    'seers': [
      {'key': 'name', 'label': 'Name', 'type': 'text'},
      {'key': 'credits', 'label': 'Credits', 'type': 'number'},
      {'key': 'rank', 'label': 'Rank', 'type': 'text'},
      {'key': 'faction', 'label': 'Faction', 'type': 'select', 'options': ['Aether', 'Void', 'Neon', 'None']},
    ],
    'events': [
      {'key': 'title', 'label': 'Title', 'type': 'text'},
      {'key': 'description', 'label': 'Description', 'type': 'text', 'multiline': true},
      {'key': 'type', 'label': 'Type', 'type': 'select', 'options': ['Info', 'Warning', 'Critical', 'Discovery']},
      {'key': 'timeline', 'label': 'Timeline', 'type': 'select', 'options': ['PRIME', 'VOID', 'NEON']},
    ],
    'artifacts': [
      {'key': 'name', 'label': 'Name', 'type': 'text'},
      {'key': 'description', 'label': 'Description', 'type': 'text'},
      {'key': 'price', 'label': 'Price', 'type': 'number'},
      {'key': 'rarity', 'label': 'Rarity', 'type': 'select', 'options': ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythic']},
      {'key': 'icon', 'label': 'Icon', 'type': 'select', 'options': ['Sparkles', 'Key', 'Shield', 'Infinity']},
    ],
    'missions': [
      {'key': 'title', 'label': 'Title', 'type': 'text'},
      {'key': 'description', 'label': 'Description', 'type': 'text'},
      {'key': 'reward', 'label': 'Reward', 'type': 'number'},
      {'key': 'targetType', 'label': 'Target Type', 'type': 'select', 'options': ['anomaly', 'upvote', 'stake']},
      {'key': 'targetCount', 'label': 'Target Count', 'type': 'number'},
    ],
    'predictions': [
      {'key': 'keyword', 'label': 'Keyword', 'type': 'text'},
      {'key': 'response', 'label': 'Response', 'type': 'text', 'multiline': true},
    ],
  };

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.fetchAdminData(_activeTab);
      setState(() => _data = res);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _saveItem(Map<String, dynamic> item) async {
    try {
      await ApiService.saveAdminItem(_activeTab, item);
      _fetchData();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Saved successfully')));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  Future<void> _deleteItem(String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Delete'),
        content: const Text('Are you sure you want to delete this entry?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('CANCEL')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('DELETE', style: TextStyle(color: Colors.red))),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ApiService.deleteAdminItem(_activeTab, id);
        _fetchData();
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Deleted successfully')));
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  void _showEditor([Map<String, dynamic>? item]) {
    final isNew = item == null;
    final data = Map<String, dynamic>.from(item ?? {});
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF090A10),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 20, right: 20, top: 20
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  isNew ? 'NEW ${_activeTab.toUpperCase()}' : 'EDIT ${_activeTab.toUpperCase()}',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF00F2FF)),
                ),
                const SizedBox(height: 20),
                ..._fields[_activeTab]!.map((f) {
                  if (f['type'] == 'select') {
                    return DropdownButtonFormField<String>(
                      dropdownColor: const Color(0xFF090A10),
                      value: data[f['key']],
                      decoration: InputDecoration(labelText: f['label']),
                      items: (f['options'] as List<String>).map((o) => DropdownMenuItem(value: o, child: Text(o))).toList(),
                      onChanged: (val) => setModalState(() => data[f['key']] = val),
                    );
                  } else if (f['type'] == 'bool') {
                    return SwitchListTile(
                      title: Text(f['label']),
                      value: data[f['key']] ?? false,
                      onChanged: (val) => setModalState(() => data[f['key']] = val),
                    );
                  } else {
                    return TextFormField(
                      initialValue: data[f['key']]?.toString(),
                      decoration: InputDecoration(labelText: f['label']),
                      maxLines: f['multiline'] == true ? 3 : 1,
                      keyboardType: f['type'] == 'number' ? TextInputType.number : TextInputType.text,
                      onChanged: (val) => data[f['key']] = f['type'] == 'number' ? double.tryParse(val) : val,
                    );
                  }
                }),
                const SizedBox(height: 30),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _saveItem(data);
                  },
                  style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
                  child: const Text('SAVE CHANGES'),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('CENTRAL COMMAND'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _fetchData),
          if (_activeTab != 'insights' && _activeTab != 'broadcasts' && _activeTab != 'seers')
            IconButton(icon: const Icon(Icons.add), onPressed: () => _showEditor()),
        ],
      ),
      body: Column(
        children: [
          Container(
            height: 60,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 10),
              children: _fields.keys.map((tab) => Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4.0),
                child: ChoiceChip(
                  label: Text(tab.toUpperCase()),
                  selected: _activeTab == tab,
                  onSelected: (val) {
                    if (val) {
                      setState(() => _activeTab = tab);
                      _fetchData();
                    }
                  },
                ),
              )).toList(),
            ),
          ),
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator())
              : _data.isEmpty 
                ? const Center(child: Text('No data found in this sector.'))
                : ListView.builder(
                    itemCount: _data.length,
                    itemBuilder: (context, index) {
                      final item = _data[index];
                      String title = item['headline'] ?? item['name'] ?? item['title'] ?? item['keyword'] ?? item['type'] ?? item['sender'] ?? 'Unit';
                      String subtitle = item['text'] ?? item['description'] ?? item['message'] ?? item['response'] ?? item['rank'] ?? '';
                      
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        color: const Color(0xFF1A1B25),
                        child: ListTile(
                          title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                          subtitle: Text(subtitle, maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.white.withOpacity(0.6))),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(icon: const Icon(Icons.edit, size: 20), onPressed: () => _showEditor(item)),
                              IconButton(icon: const Icon(Icons.delete, color: Colors.red, size: 20), onPressed: () => _deleteItem(item['_id'])),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
