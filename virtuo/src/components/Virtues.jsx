import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Star, Zap, Heart, Sparkles, Brain, 
  Music, Activity, Disc, Mic, Headphones, 
  TrendingUp, Award, Trophy, Lock, CheckCircle2, Crown, User, Camera, Share2,
  Compass, Map, Wind, CloudRain, Sun, Moon
} from 'lucide-react';

const VIRTUE_DATA = {
  harmony: {
    name: 'Harmony',
    description: 'The art of combining notes to create pleasing chords and progressions.',
    icon: <Music size={24} />,
    color: '#3b82f6',
    milestones: [
      { level: 1, name: 'Chord Seeker', xp: 100 },
      { level: 5, name: 'Polyphonic Explorer', xp: 1000 },
      { level: 10, name: 'Harmonic Master', xp: 5000 }
    ],
    specializations: [
      { id: 'h1', name: 'Celestial Voicing', desc: 'Adds lush upper extensions to all chords.', cost: 5 },
      { id: 'h2', name: 'Microtonal Shift', desc: 'Enables non-standard tuning adjustments.', cost: 10 }
    ]
  },
  rhythm: {
    name: 'Rhythm',
    description: 'Precision in timing and the creation of compelling grooves.',
    icon: <Disc size={24} />,
    color: '#ef4444',
    milestones: [
      { level: 1, name: 'Beat Tapper', xp: 100 },
      { level: 5, name: 'Groove Architect', xp: 1000 },
      { level: 10, name: 'Rhythm Legend', xp: 5000 }
    ],
    specializations: [
      { id: 'r1', name: 'Polyrhythmic Pulse', desc: 'Allows overlapping time signatures.', cost: 5 },
      { id: 'r2', name: 'Humanize Engine', desc: 'Adds organic timing variations.', cost: 10 }
    ]
  },
  timbre: {
    name: 'Timbre',
    description: 'The unique quality and character of sound through synthesis and sound design.',
    icon: <Zap size={24} />,
    color: '#f59e0b',
    milestones: [
      { level: 1, name: 'Sound Finder', xp: 100 },
      { level: 5, name: 'Texture Designer', xp: 1000 },
      { level: 10, name: 'Sonic Visionary', xp: 5000 }
    ],
    specializations: [
      { id: 't1', name: 'Spectral Morph', desc: 'Fluidly transition between waveforms.', cost: 5 },
      { id: 't2', name: 'Analog Warmth', desc: 'Adds vintage saturation to all synths.', cost: 10 }
    ]
  },
  expression: {
    name: 'Expression',
    description: 'Conveying emotion and nuance through performance dynamics.',
    icon: <Heart size={24} />,
    color: '#ec4899',
    milestones: [
      { level: 1, name: 'Emotional Player', xp: 100 },
      { level: 5, name: 'Dynamic Performer', xp: 1000 },
      { level: 10, name: 'Soulful Virtuoso', xp: 5000 }
    ],
    specializations: [
      { id: 'e1', name: 'Aftertouch Bloom', desc: 'Modulate parameters with key pressure.', cost: 5 },
      { id: 'e2', name: 'Vibrato Control', desc: 'Customizable pitch modulation depth.', cost: 10 }
    ]
  },
  innovation: {
    name: 'Innovation',
    description: 'Experimenting with new sounds and unconventional musical ideas.',
    icon: <Sparkles size={24} />,
    color: '#8b5cf6',
    milestones: [
      { level: 1, name: 'Curious Mind', xp: 100 },
      { level: 5, name: 'Sonic Explorer', xp: 1000 },
      { level: 10, name: 'Avant-Garde Creator', xp: 5000 }
    ],
    specializations: [
      { id: 'i1', name: 'Generative Riffing', desc: 'AI suggests variations based on your style.', cost: 5 },
      { id: 'i2', name: 'Glitch Core', desc: 'Unlocks advanced randomized audio mangling.', cost: 10 }
    ]
  },
  theory: {
    name: 'Theory',
    description: 'Understanding the underlying structures and rules of music.',
    icon: <Brain size={24} />,
    color: '#10b981',
    milestones: [
      { level: 1, name: 'Student of Music', xp: 100 },
      { level: 5, name: 'Analytic Mind', xp: 1000 },
      { level: 10, name: 'Theorist Supreme', xp: 5000 }
    ],
    specializations: [
      { id: 'th1', name: 'Modal Mastery', desc: 'Instantly transpose across all modes.', cost: 5 },
      { id: 'th2', name: 'Circle of Fifths Tool', desc: 'Interactive visual harmony assistant.', cost: 10 }
    ]
  }
};

const VIRTUE_ESSENCES = [
  { id: 'e1', name: 'Harmony Essence', virtue: 'harmony', icon: '💧', color: '#3b82f6' },
  { id: 'e2', name: 'Rhythm Essence', virtue: 'rhythm', icon: '🔥', color: '#ef4444' },
  { id: 'e3', name: 'Timbre Essence', virtue: 'timbre', icon: '🌪️', color: '#f59e0b' }
];

const ALCHEMY_RECIPES = [
  { id: 'al1', name: 'Elixir of Focus', ingredients: { e1: 1, e2: 1 }, desc: 'Reduces CPU latency by 10ms for 10 minutes.', icon: '🧪' },
  { id: 'al2', name: 'Draught of Discovery', ingredients: { e2: 1, e3: 1 }, desc: 'Increases Collectible find rate by 5% for 15 minutes.', icon: '🍶' }
];

const VIRTUE_SYNERGIES = [
  { id: 'syn1', name: 'Melodic Pulse', pair: ['harmony', 'rhythm'], desc: 'Unlocked! Performance notes now trigger rhythmic visual ripples.', icon: '🌊' },
  { id: 'syn2', name: 'Spectral Soul', pair: ['timbre', 'expression'], desc: 'Unlocked! Gain 2x XP when using Expressive Surge with Timbre Shift.', icon: '👻' }
];

const REALMS = [
  { id: 'r1', name: 'The Echoing Canyon', virtue: 'harmony', difficulty: 1, duration: 60, reward: 'e1', icon: '⛰️' },
  { id: 'r2', name: 'Neon Pulsar', virtue: 'rhythm', difficulty: 3, duration: 300, reward: 'e2', icon: '🌃' },
  { id: 'r3', name: 'The Spectral Void', virtue: 'timbre', difficulty: 5, duration: 600, reward: 'e3', icon: '🌌' },
  { id: 'r4', name: 'Theory Archive', virtue: 'theory', difficulty: 2, duration: 120, reward: 'shards', icon: '📚' }
];

const VIRTUE_GEMS = [
  { id: 'gem1', name: 'Sapphire of Solace', virtue: 'harmony', effect: '+10% Chord Clarity', cost: { shards: 3, essences: { e1: 2 } }, icon: '🔷' },
  { id: 'gem2', name: 'Ruby of Resonance', virtue: 'rhythm', effect: '+15% Beat Punch', cost: { shards: 5, essences: { e2: 3 } }, icon: '🔻' },
  { id: 'gem3', name: 'Topaz of Texture', virtue: 'timbre', effect: '+20% Synth Depth', cost: { shards: 8, essences: { e3: 5 } }, icon: '🔶' }
];

const ARCHETYPES = [
  { id: 'arc1', name: 'The Composer', desc: 'Focuses on Harmony and Theory. +25% XP to both.', virtues: ['harmony', 'theory'], color: '#3b82f6', icon: '🎼' },
  { id: 'arc2', name: 'The Sound Designer', desc: 'Focuses on Timbre and Innovation. +25% XP to both.', virtues: ['timbre', 'innovation'], color: '#f59e0b', icon: '🎛️' },
  { id: 'arc3', name: 'The Performer', desc: 'Focuses on Expression and Rhythm. +25% XP to both.', virtues: ['expression', 'rhythm'], color: '#ec4899', icon: '🎤' }
];

const PRESTIGE_TIERS = [
  { tier: 1, name: 'Bronze Virtuoso', bonus: 'Permanent +10% XP Boost', shardCost: 5 },
  { tier: 2, name: 'Silver Virtuoso', bonus: 'Permanent +20% XP Boost', shardCost: 10 },
  { tier: 3, name: 'Gold Virtuoso', bonus: 'Permanent +50% XP Boost', shardCost: 20 }
];

const TECHNIQUE_CARDS = [
  { id: 'c1', name: 'Legato Flow', type: 'harmony', desc: 'Sustain all notes 2x longer.', cost: 200, icon: '〰️' },
  { id: 'c2', name: 'Ghost Notes', type: 'rhythm', desc: 'Adds subtle low-velocity hits.', cost: 300, icon: '👻' },
  { id: 'c3', name: 'Harmonic Series', type: 'timbre', desc: 'Boosts upper harmonics.', cost: 500, icon: '📈' },
  { id: 'c4', name: 'Dynamic Range', type: 'expression', desc: 'Expands velocity sensitivity.', cost: 400, icon: '🔊' }
];

