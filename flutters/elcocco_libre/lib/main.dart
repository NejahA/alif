import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  runApp(const ElCoccoLibreApp());
}

class ElCoccoLibreApp extends StatelessWidget {
  const ElCoccoLibreApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ElCoccoLibré',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1A1A2E),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFF0A0A12),
      ),
      home: const CameraBlockerScreen(),
    );
  }
}

class CameraFilter {
  final String name;
  final List<double> matrix;
  final IconData icon;

  const CameraFilter(this.name, this.matrix, this.icon);
}

const List<CameraFilter> kFilters = [
  CameraFilter('Normal', [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0,
  ], Icons.circle_outlined),
  CameraFilter('Grayscale', [
    0.2126, 0.7152, 0.0722, 0, 0,
    0.2126, 0.7152, 0.0722, 0, 0,
    0.2126, 0.7152, 0.0722, 0, 0,
    0,      0,      0,      1, 0,
  ], Icons.lens_blur_rounded),
  CameraFilter('Sepia', [
    0.393, 0.769, 0.189, 0, 0,
    0.349, 0.686, 0.168, 0, 0,
    0.272, 0.534, 0.131, 0, 0,
    0,     0,     0,     1, 0,
  ], Icons.wb_sunny_rounded),
  CameraFilter('Invert', [
    -1,  0,  0, 0, 255,
     0, -1,  0, 0, 255,
     0,  0, -1, 0, 255,
     0,  0,  0, 1,   0,
  ], Icons.difference_rounded),
  CameraFilter('Vintage', [
    0.9, 0.0, 0.0, 0.0, 50.0,
    0.0, 0.8, 0.0, 0.0, 30.0,
    0.0, 0.0, 0.5, 0.0, -10.0,
    0.0, 0.0, 0.0, 1.0, 0.0,
  ], Icons.filter_vintage_rounded),
  CameraFilter('Cyberpunk', [
    0.8, 0.0, 0.2, 0.0, 10.0,
    0.0, 1.0, 0.0, 0.0, -20.0,
    0.3, 0.0, 1.2, 0.0, 30.0,
    0.0, 0.0, 0.0, 1.0, 0.0,
  ], Icons.brightness_high_rounded),
  CameraFilter('High Contrast', [
    1.5, 1.5, 1.5, 0.0, -200.0,
    1.5, 1.5, 1.5, 0.0, -200.0,
    1.5, 1.5, 1.5, 0.0, -200.0,
    0.0, 0.0, 0.0, 1.0, 0.0,
  ], Icons.hdr_strong_rounded),
  CameraFilter('Polaroid', [
    1.438, -0.062, -0.062, 0, 0,
    -0.122,  1.378, -0.122, 0, 0,
    -0.016, -0.016,  1.483, 0, 0,
    0,       0,      0,     1, 0,
  ], Icons.camera_roll_rounded),
];

class CameraBlockerScreen extends StatefulWidget {
  const CameraBlockerScreen({super.key});

  @override
  State<CameraBlockerScreen> createState() => _CameraBlockerScreenState();
}

