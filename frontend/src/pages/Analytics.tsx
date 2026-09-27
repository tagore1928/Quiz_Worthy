import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { QuizAttempt } from '../types/quiz';
import { DEFAULT_TOPIC_LEVELS } from '../types/user';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { BarChart3, TrendingUp, History, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { userProfile } = useAuth();

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (userProfile?.uid) {
      fetchQuizAttempts();
    }
  }, [userProfile?.uid]);

  const fetchQuizAttempts = async () => {
    if (!userProfile?.uid) return;
    try {
      setLoading(true);
      const attemptsRef = collection(db, 'users', userProfile.uid, 'quiz_attempts');
      const q = query(attemptsRef, orderBy('timestamp', 'desc'), limit(50));
      const snap = await getDocs(q);

      const list: QuizAttempt[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as QuizAttempt);
      });

      setAttempts(list);
    } catch (err) {
      console.error('Error fetching quiz attempts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare Radar Chart Data
  const topicLevelsMap = userProfile?.topicLevels || DEFAULT_TOPIC_LEVELS;
  const radarData = Object.entries(topicLevelsMap).map(([topic, level]) => ({
    subject: topic.length > 10 ? topic.substring(0, 8) + '...' : topic,
    fullTopic: topic,
    level: level,
    maxLevel: 3,
  }));

  // Prepare Area Chart Data
  const chronologicalAttempts = [...attempts].reverse();
  const areaChartData = chronologicalAttempts.map((attempt, idx) => ({
    attemptNum: `Quiz #${idx + 1}`,
    score: attempt.score,
    date: new Date(attempt.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    topic: attempt.topic,
  }));

  // Pagination for Quiz History Table
  const totalPages = Math.ceil(attempts.length / itemsPerPage) || 1;
  const paginatedAttempts = attempts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title Header */}
      <div className="clean-glass-card p-8 space-y-2">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-sky-400" />
          <h1 className="text-2xl font-bold text-white">Performance Analytics</h1>
        </div>
        <p className="text-xs text-slate-400">
          Review your topic mastery distribution, historical score trends, and past practice sessions.
        </p>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart: Topic Mastery Distribution */}
        <div className="clean-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" /> Topic Mastery Distribution
              </h2>
              <p className="text-xs text-slate-400">Current skill levels (1: Beginner, 2: Intermediate, 3: Advanced)</p>
            </div>
            <span className="clean-badge bg-sky-500/10 text-sky-400 border-sky-500/30 text-xs">
              10 Domains
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#38bdf8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 3]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar
                  name="Mastery Level"
                  dataKey="level"
                  stroke="#0284c7"
                  fill="#0ea5e9"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart: Score Trends over time */}
        <div className="clean-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" /> Historical Score Progression
              </h2>
              <p className="text-xs text-slate-400">Scores out of 100 per quiz attempt</p>
            </div>
            <span className="clean-badge bg-slate-800 text-slate-300 border-slate-700 text-xs">
              Recent Sessions
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            {areaChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                No quiz session data available yet. Complete a quiz to view your progress trend.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData}>
                  <defs>
                    <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="attemptNum" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#scoreGlow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Quiz History Table */}
      <div className="clean-glass-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" /> Quiz Attempt History
            </h2>
            <p className="text-xs text-slate-400">Logs of recent quiz sessions and resulting difficulty levels.</p>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Total Sessions: {attempts.length}
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
            Loading session history...
          </div>
        ) : attempts.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-400 text-xs">
            No quiz attempts recorded yet. Visit the Home page to start your first quiz session.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-medium">
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Topic</th>
                    <th className="py-2.5 px-3">Prev Level</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Resulting Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-3 text-slate-300 font-mono">
                        {new Date(attempt.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">{attempt.topic}</td>
                      <td className="py-3 px-3 text-slate-400">Level {attempt.previousLevel}</td>
                      <td className="py-3 px-3 font-bold text-sky-400">{attempt.score} / 100</td>
                      <td className="py-3 px-3">
                        <span className="clean-badge bg-sky-500/10 text-sky-400 border-sky-500/30 text-[11px]">
                          Level {attempt.newLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-default"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-default"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
