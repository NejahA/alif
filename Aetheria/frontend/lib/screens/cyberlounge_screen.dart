import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:audioplayers/audioplayers.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class CyberLoungeScreen extends StatefulWidget {
  const CyberLoungeScreen({super.key});

  @override
  State<CyberLoungeScreen> createState() => _CyberLoungeScreenState();
}

class _CyberLoungeScreenState extends State<CyberLoungeScreen> with TickerProviderStateMixin {
  List<LoungeChannel> channels = [];
  LoungeChannel? currentChannel;
  bool isPlaying = false;
  bool isLoading = true;

  final AudioPlayer _audioPlayer = AudioPlayer();
  late AnimationController _particleController;

  // Sound Mix Layers
  double rainVolume = 0.6;
  double synthVolume = 0.8;
  double breezeVolume = 0.4;

  // Binaural Beats State
  String activeBinaural = 'None';

  @override
  void initState() {
    super.initState();
    _particleController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();
    _loadChannels();
  }

  void _loadChannels() async {
    final fetched = await ApiService.fetchChannels();
    if (!mounted) return;
    setState(() {
      channels = fetched;
      if (channels.isNotEmpty) {
        currentChannel = channels[0];
      }
      isLoading = false;
    });
  }

  void _togglePlay() async {
    if (currentChannel == null) return;
    if (isPlaying) {
      await _audioPlayer.pause();
      if (mounted) setState(() => isPlaying = false);
    } else {
      try {
        await _audioPlayer.play(UrlSource(currentChannel!.audioUrl));
        if (mounted) setState(() => isPlaying = true);
      } catch (e) {
        debugPrint("Audio play error: $e");
      }
    }
  }

  void _selectChannel(LoungeChannel ch) async {
    setState(() {
      currentChannel = ch;
      isPlaying = false;
    });
    await _audioPlayer.stop();
    _togglePlay();
  }

