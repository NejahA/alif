import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class AlchemyScreen extends StatefulWidget {
  final Function() onTransmuted;
  const AlchemyScreen({super.key, required this.onTransmuted});

  @override
  State<AlchemyScreen> createState() => _AlchemyScreenState();
}

class _AlchemyScreenState extends State<AlchemyScreen> {
  List<InventoryRelic> inventory = [];
  InventoryRelic? slot1;
  InventoryRelic? slot2;
  bool isCrafting = false;

  @override
  void initState() {
    super.initState();
    _loadInventory();
  }

  void _loadInventory() async {
    final fetched = await ApiService.fetchInventory();
    if (!mounted) return;
    setState(() {
      inventory = fetched;
      if (inventory.length >= 2) {
        slot1 = inventory[0];
        slot2 = inventory[1];
      }
    });
  }

  void _performTransmutation() async {
    if (slot1 == null || slot2 == null) return;
    setState(() => isCrafting = true);

    await Future.delayed(const Duration(seconds: 1));
    final mythic = await ApiService.craftAlchemyRelic(slot1!.id, slot2!.id);

    if (!mounted) return;
    setState(() => isCrafting = false);

    if (mythic != null) {
      widget.onTransmuted();
      _loadInventory();
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF161B22),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: const BorderSide(color: Color(0xFFFFB800), width: 2),
          ),
          title: Text(
            '🔮 Mythic Transmutation Success!',
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(mythic.icon, style: const TextStyle(fontSize: 54)),
              const SizedBox(height: 10),
              Text(
                mythic.name,
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: const Color(0xFFFFB800)),
              ),
              const SizedBox(height: 6),
              Text(
                mythic.description,
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFB800).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '⚡ ${mythic.statBoost} • +300 XP Gained',
                  style: GoogleFonts.outfit(color: const Color(0xFFFFB800), fontWeight: FontWeight.bold, fontSize: 12),
                ),
              )
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFFB800)),
              onPressed: () => Navigator.pop(ctx),
              child: Text('Equip Mythic Relic', style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.bold)),
            )
          ],
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
                  const Color(0xFF9D00FF).withValues(alpha: 0.3),
                  const Color(0xFF161B22),
                ],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF9D00FF).withValues(alpha: 0.5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.science, size: 44, color: Color(0xFF9D00FF)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Transmutation Alchemy Lab',
                        style: GoogleFonts.outfit(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Fuse two relic artifacts to forge ultra-rare Mythic gear!',
                        style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Dual Slot Transmutation Circle
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF161B22),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF9D00FF).withValues(alpha: 0.3)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildSlotCard('Ingredient 1', slot1),
                    const Icon(Icons.add, color: Color(0xFF9D00FF), size: 32),
                    _buildSlotCard('Ingredient 2', slot2),
                  ],
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF9D00FF),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  icon: isCrafting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Icon(Icons.auto_awesome, color: Colors.white),
                  label: Text(
                    isCrafting ? 'Transmuting Elements...' : 'Transmute Mythic Relic',
                    style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  onPressed: isCrafting ? null : _performTransmutation,
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSlotCard(String label, InventoryRelic? relic) {
    return Column(
      children: [
        Text(label, style: GoogleFonts.outfit(color: Colors.white54, fontSize: 12)),
        const SizedBox(height: 8),
        Container(
          width: 110,
          height: 110,
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF9D00FF)),
          ),
          child: relic != null
              ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(relic.icon, style: const TextStyle(fontSize: 36)),
                    const SizedBox(height: 4),
                    Text(
                      relic.name.split(' ')[0],
                      style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ],
                )
              : const Center(child: Icon(Icons.add_circle_outline, color: Colors.white38, size: 32)),
        )
      ],
    );
  }
}
