import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PREDEFINED_COLLEGES } from '../types/user';

// Institutions typed in by users are saved to the `colleges` collection so they
// appear in every college dropdown (registration, Google onboarding, profile edit).

const NOT_A_COLLEGE = 'not applicable';

const normalize = (name: string) => name.trim().replace(/\s+/g, ' ');

// Stable document id so the same college typed twice maps to one entry.
const collegeId = (name: string) =>
  normalize(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);

const isPredefined = (name: string) =>
  PREDEFINED_COLLEGES.some((c) => c.toLowerCase() === normalize(name).toLowerCase());

const mergeColleges = (lists: string[][]): string[] => {
  const seen = new Set<string>();
  const custom: string[] = [];
  for (const name of lists.flat()) {
    const clean = normalize(name);
    const key = clean.toLowerCase();
    if (!clean || key === NOT_A_COLLEGE || seen.has(key) || isPredefined(clean)) continue;
    seen.add(key);
    custom.push(clean);
  }
  custom.sort((a, b) => a.localeCompare(b));
  return [...PREDEFINED_COLLEGES, ...custom];
};

// Drop-in replacement for useState<string[]>(PREDEFINED_COLLEGES): starts with the
// predefined list (plus `include`, e.g. the user's current college) and adds the
// saved custom colleges once they load.
export const useCollegeOptions = (include?: string): [string[], Dispatch<SetStateAction<string[]>>] => {
  const [colleges, setColleges] = useState<string[]>(() => mergeColleges([include ? [include] : []]));

  useEffect(() => {
    let cancelled = false;
    getDocs(collection(db, 'colleges'))
      .then((snap) => {
        if (cancelled) return;
        const saved: string[] = [];
        snap.forEach((d) => {
          const name = d.data().name;
          if (typeof name === 'string') saved.push(name);
        });
        setColleges((current) => mergeColleges([current, saved]));
      })
      .catch((err) => console.warn('Could not load saved colleges:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  return [colleges, setColleges];
};

export type AddCollegeResult = 'added' | 'exists' | 'predefined' | 'invalid';

// Adds a college to the shared list, reporting why nothing was added if so.
export const addCollege = async (name: string): Promise<AddCollegeResult> => {
  const clean = normalize(name);
  if (clean.length < 2 || clean.length > 120 || clean.toLowerCase() === NOT_A_COLLEGE) return 'invalid';
  if (isPredefined(clean)) return 'predefined';
  const id = collegeId(clean);
  if (!id) return 'invalid';
  const ref = doc(db, 'colleges', id);
  if ((await getDoc(ref)).exists()) return 'exists';
  await setDoc(ref, { name: clean, createdAt: new Date().toISOString() });
  return 'added';
};

// Saves a user-entered college for future dropdowns. Predefined names and
// "Not Applicable" are skipped; an existing entry is left as it is.
export const saveCustomCollege = async (name: string): Promise<void> => {
  try {
    await addCollege(name);
  } catch (err) {
    // Saved by someone else at the same moment, or the rules are not deployed yet.
    console.warn('Could not save custom college:', err);
  }
};

export interface CustomCollege {
  id: string;
  name: string;
  createdAt?: string;
}

// Custom colleges for the admin panel, alphabetical.
export const listCustomColleges = async (): Promise<CustomCollege[]> => {
  const snap = await getDocs(collection(db, 'colleges'));
  const list: CustomCollege[] = [];
  snap.forEach((d) => list.push({ id: d.id, name: d.data().name, createdAt: d.data().createdAt }));
  return list.filter((c) => typeof c.name === 'string').sort((a, b) => a.name.localeCompare(b.name));
};

// Removes a custom college from the dropdowns (admin only, per Firestore rules).
// Profiles that already use it keep their college name.
export const deleteCollege = (id: string) => deleteDoc(doc(db, 'colleges', id));
