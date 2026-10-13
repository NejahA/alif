'use client';

import React, { useState } from 'react';
import BackgroundCanvas from '@/components/BackgroundCanvas';
import Navbar from '@/components/Navbar';
import CommandPalette from '@/components/CommandPalette';
import HeroSection from '@/components/HeroSection';
import EngineeringLab from '@/components/EngineeringLab';
import ProjectsSection from '@/components/ProjectsSection';
import ArchitectureBlueprint from '@/components/ArchitectureBlueprint';
import TechRadar from '@/components/TechRadar';
import TerminalConsole from '@/components/TerminalConsole';
import ValueCalculator from '@/components/ValueCalculator';
import TestimonialsSection from '@/components/TestimonialsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

export default function Home() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Background canvas with particles and ambient gradient orbs */}
      <BackgroundCanvas />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenTerminal={() => setIsTerminalModalOpen(true)}
      />

      {/* Floating Terminal Modal (when triggered via navbar or command palette) */}
      <TerminalConsole
        isOpen={isTerminalModalOpen}
        onClose={() => setIsTerminalModalOpen(false)}
      />

      {/* Navigation Header */}
      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenTerminal={() => setIsTerminalModalOpen(true)}
      />

      {/* Main Content Assembly */}
      <main id="main-content">
        <HeroSection onOpenTerminal={() => setIsTerminalModalOpen(true)} />
        <EngineeringLab />
        <ProjectsSection />
        <ArchitectureBlueprint />
        <TechRadar />
        <ValueCalculator />
        <TerminalConsole isEmbedded={true} />
        <TestimonialsSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
