import 'package:flutter/material.dart';
import '../models/taxi_info.dart';
import '../models/rate_info.dart';
import '../models/route_info.dart';
import '../models/announcement.dart';

class TunisiaData {
  static List<TaxiInfo> get transportModes => const [
    TaxiInfo(icon: IconType.taxi, title: 'Taxis Individuels', subtitle: 'Jaunes | Compteur | 24h/24'),
    TaxiInfo(icon: IconType.rickshaw, title: 'Taxis Collectifs', subtitle: 'Bleu/rouge | Trajets fixes | Éco'),
    TaxiInfo(icon: IconType.car, title: 'Louages', subtitle: 'Inter-villes | Départ quand plein'),
    TaxiInfo(icon: IconType.bus, title: 'Bus Public', subtitle: 'TRANSTU | 5h-22h | Toutes les villes'),
    TaxiInfo(icon: IconType.train, title: 'SNCFT', subtitle: 'Trains régionaux & grandes lignes'),
    TaxiInfo(icon: IconType.airportShuttle, title: 'Aéroport Shuttle', subtitle: 'Tunis-Carthage | Enveloppe fixe'),
    TaxiInfo(icon: IconType.boat, title: 'Louages Maritimes', subtitle: 'Sfax-Kerkennah | Zarzis-Djerba'),
  ];

  static List<Announcement> get announcements => [
    Announcement(
      message: 'Nouveaux tarifs taxi en vigueur depuis janvier 2026. Voir l\'onglet Tarifs.',
      date: DateTime(2026, 1, 15),
    ),
    Announcement(
      message: 'Grève des louages prévue le 30 mai 2026. Prévoyez des alternatives.',
      date: DateTime(2026, 5, 20),
    ),
  ];

  static List<RateCategory> get rateCategories => [
    RateCategory(name: 'Taxi Individuel (Compteur)', items: const [
      RateItem(label: 'Prise en charge', price: '0,500 DT'),
      RateItem(label: 'Par km (jour)', price: '0,700 DT'),
      RateItem(label: 'Par km (nuit 21h-5h)', price: '0,900 DT'),
      RateItem(label: 'Attente par heure', price: '5,000 DT'),
      RateItem(label: 'Forfait aéroport', price: '25,000 DT'),
    ]),
    RateCategory(name: 'Taxi Collectif', items: const [
      RateItem(label: 'Trajet court (intra-ville)', price: '1,200 DT'),
      RateItem(label: 'Trajet moyen (banlieue)', price: '2,500 DT'),
      RateItem(label: 'Trajet long (périphérie)', price: '4,000 DT'),
    ]),
    RateCategory(name: 'Louage (par personne)', items: const [
      RateItem(label: 'Tunis → Sousse', price: '12,000 DT'),
      RateItem(label: 'Tunis → Sfax', price: '18,000 DT'),
      RateItem(label: 'Tunis → Nabeul', price: '6,000 DT'),
      RateItem(label: 'Sousse → Monastir', price: '3,500 DT'),
      RateItem(label: 'Sfax → Gabès', price: '10,000 DT'),
    ]),
    RateCategory(name: 'VTC / Réservation en ligne', items: const [
      RateItem(label: 'Bolt (prix km)', price: '0,800 DT'),
      RateItem(label: 'Yassir (prix km)', price: '0,750 DT'),
      RateItem(label: 'Course minimale', price: '5,000 DT'),
    ]),
  ];

  static List<RouteInfo> get popularRoutes => const [
    RouteInfo(
      from: 'Tunis Centre',
      to: 'Aéroport Tunis-Carthage',
      distance: '8 km',
      duration: '15-25 min',
      fare: '25 DT',
      type: RouteType.flight,
    ),
    RouteInfo(
      from: 'Tunis (la Marsa)',
      to: 'Sidi Bou Saïd',
      distance: '3 km',
      duration: '5-10 min',
      fare: '6 DT',
      type: RouteType.historic,
    ),
    RouteInfo(
      from: 'Tunis Centre',
      to: 'Sousse',
      distance: '140 km',
      duration: '1h45 - 2h',
      fare: '12 DT (louage)',
      type: RouteType.beach,
    ),
    RouteInfo(
      from: 'Tunis Centre',
      to: 'Hammamet',
      distance: '65 km',
      duration: '50-70 min',
      fare: '8 DT (louage)',
      type: RouteType.beach,
    ),
    RouteInfo(
      from: 'Tunis Centre',
      to: 'Nabeul',
      distance: '70 km',
      duration: '55-75 min',
      fare: '6 DT (louage)',
      type: RouteType.city,
    ),
    RouteInfo(
      from: 'Sfax Centre',
      to: 'Gabès',
      distance: '130 km',
      duration: '1h40 - 2h',
      fare: '10 DT (louage)',
      type: RouteType.city,
    ),
    RouteInfo(
      from: 'Tunis (Bardo)',
      to: 'Carthage',
      distance: '18 km',
      duration: '25-40 min',
      fare: '18 DT (taxi)',
      type: RouteType.historic,
    ),
  ];



  static IconData getIconData(IconType type) {
    switch (type) {
      case IconType.taxi:
        return Icons.local_taxi;
      case IconType.airportShuttle:
        return Icons.airport_shuttle;
      case IconType.bus:
        return Icons.directions_bus;
      case IconType.rickshaw:
        return Icons.electric_rickshaw;
      case IconType.train:
        return Icons.train;
      case IconType.boat:
        return Icons.directions_boat;
      case IconType.car:
        return Icons.directions_car;
    }
  }

  static IconData getRouteIcon(RouteType type) {
    switch (type) {
      case RouteType.flight:
        return Icons.flight;
      case RouteType.shopping:
        return Icons.shopping_bag;
      case RouteType.business:
        return Icons.business;
      case RouteType.beach:
        return Icons.beach_access;
      case RouteType.train:
        return Icons.train;
      case RouteType.city:
        return Icons.location_city;
      case RouteType.historic:
        return Icons.museum;
    }
  }
}
