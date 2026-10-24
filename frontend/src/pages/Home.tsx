import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { DEFAULT_TOPIC_LEVELS } from '../types/user';
import { QuizAttempt } from '../types/quiz';
import { getISTDateKey, shiftDateKey } from '../utils/dateUtils';

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
  Medal,
  Search,
  History,
  Target,
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

const LEVEL_NAMES: Record<number, string> = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

type LevelFilter = 'all' | 1 | 2 | 3;
const FILTERS: { key: LevelFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 1, label: 'Beginner' },
  { key: 2, label: 'Intermediate' },
  { key: 3, label: 'Advanced' },
];

const LevelBars: React.FC<{ level: number }> = ({ level }) => (
  <div className="flex gap-0.5" aria-hidden="true">
    {[1, 2, 3].map((n) => (
      <span key={n} className={`w-3 h-1 rounded-[1px] ${n <= level ? 'bg-sky-400' : 'bg-white/10'}`} />
    ))}
  </div>
);

const formatAttemptDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export const Home: React.FC = () => {
  const { userProfile } = useAuth();
  const [customTopics, setCustomTopics] = useState<TopicCardItem[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<LevelFilter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomTopics();
  }, []);

  useEffect(() => {
    if (userProfile?.uid) fetchHistory(userProfile.uid);
  }, [userProfile?.uid, userProfile?.xp]);

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

  // Recent attempts (for last scores and the recent sessions list) and activity
  // days (for the 7-day strip).
  const fetchHistory = async (uid: string) => {
    try {
      const [attemptSnap, activitySnap] = await Promise.all([
        getDocs(query(collection(db, 'users', uid, 'quiz_attempts'), orderBy('timestamp', 'desc'), limit(50))),
        getDocs(collection(db, 'users', uid, 'activity')),
      ]);
      const list: QuizAttempt[] = [];
      attemptSnap.forEach((d) => list.push({ id: d.id, ...d.data() } as QuizAttempt));
      setAttempts(list);

      const days = new Set<string>();
      activitySnap.forEach((d) => {
        const a = d.data();
        if ((a.quizzesCompleted || 0) > 0 || a.allTodosDone === true || (a.xpEarned || 0) > 0) days.add(d.id);
      });
      setActiveDays(days);
    } catch (err) {
      console.error('Error fetching practice history:', err);
    }
  };

  const userTopicLevels = userProfile?.topicLevels || DEFAULT_TOPIC_LEVELS;
  const allTopics = [...DEFAULT_TOPICS, ...customTopics];
  const levelOf = (name: string) => userTopicLevels[name] || 2;

  // Most recent attempt per topic
  const lastAttemptByTopic = useMemo(() => {
    const map: Record<string, QuizAttempt> = {};
    for (const a of attempts) if (!map[a.topic]) map[a.topic] = a;
    return map;
  }, [attempts]);

  // Suggest the weakest topic; among equals, the one practised least recently.
  const recommended = useMemo(() => {
    const ranked = [...allTopics].sort((a, b) => {
      const byLevel = levelOf(a.name) - levelOf(b.name);
      if (byLevel !== 0) return byLevel;
      const ta = lastAttemptByTopic[a.name]?.timestamp || '';
      const tb = lastAttemptByTopic[b.name]?.timestamp || '';
      return ta.localeCompare(tb);
    });
    return ranked[0];
  }, [allTopics.length, userTopicLevels, lastAttemptByTopic]);

  const levelCounts = [1, 2, 3].map((lvl) => allTopics.filter((t) => levelOf(t.name) === lvl).length);

  const today = getISTDateKey();
  const week = Array.from({ length: 7 }, (_, i) => {
    const key = shiftDateKey(today, 6 - i);
    const [y, m, d] = key.split('-').map(Number);
    const label = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', { weekday: 'narrow', timeZone: 'UTC' });
    return { key, label, active: activeDays.has(key), isToday: key === today };
  });
  const activeThisWeek = week.filter((d) => d.active).length;

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Kolkata',
  });

  const visibleTopics = allTopics.filter((t) => {
    const matchesLevel = filter === 'all' || levelOf(t.name) === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    return matchesLevel && matchesSearch;
  });

  const readouts = [
    { label: 'Total XP', value: (userProfile?.xp || 0).toLocaleString(), icon: Zap, tone: 'text-sky-400' },
    { label: 'Day streak', value: `${userProfile?.currentStreak || 0}`, icon: Flame, tone: 'text-amber-400' },
    { label: 'Advanced topics', value: `${levelCounts[2]}/${allTopics.length}`, icon: Trophy, tone: 'text-slate-100' },
    {
      label: 'Badges',
      value: `${userProfile?.silverBadges || 0} · ${userProfile?.goldBadges || 0}`,
      hint: 'Silver · Gold',
      icon: Medal,
      tone: 'text-slate-100',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 space-y-16">
      {/* Hero */}
      <section className="grid lg:grid-cols-[1.35fr_1fr] gap-10 items-end animate-fade-in">
        <div className="space-y-6">
          <span className="eyebrow">{todayLabel}</span>
          <h1 className="text-4xl sm:text-6xl font-semibold leading-[0.98] text-white">
            <span className="text-slate-500">Welcome back,</span>
            <br />
            {userProfile?.name}.
          </h1>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-lg">
            Practice real technical interview questions across core computer science topics, with an explanation
            for every answer and difficulty that adapts to you.
          </p>

          {recommended && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link to={`/quiz/${encodeURIComponent(recommended.name)}`} className="clean-button-primary w-auto px-5">
                <span>Practice {recommended.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#topics" className="clean-button-secondary w-auto px-5">
                Browse all topics
              </a>
            </div>
          )}
          {recommended && (
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <Target className="w-3.5 h-3.5 text-sky-400" />
              Suggested because it's one of your lowest-level topics
              {lastAttemptByTopic[recommended.name] ? '' : ' and you haven\'t practised it yet'}.
            </p>
          )}
        </div>

        {/* Status panel */}
        <div className="auth-glass-card p-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">Your status</span>
            <span className="font-mono text-[11px] text-slate-500">{activeThisWeek}/7 active this week</span>
          </div>
          <dl className="grid grid-cols-2">
            {readouts.map((r, i) => {
              const RIcon = r.icon;
              return (
                <div
                  key={r.label}
                  className={`py-4 ${i % 2 === 0 ? 'pr-4 border-r border-white/[0.06]' : 'pl-4'} ${i < 2 ? 'border-b border-white/[0.06]' : ''}`}
                >
                  <dt className="flex items-center gap-1.5 text-xs text-slate-500" title={r.hint}>
                    <RIcon className="w-3.5 h-3.5" />
                    {r.label}
                  </dt>
                  <dd className={`mt-1.5 font-mono text-2xl ${r.tone}`}>{r.value}</dd>
                </div>
              );
            })}
          </dl>
          <div className="pt-4 border-t border-white/[0.06]">
            <div className="flex justify-between gap-1.5">
              {week.map((d) => (
                <div key={d.key} className="flex-1 flex flex-col items-center gap-1.5" title={`${d.key}: ${d.active ? 'active' : 'no activity'}`}>
                  <span
                    className={`w-full h-6 rounded-[3px] ${
                      d.active ? 'bg-sky-400 shadow-[0_0_10px_rgba(200,241,53,0.35)]' : 'bg-white/[0.05]'
                    } ${d.isToday ? 'ring-1 ring-white/30 ring-offset-2 ring-offset-[#0d100f]' : ''}`}
                  />
                  <span className={`font-mono text-[10px] ${d.isToday ? 'text-slate-200' : 'text-slate-600'}`}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mastery + recent sessions */}
      <section className="grid lg:grid-cols-[1.35fr_1fr] gap-4">
        <div className="clean-glass-card p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-white">Topic mastery</h2>
              <p className="text-xs text-slate-500">Each topic's level comes from your last score: 0–40% Beginner, 41–70% Intermediate, 71–100% Advanced.</p>
            </div>
            <Link to="/analytics" className="text-xs text-slate-400 hover:text-sky-400 transition-colors whitespace-nowrap">
              Analytics →
            </Link>
          </div>
          <div className="flex h-2.5 rounded-[2px] overflow-hidden bg-white/[0.05]" aria-hidden="true">
            {levelCounts.map((count, i) => (
              <div
                key={i}
                className={i === 0 ? 'bg-slate-500' : i === 1 ? 'bg-sky-400/50' : 'bg-sky-400'}
                style={{ width: `${(count / Math.max(allTopics.length, 1)) * 100}%` }}
              />
            ))}
          </div>
          <dl className="grid grid-cols-3 gap-3">
            {levelCounts.map((count, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setFilter((i + 1) as LevelFilter);
                  document.getElementById('topics')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-left p-3 rounded-lg border border-white/[0.06] hover:border-sky-400/30 transition-colors"
              >
                <dt className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-slate-500">
                  <span className={`w-2 h-2 rounded-[1px] ${i === 0 ? 'bg-slate-500' : i === 1 ? 'bg-sky-400/50' : 'bg-sky-400'}`} />
                  {LEVEL_NAMES[i + 1]}
                </dt>
                <dd className="mt-1 font-mono text-xl text-slate-100">{count}</dd>
              </button>
            ))}
          </dl>
        </div>

        <div className="clean-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" /> Recent sessions
            </h2>
            {attempts.length > 0 && (
              <Link to="/analytics" className="text-xs text-slate-400 hover:text-sky-400 transition-colors">
                View all →
              </Link>
            )}
          </div>
          {attempts.length === 0 ? (
            <p className="text-sm text-slate-500 py-6">No sessions yet. Your first quiz will show up here.</p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {attempts.slice(0, 4).map((a) => (
                <li key={a.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 truncate">{a.topic}</p>
                    <p className="font-mono text-[11px] text-slate-500">
                      {formatAttemptDate(a.timestamp)} · Lvl {a.previousLevel} → {a.newLevel}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-sm ${a.score >= 71 ? 'text-sky-400' : a.score <= 40 ? 'text-rose-400' : 'text-slate-300'}`}
                  >
                    {a.score}/100
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Topic grid */}
      <section id="topics" className="space-y-6 scroll-mt-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="space-y-2">
            <span className="eyebrow">Topics</span>
            <h2 className="text-2xl font-semibold text-white">Pick a domain</h2>
            <p className="text-sm text-slate-500">Each session is 10 questions, adapted to your current level.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="inline-flex p-1 rounded-lg border border-white/[0.06] bg-white/[0.02]" role="tablist" aria-label="Filter by level">
              {FILTERS.map((f) => (
                <button
                  key={String(f.key)}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1 rounded-md text-xs transition-colors ${
                    filter === f.key ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="relative">
              <span className="sr-only">Search topics</span>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics"
                className="clean-input py-1.5 pl-8 text-xs sm:w-48"
              />
            </label>
          </div>
        </div>

        {visibleTopics.length === 0 ? (
          <div className="clean-glass-card p-10 text-center space-y-3">
            <p className="text-sm text-slate-400">No topics match these filters.</p>
            <button
              type="button"
              onClick={() => {
                setFilter('all');
                setSearch('');
              }}
              className="text-xs text-sky-400 hover:text-sky-300"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleTopics.map((topic, index) => {
              const Icon = topic.icon;
              const userLevel = levelOf(topic.name);
              const last = lastAttemptByTopic[topic.name];
              const isRecommended = recommended?.id === topic.id;

              return (
                <Link
                  key={topic.id}
                  to={`/quiz/${encodeURIComponent(topic.name)}`}
                  className={`clean-glass-card clean-glass-card-hover p-5 flex flex-col gap-6 group animate-fade-in ${
                    isRecommended ? 'border-sky-400/30' : ''
                  }`}
                  style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-slate-300 group-hover:text-sky-400 group-hover:border-sky-400/40 transition-colors">
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                    {isRecommended ? (
                      <span className="clean-badge bg-sky-500/10 text-sky-400 border-sky-400/30">Suggested</span>
                    ) : (
                      <span className="font-mono text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
                        {String(allTopics.indexOf(topic) + 1).padStart(2, '0')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-base font-medium text-white">{topic.name}</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{topic.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2.5" title={`Level ${userLevel}: ${LEVEL_NAMES[userLevel] || ''}`}>
                      <LevelBars level={userLevel} />
                      <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                        {LEVEL_NAMES[userLevel] || `Level ${userLevel}`}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-sky-400 transition-colors">
                      {last ? <span className="font-mono text-slate-500 mr-1">Last {last.score}</span> : null}
                      Start
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
