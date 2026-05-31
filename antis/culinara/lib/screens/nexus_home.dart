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
import 'package:culinara/widgets/service_bell.dart';
import 'package:culinara/widgets/kitchen_notes.dart';
import 'package:culinara/widgets/wisdom_spotlight.dart';

class NexusHome extends ConsumerWidget {
  const NexusHome({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(chefSessionProvider);

    if (session.currentStepIndex >= session.steps.length) {
      return _buildServiceCompleteScreen(ref, session);
    }

    final settings = ref.watch(kitchenSettingsProvider);
    final clock = ref.watch(clockProvider).value ?? DateTime.now();

    return AnimatedContainer(
      duration: const Duration(milliseconds: 800),
      curve: Curves.easeInOut,
      decoration: BoxDecoration(
        color: CuisineTheme.espresso,
        gradient: LinearGradient(
          colors: [
            CuisineTheme.espresso,
            session.stationColor.withValues(alpha: settings.immersiveMode ? 0.08 : 0.03),
            CuisineTheme.espresso,
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isMobile = constraints.maxWidth < 900;
            return Column(
              children: [
                _buildExecutiveHeader(ref, session, settings, clock, isMobile),
                const SizedBox(height: 8),
                _buildKitchenCall(session),
                const SizedBox(height: 24),
                Expanded(
                  child: isMobile
                      ? _buildMobileLayout(session, settings)
                      : _buildWidescreenLayout(session, settings),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildWidescreenLayout(ChefSession session, KitchenSettings settings) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (!settings.immersiveMode) ...[
          // Left Column: Mise en Place
          Flexible(
            flex: 3,
            child: NexusCard(
              scrollable: false,
              child: IngredientManifest(),
            ),
          ),
          const SizedBox(width: 24),
        ],

        // Center Column: Today's Menu
        Expanded(
          flex: settings.immersiveMode ? 1 : 5,
          child: NexusCard(
            scrollable: true,
            padding: const EdgeInsets.all(32),
            child: _buildMainCommandCenter(session, settings),
          ),
        ),

        if (!settings.immersiveMode) ...[
          const SizedBox(width: 24),
          // Right Column: Telemetry, Wine & Timers
          Flexible(
            flex: 4,
            child: Column(
              children: [
                const WisdomSpotlight(),
                const SizedBox(height: 16),
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
      ],
    );
  }

  Widget _buildMobileLayout(ChefSession session, KitchenSettings settings) {
    return SingleChildScrollView(
      child: Column(
        children: [
          // Main Command takes priority on mobile
          NexusCard(
            scrollable: false, // Scroll handled by parent
            padding: const EdgeInsets.all(24),
            child: _buildMainCommandCenter(session, settings),
          ),
          const SizedBox(height: 24),
          const WisdomSpotlight(),
          if (!settings.immersiveMode) ...[
            const SizedBox(height: 24),
            // Mise en Place
            NexusCard(
              scrollable: false,
              child: IngredientManifest(),
            ),
            const SizedBox(height: 24),
            // Telemetry
            NexusCard(
              scrollable: false,
              child: TasteTelemetryWidget(),
            ),
            const SizedBox(height: 24),
            // Wine
            NexusCard(
              scrollable: false,
              child: VinothequeHUD(),
            ),
            const SizedBox(height: 24),
            // Timers
            NexusCard(
              scrollable: false,
              child: TimerSymphony(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMainCommandCenter(ChefSession session, KitchenSettings settings) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SectionHeader(
          title: settings.immersiveMode ? "IMMERSIVE COMMAND" : "Today's Kitchen",
          icon: LucideIcons.chefHat,
        ),
        const SizedBox(height: 16),
        if (!settings.immersiveMode) ...[
          _buildFreshPicksHUD(),
          const SizedBox(height: 32),
        ],
        _buildActiveRecipeStep(session, settings),
        const SizedBox(height: 32),
        const KitchenNotes(),
        const SizedBox(height: 32),
        _buildNutritionHUD(session),
        const SizedBox(height: 40),
        // Dynamic HUD: Savoury = Flame, Sweet = Crystal
        session.currentStep.category == PhaseCategory.sweet
            ? const CrystallizationHUD()
            : const FlameSymphonyHUD(),
        const SizedBox(height: 48),
        _buildSymphonyControls(session),
      ],
    );
  }

  // --- Kitchen Call Banner ---
  Widget _buildKitchenCall(ChefSession session) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: CuisineTheme.saffron.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: CuisineTheme.saffron.withValues(alpha: 0.1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.megaphone, size: 12, color: CuisineTheme.saffron.withValues(alpha: 0.7)),
          const SizedBox(width: 12),
          Text(
            "SERVICE IN PROGRESS — OUÏ CHEF!",
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
              color: CuisineTheme.saffron,
            ),
          ),
        ],
      ),
    );
  }

  // --- Executive Header (Clock + Badges) ---
  Widget _buildExecutiveHeader(WidgetRef ref, ChefSession session, KitchenSettings settings, DateTime clock, bool isMobile) {
    final timeStr = "${clock.hour.toString().padLeft(2, '0')}:${clock.minute.toString().padLeft(2, '0')}:${clock.second.toString().padLeft(2, '0')}";

    if (isMobile) {
      return Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                session.recipeName,
                style: GoogleFonts.playfairDisplay(
                    fontSize: 20, fontWeight: FontWeight.w900, color: CuisineTheme.cream),
              ),
              ServiceBellWidget(),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                timeStr,
                style: GoogleFonts.jetBrainsMono(
                    fontSize: 12, fontWeight: FontWeight.w700, color: session.stationColor),
              ),
              Row(
                children: [
                  _buildToggle(
                    label: settings.unitSystem == UnitSystem.metric ? "M" : "I",
                    icon: LucideIcons.layers,
                    onTap: () => ref.read(kitchenSettingsProvider.notifier).toggleUnits(),
                  ),
                  const SizedBox(width: 8),
                  _buildToggle(
                    label: settings.immersiveMode ? "IMM" : "ZEN",
                    icon: settings.immersiveMode ? LucideIcons.maximize2 : LucideIcons.minimize2,
                    active: settings.immersiveMode,
                    onTap: () => ref.read(kitchenSettingsProvider.notifier).toggleImmersive(),
                  ),
                ],
              ),
            ],
          ),
        ],
      );
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  session.recipeName,
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: CuisineTheme.cream,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(width: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: CuisineTheme.espresso,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: session.stationColor.withValues(alpha: 0.5)),
                  ),
                  child: Text(
                    timeStr,
                    style: GoogleFonts.jetBrainsMono(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: session.stationColor,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    session.chefTip,
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.5,
                      color: CuisineTheme.saffron.withValues(alpha: 0.6),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                for (final badge in session.badges) ...[
                  _buildBadge(badge),
                  const SizedBox(width: 8),
                ],
                const SizedBox(width: 12),
                Text(
                  "Lead: ${session.chefName}",
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: CuisineTheme.cream.withValues(alpha: 0.4),
                  ),
                ),
              ],
            ),
          ],
        ),
        Row(
          children: [
            _buildToggle(
              label: settings.unitSystem == UnitSystem.metric ? "METRIC" : "IMPERIAL",
              icon: LucideIcons.layers,
              onTap: () => ref.read(kitchenSettingsProvider.notifier).toggleUnits(),
            ),
            const SizedBox(width: 12),
            _buildToggle(
              label: settings.immersiveMode ? "IMMERSIVE" : "ZEN MODE",
              icon: settings.immersiveMode ? LucideIcons.maximize2 : LucideIcons.minimize2,
              onTap: () => ref.read(kitchenSettingsProvider.notifier).toggleImmersive(),
              active: settings.immersiveMode,
            ),
            const SizedBox(width: 24),
            ServiceBellWidget(),
          ],
        ),
      ],
    );
  }

  Widget _buildBadge(String type) {
    IconData icon;
    Color color;

    switch (type) {
      case "MICHELIN_PRECISION":
        icon = LucideIcons.target;
        color = CuisineTheme.saffron;
        break;
      case "SAUCIER_LEAD":
        icon = LucideIcons.flame;
        color = CuisineTheme.terracotta;
        break;
      default:
        icon = LucideIcons.award;
        color = CuisineTheme.cream;
    }

    return Tooltip(
      message: type.replaceAll('_', ' '),
      child: Icon(icon, size: 14, color: color.withValues(alpha: 0.8)),
    );
  }

  Widget _buildToggle({
    required String label,
    required IconData icon,
    required VoidCallback onTap,
    bool active = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: active ? CuisineTheme.terracotta.withValues(alpha: 0.2) : CuisineTheme.darkWalnut.withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: active ? CuisineTheme.terracotta.withValues(alpha: 0.4) : CuisineTheme.cream.withValues(alpha: 0.05),
          ),
        ),
        child: Row(
          children: [
            Icon(icon, size: 10, color: active ? CuisineTheme.terracotta : CuisineTheme.cream.withValues(alpha: 0.4)),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 9,
                fontWeight: FontWeight.w800,
                color: active ? CuisineTheme.cream : CuisineTheme.cream.withValues(alpha: 0.4),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- Fresh Picks HUD ---
  Widget _buildFreshPicksHUD() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: CuisineTheme.olive.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: CuisineTheme.olive.withValues(alpha: 0.12)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(LucideIcons.leaf, size: 12, color: CuisineTheme.olive),
          const SizedBox(width: 8),
          Text(
            "Fresh herbs ready • Sage at peak freshness",
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: CuisineTheme.olive,
            ),
          ),
        ],
      ),
    );
  }

  // --- Active Recipe Step ---
  // --- Active Recipe Step ---
  Widget _buildActiveRecipeStep(ChefSession session, KitchenSettings settings) {
    final isPlating = session.currentStep.label == "DRESSAGE";

    return Column(
      children: [
        _buildStationBadge(session.currentStep.station),
        const SizedBox(height: 12),
        Text(
          session.currentStep.label.replaceAll('_', ' '),
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: CuisineTheme.saffron.withValues(alpha: 0.5),
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 16),
        if (isPlating)
          Padding(
            padding: EdgeInsets.only(bottom: settings.immersiveMode ? 48 : 32),
            child: const PlatingCanvas(),
          ),
        Text(
          _getFormattedDescription(session.currentStep.description, settings),
          textAlign: TextAlign.center,
          style: GoogleFonts.playfairDisplay(
            fontSize: settings.immersiveMode ? 36 : 28,
            fontWeight: FontWeight.w700,
            color: CuisineTheme.cream,
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
              Tooltip(
                message: tech == "Saisir" ? "High-heat searing to create a Maillard crust." : "Elite culinary technique.",
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: CuisineTheme.terracotta.withValues(alpha: 0.08),
                    border: Border.all(color: CuisineTheme.terracotta.withValues(alpha: 0.2)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    tech.toUpperCase(),
                    style: GoogleFonts.inter(
                      fontSize: 8,
                      fontWeight: FontWeight.w800,
                      color: CuisineTheme.terracotta,
                    ),
                  ),
                ),
              ),
          ],
        ),
        if (session.currentStep.chefNotes != null &&
            !settings.immersiveMode) ...[
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              color: CuisineTheme.butterscotch.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                  color: CuisineTheme.saffron.withValues(alpha: 0.1)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.scrollText,
                    size: 14, color: CuisineTheme.saffron.withValues(alpha: 0.6)),
                const SizedBox(width: 12),
                Flexible(
                  child: Text(
                    session.currentStep.chefNotes!,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontStyle: FontStyle.italic,
                      color: CuisineTheme.cream.withValues(alpha: 0.6),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
        if (session.currentStep.pairingSuggestion != null &&
            !settings.immersiveMode) ...[
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(LucideIcons.grape,
                  size: 12, color: CuisineTheme.saffron.withValues(alpha: 0.5)),
              const SizedBox(width: 8),
              Text(
                "Pairs with: ${session.currentStep.pairingSuggestion}",
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: CuisineTheme.saffron.withValues(alpha: 0.7),
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
                width: settings.immersiveMode ? 40 : 32,
                height: 3,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  color: i == session.currentStepIndex
                      ? CuisineTheme.saffron
                      : CuisineTheme.cream.withValues(alpha: 0.08),
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
      (match) => ' ${match.group(0)}'
    ).trim();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
      decoration: BoxDecoration(
        color: CuisineTheme.saffron.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: CuisineTheme.saffron.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(LucideIcons.mapPin, size: 10, color: CuisineTheme.saffron),
          const SizedBox(width: 8),
          Text(
            "Station: $label",
            style: GoogleFonts.inter(
              fontSize: 9,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
              color: CuisineTheme.saffron,
            ),
          ),
        ],
      ),
    );
  }

  // --- Navigation Controls ---
  Widget _buildSymphonyControls(ChefSession session) {
    return Consumer(
      builder: (context, ref, child) => Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (!session.isFirstStep)
            GourmetButton(
              label: "Previous",
              onPressed: () => ref.read(chefSessionProvider.notifier).previousStep(),
              isPrimary: false,
              icon: LucideIcons.chevronLeft,
            ),
          const SizedBox(width: 16),
          GourmetButton(
            label: session.isLastStep ? "Complete Service" : "Next Step",
            onPressed: () {
              if (session.isLastStep) {
                ref.read(chefSessionProvider.notifier).completeService();
              } else {
                ref.read(chefSessionProvider.notifier).nextStep();
              }
            },
            icon: session.isLastStep ? LucideIcons.checkCircle : LucideIcons.chevronRight,
          ),
        ],
      ),
    );
  }
  Widget _buildServiceCompleteScreen(WidgetRef ref, ChefSession session) {
    return Container(
      decoration: BoxDecoration(gradient: CuisineTheme.kitchenWarmth),
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: NexusCard(
            padding: const EdgeInsets.all(48),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(LucideIcons.award,
                    size: 60, color: CuisineTheme.saffron),
                const SizedBox(height: 24),
                Text(
                  "SERVICE COMPLETE",
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    color: CuisineTheme.cream,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  "Chef, the brigade has performed brilliantly.",
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: CuisineTheme.cream.withValues(alpha: 0.5),
                  ),
                ),
                const SizedBox(height: 40),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  decoration: BoxDecoration(
                    color: CuisineTheme.terracotta.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      _buildSummaryRow("Recipe", session.recipeName),
                      _buildSummaryRow("Brigade Lead", session.chefName),
                      _buildSummaryRow("Status", "Michelin Star Worthy"),
                    ],
                  ),
                ),
                const SizedBox(height: 48),
                GourmetButton(
                  label: "Return to Nexus",
                  onPressed: () {
                    // Reset to first step
                    ref.read(chefSessionProvider.notifier).loadRecipe(
                          RecipeCard(
                            id: "1",
                            name: session.recipeName,
                            subtitle: "Signature Service",
                            difficulty: RecipeDifficulty.executive,
                            cuisine: CuisineType.french,
                            servings: 2,
                            prepMinutes: 45,
                            gradientColors: [
                              CuisineTheme.terracotta,
                              CuisineTheme.espresso
                            ],
                            steps: session.steps,
                            calories: 850,
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
  String _getFormattedDescription(String desc, KitchenSettings settings) {
    if (settings.unitSystem == UnitSystem.metric) return desc;
    // Simple heuristic conversion for demo
    String newDesc = desc;
    // Substitute 120s -> 2m
    newDesc = newDesc.replaceAll("120s", "2 mins");
    newDesc = newDesc.replaceAll("300s", "5 mins");
    newDesc = newDesc.replaceAll("18°C", "64°F");
    // Substitute g -> oz (rough)
    newDesc = newDesc.replaceAllMapped(RegExp(r"(\d+)g"), (match) {
      final grams = int.parse(match.group(1)!);
      final oz = (grams / 28.35).toStringAsFixed(1);
      return "${oz}oz";
    });

    return newDesc;
  }
  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            "$label: ",
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: CuisineTheme.saffron.withValues(alpha: 0.5),
            ),
          ),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: CuisineTheme.cream,
            ),
          ),
        ],
      ),
    );
  }
  Widget _buildNutritionHUD(ChefSession session) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: CuisineTheme.espresso.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: CuisineTheme.cream.withValues(alpha: 0.05)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.activity, size: 12, color: CuisineTheme.saffron),
              const SizedBox(width: 8),
              Text(
                "NUTRITION TELEMETRY",
                style: GoogleFonts.inter(
                  fontSize: 9,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                  color: CuisineTheme.saffron.withValues(alpha: 0.7),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildMacroItem("CALORIES", "${session.calories}kcal", LucideIcons.flame),
              _buildMacroItem("PROTEIN", "${session.protein}g", LucideIcons.beef),
              _buildMacroItem("FAT", "${session.fat}g", LucideIcons.droplets),
              _buildMacroItem("CARBS", "${session.carbs}g", LucideIcons.wheat),
            ],
          ),
        ],
      ),
    );
  }
  Widget _buildMacroItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 14, color: CuisineTheme.cream.withValues(alpha: 0.3)),
        const SizedBox(height: 8),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: CuisineTheme.cream,
          ),
        ),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 8,
            fontWeight: FontWeight.w900,
            color: CuisineTheme.cream.withValues(alpha: 0.3),
          ),
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
        border: Border.all(color: CuisineTheme.cream.withValues(alpha: 0.08), width: 2),
      ),
      child: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            _buildPlatingElement(0, -40, LucideIcons.leaf, CuisineTheme.olive),
            _buildPlatingElement(40, 20, LucideIcons.droplets, CuisineTheme.paprika),
            _buildPlatingElement(-40, 20, LucideIcons.spline, CuisineTheme.terracotta),
            Container(
              width: 60,
              height: 40,
              decoration: BoxDecoration(
                color: CuisineTheme.cream.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Center(
                child: Icon(LucideIcons.beef, size: 24, color: CuisineTheme.cream),
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
      child: Icon(icon, size: 16, color: color.withValues(alpha: 0.8)),
    );
  }
}
