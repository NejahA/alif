class PomodoroModel {
  String? boundSynapseId;
  String mode; // 'work' or 'break'
  int totalSeconds;
  int remainingSeconds;
  bool isRunning;
  int sessionsCompleted;

  PomodoroModel({
    this.boundSynapseId,
    this.mode = 'work',
    this.totalSeconds = 25 * 60,
    this.remainingSeconds = 25 * 60,
    this.isRunning = false,
    this.sessionsCompleted = 0,
  });

  String get formattedTime {
    final minutes = (remainingSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (remainingSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  double get progressRatio =>
      totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0.0;
}
