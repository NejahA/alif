import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
}

export default function Loader({ fullScreen = false, message = 'Loading...' }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-24 h-24">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 animate-pulse-glow"></div>
        
        {/* Inner spinning ring */}
        <div className="absolute inset-2 rounded-full border-4 border-t-amber-400 border-r-orange-400 border-b-transparent border-l-transparent animate-spin-slow animate-time-warp"></div>
        
        {/* Center element */}
        <div className="absolute inset-1/4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-float opacity-80 blur-sm"></div>
        <div className="absolute inset-1/4 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full animate-float shadow-[0_0_15px_rgba(251,146,60,0.8)]"></div>
      </div>
      <p className="text-amber-400 font-semibold tracking-widest uppercase animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}
