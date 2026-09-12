import 'package:equatable/equatable.dart';

abstract class CameraEvent extends Equatable {
  const CameraEvent();

  @override
  List<Object?> get props => [];
}

class InitializeCameraEvent extends CameraEvent {}

class LockCameraEvent extends CameraEvent {}

class UnlockCameraEvent extends CameraEvent {}

class ToggleCameraSealEvent extends CameraEvent {}
