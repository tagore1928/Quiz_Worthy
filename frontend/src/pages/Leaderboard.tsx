import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types/user';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { 
  Trophy, 
  Globe, 
  GraduationCap, 
  Zap, 
  Flame, 
  Medal, 
  Award 
} from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'global' | 'college'>('global');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('xp', 'desc'), limit(100));
      const snap = await getDocs(q);

      const list: UserProfile[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as UserProfile);
      });

      setUsers(list);
    } catch (err) {
      console.error('Error fetching leaderboard users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on tab
  const filteredUsers =
    activeTab === 'college'
      ? users.filter(
          (u) =>
            u.collegeName &&
            userProfile?.collegeName &&
            u.collegeName.toLowerCase() === userProfile.collegeName.toLowerCase()
        )
      : users;

  // Find logged in user's position in active list
  const userRankIndex = filteredUsers.findIndex((u) => u.uid === userProfile?.uid);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

  const topThree = filteredUsers.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      {/* Header */}
      <div className="clean-glass-card p-8 space-y-4 text-center">
        <div className="inline-flex p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-1">
          <Trophy className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Leaderboard</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Compare rankings across participants and view top performers in your institution.
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-slate-950/60 border border-slate-800 rounded-lg gap-1">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'global'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Global Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('college')}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'college'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> My Institution ({userProfile?.collegeName || 'Campus'})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 animate-pulse">
          Loading leaderboard rankings...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="clean-glass-card p-8 text-center text-slate-400 text-xs">
          No participants found for this filter yet.
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="clean-glass-card p-6 text-center space-y-2.5 order-2 md:order-1 border-slate-700">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-slate-800 border border-slate-600 text-slate-200 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h3 className="font-semibold text-white text-sm truncate">{topThree[1].name}</h3>
                  <p className="text-[11px] text-slate-400 truncate">{topThree[1].collegeName}</p>
                  <div className="pt-1 text-sky-400 font-bold text-lg">{topThree[1].xp} XP</div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="clean-glass-card p-7 text-center space-y-3 order-1 md:order-2 border-amber-500/40 bg-amber-500/5">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center font-bold text-lg shadow-sm">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-white text-base truncate">{topThree[0].name}</h3>
                    <p className="text-xs text-amber-300 font-medium truncate">{topThree[0].collegeName}</p>
                  </div>
                  <div className="pt-1 text-amber-400 font-bold text-xl">{topThree[0].xp} XP</div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="clean-glass-card p-6 text-center space-y-2.5 order-3 md:order-3 border-slate-700">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-slate-800 border border-slate-600 text-slate-300 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h3 className="font-semibold text-white text-sm truncate">{topThree[2].name}</h3>
                  <p className="text-[11px] text-slate-400 truncate">{topThree[2].collegeName}</p>
                  <div className="pt-1 text-sky-400 font-bold text-lg">{topThree[2].xp} XP</div>
                </div>
              )}
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="clean-glass-card p-6 sm:p-8 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-medium">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Participant</th>
                    <th className="py-2.5 px-3">Institution</th>
                    <th className="py-2.5 px-3">Streak</th>
                    <th className="py-2.5 px-3">Badges</th>
                    <th className="py-2.5 px-3 text-right">Total XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((user, idx) => {
                    const isSelf = user.uid === userProfile?.uid;
                    const rank = idx + 1;

                    return (
                      <tr
                        key={user.uid}
                        className={`transition ${
                          isSelf
                            ? 'bg-sky-500/10 border-l-2 border-sky-500 text-white font-medium'
                            : 'hover:bg-slate-900/40 text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-medium">
                          #{rank}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{user.name}</span>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-600 text-white font-semibold">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{user.collegeName}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 text-amber-400 font-medium">
                            <Flame className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{user.currentStreak || 0}d</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-slate-300 font-medium" title="Silver Badges">
                              <Medal className="w-3.5 h-3.5 text-slate-300" /> {user.silverBadges || 0}
                            </span>
                            <span className="flex items-center gap-1 text-amber-400 font-medium" title="Gold Badges">
                              <Award className="w-3.5 h-3.5 text-amber-400" /> {user.goldBadges || 0}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-bold text-sky-400 text-xs">{user.xp} XP</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Sticky Bottom Highlight for Current User Rank */}
      {userRank && (
        <div className="sticky bottom-4 z-40 max-w-4xl mx-auto auth-glass-card p-3.5 flex items-center justify-between gap-4 border border-sky-500/40 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-sky-600 text-white font-bold text-sm flex items-center justify-center">
              #{userRank}
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Your Rank ({activeTab.toUpperCase()})</div>
              <div className="text-xs font-semibold text-white">{userProfile?.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Total XP</div>
              <div className="text-xs font-bold text-sky-400">{userProfile?.xp} XP</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
