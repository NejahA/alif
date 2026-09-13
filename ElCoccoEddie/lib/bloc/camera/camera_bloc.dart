import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import 'camera_event.dart';
import 'camera_state.dart';

class CameraBloc extends Bloc<CameraEvent, CameraState> {
  CameraController? _controller;
  List<CameraDescription> _cameras = [];
  bool _audioEnabled = false;

  CameraController? get controller => _controller;

  CameraBloc() : super(const CameraBlockedState()) {
    on<InitializeCameraEvent>(_onInitializeCamera);
    on<LockCameraEvent>(_onLockCamera);
    on<UnlockCameraEvent>(_onUnlockCamera);
    on<ToggleCameraSealEvent>(_onToggleCameraSeal);
    on<SwitchCameraEvent>(_onSwitchCamera);
    on<ToggleAudioCaptureEvent>(_onToggleAudioCapture);
  }

  Future<void> _onInitializeCamera(
    InitializeCameraEvent event,
    Emitter<CameraState> emit,
  ) async {
    emit(CameraLoadingState());
    try {
      final status = await Permission.camera.request();
      if (status.isGranted) {
        if (_audioEnabled) {
          final microphoneStatus = await Permission.microphone.request();
          if (!microphoneStatus.isGranted) _audioEnabled = false;
        }
        _cameras = await availableCameras();
        if (_cameras.isNotEmpty) {
          await _disposeController();
          _controller = CameraController(
            _cameras.first,
            ResolutionPreset.medium,
            enableAudio: _audioEnabled,
          );
          await _controller!.initialize();
          emit(CameraReadyState(
            controller: _controller!,
            cameras: _cameras,
            audioEnabled: _audioEnabled,
          ));
        } else {
          emit(const CameraErrorState(errorMessage: "No hardware cameras available."));
        }
      } else {
        emit(const CameraErrorState(errorMessage: "Camera permission denied."));
      }
    } catch (e) {
      emit(CameraErrorState(errorMessage: "Camera init error: $e"));
    }
  }

  Future<void> _onLockCamera(
    LockCameraEvent event,
    Emitter<CameraState> emit,
  ) async {
    await _disposeController();
    emit(const CameraBlockedState(reason: "All-Seeing Eye Camera Seal Engaged"));
  }

  Future<void> _onUnlockCamera(
    UnlockCameraEvent event,
    Emitter<CameraState> emit,
  ) async {
    add(InitializeCameraEvent());
  }

  Future<void> _onToggleCameraSeal(
    ToggleCameraSealEvent event,
    Emitter<CameraState> emit,
  ) async {
    if (state is CameraBlockedState) {
      add(UnlockCameraEvent());
    } else {
      add(LockCameraEvent());
    }
  }

  Future<void> _onSwitchCamera(
    SwitchCameraEvent event,
    Emitter<CameraState> emit,
  ) async {
    if (_controller == null || _cameras.length < 2) return;

    final currentDirection = _controller!.description.lensDirection;
    final nextCamera = _cameras.firstWhere(
      (camera) => camera.lensDirection != currentDirection,
      orElse: () => _cameras.first,
    );

    try {
      emit(CameraLoadingState());
      await _disposeController();
      _controller = CameraController(
        nextCamera,
        ResolutionPreset.medium,
        enableAudio: _audioEnabled,
      );
      await _controller!.initialize();
      emit(CameraReadyState(
        controller: _controller!,
        cameras: _cameras,
        audioEnabled: _audioEnabled,
      ));
    } catch (e) {
      emit(CameraErrorState(errorMessage: "Camera switch error: $e"));
    }
  }

  Future<void> _onToggleAudioCapture(
    ToggleAudioCaptureEvent event,
    Emitter<CameraState> emit,
  ) async {
    _audioEnabled = !_audioEnabled;
    if (state is CameraReadyState) add(InitializeCameraEvent());
  }

  Future<void> _disposeController() async {
    if (_controller != null) {
      await _controller!.dispose();
      _controller = null;
    }
  }

  @override
  Future<void> close() async {
    await _disposeController();
    return super.close();
  }
}
