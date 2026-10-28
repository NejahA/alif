import 'audio_stub.dart'
    if (dart.library.js_interop) 'audio_web.dart';

class AudioBridge {
  static void setChannel(String channel, double volume) {
    platformSetChannel(channel, volume);
  }

  static void playBowlChime() {
    platformPlayBowlChime();
  }

  static void playBirdChirp() {
    platformPlayBirdChirp();
  }

  static void stopAll() {
    platformStopAll();
  }
}
