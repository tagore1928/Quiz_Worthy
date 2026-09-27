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

  const getLevelBadge = (lvl: number) => {
    if (lvl === 1) return { label: 'Level 1: Beginner', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (lvl === 2) return { label: 'Level 2: Intermediate', style: 'bg-sky-500/10 text-sky-400 border-sky-500/30' };
    return { label: 'Level 3: Advanced', style: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="auth-glass-card p-8 sm:p-10 relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold tracking-wide">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive Assessment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Welcome back, <span className="text-sky-400">{userProfile?.name}</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Practice real technical interview questions across core computer science topics. Track topic mastery, review detailed explanations, and test your accuracy.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
              <Zap className="w-4 h-4 text-sky-400 fill-sky-400" />
              <span>{userProfile?.xp || 0} XP</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-amber-400 border border-slate-700">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{userProfile?.currentStreak || 0} Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Mastery Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Select a Topic</h2>
            <p className="text-xs text-slate-400">Choose a domain to start a 10-question quiz session.</p>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
            {allTopics.length} Topics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allTopics.map((topic) => {
            const Icon = topic.icon;
            const userLevel = userTopicLevels[topic.name] || 2;
            const badge = getLevelBadge(userLevel);

            return (
              <div
                key={topic.id}
                className="clean-glass-card clean-glass-card-hover p-6 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`clean-badge ${badge.style}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-white group-hover:text-sky-400 transition">
                      {topic.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/quiz/${encodeURIComponent(topic.name)}`}
                    className="clean-button-primary py-2 text-xs flex items-center justify-center gap-2"
                  >
                    <span>Start Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
