export interface Attraction {
  icon: string;
  name: string;
  desc: string;
  tag: string;
}

export const attractions: Attraction[] = [
  {
    icon: '\u{1F3E3}',
    name: 'Great Mosque of Mahdia',
    desc: 'Built in the 10th century by the Fatimids, this mosque features a grand façade with a monumental arched entrance and a unique minaret.',
    tag: 'Historical'
  },
  {
    icon: '\u{1F3E0}',
    name: 'Borj el-Kebir',
    desc: 'A massive 16th-century fortress built by the Ottomans on the site of an earlier Fatimid palace, offering panoramic sea views.',
    tag: 'Fortress'
  },
  {
    icon: '\u{1F3D6}',
    name: 'Mahdia Beach',
    desc: 'Kilometers of pristine white sand and crystal-clear turquoise waters, perfect for swimming, sunbathing, and water sports.',
    tag: 'Beach'
  },
  {
    icon: '\u{1F3E5}',
    name: 'Old Medina',
    desc: 'A charming labyrinth of narrow streets, whitewashed houses, and traditional souks selling local handicrafts and spices.',
    tag: 'Culture'
  },
  {
    icon: '\u{1F3A2}',
    name: 'Fishing Port',
    desc: "One of Tunisia's most important fishing ports. Watch the colorful boats return at sunset with the day's fresh catch.",
    tag: 'Harbor'
  },
  {
    icon: '\u{1F377}',
    name: 'Skifa Kahla',
    desc: 'The "Black Gate" — a monumental arched gateway from the Fatimid era that once served as the main entrance to the old city.',
    tag: 'Landmark'
  }
];

export interface TimelineEvent {
  year: string;
  title: string;
    desc: string;
}

export const timelineEvents: TimelineEvent[] = [
  { year: '921 AD', title: 'Founding of Mahdia', desc: 'Caliph Abdallah al-Mahdi Billah establishes Mahdia as the capital of the Fatimid Caliphate. The city is built on a strategic peninsula.' },
  { year: '10th Century', title: 'Fatimid Golden Age', desc: 'Mahdia flourishes as a center of power, trade, and Islamic learning. The Great Mosque of Mahdia is built during this period.' },
  { year: '1087', title: 'Norman Invasion', desc: 'The Norman fleet from Sicily attacks Mahdia. The city is temporarily occupied before being reclaimed by the Zirids.' },
  { year: '16th Century', title: 'Ottoman Era', desc: 'Mahdia becomes part of the Ottoman Empire. The fortifications of Borj el-Kebir (the Great Fort) are strengthened.' },
  { year: '1956', title: 'Modern Tunisia', desc: "Following Tunisia's independence from France, Mahdia grows as a center for fishing, olive oil production, and tourism." }
];

export interface GalleryItem {
  icon: string;
  label: string;
  gradient: string;
}

export const galleryItems: GalleryItem[] = [
  { icon: '\u{1F3D6}', label: 'Corniche', gradient: 'linear-gradient(135deg, #2c7a7b, #3b82f6)' },
  { icon: '\u{1F3EB}', label: 'Great Mosque', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
  { icon: '\u{1F3E0}', label: 'Borj el-Kebir', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
  { icon: '\u{1F3EC}', label: 'Olive Groves', gradient: 'linear-gradient(135deg, #059669, #34d399)' },
  { icon: '\u{1F3A2}', label: 'Fishing Port', gradient: 'linear-gradient(135deg, #dc2626, #f87171)' },
  { icon: '\u{1F3D6}', label: 'Beaches', gradient: 'linear-gradient(135deg, #0d9488, #2dd4bf)' }
];

export interface CultureItem {
  icon: string;
  title: string;
  desc: string;
}

export const cultureItems: CultureItem[] = [
  { icon: '\u{1F3E5}', title: 'Medina & Souks', desc: 'Wander through the narrow streets of the old medina, where artisans sell traditional pottery, textiles, and jewelry in the bustling souks.' },
  { icon: '\u{1F372}', title: 'Cuisine', desc: 'Mahdia is famous for its fresh seafood, couscous, brik (stuffed pastry), and harissa. The local olive oil is among the finest in Tunisia.' },
  { icon: '\u{1F3B6}', title: 'Stambali Music', desc: 'A spiritual music tradition rooted in sub-Saharan African heritage, Stambali ceremonies feature hypnotic rhythms and colorful costumes.' },
  { icon: '\u{1F3D9}', title: 'Festivals', desc: "The annual Festival of the Sea celebrates Mahdia's maritime heritage with boat races, music performances, and traditional dance." }
];