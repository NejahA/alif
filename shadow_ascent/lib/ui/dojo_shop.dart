import 'package:flutter/material.dart';
import '../game/game_state.dart';
import '../models/ninja_skin.dart';
import '../models/katana_effect.dart';

class DojoShopScreen extends StatefulWidget {
  final GameStateNotifier gameState;

  const DojoShopScreen({super.key, required this.gameState});

  @override
  State<DojoShopScreen> createState() => _DojoShopScreenState();
}

class _DojoShopScreenState extends State<DojoShopScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: const Text(
          'SHINOBI DOJO & SHOP',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Row(
              children: [
                const Icon(Icons.monetization_on, color: Color(0xFFF59E0B)),
                const SizedBox(width: 6),
                Text(
                  '${widget.gameState.coins}',
                  style: const TextStyle(
                    color: Color(0xFFFDE047),
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF38BDF8),
          labelColor: const Color(0xFF38BDF8),
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(icon: Icon(Icons.person), text: 'NINJA SKINS'),
            Tab(icon: Icon(Icons.colorize), text: 'KATANA EFFECTS'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildSkinsTab(),
          _buildKatanasTab(),
        ],
      ),
    );
  }

  Widget _buildSkinsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: NinjaSkin.allSkins.length,
      itemBuilder: (context, index) {
        final skin = NinjaSkin.allSkins[index];
        final isUnlocked = widget.gameState.unlockedSkinIds.contains(skin.id);
        final isEquipped = widget.gameState.equippedSkinId == skin.id;

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isEquipped ? skin.accentColor : Colors.white10,
              width: isEquipped ? 2.5 : 1,
            ),
            boxShadow: [
              if (isEquipped)
                BoxShadow(
                  color: skin.accentColor.withValues(alpha: 0.3),
                  blurRadius: 12,
                ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Skin Preview Circle
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: skin.primaryColor,
                    border: Border.all(color: skin.accentColor, width: 2),
                    boxShadow: [
                      BoxShadow(color: skin.glowColor.withValues(alpha: 0.5), blurRadius: 10),
                    ],
                  ),
                  child: Icon(skin.icon, color: skin.accentColor, size: 28),
                ),
                const SizedBox(width: 16),

                // Title & Description
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        skin.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        skin.title,
                        style: TextStyle(
                          color: skin.accentColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        skin.description,
                        style: const TextStyle(color: Colors.white60, fontSize: 12),
                      ),
                    ],
                  ),
                ),

                // Action Button
                if (isEquipped)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: skin.accentColor.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: skin.accentColor),
                    ),
                    child: Text(
                      'EQUIPPED',
                      style: TextStyle(
                        color: skin.accentColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  )
                else if (isUnlocked)
                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        widget.gameState.equipSkin(skin.id);
                      });
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF38BDF8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    child: const Text('EQUIP', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                  )
                else
                  ElevatedButton.icon(
                    onPressed: () {
                      setState(() {
                        widget.gameState.buySkin(skin);
                      });
                    },
                    icon: const Icon(Icons.monetization_on, size: 16, color: Color(0xFFFDE047)),
                    label: Text('${skin.cost}'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF59E0B),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildKatanasTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: KatanaEffect.allEffects.length,
      itemBuilder: (context, index) {
        final katana = KatanaEffect.allEffects[index];
        final isUnlocked = widget.gameState.unlockedKatanaIds.contains(katana.id);
        final isEquipped = widget.gameState.equippedKatanaId == katana.id;

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isEquipped ? katana.slashColor : Colors.white10,
              width: isEquipped ? 2.5 : 1,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: katana.slashColor.withValues(alpha: 0.2),
                    border: Border.all(color: katana.slashColor, width: 2),
                  ),
                  child: Icon(Icons.colorize, color: katana.slashColor, size: 26),
                ),
                const SizedBox(width: 16),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        katana.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        katana.description,
                        style: const TextStyle(color: Colors.white60, fontSize: 12),
                      ),
                    ],
                  ),
                ),

                if (isEquipped)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: katana.slashColor.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: katana.slashColor),
                    ),
                    child: Text(
                      'EQUIPPED',
                      style: TextStyle(
                        color: katana.slashColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  )
                else if (isUnlocked)
                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        widget.gameState.equipKatana(katana.id);
                      });
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF38BDF8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    child: const Text('EQUIP', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                  )
                else
                  ElevatedButton.icon(
                    onPressed: () {
                      setState(() {
                        widget.gameState.buyKatana(katana);
                      });
                    },
                    icon: const Icon(Icons.monetization_on, size: 16, color: Color(0xFFFDE047)),
                    label: Text('${katana.cost}'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF59E0B),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
