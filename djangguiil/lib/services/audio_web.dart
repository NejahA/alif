import 'dart:js_interop';

@JS('window.JungleAudio.setChannel')
external void _setChannel(JSString channel, JSNumber volume);

@JS('window.JungleAudio.playBowlChime')
external void _playBowlChime();

@JS('window.JungleAudio.playBirdChirp')
external void _playBirdChirp();

@JS('window.JungleAudio.stopAll')
external void _stopAll();

void platformSetChannel(String channel, double volume) {
  try {
    _setChannel(channel.toJS, volume.toJS);
  } catch (_) {}
}

void platformPlayBowlChime() {
  try {
    _playBowlChime();
  } catch (_) {}
}

void platformPlayBirdChirp() {
  try {
    _playBirdChirp();
  } catch (_) {}
}

void platformStopAll() {
  try {
    _stopAll();
  } catch (_) {}
}
