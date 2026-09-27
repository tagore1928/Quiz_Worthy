import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Medal, Award, CheckCircle2, X } from 'lucide-react';

interface BadgeCelebrationModalProps {
  type: 'silver' | 'gold';
  title: string;
  description: string;
  onClose: () => void;
}

export const BadgeCelebrationModal: React.FC<BadgeCelebrationModalProps> = ({
  type,
  title,
  description,
  onClose,
}) => {
  useEffect(() => {
    try {
      if (type === 'gold') {
        confetti({
          particleCount: 120,
          spread: 80,
          colors: ['#f59e0b', '#38bdf8', '#ffffff'],
          origin: { y: 0.5 },
        });
      } else {
        confetti({
          particleCount: 80,
          spread: 60,
          colors: ['#94a3b8', '#38bdf8', '#ffffff'],
          origin: { y: 0.6 },
        });
      }
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }, [type]);

  const isGold = type === 'gold';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md auth-glass-card p-8 text-center space-y-5 relative border ${isGold ? 'border-amber-500/40 shadow-xl' : 'border-slate-700 shadow-xl'}`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`inline-flex p-3 rounded-xl ${isGold ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
          {isGold ? (
            <Award className="w-10 h-10" />
          ) : (
            <Medal className="w-10 h-10" />
          )}
        </div>

        <div className="space-y-1.5">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold ${isGold ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
            <span>{isGold ? 'Gold Badge Unlocked' : 'Silver Badge Unlocked'}</span>
          </div>

          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-center gap-2 text-xs font-medium text-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Badge recorded in your profile</span>
        </div>

        <button
          onClick={onClose}
          className="clean-button-primary"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default BadgeCelebrationModal;
