import 'dart:io';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:youtube_explode_dart/youtube_explode_dart.dart';
import 'package:path/path.dart' as p;

class DownloadService {
  final Dio _dio = Dio();

  /// Download a stream (video or audio) into a file.
  Future<String> downloadStream(
    StreamInfo streamInfo,
    String videoTitle,
    String extension,
    Function(double progress) onProgress,
  ) async {
    final directory = await getApplicationDocumentsDirectory();
    final downloadPath = p.join(directory.path, 'ReadocDownloads');
    final dir = Directory(downloadPath);
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }

    // Sanitize title for filename.
    final sanitizedTitle = videoTitle.replaceAll(RegExp(r'[\\/:*?"<>|]'), '_');
    final filePath = p.join(downloadPath, '$sanitizedTitle.$extension');

    await _dio.download(
      streamInfo.url.toString(),
      filePath,
      onReceiveProgress: (received, total) {
        if (total != -1) {
          onProgress(received / total);
        }
      },
    );

    return filePath;
  }
}
