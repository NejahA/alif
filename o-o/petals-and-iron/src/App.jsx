import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower, Swords, Wind, Shield, Heart, Info, Scroll, Droplets } from 'lucide-react';

const WarAndFlowers = () => {
  const [mode, setMode] = useState('flower'); // 'war' or 'flower'
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollPos(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const content = {
    war: {
      title: "Iron & Ash",
      subtitle: "The Chronicles of Conflict",
      accent: "text-red-900",
      bg: "bg-[#1a1a1a]",
      icon: Swords,
      items: [
        { title: "Verdun", text: "1916. 300 days of artillery. The earth turned to iron.", icon: Shield },
        { title: "The Blitz", text: "Nights of fire and sirens. London standing in the dark.", icon: Swords },
        { title: "Stalingrad", text: "The turning point in the winter frost. Echoes in the ruins.", icon: Swords }
      ]
    },
    flower: {
      title: "Petals & Dew",
      subtitle: "The Language of Growth",
      accent: "text-pink-600",
      bg: "bg-[#fdf6e3]",
      icon: Flower,
      items: [
        { title: "Red Poppy", text: "A symbol of remembrance blooming in Flanders Fields.", icon: Heart },
        { title: "White Lily", text: "Purity and restoration in the wake of silence.", icon: Wind },
        { title: "Forget-me-not", text: "A promise of memory carried by the wind.", icon: Droplets }
      ]
    }
  };

  const current = content[mode];

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${mode === 'war' ? 'war-mode' : 'flower-mode'}`}>
      <div className="grain-overlay" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full p-8 flex justify-between items-center z-50">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${mode === 'war' ? 'border-red-900 text-red-900' : 'border-pink-600 text-pink-600'}`}>
            <Scroll size={20} />
          </div>
          <span className={`font-black uppercase tracking-widest text-[10px] ${mode === 'war' ? 'text-red-900' : 'text-pink-600'}`}>
            Petals_&_Iron
          </span>
        </motion.div>

        <div className="flex gap-4">
          <button 
            onClick={() => setMode('war')}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'war' ? 'bg-red-900 text-white shadow-xl shadow-red-900/20' : 'bg-black/5 text-slate-500'}`}
          >
            Iron_Mode
          </button>
          <button 
            onClick={() => setMode('flower')}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'flower' ? 'bg-pink-600 text-white shadow-xl shadow-pink-600/20' : 'bg-black/5 text-slate-500'}`}
          >
            Petal_Mode
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <current.icon size={80} className={`${current.accent} mb-8 opacity-40 animate-sway mx-auto`} />
            <h1 className={`text-8xl font-black uppercase tracking-tighter italic mb-4 ${current.accent}`}>
              {current.title}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-500">
              {current.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Parallax Background Icons */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                y: scrollPos * (Math.random() * 0.5)
              }}
            >
              <current.icon size={Math.random() * 100 + 50} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-6xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-3 gap-12">
        {current.items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className={`p-12 rounded-[3rem] border transition-all hover:scale-105 ${mode === 'war' ? 'bg-white/5 border-white/5 hover:border-red-900/30' : 'bg-black/5 border-black/5 hover:border-pink-600/30'}`}
          >
            <item.icon className={`${current.accent} mb-8 opacity-60`} size={32} />
            <h3 className={`text-2xl font-black uppercase tracking-tighter mb-4 ${current.accent}`}>
              {item.title}
            </h3>
            <p className="text-sm font-medium leading-relaxed opacity-70">
              {item.text}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Interactive Chronicle Section */}
      <section className="py-32 flex flex-col items-center">
        <div className={`max-w-4xl w-full p-20 rounded-[5rem] border ${mode === 'war' ? 'bg-red-900/5 border-red-900/20' : 'bg-pink-600/5 border-pink-600/20'}`}>
          <div className="flex items-center gap-6 mb-12">
            <Info size={24} className={current.accent} />
            <h2 className={`text-3xl font-black uppercase tracking-widest italic ${current.accent}`}>
              {mode === 'war' ? 'The_Iron_Truth' : 'The_Petal_Promise'}
            </h2>
          </div>
          <p className="text-xl font-medium leading-relaxed opacity-80 mb-12">
            {mode === 'war' 
              ? "In the theater of conflict, iron defines the landscape. Every machine, every shell, every barrier was forged to withstand the weight of history. But even in the deepest ash, life waits for the silence."
              : "Flowers have always been the first to reclaim the battlefield. In the silence that follows iron, the petal emerges. They are the silent witnesses of transition, carrying the memory of the fallen in their nectar."}
          </p>
          <div className="flex justify-end">
             <button className={`flex items-center gap-4 px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-110 ${mode === 'war' ? 'bg-red-900' : 'bg-pink-600'}`}>
               Explore_Archives <Scroll size={16} />
             </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-20 text-center border-t border-black/5">
        <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-400">
          Iron_&_Petals // 2026 // Archive_Protocol
        </p>
      </footer>
    </div>
  );
};

export default WarAndFlowers;
