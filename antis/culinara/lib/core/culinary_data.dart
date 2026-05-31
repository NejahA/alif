import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/theme.dart';

class CulinaryTip {
  final String title;
  final String description;
  final String? proTip;
  final String category;
  final int difficultyLevel;
  final IconData icon;
  final Color accentColor;

  const CulinaryTip({
    required this.title,
    required this.description,
    this.proTip,
    required this.category,
    required this.difficultyLevel,
    required this.icon,
    required this.accentColor,
  });
}

final culinaryTipsData = <CulinaryTip>[
  CulinaryTip(
    title: "The Maillard Reaction",
    description:
        "The Maillard reaction occurs between amino acids and reducing sugars at temperatures above 140°C (280°F). This chemical reaction creates hundreds of different flavor compounds, giving browned food its distinctive flavor and aroma. It's responsible for the crust on seared steaks, the color of bread, and the flavor of roasted coffee.",
    proTip:
        "Pat your meat dry before searing. Moisture creates steam, which prevents the Maillard reaction. A dry surface = better browning.",
    category: "Science",
    difficultyLevel: 2,
    icon: LucideIcons.flame,
    accentColor: CuisineTheme.terracotta,
  ),
  CulinaryTip(
    title: "Knife Skills: The Rock Chop",
    description:
        "The rock chop is the most fundamental knife technique in professional kitchens. Keep the tip of the knife on the cutting board and rock the blade up and down through the ingredient. Your guiding hand should curl inward (the 'claw grip') to protect your fingertips while providing a guide for the blade.",
    proTip:
        "Let the weight of the knife do the work. If you're pressing hard, your knife needs sharpening.",
    category: "Technique",
    difficultyLevel: 1,
    icon: LucideIcons.swords,
    accentColor: CuisineTheme.olive,
  ),
  CulinaryTip(
    title: "Emulsification Mastery",
    description:
        "An emulsion is a stable mixture of two liquids that normally don't mix, like oil and vinegar. The key is to add the oil very slowly while whisking vigorously. Mustard, egg yolks, and lecithin act as natural emulsifiers. Classic emulsions include vinaigrette, mayonnaise, hollandaise, and béarnaise sauce.",
    proTip:
        "If your emulsion breaks, start fresh with a new egg yolk in a clean bowl and slowly whisk the broken sauce into it.",
    category: "Technique",
    difficultyLevel: 3,
    icon: LucideIcons.droplets,
    accentColor: CuisineTheme.saffron,
  ),
  CulinaryTip(
    title: "Salt: The Flavor Amplifier",
    description:
        "Salt doesn't just make food salty — it suppresses bitterness and enhances sweetness and other flavors. Season in layers throughout cooking rather than all at once at the end. Different salts have different uses: fine sea salt for cooking, flaky Maldon for finishing, kosher salt for its texture and ease of pinching.",
    proTip:
        "Taste constantly. The perfect amount of salt is just below the threshold where you can actually taste 'saltiness' — food should just taste more like itself.",
    category: "Ingredient",
    difficultyLevel: 1,
    icon: LucideIcons.gem,
    accentColor: CuisineTheme.butterscotch,
  ),
  CulinaryTip(
    title: "Deglazing: Liquid Gold",
    description:
        "Those brown bits stuck to the bottom of your pan after searing are called 'fond' — they're concentrated flavor. Deglazing means adding liquid (wine, stock, or even water) to dissolve these caramelized bits into a sauce. The fond is the foundation of most pan sauces in French cuisine.",
    proTip:
        "Always deglaze with the pan off direct heat to prevent the liquid from evaporating too quickly. Use a wooden spoon to scrape gently.",
    category: "Technique",
    difficultyLevel: 2,
    icon: LucideIcons.glassWater,
    accentColor: CuisineTheme.cranberry,
  ),
  CulinaryTip(
    title: "Cast Iron Care",
    description:
        "A well-seasoned cast iron pan is virtually non-stick and will last generations. Seasoning is a layer of polymerized fat bonded to the metal. After each use, rinse with hot water (soap is fine for modern pans), dry immediately, and apply a thin layer of oil. Heat until it just smokes, then cool.",
    proTip:
        "Never soak cast iron. If food is stuck, use coarse salt as a gentle abrasive with a paper towel.",
    category: "Equipment",
    difficultyLevel: 1,
    icon: LucideIcons.disc,
    accentColor: CuisineTheme.cinnamonDust,
  ),
  CulinaryTip(
    title: "The Science of Braising",
    description:
        "Braising transforms tough, collagen-rich cuts into tender, falling-apart meat. The collagen in connective tissue begins to dissolve into gelatin at around 70°C (160°F), but full conversion requires sustained temperatures between 80-95°C (175-200°F) over several hours. Low and slow is the key.",
    proTip:
        "The best braising temperature for most ovens is 150°C (300°F). The liquid should barely simmer — aggressive boiling will dry out the meat.",
    category: "Science",
    difficultyLevel: 2,
    icon: LucideIcons.thermometer,
    accentColor: CuisineTheme.terracotta,
  ),
  CulinaryTip(
    title: "Mise en Place Philosophy",
    description:
        "Mise en place ('everything in its place') is not just a technique — it's a professional kitchen philosophy. Before cooking begins, every ingredient is measured, cut, peeled, sliced, and arranged. This ensures smooth workflow, prevents mistakes, and allows the chef to focus entirely on the cooking process.",
    proTip:
        "Read your entire recipe twice before touching a single ingredient. Mental mise en place is just as important as physical preparation.",
    category: "Technique",
    difficultyLevel: 1,
    icon: LucideIcons.layoutGrid,
    accentColor: CuisineTheme.olive,
  ),
  CulinaryTip(
    title: "Understanding Umami",
    description:
        "Umami is the fifth taste, described as savory or meaty. It comes from glutamate, an amino acid found naturally in tomatoes, aged cheese, mushrooms, soy sauce, and fermented foods. Combining umami-rich ingredients creates a synergistic effect that amplifies the savory sensation exponentially.",
    proTip:
        "Add a small amount of fish sauce or a piece of Parmesan rind to soups and stews. You won't taste fish or cheese — just deep, rounded flavor.",
    category: "Science",
    difficultyLevel: 2,
    icon: LucideIcons.sparkles,
    accentColor: CuisineTheme.freshMint,
  ),
  CulinaryTip(
    title: "The Perfect Pan Temperature",
    description:
        "Knowing when your pan is hot enough is crucial. For stainless steel, add a drop of water — it should form a mercury-like ball that dances across the surface (Leidenfrost effect). For searing, use a high-smoke-point oil like avocado or grapeseed, and wait until you see the first wisps of smoke.",
    proTip:
        "Preheat your pan for at least 2-3 minutes on medium-high. Patience here prevents sticking and ensures proper caramelization.",
    category: "Equipment",
    difficultyLevel: 2,
    icon: LucideIcons.gauge,
    accentColor: CuisineTheme.saffron,
  ),
];
