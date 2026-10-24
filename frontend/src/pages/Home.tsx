import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { DEFAULT_TOPIC_LEVELS } from '../types/user';

import {
  Zap,
  Flame,
  ArrowRight,
  Cpu,
  Globe,
  Database,
  Code,
  Terminal,
  Binary,
  Layers,
  Server,
  BrainCircuit,
  Trophy,
  Shield,
  BookOpen,
} from 'lucide-react';

interface TopicCardItem {
  id: string;
  name: string;
  description: string;
  icon: any;
}

const DEFAULT_TOPICS: TopicCardItem[] = [
  { id: '1', name: 'Operating Systems', description: 'Processes, Threads, Memory Paging & Deadlocks', icon: Cpu },
  { id: '2', name: 'Computer Networks', description: 'TCP/IP, OSI Layers, Routing & HTTP/3', icon: Globe },
  { id: '3', name: 'DBMS', description: 'SQL Normalization, Indexing & ACID Transactions', icon: Database },
  { id: '4', name: 'Python', description: 'Iterators, Generators, AsyncIO & Metaclasses', icon: Code },
  { id: '5', name: 'Java', description: 'JVM Architecture, Garbage Collection & Multithreading', icon: Terminal },
  { id: '6', name: 'C++', description: 'Pointers, RAII, Memory Management & STL Containers', icon: Binary },
  { id: '7', name: 'Frontend', description: 'DOM Optimization, React Reconciler & CSS Engine', icon: Layers },
  { id: '8', name: 'Backend', description: 'Microservices, REST APIs, GraphQL & Caching', icon: Server },
  { id: '9', name: 'Machine Learning', description: 'Gradient Descent, Neural Nets & Model Metrics', icon: BrainCircuit },
  { id: '10', name: 'DSA', description: 'Trees, Dynamic Programming, Graphs & Sorting', icon: Trophy },
];

export const Home: React.FC = () => {
  const { userProfile } = useAuth();
  const [customTopics, setCustomTopics] = useState<TopicCardItem[]>([]);

  useEffect(() => {
    fetchCustomTopics();
  }, []);

  const fetchCustomTopics = async () => {
    try {
      const snap = await getDocs(collection(db, 'topics'));
      const list: TopicCardItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          name: data.name,
          description: data.description || 'Technical topic assessment',
          icon: Shield,
        });
      });
      setCustomTopics(list);
    } catch (err) {
      console.error('Error fetching custom topics:', err);
    }
  };

  const userTopicLevels = userProfile?.topicLevels || DEFAULT_TOPIC_LEVELS;
  const allTopics = [...DEFAULT_TOPICS, ...customTopics];

  const LEVEL_NAMES: Record<number, string> = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };
  const levelValues = allTopics.map((t) => userTopicLevels[t.name] || 2);
  const advancedCount = levelValues.filter((l) => l >= 3).length;
  const avgLevel = levelValues.length
    ? (levelValues.reduce((a, b) => a + b, 0) / levelValues.length).toFixed(1)
    : '0.0';

  const readouts = [
    { label: 'Total XP', value: (userProfile?.xp || 0).toLocaleString(), icon: Zap, tone: 'text-sky-400' },
    { label: 'Streak', value: `${userProfile?.currentStreak || 0}d`, icon: Flame, tone: 'text-amber-400' },
    { label: 'Advanced topics', value: `${advancedCount}/${allTopics.length}`, icon: Trophy, tone: 'text-slate-200' },
    { label: 'Avg. level', value: avgLevel, icon: BookOpen, tone: 'text-slate-200' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 space-y-24">
      {/* Hero */}
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end animate-fade-in">
        <div className="space-y-6">
          <span className="eyebrow">Interview practice</span>
          <h1 className="text-4xl sm:text-6xl font-semibold leading-[0.98] text-white">
            <span className="text-slate-500">Welcome back,</span>
            <br />
            {userProfile?.name}.
          </h1>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-lg">
            Practice real technical interview questions across core computer science topics. Track topic mastery,
            review detailed explanations, and test your accuracy.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a href="#topics" className="clean-button-primary w-auto px-5">
              <span>Choose a topic</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link to="/analytics" className="clean-button-secondary w-auto px-5">
              View analytics
            </Link>
          </div>
        </div>

        {/* Readout panel */}
        <div className="auth-glass-card p-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">Your status</span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(200,241,53,0.9)]" />
              Live
            </span>
          </div>
          <dl className="grid grid-cols-2">
            {readouts.map((r, i) => {
              const RIcon = r.icon;
              return (
                <div
                  key={r.label}
                  className={`py-4 ${i % 2 === 0 ? 'pr-4 border-r border-white/[0.06]' : 'pl-4'} ${i < 2 ? 'border-b border-white/[0.06]' : ''}`}
                >
                  <dt className="flex items-center gap-1.5 text-xs text-slate-500">
                    <RIcon className="w-3.5 h-3.5" />
                    {r.label}
                  </dt>
                  <dd className={`mt-1.5 font-mono text-2xl ${r.tone}`}>{r.value}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* Topic grid */}
      <section id="topics" className="space-y-6 scroll-mt-20">
        <div className="flex items-end justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="space-y-2">
            <span className="eyebrow">Topics</span>
            <h2 className="text-2xl font-semibold text-white">Pick a domain</h2>
            <p className="text-sm text-slate-500">Each session is 10 questions, adapted to your current level.</p>
          </div>
          <span className="font-mono text-xs text-slate-500">
            {String(allTopics.length).padStart(2, '0')} available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allTopics.map((topic, index) => {
            const Icon = topic.icon;
            const userLevel = userTopicLevels[topic.name] || 2;

            return (
              <Link
                key={topic.id}
                to={`/quiz/${encodeURIComponent(topic.name)}`}
                className="clean-glass-card clean-glass-card-hover p-5 flex flex-col gap-6 group animate-fade-in"
                style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-slate-300 group-hover:text-sky-400 group-hover:border-sky-400/40 transition-colors">
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  <span className="font-mono text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="space-y-1.5 flex-1">
                  <h3 className="text-base font-medium text-white">{topic.name}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{topic.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2.5" title={`Level ${userLevel}: ${LEVEL_NAMES[userLevel] || ''}`}>
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((n) => (
                        <span
                          key={n}
                          className={`w-3 h-1 rounded-[1px] ${n <= userLevel ? 'bg-sky-400' : 'bg-white/10'}`}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                      {LEVEL_NAMES[userLevel] || `Level ${userLevel}`}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-sky-400 transition-colors">
                    Start
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
