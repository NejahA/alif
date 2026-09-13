import 'dart:io';
import 'dart:typed_data';
import 'package:path_provider/path_provider.dart';
import 'media_storage_stub.dart';

export 'media_storage_stub.dart' show SavedMedia;

Future<List<SavedMedia>> listSavedMedia() async {
  final directory = await getApplicationDocumentsDirectory();
  final files = await directory
      .list()
      .where((entity) => entity is File && entity.path.contains('elcocco_'))
      .map((entity) {
        final path = entity.path;
        return SavedMedia(
          name: path.split(Platform.pathSeparator).last,
          path: path,
          isVideo: path.toLowerCase().endsWith('.mp4'),
          sizeBytes: (entity as File).lengthSync(),
        );
      })
      .toList();
  files.sort((left, right) => right.name.compareTo(left.name));
  return files;
}

Future<bool> deleteSavedMedia(SavedMedia media) async {
  try {
    final file = File(media.path);
    if (!await file.exists()) return false;
    await file.delete();
    return true;
  } on FileSystemException {
    return false;
  }
}

Future<Uint8List?> readSavedMedia(SavedMedia media) async {
  try {
    if (media.isVideo) return null;
    return await File(media.path).readAsBytes();
  } on FileSystemException {
    return null;
  }
}
