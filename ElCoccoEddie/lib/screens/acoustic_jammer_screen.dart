import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/illuminati_theme.dart';
import '../providers/privacy_shield_provider.dart';
import '../widgets/sacred_geometry_background.dart';

class AcousticJammerScreen extends StatelessWidget {
  const AcousticJammerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SacredGeometryBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text(
            'ACOUSTIC CIPHER JAMMER',
            style: GoogleFonts.cinzel(
              color: IlluminatiTheme.sacredGold,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
        ),
        body: Consumer<PrivacyShieldProvider>(
          builder: (context, provider, child) {
            return Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  Text(
                    'ULTRASONIC NOISE SPECTRUM',
                    style: GoogleFonts.cinzel(
                      color: IlluminatiTheme.sacredGold,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Emits non-linear acoustic interference to disrupt unauthorized microphone recording.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.orbitron(
                      color: Colors.white70,
                      fontSize: 11,
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Waveform Visualizer Area
                  Container(
                    height: 200,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: IlluminatiTheme.voidDark,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: provider.acousticJammerActive
                            ? IlluminatiTheme.cyberCyan
                            : IlluminatiTheme.sacredGold.withValues(alpha: 0.3),
                        width: 1.5,
                      ),
                      boxShadow: provider.acousticJammerActive
                          ? [
                              BoxShadow(
                                color: IlluminatiTheme.cyberCyan.withValues(alpha: 0.25),
                                blurRadius: 20,
                                spreadRadius: 2,
                              ),
                            ]
                          : [],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: FrequencyWaveformWidget(
                        isActive: provider.acousticJammerActive,
                        frequency: provider.jammerFrequency,
                      ),
                    ),
                  ),

                  const SizedBox(height: 30),

                  // Frequency Slider
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: IlluminatiTheme.slateCard,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: IlluminatiTheme.sacredGold.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'CARRIER FREQUENCY',
                              style: GoogleFonts.cinzel(
                                color: IlluminatiTheme.sacredGold,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              '${(provider.jammerFrequency / 1000).toStringAsFixed(2)} kHz',
                              style: GoogleFonts.orbitron(
                                color: IlluminatiTheme.cyberCyan,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        Slider(
                          value: provider.jammerFrequency,
                          min: 18000.0,
                          max: 22000.0,
                          divisions: 40,
                          activeColor: IlluminatiTheme.cyberCyan,
                          inactiveColor: IlluminatiTheme.obsidianBlack,
                          onChanged: (val) {
                            provider.setJammerFrequency(val);
                          },
                        ),
                      ],
                    ),
                  ).animate().fadeIn(delay: 200.ms),

                  const Spacer(),

                  // Master Jammer Toggle Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: provider.acousticJammerActive
                            ? IlluminatiTheme.crimsonSeal
                            : IlluminatiTheme.cyberCyan,
                        foregroundColor: IlluminatiTheme.obsidianBlack,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      onPressed: () {
                        provider.toggleAcousticJammer();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              provider.acousticJammerActive
                                  ? '🔊 Ultrasonic Acoustic Cipher Active'
                                  : '🔇 Acoustic Cipher Deactivated',
                            ),
                          ),
                        );
                      },
                      icon: Icon(
                        provider.acousticJammerActive
                            ? Icons.stop_circle_outlined
                            : Icons.play_circle_fill,
                        size: 28,
                      ),
                      label: Text(
                        provider.acousticJammerActive
                            ? 'DISENGAGE ACOUSTIC CIPHER'
                            : 'ENGAGE ULTRASONIC JAMMER',
                        style: GoogleFonts.orbitron(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                  ).animate().slideY(begin: 0.3, end: 0),
                  const SizedBox(height: 16),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class FrequencyWaveformWidget extends StatefulWidget {
  final bool isActive;
  final double frequency;

  const FrequencyWaveformWidget({
    super.key,
    required this.isActive,
    required this.frequency,
  });

  @override
  State<FrequencyWaveformWidget> createState() =>
      _FrequencyWaveformWidgetState();
}

class _FrequencyWaveformWidgetState extends State<FrequencyWaveformWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: WaveformPainter(
            progress: _controller.value,
            isActive: widget.isActive,
            frequency: widget.frequency,
          ),
        );
      },
    );
  }
}

class WaveformPainter extends CustomPainter {
  final double progress;
  final bool isActive;
  final double frequency;

  WaveformPainter({
    required this.progress,
    required this.isActive,
    required this.frequency,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);

    final wavePaint = Paint()
      ..color = isActive ? IlluminatiTheme.cyberCyan : IlluminatiTheme.sacredGold.withValues(alpha: 0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = isActive ? 2.5 : 1.2;

    final glowPaint = Paint()
      ..color = (isActive ? IlluminatiTheme.cyberCyan : IlluminatiTheme.sacredGold).withValues(alpha: 0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6.0
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

    final path = Path();
    final wavelength = 50.0 - (frequency - 18000) / 100;
    final amplitude = isActive ? size.height * 0.35 : size.height * 0.08;

    path.moveTo(0, center.dy);

    for (double x = 0; x <= size.width; x += 2) {
      final y = center.dy +
          math.sin((x / wavelength) + (progress * math.pi * 2)) * amplitude *
              math.cos((x / (size.width * 0.5)));
      path.lineTo(x, y);
    }

    if (isActive) {
      canvas.drawPath(path, glowPaint);
    }
    canvas.drawPath(path, wavePaint);
  }

  @override
  bool shouldRepaint(covariant WaveformPainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.isActive != isActive ||
        oldDelegate.frequency != frequency;
  }
}
