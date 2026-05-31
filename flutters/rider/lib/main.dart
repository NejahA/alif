import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rider',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: const StreamApp(),
    );
  }
}

class StreamApp extends StatefulWidget {
  const StreamApp({super.key});

  @override
  State<StreamApp> createState() => _StreamAppState();
}

class _StreamAppState extends State<StreamApp> {
  final List<Map<String, dynamic>> streams = [
    {
      'id': 1,
      'title': 'Morning Coffee Chat',
      'streamer': 'CoffeeLover',
      'viewers': 1250,
      'category': 'IRL',
      'thumbnail': Colors.orange,
      'isLive': true,
    },
    {
      'id': 2,
      'title': 'Gaming Marathon',
      'streamer': 'ProGamer',
      'viewers': 8900,
      'category': 'Just Chatting',
      'thumbnail': Colors.red,
      'isLive': true,
    },
    {
      'id': 3,
      'title': 'Music Session',
      'streamer': 'Musician123',
      'viewers': 3400,
      'category': 'Music',
      'thumbnail': Colors.purple,
      'isLive': true,
    },
    {
      'id': 4,
      'title': 'Tech Talk',
      'streamer': 'TechGuru',
      'viewers': 5600,
      'category': 'Science & Technology',
      'thumbnail': Colors.blue,
      'isLive': true,
    },
    {
      'id': 5,
      'title': 'Art Stream',
      'streamer': 'ArtistLife',
      'viewers': 2100,
      'category': 'Art',
      'thumbnail': Colors.pink,
      'isLive': true,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rider'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(10.0),
        itemCount: streams.length,
        itemBuilder: (context, index) {
          final stream = streams[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: ListTile(
              leading: Container(
                width: 100,
                height: 60,
                color: stream['thumbnail'],
                child: Center(
                  child: stream['isLive']
                      ? Row(
                          children: [
                            Container(
                              width: 10,
                              height: 10,
                              decoration: BoxDecoration(
                                color: Colors.red,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 5),
                            const Text(
                              'LIVE',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        )
                      : null,
                ),
              ),
              title: Text(stream['title']),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('@${stream['streamer']}'),
                  Text('${stream['category']} • ${stream['viewers'].toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')} viewers'),
                ],
              ),
              trailing: IconButton(
                icon: const Icon(Icons.play_arrow),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Starting stream: ${stream['title']}')),
                  );
                },
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // Start streaming
        },
        icon: const Icon(Icons.video_camera_back),
        label: const Text('Go Live'),
        backgroundColor: Colors.blue,
      ),
    );
  }
}
