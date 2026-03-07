// ─── Database Service (Firestore) ───
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebaseConfig';

function ensureDb() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured. Please add your credentials to .env');
  }
}

// ─── Generic CRUD ───

export async function getDocument(collectionName, docId) {
  ensureDb();
  const snap = await getDoc(doc(db, collectionName, docId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function setDocument(collectionName, docId, data) {
  ensureDb();
  await setDoc(doc(db, collectionName, docId), data, { merge: true });
}

export async function getCollection(collectionName) {
  ensureDb();
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Multi-Tenant Workspace ───

/**
 * Create an SME workspace after signup.
 * Creates both `businesses` and `users` Firestore documents.
 * @returns {{ businessId: string }}
 */
export async function createWorkspace(userId, name, email, businessName) {
  ensureDb();
  const businessId = userId;

  // Create business document
  await setDoc(doc(db, 'businesses', businessId), {
    businessName,
    ownerId: userId,
    createdAt: serverTimestamp(),
    subscriptionPlan: 'starter',
  });

  // Create user profile document
  await setDoc(doc(db, 'users', userId), {
    userId,
    name,
    email,
    role: 'owner',
    businessId,
    createdAt: serverTimestamp(),
  });

  return { businessId };
}

/**
 * Get a user profile from the `users` collection.
 */
export async function getUserProfile(userId) {
  ensureDb();
  return getDocument('users', userId);
}

/**
 * Get a business from the `businesses` collection.
 */
export async function getBusiness(businessId) {
  ensureDb();
  return getDocument('businesses', businessId);
}
