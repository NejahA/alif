import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/opiate_theme.dart';
import '../widgets/islamic_pattern_background.dart';

class AudioDownloadsScreen extends StatefulWidget {
  const AudioDownloadsScreen({super.key});

  @override
  State<AudioDownloadsScreen> createState() => _AudioDownloadsScreenState();
}

class _AudioDownloadsScreenState extends State<AudioDownloadsScreen> {
  String _selectedBitrate = '128 kbps (High Clarity)';
  final double _usedStorageMb = 142.5;

  final List<Map<String, dynamic>> _downloadedSurahs = [
    {'number': 1, 'name': 'Al-Fatihah', 'size': '4.2 MB', 'reciter': 'Mishary Alafasy'},
    {'number': 36, 'name': 'Ya-Sin', 'size': '28.6 MB', 'reciter': 'Abdul Rahman Al-Sudais'},
    {'number': 55, 'name': 'Ar-Rahman', 'size': '18.4 MB', 'reciter': 'Maher Al-Muaiqly'},
    {'number': 67, 'name': 'Al-Mulk', 'size': '12.1 MB', 'reciter': 'Saad Al-Ghamdi'},
  ];

  @override
  Widget build(BuildContext context) {
    return IslamicPatternBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, color: OpiateTheme.sacredGold),
            onPressed: () => Navigator.pop(context),
          ),
          title: Text(
            'OFFLINE AUDIO & DOWNLOADS',
            style: GoogleFonts.cinzel(
              color: OpiateTheme.sacredGold,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Storage Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: OpiateTheme.deepEmerald,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: OpiateTheme.sacredGold, width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: OpiateTheme.sacredGold.withValues(alpha: 0.15),
                      blurRadius: 18,
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'OFFLINE AUDIO STORAGE',
                          style: GoogleFonts.cinzel(
                            color: OpiateTheme.sacredGold,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Icon(Icons.download_done, color: OpiateTheme.sacredGold, size: 20),
                      ],
                    ),
                    const SizedBox(height: 12),

                    Text(
                      '${_usedStorageMb.toStringAsFixed(1)} MB',
                      style: GoogleFonts.orbitron(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),

                    Text(
                      '${_downloadedSurahs.length} SURAHS SAVED FOR OFFLINE RECITATION',
                      style: GoogleFonts.orbitron(color: OpiateTheme.textMuted, fontSize: 9),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms),

              const SizedBox(height: 20),

              // Audio Quality Selector Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'AUDIO DOWNLOAD QUALITY',
                        style: GoogleFonts.cinzel(
                          color: OpiateTheme.sacredGold,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 10),

                      ...[
                        '64 kbps (Compact Storage)',
                        '128 kbps (High Clarity)',
                        '192 kbps (Ultra Studio Master)',
                      ].map((rate) {
                        final isSelected = _selectedBitrate == rate;
                        return InkWell(
                          onTap: () => setState(() => _selectedBitrate = rate),
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? OpiateTheme.sacredGold.withValues(alpha: 0.12)
                                  : OpiateTheme.slateCard,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isSelected ? OpiateTheme.sacredGold : OpiateTheme.borderGold,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                                  color: isSelected ? OpiateTheme.sacredGold : Colors.white38,
                                  size: 18,
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  rate,
                                  style: GoogleFonts.cinzel(
                                    color: isSelected ? OpiateTheme.sacredGold : Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Downloaded Surahs List
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _downloadedSurahs.length,
                itemBuilder: (context, index) {
                  final item = _downloadedSurahs[index];

                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: OpiateTheme.slateCard,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: OpiateTheme.borderGold),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.offline_pin, color: OpiateTheme.sacredGold, size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${item['number']}. ${item['name']}',
                                style: GoogleFonts.cinzel(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                '${item['reciter']} • ${item['size']}',
                                style: GoogleFonts.outfit(color: OpiateTheme.textMuted, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline, color: Colors.white38),
                          onPressed: () {
                            setState(() {
                              _downloadedSurahs.removeAt(index);
                            });
                          },
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
