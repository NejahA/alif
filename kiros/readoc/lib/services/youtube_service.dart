import 'package:youtube_explode_dart/youtube_explode_dart.dart';

class YoutubeService {
  final _yt = YoutubeExplode();

  /// Search for videos by query.
  Future<List<Video>> searchVideos(String query) async {
    final results = await _yt.search.search(query);
    return results.toList();
  }

  /// Get video metadata.
  Future<Video> getVideoMetadata(String videoId) async {
    return await _yt.videos.get(videoId);
  }

  /// Get available streams for a video.
  Future<StreamManifest> getStreams(String videoId) async {
    return await _yt.videos.streams.getManifest(videoId);
  }

  /// Dispose the YouTube Explode client.
  void dispose() {
    _yt.close();
  }
}
