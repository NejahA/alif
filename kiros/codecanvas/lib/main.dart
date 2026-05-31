import 'package:flutter/material.dart';
  
void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CodeCanvas',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const CodeCanvas(),
    );
  }
}

class CodeCanvas extends StatefulWidget {
  const CodeCanvas({super.key});

  @override
  State<CodeCanvas> createState() => _CodeCanvasState();
}

class _CodeCanvasState extends State<CodeCanvas> {
  final List<Map<String, dynamic>> projects = [
    {
      'name': 'Rider',
      'description': 'Live streaming app with Twitch API integration',
      'tech': ['Flutter', 'Twitch API', 'Python', 'Tkinter'],
      'color': Colors.purple,
      'icon': Icons.live_tv,
      'path': 'rider/build/app/outputs/flutter-apk/app-release.apk',
      'type': 'mobile',
      'status': 'completed',
    },
    {
      'name': 'Remade',
      'description': 'Mead recycling tracker with analytics',
      'tech': ['Flutter', 'Dart', 'Android', 'iOS'],
      'color': Colors.amber,
      'icon': Icons.recycling,
      'path': 'meads_recycler/build/app/outputs/flutter-apk/app-release.apk',
      'type': 'mobile',
      'status': 'completed',
    },
    {
      'name': 'Exode',
      'description': 'Garbage disposal management system',
      'tech': ['Flutter', 'Dart', 'Material Design'],
      'color': Colors.green,
      'icon': Icons.delete,
      'path': 'exode/build/app/outputs/flutter-apk/app-release.apk',
      'type': 'mobile',
      'status': 'completed',
    },
    {
      'name': 'Dright',
      'description': 'Phone calling app with dialer interface',
      'tech': ['Flutter', 'Phone API', 'Material Design'],
      'color': Colors.blue,
      'icon': Icons.phone,
      'path': 'dright/build/app/outputs/flutter-apk/app-release.apk',
      'type': 'mobile',
      'status': 'completed',
    },
    {
      'name': 'Mickii',
      'description': 'Windows mouse simulation app',
      'tech': ['Flutter', 'Windows', 'C++'],
      'color': Colors.blue,
      'icon': Icons.mouse,
      'path': 'mickii/build/app/outputs/flutter-apk/app-release.apk',
      'type': 'desktop',
      'status': 'completed',
    },
    {
      'name': 'Vertex',
      'description': 'Secure file sharing platform',
      'tech': ['React', 'Node.js', 'Express', 'AES-256'],
      'color': Colors.indigo,
      'icon': Icons.security,
      'path': 'original/vertex',
      'type': 'web',
      'status': 'completed',
    },
    {
      'name': 'TaskFlow',
      'description': 'Task management app with local storage',
      'tech': ['Flutter', 'Hive', 'Dart', 'Material Design'],
      'color': Colors.teal,
      'icon': Icons.task_alt,
      'path': 'taskflow/build/app/outputs/flutter-apk/app-release.apk',
      'type': 'mobile',
      'status': 'in-progress',
    },
  ];

  String _selectedType = 'all';
  String _selectedStatus = 'all';
  final TextEditingController _searchController = TextEditingController();

