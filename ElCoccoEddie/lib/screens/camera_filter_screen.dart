import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import '../bloc/camera/camera_bloc.dart';
import '../bloc/camera/camera_event.dart';
import '../bloc/camera/camera_state.dart';
import '../providers/privacy_shield_provider.dart';
import '../theme/illuminati_theme.dart';

class CameraFilterScreen extends StatefulWidget {
  const CameraFilterScreen({super.key});

  @override
  State<CameraFilterScreen> createState() => _CameraFilterScreenState();
}

class _CameraFilterScreenState extends State<CameraFilterScreen> {
  @override
  void initState() {
    super.initState();
    context.read<CameraBloc>().add(InitializeCameraEvent());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text('CAMERA FILTERS', style: GoogleFonts.cinzel(color: IlluminatiTheme.sacredGold)),
        actions: [
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
                if (state is CameraLoadingState) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (state is CameraReadyState) {
                  return _FilteredPreview(controller: state.controller);
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
          const _FilterControls(),
        ],
      ),
    );
  }
}

class _FilteredPreview extends StatelessWidget {
  final CameraController controller;

  const _FilteredPreview({required this.controller});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PrivacyShieldProvider>();
    Widget preview = CameraPreview(controller);

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

    return Center(child: AspectRatio(aspectRatio: controller.value.aspectRatio, child: preview));
  }
}

class _FilterControls extends StatelessWidget {
  const _FilterControls();

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
