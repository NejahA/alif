import 'package:camera/camera.dart';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:path_provider/path_provider.dart';
import '../bloc/camera/camera_bloc.dart';
import '../bloc/camera/camera_event.dart';
import '../bloc/camera/camera_state.dart';
import '../providers/privacy_shield_provider.dart';
import 'media_library_screen.dart';
import '../theme/illuminati_theme.dart';

class CameraFilterScreen extends StatefulWidget {
  const CameraFilterScreen({super.key});

  @override
  State<CameraFilterScreen> createState() => _CameraFilterScreenState();
}

class _CameraFilterScreenState extends State<CameraFilterScreen> {
  bool _mirrorPreview = false;
  late bool _cameraWasBlocked;

  @override
  void initState() {
    super.initState();
    _cameraWasBlocked = context.read<PrivacyShieldProvider>().cameraBlocked;
    if (!_cameraWasBlocked) {
      context.read<CameraBloc>().add(InitializeCameraEvent());
    }
  }

  @override
  Widget build(BuildContext context) {
    final cameraBlocked = context.watch<PrivacyShieldProvider>().cameraBlocked;
    if (cameraBlocked != _cameraWasBlocked) {
      _cameraWasBlocked = cameraBlocked;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        context.read<CameraBloc>().add(
              cameraBlocked ? LockCameraEvent() : InitializeCameraEvent(),
            );
      });
    }
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text('CAMERA FILTERS', style: GoogleFonts.cinzel(color: IlluminatiTheme.sacredGold)),
        actions: [
          IconButton(
            tooltip: 'Open media vault',
            icon: const Icon(Icons.video_library, color: IlluminatiTheme.sacredGold),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const MediaLibraryScreen()),
              );
            },
          ),
          IconButton(
            tooltip: 'Close camera',
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: BlocBuilder<CameraBloc, CameraState>(
              builder: (context, state) {
                if (cameraBlocked) {
                  return const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.no_photography, color: IlluminatiTheme.crimsonSeal, size: 54),
                        SizedBox(height: 14),
                        Text(
                          'CAMERA HARDWARE SEALED',
                          style: TextStyle(color: IlluminatiTheme.crimsonSeal, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Unlock the privacy shield to use the camera.',
                          style: TextStyle(color: Colors.white60),
                        ),
                      ],
                    ),
                  );
                }
                if (state is CameraLoadingState) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (state is CameraReadyState) {
                  return _FilteredPreview(
                    controller: state.controller,
                    mirrored: _mirrorPreview,
                    canSwitchCamera: state.cameras.length > 1,
                    audioEnabled: state.audioEnabled,
                  );
                }
                if (state is CameraErrorState) {
                  return Center(
                    child: Text(state.errorMessage, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70)),
                  );
                }
                return const Center(child: Text('Camera is ready to initialize.', style: TextStyle(color: Colors.white70)));
              },
            ),
          ),
          _FilterControls(
            mirrored: _mirrorPreview,
            onMirrorChanged: (mirrored) => setState(() => _mirrorPreview = mirrored),
          ),
        ],
      ),
    );
  }
}

class _FilteredPreview extends StatefulWidget {
  final CameraController controller;
  final bool mirrored;
  final bool canSwitchCamera;
  final bool audioEnabled;

  const _FilteredPreview({
    required this.controller,
    required this.mirrored,
    required this.canSwitchCamera,
    required this.audioEnabled,
  });

  @override
  State<_FilteredPreview> createState() => _FilteredPreviewState();
}

class _FilteredPreviewState extends State<_FilteredPreview> {
  bool _torchEnabled = false;
  bool _isCapturing = false;
  bool _gridEnabled = false;
  bool _focusLocked = false;
  bool _isRecording = false;
  Timer? _recordingTimer;
  Duration _recordingDuration = Duration.zero;
  String? _lastVideoPath;
  String? _lastSavedMediaPath;
  int _timerSeconds = 0;
  int _countdown = 0;
  int _aspectRatioIndex = 0;
  int _maxRecordingSeconds = 0;
  Uint8List? _lastPhotoBytes;
  final List<Uint8List> _photoHistory = [];
  Offset? _focusPoint;
  double _zoomLevel = 1.0;
  double _minZoom = 1.0;
  double _maxZoom = 1.0;
  double _exposureOffset = 0.0;
  double _minExposure = 0.0;
  double _maxExposure = 0.0;

