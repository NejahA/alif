import 'dart:io';
import 'package:flutter/material.dart';
import 'package:media_kit/media_kit.dart';
import 'package:media_kit_video/media_kit_video.dart' as mk;
import 'package:youtube_explode_dart/youtube_explode_dart.dart' as yt;
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../services/youtube_service.dart';
import '../services/download_service.dart';

class PlayerScreen extends StatefulWidget {
  final yt.Video? video;
  final String? localFilePath;
  const PlayerScreen({super.key, this.video, this.localFilePath});

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  late final Player _player = Player();
  late final mk.VideoController _videoController = mk.VideoController(_player);
  bool _isLoading = true;
  yt.StreamManifest? _manifest;
  double _downloadProgress = -1;

  bool get _isLocalFile => widget.localFilePath != null;

  @override
  void initState() {
    super.initState();
    _initPlayer();
  }

  Future<void> _initPlayer() async {
    if (_isLocalFile) {
      _player.open(Media(widget.localFilePath!));
      setState(() => _isLoading = false);
    } else {
      final ytService = context.read<YoutubeService>();
      _manifest = await ytService.getStreams(widget.video!.id.value);

      if (_manifest != null) {
        final muxedStream = _manifest!.muxed.withHighestBitrate();
        _player.open(Media(muxedStream.url.toString()));
      }

      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  void _onDownload() async {
    if (_manifest == null) return;

    final bestStream = _manifest!.muxed.withHighestBitrate();
    final downloadService = context.read<DownloadService>();
    final messenger = ScaffoldMessenger.of(context);

    messenger.showSnackBar(
      const SnackBar(content: Text('Starting download...')),
    );

    setState(() => _downloadProgress = 0);

    await downloadService.downloadStream(
      bestStream,
      widget.video!.title,
      'mp4',
      (progress) {
        if (mounted) {
          setState(() => _downloadProgress = progress);
        }
      },
    );

    setState(() => _downloadProgress = -1);

    messenger.showSnackBar(
      const SnackBar(
        content: Text('Download complete!'),
        backgroundColor: Color(0xff00ff8e),
      ),
    );
  }

  String get _title =>
      _isLocalFile
          ? File(widget.localFilePath!).uri.pathSegments.last.replaceAll('.mp4', '')
          : widget.video!.title;

  String get _subtitle =>
      _isLocalFile ? 'Local file' : widget.video!.author;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          _title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xff0a0e14), Color(0xff161b22)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: _isLoading
              ? const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(color: Color(0xff00d4ff)),
                      SizedBox(height: 16),
                      Text('Loading stream...', style: TextStyle(color: Colors.white54)),
                    ],
                  ),
                )
              : Column(
                  children: [
                    // Video Player
                    AspectRatio(
                      aspectRatio: 16 / 9,
                      child: ClipRRect(
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(20),
                          bottomRight: Radius.circular(20),
                        ),
                        child: mk.Video(controller: _videoController),
                      ),
                    ),

                    // Info + Actions
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _title,
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ).animate().fadeIn(duration: 400.ms),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.person, size: 16, color: Color(0xff00d4ff)),
                                const SizedBox(width: 6),
                                Text(
                                  _subtitle,
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.6),
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),

                            // Download progress bar
                            if (_downloadProgress >= 0) ...[
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: LinearProgressIndicator(
                                  value: _downloadProgress,
                                  minHeight: 6,
                                  backgroundColor: Colors.white.withValues(alpha: 0.1),
                                  valueColor: const AlwaysStoppedAnimation(Color(0xff00ff8e)),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '${(_downloadProgress * 100).toStringAsFixed(0)}%',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.5),
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],

                            // Download button (only for online videos)
                            if (!_isLocalFile)
                              Container(
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(14),
                                  gradient: const LinearGradient(
                                    colors: [Color(0xff00d4ff), Color(0xff00ff8e)],
                                  ),
                                ),
                                child: ElevatedButton.icon(
                                  onPressed: _downloadProgress >= 0 ? null : _onDownload,
                                  icon: const Icon(Icons.download_rounded, color: Colors.black),
                                  label: Text(
                                    _downloadProgress >= 0 ? 'Downloading...' : 'Download Video',
                                    style: const TextStyle(
                                      color: Colors.black,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    minimumSize: const Size.fromHeight(54),
                                    backgroundColor: Colors.transparent,
                                    shadowColor: Colors.transparent,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                  ),
                                ),
                              ).animate().fadeIn(delay: 200.ms, duration: 400.ms),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
