import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/colonye_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';
import '../widgets/audio_visualizer_painter.dart';

class SoundscapeSanctuaryScreen extends StatefulWidget {
  const SoundscapeSanctuaryScreen({super.key});

  @override
  State<SoundscapeSanctuaryScreen> createState() => _SoundscapeSanctuaryScreenState();
}

class _SoundscapeSanctuaryScreenState extends State<SoundscapeSanctuaryScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _visualizerController;
  String _selectedFrequency = "432Hz Neural Harmony";
  int _timerMinutes = 30;

  final List<String> _frequencies = [
    "432Hz Neural Harmony",
    "528Hz DNA Repair",
    "Theta 6Hz Deep State",
    "Delta 2Hz Cosmic Sleep",
  ];

  @override
  void initState() {
    super.initState();
    _visualizerController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _visualizerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ColonyeProvider>(context);
    final isAnyPlaying = provider.soundscapes.any((s) => s.isPlaying);

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
                  'Soundscape Sanctuary',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 26),
                ),
                Text(
                  'Layer ambient frequencies & atmospheric drones',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),

                const SizedBox(height: 20),

                // Main Audio Visualizer Hero Box
                GlassCard(
                  borderRadius: 24,
                  borderColor: isAnyPlaying ? AppTheme.quantumCyan : AppTheme.glassBorder,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                isAnyPlaying ? Icons.graphic_eq_rounded : Icons.volume_off_rounded,
                                color: isAnyPlaying ? AppTheme.quantumCyan : AppTheme.textSecondary,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                isAnyPlaying ? 'RESONATING ACTIVE' : 'SANCTUARY PAUSED',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: isAnyPlaying ? AppTheme.quantumCyan : AppTheme.textSecondary,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1.2,
                                      fontSize: 11,
                                    ),
                              ),
                            ],
                          ),
                          // Frequency Selector Chip
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.nebulaViolet.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.nebulaViolet.withOpacity(0.5)),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _selectedFrequency,
                                isDense: true,
                                dropdownColor: AppTheme.deepSpace,
                                icon: const Icon(Icons.arrow_drop_down_rounded, color: AppTheme.nebulaViolet),
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: Colors.white,
                                      fontSize: 12,
                                    ),
                                items: _frequencies.map((freq) {
                                  return DropdownMenuItem(
                                    value: freq,
                                    child: Text(freq),
                                  );
                                }).toList(),
                                onChanged: (val) {
                                  if (val != null) setState(() => _selectedFrequency = val);
                                },
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Animated Spectrum Waveform
                      SizedBox(
                        height: 90,
                        width: double.infinity,
                        child: AnimatedBuilder(
                          animation: _visualizerController,
                          builder: (context, child) {
                            return CustomPaint(
                              painter: AudioVisualizerPainter(
                                animationValue: _visualizerController.value,
                                primaryColor: AppTheme.quantumCyan,
                                secondaryColor: AppTheme.nebulaViolet,
                                isPlaying: isAnyPlaying,
                              ),
                            );
                          },
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Sanctuary Timer & Global Controls
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.timer_outlined, color: AppTheme.textSecondary, size: 18),
                              const SizedBox(width: 6),
                              Text(
                                'Sleep Timer: $_timerMinutes min',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 12),
                              ),
                            ],
                          ),
                          Row(
                            children: [15, 30, 60].map((mins) {
                              final isSel = _timerMinutes == mins;
                              return GestureDetector(
                                onTap: () => setState(() => _timerMinutes = mins),
                                child: Container(
                                  margin: const EdgeInsets.only(left: 6),
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isSel ? AppTheme.quantumCyan : Colors.white10,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '${mins}m',
                                    style: TextStyle(
                                      color: isSel ? Colors.black : Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                Text(
                  'Ambient Layers',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 12),

                // Sound Track Cards
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: provider.soundscapes.length,
                  itemBuilder: (context, index) {
                    final sound = provider.soundscapes[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: GlassCard(
                        borderRadius: 18,
                        borderColor: sound.isPlaying ? sound.accentColor : AppTheme.glassBorder,
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: sound.accentColor.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: Icon(sound.icon, color: sound.accentColor, size: 24),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        sound.name,
                                        style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 15),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        sound.description,
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 11),
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  onPressed: () => provider.toggleSoundscapePlay(sound.id),
                                  icon: Icon(
                                    sound.isPlaying ? Icons.pause_circle_filled_rounded : Icons.play_circle_fill_rounded,
                                    color: sound.isPlaying ? sound.accentColor : Colors.white54,
                                    size: 38,
                                  ),
                                ),
                              ],
                            ),

                            if (sound.isPlaying) ...[
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.volume_down_rounded, color: AppTheme.textSecondary, size: 16),
                                  Expanded(
                                    child: SliderTheme(
                                      data: SliderThemeData(
                                        activeTrackColor: sound.accentColor,
                                        inactiveTrackColor: Colors.white12,
                                        thumbColor: Colors.white,
                                        trackHeight: 3.0,
                                        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                                      ),
                                      child: Slider(
                                        value: sound.volume,
                                        onChanged: (val) => provider.updateSoundscapeVolume(sound.id, val),
                                      ),
                                    ),
                                  ),
                                  const Icon(Icons.volume_up_rounded, color: AppTheme.textSecondary, size: 16),
                                ],
                              ),
                            ],
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
