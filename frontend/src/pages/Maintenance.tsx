import React from 'react';
import { Wrench, Clock } from 'lucide-react';

export const Maintenance: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg auth-glass-card p-10 text-center space-y-6">
        <div className="inline-flex p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Wrench className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">System Under Maintenance</h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Quiz Worthy is currently undergoing scheduled platform maintenance. Services will resume shortly.
          </p>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-center gap-1.5 font-medium text-sky-400">
            <Clock className="w-4 h-4" /> Expected Back Shortly
          </div>
          <p>Thank you for your patience while we complete this update.</p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
