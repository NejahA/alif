import 'dart:typed_data';

class SavedMedia {
  final String name;
  final String path;
  final bool isVideo;
  final int sizeBytes;

  const SavedMedia({required this.name, required this.path, required this.isVideo, this.sizeBytes = 0});
}

Future<List<SavedMedia>> listSavedMedia() async => const [];

Future<bool> deleteSavedMedia(SavedMedia media) async => false;

Future<Uint8List?> readSavedMedia(SavedMedia media) async => null;