  @override
  void dispose() {
    _particleController.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Generative Background Canvas
        Positioned.fill(
          child: AnimatedBuilder(
            animation: _particleController,
            builder: (context, child) {
              return CustomPaint(
                painter: CyberParticlePainter(progress: _particleController.value),
              );
            },
          ),
        ),

        // Foreground Audio & Lounge UI
        SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Lounge Banner Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF161B22).withValues(alpha: 0.85),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFFF007F).withValues(alpha: 0.4)),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFFF007F).withValues(alpha: 0.15),
                      blurRadius: 24,
                    )
                  ],
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.graphic_eq,
                      size: 48,
                      color: isPlaying ? const Color(0xFFFF007F) : Colors.white38,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      currentChannel?.name ?? 'Cyber Lounge Station',
                      style: GoogleFonts.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      '📻 ${currentChannel?.genre ?? 'Lo-Fi Synthwave'} • 👥 ${currentChannel?.listeners ?? 0} Listeners Live',
                      style: GoogleFonts.outfit(color: const Color(0xFF00F5FF), fontSize: 13),
                    ),
                    const SizedBox(height: 20),

                    // Playback Controls
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          iconSize: 32,
                          icon: const Icon(Icons.skip_previous, color: Colors.white70),
                          onPressed: () {},
                        ),
                        const SizedBox(width: 16),
                        GestureDetector(
                          onTap: _togglePlay,
                          child: Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(
                                colors: [Color(0xFFFF007F), Color(0xFF7000FF)],
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFFF007F).withValues(alpha: 0.5),
                                  blurRadius: 16,
                                )
                              ],
                            ),
                            child: Icon(
                              isPlaying ? Icons.pause : Icons.play_arrow,
                              size: 36,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        IconButton(
                          iconSize: 32,
                          icon: const Icon(Icons.skip_next, color: Colors.white70),
                          onPressed: () {},
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Binaural Beats Brainwave Frequencies Selector
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF161B22).withValues(alpha: 0.85),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF7000FF).withValues(alpha: 0.4)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '🔊 Binaural Brainwave Frequency',
                          style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        if (activeBinaural != 'None')
                          Text(
                            'ACTIVE',
                            style: GoogleFonts.outfit(color: const Color(0xFF00F5FF), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _buildBinauralChip('Alpha (10Hz)', 'Relaxation'),
                        const SizedBox(width: 8),
                        _buildBinauralChip('Theta (6Hz)', 'Creativity'),
                        const SizedBox(width: 8),
                        _buildBinauralChip('Gamma (40Hz)', 'Super Focus'),
                      ],
                    )
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Channel Selector
              Text(
                '📡 Ambient Frequency Channels',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),

              if (isLoading)
                const Center(child: CircularProgressIndicator(color: Color(0xFFFF007F)))
              else
                Column(
                  children: channels.map((ch) {
                    final bool isSelected = currentChannel?.id == ch.id;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF1E293B) : const Color(0xFF161B22).withValues(alpha: 0.8),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected ? const Color(0xFFFF007F) : Colors.white12,
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: ListTile(
                        onTap: () => _selectChannel(ch),
                        leading: CircleAvatar(
                          backgroundColor: const Color(0xFF7000FF),
                          child: Icon(
                            isSelected && isPlaying ? Icons.volume_up : Icons.radio,
                            color: Colors.white,
                          ),
                        ),
                        title: Text(
                          ch.name,
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        subtitle: Text(
                          '${ch.genre} • ${ch.listeners} active',
                          style: GoogleFonts.outfit(color: Colors.white54, fontSize: 12),
                        ),
                        trailing: Icon(
                          isSelected ? Icons.graphic_eq : Icons.play_circle_outline,
                          color: isSelected ? const Color(0xFFFF007F) : Colors.white38,
                        ),
                      ),
                    );
                  }).toList(),
                ),

              const SizedBox(height: 24),

              // Ambient Layer Mixer Sliders
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF161B22).withValues(alpha: 0.85),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '🎛️ Multi-Layer Soundscape Mixer',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildSlider('🌧️ Cyber Rain Texture', rainVolume, (v) => setState(() => rainVolume = v), const Color(0xFF00F5FF)),
                    _buildSlider('🎹 Synth Bass Warmth', synthVolume, (v) => setState(() => synthVolume = v), const Color(0xFFFF007F)),
                    _buildSlider('🌌 Solar Wind Breeze', breezeVolume, (v) => setState(() => breezeVolume = v), const Color(0xFF7000FF)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBinauralChip(String title, String tag) {
    final bool isSelected = activeBinaural == title;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => activeBinaural = isSelected ? 'None' : title),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF7000FF) : Colors.white10,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSelected ? const Color(0xFF00F5FF) : Colors.transparent),
          ),
          child: Column(
            children: [
              Text(
                title,
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
              ),
              Text(
                tag,
                style: GoogleFonts.outfit(color: isSelected ? const Color(0xFF00F5FF) : Colors.white54, fontSize: 10),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSlider(String label, double val, ValueChanged<double> onChanged, Color activeColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13)),
            Text('${(val * 100).toInt()}%', style: GoogleFonts.outfit(color: activeColor, fontWeight: FontWeight.bold)),
          ],
        ),
        Slider(
          value: val,
          activeColor: activeColor,
          inactiveColor: Colors.white12,
          onChanged: onChanged,
        ),
      ],
    );
  }
}

// Generative Custom Painter for Rain & Neon Particles
class CyberParticlePainter extends CustomPainter {
  final double progress;
  CyberParticlePainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final rand = Random(42);

    // Draw Cyber Rain Particles
    final paintRain = Paint()
      ..color = const Color(0xFF00F5FF).withValues(alpha: 0.3)
      ..strokeWidth = 1.5;

    for (int i = 0; i < 40; i++) {
      double startX = rand.nextDouble() * size.width;
      double startY = (rand.nextDouble() * size.height + progress * size.height) % size.height;
      canvas.drawLine(
        Offset(startX, startY),
        Offset(startX, startY + 15),
        paintRain,
      );
    }

    // Draw Neon Orbs
    for (int i = 0; i < 15; i++) {
      double cx = rand.nextDouble() * size.width;
      double cy = rand.nextDouble() * size.height;
      double r = 2.0 + sin(progress * 2 * pi + i) * 2.0;

      final paintOrb = Paint()
        ..color = (i % 2 == 0 ? const Color(0xFFFF007F) : const Color(0xFF7000FF)).withValues(alpha: 0.4)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4);

      canvas.drawCircle(Offset(cx, cy), r, paintOrb);
    }
  }

  @override
  bool shouldRepaint(covariant CyberParticlePainter oldDelegate) => true;
}
