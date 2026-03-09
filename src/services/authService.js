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
 * Convert a phone number to a synthetic email for Firebase Auth.
 * Firebase Auth requires email/password, so we derive a deterministic
 * email from the phone number. The real phone is stored in Firestore.
 */
function phoneToEmail(phone) {
  // Strip non-digits and normalize to 10-digit Indian number
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.length > 10 ? digits.slice(-10) : digits;
  return `${normalized}@udaansme.app`;
}

/**
 * Sign up a new user with phone number and password.
 * Uses a synthetic email derived from the phone number internally.
 */
export async function signUp(phone, password, displayName) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please add your credentials to .env');
  }
  const syntheticEmail = phoneToEmail(phone);
  const credential = await createUserWithEmailAndPassword(auth, syntheticEmail, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return credential.user;
}

/**
 * Log in an existing user with phone number and password.
 */
export async function logIn(phone, password) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please add your credentials to .env');
  }
  const syntheticEmail = phoneToEmail(phone);
  const credential = await signInWithEmailAndPassword(auth, syntheticEmail, password);
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
