import React from 'react';

// Loading state: a scanning signal line with a terminal-style caption.
export const Loader: React.FC<{ label?: string; fullScreen?: boolean }> = ({ label = 'Loading', fullScreen = true }) => (
  <div
    className={`${fullScreen ? 'min-h-screen' : 'py-10'} flex flex-col items-center justify-center gap-3`}
    role="status"
    aria-live="polite"
  >
    <div className="relative w-40 h-px bg-white/10 overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-1/3 bg-sky-400 shadow-[0_0_12px_rgba(200,241,53,0.8)] animate-scan" />
    </div>
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
      {label}
      <span className="animate-blink text-sky-400">_</span>
    </p>
  </div>
);

export default Loader;
