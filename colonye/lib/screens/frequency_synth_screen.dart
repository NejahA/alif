import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class FrequencySynthScreen extends StatefulWidget {
  const FrequencySynthScreen({super.key});

  @override
  State<FrequencySynthScreen> createState() => _FrequencySynthScreenState();
}

class _FrequencySynthScreenState extends State<FrequencySynthScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _waveController;
  double _frequencyHz = 432.0;
  bool _isPlaying = false;
  String _activePreset = "432Hz Cosmic Harmony";

  final Map<String, double> _presets = {
    "7.83Hz Earth Schumann": 7.83,
    "432Hz Cosmic Harmony": 432.0,
    "528Hz Miracle Wave": 528.0,
    "639Hz Heart Connection": 639.0,
    "963Hz Crown Activation": 963.0,
  };

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _waveController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Text(
                  'Frequency Synthesizer',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 26),
                ),
                Text(
                  'Custom Solfeggio & Binaural wave generator',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),

                const SizedBox(height: 20),

                // Main Frequency Hero Visualizer
                GlassCard(
                  borderRadius: 24,
                  borderColor: _isPlaying ? AppTheme.quantumCyan : AppTheme.glassBorder,
                  padding: const EdgeInsets.all(22),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _activePreset.toUpperCase(),
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppTheme.quantumCyan,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                  letterSpacing: 1.1,
                                ),
                          ),
                          Icon(
                            _isPlaying ? Icons.graphic_eq_rounded : Icons.pause_circle_outline_rounded,
                            color: _isPlaying ? AppTheme.quantumCyan : Colors.white38,
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      Text(
                        '${_frequencyHz.toStringAsFixed(1)} Hz',
                        style: Theme.of(context).textTheme.displayLarge?.copyWith(
                              fontSize: 42,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _isPlaying ? 'GENERATING PURE RESONANCE WAVE' : 'SYNTHESIZER STANDBY',
                        style: TextStyle(
                          color: _isPlaying ? AppTheme.quantumCyan : AppTheme.textSecondary,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Sine Wave Painter Canvas
                      SizedBox(
                        height: 70,
                        width: double.infinity,
                        child: AnimatedBuilder(
                          animation: _waveController,
                          builder: (context, child) {
                            return CustomPaint(
                              painter: SineWavePainter(
                                animationValue: _waveController.value,
                                frequency: _frequencyHz,
                                isPlaying: _isPlaying,
                                color: AppTheme.quantumCyan,
                              ),
                            );
                          },
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Hertz Slider
                      SliderTheme(
                        data: SliderThemeData(
                          activeTrackColor: AppTheme.quantumCyan,
                          inactiveTrackColor: Colors.white12,
                          thumbColor: Colors.white,
                          trackHeight: 4.0,
                        ),
                        child: Slider(
                          min: 1.0,
                          max: 1000.0,
                          value: _frequencyHz,
                          onChanged: (val) {
                            setState(() {
                              _frequencyHz = val;
                              _activePreset = "Custom Wave (${val.toInt()}Hz)";
                            });
                          },
                        ),
                      ),

                      const SizedBox(height: 14),

                      // Play / Pause Toggle Button
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _isPlaying ? AppTheme.auroraRose : AppTheme.quantumCyan,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: () => setState(() => _isPlaying = !_isPlaying),
                          icon: Icon(_isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded, color: Colors.black),
                          label: Text(
                            _isPlaying ? 'STOP FREQUENCY' : 'EMIT FREQUENCY',
                            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, letterSpacing: 1.1),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                Text(
                  'Solfeggio Presets',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 12),

                // Presets Cards List
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _presets.keys.length,
                  itemBuilder: (context, index) {
                    final title = _presets.keys.elementAt(index);
                    final hz = _presets[title]!;
                    final isSel = _activePreset == title;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10.0),
                      child: GlassCard(
                        borderRadius: 16,
                        borderColor: isSel ? AppTheme.quantumCyan : AppTheme.glassBorder,
                        onTap: () {
                          setState(() {
                            _activePreset = title;
                            _frequencyHz = hz;
                            _isPlaying = true;
                          });
                        },
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.waves_rounded, color: AppTheme.quantumCyan, size: 22),
                                const SizedBox(width: 14),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      title,
                                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 14),
                                    ),
                                    Text(
                                      '${hz.toStringAsFixed(2)} Hz Target Harmonic',
                                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 11),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            Icon(
                              isSel ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
                              color: isSel ? AppTheme.quantumCyan : Colors.white38,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class SineWavePainter extends CustomPainter {
  final double animationValue;
  final double frequency;
  final bool isPlaying;
  final Color color;

  SineWavePainter({
    required this.animationValue,
    required this.frequency,
    required this.isPlaying,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = isPlaying ? color : Colors.white24
      ..strokeWidth = isPlaying ? 2.5 : 1.0
      ..style = PaintingStyle.stroke;

    final path = Path();
    final centerY = size.height / 2;
    final waveLength = max(20.0, 300.0 - (frequency * 0.25));

    path.moveTo(0, centerY);

    for (double x = 0; x <= size.width; x += 1) {
      final phase = isPlaying ? animationValue * 2 * pi * 3 : 0;
      final y = centerY + sin((x / waveLength * 2 * pi) - phase) * (isPlaying ? size.height * 0.4 : 4.0);
      path.lineTo(x, y);
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant SineWavePainter oldDelegate) {
    return oldDelegate.animationValue != animationValue ||
        oldDelegate.frequency != frequency ||
        oldDelegate.isPlaying != isPlaying;
  }
}
