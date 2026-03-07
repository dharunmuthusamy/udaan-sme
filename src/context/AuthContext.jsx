import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthChange, signUp as authSignUp, logIn as authLogIn, logOut as authLogOut } from '../services/authService';
import { createWorkspace, getUserProfile, getBusiness } from '../services/dbService';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // Firebase Auth user
  const [userData, setUserData] = useState(null);  // Firestore user profile
  const [businessData, setBusinessData] = useState(null); // Firestore business
  const [loading, setLoading] = useState(true);

  // Load Firestore profile whenever the auth user changes
  const loadProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setUserData(null);
      setBusinessData(null);
      return;
    }
    try {
      const profile = await getUserProfile(firebaseUser.uid);
      setUserData(profile);
      if (profile?.businessId) {
        const biz = await getBusiness(profile.businessId);
        setBusinessData(biz);
      }
    } catch (err) {
      console.error('[AuthContext] Failed to load profile:', err);
    }
  }, []);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      await loadProfile(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [loadProfile]);

  // ─── Auth actions ───

  async function signup(email, password, fullName, businessName) {
    const firebaseUser = await authSignUp(email, password, fullName);
    const { businessId } = await createWorkspace(firebaseUser.uid, fullName, email, businessName);
    await loadProfile(firebaseUser);
    return { user: firebaseUser, businessId, isNewBusiness: true };
  }

  async function login(email, password) {
    const firebaseUser = await authLogIn(email, password);
    await loadProfile(firebaseUser);
    return firebaseUser;
  }

  async function logout() {
    await authLogOut();
    setUser(null);
    setUserData(null);
    setBusinessData(null);
  }

  const value = {
    user,
    userData,
    businessData,
    loading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
