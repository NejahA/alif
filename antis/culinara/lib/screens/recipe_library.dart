import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';

// ════════════════════════════════════════════
// Recipe Library Data
// ════════════════════════════════════════════
final List<RecipeCard> recipeLibraryData = [
  RecipeCard(
    id: 'wagyu_symphony',
    name: "Wagyu Symphony",
    subtitle: "Espresso Reduction & Black Truffle",
    difficulty: RecipeDifficulty.executive,
    cuisine: CuisineType.french,
    servings: 2,
    prepMinutes: 45,
    calories: 680,
    gradientColors: [
      const Color(0xFF8B2E1C),
      const Color(0xFF2A1F1A),
    ],
    steps: [
      RecipeStep(
        label: "LE_SAISIR",
        description: "Sear Wagyu for 120s at high precision.",
        station: BrigadeStation.saucier,
        chefNotes: "Ensure the copper sautoir is shimmering.",
        techniques: ["Saisir", "Maillard Reaction"],
        pairingSuggestion: "Vintage Bordeaux, 2015",
        wineInfo: WineMetadata(
          label: "Chateau Margaux",
          vintage: "2015",
          optimalTemp: "18°C",
          tastingNote: "Deep ruby with notes of blackcurrant, cedar, and violets.",
          decantProgress: 0.8,
        ),
      ),
      RecipeStep(
        label: "DEGLACER",
        description: "Deglaze with Espresso reduction & aromatics.",
        station: BrigadeStation.saucier,
        techniques: ["Deglacer", "Reduction"],
      ),
      RecipeStep(
        label: "DRESSAGE",
        description: "Shave black truffle & plate with fresh sage.",
        station: BrigadeStation.chefDeCuisine,
        techniques: ["Dressage", "Tuber Melanosporum Shaving"],
      ),
    ],
  ),
  RecipeCard(
    id: 'bouillabaisse_royale',
    name: "Bouillabaisse Royale",
    subtitle: "Provençal Seafood Symphony",
    difficulty: RecipeDifficulty.souschef,
    cuisine: CuisineType.french,
    servings: 4,
    prepMinutes: 90,
    calories: 520,
    gradientColors: [
      const Color(0xFF1A3A5C),
      const Color(0xFF0D1B2A),
    ],
    steps: [
      RecipeStep(
        label: "FOND_DE_MER",
        description: "Build aromatic fish stock with saffron & fennel.",
        station: BrigadeStation.poissonnier,
        chefNotes: "Use whole fish carcasses for maximum extraction.",
        techniques: ["Nage", "Infusion"],
      ),
      RecipeStep(
        label: "ASSEMBLAGE",
        description: "Layer shellfish by density — lobster first, mussels last.",
        station: BrigadeStation.poissonnier,
        techniques: ["Pocher", "Timing Orchestration"],
        pairingSuggestion: "Côtes de Provence Rosé",
      ),
      RecipeStep(
        label: "ROUILLE",
        description: "Prepare saffron-garlic emulsion with hand-ground Espelette.",
        station: BrigadeStation.gardeManger,
        techniques: ["Emulsification", "Mortar Work"],
      ),
    ],
  ),
  RecipeCard(
    id: 'yuzu_tart',
    name: "Yuzu Crystalline Tart",
    subtitle: "Japanese-French Pâtisserie Fusion",
    difficulty: RecipeDifficulty.executive,
    cuisine: CuisineType.fusion,
    servings: 8,
    prepMinutes: 120,
    calories: 340,
    gradientColors: [
      const Color(0xFFD4A760),
      const Color(0xFF4A3500),
    ],
    steps: [
      RecipeStep(
        label: "PÂTE_SUCRÉE",
        description: "Prepare almond sablé shell with vanilla bean specks.",
        station: BrigadeStation.patissier,
        category: PhaseCategory.sweet,
        techniques: ["Fraiser", "Blind Baking"],
      ),
      RecipeStep(
        label: "CRÈME_YUZU",
        description: "Cook yuzu curd to 82°C with whole butter monte.",
        station: BrigadeStation.patissier,
        category: PhaseCategory.sweet,
        chefNotes: "Do not exceed 85°C — curd will break.",
        techniques: ["Tempering", "Curd Science"],
      ),
      RecipeStep(
        label: "SUCRE_SOUFFLÉ",
        description: "Pull sugar dome with gold leaf integration.",
        station: BrigadeStation.patissier,
        category: PhaseCategory.sweet,
        techniques: ["Sugar Pulling", "Glass Work"],
      ),
    ],
  ),
  RecipeCard(
    id: 'risotto_nero',
    name: "Risotto al Nero di Seppia",
    subtitle: "Venetian Squid Ink Mastery",
    difficulty: RecipeDifficulty.commis,
    cuisine: CuisineType.italian,
    servings: 4,
    prepMinutes: 35,
    calories: 450,
    gradientColors: [
      const Color(0xFF1C1C1E),
      const Color(0xFF2D2D2D),
    ],
    steps: [
      RecipeStep(
        label: "TOSTATURA",
        description: "Toast Carnaroli rice until translucent edges appear.",
        station: BrigadeStation.entremetier,
        techniques: ["Tostatura", "Fond Building"],
      ),
      RecipeStep(
        label: "MANTECATURA",
        description: "Fold in cold butter and Parmigiano for creamy emulsion.",
        station: BrigadeStation.entremetier,
        chefNotes: "Off heat — the residual energy does the work.",
        techniques: ["Mantecatura", "Emulsification"],
      ),
    ],
  ),
  RecipeCard(
    id: 'omakase_toro',
    name: "Otoro Sashimi Omakase",
    subtitle: "Tsukiji-Grade Precision Cuts",
    difficulty: RecipeDifficulty.executive,
    cuisine: CuisineType.japanese,
    servings: 1,
    prepMinutes: 20,
    calories: 280,
    gradientColors: [
      const Color(0xFFC1292E),
      const Color(0xFF3D0C0C),
    ],
    steps: [
      RecipeStep(
        label: "SUJIHIKI_CUT",
        description: "Execute single-stroke sashimi cuts at 3mm thickness.",
        station: BrigadeStation.gardeManger,
        chefNotes: "Pull, never push. Let knife weight guide the stroke.",
        techniques: ["Sujihiki", "Hirazukuri"],
      ),
      RecipeStep(
        label: "MORITSUKE",
        description: "Arrange on handmade ceramic with shiso and wasabi.",
        station: BrigadeStation.chefDeCuisine,
        techniques: ["Moritsuke", "Wabi-Sabi Plating"],
        pairingSuggestion: "Junmai Daiginjo Sake",
      ),
    ],
  ),
  RecipeCard(
    id: 'creme_brulee',
    name: "Crème Brûlée Classique",
    subtitle: "Madagascar Vanilla & Burnt Caramel",
    difficulty: RecipeDifficulty.apprenti,
    cuisine: CuisineType.patisserie,
    servings: 6,
    prepMinutes: 60,
    calories: 310,
    gradientColors: [
      const Color(0xFFD48166),
      const Color(0xFF4A2C1D),
    ],
    steps: [
      RecipeStep(
        label: "INFUSER",
        description: "Infuse cream with split vanilla pods for 20 minutes.",
        station: BrigadeStation.patissier,
        category: PhaseCategory.sweet,
        techniques: ["Infusion", "Tempering"],
      ),
      RecipeStep(
        label: "CUISSON_BAIN_MARIE",
        description: "Bake in water bath at 150°C until just set — gentle wobble.",
        station: BrigadeStation.patissier,
        category: PhaseCategory.sweet,
        chefNotes: "Overbaking is the enemy — better to undershoot.",
        techniques: ["Bain-Marie", "Custard Science"],
      ),
      RecipeStep(
        label: "CARAMÉLISER",
        description: "Torch Demerara sugar to a glass-like amber crust.",
        station: BrigadeStation.patissier,
        category: PhaseCategory.sweet,
        techniques: ["Brûléing", "Torch Control"],
      ),
    ],
  ),
  RecipeCard(
    id: 'miso_glazed_cod',
    name: "Miso-Glazed Black Cod",
    subtitle: "72-Hour Marinated Nobu Style",
    difficulty: RecipeDifficulty.souschef,
    cuisine: CuisineType.japanese,
    servings: 2,
    prepMinutes: 25,
    calories: 380,
    gradientColors: [
      const Color(0xFF3D5A3A),
      const Color(0xFF1A2E1A),
    ],
    steps: [
      RecipeStep(
        label: "MARINATE",
        description: "Blend white miso, mirin, sake & sugar. Coat cod evenly.",
        station: BrigadeStation.gardeManger,
        chefNotes: "72-hour cure ideal, minimum 24 hours for depth.",
        techniques: ["Curing", "Miso Fermentation"],
      ),
      RecipeStep(
        label: "BROIL",
        description: "High-heat broil until caramelised, 8-10 minutes.",
        station: BrigadeStation.rotisseur,
        techniques: ["Broiling", "Caramelisation"],
        pairingSuggestion: "Dry Riesling",
      ),
    ],
  ),
  RecipeCard(
    id: 'tiramisu',
    name: "Tiramisù Tradizionale",
    subtitle: "Espresso-Soaked Savoiardi & Mascarpone",
    difficulty: RecipeDifficulty.commis,
    cuisine: CuisineType.italian,
    servings: 8,
    prepMinutes: 40,
    calories: 420,
    gradientColors: [
      const Color(0xFFAA7B5B),
      const Color(0xFF3A2218),
    ],
    steps: [
      RecipeStep(
        label: "ZABAIONE",
        description: "Whisk egg yolks with sugar over bain-marie until ribbon stage.",
        station: BrigadeStation.patissier,
        category: PhaseCategory.sweet,
        chefNotes: "Do not scramble — gentle, consistent heat.",
        techniques: ["Zabaione", "Ribbon Stage"],
      ),
      RecipeStep(
        label: "ASSEMBLAGGIO",
        description: "Layer espresso-dipped ladyfingers with mascarpone cream.",
        station: BrigadeStation.patissier,
        category: PhaseCategory.sweet,
        techniques: ["Layering", "Soaking"],
      ),
      RecipeStep(
        label: "RIPOSO",
        description: "Chill minimum 6 hours. Dust with Valrhona cocoa.",
        station: BrigadeStation.gardeManger,
        category: PhaseCategory.sweet,
        techniques: ["Setting", "Finishing"],
      ),
    ],
  ),
];