  void _openProject(Map<String, dynamic> project) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(project['name']),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(project['description']),
            const SizedBox(height: 10),
            const Text('Technologies:', style: TextStyle(fontWeight: FontWeight.bold)),
            Wrap(
              spacing: 8,
              runSpacing: 4,
              children: (project['tech'] as List<String>)
                  .map((tech) => Chip(
                        label: Text(tech),
                        backgroundColor: project['color'].withOpacity(0.1),
                      ))
                  .toList(),
            ),
            const SizedBox(height: 20),
            const Text('Actions:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _launchProject(project);
            },
            child: const Text('Open Project'),
          ),
        ],
      ),
    );
  }

  void _launchProject(Map<String, dynamic> project) {
    // In a real app, this would launch the APK or open the project folder
    // For now, show a snackbar with the project path
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Opening ${project['name']} from ${project['path']}'),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredProjects = projects.where((project) {
      if (_selectedType != 'all' && project['type'] != _selectedType) return false;
      if (_selectedStatus != 'all' && project['status'] != _selectedStatus) return false;
      if (_searchController.text.isNotEmpty) {
        final query = _searchController.text.toLowerCase();
        return project['name'].toLowerCase().contains(query) ||
               project['description'].toLowerCase().contains(query) ||
               (project['tech'] as List<String>).any((tech) => tech.toLowerCase().contains(query));
      }
      return true;
    }).toList();

    final stats = {
      'total': projects.length,
      'mobile': projects.where((p) => p['type'] == 'mobile').length,
      'web': projects.where((p) => p['type'] == 'web').length,
      'desktop': projects.where((p) => p['type'] == 'desktop').length,
      'completed': projects.where((p) => p['status'] == 'completed').length,
      'in-progress': projects.where((p) => p['status'] == 'in-progress').length,
    };

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Colors.deepPurple.shade900, Colors.black],
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              const Text(
                'CodeCanvas',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'A collection of innovative projects showcasing full-stack development skills',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white70,
                ),
              ),
              const SizedBox(height: 20),
              // Stats Row
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildStatCard('Total Projects', stats['total'].toString(), Icons.apps),
                    const SizedBox(width: 10),
                    _buildStatCard('Mobile Apps', stats['mobile'].toString(), Icons.phone_android),
                    const SizedBox(width: 10),
                    _buildStatCard('Web Apps', stats['web'].toString(), Icons.web),
                    const SizedBox(width: 10),
                    _buildStatCard('Desktop Apps', stats['desktop'].toString(), Icons.computer),
                    const SizedBox(width: 10),
                    _buildStatCard('Completed', stats['completed'].toString(), Icons.check_circle),
                    const SizedBox(width: 10),
                    _buildStatCard('In Progress', stats['in-progress'].toString(), Icons.build),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              // Search and Filters
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Search projects...',
                        prefixIcon: const Icon(Icons.search, color: Colors.white70),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.1),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      style: const TextStyle(color: Colors.white),
                      onChanged: (value) => setState(() {}),
                    ),
                  ),
                  const SizedBox(width: 10),
                  PopupMenuButton(
                    icon: const Icon(Icons.filter_list, color: Colors.white),
                    itemBuilder: (context) => [
                      const PopupMenuItem(
                        value: 'filter',
                        child: Text('Filter Options'),
                      ),
                    ],
                    onSelected: (value) => _showFilterDialog(),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Active Filters
              if (_selectedType != 'all' || _selectedStatus != 'all')
                Row(
                  children: [
                    if (_selectedType != 'all')
                      Chip(
                        label: Text('Type: ${_selectedType}'),
                        onDeleted: () => setState(() => _selectedType = 'all'),
                      ),
                    if (_selectedStatus != 'all') ...[
                      const SizedBox(width: 8),
                      Chip(
                        label: Text('Status: ${_selectedStatus}'),
                        onDeleted: () => setState(() => _selectedStatus = 'all'),
                      ),
                    ],
                    const Spacer(),
                    TextButton(
                      onPressed: () => setState(() {
                        _selectedType = 'all';
                        _selectedStatus = 'all';
                        _searchController.clear();
                      }),
                      child: const Text('Clear All', style: TextStyle(color: Colors.white70)),
                    ),
                  ],
                ),
              const SizedBox(height: 20),
              // Projects Grid
              Expanded(
                child: filteredProjects.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.search_off,
                              size: 64,
                              color: Colors.white.withOpacity(0.3),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'No projects found',
                              style: TextStyle(
                                fontSize: 20,
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Try adjusting your filters or search query',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.white.withOpacity(0.6),
                              ),
                            ),
                          ],
                        ),
                      )
                    : GridView.builder(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 20,
                          mainAxisSpacing: 20,
                          childAspectRatio: 1.5,
                        ),
                        itemCount: filteredProjects.length,
                        itemBuilder: (context, index) {
                          final project = filteredProjects[index];
                          return _buildProjectCard(project);
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white70, size: 20),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.white70,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProjectCard(Map<String, dynamic> project) {
    return GestureDetector(
      onTap: () => _openProject(project),
      child: Card(
        color: project['color'].withOpacity(0.2),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    project['icon'],
                    color: project['color'],
                    size: 30,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      project['name'],
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (project['status'] == 'in-progress')
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'In Progress',
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.orange,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              Expanded(
                child: Text(
                  project['description'],
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                height: 40,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: (project['tech'] as List<String>).length,
                  itemBuilder: (context, techIndex) {
                    final tech = (project['tech'] as List<String>)[techIndex];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: Chip(
                        label: Text(
                          tech,
                          style: TextStyle(
                            fontSize: 12,
                            color: project['color'],
                          ),
                        ),
                        backgroundColor: project['color'].withOpacity(0.1),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            title: const Text('Filter Projects'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Project Type:', style: TextStyle(fontWeight: FontWeight.bold)),
                ...['all', 'mobile', 'web', 'desktop'].map((type) {
                  return RadioListTile<String>(
                    title: Text(type == 'all' ? 'All Types' : type),
                    value: type,
                    groupValue: _selectedType,
                    onChanged: (value) {
                      setState(() {
                        _selectedType = value!;
                      });
                    },
                  );
                }).toList(),
                const Divider(),
                const Text('Project Status:', style: TextStyle(fontWeight: FontWeight.bold)),
                ...['all', 'completed', 'in-progress'].map((status) {
                  return RadioListTile<String>(
                    title: Text(status == 'all' ? 'All Statuses' : status),
                    value: status,
                    groupValue: _selectedStatus,
                    onChanged: (value) {
                      setState(() {
                        _selectedStatus = value!;
                      });
                    },
                  );
                }).toList(),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  setState(() {});
                },
                child: const Text('Apply'),
              ),
            ],
          );
        },
      ),
    );
  }
}