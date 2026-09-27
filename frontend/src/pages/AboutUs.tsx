import React from 'react';
import { BrainCircuit, Code, Cpu, Award } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="clean-glass-card p-8 space-y-4 text-center">
        <div className="inline-flex p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-1">
          <BrainCircuit className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">About Quiz Worthy</h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed">
          Quiz Worthy is a technical assessment platform designed to practice real technical interview questions and validate knowledge across core Computer Science topics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="clean-glass-card p-6 space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Adaptive Learning</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Question difficulty levels adjust automatically based on quiz scores across Operating Systems, Networks, DBMS, and Algorithms.
          </p>
        </div>

        <div className="clean-glass-card p-6 space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Code className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Core Foundations</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Practice fundamental computer science topics and modern developer stacks required for top engineering assessments.
          </p>
        </div>

        <div className="clean-glass-card p-6 space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Milestones & Rankings</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Earn XP, maintain daily streaks, collect Silver and Gold badges, and view national and institution rankings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
