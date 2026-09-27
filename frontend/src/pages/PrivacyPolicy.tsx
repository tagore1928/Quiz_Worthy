import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="clean-glass-card p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-sky-400" />
          <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
        </div>
        <p className="text-xs text-slate-400">Last updated: August 2026</p>
        <div className="space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-800 pt-4">
          <p>
            At Quiz Worthy, we prioritize user privacy. We collect basic account details including name, email address, institution affiliation, and quiz performance metrics solely to deliver and personalize your learning experience.
          </p>
          <h3 className="text-white font-semibold">1. Information Collection</h3>
          <p className="text-slate-400">We store authentication credentials securely via Firebase Auth and user profile information in Cloud Firestore.</p>
          <h3 className="text-white font-semibold">2. Data Usage</h3>
          <p className="text-slate-400">Your performance statistics are used strictly to populate your personal dashboard, update leaderboard rankings, and customize quiz topic progression.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