class _CameraBlockerScreenState extends State<CameraBlockerScreen>
    with WidgetsBindingObserver, SingleTickerProviderStateMixin {
  static const _channel = MethodChannel('com.example.el_cocco_libre/camera_blocker');

  List<CameraDescription>? _cameras;
  CameraController? _controller;
  int _selectedCameraIndex = 0;
  int _selectedFilterIndex = 0;

  bool _isBlocking = false;
  bool _overlayPermissionGranted = false;
  bool _usageStatsPermissionGranted = false;
  bool _deviceAdminActive = false;
  bool _permissionGranted = false; // Flutter camera permission
  String _status = 'Initializing...';
  String? _error;

  late AnimationController _animationController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _rotationAnimation;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();

    _pulseAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut,
      ),
    );

    _rotationAnimation = Tween<double>(begin: 0, end: 2 * pi).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.linear,
      ),
    );

    _checkStatusAndInit();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _animationController.dispose();
    _controller?.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) async {
    if (state == AppLifecycleState.resumed) {
      await Future.delayed(const Duration(milliseconds: 500)); // Wait a bit for permissions to update
      _checkStatusAndInit();
    }
  }

  // Native Channel calls
  Future<bool> _isOverlayGranted() async {
    try {
      final bool granted = await _channel.invokeMethod('isOverlayGranted');
      return granted;
    } catch (e) {
      return false;
    }
  }

  Future<void> _requestOverlayPermission() async {
    try {
      await _channel.invokeMethod('requestOverlayPermission');
    } catch (e) {
      debugPrint('Error requesting overlay permission: $e');
    }
  }

  Future<bool> _isUsageStatsGranted() async {
    try {
      final bool granted = await _channel.invokeMethod('isUsageStatsGranted');
      return granted;
    } catch (e) {
      return false;
    }
  }

  Future<void> _requestUsageStatsPermission() async {
    try {
      await _channel.invokeMethod('requestUsageStatsPermission');
    } catch (e) {
      debugPrint('Error requesting usage stats permission: $e');
    }
  }

  Future<bool> _isDeviceAdminActive() async {
    try {
      final bool active = await _channel.invokeMethod('isDeviceAdminActive');
      return active;
    } catch (e) {
      return false;
    }
  }

  Future<void> _requestDeviceAdmin() async {
    try {
      await _channel.invokeMethod('requestDeviceAdmin');
    } catch (e) {
      debugPrint('Error requesting device admin: $e');
    }
  }

  Future<bool> _isCameraDisabled() async {
    try {
      final bool disabled = await _channel.invokeMethod('isCameraDisabled');
      return disabled;
    } catch (e) {
      return false;
    }
  }

  Future<bool> _setCameraDisabled(bool disabled) async {
    try {
      final bool success = await _channel.invokeMethod('setCameraDisabled', {'disabled': disabled});
      return success;
    } catch (e) {
      return false;
    }
  }

  Future<bool> _startShieldService() async {
    try {
      final bool success = await _channel.invokeMethod('startShieldService');
      return success;
    } catch (e) {
      return false;
    }
  }

  Future<bool> _stopShieldService() async {
    try {
      final bool success = await _channel.invokeMethod('stopShieldService');
      return success;
    } catch (e) {
      return false;
    }
  }

  Future<bool> _isShieldServiceRunning() async {
    try {
      final bool running = await _channel.invokeMethod('isShieldServiceRunning');
      return running;
    } catch (e) {
      return false;
    }
  }

  Future<void> _checkStatusAndInit() async {
    final overlay = await _isOverlayGranted();
    final usage = await _isUsageStatsGranted();
    final running = await _isShieldServiceRunning();
    final deviceAdmin = await _isDeviceAdminActive();
    final cameraDisabled = await _isCameraDisabled();
    final cameraPermission = await Permission.camera.status;

    setState(() {
      _overlayPermissionGranted = overlay;
      _usageStatsPermissionGranted = usage;
      _deviceAdminActive = deviceAdmin;
      _isBlocking = cameraDisabled || running;
      _permissionGranted = cameraPermission.isGranted;
      _status = _isBlocking ? 'Camera shield is actively guarding' : 'Camera active';
    });

    if (!_isBlocking) {
      if (_permissionGranted) {
        if (_controller == null || !_controller!.value.isInitialized) {
          await _initCamera();
        }
      }
    } else {
      if (_controller != null) {
        await _controller!.dispose();
        setState(() {
          _controller = null;
        });
      }
    }
  }

  Future<void> _initCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras == null || _cameras!.isEmpty) {
        setState(() {
          _error = 'No hardware cameras found on this device.';
        });
        return;
      }

      if (_selectedCameraIndex >= _cameras!.length) {
        _selectedCameraIndex = 0;
      }

      final camera = _cameras![_selectedCameraIndex];

      final oldController = _controller;
      if (oldController != null) {
        _controller = null;
        await oldController.dispose();
      }

      final controller = CameraController(
        camera,
        ResolutionPreset.high,
        enableAudio: false,
      );

      _controller = controller;

      await controller.initialize();

      if (!mounted) return;
      setState(() {
        _error = null;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Error initializing camera preview:\n${e.toString()}';
        });
      }
    }
  }

  Future<void> _requestCameraPermission() async {
    final status = await Permission.camera.request();
    if (status.isGranted) {
      setState(() {
        _permissionGranted = true;
      });
      await _checkStatusAndInit();
    } else {
      setState(() {
        _error = 'Camera permission is required for live filters preview.';
      });
    }
  }

  Future<void> _toggleBlocking() async {
    if (_isBlocking) {
      // Deactivating Blocker
      await _setCameraDisabled(false);
      await _stopShieldService();
      setState(() {
        _isBlocking = false;
        _status = 'Camera active';
      });
      if (_permissionGranted) {
        await _initCamera();
      } else {
        await _requestCameraPermission();
      }
    } else {
      // Activating Blocker
      if (!_deviceAdminActive) {
        await _requestDeviceAdmin();
        return;
      }
      if (!_overlayPermissionGranted) {
        await _requestOverlayPermission();
        return;
      }
      if (!_usageStatsPermissionGranted) {
        await _requestUsageStatsPermission();
        return;
      }

      final cameraDisabledSuccess = await _setCameraDisabled(true);
      final serviceSuccess = await _startShieldService();
      if (cameraDisabledSuccess || serviceSuccess) {
        if (_controller != null) {
          await _controller!.dispose();
          setState(() {
            _controller = null;
          });
        }
        setState(() {
          _isBlocking = true;
          _status = 'Camera shield is actively guarding';
        });
      } else {
        setState(() {
          _status = 'Failed to start shield service.';
        });
      }
    }
  }

  Future<void> _switchCamera() async {
    if (_cameras == null || _cameras!.isEmpty || _cameras!.length < 2) return;
    setState(() {
      _selectedCameraIndex = (_selectedCameraIndex + 1) % _cameras!.length;
    });
    await _initCamera();
  }

  @override
  Widget build(BuildContext context) {
    final accentColor = _isBlocking ? Colors.redAccent : const Color(0xFFD4AF37);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                _buildHeader(accentColor),
                const SizedBox(height: 16),

                // Main body: preview or locked panel
                SizedBox(
                  height: 380,
                  child: _isBlocking
                      ? _buildLockedScreen(accentColor)
                      : _buildCameraPreviewScreen(),
                ),
                const SizedBox(height: 16),

                // Main toggle button
                _buildMainToggleButton(accentColor),
                const SizedBox(height: 20),

                // Permission setup console card
                _buildPermissionsSetupCard(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(Color accentColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'EL COCCO LIBRÉ',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                letterSpacing: 2,
                color: accentColor,
              ),
            ),
            Text(
              'App & Hardware Shield',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[500],
                letterSpacing: 1.5,
              ),
            ),
          ],
        ),
        if (!_isBlocking && _permissionGranted && _controller != null && _controller!.value.isInitialized)
          IconButton(
            onPressed: _switchCamera,
            icon: const Icon(
              Icons.flip_camera_android_rounded,
              color: Colors.white,
              size: 26,
            ),
            tooltip: 'Flip Camera',
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF161625),
              padding: const EdgeInsets.all(12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildLockedScreen(Color accentColor) {
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            color: const Color(0xFF0F0F1A),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: accentColor.withValues(alpha: 0.2),
              width: 1.5,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Transform.scale(
                scale: _pulseAnimation.value,
                child: SizedBox(
                  width: 130,
                  height: 130,
                  child: CustomPaint(
                    painter: EyeOfProvidencePainter(
                      rotationValue: _rotationAnimation.value,
                      accentColor: accentColor,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'CAMERA SHIELD ACTIVE',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                  color: accentColor,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'System-wide protection is enabled.\nAny attempt to launch the camera will be blocked.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[400],
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(color: accentColor.withValues(alpha: 0.15)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.security_rounded,
                      color: accentColor,
                      size: 14,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'INTERCEPT SHIELD ENGAGED',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: accentColor,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCameraPreviewScreen() {
    if (!_permissionGranted) {
      return Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0F0F1A),
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.camera_alt_outlined, color: Colors.grey[600], size: 64),
            const SizedBox(height: 16),
            const Text(
              'Camera Permission Required',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Please grant camera permission to use live filters.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Colors.grey[400]),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _requestCameraPermission,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD4AF37),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Grant Camera Permission'),
            ),
          ],
        ),
      );
    }

    if (_error != null) {
      return Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0F0F1A),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.amber.withValues(alpha: 0.2)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded, color: Colors.amberAccent, size: 48),
            const SizedBox(height: 16),
            const Text(
              'Camera Connection Failed',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              _error!,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Colors.grey[400]),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _initCamera,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD4AF37),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Retry Connection'),
            ),
          ],
        ),
      );
    }

    if (_controller == null || !_controller!.value.isInitialized) {
      return const Center(
        child: CircularProgressIndicator(
          color: Color(0xFFD4AF37),
        ),
      );
    }

    final activeFilter = kFilters[_selectedFilterIndex];

    return Column(
      children: [
        // Camera View
        Expanded(
          child: Container(
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: const Color(0xFFD4AF37).withValues(alpha: 0.3),
                width: 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.1),
                  blurRadius: 20,
                  spreadRadius: 2,
                )
              ],
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                ColorFiltered(
                  colorFilter: ColorFilter.matrix(activeFilter.matrix),
                  child: AspectRatio(
                    aspectRatio: _controller!.value.aspectRatio,
                    child: CameraPreview(_controller!),
                  ),
                ),
                Positioned.fill(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.5),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.fiber_manual_record, color: Colors.green, size: 10),
                                  SizedBox(width: 6),
                                  Text(
                                    'LIVE',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.5),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                activeFilter.name.toUpperCase(),
                                style: const TextStyle(
                                  color: Color(0xFFD4AF37),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const Expanded(
                          child: Align(
                            alignment: Alignment.center,
                            child: Icon(
                              Icons.add,
                              color: Colors.white54,
                              size: 32,
                            ),
                          ),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.6),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                _selectedCameraIndex == 0 ? 'BACK CAMERA' : 'FRONT CAMERA',
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 9,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        _buildFiltersTray(),
      ],
    );
  }

  Widget _buildFiltersTray() {
    return Container(
      height: 60,
      decoration: BoxDecoration(
        color: const Color(0xFF0F0F1A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF2C2C3E),
        ),
      ),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        itemCount: kFilters.length,
        itemBuilder: (context, index) {
          final filter = kFilters[index];
          final isSelected = _selectedFilterIndex == index;
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedFilterIndex = index;
              });
            },
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: isSelected
                    ? const Color(0xFFD4AF37).withValues(alpha: 0.15)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isSelected ? const Color(0xFFD4AF37) : Colors.transparent,
                  width: 1.5,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    filter.icon,
                    size: 14,
                    color: isSelected ? const Color(0xFFD4AF37) : Colors.grey[400],
                  ),
                  const SizedBox(width: 6),
                  Text(
                    filter.name,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? Colors.white : Colors.grey[400],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildMainToggleButton(Color accentColor) {
    return SizedBox(
      height: 56,
      child: ElevatedButton(
        onPressed: _toggleBlocking, // Tapping will request missing permissions automatically
        style: ElevatedButton.styleFrom(
          backgroundColor: _isBlocking ? const Color(0xFF161625) : Colors.red[800],
          foregroundColor: _isBlocking ? Colors.grey[200] : Colors.white,
          side: BorderSide(
            color: _isBlocking ? const Color(0xFF2C2C3E) : Colors.redAccent,
            width: 1.5,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: _isBlocking ? 0 : 6,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _isBlocking ? Icons.lock_open_rounded : Icons.videocam_off_rounded,
              size: 20,
            ),
            const SizedBox(width: 12),
            Text(
              _isBlocking ? 'ACTIVATE CAMERA & PREVIEW' : 'DEACTIVATE CAMERA NOW',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                letterSpacing: 2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPermissionsSetupCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF161625),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2C2C3E)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Icon(Icons.tune_rounded, color: Color(0xFFD4AF37), size: 20),
              const SizedBox(width: 8),
              Text(
                'Camera Blocker Console',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[200],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'To block the native Camera app and third-party apps, ElCoccoLibré requires the following Android system permissions:',
            style: TextStyle(fontSize: 12, color: Colors.grey[400], height: 1.4),
          ),
          const SizedBox(height: 16),

          // Device Admin Permission
          _buildPermissionToggle(
            title: 'Device Administrator',
            subtitle: 'Allows disabling the camera system-wide.',
            granted: _deviceAdminActive,
            onPressed: _requestDeviceAdmin,
          ),
          const Divider(color: Color(0xFF2C2C3E), height: 24),

          // Overlay Permission
          _buildPermissionToggle(
            title: 'Draw Over Other Apps',
            subtitle: 'Allows showing the security block screen.',
            granted: _overlayPermissionGranted,
            onPressed: _requestOverlayPermission,
          ),
          const Divider(color: Color(0xFF2C2C3E), height: 24),

          // Usage Stats Permission
          _buildPermissionToggle(
            title: 'Usage Access Statistics',
            subtitle: 'Allows detecting when the camera launches.',
            granted: _usageStatsPermissionGranted,
            onPressed: _requestUsageStatsPermission,
          ),
        ],
      ),
    );
  }

  Widget _buildPermissionToggle({
    required String title,
    required String subtitle,
    required bool granted,
    required VoidCallback onPressed,
  }) {
    return Row(
      children: [
        Icon(
          granted ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
          color: granted ? Colors.green[400] : Colors.grey[600],
          size: 22,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: granted ? Colors.green[200] : Colors.grey[300],
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.grey[500],
                ),
              ),
            ],
          ),
        ),
        ElevatedButton(
          onPressed: granted ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: granted ? Colors.transparent : const Color(0xFFD4AF37).withValues(alpha: 0.15),
            foregroundColor: granted ? Colors.grey[500] : const Color(0xFFD4AF37),
            surfaceTintColor: Colors.transparent,
            shadowColor: Colors.transparent,
            disabledBackgroundColor: Colors.transparent,
            side: BorderSide(
              color: granted ? const Color(0xFF2C2C3E) : const Color(0xFFD4AF37).withValues(alpha: 0.4),
              width: 1,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          ),
          child: Text(
            granted ? 'ACTIVE' : 'GRANT',
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}

class EyeOfProvidencePainter extends CustomPainter {
  final double rotationValue;
  final Color accentColor;

  EyeOfProvidencePainter({
    required this.rotationValue,
    required this.accentColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 10;

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..color = accentColor;

    final fillPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = accentColor.withValues(alpha: 0.05);

    // Draw triangle
    final trianglePath = Path();
    final triangleRadius = radius * 0.85;
    for (int i = 0; i < 3; i++) {
      final angle = (i * 2 * pi / 3) - pi / 2;
      final px = center.dx + triangleRadius * cos(angle);
      final py = center.dy + triangleRadius * sin(angle);
      if (i == 0) {
        trianglePath.moveTo(px, py);
      } else {
        trianglePath.lineTo(px, py);
      }
    }
    trianglePath.close();

    canvas.drawPath(trianglePath, fillPaint);
    canvas.drawPath(trianglePath, paint);

    // Inner circle (the eye)
    final eyeRadius = radius * 0.3;
    canvas.drawCircle(center, eyeRadius, fillPaint);
    canvas.drawCircle(center, eyeRadius, paint);

    // Iris
    final irisPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = accentColor;
    canvas.drawCircle(center, eyeRadius * 0.5, irisPaint);

    // Pupil
    final pupilPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = const Color(0xFF0A0A12);
    canvas.drawCircle(center, eyeRadius * 0.25, pupilPaint);

    // Pupil highlight
    final highlightPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = Colors.white.withValues(alpha: 0.8);
    canvas.drawCircle(
      Offset(center.dx - eyeRadius * 0.08, center.dy - eyeRadius * 0.08),
      eyeRadius * 0.06,
      highlightPaint,
    );

    // Rays emanating from the eye (these will rotate!)
    final rayPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..color = accentColor.withValues(alpha: 0.4);

    for (int i = 0; i < 12; i++) {
      final angle = i * 2 * pi / 12 + rotationValue;
      final startR = eyeRadius + 8;
      final endR = eyeRadius + 22;
      canvas.drawLine(
        Offset(center.dx + startR * cos(angle), center.dy + startR * sin(angle)),
        Offset(center.dx + endR * cos(angle), center.dy + endR * sin(angle)),
        rayPaint,
      );
    }

    // Concentric glow rings
    final glowPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1
      ..color = accentColor.withValues(alpha: 0.2);
    canvas.drawCircle(center, eyeRadius + 12, glowPaint);
    canvas.drawCircle(center, eyeRadius + 20, glowPaint);
  }

  @override
  bool shouldRepaint(covariant EyeOfProvidencePainter oldDelegate) {
    return oldDelegate.rotationValue != rotationValue || oldDelegate.accentColor != accentColor;
  }
}