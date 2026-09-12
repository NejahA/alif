const mongoose = require('mongoose');
const Article = require('./models/Article.model');

const sampleArticles = [
  {
    wikipediaId: '1164',
    title: 'Artificial Intelligence',
    originalTitle: 'Artificial Intelligence',
    language: 'en',
    summary: 'Artificial intelligence (AI) is the capability of computational systems to perform tasks typically associated with human intelligence, such as learning, reasoning, problem-solving, perception, and decision-making.',
    content: '<p><b>Artificial intelligence</b> (<b>AI</b>) is the capability of computational systems to perform tasks typically associated with human intelligence, such as learning, reasoning, problem-solving, perception, and decision-making. It is a field of research in engineering, mathematics, and computer science that develops and studies methods and software that enable machines to perceive their environment and use learning and intelligence to take actions that maximize their chances of achieving defined goals.</p><p>High-profile applications of AI include advanced web search engines, recommendation systems, understanding human speech, autonomous vehicles, and generative AI tools.</p>',
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/HONIAC_computer.jpg/320px-HONIAC_computer.jpg',
    categories: ['Technology', 'Computer Science', 'Artificial Intelligence'],
    wordCount: 27718,
    pageViews: 15420,
    popularityScore: 120,
    trendingScore: 95,
    lastUpdated: new Date(),
    availableLanguages: [
      { language: 'es', title: 'Inteligencia artificial', url: 'https://es.wikipedia.org/wiki/Inteligencia_artificial' },
      { language: 'fr', title: 'Intelligence artificielle', url: 'https://fr.wikipedia.org/wiki/Intelligence_artificielle' },
      { language: 'de', title: 'Künstliche Intelligenz', url: 'https://de.wikipedia.org/wiki/K%C3%BCnstliche_Intelligenz' },
      { language: 'ar', title: 'ذكاء اصطناعي', url: 'https://ar.wikipedia.org/wiki/%D0%B6%D0%BA%D8%A7%D8%A1_%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A' }
    ]
  },
  {
    wikipediaId: '586357',
    title: 'Quantum Mechanics',
    originalTitle: 'Quantum Mechanics',
    language: 'en',
    summary: 'Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.',
    content: '<p><b>Quantum mechanics</b> is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of all quantum physics including quantum chemistry, quantum field theory, quantum technology, and quantum information science.</p><p>Classical physics cannot explain many aspects of nature at small scales, which requires the principles of wave-particle duality, superposition, and quantum entanglement.</p>',
    url: 'https://en.wikipedia.org/wiki/Quantum_mechanics',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Solvay_conference_1927.jpg/320px-Solvay_conference_1927.jpg',
    categories: ['Science', 'Physics', 'Quantum Physics'],
    wordCount: 18450,
    pageViews: 12300,
    popularityScore: 98,
    trendingScore: 88,
    lastUpdated: new Date(),
    availableLanguages: [
      { language: 'es', title: 'Mecánica cuántica', url: 'https://es.wikipedia.org/wiki/Mec%C3%A1nica_cu%C3%A1ntica' },
      { language: 'fr', title: 'Mécanique quantique', url: 'https://fr.wikipedia.org/wiki/M%C3%A9canique_quantique' },
      { language: 'de', title: 'Quantenmechanik', url: 'https://de.wikipedia.org/wiki/Quantenmechanik' }
    ]
  },
  {
    wikipediaId: '18079',
    title: 'Leonardo da Vinci',
    originalTitle: 'Leonardo da Vinci',
    language: 'en',
    summary: 'Leonardo di ser Piero da Vinci was an Italian polymath of the High Renaissance who was active as a painter, draughtsman, engineer, scientist, theorist, sculptor, and architect.',
    content: '<p><b>Leonardo di ser Piero da Vinci</b> (15 April 1452 – 2 May 1519) was an Italian polymath of the High Renaissance who was active as a painter, draughtsman, engineer, scientist, theorist, sculptor, and architect. He is widely considered one of the greatest painters in history and one of the most diversely talented individuals ever to have lived.</p><p>His famous works include the Mona Lisa, The Last Supper, and the Vitruvian Man.</p>',
    url: 'https://en.wikipedia.org/wiki/Leonardo_da_Vinci',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Leonardo_self_portrait.jpg/320px-Leonardo_self_portrait.jpg',
    categories: ['Art & Culture', 'History', 'Biography', 'Renaissance'],
    wordCount: 22100,
    pageViews: 18900,
    popularityScore: 110,
    trendingScore: 82,
    lastUpdated: new Date(),
    availableLanguages: [
      { language: 'it', title: 'Leonardo da Vinci', url: 'https://it.wikipedia.org/wiki/Leonardo_da_Vinci' },
      { language: 'fr', title: 'Léonard de Vinci', url: 'https://fr.wikipedia.org/wiki/L%C3%A9onard_de_Vinci' },
      { language: 'es', title: 'Leonardo da Vinci', url: 'https://es.wikipedia.org/wiki/Leonardo_da_Vinci' }
    ]
  },
  {
    wikipediaId: '7944',
    title: 'Climate Change',
    originalTitle: 'Climate Change',
    language: 'en',
    summary: 'Climate change refers to long-term shifts in temperatures and weather patterns. Such shifts can be natural, due to changes in the sun\'s activity or large volcanic eruptions.',
    content: '<p>Contemporary <b>climate change</b> includes both global warming driven by human emissions of greenhouse gases and the resulting large-scale shifts in weather patterns. Though there have been previous periods of climatic change, since the mid-20th century humans have had an unprecedented impact on Earth\'s climate system and caused change on a global scale.</p>',
    url: 'https://en.wikipedia.org/wiki/Climate_change',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Global_Temperature_Anomaly.svg/320px-Global_Temperature_Anomaly.svg.png',
    categories: ['Science', 'Environment', 'Earth Sciences'],
    wordCount: 31200,
    pageViews: 14200,
    popularityScore: 105,
    trendingScore: 92,
    lastUpdated: new Date(),
    availableLanguages: [
      { language: 'es', title: 'Cambio climático', url: 'https://es.wikipedia.org/wiki/Cambio_clim%C3%A1tico' },
      { language: 'de', title: 'Klimawandel', url: 'https://de.wikipedia.org/wiki/Klimawandel' }
    ]
  },
  {
    wikipediaId: '26842',
    title: 'Solar System',
    originalTitle: 'Solar System',
    language: 'en',
    summary: 'The Solar System is the gravitationally bound system of the Sun and the objects that orbit it.',
    content: '<p>The <b>Solar System</b> is the gravitationally bound system of the Sun and the objects that orbit it. It formed 4.6 billion years ago from the gravitational collapse of a giant interstellar molecular cloud. The vast majority of the system\'s mass is in the Sun, with most of the remaining mass contained in Jupiter.</p>',
    url: 'https://en.wikipedia.org/wiki/Solar_System',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Planets2013.svg/320px-Planets2013.svg.png',
    categories: ['Science', 'Astronomy', 'Space Exploration'],
    wordCount: 24500,
    pageViews: 16800,
    popularityScore: 115,
    trendingScore: 89,
    lastUpdated: new Date(),
    availableLanguages: [
      { language: 'es', title: 'Sistema solar', url: 'https://es.wikipedia.org/wiki/Sistema_solar' },
      { language: 'fr', title: 'Système solaire', url: 'https://fr.wikipedia.org/wiki/Syst%C3%A8me_solaire' }
    ]
  },
  {
    wikipediaId: '32884',
    title: 'World War II',
    originalTitle: 'World War II',
    language: 'en',
    summary: 'World War II or the Second World War was a global conflict that lasted from 1939 to 1945. The vast majority of the world\'s countries fought as part of two opposing military alliances: the Allies and the Axis.',
    content: '<p><b>World War II</b> or the <b>Second World War</b> was a global conflict that lasted from 1939 to 1945. The vast majority of the world\'s countries—including all of the great powers—fought as part of two opposing military alliances: the Allies and the Axis. World War II was the deadliest conflict in human history, resulting in 70 to 85 million fatalities.</p>',
    url: 'https://en.wikipedia.org/wiki/World_War_II',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/World_War_II_Montage.png/320px-World_War_II_Montage.png',
    categories: ['History', 'Military History', '20th Century'],
    wordCount: 42000,
    pageViews: 21000,
    popularityScore: 135,
    trendingScore: 90,
    lastUpdated: new Date(),
    availableLanguages: [
      { language: 'de', title: 'Zweiter Weltkrieg', url: 'https://de.wikipedia.org/wiki/Zweiter_Weltkrieg' },
      { language: 'ru', title: 'Вторая мировая война', url: 'https://ru.wikipedia.org/wiki/%D0%92%D1%82%D0%BE%D1%80%D0%B0%D1%8F_%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%8F_%D0%B2%D0%BE%D0%B9%D0%BD%D0%B0' }
    ]
  }
];

async function seedArticles() {
  try {
    const count = await Article.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial articles into database...');
      await Article.insertMany(sampleArticles);
      console.log(`✅ Successfully seeded ${sampleArticles.length} initial articles!`);
    } else {
      console.log(`ℹ️ Database already contains ${count} articles. Skipping seed.`);
    }
  } catch (err) {
    console.error('❌ Error seeding articles:', err.message);
  }
}

module.exports = seedArticles;
