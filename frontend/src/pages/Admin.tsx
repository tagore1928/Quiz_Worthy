import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, DEFAULT_TOPIC_LEVELS, PREDEFINED_COLLEGES } from '../types/user';
import { addCollege, deleteCollege, listCustomColleges, CustomCollege } from '../utils/colleges';
import { db } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  ShieldCheck, 
  Users, 
  HelpCircle, 
  BarChart3, 
  Wrench, 
  Search, 
  Plus, 
  Trash2, 
  RotateCcw, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  GraduationCap
} from 'lucide-react';

interface TopicRequest {
  id: string;
  userEmail: string;
  userName: string;
  subject: string;
  details: string;
  createdAt: string;
}

interface CustomTopic {
  id: string;
  name: string;
  description: string;
}

export const Admin: React.FC = () => {
  const { userProfile } = useAuth();

  // Overview Metrics State
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalQuizzes, setTotalQuizzes] = useState<number>(0);
  const [avgScore, setAvgScore] = useState<number>(0);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);

  // User Management State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Topics & Requests State
  const [topics, setTopics] = useState<CustomTopic[]>([]);
  const [newTopicName, setNewTopicName] = useState<string>('');
  const [newTopicDesc, setNewTopicDesc] = useState<string>('');
  const [topicRequests, setTopicRequests] = useState<TopicRequest[]>([]);

  // College list State (custom colleges shown in every college dropdown)
  const [colleges, setColleges] = useState<CustomCollege[]>([]);
  const [newCollege, setNewCollege] = useState<string>('');
  const [collegeFilter, setCollegeFilter] = useState<string>('');
  const [savingCollege, setSavingCollege] = useState<boolean>(false);
  // Feedback shown next to the college form, so it's visible without scrolling up
  const [collegeNotice, setCollegeNotice] = useState<{ ok: boolean; text: string } | null>(null);
  // Row awaiting removal confirmation (in-page; native confirm() can be blocked)
  const [pendingCollegeDelete, setPendingCollegeDelete] = useState<string | null>(null);
  const [deletingCollege, setDeletingCollege] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [msg, setMsg] = useState<string>('');
  const [error, setError] = useState<string>('');

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadAdminDashboardData();
      loadColleges();
    }
  }, [isAdmin]);

  const loadColleges = async () => {
    try {
      setColleges(await listCustomColleges());
    } catch (err) {
      console.error('Error loading colleges:', err);
    }
  };

  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCollege.trim();
    if (!name) return;
    try {
      setSavingCollege(true);
      const result = await addCollege(name);
      if (result === 'added') {
        setNewCollege('');
        setCollegeNotice({ ok: true, text: `Added "${name}". It now appears in every college dropdown.` });
        loadColleges();
      } else if (result === 'exists') {
        setCollegeNotice({ ok: false, text: `"${name}" is already in the college list.` });
      } else if (result === 'predefined') {
        setCollegeNotice({ ok: false, text: `"${name}" is already one of the built-in colleges.` });
      } else {
        setCollegeNotice({ ok: false, text: 'Enter a college name between 2 and 120 characters.' });
      }
    } catch (err) {
      setCollegeNotice({ ok: false, text: "Couldn't add the college. Try again." });
    } finally {
      setSavingCollege(false);
    }
  };

  const handleDeleteCollege = async (college: CustomCollege) => {
    try {
      setDeletingCollege(true);
      await deleteCollege(college.id);
      setCollegeNotice({ ok: true, text: `Removed "${college.name}". Students who already chose it keep it on their profile.` });
      await loadColleges();
    } catch (err) {
      console.error('Error removing college:', err);
      setCollegeNotice({ ok: false, text: "Couldn't remove the college. Check that you're signed in as an admin and try again." });
    } finally {
      setDeletingCollege(false);
      setPendingCollegeDelete(null);
    }
  };

  const loadAdminDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Maintenance Mode Status
      const sysRef = doc(db, 'system', 'settings');
      const sysSnap = await getDoc(sysRef);
      if (sysSnap.exists()) {
        setMaintenanceMode(!!sysSnap.data().maintenanceMode);
      }

      // 2. Fetch All Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const userList: UserProfile[] = [];
      usersSnap.forEach((d) => userList.push(d.data() as UserProfile));
      setUsers(userList);
      setTotalUsers(userList.length);

      // 3. Fetch Custom Topics
      const topicsSnap = await getDocs(collection(db, 'topics'));
      const topicList: CustomTopic[] = [];
      topicsSnap.forEach((d) => topicList.push({ id: d.id, ...d.data() } as CustomTopic));
      setTopics(topicList);

      // 4. Fetch Topic Requests
      const reqSnap = await getDocs(collection(db, 'topic_requests'));
      const reqList: TopicRequest[] = [];
      reqSnap.forEach((d) => reqList.push({ id: d.id, ...d.data() } as TopicRequest));
      setTopicRequests(reqList);

      // Calculate approximate totals
      const quizCount = userList.reduce((acc, u) => acc + (u.xp ? Math.floor(u.xp / 10) : 0), 0);
      setTotalQuizzes(quizCount);
      setAvgScore(78);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      const nextState = !maintenanceMode;
      const sysRef = doc(db, 'system', 'settings');
      await setDoc(sysRef, { maintenanceMode: nextState }, { merge: true });
      setMaintenanceMode(nextState);
      setMsg(`Platform maintenance mode is now ${nextState ? 'ENABLED' : 'DISABLED'}.`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setError('Failed to update maintenance mode.');
    }
  };

  const handleResetUserLevels = async (targetUid: string) => {
    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, {
        topicLevels: DEFAULT_TOPIC_LEVELS,
      });

      setMsg('Reset user topic levels back to Level 2 (Medium).');
      setTimeout(() => setMsg(''), 3000);
      loadAdminDashboardData();
    } catch (err: any) {
      setError('Failed to reset user levels.');
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    try {
      const topicColRef = collection(db, 'topics');
      await addDoc(topicColRef, {
        name: newTopicName.trim(),
        description: newTopicDesc.trim() || 'Custom Computer Science Quiz Topic',
        createdAt: new Date().toISOString(),
      });

      setNewTopicName('');
      setNewTopicDesc('');
      setMsg(`Added new topic: "${newTopicName}"!`);
      setTimeout(() => setMsg(''), 3000);
      loadAdminDashboardData();
    } catch (err: any) {
      setError('Failed to add new topic.');
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'topics', id));
      setMsg('Topic deleted.');
      setTimeout(() => setMsg(''), 3000);
      loadAdminDashboardData();
    } catch (err: any) {
      setError('Failed to delete topic.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 cyber-glass-box text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-2xl font-semibold text-white">Access Restricted</h2>
        <p className="text-xs text-slate-300">
          Administrator privileges are required to access the Quiz Worthy Control Panel.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.collegeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="neo-glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyber-magenta/10 border border-cyber-magenta/30 text-cyber-magenta text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Administrative Control Panel
          </div>
          <h1 className="text-3xl font-semibold text-white">System Operations & Maintenance</h1>
          <p className="text-xs text-slate-300">
            Logged in as Super Administrator (<span className="text-cyber-cyan font-bold">{userProfile.email}</span>)
          </p>
        </div>

        {/* Maintenance Switch */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-400" /> Maintenance Mode
            </div>
            <div className="text-[11px] text-slate-400">
              {maintenanceMode ? 'Restricting platform access' : 'Platform online'}
            </div>
          </div>
          <button
            onClick={handleToggleMaintenance}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              maintenanceMode
                ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
            }`}
          >
            {maintenanceMode ? 'ENABLED (Disable)' : 'DISABLED (Enable)'}
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-cyber-neonGreen/10 border border-cyber-neonGreen/40 rounded-xl text-cyber-neonGreen text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Platform Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="neo-glass-card p-6 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalUsers}</div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Registered Users</div>
          </div>
        </div>

        <div className="neo-glass-card p-6 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-cyber-magenta/10 border border-cyber-magenta/30 text-cyber-magenta">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalQuizzes}+</div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Quizzes Taken</div>
          </div>
        </div>

        <div className="neo-glass-card p-6 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{avgScore}%</div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Platform Avg Score</div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="neo-glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyber-cyan" /> User Management
            </h2>
            <p className="text-xs text-slate-400">Inspect user profiles and reset difficulty levels.</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email..."
              className="cyber-input py-2 pl-9 text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-mono uppercase">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">College</th>
                <th className="py-3 px-4">XP</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-white/5 transition">
                  <td className="py-3.5 px-4 font-bold text-white">{u.name}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">{u.email}</td>
                  <td className="py-3.5 px-4 text-slate-400">{u.collegeName}</td>
                  <td className="py-3.5 px-4 font-bold text-cyber-cyan">{u.xp} XP</td>
                  <td className="py-3.5 px-4">
                    <span className="neo-badge bg-white/10 text-slate-200">{u.role}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleResetUserLevels(u.uid)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 font-bold rounded-lg transition text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      title="Reset all topic levels to 2"
                    >
                      <RotateCcw className="w-3 h-3 text-cyber-cyan" /> Reset Levels
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Topic Manager & Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dynamic Topic Manager */}
        <div className="neo-glass-card p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyber-cyan" /> Dynamic Topic Manager
            </h2>
            <p className="text-xs text-slate-400">Add custom quiz topics to display on the Home page.</p>
          </div>

          <form onSubmit={handleAddTopic} className="space-y-3">
            <input
              type="text"
              required
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Topic Name (e.g. Cloud Computing)..."
              className="cyber-input py-2.5 text-xs"
            />
            <input
              type="text"
              value={newTopicDesc}
              onChange={(e) => setNewTopicDesc(e.target.value)}
              placeholder="Short Description..."
              className="cyber-input py-2.5 text-xs"
            />
            <button type="submit" className="cyber-button-primary text-xs py-2.5 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          </form>

          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Custom Topics ({topics.length})
            </h3>
            {topics.length === 0 ? (
              <div className="text-xs text-slate-500 font-mono py-2">No custom topics added yet.</div>
            ) : (
              <div className="space-y-2">
                {topics.map((t) => (
                  <div key={t.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-xs">{t.name}</div>
                      <div className="text-[11px] text-slate-400">{t.description}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteTopic(t.id)}
                      className="text-slate-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Topic Requests Feed */}
        <div className="neo-glass-card p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyber-magenta" /> Topic Requests Feed
            </h2>
            <p className="text-xs text-slate-400">User suggestions submitted via Contact Support.</p>
          </div>

          {topicRequests.length === 0 ? (
            <div className="text-xs text-slate-500 font-mono py-8 text-center border border-dashed border-white/10 rounded-2xl">
              No topic requests submitted yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {topicRequests.map((req) => (
                <div key={req.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyber-cyan">{req.subject}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{req.details}</p>
                  <div className="text-[11px] text-slate-400 font-mono pt-1">
                    From: {req.userName} ({req.userEmail})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* College List Manager */}
      <div className="neo-glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-cyber-cyan" /> College List
            </h2>
            <p className="text-xs text-slate-400">
              Colleges added here appear in every college dropdown (registration, Google sign-up and profile edit),
              alongside the {PREDEFINED_COLLEGES.length} built-in colleges. Colleges students type in also show up here.
            </p>
          </div>
          <form onSubmit={handleAddCollege} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              required
              maxLength={120}
              value={newCollege}
              onChange={(e) => {
                setNewCollege(e.target.value);
                setCollegeNotice(null);
              }}
              placeholder="College name (e.g. Anurag University)"
              className="cyber-input py-2.5 text-xs md:w-72"
            />
            <button
              type="submit"
              disabled={savingCollege}
              className="cyber-button-primary w-auto px-4 text-xs py-2.5 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add College
            </button>
          </form>
        </div>

        {collegeNotice && (
          <div
            role="status"
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              collegeNotice.ok
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {collegeNotice.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{collegeNotice.text}</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Custom Colleges ({colleges.length})
            </h3>
            {colleges.length > 5 && (
              <input
                type="search"
                value={collegeFilter}
                onChange={(e) => setCollegeFilter(e.target.value)}
                placeholder="Filter colleges"
                aria-label="Filter colleges"
                className="cyber-input py-1.5 text-xs w-44"
              />
            )}
          </div>
          {colleges.length === 0 ? (
            <div className="text-xs text-slate-500 font-mono py-6 text-center border border-dashed border-white/10 rounded-2xl">
              No custom colleges yet. Add one above.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[360px] overflow-y-auto pr-1">
              {colleges
                .filter((c) => c.name.toLowerCase().includes(collegeFilter.trim().toLowerCase()))
                .map((c) => (
                  <div key={c.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-white truncate" title={c.name}>{c.name}</div>
                      {c.createdAt && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Added {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {pendingCollegeDelete === c.id ? (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[11px] text-slate-400">Remove?</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCollege(c)}
                          disabled={deletingCollege}
                          className="px-2 py-1 rounded-md text-[11px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 disabled:opacity-50"
                        >
                          {deletingCollege ? 'Removing…' : 'Remove'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingCollegeDelete(null)}
                          disabled={deletingCollege}
                          className="px-2 py-1 rounded-md text-[11px] text-slate-300 border border-white/10 hover:bg-white/5"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPendingCollegeDelete(c.id);
                          setCollegeNotice(null);
                        }}
                        className="text-slate-400 hover:text-red-400 p-1 flex-shrink-0"
                        aria-label={`Remove ${c.name}`}
                        title="Remove from list"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
