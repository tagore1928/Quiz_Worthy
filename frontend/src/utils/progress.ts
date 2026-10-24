import { addDoc, collection, doc, getDocs, increment, runTransaction, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getISTDateKey, shiftDateKey } from './dateUtils';

interface StreakFields {
  currentStreak?: number;
  lastActiveDate?: string;
}

// The stored streak only changes on active days, so it goes stale once a day is
// missed. A streak is still alive if the last active day was today or yesterday.
export const getEffectiveStreak = (data: StreakFields, today: string = getISTDateKey()): number => {
  if (!data.lastActiveDate) return 0;
  const alive = data.lastActiveDate === today || data.lastActiveDate === shiftDateKey(today, 1);
  return alive ? data.currentStreak || 0 : 0;
};

// Counts consecutive active days ending at `today` from the user's activity log.
// Used once per user to seed the streak for accounts created before streaks existed.
const streakFromActivityLog = async (uid: string, today: string): Promise<number> => {
  const snap = await getDocs(collection(db, 'users', uid, 'activity'));
  const activeDays = new Set<string>();
  snap.forEach((d) => {
    const a = d.data();
    if ((a.quizzesCompleted || 0) > 0 || a.allTodosDone === true || (a.xpEarned || 0) > 0) {
      activeDays.add(d.id);
    }
  });
  activeDays.add(today);
  let streak = 0;
  while (activeDays.has(shiftDateKey(today, streak))) streak++;
  return streak;
};

// Records that the user was active today (IST) and updates their streak.
export const markActiveToday = async (uid: string): Promise<void> => {
  const today = getISTDateKey();
  const userRef = doc(db, 'users', uid);

  // Accounts created before streak tracking have no lastActiveDate: seed from history.
  const seeded = await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists()) return true;
    const data = snap.data() as StreakFields;
    if (!data.lastActiveDate) return false;
    if (data.lastActiveDate === today) return true;

    const continues = data.lastActiveDate === shiftDateKey(today, 1);
    tx.update(userRef, {
      currentStreak: continues ? (data.currentStreak || 0) + 1 : 1,
      lastActiveDate: today,
    });
    return true;
  });

  if (!seeded) {
    const streak = await streakFromActivityLog(uid, today);
    await updateDoc(userRef, { currentStreak: streak, lastActiveDate: today });
  }
};

export interface QuizResult {
  topic: string;
  score: number;
  percentage: number;
  previousLevel: number;
  newLevel: number;
}

// Saves a finished quiz: XP, topic level, attempt log, today's activity and streak.
export const recordQuizResult = async (uid: string, result: QuizResult): Promise<void> => {
  const today = getISTDateKey();
  const now = new Date().toISOString();

  await updateDoc(doc(db, 'users', uid), {
    xp: increment(result.score),
    [`topicLevels.${result.topic}`]: result.newLevel,
  });

  await addDoc(collection(db, 'users', uid, 'quiz_attempts'), { ...result, timestamp: now });

  await setDoc(
    doc(db, 'users', uid, 'activity', today),
    {
      date: today,
      quizzesCompleted: increment(1),
      xpEarned: increment(result.score),
      timestamp: now,
    },
    { merge: true }
  );

  await markActiveToday(uid);
};
