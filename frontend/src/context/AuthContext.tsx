import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendEmailVerification 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { UserProfile, DEFAULT_TOPIC_LEVELS, UserRole } from '../types/user';

const ADMIN_EMAIL = 'tagore1928@gmail.com';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  pendingGoogleUser: { uid: string; email: string; name: string } | null;
  registerWithEmail: (data: { name: string; email: string; pass: string; collegeName: string; isStudent: boolean }) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; requiresVerification?: boolean }>;
  loginWithGoogle: () => Promise<void>;
  completeGoogleOnboarding: (data: { name: string; collegeName: string; isStudent: boolean }) => Promise<void>;
  cancelGoogleOnboarding: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{ uid: string; email: string; name: string } | null>(null);

  // Fetch Firestore user doc
  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        // Enforce Email Verification for Email/Password provider users
        const isGoogleUser = user.providerData.some((p) => p.providerId === 'google.com');

        if (!isGoogleUser && !user.emailVerified) {
          // Block login until verified
          setCurrentUser(user);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        setCurrentUser(user);
        const profile = await fetchUserProfile(user.uid);
        
        if (profile) {
          setUserProfile(profile);
          setPendingGoogleUser(null);
        } else if (isGoogleUser) {
          // Mandatory onboarding step for new Google user
          setPendingGoogleUser({
            uid: user.uid,
            email: user.email || '',
            name: user.displayName || '',
          });
          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setPendingGoogleUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Auth Option 1: Email/Password Registration
  const registerWithEmail = async (data: { 
    name: string; 
    email: string; 
    pass: string; 
    collegeName: string; 
    isStudent: boolean 
  }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.pass);
    const user = userCredential.user;

    // Send Email Verification
    await sendEmailVerification(user);

    // Determine Role
    const role: UserRole = data.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

    // Create User Profile in Firestore
    const newProfile: UserProfile = {
      uid: user.uid,
      name: data.name,
      email: data.email,
      collegeName: data.collegeName,
      isStudent: data.isStudent,
      role,
      xp: 0,
      silverBadges: 0,
      goldBadges: 0,
      currentStreak: 0,
      topicLevels: { ...DEFAULT_TOPIC_LEVELS },
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', user.uid), newProfile);

    // Sign out immediately so user is required to verify before login
    await signOut(auth);
  };

  // Auth Option 1: Email/Password Login (Strict Verification Enforcement)
  const loginWithEmail = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Reload user to get latest emailVerified status
    await user.reload();

    if (!user.emailVerified) {
      return { success: false, requiresVerification: true };
    }

    const profile = await fetchUserProfile(user.uid);
    setUserProfile(profile);
    return { success: true };
  };

  // Auth Option 2: Google Sign-In
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const profile = await fetchUserProfile(user.uid);
    if (!profile) {
      // Direct user to onboarding modal
      setPendingGoogleUser({
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || '',
      });
    } else {
      setUserProfile(profile);
      setPendingGoogleUser(null);
    }
  };

  // Complete Google Onboarding
  const completeGoogleOnboarding = async (data: { name: string; collegeName: string; isStudent: boolean }) => {
    if (!currentUser || !pendingGoogleUser) {
      throw new Error('No pending Google user onboarding state found.');
    }

    const role: UserRole = pendingGoogleUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

    const newProfile: UserProfile = {
      uid: pendingGoogleUser.uid,
      name: data.name || pendingGoogleUser.name,
      email: pendingGoogleUser.email,
      collegeName: data.collegeName,
      isStudent: data.isStudent,
      role,
      xp: 0,
      silverBadges: 0,
      goldBadges: 0,
      currentStreak: 0,
      topicLevels: { ...DEFAULT_TOPIC_LEVELS },
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', pendingGoogleUser.uid), newProfile);
    setUserProfile(newProfile);
    setPendingGoogleUser(null);
  };

  const cancelGoogleOnboarding = async () => {
    await signOut(auth);
    setPendingGoogleUser(null);
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshUserProfile = async () => {
    if (currentUser?.uid) {
      const profile = await fetchUserProfile(currentUser.uid);
      setUserProfile(profile);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
    setPendingGoogleUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        pendingGoogleUser,
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        completeGoogleOnboarding,
        cancelGoogleOnboarding,
        resendVerificationEmail,
        refreshUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
