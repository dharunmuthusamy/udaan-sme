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

  async function signup(phone, password, fullName, businessName, whatsappNumber, location, shopImageFile, role) {
    const firebaseUser = await authSignUp(phone, password, fullName);
    const { businessId } = await createWorkspace(firebaseUser.uid, fullName, phone, businessName, whatsappNumber, location, shopImageFile, role);
    await loadProfile(firebaseUser);
    return { user: firebaseUser, businessId, isNewBusiness: role === 'owner' };
  }

  async function login(phone, password) {
    const firebaseUser = await authLogIn(phone, password);
    await loadProfile(firebaseUser);
    return firebaseUser;
  }

  async function joinBusiness(fullName, phone, password, whatsappNumber, role, businessId) {
    // 1. Create the Firebase Auth user
    const firebaseUser = await authSignUp(phone, password, fullName);
    // 2. Create the Join Request, attaching their UID so we can identify them
    // Note: We won't block them if this fails, but they won't be able to log in to dashboard without businessId
    const { createJoinRequest } = await import('../services/dbService');
    await createJoinRequest(firebaseUser.uid, fullName, phone, whatsappNumber, role, businessId);
    
    // Create a shell user profile so they aren't completely missing
    const { setDocument } = await import('../services/dbService');
    await setDocument('users', firebaseUser.uid, {
      userId: firebaseUser.uid,
      fullName,
      phone,
      whatsappNumber: whatsappNumber || phone,
      role,
      businessId: null, // No business until approved
      setupCompleted: false,
      joinStatus: 'pending'
    });

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
    joinBusiness,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
