import { Hero } from "@/components/Hero";
import { Workspace } from "@/components/Workspace";

export default function Home() {
  return (
    <main>
      <Hero />
      <Workspace />
      
      {/* Dynamic Background Noise */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
          opacity: 0.05,
          pointerEvents: 'none',
          zIndex: 9999
        }}
      />
    </main>
  );
}
