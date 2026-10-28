import 'package:flutter/material.dart';
import '../models/soundscape.dart';
import '../services/jungle_state.dart';
import '../theme/jungle_theme.dart';
import '../widgets/audio_visualizer.dart';

class SoundscapeScreen extends StatelessWidget {
  final JungleState state;

  const SoundscapeScreen({
    super.key,
    required this.state,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      children: [
        // Master Audio Control Card
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            color: JungleColors.deepCanopy,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(
              color: state.isPlayingSoundscape
                  ? JungleColors.emerald
                  : JungleColors.foliageBorder,
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: (state.isPlayingSoundscape ? JungleColors.emerald : Colors.black)
                    .withOpacity(0.25),
                blurRadius: 25,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: state.isPlayingSoundscape
                                    ? JungleColors.neonJade
                                    : JungleColors.textSubtle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              state.isPlayingSoundscape ? 'LIVE RESONANCE' : 'AUDIO STANDBY',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.2,
                                color: state.isPlayingSoundscape
                                    ? JungleColors.neonJade
                                    : JungleColors.textSubtle,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Rainforest Acoustic Lab',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: JungleColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Procedural multi-track biophilic sound synthesis',
                          style: TextStyle(
                            fontSize: 12,
                            color: JungleColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Master Play/Stop Button
                  GestureDetector(
                    onTap: () => state.toggleSoundscape(),
                    child: Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: state.isPlayingSoundscape
                              ? [JungleColors.emerald, JungleColors.neonJade]
                              : [JungleColors.foliageSurface, JungleColors.understory],
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: (state.isPlayingSoundscape ? JungleColors.emerald : Colors.transparent)
                                .withOpacity(0.5),
                            blurRadius: 18,
                          ),
                        ],
                      ),
                      child: Icon(
                        state.isPlayingSoundscape
                            ? Icons.pause_rounded
                            : Icons.play_arrow_rounded,
                        color: state.isPlayingSoundscape ? JungleColors.abyss : JungleColors.textPrimary,
                        size: 36,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Reactive visualizer
              AudioVisualizer(
                isPlaying: state.isPlayingSoundscape,
                height: 44,
                color: JungleColors.neonJade,
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Quick Sound FX Triggers
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => state.triggerBowlChime(),
                icon: const Icon(Icons.self_improvement_rounded, size: 18),
                label: const Text('Tibetan Bowl'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: JungleColors.understory,
                  foregroundColor: JungleColors.textPrimary,
                  side: const BorderSide(color: JungleColors.foliageBorder),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => state.triggerBirdChirp(),
                icon: const Icon(Icons.music_note_rounded, size: 18),
                label: const Text('Canopy Chirp'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: JungleColors.understory,
                  foregroundColor: JungleColors.textPrimary,
                  side: const BorderSide(color: JungleColors.foliageBorder),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Presets Section
        Row(
          children: const [
            Icon(Icons.tune_rounded, size: 16, color: JungleColors.neonJade),
            SizedBox(width: 6),
            Text(
              'BIOME PRESETS',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
                color: JungleColors.textMuted,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.5,
          ),
          itemCount: JungleAudioPresets.presets.length,
          itemBuilder: (context, index) {
            final preset = JungleAudioPresets.presets[index];
            return Container(
              decoration: BoxDecoration(
                color: JungleColors.deepCanopy,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: JungleColors.foliageBorder),
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(18),
                  onTap: () {
                    state.applyPreset(preset);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        behavior: SnackBarBehavior.floating,
                        backgroundColor: JungleColors.foliageSurface,
                        duration: const Duration(seconds: 1),
                        content: Text(
                          '🌿 Loaded preset: ${preset.name}',
                          style: const TextStyle(color: JungleColors.textPrimary),
                        ),
                      ),
                    );
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(preset.icon, style: const TextStyle(fontSize: 22)),
                        const SizedBox(height: 4),
                        Text(
                          preset.name,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: JungleColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          'Tap to load',
                          style: TextStyle(
                            fontSize: 11,
                            color: JungleColors.neonJade.withOpacity(0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 24),

        // Channel Volume Sliders
        Row(
          children: const [
            Icon(Icons.tune_rounded, size: 16, color: JungleColors.neonJade),
            SizedBox(width: 6),
            Text(
              'INDIVIDUAL CHANNELS',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
                color: JungleColors.textMuted,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: state.channels.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final ch = state.channels[index];
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: JungleColors.deepCanopy,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: JungleColors.foliageBorder),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: ch.accentColor.withOpacity(0.18),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(ch.icon, color: ch.accentColor, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              ch.title,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: JungleColors.textPrimary,
                              ),
                            ),
                            Text(
                              ch.subtitle,
                              style: const TextStyle(
                                fontSize: 11,
                                color: JungleColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => state.toggleMute(ch.id),
                        icon: Icon(
                          ch.isMuted ? Icons.volume_off_rounded : Icons.volume_up_rounded,
                          color: ch.isMuted ? JungleColors.textSubtle : ch.accentColor,
                          size: 20,
                        ),
                      ),
                      Text(
                        '${(ch.effectiveVolume * 100).toInt()}%',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: ch.isMuted ? JungleColors.textSubtle : JungleColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: ch.accentColor,
                      inactiveTrackColor: JungleColors.abyss,
                      thumbColor: ch.accentColor,
                      overlayColor: ch.accentColor.withOpacity(0.2),
                      trackHeight: 6,
                      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
                    ),
                    child: Slider(
                      value: ch.effectiveVolume,
                      onChanged: (newVal) => state.setChannelVolume(ch.id, newVal),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
