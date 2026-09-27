import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_TOPIC_LEVELS, PREDEFINED_COLLEGES } from '../types/user';
import { DailyTodoHUD } from '../components/DailyTodoHUD';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

import {
  Mail,
  GraduationCap,
  Calendar,
  Zap,
  Flame,
  Award,
  Medal,
  Shield,
  Edit2,
  Check,
  Plus,
  AlertCircle,
  CheckCircle2,
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
} from 'lucide-react';

const TOPIC_ICONS: Record<string, any> = {
  'Operating Systems': Cpu,
  'Computer Networks': Globe,
  DBMS: Database,
  Python: Code,
  Java: Terminal,
  'C++': Binary,
  Frontend: Layers,
  Backend: Server,
  'Machine Learning': BrainCircuit,
  DSA: Trophy,
};

export const Profile: React.FC = () => {
  const { userProfile, refreshUserProfile } = useAuth();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(userProfile?.name || '');
  const [selectedCollege, setSelectedCollege] = useState<string>(userProfile?.collegeName || PREDEFINED_COLLEGES[0]);
  const [customCollege, setCustomCollege] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [isNotStudent, setIsNotStudent] = useState<boolean>(!userProfile?.isStudent);
  const [collegesList, setCollegesList] = useState<string[]>(PREDEFINED_COLLEGES);

  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!userProfile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSelectCollege = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'OTHER_CUSTOM') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setSelectedCollege(val);
    }
  };

  const handleAddCustomCollege = () => {
    if (!customCollege.trim()) return;
    const trimmed = customCollege.trim();
    if (!collegesList.includes(trimmed)) {
      setCollegesList((prev) => [...prev, trimmed]);
    }
    setSelectedCollege(trimmed);
    setShowCustomInput(false);
    setCustomCollege('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    const finalCollege = isNotStudent
      ? 'Not Applicable'
      : showCustomInput && customCollege.trim()
      ? customCollege.trim()
      : selectedCollege;

    try {
      setSaving(true);
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, {
        name: name.trim(),
        collegeName: finalCollege,
        isStudent: !isNotStudent,
      });

      await refreshUserProfile();
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const getLevelBadge = (level: number) => {
    if (level === 1) {
      return { text: 'Level 1: Beginner', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
    if (level === 2) {
      return { text: 'Level 2: Intermediate', style: 'bg-sky-500/10 text-sky-400 border-sky-500/30' };
    }
    return { text: 'Level 3: Advanced', style: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
  };

  const topicLevelsMap = userProfile.topicLevels || DEFAULT_TOPIC_LEVELS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Alert Notices */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header Profile Card with Editing */}
      <div className="clean-glass-card p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold text-3xl shadow-sm flex-shrink-0">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl font-bold text-white">{userProfile.name}</h1>
                  <span
                    className={`clean-badge ${
                      userProfile.role === 'admin'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    }`}
                  >
                    {userProfile.role.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span>{userProfile.collegeName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Joined {new Date(userProfile.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Profile Edit Form */
              <form onSubmit={handleSaveProfile} className="space-y-3.5 w-full max-w-md">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-sky-400" /> Edit Profile Details
                </h2>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="clean-input"
                  />
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="notStudentEdit"
                    checked={isNotStudent}
                    onChange={(e) => setIsNotStudent(e.target.checked)}
                    className="w-4 h-4 accent-sky-500 cursor-pointer rounded"
                  />
                  <label htmlFor="notStudentEdit" className="text-xs text-slate-300 cursor-pointer select-none">
                    I am a working professional / not currently a student
                  </label>
                </div>

                {!isNotStudent && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-sky-400" />
                      Institution / University
                    </label>

                    {!showCustomInput ? (
                      <select
                        value={selectedCollege}
                        onChange={handleSelectCollege}
                        className="clean-input bg-slate-950 cursor-pointer"
                      >
                        {collegesList.map((col, idx) => (
                          <option key={idx} value={col} className="bg-slate-900 text-white">
                            {col}
                          </option>
                        ))}
                        <option value="OTHER_CUSTOM" className="bg-slate-900 text-sky-400 font-medium">
                          + Other (Add Custom Institution...)
                        </option>
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customCollege}
                            onChange={(e) => setCustomCollege(e.target.value)}
                            placeholder="Enter custom institution..."
                            className="clean-input"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomCollege}
                            className="px-3.5 py-2 bg-sky-600 text-white font-medium text-xs rounded-lg hover:bg-sky-500 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCustomInput(false)}
                          className="text-xs text-slate-400 hover:text-slate-200"
                        >
                          ← Back to dropdown list
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="clean-button-primary text-xs py-2 px-3.5"
                  >
                    {saving ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-2 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {!isEditing && (
            <button
              onClick={() => {
                setName(userProfile.name);
                setSelectedCollege(userProfile.collegeName);
                setIsEditing(true);
              }}
              className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer self-start"
            >
              <Edit2 className="w-3.5 h-3.5 text-sky-400" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="clean-glass-card p-5 flex flex-col items-center justify-center text-center space-y-1.5">
          <Zap className="w-6 h-6 text-sky-400 fill-sky-400" />
          <div className="text-2xl font-bold text-white">{userProfile.xp} XP</div>
          <div className="text-xs text-slate-400 font-medium">Total Experience</div>
        </div>

        <div className="clean-glass-card p-5 flex flex-col items-center justify-center text-center space-y-1.5">
          <Flame className="w-6 h-6 text-amber-400 fill-amber-400" />
          <div className="text-2xl font-bold text-white">{userProfile.currentStreak} Days</div>
          <div className="text-xs text-slate-400 font-medium">Current Streak</div>
        </div>

        <div className="clean-glass-card p-5 flex flex-col items-center justify-center text-center space-y-1.5">
          <Medal className="w-6 h-6 text-slate-300" />
          <div className="text-2xl font-bold text-white">{userProfile.silverBadges}</div>
          <div className="text-xs text-slate-400 font-medium">Silver Badges</div>
        </div>

        <div className="clean-glass-card p-5 flex flex-col items-center justify-center text-center space-y-1.5">
          <Award className="w-6 h-6 text-amber-400" />
          <div className="text-2xl font-bold text-white">{userProfile.goldBadges}</div>
          <div className="text-xs text-slate-400 font-medium">Gold Badges</div>
        </div>
      </div>

      {/* Daily To-Do HUD */}
      <DailyTodoHUD />

      {/* Activity Calendar Heatmap */}
      <ActivityHeatmap />

      {/* Topic Mastery Level Grid */}
      <div className="clean-glass-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" /> Topic Mastery Levels
          </h2>
          <p className="text-xs text-slate-400">
            Levels dynamically adjusted based on your performance across quiz sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(topicLevelsMap).map(([topic, level]) => {
            const Icon = TOPIC_ICONS[topic] || Shield;
            const badge = getLevelBadge(level);

            return (
              <div
                key={topic}
                className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-white text-xs">{topic}</span>
                  </div>

                  <span className={`clean-badge ${badge.style}`}>
                    {badge.text}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Level Progress</span>
                    <span>{level} / 3</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-md overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-md transition-all duration-300"
                      style={{ width: `${(level / 3) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Profile;
