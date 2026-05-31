import React from 'react';
import { Minus, Square, X } from 'lucide-react';

const CustomTitleBar: React.FC = () => {
  const minimize = () => {
    (window as any).ipcRenderer.send('window-minimize');
  };

  const maximize = () => {
    (window as any).ipcRenderer.send('window-maximize');
  };

  const close = () => {
    (window as any).ipcRenderer.send('window-close');
  };

  return (
    <div className="h-10 glass draggable flex items-center justify-between px-4 select-none z-50">
      <div className="flex items-center gap-2 no-drag">
        <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full flex items-center justify-center font-bold text-xs text-white">
          M
        </div>
        <span className="font-semibold text-sm tracking-widest uppercase opacity-80">m&ms</span>
      </div>
      
      <div className="flex items-center no-drag">
        <button 
          onClick={minimize}
          className="p-2 hover:bg-white/10 rounded-md transition-colors border-none bg-transparent"
        >
          <Minus size={14} />
        </button>
        <button 
          onClick={maximize}
          className="p-2 hover:bg-white/10 rounded-md transition-colors border-none bg-transparent"
        >
          <Square size={12} />
        </button>
        <button 
          onClick={close}
          className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-md transition-colors border-none bg-transparent"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default CustomTitleBar;
