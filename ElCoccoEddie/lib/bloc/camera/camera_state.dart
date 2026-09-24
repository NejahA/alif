import 'package:camera/camera.dart';
import 'package:equatable/equatable.dart';

abstract class CameraState extends Equatable {
  const CameraState();

  @override
  List<Object?> get props => [];
}

class CameraInitialState extends CameraState {}

class CameraLoadingState extends CameraState {}

class CameraReadyState extends CameraState {
  final CameraController controller;
  final List<CameraDescription> cameras;
  final bool audioEnabled;

  const CameraReadyState({
    required this.controller,
    required this.cameras,
    this.audioEnabled = false, 
  });

  @override
  List<Object?> get props => [controller, cameras, audioEnabled];
}

class CameraBlockedState extends CameraState {
  final String reason;

  const CameraBlockedState({
    this.reason = "Hardware Camera Seal Active",
  });

  @override
  List<Object?> get props => [reason];
}

class CameraErrorState extends CameraState {
  final String errorMessage;

  const CameraErrorState({required this.errorMessage});

  @override
  List<Object?> get props => [errorMessage];
}
