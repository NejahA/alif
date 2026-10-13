import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/linear_percent_indicator.dart';
import '../services/api_service.dart';

class PetScreen extends StatefulWidget {
  final Function() onPetUpdated;
  const PetScreen({super.key, required this.onPetUpdated});

  @override
  State<PetScreen> createState() => _PetScreenState();
}

class _PetScreenState extends State<PetScreen> {
  List<AetherPet> pets = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPets();
  }

  void _loadPets() async {
    final fetched = await ApiService.fetchPets();
    if (!mounted) return;
    setState(() {
      pets = fetched;
      isLoading = false;
    });
  }

  void _feedPet(AetherPet pet) async {
    final updatedList = await ApiService.feedPet(pet.id);
    if (mounted && updatedList.isNotEmpty) {
      setState(() => pets = updatedList);
      widget.onPetUpdated();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF00F5FF),
          content: Text(
            '🌟 Fed ${pet.name}! Happiness restored (+15) & +40 XP earned!',
            style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.bold),
          ),
        ),
      );
    }
  }

  void _selectPet(AetherPet pet) async {
    final updatedList = await ApiService.selectPet(pet.id);
    if (mounted && updatedList.isNotEmpty) {
      setState(() => pets = updatedList);
      widget.onPetUpdated();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFFFF007F),
          content: Text(
            '🦊 ${pet.name} is now your active Aether Companion!',
            style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFFFF007F).withValues(alpha: 0.3),
                  const Color(0xFF161B22),
                ],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFFF007F).withValues(alpha: 0.5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.pets, size: 44, color: Color(0xFFFF007F)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Aether Companion Sanctuary',
                        style: GoogleFonts.outfit(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Nurture your cyber pet companions to unlock evolution stages & passive aura buffs!',
                        style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          if (isLoading)
            const Center(child: CircularProgressIndicator(color: Color(0xFFFF007F)))
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: pets.length,
              itemBuilder: (ctx, idx) {
                final pet = pets[idx];
                final double happyPercent = (pet.happiness / 100).clamp(0.0, 1.0);

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: pet.isSelected ? const Color(0xFF1E293B) : const Color(0xFF161B22),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: pet.isSelected ? const Color(0xFFFF007F) : Colors.white12,
                      width: pet.isSelected ? 2 : 1,
                    ),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundColor: const Color(0xFF7000FF).withValues(alpha: 0.3),
                            child: Text(pet.icon, style: const TextStyle(fontSize: 28)),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      pet.name,
                                      style: GoogleFonts.outfit(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF7000FF),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        'LVL ${pet.level}',
                                        style: GoogleFonts.outfit(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                      ),
                                    )
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '✨ Stage: ${pet.stage} • Aura: ${pet.auraBuff}',
                                  style: GoogleFonts.outfit(color: const Color(0xFF00F5FF), fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Happiness: ${pet.happiness}%', style: GoogleFonts.outfit(color: Colors.white70, fontSize: 12)),
                          Text(pet.isSelected ? 'ACTIVE COMPANION' : 'IN SANCTUARY', style: GoogleFonts.outfit(color: pet.isSelected ? const Color(0xFFFF007F) : Colors.white38, fontWeight: FontWeight.bold, fontSize: 11)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      LinearPercentIndicator(
                        lineHeight: 8,
                        percent: happyPercent,
                        backgroundColor: Colors.white10,
                        progressColor: const Color(0xFFFF007F),
                        barRadius: const Radius.circular(4),
                        padding: EdgeInsets.zero,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if (!pet.isSelected)
                            OutlinedButton(
                              style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFF00F5FF))),
                              onPressed: () => _selectPet(pet),
                              child: Text('Select Active', style: GoogleFonts.outfit(color: const Color(0xFF00F5FF), fontSize: 12)),
                            ),
                          const SizedBox(width: 10),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF007F)),
                            icon: const Icon(Icons.star, color: Colors.white, size: 16),
                            label: Text('Feed Pet (+15)', style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                            onPressed: () => _feedPet(pet),
                          )
                        ],
                      )
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
