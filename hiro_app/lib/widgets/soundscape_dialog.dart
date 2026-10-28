import 'dart:math';
import 'package:flutter/material.dart';

import '../services/garden_service.dart';
import '../theme/hiro_theme.dart';

class SoundscapeDialog extends StatefulWidget {
  final GardenService service;

  const SoundscapeDialog({super.key, required this.service});

  @override
  State<SoundscapeDialog> createState() => _SoundscapeDialogState();
}

class _SoundscapeDialogState extends State<SoundscapeDialog>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sound = widget.service.soundscape;

    return Dialog(
      backgroundColor: HiroColors.surfaceElevated,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: HiroColors.neonCyan, width: 1.2),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 420),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: HiroColors.neonCyan.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text('🎵', style: TextStyle(fontSize: 20)),
                ),
                const SizedBox(width: 12),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'SOUNDSCAPE LAB',
                      style: TextStyle(
                        color: HiroColors.neonCyan,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Text(
                      'Ambient Audio Synth Engine',
                      style: TextStyle(
                        color: HiroColors.textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded, color: HiroColors.textMuted),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Live waveform visualizer
            Container(
              height: 54,
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: HiroColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: HiroColors.borderSubtle),
              ),
              child: AnimatedBuilder(
                animation: _animController,
                builder: (context, _) {
                  return CustomPaint(
                    painter: _WaveformPainter(
                      progress: _animController.value,
                      isPlaying: sound.isPlaying,
                      intensity: (sound.droneVolume + sound.binauralVolume + sound.rainVolume) / 3,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),

            // Master Play / Pause
            Center(
              child: ElevatedButton.icon(
                onPressed: () {
                  widget.service.updateSoundscape(isPlaying: !sound.isPlaying);
                },
                icon: Icon(
                  sound.isPlaying ? Icons.volume_up_rounded : Icons.volume_off_rounded,
                  size: 20,
                ),
                label: Text(
                  sound.isPlaying ? 'Ambient Synth Active' : 'Start Ambient Synth',
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: sound.isPlaying
                      ? HiroColors.neuralEmerald.withOpacity(0.2)
                      : HiroColors.surface,
                  foregroundColor: sound.isPlaying
                      ? HiroColors.neuralEmerald
                      : HiroColors.textSecondary,
                  side: BorderSide(
                    color: sound.isPlaying
                        ? HiroColors.neuralEmerald
                        : HiroColors.borderSubtle,
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Drone Volume
            _buildSynthSlider(
              '🎵 Ambient Synth Drone',
              sound.droneVolume,
              HiroColors.neonCyan,
              (v) => widget.service.updateSoundscape(droneVolume: v),
            ),

            // Rain Volume
            _buildSynthSlider(
              '🌧 Nature Rain Noise Generator',
              sound.rainVolume,
              HiroColors.electricTeal,
              (v) => widget.service.updateSoundscape(rainVolume: v),
            ),

            // Binaural Pulse
            _buildSynthSlider(
              '🧘 Binaural Pulse (432Hz Focus Wave)',
              sound.binauralVolume,
              HiroColors.astralViolet,
              (v) => widget.service.updateSoundscape(binauralVolume: v),
            ),

            const SizedBox(height: 12),

            // Pentatonic Note Switch
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text(
                'Play pentatonic scale notes when nodes fire',
                style: TextStyle(fontSize: 13, color: HiroColors.textPrimary),
              ),
              value: sound.pentatonicNotesEnabled,
              activeColor: HiroColors.neonCyan,
              onChanged: (val) {
                widget.service.updateSoundscape(pentatonicNotesEnabled: val);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSynthSlider(
    String label,
    double value,
    Color color,
    ValueChanged<double> onChanged,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 12, color: HiroColors.textSecondary),
            ),
            Text(
              '${(value * 100).round()}%',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: color,
            thumbColor: color,
            overlayColor: color.withOpacity(0.2),
            trackHeight: 4,
          ),
          child: Slider(
            value: value,
            min: 0.0,
            max: 1.0,
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }
}

class _WaveformPainter extends CustomPainter {
  final double progress;
  final bool isPlaying;
  final double intensity;

  _WaveformPainter({
    required this.progress,
    required this.isPlaying,
    required this.intensity,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = isPlaying ? HiroColors.neonCyan : HiroColors.textMuted
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;

    final path = Path();
    final midY = size.height / 2;
    path.moveTo(0, midY);

    final amplitude = isPlaying ? (12.0 * intensity + 4.0) : 2.0;

    for (double x = 0; x <= size.width; x += 3) {
      final normX = x / size.width;
      final y = midY +
          sin(normX * 6 * pi + progress * 2 * pi) * amplitude *
              cos(normX * 2 * pi);
      path.lineTo(x, y);
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _WaveformPainter oldDelegate) => true;
}