const FORGE_RECIPES = [
  { id: 'f1', name: 'Resonant Crystal', materials: { shards: 2, collectibles: 1 }, result: 'g3', icon: '💎' },
  { id: 'f2', name: 'Temporal Anchor', materials: { shards: 5, collectibles: 1 }, result: 'g4', icon: '⚓' }
];

const VIRTUE_GEAR = [
  { id: 'g1', name: 'Golden Reeds', virtue: 'expression', boost: 1.2, rarity: 'Rare', icon: '🎷', cost: 1500 },
  { id: 'g2', name: 'Obsidian Pads', virtue: 'rhythm', boost: 1.25, rarity: 'Epic', icon: '🎹', cost: 3000 },
  { id: 'g3', name: 'Prism Cables', virtue: 'timbre', boost: 1.3, rarity: 'Legendary', icon: '🔌', cost: 5000 },
  { id: 'g4', name: 'Quantum Processor', virtue: 'innovation', boost: 1.5, rarity: 'Artifact', icon: '🔮', cost: 10000 }
];

const VIRTUE_TRIALS = [
  { id: 't1', name: 'The Harmony Gauntlet', virtue: 'harmony', objective: 'Match 20 notes in 60s', difficulty: 'Normal', reward: 'g1' },
  { id: 't2', name: 'Rhythm Apocalypse', virtue: 'rhythm', objective: 'Tap 100 times perfectly', difficulty: 'Hard', reward: 'g2' }
];

const VIRTUE_RELICS = [
  { id: 'rel1', name: 'Heart of the Ancestors', desc: 'Converts all minor performance errors into "Jazz Flavour". (10% XP boost)', virtue: 'expression', icon: '❤️' },
  { id: 'rel2', name: 'The Void Crystal', desc: 'Adds a permanent cosmic shimmer to all instruments.', virtue: 'timbre', icon: '🔮' },
  { id: 'rel3', name: 'Temporal Gear', desc: 'Slows down difficult training games by 20%.', virtue: 'rhythm', icon: '⚙️' }
];

const SOUND_SEEDS = [
  { id: 's1', name: 'Lush Pad Seed', virtue: 'harmony', growthTime: 3600, icon: '🌱' },
  { id: 's2', name: 'Glitch Perc Seed', virtue: 'innovation', growthTime: 7200, icon: '🌵' },
  { id: 's3', name: 'Lead Synth Seed', virtue: 'timbre', growthTime: 1800, icon: '🌿' }
];

const VIRTUE_PERKS = [
  { id: 'perk_1', name: 'Sonic Bloom', description: 'Increases XP gain by 50% for 5 minutes.', cost: 1000, icon: <Sparkles size={16} /> },
  { id: 'perk_2', name: 'Aura Focus', description: 'Instantly maxes out your current dominant aura intensity.', cost: 500, icon: <Zap size={16} /> },
  { id: 'perk_3', name: 'Harmony Wave', description: 'Unlocks a secret "Celestial" color scheme for the visualizer.', cost: 2000, icon: <Music size={16} /> }
];

const UNLOCKABLES = [
  { id: 'u1', name: 'Celestial Synth Pack', virtue: 'timbre', level: 5, unlocked: false, icon: '🌌' },
  { id: 'u2', name: 'Infinite Groove Engine', virtue: 'rhythm', level: 8, unlocked: false, icon: '🥁' },
  { id: 'u3', name: 'Harmonic Soul Piano', virtue: 'harmony', level: 10, unlocked: false, icon: '🎹' }
];

const EPIC_QUESTS = [
  { 
    id: 'q1', 
    name: 'The Great Symphony', 
    desc: 'Complete 3 daily challenges and reach level 5 in all virtues.', 
    progress: 0, 
    goal: 3, 
    reward: 'Exclusive "Master Maestro" Skin', 
    xp: 5000 
  },
  { 
    id: 'q2', 
    name: 'Glitch in the Matrix', 
    desc: 'Spend 10,000 XP on Timbre specializations and perks.', 
    progress: 0, 
    goal: 10000, 
    reward: 'Rare "Cyber-Echo" Collectible', 
    xp: 8000 
  }
];

const LEADERBOARD = [
  { rank: 1, name: 'VirtuosoPrime', level: 142, dominant: 'innovation' },
  { rank: 2, name: 'SonicWitch', level: 128, dominant: 'timbre' },
  { rank: 3, name: 'BeatMaster99', level: 115, dominant: 'rhythm' },
  { rank: 4, name: 'HarmonyGoddess', level: 98, dominant: 'harmony' },
  { rank: 5, name: 'TheoryBot', level: 85, dominant: 'theory' }
];

const ACHIEVEMENTS = [
  { id: 'a1', name: 'Chord Master', description: 'Reach Harmony Level 5', virtue: 'harmony', level: 5, trophy: '🥉' },
  { id: 'a2', name: 'Beat Legend', description: 'Reach Rhythm Level 10', virtue: 'rhythm', level: 10, trophy: '🥈' },
  { id: 'a3', name: 'Sonic Visionary', description: 'Reach Timbre Level 20', virtue: 'timbre', level: 20, trophy: '🥇' },
  { id: 'a4', name: 'Soulful Performer', description: 'Reach Expression Level 15', virtue: 'expression', level: 15, trophy: '💎' },
  { id: 'a5', name: 'Avant-Garde', description: 'Reach Innovation Level 25', virtue: 'innovation', level: 25, trophy: '🌌' },
  { id: 'a6', name: 'Grand Maestro', description: 'Reach Level 10 in all Virtues', allLevel: 10, trophy: '👑' }
];

const MASTERY_BADGES = [
  { level: 5, name: 'Practitioner', icon: '🎖️', color: '#94a3b8' },
  { level: 10, name: 'Expert', icon: '🏅', color: '#f59e0b' },
  { level: 20, name: 'Virtuoso', icon: '💎', color: '#8b5cf6' },
  { level: 50, name: 'Musical Deity', icon: '🌌', color: '#10b981' }
];

const DAILY_CHALLENGES = [
  { id: 'piano_pro', virtue: 'harmony', description: 'Play 50 notes on the Grand Piano', goal: 50, xp: 200 },
  { id: 'beat_maker', virtue: 'rhythm', description: 'Create 10 drum patterns', goal: 10, xp: 250 },
  { id: 'sound_sculptor', virtue: 'timbre', description: 'Change 20 synth parameters', goal: 20, xp: 300 },
  { id: 'ai_composer', virtue: 'innovation', description: 'Generate 5 AI compositions', goal: 5, xp: 500 }
];

