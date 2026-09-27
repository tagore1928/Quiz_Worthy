import React from 'react';
import { FileText } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="clean-glass-card p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-sky-400" />
          <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
        </div>
        <p className="text-xs text-slate-400">Last updated: August 2026</p>
        <div className="space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-800 pt-4">
          <p>
            By accessing or using Quiz Worthy, you agree to comply with these terms. Quiz Worthy provides technical quizzes and adaptive learning assessments for developers.
          </p>
          <h3 className="text-white font-semibold">1. Account Integrity</h3>
          <p className="text-slate-400">Users are responsible for keeping their credentials secure and maintaining accurate profile information.</p>
          <h3 className="text-white font-semibold">2. Fair Play</h3>
          <p className="text-slate-400">Attempting to manipulate XP, streaks, or leaderboard rankings through automated scripts or unauthorized means is prohibited.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
