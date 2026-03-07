// ─── Authentication Service ───
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { isFirebaseConfigured } from '../firebase/firebaseConfig';

/**
 * Sign up a new user with email and password.
 * Also sets the displayName on the Firebase Auth profile.
 */
export async function signUp(email, password, displayName) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please add your credentials to .env');
  }
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return credential.user;
}

/**
 * Log in an existing user.
 */
export async function logIn(email, password) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please add your credentials to .env');
  }
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Log out the current user.
 */
export async function logOut() {
  if (!isFirebaseConfigured || !auth) return;
  await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 * @param {function} callback — receives (user | null)
 * @returns {function} unsubscribe
 */
export function onAuthChange(callback) {
  if (!isFirebaseConfigured || !auth) {
    // If Firebase isn't configured, immediately report no user
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
