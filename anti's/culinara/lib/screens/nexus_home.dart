import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';
import 'package:culinara/widgets/chef_widgets.dart';
import 'package:culinara/widgets/timer_symphony.dart';
import 'package:culinara/widgets/taste_telemetry.dart';
import 'package:culinara/widgets/ingredient_manifest.dart';
import 'package:culinara/widgets/flame_symphony_hud.dart';
import 'package:culinara/widgets/vinotheque_hud.dart';
import 'package:culinara/widgets/crystallization_hud.dart';

class NexusHome extends ConsumerWidget {
  const NexusHome({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(chefSessionProvider);

    return Scaffold(
      backgroundColor: GourmetTheme.onyx,
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              GourmetTheme.onyx,
              GourmetTheme.onyx.withOpacity(0.95),
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                _buildChefHeader(session),
                const SizedBox(height: 8),
                _buildKitchenCall(session),
                const SizedBox(height: 24),
                Expanded(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Left Column: Mise en Place
                      SizedBox(
                        width: 300,
                        child: NexusCard(
                          scrollable: true,
                          child: IngredientManifest(),
                        ),
                      ),
                      const SizedBox(width: 24),

                      // Center Column: Brigade Command Post
                      Expanded(
                        child: NexusCard(
                          scrollable: true,
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const SectionHeader(
                                title: "BRIGADE_COMMAND_POST",
                                icon: LucideIcons.shieldCheck,
                              ),
                              const SizedBox(height: 16),
                              _buildHerbGardenHUD(),
                              const SizedBox(height: 32),
                              _buildActiveRecipeStep(session),
                              const SizedBox(height: 40),
                              // Dynamic HUD: Savoury = Flame, Sweet = Crystal
                              session.currentStep.category == PhaseCategory.sweet
                                  ? const CrystallizationHUD()
                                  : const FlameSymphonyHUD(),
                              const SizedBox(height: 48),
                              _buildSymphonyControls(ref, session),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 24),

                      // Right Column: Telemetry, Wine & Timers
                      SizedBox(
                        width: 340,
                        child: Column(
                          children: [
                            Expanded(
                              flex: 4,
                              child: NexusCard(
                                scrollable: true,
                                child: TasteTelemetryWidget(),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Expanded(
                              flex: 3,
                              child: NexusCard(
                                scrollable: true,
                                child: VinothequeHUD(),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Expanded(
                              flex: 3,
                              child: NexusCard(
                                scrollable: false,
                                child: TimerSymphony(),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // --- Kitchen Call Banner ---
  Widget _buildKitchenCall(ChefSession session) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: GourmetTheme.goldLeaf.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: GourmetTheme.goldLeaf.withOpacity(0.1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.megaphone, size: 12, color: GourmetTheme.goldLeaf.withOpacity(0.7)),
          const SizedBox(width: 12),
          Text(
            "KITCHEN_CALL: TABLE_12 — OUÏ_CHEF!",
            style: GoogleFonts.firaCode(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
              color: GourmetTheme.goldLeaf,
            ),
          ),
        ],
      ),
    );
  }

  // --- Chef Header ---
  Widget _buildChefHeader(ChefSession session) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              session.recipeName.toUpperCase(),
              style: GoogleFonts.playfairDisplay(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: GourmetTheme.parchment,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: GourmetTheme.goldLeaf.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    "MICHELIN_GUIDE_PREMIUM",
                    style: GoogleFonts.firaCode(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: GourmetTheme.goldLeaf,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  "CUISINE: ${session.chefName}",
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: GourmetTheme.parchment.withOpacity(0.4),
                  ),
                ),
              ],
            ),
          ],
        ),
        const CircleAvatar(
          radius: 20,
          backgroundColor: Colors.white10,
          child: Icon(LucideIcons.chefHat, size: 18, color: GourmetTheme.goldLeaf),
        ),
      ],
    );
  }

  // --- Herb Garden HUD ---
  Widget _buildHerbGardenHUD() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: GourmetTheme.accentSage.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: GourmetTheme.accentSage.withOpacity(0.1)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(LucideIcons.leaf, size: 12, color: GourmetTheme.accentSage),
          const SizedBox(width: 8),
          Text(
            "HERB_GARDEN: SAGE_LEVEL_OPTIMAL",
            style: GoogleFonts.inter(
              fontSize: 8,
              fontWeight: FontWeight.w800,
              letterSpacing: 1,
              color: GourmetTheme.accentSage,
            ),
          ),
        ],
      ),
    );
  }

  // --- Active Recipe Step ---
  Widget _buildActiveRecipeStep(ChefSession session) {
    final isPlating = session.currentStep.label == "DRESSAGE";

    return Column(
      children: [
        _buildStationBadge(session.currentStep.station),
        const SizedBox(height: 12),
        Text(
          "PHASE_${session.currentStep.label}",
          style: GoogleFonts.firaCode(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: GourmetTheme.goldLeaf.withOpacity(0.5),
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 16),
        if (isPlating)
          const Padding(
            padding: EdgeInsets.only(bottom: 32),
            child: PlatingCanvas(),
          ),
        Text(
          session.currentStep.description,
          textAlign: TextAlign.center,
          style: GoogleFonts.playfairDisplay(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: GourmetTheme.parchment,
            height: 1.2,
          ),
        ),
        const SizedBox(height: 16),
        Wrap(
          alignment: WrapAlignment.center,
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final tech in session.currentStep.techniques)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  border: Border.all(color: GourmetTheme.copper.withOpacity(0.3)),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  tech.toUpperCase(),
                  style: GoogleFonts.inter(
                    fontSize: 8,
                    fontWeight: FontWeight.w800,
                    color: GourmetTheme.copper,
                  ),
                ),
              ),
          ],
        ),
        if (session.currentStep.chefNotes != null) ...[
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              color: GourmetTheme.bordeaux.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: GourmetTheme.goldLeaf.withOpacity(0.1)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.scrollText, size: 14, color: GourmetTheme.goldLeaf.withOpacity(0.6)),
                const SizedBox(width: 12),
                Flexible(
                  child: Text(
                    session.currentStep.chefNotes!,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontStyle: FontStyle.italic,
                      color: GourmetTheme.parchment.withOpacity(0.6),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
        if (session.currentStep.pairingSuggestion != null) ...[
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(LucideIcons.grape, size: 12, color: GourmetTheme.goldLeaf.withOpacity(0.5)),
              const SizedBox(width: 8),
              Text(
                "PAIRING: ${session.currentStep.pairingSuggestion}",
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: GourmetTheme.goldLeaf.withOpacity(0.7),
                ),
              ),
            ],
          ),
        ],
        const SizedBox(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            for (int i = 0; i < session.steps.length; i++)
              Container(
                width: 32,
                height: 3,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  color: i == session.currentStepIndex ? GourmetTheme.goldLeaf : Colors.white10,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
          ],
        ),
      ],
    );
  }

  // --- Station Badge ---
  Widget _buildStationBadge(BrigadeStation station) {
    final label = station.name.replaceAllMapped(
      RegExp(r'([A-Z])'),
      (match) => '_${match.group(0)}'
    ).toUpperCase();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: GourmetTheme.goldLeaf.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: GourmetTheme.goldLeaf.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(LucideIcons.mapPin, size: 10, color: GourmetTheme.goldLeaf),
          const SizedBox(width: 8),
          Text(
            "STATION: $label",
            style: GoogleFonts.inter(
              fontSize: 9,
              fontWeight: FontWeight.w900,
              letterSpacing: 1,
              color: GourmetTheme.goldLeaf,
            ),
          ),
        ],
      ),
    );
  }

  // --- Navigation Controls ---
  Widget _buildSymphonyControls(WidgetRef ref, ChefSession session) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (!session.isFirstStep)
          GourmetButton(
            label: "PRÉCÉDENTE",
            onPressed: () => ref.read(chefSessionProvider.notifier).previousStep(),
            isPrimary: false,
          ),
        const SizedBox(width: 16),
        GourmetButton(
          label: session.isLastStep ? "SERVICE_TERMINÉ" : "PROCHAINE_PHASE",
          onPressed: () => ref.read(chefSessionProvider.notifier).nextStep(),
        ),
      ],
    );
  }
}

// --- Plating Canvas ---
class PlatingCanvas extends StatelessWidget {
  const PlatingCanvas({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 200,
      height: 200,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white.withOpacity(0.1), width: 2),
      ),
      child: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            _buildPlatingElement(0, -40, LucideIcons.leaf, GourmetTheme.accentSage),
            _buildPlatingElement(40, 20, LucideIcons.droplets, GourmetTheme.bordeaux),
            _buildPlatingElement(-40, 20, LucideIcons.spline, GourmetTheme.copper),
            Container(
              width: 60,
              height: 40,
              decoration: BoxDecoration(
                color: GourmetTheme.parchment.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Center(
                child: Icon(LucideIcons.beef, size: 24, color: GourmetTheme.parchment),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlatingElement(double dx, double dy, IconData icon, Color color) {
    return Transform.translate(
      offset: Offset(dx, dy),
      child: Icon(icon, size: 16, color: color.withOpacity(0.8)),
    );
  }
}