// ════════════════════════════════════════════
// Recipe Library Screen
// ════════════════════════════════════════════
class RecipeLibrary extends ConsumerStatefulWidget {
  final VoidCallback onRecipeSelected;

  const RecipeLibrary({super.key, required this.onRecipeSelected});

  @override
  ConsumerState<RecipeLibrary> createState() => _RecipeLibraryState();
}

class _RecipeLibraryState extends ConsumerState<RecipeLibrary> {
  CuisineType? _selectedCuisine;
  RecipeDifficulty? _selectedDifficulty;
  BrigadeStation? _selectedStation;
  String _searchQuery = '';
  bool _showFavoritesOnly = false;

  List<RecipeCard> get _filteredRecipes {
    final favorites = ref.read(favoritesProvider);
    return recipeLibraryData.where((r) {
      final matchesCuisine =
          _selectedCuisine == null || r.cuisine == _selectedCuisine;
      final matchesDifficulty =
          _selectedDifficulty == null || r.difficulty == _selectedDifficulty;
      final matchesStation = _selectedStation == null ||
          r.steps.any((s) => s.station == _selectedStation);
      final matchesSearch = _searchQuery.isEmpty ||
          r.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          r.subtitle.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesFav = !_showFavoritesOnly || favorites.contains(r.id);
      return matchesCuisine && matchesDifficulty && matchesStation && matchesSearch && matchesFav;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    ref.watch(favoritesProvider); // listen for changes

    return Container(
      decoration: BoxDecoration(gradient: CuisineTheme.kitchenWarmth),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Recipe Collection",
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: CuisineTheme.cream,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: CuisineTheme.terracotta.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: CuisineTheme.terracotta.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Text(
                              "${recipeLibraryData.length} RECIPES",
                              style: GoogleFonts.inter(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: CuisineTheme.terracotta,
                                letterSpacing: 1,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            "Curated by V Cooks Cuisine",
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
                              fontStyle: FontStyle.italic,
                              color: CuisineTheme.cream.withValues(alpha: 0.4),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: CuisineTheme.terracotta.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: CuisineTheme.terracotta.withValues(alpha: 0.2),
                      ),
                    ),
                    child: const Icon(LucideIcons.bookOpen,
                        size: 20, color: CuisineTheme.saffron),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Search bar
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  color: CuisineTheme.darkWalnut.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: CuisineTheme.saffron.withValues(alpha: 0.08)),
                ),
                child: Row(
                  children: [
                    Icon(LucideIcons.search,
                        size: 16,
                        color: CuisineTheme.cream.withValues(alpha: 0.3)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        onChanged: (val) =>
                            setState(() => _searchQuery = val),
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: CuisineTheme.cream,
                        ),
                        decoration: InputDecoration(
                          hintText: "Search recipes, cuisines, techniques...",
                          hintStyle: GoogleFonts.inter(
                            fontSize: 13,
                            color: CuisineTheme.cream.withValues(alpha: 0.2),
                          ),
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Filter groups
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip("ALL", _selectedCuisine == null && _selectedDifficulty == null && _selectedStation == null && !_showFavoritesOnly, () {
                      setState(() {
                        _selectedCuisine = null;
                        _selectedDifficulty = null;
                        _selectedStation = null;
                        _showFavoritesOnly = false;
                      });
                    }),
                    _buildFavFilterChip(),
                    const VerticalDivider(width: 24, indent: 8, endIndent: 8),
                    _buildFilterSection("CUISINE", CuisineType.values, _selectedCuisine, (val) => setState(() => _selectedCuisine = val)),
                    const VerticalDivider(width: 24, indent: 8, endIndent: 8),
                    _buildFilterSection("RANK", RecipeDifficulty.values, _selectedDifficulty, (val) => setState(() => _selectedDifficulty = val)),
                    const VerticalDivider(width: 24, indent: 8, endIndent: 8),
                    _buildFilterSection("STATION", BrigadeStation.values, _selectedStation, (val) => setState(() => _selectedStation = val)),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Recipe grid
              Expanded(
                child: _filteredRecipes.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(LucideIcons.searchX,
                                size: 48,
                                color: CuisineTheme.cream.withValues(alpha: 0.1)),
                            const SizedBox(height: 16),
                            Text(
                              "No recipes found",
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: CuisineTheme.cream.withValues(alpha: 0.3),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              "Try adjusting your filters",
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: CuisineTheme.cream.withValues(alpha: 0.2),
                              ),
                            ),
                          ],
                        ),
                      )
                    : GridView.builder(
                        padding: const EdgeInsets.only(bottom: 100),
                        gridDelegate:
                            SliverGridDelegateWithMaxCrossAxisExtent(
                          maxCrossAxisExtent: MediaQuery.of(context).size.width < 600 ? 500 : 400,
                          mainAxisSpacing: 16,
                          crossAxisSpacing: 16,
                          childAspectRatio: MediaQuery.of(context).size.width < 600 ? 1.5 : 1.3,
                        ),
                        itemCount: _filteredRecipes.length,
                        itemBuilder: (context, index) {
                          return _RecipeCardWidget(
                            recipe: _filteredRecipes[index],
                            onTap: () {
                              ref
                                  .read(chefSessionProvider.notifier)
                                  .loadRecipe(_filteredRecipes[index]);
                              widget.onRecipeSelected();
                            },
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFavFilterChip() {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: () => setState(() => _showFavoritesOnly = !_showFavoritesOnly),
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: _showFavoritesOnly
                ? CuisineTheme.cranberry.withValues(alpha: 0.15)
                : CuisineTheme.darkWalnut.withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: _showFavoritesOnly
                  ? CuisineTheme.cranberry.withValues(alpha: 0.4)
                  : CuisineTheme.cream.withValues(alpha: 0.06),
            ),
          ),
          child: Row(
            children: [
              Icon(
                _showFavoritesOnly ? LucideIcons.heartOff : LucideIcons.heart,
                size: 12,
                color: _showFavoritesOnly
                    ? CuisineTheme.cranberry
                    : CuisineTheme.cream.withValues(alpha: 0.4),
              ),
              const SizedBox(width: 6),
              Text(
                "FAVORITES",
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1,
                  color: _showFavoritesOnly
                      ? CuisineTheme.cranberry
                      : CuisineTheme.cream.withValues(alpha: 0.4),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterSection<T>(String title, List<T> values, T selected, Function(T?) onSelected) {
    return Row(
      children: [
        Text(
          "$title: ",
          style: GoogleFonts.inter(
            fontSize: 9,
            fontWeight: FontWeight.w800,
            color: CuisineTheme.cream.withValues(alpha: 0.2),
            letterSpacing: 1,
          ),
        ),
        const SizedBox(width: 8),
        for (final val in values)
          _buildFilterChip(
            val.toString().split('.').last.toUpperCase(),
            selected == val,
            () => onSelected(selected == val ? null : val),
          ),
      ],
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color: isSelected
                ? CuisineTheme.terracotta.withValues(alpha: 0.15)
                : CuisineTheme.darkWalnut.withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected
                  ? CuisineTheme.terracotta.withValues(alpha: 0.4)
                  : CuisineTheme.cream.withValues(alpha: 0.04),
            ),
          ),
          child: Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 9,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
              color: isSelected
                  ? CuisineTheme.terracotta
                  : CuisineTheme.cream.withValues(alpha: 0.4),
            ),
          ),
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════
// Recipe Card Widget
// ════════════════════════════════════════════
class _RecipeCardWidget extends ConsumerStatefulWidget {
  final RecipeCard recipe;
  final VoidCallback onTap;

  const _RecipeCardWidget({required this.recipe, required this.onTap});

  @override
  ConsumerState<_RecipeCardWidget> createState() => _RecipeCardWidgetState();
}

class _RecipeCardWidgetState extends ConsumerState<_RecipeCardWidget> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final isFav = ref.watch(favoritesProvider).contains(widget.recipe.id);

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOutCubic,
          transform: Matrix4.diagonal3Values(_isHovered ? 1.02 : 1.0, _isHovered ? 1.02 : 1.0, 1.0),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: widget.recipe.gradientColors,
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: _isHovered
                  ? CuisineTheme.saffron.withValues(alpha: 0.3)
                  : CuisineTheme.cream.withValues(alpha: 0.08),
            ),
            boxShadow: [
              BoxShadow(
                color: widget.recipe.gradientColors.first
                    .withValues(alpha: _isHovered ? 0.25 : 0.12),
                blurRadius: _isHovered ? 30 : 18,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Stack(
            children: [
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getDifficultyColor(widget.recipe.difficulty)
                                .withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color:
                                  _getDifficultyColor(widget.recipe.difficulty)
                                      .withValues(alpha: 0.4),
                            ),
                          ),
                          child: Text(
                            widget.recipe.difficulty.name.toUpperCase(),
                            style: GoogleFonts.inter(
                              fontSize: 8,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                              color: _getDifficultyColor(
                                  widget.recipe.difficulty),
                            ),
                          ),
                        ),
                        Row(
                          children: [
                            Icon(
                              _getCuisineIcon(widget.recipe.cuisine),
                              size: 14,
                              color: CuisineTheme.cream.withValues(alpha: 0.5),
                            ),
                          ],
                        ),
                      ],
                    ),

                    const Spacer(),

                    // Recipe name
                    Text(
                      widget.recipe.name,
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: CuisineTheme.cream,
                        height: 1.1,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.recipe.subtitle,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w400,
                        color: CuisineTheme.cream.withValues(alpha: 0.6),
                      ),
                    ),

                    const Spacer(),

                    // Meta row
                    Row(
                      children: [
                        _buildMeta(LucideIcons.users,
                            "${widget.recipe.servings} SVG"),
                        const SizedBox(width: 14),
                        _buildMeta(LucideIcons.clock,
                            "${widget.recipe.prepMinutes} MIN"),
                        const SizedBox(width: 14),
                        _buildMeta(LucideIcons.flame,
                            "${widget.recipe.calories} CAL"),
                        const SizedBox(width: 14),
                        _buildMeta(LucideIcons.layers,
                            "${widget.recipe.steps.length} STEPS"),
                      ],
                    ),
                  ],
                ),
              ),
              // Favorite button
              Positioned(
                top: 16,
                right: 16,
                child: GestureDetector(
                  onTap: () =>
                      ref.read(favoritesProvider.notifier).toggleFavorite(widget.recipe.id),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: isFav
                          ? CuisineTheme.cranberry.withValues(alpha: 0.2)
                          : Colors.black.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      isFav ? LucideIcons.heartOff : LucideIcons.heart,
                      size: 14,
                      color: isFav
                          ? CuisineTheme.cranberry
                          : CuisineTheme.cream.withValues(alpha: 0.6),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMeta(IconData icon, String label) {
    return Row(
      children: [
        Icon(icon,
            size: 10,
            color: CuisineTheme.cream.withValues(alpha: 0.4)),
        const SizedBox(width: 4),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 9,
            fontWeight: FontWeight.w700,
            color: CuisineTheme.cream.withValues(alpha: 0.5),
          ),
        ),
      ],
    );
  }

  Color _getDifficultyColor(RecipeDifficulty diff) {
    switch (diff) {
      case RecipeDifficulty.apprenti:
        return CuisineTheme.olive;
      case RecipeDifficulty.commis:
        return CuisineTheme.terracotta;
      case RecipeDifficulty.souschef:
        return CuisineTheme.saffron;
      case RecipeDifficulty.executive:
        return CuisineTheme.cranberry;
    }
  }

  IconData _getCuisineIcon(CuisineType cuisine) {
    switch (cuisine) {
      case CuisineType.french:
        return LucideIcons.chefHat;
      case CuisineType.japanese:
        return LucideIcons.swords;
      case CuisineType.italian:
        return LucideIcons.grape;
      case CuisineType.fusion:
        return LucideIcons.sparkles;
      case CuisineType.patisserie:
        return LucideIcons.cake;
    }
  }
}
