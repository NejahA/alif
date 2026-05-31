import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, ChevronLeft, X, Sparkles, Music, Settings2, Share2 } from 'lucide-react';

const STEPS = [
  {
    title: "Welcome to Virtuo",
    content: "Virtuo is your all-in-one digital audio workstation. Let's take a quick tour of the main features.",
    icon: <Sparkles size={32} color="var(--accent-primary)" />
  },
  {
    title: "Instrument Tabs",
    content: "Switch between Piano, Synthesizer, Drums, and more using the sidebar or keyboard shortcuts (1-9).",
    icon: <Music size={32} color="var(--accent-primary)" />
  },
  {
    title: "Studio Tools",
    content: "The header contains your Master Volume, Metronome, and Project Settings. Click 'Tools' to expand the utility panel.",
    icon: <Settings2 size={32} color="var(--accent-primary)" />
  },
  {
    title: "Creative Workflow",
    content: "Use the Arranger to build songs, AI to generate ideas, and the Marketplace to share with the community.",
    icon: <Share2 size={32} color="var(--accent-primary)" />
  }
];

export default function OnboardingGuide({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel"
        style={{
          width: '450px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '25px',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
        >
          <X size={20} />
        </button>

        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '10px'
        }}>
          {STEPS[currentStep].icon}
        </div>

        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{STEPS[currentStep].title}</h2>
        <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6', opacity: 0.8 }}>
          {STEPS[currentStep].content}
        </p>

        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
          {STEPS.map((_, i) => (
            <div 
              key={i}
              style={{
                width: i === currentStep ? '20px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === currentStep ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '15px' }}>
          <button 
            className="btn-glass" 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <ChevronLeft size={18} /> Back
          </button>
          <button 
            className="btn-glass active" 
            onClick={handleNext}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'} <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