  @override
  void initState() {
    super.initState();
    _loadZoomBounds();
  }

  @override
  void didUpdateWidget(covariant _FilteredPreview oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller) {
      _torchEnabled = false;
      _zoomLevel = 1.0;
      _exposureOffset = 0.0;
      _focusLocked = false;
      _recordingTimer?.cancel();
      _recordingDuration = Duration.zero;
      _loadZoomBounds();
    }
  }

  Future<void> _loadZoomBounds() async {
    try {
      final minZoom = await widget.controller.getMinZoomLevel();
      final maxZoom = await widget.controller.getMaxZoomLevel();
      final minExposure = await widget.controller.getMinExposureOffset();
      final maxExposure = await widget.controller.getMaxExposureOffset();
      if (!mounted) return;
      setState(() {
        _minZoom = minZoom;
        _maxZoom = maxZoom;
        _zoomLevel = minZoom;
        _minExposure = minExposure;
        _maxExposure = maxExposure;
        _exposureOffset = 0.0.clamp(minExposure, maxExposure);
      });
    } on CameraException {
      if (mounted) setState(() => _maxZoom = 1.0);
    }
  }

  Future<void> _setZoom(double value) async {
    try {
      await widget.controller.setZoomLevel(value);
      if (mounted) setState(() => _zoomLevel = value);
    } on CameraException {
      // Some camera implementations expose zoom bounds but reject changes.
    }
  }

  Future<void> _setExposure(double value) async {
    try {
      await widget.controller.setExposureOffset(value);
      if (mounted) setState(() => _exposureOffset = value);
    } on CameraException {
      // Some camera implementations do not support exposure adjustment.
    }
  }

  Future<void> _resetCameraControls() async {
    try {
      await widget.controller.setZoomLevel(_minZoom);
      await widget.controller.setExposureOffset(0.0);
      await widget.controller.setFlashMode(FlashMode.off);
      await widget.controller.setFocusMode(FocusMode.auto);
      if (!mounted) return;
      setState(() {
        _zoomLevel = _minZoom;
        _exposureOffset = 0.0.clamp(_minExposure, _maxExposure);
        _torchEnabled = false;
        _gridEnabled = false;
        _focusLocked = false;
      });
    } on CameraException {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Some camera controls could not be reset.')),
        );
      }
    }
  }

  Future<void> _toggleTorch() async {
    final nextValue = !_torchEnabled;
    try {
      await widget.controller.setFlashMode(nextValue ? FlashMode.torch : FlashMode.off);
      if (mounted) setState(() => _torchEnabled = nextValue);
    } on CameraException {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Torch control is unavailable on this camera.')),
      );
    }
  }

  Future<void> _focusAt(Offset point, Size size) async {
    if (_focusLocked) return;
    final normalizedPoint = Offset(
      (point.dx / size.width).clamp(0.0, 1.0),
      (point.dy / size.height).clamp(0.0, 1.0),
    );
    try {
      await widget.controller.setFocusPoint(normalizedPoint);
      if (!mounted) return;
      setState(() => _focusPoint = point);
      await Future<void>.delayed(const Duration(milliseconds: 900));
      if (mounted) setState(() => _focusPoint = null);
    } on CameraException {
      if (mounted) setState(() => _focusPoint = null);
    }
  }

  Future<void> _toggleFocusLock() async {
    final nextLocked = !_focusLocked;
    try {
      await widget.controller.setFocusMode(nextLocked ? FocusMode.locked : FocusMode.auto);
      if (mounted) setState(() => _focusLocked = nextLocked);
    } on CameraException {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Focus lock is unavailable on this camera.')),
        );
      }
    }
  }

  Future<void> _capturePhoto() async {
    if (_isCapturing || _isRecording || !widget.controller.value.isInitialized) return;
    setState(() => _isCapturing = true);
    try {
      for (var remaining = _timerSeconds; remaining > 0; remaining--) {
        if (!mounted) return;
        setState(() => _countdown = remaining);
        await Future<void>.delayed(const Duration(seconds: 1));
      }
      if (mounted) setState(() => _countdown = 0);
      final photo = await widget.controller.takePicture();
      final bytes = await photo.readAsBytes();
      if (!mounted) return;
      setState(() {
        _lastPhotoBytes = bytes;
        _photoHistory.insert(0, bytes);
        if (_photoHistory.length > 5) _photoHistory.removeLast();
      });
      await _saveCapturedMedia(photo, 'photo');
      await showDialog<void>(
        context: context,
        builder: (context) => _PhotoEditorDialog(bytes: bytes),
      );
    } on CameraException {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Photo capture is unavailable on this camera.')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isCapturing = false;
          _countdown = 0;
        });
      }
    }
  }

  Future<void> _toggleVideoRecording() async {
    if (!widget.controller.value.isInitialized || _isCapturing) return;
    try {
      if (_isRecording) {
        final video = await widget.controller.stopVideoRecording();
        await _saveCapturedMedia(video, 'video');
        _recordingTimer?.cancel();
        if (mounted) {
          setState(() {
            _isRecording = false;
            _recordingDuration = Duration.zero;
            _lastVideoPath = _lastSavedMediaPath ?? video.path;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('VIDEO CAPTURED. Use the video button to copy its path.')),
          );
        }
      } else {
        await widget.controller.startVideoRecording();
        if (mounted) {
          setState(() {
            _isRecording = true;
            _recordingDuration = Duration.zero;
          });
          _recordingTimer?.cancel();
          _recordingTimer = Timer.periodic(const Duration(seconds: 1), (_) {
            if (mounted) {
              setState(() => _recordingDuration += const Duration(seconds: 1));
              if (_maxRecordingSeconds > 0 && _recordingDuration.inSeconds >= _maxRecordingSeconds) {
                _toggleVideoRecording();
              }
            }
          });
        }
      }
    } on CameraException {
      _recordingTimer?.cancel();
      if (mounted) {
        setState(() {
          _isRecording = false;
          _recordingDuration = Duration.zero;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Video recording is unavailable on this camera.')),
        );
      }
    }
  }

  void _cycleTimer() {
    const options = [0, 3, 5, 10];
    final nextIndex = (options.indexOf(_timerSeconds) + 1) % options.length;
    setState(() => _timerSeconds = options[nextIndex]);
  }

  void _cycleAspectRatio() {
    setState(() => _aspectRatioIndex = (_aspectRatioIndex + 1) % 4);
  }

  void _cycleRecordingLimit() {
    const options = [0, 30, 60, 300];
    final nextIndex = (options.indexOf(_maxRecordingSeconds) + 1) % options.length;
    setState(() => _maxRecordingSeconds = options[nextIndex]);
  }

  String get _recordingLimitLabel => _maxRecordingSeconds == 0
      ? 'MAX'
      : _maxRecordingSeconds >= 60
          ? '${_maxRecordingSeconds ~/ 60}M'
          : '${_maxRecordingSeconds}S';

  double? get _selectedAspectRatio => switch (_aspectRatioIndex) {
        0 => null,
        1 => 1.0,
        2 => 4 / 3,
        _ => 16 / 9,
      };

  String get _aspectRatioLabel => const ['FIT', '1:1', '4:3', '16:9'][_aspectRatioIndex];

  String _formatRecordingDuration() {
    final minutes = _recordingDuration.inMinutes.toString().padLeft(2, '0');
    final seconds = (_recordingDuration.inSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  void dispose() {
    _recordingTimer?.cancel();
    super.dispose();
  }

  Future<void> _showLastPhoto() async {
    if (_photoHistory.isEmpty) return;
    await showDialog<void>(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: IlluminatiTheme.voidDark,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                height: 240,
                child: PageView.builder(
                  itemCount: _photoHistory.length,
                  itemBuilder: (context, index) => Image.memory(
                    _photoHistory[index],
                    fit: BoxFit.contain,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${_photoHistory.length} RECENT PHOTO${_photoHistory.length == 1 ? '' : 'S'}',
                style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _photoHistory.clear();
                        _lastPhotoBytes = null;
                      });
                      Navigator.pop(context);
                    },
                    child: const Text('CLEAR HISTORY'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('CLOSE'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _copyLastVideoPath() async {
    final path = _lastVideoPath;
    if (path == null) return;
    await Clipboard.setData(ClipboardData(text: path));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Video path copied to clipboard.')),
      );
    }
  }

  Future<void> _saveCapturedMedia(XFile media, String type) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final extension = type == 'photo' ? 'jpg' : 'mp4';
      final filename = 'elcocco_${type}_${DateTime.now().millisecondsSinceEpoch}.$extension';
      final destination = '${directory.path}/$filename';
      await media.saveTo(destination);
      if (mounted) {
        setState(() => _lastSavedMediaPath = destination);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${type.toUpperCase()} SAVED LOCALLY')),
        );
      }
    } on UnsupportedError {
      // Web keeps using the temporary XFile supplied by the camera plugin.
    } on MissingPluginException {
      // Some platforms do not expose an application documents directory.
    } on Object {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('The capture was created but could not be saved.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PrivacyShieldProvider>();
    Widget preview = CameraPreview(widget.controller);

    switch (provider.cameraFilter) {
      case CameraFilter.monochrome:
        preview = ColorFiltered(
          colorFilter: const ColorFilter.matrix(<double>[
            0.2126, 0.7152, 0.0722, 0, 0,
            0.2126, 0.7152, 0.0722, 0, 0,
            0.2126, 0.7152, 0.0722, 0, 0,
            0, 0, 0, 1, 0,
          ]),
          child: preview,
        );
      case CameraFilter.nightVision:
        preview = ColorFiltered(
          colorFilter: const ColorFilter.mode(Color(0xFF37FF88), BlendMode.modulate),
          child: preview,
        );
      case CameraFilter.thermal:
        preview = ColorFiltered(
          colorFilter: const ColorFilter.matrix(<double>[
            1.5, 0, 0, 0, 0,
            0, 0.35, 0, 0, 35,
            0, 0, 1.5, 0, 35,
            0, 0, 0, 1, 0,
          ]),
          child: preview,
        );
      case CameraFilter.fullScreen:
        preview = Stack(children: [preview, Positioned.fill(child: ColoredBox(color: provider.cameraFilterColor))]);
      case CameraFilter.none:
        break;
    }

    if (widget.mirrored) {
      preview = Transform(
        alignment: Alignment.center,
        transform: Matrix4.identity()..scaleByDouble(-1.0, 1.0, 1.0, 1.0),
        child: preview,
      );
    }

    return Stack(
      children: [
        Positioned.fill(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final previewSize = Size(constraints.maxWidth, constraints.maxHeight);
              return GestureDetector(
                onTapDown: (details) => _focusAt(details.localPosition, previewSize),
                child: Center(
                  child: AspectRatio(
                    aspectRatio: _selectedAspectRatio ?? widget.controller.value.aspectRatio,
                    child: preview,
                  ),
                ),
              );
            },
          ),
        ),
        if (_focusPoint != null)
          Positioned(
            left: _focusPoint!.dx - 28,
            top: _focusPoint!.dy - 28,
            child: IgnorePointer(
              child: Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  border: Border.all(color: IlluminatiTheme.sacredGold, width: 2),
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
        Positioned(
          top: 16,
          left: 16,
          child: Row(
            children: [
              if (widget.canSwitchCamera)
                IconButton.filled(
                  tooltip: 'Switch camera',
                  onPressed: () => context.read<CameraBloc>().add(SwitchCameraEvent()),
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.black54,
                    foregroundColor: Colors.white,
                  ),
                  icon: const Icon(Icons.flip_camera_android),
                ),
              const SizedBox(width: 8),
              IconButton.filled(
                tooltip: _torchEnabled ? 'Turn torch off' : 'Turn torch on',
                onPressed: _toggleTorch,
                style: IconButton.styleFrom(
                  backgroundColor: Colors.black54,
                  foregroundColor: _torchEnabled ? IlluminatiTheme.sacredGold : Colors.white,
                ),
                icon: Icon(_torchEnabled ? Icons.flash_on : Icons.flash_off),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                tooltip: _gridEnabled ? 'Hide framing grid' : 'Show framing grid',
                onPressed: () => setState(() => _gridEnabled = !_gridEnabled),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.black54,
                  foregroundColor: _gridEnabled ? IlluminatiTheme.sacredGold : Colors.white,
                ),
                icon: const Icon(Icons.grid_3x3),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                tooltip: _focusLocked ? 'Unlock focus' : 'Lock focus',
                onPressed: _toggleFocusLock,
                style: IconButton.styleFrom(
                  backgroundColor: Colors.black54,
                  foregroundColor: _focusLocked ? IlluminatiTheme.sacredGold : Colors.white,
                ),
                icon: Icon(_focusLocked ? Icons.lock : Icons.lock_open),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                tooltip: _timerSeconds == 0 ? 'Set self-timer' : 'Self-timer: ${_timerSeconds}s',
                onPressed: _isCapturing ? null : _cycleTimer,
                style: IconButton.styleFrom(
                  backgroundColor: Colors.black54,
                  foregroundColor: _timerSeconds > 0 ? IlluminatiTheme.sacredGold : Colors.white,
                ),
                icon: Text(
                  _timerSeconds == 0 ? '0s' : '${_timerSeconds}s',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                tooltip: 'Aspect ratio: $_aspectRatioLabel',
                onPressed: _isCapturing || _isRecording ? null : _cycleAspectRatio,
                style: IconButton.styleFrom(
                  backgroundColor: Colors.black54,
                  foregroundColor: _aspectRatioIndex == 0 ? Colors.white : IlluminatiTheme.sacredGold,
                ),
                icon: Text(_aspectRatioLabel, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                tooltip: _maxRecordingSeconds == 0
                    ? 'Unlimited recording'
                    : 'Auto-stop after $_recordingLimitLabel',
                onPressed: _isCapturing || _isRecording ? null : _cycleRecordingLimit,
                style: IconButton.styleFrom(
                  backgroundColor: Colors.black54,
                  foregroundColor: _maxRecordingSeconds == 0 ? Colors.white : IlluminatiTheme.sacredGold,
                ),
                icon: Text(_recordingLimitLabel, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                tooltip: 'Reset camera controls',
                onPressed: _isCapturing || _isRecording ? null : _resetCameraControls,
                style: IconButton.styleFrom(
                  backgroundColor: Colors.black54,
                  foregroundColor: Colors.white,
                ),
                icon: const Icon(Icons.restart_alt),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                tooltip: _isRecording ? 'Stop video recording' : 'Start video recording',
                onPressed: _isCapturing ? null : _toggleVideoRecording,
                style: IconButton.styleFrom(
                  backgroundColor: _isRecording ? IlluminatiTheme.crimsonSeal : Colors.black54,
                  foregroundColor: Colors.white,
                ),
                icon: _isRecording
                    ? Text(
                        _formatRecordingDuration(),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                      )
                    : const Icon(Icons.videocam),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                tooltip: widget.audioEnabled ? 'Disable video audio' : 'Enable video audio',
                onPressed: _isCapturing || _isRecording
                    ? null
                    : () => context.read<CameraBloc>().add(ToggleAudioCaptureEvent()),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.black54,
                  foregroundColor: widget.audioEnabled ? IlluminatiTheme.sacredGold : Colors.white,
                ),
                icon: Icon(widget.audioEnabled ? Icons.mic : Icons.mic_off),
              ),
              if (_lastVideoPath != null) ...[
                const SizedBox(width: 8),
                IconButton.filled(
                  tooltip: 'Copy last video path',
                  onPressed: _isCapturing || _isRecording ? null : _copyLastVideoPath,
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.black54,
                    foregroundColor: Colors.white,
                  ),
                  icon: const Icon(Icons.content_copy),
                ),
              ],
            ],
          ),
        ),
        if (_gridEnabled)
          const Positioned.fill(
            child: IgnorePointer(child: CustomPaint(painter: _FramingGridPainter())),
          ),
        if (_lastPhotoBytes != null)
          Positioned(
            left: 16,
            bottom: _maxZoom > _minZoom || _maxExposure > _minExposure ? 120 : 16,
            child: GestureDetector(
              onTap: _showLastPhoto,
              child: Container(
                width: 58,
                height: 58,
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: Colors.black87,
                  border: Border.all(color: IlluminatiTheme.sacredGold, width: 1.5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(5),
                  child: Image.memory(_lastPhotoBytes!, fit: BoxFit.cover),
                ),
              ),
            ),
          ),
        Positioned(
          bottom: _maxZoom > _minZoom || _maxExposure > _minExposure ? 92 : 16,
          left: 0,
          right: 0,
          child: Center(
            child: IconButton.filled(
              tooltip: 'Take photo',
              onPressed: _isCapturing || _isRecording ? null : _capturePhoto,
              style: IconButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
                disabledBackgroundColor: Colors.white54,
                padding: const EdgeInsets.all(16),
              ),
              icon: _isCapturing
                  ? _countdown > 0
                      ? Text(
                          '$_countdown',
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                        )
                      : const SizedBox(
                          width: 26,
                          height: 26,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                        )
                  : const Icon(Icons.camera_alt, size: 28),
            ),
          ),
        ),
        if (_maxZoom > _minZoom || _maxExposure > _minExposure)
          Positioned(
            left: 16,
            right: 16,
            bottom: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  if (_maxZoom > _minZoom)
                    Row(
                      children: [
                        const Icon(Icons.zoom_out, color: Colors.white70, size: 18),
                        Expanded(
                          child: Slider(
                            value: _zoomLevel.clamp(_minZoom, _maxZoom),
                            min: _minZoom,
                            max: _maxZoom,
                            onChanged: _setZoom,
                            activeColor: IlluminatiTheme.sacredGold,
                            inactiveColor: Colors.white30,
                          ),
                        ),
                        Text(
                          '${_zoomLevel.toStringAsFixed(1)}x',
                          style: GoogleFonts.orbitron(color: Colors.white, fontSize: 10),
                        ),
                      ],
                    ),
                  if (_maxExposure > _minExposure)
                    Row(
                      children: [
                        const Icon(Icons.brightness_6, color: Colors.white70, size: 18),
                        Expanded(
                          child: Slider(
                            value: _exposureOffset.clamp(_minExposure, _maxExposure),
                            min: _minExposure,
                            max: _maxExposure,
                            onChanged: _setExposure,
                            activeColor: IlluminatiTheme.cyberCyan,
                            inactiveColor: Colors.white30,
                          ),
                        ),
                        Text(
                          _exposureOffset.toStringAsFixed(1),
                          style: GoogleFonts.orbitron(color: Colors.white, fontSize: 10),
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

class _FramingGridPainter extends CustomPainter {
  const _FramingGridPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.45)
      ..strokeWidth = 1;
    final verticalThird = size.width / 3;
    final horizontalThird = size.height / 3;
    canvas.drawLine(Offset(verticalThird, 0), Offset(verticalThird, size.height), paint);
    canvas.drawLine(Offset(verticalThird * 2, 0), Offset(verticalThird * 2, size.height), paint);
    canvas.drawLine(Offset(0, horizontalThird), Offset(size.width, horizontalThird), paint);
    canvas.drawLine(Offset(0, horizontalThird * 2), Offset(size.width, horizontalThird * 2), paint);
  }

  @override
  bool shouldRepaint(covariant _FramingGridPainter oldDelegate) => false;
}

class _PhotoEditorDialog extends StatefulWidget {
  final Uint8List bytes;

  const _PhotoEditorDialog({required this.bytes});

  @override
  State<_PhotoEditorDialog> createState() => _PhotoEditorDialogState();
}

class _PhotoEditorDialogState extends State<_PhotoEditorDialog> {
  int _quarterTurns = 0;
  int _filterIndex = 0;

  static const _filterNames = ['ORIGINAL', 'MONOCHROME', 'NIGHT', 'THERMAL'];

  Widget _filteredImage() {
    Widget image = Image.memory(widget.bytes, fit: BoxFit.contain);
    switch (_filterIndex) {
      case 1:
        image = ColorFiltered(
          colorFilter: const ColorFilter.matrix(<double>[
            0.2126, 0.7152, 0.0722, 0, 0,
            0.2126, 0.7152, 0.0722, 0, 0,
            0.2126, 0.7152, 0.0722, 0, 0,
            0, 0, 0, 1, 0,
          ]),
          child: image,
        );
      case 2:
        image = ColorFiltered(
          colorFilter: const ColorFilter.mode(Color(0xFF37FF88), BlendMode.modulate),
          child: image,
        );
      case 3:
        image = ColorFiltered(
          colorFilter: const ColorFilter.matrix(<double>[
            1.5, 0, 0, 0, 0,
            0, 0.35, 0, 0, 35,
            0, 0, 1.5, 0, 35,
            0, 0, 0, 1, 0,
          ]),
          child: image,
        );
    }
    return RotatedBox(quarterTurns: _quarterTurns, child: image);
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: IlluminatiTheme.voidDark,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(height: 280, child: _filteredImage()),
            const SizedBox(height: 8),
            Text(
              _filterNames[_filterIndex],
              style: GoogleFonts.orbitron(color: IlluminatiTheme.sacredGold, fontSize: 10),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  tooltip: 'Rotate photo',
                  onPressed: () => setState(() => _quarterTurns = (_quarterTurns + 1) % 4),
                  icon: const Icon(Icons.rotate_right, color: IlluminatiTheme.sacredGold),
                ),
                TextButton(
                  onPressed: () => setState(() => _filterIndex = (_filterIndex + 1) % _filterNames.length),
                  child: const Text('CHANGE FILTER'),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('CLOSE'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterControls extends StatelessWidget {
  final bool mirrored;
  final ValueChanged<bool> onMirrorChanged;

  const _FilterControls({required this.mirrored, required this.onMirrorChanged});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PrivacyShieldProvider>();
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 16),
        color: IlluminatiTheme.voidDark,
        child: Column(
          children: [
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 8,
              children: [
                _FilterButton(label: 'CLEAR', filter: CameraFilter.none),
                _FilterButton(label: 'B&W', filter: CameraFilter.monochrome),
                _FilterButton(label: 'NIGHT', filter: CameraFilter.nightVision),
                _FilterButton(label: 'THERMAL', filter: CameraFilter.thermal),
                _FilterButton(label: 'FULL SCREEN', filter: CameraFilter.fullScreen),
              ],
            ),
            const SizedBox(height: 10),
            SwitchListTile.adaptive(
              dense: true,
              contentPadding: EdgeInsets.zero,
              value: mirrored,
              onChanged: onMirrorChanged,
              activeThumbColor: IlluminatiTheme.sacredGold,
              title: const Text(
                'MIRROR LIVE PREVIEW',
                style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              secondary: const Icon(Icons.flip, color: IlluminatiTheme.sacredGold, size: 20),
            ),
            if (provider.cameraFilter == CameraFilter.fullScreen) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  const Text('SCREEN COLOR', style: TextStyle(color: Colors.white70)),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: () => _showColorDialog(context, provider),
                    child: Container(
                      width: 42,
                      height: 28,
                      decoration: BoxDecoration(
                        color: provider.cameraFilterColor,
                        border: Border.all(color: Colors.white),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(_hex(provider.cameraFilterColor), style: const TextStyle(color: Colors.white70)),
                  const Spacer(),
                  ...[Colors.black, Colors.white, Colors.red, Colors.blue, Colors.green].map(
                    (color) => Padding(
                      padding: const EdgeInsets.only(left: 7),
                      child: GestureDetector(
                        onTap: () => provider.setCameraFilterColor(color),
                        child: CircleAvatar(radius: 13, backgroundColor: color),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  static String _hex(Color color) => '#${color.toARGB32().toRadixString(16).substring(2).toUpperCase()}';

  static Future<void> _showColorDialog(BuildContext context, PrivacyShieldProvider provider) async {
    final controller = TextEditingController(text: _hex(provider.cameraFilterColor));
    final value = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Full-screen color'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(prefixText: '#', hintText: '000000'),
          textCapitalization: TextCapitalization.characters,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text), child: const Text('APPLY')),
        ],
      ),
    );
    if (value == null) return;
    final normalized = value.replaceFirst('#', '').trim();
    if (RegExp(r'^[0-9a-fA-F]{6}$').hasMatch(normalized)) {
      provider.setCameraFilterColor(Color(int.parse('FF$normalized', radix: 16)));
    }
  }
}

class _FilterButton extends StatelessWidget {
  final String label;
  final CameraFilter filter;

  const _FilterButton({required this.label, required this.filter});

  @override
  Widget build(BuildContext context) {
    final active = context.watch<PrivacyShieldProvider>().cameraFilter == filter;
    return OutlinedButton(
      onPressed: () => context.read<PrivacyShieldProvider>().setCameraFilter(filter),
      style: OutlinedButton.styleFrom(
        foregroundColor: active ? Colors.black : IlluminatiTheme.sacredGold,
        backgroundColor: active ? IlluminatiTheme.sacredGold : Colors.transparent,
        side: const BorderSide(color: IlluminatiTheme.sacredGold),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      ),
      child: Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }
}
