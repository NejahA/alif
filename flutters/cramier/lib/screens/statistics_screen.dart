import 'package:flutter/material.dart';
import '../services/database_helper.dart';

class StatisticsScreen extends StatefulWidget {
  final String? deckId;

  const StatisticsScreen({super.key, this.deckId});

  @override
  State<StatisticsScreen> createState() => _StatisticsScreenState();
}

class _StatisticsScreenState extends State<StatisticsScreen> {
  final _dbHelper = DatabaseHelper();
  Map<String, dynamic>? _stats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _isLoading = true);
    final stats = await _dbHelper.getStatistics(deckId: widget.deckId);
    setState(() {
      _stats = stats;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.deckId != null ? 'Deck Statistics' : 'Statistics'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _stats == null
              ? const Center(child: Text('No data available'))
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final totalCards = _stats!['totalCards'] as int;
    final dueCards = _stats!['dueCards'] as int;
    final totalSessions = _stats!['totalSessions'] as int;
    final totalStudied = _stats!['totalStudied'] as int;
    final averageAccuracy = _stats!['averageAccuracy'] as double;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Overview cards
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Total Cards',
                totalCards.toString(),
                Icons.auto_stories,
                Colors.blue,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Due for Review',
                dueCards.toString(),
                Icons.schedule,
                Colors.orange,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Sessions',
                totalSessions.toString(),
                Icons.today,
                Colors.green,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Cards Studied',
                totalStudied.toString(),
                Icons.menu_book,
                Colors.purple,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Accuracy
        Card(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                const Text(
                  'Overall Accuracy',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: 200,
                  height: 200,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 200,
                        height: 200,
                        child: CircularProgressIndicator(
                          value: averageAccuracy / 100,
                          strokeWidth: 16,
                          backgroundColor: Colors.grey[200],
                          valueColor: AlwaysStoppedAnimation(
                            averageAccuracy >= 80
                                ? Colors.green
                                : averageAccuracy >= 60
                                    ? Colors.orange
                                    : Colors.red,
                          ),
                        ),
                      ),
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${averageAccuracy.toStringAsFixed(1)}%',
                            style: const TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'accuracy',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                if (totalStudied > 0) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildAccuracyDot(Colors.green, 'Correct'),
                      const SizedBox(width: 24),
                      _buildAccuracyDot(Colors.red, 'Incorrect'),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),

        // Recent sessions
        _buildRecentSessions(),
      ],
    );
  }

  Widget _buildStatCard(
      String label, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccuracyDot(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(label, style: TextStyle(color: Colors.grey[600])),
      ],
    );
  }

  Widget _buildRecentSessions() {
    return FutureBuilder(
      future: _dbHelper.getStudySessions(deckId: widget.deckId),
      builder: (context, snapshot) {
        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Card(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Center(
                child: Text(
                  'No study sessions yet.\nStart studying to see your progress!',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            ),
          );
        }

        final sessions = snapshot.data!;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Recent Sessions',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(height: 8),
            ...sessions.take(5).map((session) {
              final date =
                  '${session.startTime.day}/${session.startTime.month}/${session.startTime.year}';
              final accuracy = session.accuracy.toStringAsFixed(0);
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: session.accuracy >= 80
                        ? Colors.green[100]
                        : session.accuracy >= 60
                            ? Colors.orange[100]
                            : Colors.red[100],
                    child: Text(
                      '$accuracy%',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: session.accuracy >= 80
                            ? Colors.green[800]
                            : session.accuracy >= 60
                                ? Colors.orange[800]
                                : Colors.red[800],
                      ),
                    ),
                  ),
                  title: Text('$date - ${session.cardsStudied} cards'),
                  subtitle: Text(
                    '${session.cardsCorrect} correct / ${session.cardsIncorrect} incorrect',
                  ),
                  trailing: Text(
                    session.duration.inMinutes > 0
                        ? '${session.duration.inMinutes}m'
                        : '${session.duration.inSeconds}s',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ),
              );
            }),
          ],
        );
      },
    );
  }
}