const Virtues = ({ stats }) => {
  const [virtues, setVirtues] = useState(() => {
    const saved = localStorage.getItem('virtuo_virtues');
    return saved ? JSON.parse(saved) : {
      harmony: { xp: 150, level: 1 },
      rhythm: { xp: 450, level: 2 },
      timbre: { xp: 80, level: 0 },
      expression: { xp: 200, level: 1 },
      innovation: { xp: 300, level: 2 },
      theory: { xp: 120, level: 1 }
    };
  });

  const [activeVirtue, setActiveVirtue] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'rewards' | 'leaderboard' | 'achievements' | 'specializations' | 'collectibles' | 'quests' | 'stats' | 'profile' | 'gear' | 'trials' | 'archetypes' | 'prestige' | 'deck' | 'forge' | 'familiar' | 'relics' | 'garden' | 'alchemy' | 'synergies' | 'expeditions' | 'gems' | 'constellations'
  const [challenges, setChallenges] = useState(() => {
    const saved = localStorage.getItem('virtuo_challenges');
    return saved ? JSON.parse(saved) : DAILY_CHALLENGES.map(c => ({ ...c, progress: 0, completed: false }));
  });

  const [expeditions, setExpeditions] = useState(() => {
    const saved = localStorage.getItem('virtuo_expeditions');
    return saved ? JSON.parse(saved) : [];
  });

  const [ownedGems, setOwnedGems] = useState(() => {
    const saved = localStorage.getItem('virtuo_gems');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('virtuo_expeditions', JSON.stringify(expeditions));
  }, [expeditions]);

  useEffect(() => {
    localStorage.setItem('virtuo_gems', JSON.stringify(ownedGems));
  }, [ownedGems]);

  const startExpedition = (realm) => {
    const totalLevel = Object.values(virtues).reduce((acc, v) => acc + Math.floor(Math.sqrt(v.xp / 100)), 0);
    if (totalLevel < realm.difficulty * 10) {
      alert(`Expedition requires Total Level ${realm.difficulty * 10}!`);
      return;
    }

    if (expeditions.find(e => e.id === realm.id)) {
      alert('Familiar is already in this realm!');
      return;
    }

    const newExp = {
      ...realm,
      startTime: Date.now(),
      endTime: Date.now() + realm.duration * 1000,
      completed: false
    };

    setExpeditions(prev => [...prev, newExp]);
    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'EXPEDITION STARTED', message: `Heading to ${realm.name}`, type: 'info' }
    }));
  };

  const claimExpedition = (exp) => {
    setExpeditions(prev => prev.filter(e => e.id !== exp.id));
    
    if (exp.reward === 'shards') {
      setPrestigeShards(prev => prev + 1);
    } else {
      setEssences(prev => ({ ...prev, [exp.reward]: (prev[exp.reward] || 0) + 1 }));
    }

    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'EXPEDITION COMPLETE', message: `Retrieved rewards from ${exp.name}`, type: 'success' }
    }));
  };

  const craftGem = (gem) => {
    const hasShards = prestigeShards >= gem.cost.shards;
    const hasEssences = Object.entries(gem.cost.essences).every(([id, count]) => essences[id] >= count);

    if (!hasShards || !hasEssences) {
      alert('Not enough materials to craft this gem!');
      return;
    }

    setPrestigeShards(prev => prev - gem.cost.shards);
    setEssences(prev => {
      const next = { ...prev };
      Object.entries(gem.cost.essences).forEach(([id, count]) => {
        next[id] -= count;
      });
      return next;
    });

    setOwnedGems(prev => [...prev, gem]);
    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'GEM CRAFTED', message: gem.name, type: 'success' }
    }));
  };

  const [essences, setEssences] = useState(() => {
    const saved = localStorage.getItem('virtuo_essences');
    return saved ? JSON.parse(saved) : { e1: 0, e2: 0, e3: 0 };
  });

  useEffect(() => {
    localStorage.setItem('virtuo_essences', JSON.stringify(essences));
  }, [essences]);

  const craftElixir = (recipe) => {
    const hasIngredients = Object.entries(recipe.ingredients).every(([id, count]) => essences[id] >= count);
    if (!hasIngredients) {
      alert('Not enough essences!');
      return;
    }

    setEssences(prev => {
      const next = { ...prev };
      Object.entries(recipe.ingredients).forEach(([id, count]) => {
        next[id] -= count;
      });
      return next;
    });

    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'ELIXIR CRAFTED', message: recipe.name, type: 'success' }
    }));
  };

  const [equippedRelic, setEquippedRelic] = useState(() => {
    const saved = localStorage.getItem('virtuo_equipped_relic');
    return saved ? JSON.parse(saved) : null;
  });

  const [garden, setGarden] = useState(() => {
    const saved = localStorage.getItem('virtuo_garden');
    return saved ? JSON.parse(saved) : [];
  });

  const [ownedCards, setOwnedCards] = useState(() => {
    const saved = localStorage.getItem('virtuo_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const [archetype, setArchetype] = useState(() => {
    return localStorage.getItem('virtuo_archetype') || null;
  });

  const [prestigeShards, setPrestigeShards] = useState(() => {
    return Number(localStorage.getItem('virtuo_prestige_shards')) || 0;
  });

  const [prestigeTier, setPrestigeTier] = useState(() => {
    return Number(localStorage.getItem('virtuo_prestige_tier')) || 0;
  });

  const [duelResult, setDuelResult] = useState(null);

  const performDuel = (rival) => {
    const userTotalLevel = Object.values(virtues).reduce((acc, v) => acc + Math.floor(Math.sqrt(v.xp / 100)), 0);
    const winChance = Math.min(0.9, Math.max(0.1, (userTotalLevel / rival.level) * 0.5));
    const win = Math.random() < winChance;

    if (win) {
      window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
        detail: { virtue: rival.dominant, amount: 500 }
      }));
      setDuelResult({ win: true, rival: rival.name, reward: `500 ${rival.dominant} XP` });
    } else {
      setDuelResult({ win: false, rival: rival.name });
    }

    setTimeout(() => setDuelResult(null), 5000);
  };

  const [ownedGear, setOwnedGear] = useState(() => {
    const saved = localStorage.getItem('virtuo_gear');
    return saved ? JSON.parse(saved) : [];
  });

  const [equippedGear, setEquippedGear] = useState(() => {
    const saved = localStorage.getItem('virtuo_equipped_gear');
    return saved ? JSON.parse(saved) : null;
  });

  const [quests, setQuests] = useState(() => {
    const saved = localStorage.getItem('virtuo_quests');
    return saved ? JSON.parse(saved) : EPIC_QUESTS.map(q => ({ ...q, progress: 0, completed: false }));
  });

  const [unlockedSpecializations, setUnlockedSpecializations] = useState(() => {
    const saved = localStorage.getItem('virtuo_specs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleGainXP = (e) => {
      const { virtue, amount } = e.detail;
      if (virtues[virtue]) {
        setVirtues(prev => ({
          ...prev,
          [virtue]: {
            ...prev[virtue],
            xp: prev[virtue].xp + amount
          }
        }));
      }

      // Update challenge progress
      setChallenges(prev => prev.map(c => {
        if (c.virtue === virtue && !c.completed) {
          const newProgress = c.progress + 1; // Assuming 1 unit per action
          if (newProgress >= c.goal) {
            // Reward bonus XP
            window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
              detail: { virtue: c.virtue, amount: c.xp }
            }));

            // Update Epic Quest 1 Progress
            setQuests(qprev => qprev.map(q => {
              if (q.id === 'q1' && !q.completed) {
                const nextP = q.progress + 1;
                if (nextP >= q.goal) return { ...q, progress: q.goal, completed: true };
                return { ...q, progress: nextP };
              }
              return q;
            }));

            return { ...c, progress: c.goal, completed: true };
          }
          return { ...c, progress: newProgress };
        }
        return c;
      }));
    };

    window.addEventListener('virtuo-gain-xp', handleGainXP);
    return () => window.removeEventListener('virtuo-gain-xp', handleGainXP);
  }, [virtues]);

  useEffect(() => {
    localStorage.setItem('virtuo_virtues', JSON.stringify(virtues));
  }, [virtues]);

  useEffect(() => {
    localStorage.setItem('virtuo_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem('virtuo_specs', JSON.stringify(unlockedSpecializations));
  }, [unlockedSpecializations]);

  useEffect(() => {
    localStorage.setItem('virtuo_quests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('virtuo_gear', JSON.stringify(ownedGear));
  }, [ownedGear]);

  useEffect(() => {
    localStorage.setItem('virtuo_equipped_gear', JSON.stringify(equippedGear));
  }, [equippedGear]);

  useEffect(() => {
    localStorage.setItem('virtuo_cards', JSON.stringify(ownedCards));
  }, [ownedCards]);

  const buyCard = (card) => {
    const totalXP = Object.values(virtues).reduce((acc, v) => acc + v.xp, 0);
    if (totalXP < card.cost) {
      alert('Not enough total XP to purchase this card!');
      return;
    }

    if (ownedCards.find(c => c.id === card.id)) return;

    // Deduct cost
    let remaining = card.cost;
    const newVirtues = { ...virtues };
    Object.keys(newVirtues).forEach(v => {
      const take = Math.min(newVirtues[v].xp, remaining);
      newVirtues[v].xp -= take;
      remaining -= take;
    });

    setVirtues(newVirtues);
    setOwnedCards(prev => [...prev, card]);
    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'CARD UNLOCKED', message: card.name, type: 'success' }
    }));
  };

  const playCard = (card) => {
    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'TECHNIQUE ACTIVE', message: card.name, type: 'info' }
    }));
    // Trigger global aura pulse in App.jsx
    window.dispatchEvent(new CustomEvent('virtuo-aura-pulse', { detail: { color: VIRTUE_DATA[card.type].color } }));
  };

  const craftGear = (recipe) => {
    const materials = recipe.materials;
    const currentCollectibles = JSON.parse(localStorage.getItem('virtuo_collectibles')) || [];
    
    if (prestigeShards < materials.shards || currentCollectibles.length < materials.collectibles) {
      alert('Not enough materials to forge this item!');
      return;
    }

    setPrestigeShards(prev => prev - materials.shards);
    // Remove 1 collectible (simple logic)
    const newCollectibles = [...currentCollectibles];
    newCollectibles.pop();
    localStorage.setItem('virtuo_collectibles', JSON.stringify(newCollectibles));

    const gear = VIRTUE_GEAR.find(g => g.id === recipe.result);
    setOwnedGear(prev => [...prev, gear]);

    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'FORGE COMPLETE', message: `Crafted ${recipe.name}!`, type: 'success' }
    }));
  };

  useEffect(() => {
    if (archetype) localStorage.setItem('virtuo_archetype', archetype);
  }, [archetype]);

  useEffect(() => {
    localStorage.setItem('virtuo_prestige_shards', prestigeShards);
  }, [prestigeShards]);

  useEffect(() => {
    localStorage.setItem('virtuo_prestige_tier', prestigeTier);
  }, [prestigeTier]);

  const selectArchetype = (id) => {
    const totalLevel = Object.values(virtues).reduce((acc, v) => acc + Math.floor(Math.sqrt(v.xp / 100)), 0);
    if (totalLevel < 10) {
      alert('Archetypes unlock at Total Level 10!');
      return;
    }
    setArchetype(id);
    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'ARCHETYPE SELECTED', message: ARCHETYPES.find(a => a.id === id).name, type: 'success' }
    }));
  };

  const performPrestige = () => {
    const totalLevel = Object.values(virtues).reduce((acc, v) => acc + Math.floor(Math.sqrt(v.xp / 100)), 0);
    if (totalLevel < 100) {
      alert('Prestige requires Total Level 100!');
      return;
    }

    if (!window.confirm('PRESTIGE will reset all virtue levels to 1, but you will earn 5 Mastery Shards. Proceed?')) {
      return;
    }

    // Reset virtues
    const resetVirtues = {};
    Object.keys(virtues).forEach(v => {
      resetVirtues[v] = { xp: 100 }; // Level 1
    });
    setVirtues(resetVirtues);
    setPrestigeShards(prev => prev + 5);
    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'PRESTIGE ACHIEVED', message: 'Earned 5 Mastery Shards!', type: 'success' }
    }));
  };

  const upgradePrestige = (tier) => {
    if (prestigeShards < tier.shardCost) {
      alert('Not enough Mastery Shards!');
      return;
    }
    setPrestigeShards(prev => prev - tier.shardCost);
    setPrestigeTier(tier.tier);
    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'PRESTIGE UPGRADED', message: tier.name, type: 'success' }
    }));
  };

  const buyGear = (gear) => {
    const totalXP = Object.values(virtues).reduce((acc, v) => acc + v.xp, 0);
    if (totalXP < gear.cost) {
      alert('Not enough total XP to purchase this gear!');
      return;
    }

    if (ownedGear.find(g => g.id === gear.id)) return;

    // Deduct cost
    let remaining = gear.cost;
    const newVirtues = { ...virtues };
    Object.keys(newVirtues).forEach(v => {
      const take = Math.min(newVirtues[v].xp, remaining);
      newVirtues[v].xp -= take;
      remaining -= take;
    });

    setVirtues(newVirtues);
    setOwnedGear(prev => [...prev, gear]);
    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'GEAR PURCHASED', message: gear.name, type: 'success' }
    }));
  };

  const equipGear = (gear) => {
    if (equippedGear?.id === gear.id) {
      setEquippedGear(null);
    } else {
      setEquippedGear(gear);
      window.dispatchEvent(new CustomEvent('virtuo-notification', {
        detail: { title: 'GEAR EQUIPPED', message: gear.name, type: 'info' }
      }));
    }
  };

  const unlockSpecialization = (virtueKey, spec) => {
    const level = Math.floor(Math.sqrt(virtues[virtueKey].xp / 100));
    if (level < spec.cost) {
      alert(`You need to be at least Level ${spec.cost} in ${virtueKey} to unlock this specialization!`);
      return;
    }

    if (unlockedSpecializations.includes(spec.id)) return;

    setUnlockedSpecializations(prev => [...prev, spec.id]);
    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'SPECIALIZATION UNLOCKED', message: spec.name, type: 'success' }
    }));
  };

  const purchasePerk = (perk) => {
    const totalXP = Object.values(virtues).reduce((acc, v) => acc + v.xp, 0);
    if (totalXP < perk.cost) {
      alert('Not enough total XP to purchase this perk!');
      return;
    }

    // Deduct cost from the virtue with the highest XP
    let maxVirtue = 'innovation';
    let maxXP = -1;
    Object.entries(virtues).forEach(([v, data]) => {
      if (data.xp > maxXP) {
        maxXP = data.xp;
        maxVirtue = v;
      }
    });

    setVirtues(prev => ({
      ...prev,
      [maxVirtue]: { ...prev[maxVirtue], xp: prev[maxVirtue].xp - perk.cost }
    }));

    // Update Epic Quest 2 Progress
    setQuests(qprev => qprev.map(q => {
      if (q.id === 'q2' && !q.completed) {
        const nextP = q.progress + perk.cost;
        if (nextP >= q.goal) return { ...q, progress: q.goal, completed: true };
        return { ...q, progress: nextP };
      }
      return q;
    }));

    alert(`Purchased ${perk.name}! Perk effect activated.`);
  };

  const getLevelInfo = (xp) => {
    // Basic level calculation: level = floor(sqrt(xp/100))
    const level = Math.floor(Math.sqrt(xp / 100));
    const nextLevelXp = Math.pow(level + 1, 2) * 100;
    const currentLevelXp = Math.pow(level, 2) * 100;
    const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    
    return { level, nextLevelXp, progress };
  };

  return (
    <div className="virtues-container" style={{ width: '100%', maxWidth: '1200px', padding: '20px' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Musical Virtues</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Your journey towards musical mastery</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px', flexWrap: 'wrap' }}>
          {['overview', 'rewards', 'leaderboard', 'achievements', 'specializations', 'collectibles', 'quests', 'stats', 'profile', 'gear', 'trials', 'archetypes', 'prestige', 'deck', 'forge', 'familiar', 'relics', 'garden', 'alchemy', 'synergies', 'expeditions', 'gems', 'constellations'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn-glass"
              style={{ 
                padding: '8px 20px', 
                fontSize: '0.85rem', 
                textTransform: 'capitalize',
                borderColor: activeTab === tab ? 'var(--accent-primary)' : 'var(--glass-border)',
                color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-muted)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'overview' && (
        <>
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={20} color="#f59e0b" /> Daily Challenges
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {challenges.map(challenge => (
                <div 
                  key={challenge.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '15px', 
                    border: challenge.completed ? '1px solid #10b981' : '1px solid var(--glass-border)',
                    opacity: challenge.completed ? 0.7 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: VIRTUE_DATA[challenge.virtue].color }}>
                      {challenge.virtue.toUpperCase()}
                    </span>
                    {challenge.completed && <CheckCircle2 size={16} color="#10b981" />}
                  </div>
                  <p style={{ fontSize: '0.9rem', margin: '0 0 10px 0' }}>{challenge.description}</p>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${(challenge.progress / challenge.goal) * 100}%`, 
                        background: challenge.completed ? '#10b981' : VIRTUE_DATA[challenge.virtue].color 
                      }} 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>{challenge.progress} / {challenge.goal}</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>+{challenge.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Crown size={20} color="#8b5cf6" /> Musical Soul Perks
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {VIRTUE_PERKS.map(perk => (
                <div 
                  key={perk.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '20px', 
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: '#8b5cf6' }}>{perk.icon}</div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{perk.name}</h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{perk.description}</p>
                  <button 
                    className="btn-glass"
                    onClick={() => purchasePerk(perk)}
                    style={{ marginTop: '10px', width: '100%', borderColor: '#8b5cf6', color: '#8b5cf6', fontSize: '0.8rem' }}
                  >
                    Unlock for {perk.cost} XP
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {Object.entries(VIRTUE_DATA).map(([key, data]) => {
              const { xp } = virtues[key];
              const { level, nextLevelXp, progress } = getLevelInfo(xp);
              const isSelected = activeVirtue === key;

              return (
                <motion.div
                  key={key}
                  layout
                  className="glass-panel"
                  onClick={() => setActiveVirtue(isSelected ? null : key)}
                  style={{
                    padding: '25px',
                    cursor: 'pointer',
                    border: isSelected ? `2px solid ${data.color}` : '1px solid var(--glass-border)',
                    boxShadow: isSelected ? `0 0 30px ${data.color}40` : 'none',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                    <div 
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '15px', 
                        background: `${data.color}20`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: data.color,
                        boxShadow: `0 0 15px ${data.color}30`
                      }}
                    >
                      {data.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>{data.name}</h3>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {MASTERY_BADGES.map(badge => (
                            level >= badge.level && (
                              <span 
                                key={badge.level} 
                                title={`${badge.name} (Lvl ${badge.level})`}
                                style={{ fontSize: '1.2rem', filter: `drop-shadow(0 0 5px ${badge.color})` }}
                              >
                                {badge.icon}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: data.color, fontWeight: 600 }}>Level {level}</span>
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
                    {data.description}
                  </p>

                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px', color: 'var(--text-muted)' }}>
                      <span>{xp} XP</span>
                      <span>{nextLevelXp} XP</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        style={{ height: '100%', background: data.color, boxShadow: `0 0 10px ${data.color}80` }}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}
                      >
                        <h4 style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--text-main)' }}>Milestones</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {data.milestones.map((milestone, idx) => {
                            const isReached = level >= milestone.level;
                            return (
                              <div 
                                key={idx} 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '12px', 
                                  padding: '10px', 
                                  background: isReached ? `${data.color}10` : 'rgba(0,0,0,0.2)', 
                                  borderRadius: '8px',
                                  opacity: isReached ? 1 : 0.5
                                }}
                              >
                                {isReached ? <CheckCircle2 size={16} color={data.color} /> : <Lock size={16} />}
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{milestone.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Level {milestone.level}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'rewards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {UNLOCKABLES.map(reward => {
            const currentLevel = Math.floor(Math.sqrt(virtues[reward.virtue].xp / 100));
            const isUnlocked = currentLevel >= reward.level;
            
            return (
              <div 
                key={reward.id} 
                className="glass-panel" 
                style={{ 
                  padding: '30px', 
                  textAlign: 'center',
                  border: isUnlocked ? `1px solid ${VIRTUE_DATA[reward.virtue].color}` : '1px solid var(--glass-border)',
                  opacity: isUnlocked ? 1 : 0.5
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{isUnlocked ? reward.icon : '🔒'}</div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{reward.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Unlocks at {reward.virtue} Level {reward.level}
                </p>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isUnlocked ? '#10b981' : '#ef4444' }}>
                  {isUnlocked ? 'READY TO DOWNLOAD' : `LOCKED (Current: ${currentLevel})`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="glass-panel" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '30px', textAlign: 'center' }}>Global Virtuoso Rankings</h3>
          
          <AnimatePresence>
            {duelResult && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  padding: '15px',
                  borderRadius: '10px',
                  background: duelResult.win ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  border: `1px solid ${duelResult.win ? '#10b981' : '#ef4444'}`,
                  marginBottom: '20px',
                  textAlign: 'center'
                }}
              >
                <strong>{duelResult.win ? 'VICTORY!' : 'DEFEAT!'}</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                  {duelResult.win 
                    ? `You defeated ${duelResult.rival} and earned ${duelResult.reward}!` 
                    : `You were defeated by ${duelResult.rival}. Keep training!`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {LEADERBOARD.map(player => (
              <div 
                key={player.rank} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px', 
                  padding: '15px 25px', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)'
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: player.rank === 1 ? '#f59e0b' : 'var(--text-muted)', width: '40px' }}>
                  #{player.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{player.name}</div>
                  <div style={{ fontSize: '0.8rem', color: VIRTUE_DATA[player.dominant].color, textTransform: 'uppercase' }}>
                    Dominant: {player.dominant}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-primary)' }}>LVL {player.level}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL VIRTUE</div>
                  </div>
                  <button 
                    className="btn-glass"
                    onClick={() => performDuel(player)}
                    style={{ padding: '5px 15px', fontSize: '0.7rem', borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    DUEL
                  </button>
                </div>
              </div>
            ))}
            
            <div style={{ marginTop: '20px', padding: '20px', background: 'var(--accent-primary)10', borderRadius: '12px', border: '1px dashed var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-muted)', width: '40px' }}>?</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>YOU (Local Artist)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Keep playing to climb the ranks!</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-primary)' }}>LVL {Object.values(virtues).reduce((acc, v) => acc + Math.floor(Math.sqrt(v.xp / 100)), 0)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CURRENT STATUS</div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '30px' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '25px', textAlign: 'center' }}>Virtue Echoes (Timeline)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {stats.timeline && stats.timeline.length > 0 ? (
                stats.timeline.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', borderLeft: `4px solid ${VIRTUE_DATA[item.virtue].color}` }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '80px' }}>{item.timestamp}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, color: VIRTUE_DATA[item.virtue].color }}>{VIRTUE_DATA[item.virtue].name}</span>
                      <span style={{ color: 'var(--text-muted)' }}> Level Up! Reached </span>
                      <span style={{ fontWeight: 900 }}>Level {item.level}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No echoes recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deck' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', background: 'rgba(59, 130, 246, 0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Musical Technique Deck</h3>
            <p style={{ color: 'var(--text-muted)' }}>Unlock and play technique cards to modify your performance and boost XP.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {TECHNIQUE_CARDS.map(card => {
              const isOwned = ownedCards.find(c => c.id === card.id);
              return (
                <motion.div 
                  key={card.id} 
                  className="glass-panel" 
                  whileHover={{ y: -5 }}
                  style={{ 
                    padding: '25px', 
                    textAlign: 'center',
                    border: isOwned ? `1px solid ${VIRTUE_DATA[card.type].color}` : '1px solid var(--glass-border)',
                    opacity: 1
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{card.icon}</div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{card.name}</h4>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: VIRTUE_DATA[card.type].color, marginBottom: '10px' }}>{card.type.toUpperCase()}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{card.desc}</p>
                  
                  {isOwned ? (
                    <button 
                      className="btn-glass"
                      onClick={() => playCard(card)}
                      style={{ width: '100%', borderColor: VIRTUE_DATA[card.type].color }}
                    >
                      PLAY CARD
                    </button>
                  ) : (
                    <button 
                      className="btn-glass"
                      onClick={() => buyCard(card)}
                      style={{ width: '100%' }}
                    >
                      Unlock for {card.cost} XP
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'forge' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#10b981' }}>Virtue Forge</h3>
            <p style={{ color: 'var(--text-muted)' }}>Combine Mastery Shards and rare Collectibles to craft legendary gear.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {FORGE_RECIPES.map(recipe => {
              const currentCollectibles = JSON.parse(localStorage.getItem('virtuo_collectibles')) || [];
              const hasShards = prestigeShards >= recipe.materials.shards;
              const hasColl = currentCollectibles.length >= recipe.materials.collectibles;
              const canCraft = hasShards && hasColl;

              return (
                <div 
                  key={recipe.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '25px', 
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.2rem', margin: 0 }}>{recipe.name}</h4>
                    <div style={{ fontSize: '2rem' }}>{recipe.icon}</div>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px' }}>REQUIRED MATERIALS</div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: hasShards ? '#f59e0b' : '#ef4444' }}>{prestigeShards}/{recipe.materials.shards}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>SHARDS</div>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: hasColl ? '#3b82f6' : '#ef4444' }}>{currentCollectibles.length}/{recipe.materials.collectibles}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>COLLECTIBLES</div>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="btn-glass"
                    onClick={() => craftGear(recipe)}
                    style={{ width: '100%', borderColor: canCraft ? '#10b981' : 'var(--glass-border)', color: canCraft ? '#10b981' : 'var(--text-muted)' }}
                    disabled={!canCraft}
                  >
                    {canCraft ? 'FORGE ITEM' : 'INSUFFICIENT MATERIALS'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'familiar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Familiar Sanctuary</h3>
            <p style={{ color: 'var(--text-muted)' }}>Upgrade your companion's traits and abilities using your Musical Soul (XP).</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {[
              { id: 'f_t1', name: 'Luminous Aura', desc: 'Increases the familiar\'s glow intensity.', cost: 1000, icon: '✨' },
              { id: 'f_t2', name: 'Sonic Scout', desc: 'Occasionally finds extra XP for your lowest virtue.', cost: 2500, icon: '🔍' },
              { id: 'f_t3', name: 'Rhythm Dancer', desc: 'Syncs movement perfectly with the master metronome.', cost: 1500, icon: '💃' },
              { id: 'f_t4', name: 'Ethereal Echo', desc: 'Leaves a trailing visual path as it moves.', cost: 3000, icon: '☄️' }
            ].map(trait => {
              const isUnlocked = (JSON.parse(localStorage.getItem('virtuo_familiar_traits')) || []).includes(trait.id);
              return (
                <div 
                  key={trait.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '25px', 
                    textAlign: 'center',
                    border: isUnlocked ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                    opacity: 1
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{trait.icon}</div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{trait.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{trait.desc}</p>
                  
                  {isUnlocked ? (
                    <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.8rem' }}>TRAIT ACTIVE</div>
                  ) : (
                    <button 
                      className="btn-glass"
                      onClick={() => {
                        const totalXP = Object.values(virtues).reduce((acc, v) => acc + v.xp, 0);
                        if (totalXP < trait.cost) {
                          alert('Not enough XP!');
                          return;
                        }
                        const traits = JSON.parse(localStorage.getItem('virtuo_familiar_traits')) || [];
                        localStorage.setItem('virtuo_familiar_traits', JSON.stringify([...traits, trait.id]));
                        window.dispatchEvent(new CustomEvent('virtuo-notification', {
                          detail: { title: 'TRAIT UNLOCKED', message: trait.name, type: 'success' }
                        }));
                        setActiveTab('familiar'); // Force re-render
                      }}
                      style={{ width: '100%' }}
                    >
                      Unlock for {trait.cost} XP
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'relics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', background: 'rgba(139, 92, 246, 0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Ancient Virtuo Relics</h3>
            <p style={{ color: 'var(--text-muted)' }}>Powerful global artifacts that change the fundamental rules of the studio.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {VIRTUE_RELICS.map(relic => {
              const isEquipped = equippedRelic?.id === relic.id;
              return (
                <div 
                  key={relic.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '25px', 
                    textAlign: 'center',
                    border: isEquipped ? `2px solid #8b5cf6` : '1px solid var(--glass-border)',
                    opacity: 1
                  }}
                >
                  <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>{relic.icon}</div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{relic.name}</h4>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#8b5cf6', marginBottom: '10px' }}>GLOBAL RELIC</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{relic.desc}</p>
                  
                  <button 
                    className={`btn-glass ${isEquipped ? 'active' : ''}`}
                    onClick={() => {
                      if (isEquipped) {
                        setEquippedRelic(null);
                        localStorage.removeItem('virtuo_equipped_relic');
                      } else {
                        setEquippedRelic(relic);
                        localStorage.setItem('virtuo_equipped_relic', JSON.stringify(relic));
                        window.dispatchEvent(new CustomEvent('virtuo-notification', {
                          detail: { title: 'RELIC SLOTTED', message: relic.name, type: 'info' }
                        }));
                      }
                    }}
                    style={{ width: '100%', borderColor: isEquipped ? '#ef4444' : '#8b5cf6' }}
                  >
                    {isEquipped ? 'Unequip' : 'Slot Relic'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'garden' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Musical Garden</h3>
            <p style={{ color: 'var(--text-muted)' }}>Plant Sound Seeds that grow into unique samples as you earn Virtue XP.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {SOUND_SEEDS.map(seed => {
              const currentSeed = garden.find(s => s.id === seed.id);
              const progress = currentSeed ? Math.min(100, (currentSeed.growth / seed.growthTime) * 100) : 0;
              const isGrown = progress >= 100;

              return (
                <div 
                  key={seed.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '25px', 
                    textAlign: 'center',
                    border: isGrown ? '2px solid #10b981' : '1px solid var(--glass-border)',
                    opacity: 1
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{isGrown ? '🌳' : seed.icon}</div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{seed.name}</h4>
                  
                  {currentSeed ? (
                    <>
                      <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          style={{ height: '100%', background: '#10b981' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        {isGrown ? 'FULLY GROWN' : `GROWING: ${Math.round(progress)}%`}
                      </div>
                      {isGrown && (
                        <button 
                          className="btn-glass"
                          onClick={() => {
                            setGarden(prev => prev.filter(s => s.id !== seed.id));
                            localStorage.setItem('virtuo_garden', JSON.stringify(garden.filter(s => s.id !== seed.id)));
                            window.dispatchEvent(new CustomEvent('virtuo-notification', {
                              detail: { title: 'SAMPLE HARVESTED', message: `Added ${seed.name} to Library`, type: 'success' }
                            }));
                          }}
                          style={{ width: '100%', borderColor: '#10b981', color: '#10b981' }}
                        >
                          Harvest Sample
                        </button>
                      )}
                    </>
                  ) : (
                    <button 
                      className="btn-glass"
                      onClick={() => {
                        const newSeed = { ...seed, growth: 0, startTime: Date.now() };
                        setGarden(prev => [...prev, newSeed]);
                        localStorage.setItem('virtuo_garden', JSON.stringify([...garden, newSeed]));
                        window.dispatchEvent(new CustomEvent('virtuo-notification', {
                          detail: { title: 'SEED PLANTED', message: seed.name, type: 'info' }
                        }));
                      }}
                      style={{ width: '100%' }}
                    >
                      Plant Seed
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'archetypes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Musical Archetypes</h3>
            <p style={{ color: 'var(--text-muted)' }}>Specialized paths that define your musical identity and provide unique XP bonuses.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {ARCHETYPES.map(arc => (
              <div 
                key={arc.id} 
                className="glass-panel" 
                style={{ 
                  padding: '30px', 
                  textAlign: 'center',
                  border: archetype === arc.id ? `2px solid ${arc.color}` : '1px solid var(--glass-border)',
                  boxShadow: archetype === arc.id ? `0 0 20px ${arc.color}40` : 'none',
                  opacity: 1
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{arc.icon}</div>
                <h4 style={{ fontSize: '1.3rem', marginBottom: '10px', color: arc.color }}>{arc.name}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '25px' }}>{arc.desc}</p>
                <button 
                  className={`btn-glass ${archetype === arc.id ? 'active' : ''}`}
                  onClick={() => selectArchetype(arc.id)}
                  style={{ width: '100%', borderColor: arc.color }}
                >
                  {archetype === arc.id ? 'SELECTED' : 'SELECT ARCHETYPE'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prestige' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(0,0,0,0.4))' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '10px', color: '#8b5cf6' }}>Prestige System</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Reset your progress to earn Mastery Shards and unlock permanent studio-wide upgrades.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '30px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f59e0b' }}>{prestigeShards}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mastery Shards</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#8b5cf6' }}>{prestigeTier}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Tier</div>
              </div>
            </div>
            <button 
              className="btn-glass"
              onClick={performPrestige}
              style={{ padding: '15px 40px', fontSize: '1.1rem', borderColor: '#8b5cf6', color: '#8b5cf6' }}
            >
              PERFORM PRESTIGE (REQ LVL 100)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {PRESTIGE_TIERS.map(tier => (
              <div 
                key={tier.tier} 
                className="glass-panel" 
                style={{ 
                  padding: '30px', 
                  textAlign: 'center',
                  border: prestigeTier >= tier.tier ? '2px solid #10b981' : '1px solid var(--glass-border)',
                  opacity: prestigeTier >= tier.tier ? 1 : 0.6
                }}
              >
                <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{tier.name}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{tier.bonus}</p>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '20px' }}>Cost: {tier.shardCost} Shards</div>
                <button 
                  className={`btn-glass ${prestigeTier >= tier.tier ? 'active' : ''}`}
                  onClick={() => upgradePrestige(tier)}
                  style={{ width: '100%', borderColor: prestigeTier >= tier.tier ? '#10b981' : 'var(--glass-border)' }}
                  disabled={prestigeTier >= tier.tier}
                >
                  {prestigeTier >= tier.tier ? 'UNLOCKED' : 'UPGRADE'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'gear' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Musical Gear</h3>
            <p style={{ color: 'var(--text-muted)' }}>Equip powerful artifacts to boost your XP gain.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {VIRTUE_GEAR.map(gear => {
              const isOwned = ownedGear.find(g => g.id === gear.id);
              const isEquipped = equippedGear?.id === gear.id;
              
              return (
                <div 
                  key={gear.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '25px', 
                    textAlign: 'center',
                    border: isEquipped ? `2px solid var(--accent-primary)` : '1px solid var(--glass-border)',
                    opacity: isOwned ? 1 : 0.6
                  }}
                >
                  <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>{gear.icon}</div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{gear.name}</h4>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent-primary)', marginBottom: '10px' }}>{gear.rarity.toUpperCase()}</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    Boosts {gear.virtue} XP gain by <strong>{Math.round((gear.boost - 1) * 100)}%</strong>
                  </p>
                  
                  {isOwned ? (
                    <button 
                      className={`btn-glass ${isEquipped ? 'active' : ''}`}
                      onClick={() => equipGear(gear)}
                      style={{ width: '100%', borderColor: isEquipped ? '#ef4444' : 'var(--accent-primary)' }}
                    >
                      {isEquipped ? 'Unequip' : 'Equip Gear'}
                    </button>
                  ) : (
                    <button 
                      className="btn-glass"
                      onClick={() => buyGear(gear)}
                      style={{ width: '100%' }}
                    >
                      Buy for {gear.cost} XP
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'trials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#ef4444' }}>Virtue Trials</h3>
            <p style={{ color: 'var(--text-muted)' }}>High-stakes timed challenges for legendary rewards.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {VIRTUE_TRIALS.map(trial => {
              const rewardGear = VIRTUE_GEAR.find(g => g.id === trial.reward);
              return (
                <div 
                  key={trial.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '25px', 
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h4 style={{ fontSize: '1.2rem', margin: 0 }}>{trial.name}</h4>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ef4444' }}>{trial.difficulty.toUpperCase()}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{trial.objective}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '2rem' }}>{rewardGear?.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>POTENTIAL REWARD</div>
                      <div style={{ fontWeight: 700 }}>{rewardGear?.name}</div>
                    </div>
                  </div>

                  <button 
                    className="btn-glass"
                    onClick={() => setActiveTab('profile')} // Just a placeholder for now
                    style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    Enter Trial
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel" 
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              padding: '40px', 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(138, 43, 226, 0.1))',
              border: '1px solid rgba(255,255,255,0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background Glow */}
            <div style={{ 
              position: 'absolute', 
              top: '-50%', 
              left: '-50%', 
              width: '200%', 
              height: '200%', 
              background: 'radial-gradient(circle, rgba(138, 43, 226, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.05)', 
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--accent-primary)',
                boxShadow: '0 0 30px rgba(138, 43, 226, 0.3)'
              }}>
                <User size={60} color="var(--accent-primary)" />
              </div>

              <h3 style={{ fontSize: '2rem', marginBottom: '5px' }}>Virtuo Artist</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#f59e0b', marginBottom: '30px' }}>
                <Shield size={16} />
                <span style={{ fontSize: '1rem', fontWeight: 800 }}>LVL {Object.values(virtues).reduce((acc, v) => acc + Math.floor(Math.sqrt(v.xp / 100)), 0)}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '5px' }}>Dominant Virtue</div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {Object.entries(virtues).reduce((a, b) => b[1].xp > a[1].xp ? b : a)[0].toUpperCase()}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '5px' }}>Production Time</div>
                  <div style={{ fontWeight: 700 }}>{stats ? Math.floor(stats.totalTime / 3600) + 'h' : '0h'}</div>
                </div>
              </div>

              <div style={{ textAlign: 'left', marginBottom: '40px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '15px', opacity: 0.6 }}>Virtue Levels</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(VIRTUE_DATA).map(([key, data]) => {
                    const level = Math.floor(Math.sqrt(virtues[key].xp / 100));
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ color: data.color }}>{data.icon}</div>
                        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(level / 50) * 100}%`, background: data.color }} />
                        </div>
                        <div style={{ fontSize: '0.8rem', width: '30px', textAlign: 'right', fontWeight: 700 }}>{level}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button className="btn-glass" style={{ flex: 1, borderColor: 'var(--accent-primary)' }}>
                  <Camera size={16} /> Save Card
                </button>
                <button className="btn-glass" style={{ flex: 1 }}>
                  <Share2 size={16} /> Share Profile
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Musical Journey Stats</h3>
            <p style={{ color: 'var(--text-muted)' }}>Analyzing your growth as a virtuoso.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '25px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-primary)', marginBottom: '10px' }}>
                {Math.floor(stats.totalTime / 3600)}h {Math.floor((stats.totalTime % 3600) / 60)}m
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Production Time</div>
            </div>

            <div className="glass-panel" style={{ padding: '25px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f59e0b', marginBottom: '10px' }}>
                {Object.values(stats.xpDistribution).reduce((a, b) => a + b, 0)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total XP Earned</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '30px' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '25px', textAlign: 'center' }}>Virtue Distribution</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {Object.entries(stats.xpDistribution).map(([v, xp]) => {
                const totalXP = Object.values(stats.xpDistribution).reduce((a, b) => a + b, 0) || 1;
                const percentage = (xp / totalXP) * 100;
                const config = VIRTUE_DATA[v];
                
                return (
                  <div key={v}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: config.color }}>{config.icon}</span>
                        <span style={{ fontWeight: 700 }}>{config.name}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>{Math.round(percentage)}% ({xp} XP)</span>
                    </div>
                    <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        style={{ height: '100%', background: config.color, boxShadow: `0 0 10px ${config.color}80` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Epic Quests</h3>
            <p style={{ color: 'var(--text-muted)' }}>Long-term objectives for the ultimate virtuoso.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {quests.map(quest => (
              <div 
                key={quest.id} 
                className="glass-panel" 
                style={{ 
                  padding: '25px', 
                  border: quest.completed ? '1px solid #10b981' : '1px solid var(--glass-border)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <h4 style={{ fontSize: '1.2rem', margin: 0 }}>{quest.name}</h4>
                  {quest.completed && <CheckCircle2 size={20} color="#10b981" />}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{quest.desc}</p>
                
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                    <span>Progress</span>
                    <span>{Math.round((quest.progress / quest.goal) * 100)}%</span>
                  </div>
                  <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(quest.progress / quest.goal) * 100}%` }}
                      style={{ height: '100%', background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)80' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reward</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>{quest.reward}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>XP Boost</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)' }}>+{quest.xp} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'collectibles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {(JSON.parse(localStorage.getItem('virtuo_collectibles')) || []).length > 0 ? (
            (JSON.parse(localStorage.getItem('virtuo_collectibles')) || []).map(item => (
              <div 
                key={item.id} 
                className="glass-panel" 
                style={{ 
                  padding: '30px', 
                  textAlign: 'center',
                  border: '1px solid #f59e0b',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(0,0,0,0.2))'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{item.icon}</div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{item.name}</h4>
                <div style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 900, 
                  color: item.rarity === 'Legendary' ? '#8b5cf6' : (item.rarity === 'Epic' ? '#f59e0b' : '#3b82f6'),
                  textTransform: 'uppercase',
                  marginBottom: '5px'
                }}>
                  {item.rarity}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Related to {item.virtue}
                </p>
              </div>
            ))
          ) : (
            <div className="glass-panel" style={{ padding: '40px', gridColumn: '1 / -1', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                No collectibles found yet. Keep playing instruments to find rare musical artifacts!
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'specializations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {Object.entries(VIRTUE_DATA).map(([virtueKey, data]) => (
            <div key={virtueKey}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: data.color }}>
                {data.icon} {data.name} Mastery Tree
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {data.specializations.map(spec => {
                  const isUnlocked = unlockedSpecializations.includes(spec.id);
                  const canUnlock = Math.floor(Math.sqrt(virtues[virtueKey].xp / 100)) >= spec.cost;
                  
                  return (
                    <div 
                      key={spec.id} 
                      className="glass-panel" 
                      style={{ 
                        padding: '20px', 
                        border: isUnlocked ? `2px solid ${data.color}` : '1px solid var(--glass-border)',
                        opacity: isUnlocked || canUnlock ? 1 : 0.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        position: 'relative'
                      }}
                    >
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{spec.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{spec.desc}</p>
                      <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                        {isUnlocked ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.8rem', fontWeight: 800 }}>
                            <CheckCircle2 size={14} /> ACTIVE SPECIALIZATION
                          </div>
                        ) : (
                          <button 
                            className="btn-glass"
                            onClick={() => unlockSpecialization(virtueKey, spec)}
                            style={{ width: '100%', fontSize: '0.8rem', borderColor: canUnlock ? data.color : 'var(--glass-border)', color: canUnlock ? 'var(--text-main)' : 'var(--text-muted)' }}
                          >
                            Unlock at Level {spec.cost}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {ACHIEVEMENTS.map(achievement => {
            let isUnlocked = false;
            if (achievement.allLevel) {
              isUnlocked = Object.values(virtues).every(v => Math.floor(Math.sqrt(v.xp / 100)) >= achievement.allLevel);
            } else {
              const currentLevel = Math.floor(Math.sqrt(virtues[achievement.virtue].xp / 100));
              isUnlocked = currentLevel >= achievement.level;
            }

            return (
              <div 
                key={achievement.id} 
                className="glass-panel" 
                style={{ 
                  padding: '25px', 
                  textAlign: 'center',
                  border: isUnlocked ? '1px solid #f59e0b' : '1px solid var(--glass-border)',
                  background: isUnlocked ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(0,0,0,0.2))' : 'rgba(0,0,0,0.2)',
                  opacity: isUnlocked ? 1 : 0.4,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px', filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                  {achievement.trophy}
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: isUnlocked ? '#f59e0b' : 'var(--text-main)' }}>
                  {achievement.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  {achievement.description}
                </p>
                {isUnlocked && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '10px',
                      background: '#f59e0b',
                      color: 'black',
                      fontSize: '0.6rem',
                      fontWeight: 900,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    UNLOCKED
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'alchemy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', background: 'rgba(59, 130, 246, 0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Virtue Alchemy</h3>
            <p style={{ color: 'var(--text-muted)' }}>Transmute Virtue Essences into powerful temporary Elixirs.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
              {VIRTUE_ESSENCES.map(e => (
                <div key={e.id} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem' }}>{e.icon}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: e.color }}>{essences[e.id] || 0}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{e.name.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {ALCHEMY_RECIPES.map(recipe => {
              const hasIngredients = Object.entries(recipe.ingredients).every(([id, count]) => essences[id] >= count);
              return (
                <div 
                  key={recipe.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '25px', 
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.2rem', margin: 0 }}>{recipe.name}</h4>
                    <div style={{ fontSize: '2rem' }}>{recipe.icon}</div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{recipe.desc}</p>
                  
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px' }}>REQUIRED ESSENCES</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {Object.entries(recipe.ingredients).map(([id, count]) => {
                        const essence = VIRTUE_ESSENCES.find(e => e.id === id);
                        return (
                          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '1rem' }}>{essence.icon}</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: essences[id] >= count ? '#10b981' : '#ef4444' }}>
                              {essences[id]}/{count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    className="btn-glass"
                    onClick={() => craftElixir(recipe)}
                    style={{ width: '100%', borderColor: hasIngredients ? '#3b82f6' : 'var(--glass-border)', color: hasIngredients ? '#3b82f6' : 'var(--text-muted)' }}
                    disabled={!hasIngredients}
                  >
                    {hasIngredients ? 'CRAFT ELIXIR' : 'INSUFFICIENT ESSENCES'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'synergies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', background: 'rgba(139, 92, 246, 0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Virtue Synergies</h3>
            <p style={{ color: 'var(--text-muted)' }}>Powerful passive and active effects unlocked by mastering pairs of virtues.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {VIRTUE_SYNERGIES.map(synergy => {
              const isUnlocked = synergy.pair.every(v => Math.floor(Math.sqrt(virtues[v].xp / 100)) >= 10);
              return (
                <div 
                  key={synergy.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '25px', 
                    border: isUnlocked ? '2px solid #8b5cf6' : '1px solid var(--glass-border)',
                    opacity: isUnlocked ? 1 : 0.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.2rem', margin: 0 }}>{synergy.name}</h4>
                    <div style={{ fontSize: '2rem' }}>{synergy.icon}</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {synergy.pair.map(v => (
                      <div key={v} style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', background: `${VIRTUE_DATA[v].color}20`, color: VIRTUE_DATA[v].color, fontWeight: 900 }}>
                        {v.toUpperCase()}
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{synergy.desc}</p>
                  
                  {!isUnlocked && (
                    <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}>
                      REQUIRES LEVEL 10 IN BOTH VIRTUES
                    </div>
                  )}
                  
                  {isUnlocked && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.8rem', fontWeight: 800 }}>
                      <CheckCircle2 size={14} /> SYNERGY ACTIVE
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'expeditions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Realms Expeditions</h3>
            <p style={{ color: 'var(--text-muted)' }}>Send your familiar to explore distant musical realms and gather rare resources.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {REALMS.map(realm => {
              const activeExp = expeditions.find(e => e.id === realm.id);
              const isFinished = activeExp && Date.now() >= activeExp.endTime;
              const progress = activeExp ? Math.min(100, ((Date.now() - activeExp.startTime) / (activeExp.endTime - activeExp.startTime)) * 100) : 0;
              const totalLevel = Object.values(virtues).reduce((acc, v) => acc + Math.floor(Math.sqrt(v.xp / 100)), 0);
              const isLocked = totalLevel < realm.difficulty * 10;

              return (
                <div 
                  key={realm.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '25px', 
                    textAlign: 'center',
                    border: activeExp ? `1px solid var(--accent-primary)` : '1px solid var(--glass-border)',
                    opacity: isLocked ? 0.5 : 1
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{realm.icon}</div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{realm.name}</h4>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                    {isLocked ? `LOCKED (REQ LVL ${realm.difficulty * 10})` : `DIFFICULTY: ${realm.difficulty}`}
                  </div>

                  {activeExp ? (
                    <>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                        <motion.div 
                          animate={{ width: `${progress}%` }}
                          style={{ height: '100%', background: isFinished ? '#10b981' : 'var(--accent-primary)' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        {isFinished ? 'READY TO CLAIM' : `${Math.floor((activeExp.endTime - Date.now()) / 1000)}s REMAINING`}
                      </div>
                      {isFinished && (
                        <button 
                          className="btn-glass"
                          onClick={() => claimExpedition(activeExp)}
                          style={{ width: '100%', borderColor: '#10b981', color: '#10b981' }}
                        >
                          Claim Rewards
                        </button>
                      )}
                    </>
                  ) : (
                    <button 
                      className="btn-glass"
                      onClick={() => startExpedition(realm)}
                      disabled={isLocked}
                      style={{ width: '100%' }}
                    >
                      {isLocked ? 'LEVEL TOO LOW' : `START (${realm.duration}s)`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'gems' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Virtue Gems</h3>
            <p style={{ color: 'var(--text-muted)' }}>Craft powerful artifacts to enhance your instrument performance.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {VIRTUE_GEMS.map(gem => {
              const isOwned = ownedGems.find(g => g.id === gem.id);
              const hasShards = prestigeShards >= gem.cost.shards;
              const hasEssences = Object.entries(gem.cost.essences).every(([id, count]) => essences[id] >= count);
              const canCraft = hasShards && hasEssences;

              return (
                <div 
                  key={gem.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '25px', 
                    border: isOwned ? `1px solid #10b981` : '1px solid var(--glass-border)',
                    opacity: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.2rem', margin: 0 }}>{gem.name}</h4>
                    <div style={{ fontSize: '2.5rem' }}>{gem.icon}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 700 }}>{gem.effect}</div>
                  
                  {!isOwned && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px' }}>CRAFTING COST</div>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontSize: '1rem' }}>💎</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: hasShards ? '#f59e0b' : '#ef4444' }}>
                            {prestigeShards}/{gem.cost.shards}
                          </span>
                        </div>
                        {Object.entries(gem.cost.essences).map(([id, count]) => (
                          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '1rem' }}>{VIRTUE_ESSENCES.find(e => e.id === id).icon}</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: essences[id] >= count ? '#10b981' : '#ef4444' }}>
                              {essences[id]}/{count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    className="btn-glass"
                    onClick={() => craftGem(gem)}
                    disabled={isOwned || !canCraft}
                    style={{ width: '100%', borderColor: isOwned ? '#10b981' : (canCraft ? '#3b82f6' : 'var(--glass-border)') }}
                  >
                    {isOwned ? 'OWNED' : (canCraft ? 'CRAFT GEM' : 'INSUFFICIENT MATERIALS')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'constellations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', position: 'relative', minHeight: '600px', background: 'rgba(0,0,0,0.4)', borderRadius: '20px', padding: '40px', overflow: 'hidden' }}>
          {/* Starfield Background */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }}>
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: '2px',
                  height: '2px',
                  background: 'white',
                  borderRadius: '50%'
                }}
              />
            ))}
          </div>

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Virtue Constellations</h3>
            <p style={{ color: 'var(--text-muted)' }}>A celestial map of your musical milestones and achievements.</p>
          </div>

          <div style={{ position: 'relative', height: '400px', width: '100%', marginTop: '40px' }}>
            {ACHIEVEMENTS.map((achievement, idx) => {
              const isUnlocked = achievement.allLevel 
                ? Object.values(virtues).every(v => Math.floor(Math.sqrt(v.xp / 100)) >= achievement.allLevel)
                : Math.floor(Math.sqrt(virtues[achievement.virtue].xp / 100)) >= achievement.level;
              
              // Spiral layout logic
              const angle = (idx / ACHIEVEMENTS.length) * Math.PI * 2;
              const radius = 100 + idx * 20;
              const x = 50 + Math.cos(angle) * (radius / 10);
              const y = 50 + Math.sin(angle) * (radius / 10);

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                >
                  <div 
                    title={achievement.name}
                    style={{
                      width: isUnlocked ? '40px' : '20px',
                      height: isUnlocked ? '40px' : '20px',
                      borderRadius: '50%',
                      background: isUnlocked ? (achievement.virtue ? VIRTUE_DATA[achievement.virtue].color : '#f59e0b') : 'rgba(255,255,255,0.1)',
                      boxShadow: isUnlocked ? `0 0 20px ${achievement.virtue ? VIRTUE_DATA[achievement.virtue].color : '#f59e0b'}` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isUnlocked ? '1.2rem' : '0.6rem',
                      transition: 'all 0.5s ease'
                    }}
                  >
                    {isUnlocked ? achievement.trophy : '✦'}
                  </div>
                  {isUnlocked && (
                    <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.6rem', color: 'white', marginTop: '5px', fontWeight: 700 }}>
                      {achievement.name.toUpperCase()}
                    </div>
                  )}
                </motion.div>
              );
            })}
            
            {/* SVG Lines between stars (Constellation lines) */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              {ACHIEVEMENTS.slice(0, -1).map((_, i) => {
                const a1 = (i / ACHIEVEMENTS.length) * Math.PI * 2;
                const r1 = 100 + i * 20;
                const x1 = 50 + Math.cos(a1) * (r1 / 10);
                const y1 = 50 + Math.sin(a1) * (r1 / 10);

                const a2 = ((i + 1) / ACHIEVEMENTS.length) * Math.PI * 2;
                const r2 = 100 + (i + 1) * 20;
                const x2 = 50 + Math.cos(a2) * (r2 / 10);
                const y2 = 50 + Math.sin(a2) * (r2 / 10);

                return (
                  <line
                    key={i}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ marginTop: '40px', padding: '30px', textAlign: 'center', background: 'linear-gradient(to right, rgba(138, 43, 226, 0.1), rgba(0, 0, 0, 0.2))' }}>
        <Trophy size={32} color="#f59e0b" style={{ marginBottom: '15px' }} />
        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Unlock the Grand Virtuoso</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Reach Level 10 in all six virtues to unlock the ultimate title and exclusive sound packs.
        </p>
      </div>
    </div>
  );
};

export default Virtues;
