import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getHeatmapDaysForPastYear, getISTYear } from '../utils/dateUtils';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { BadgeCelebrationModal } from './BadgeCelebrationModal';
import { Award, Flame, Calendar } from 'lucide-react';

interface ActivityRecord {
  date: string;
  quizzesCompleted?: number;
  allTodosDone?: boolean;
  xpEarned?: number;
}

export const ActivityHeatmap: React.FC = () => {
  const { userProfile } = useAuth();
  const currentYear = getISTYear();

  const heatmapDays = getHeatmapDaysForPastYear();

  const [activityMap, setActivityMap] = useState<Record<string, ActivityRecord>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDaysCount, setActiveDaysCount] = useState<number>(0);
  const [showGoldModal, setShowGoldModal] = useState<boolean>(false);

  useEffect(() => {
    if (userProfile?.uid) {
      fetchUserActivity();
    }
  }, [userProfile?.uid]);

  const fetchUserActivity = async () => {
    if (!userProfile?.uid) return;
    try {
      setLoading(true);
      const activityColRef = collection(db, 'users', userProfile.uid, 'activity');
      const snap = await getDocs(activityColRef);

      const records: Record<string, ActivityRecord> = {};
      let activeCount = 0;

      snap.forEach((docSnap) => {
        const data = docSnap.data() as ActivityRecord;
        records[docSnap.id] = data;

        const isActive =
          (data.quizzesCompleted && data.quizzesCompleted > 0) ||
          data.allTodosDone === true ||
          (data.xpEarned && data.xpEarned > 0);

        if (isActive) {
          activeCount++;
        }
      });

      setActivityMap(records);
      setActiveDaysCount(activeCount);

      // Check Gold Badge Milestone (50 active days)
      if (activeCount >= 50 && userProfile.uid) {
        checkAndAwardGoldBadge(activeCount);
      }
    } catch (err) {
      console.error('Error fetching activity map:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardGoldBadge = async (count: number) => {
    if (!userProfile?.uid) return;
    try {
      const userRef = doc(db, 'users', userProfile.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const goldBadgesAwarded = data.goldBadges50DayAwarded || false;

        if (!goldBadgesAwarded) {
          const currentGold = data.goldBadges || 0;
          await updateDoc(userRef, {
            goldBadges: currentGold + 1,
            goldBadges50DayAwarded: true,
          });

          setShowGoldModal(true);
        }
      }
    } catch (err) {
      console.error('Error checking gold badge milestone:', err);
    }
  };

  const isDayActive = (dateKey: string): boolean => {
    const rec = activityMap[dateKey];
    if (!rec) return false;
    return (
      (rec.quizzesCompleted && rec.quizzesCompleted > 0) ||
      rec.allTodosDone === true ||
      (rec.xpEarned && rec.xpEarned > 0) || false
    );
  };

  const goldProgressPercent = Math.min((activeDaysCount / 50) * 100, 100);

  return (
    <>
      <div className="clean-glass-card p-6 sm:p-8 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-white">Activity Calendar</h2>
            </div>
            <p className="text-xs text-slate-400">
              Annual activity tracking. Take quizzes or complete daily tasks to stay active.
            </p>
          </div>

          {/* Active Days Counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{activeDaysCount} Active Days</span>
            </div>
          </div>
        </div>

        {/* Gold Badge 50-Day Progress Bar */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> 50-Day Gold Badge Tracker
            </span>
            <span className="text-slate-300 font-mono">
              {activeDaysCount} / 50 Active Days
            </span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-md overflow-hidden border border-slate-700/60">
            <div
              className="h-full bg-amber-400 rounded-md transition-all duration-300"
              style={{ width: `${goldProgressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {activeDaysCount >= 50
              ? 'Gold Badge milestone achieved. Keep your daily streak going!'
              : `${50 - activeDaysCount} more active days required to earn the Gold Badge.`}
          </p>
        </div>

        {/* GitHub-style Contribution Grid */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Past 365 Days</span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-500">Less</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-700" />
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/50 border border-sky-400/50" />
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 border border-sky-400" />
              <span className="text-slate-500">More</span>
            </div>
          </div>

          {loading ? (
            <div className="h-28 flex items-center justify-center text-xs font-mono text-slate-400 animate-pulse">
              Loading calendar heatmap...
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="grid grid-rows-7 grid-flow-col gap-1 min-w-[650px]">
                {heatmapDays.map((day) => {
                  const active = isDayActive(day.dateKey);

                  return (
                    <div
                      key={day.dateKey}
                      title={`${day.displayDate}: ${active ? 'Active (Quiz/To-Do Completed)' : 'No activity'}`}
                      className={`w-3 h-3 rounded-sm transition-all duration-150 cursor-pointer ${
                        active
                          ? 'bg-sky-500 border border-sky-400'
                          : 'bg-slate-900 border border-slate-800 hover:border-slate-600'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gold Celebration Popup Modal */}
      {showGoldModal && (
        <BadgeCelebrationModal
          type="gold"
          title="50 Active Days Milestone"
          description="Incredible consistency. You have logged 50 active practice days in Quiz Worthy. The Gold Badge is now yours."
          onClose={() => setShowGoldModal(false)}
        />
      )}
    </>
  );
};

export default ActivityHeatmap;
