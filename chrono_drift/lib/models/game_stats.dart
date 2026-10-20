class GameStats {
  int score = 0;
  int enemiesKilled = 0;
  int coresCollected = 0;
  int currentWave = 1;
  int rewindsExecuted = 0;
  double timeSurvived = 0.0;
  int level = 1;
  int currentExp = 0;
  int expToNextLevel = 100;

  void reset() {
    score = 0;
    enemiesKilled = 0;
    coresCollected = 0;
    currentWave = 1;
    rewindsExecuted = 0;
    timeSurvived = 0.0;
    level = 1;
    currentExp = 0;
    expToNextLevel = 100;
  }

  bool addExp(int amount) {
    currentExp += amount;
    if (currentExp >= expToNextLevel) {
      currentExp -= expToNextLevel;
      level++;
      expToNextLevel = (expToNextLevel * 1.35).round();
      return true; // Leveled up!
    }
    return false;
  }
}
