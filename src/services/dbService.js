// ─── Database Service (Firestore) ───
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from '../firebase/firebaseConfig';

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

// ─── File Upload ───

/**
 * Upload a file to Firebase Storage and return its download URL.
 */
export async function uploadFile(path, file) {
  if (!storage) throw new Error('Firebase Storage is not configured.');
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// ─── Multi-Tenant Workspace ───

/**
 * Create an SME workspace after signup.
 * Creates both `businesses` and `users` Firestore documents.
 * Generates a unique businessId automatically.
 * @returns {{ businessId: string }}
 */
export async function createWorkspace(userId, name, phone, businessName, whatsappNumber, location, latitude, longitude, shopImageFile, role = 'owner') {
  ensureDb();

  let businessId = '';

  // Only create a business if the user is an owner
  if (role === 'owner') {
    // Generate a unique businessId
    const bizRef = doc(collection(db, 'businesses'));
    businessId = bizRef.id;

    // Upload shop image if provided
    let shopImage = '';
    if (shopImageFile) {
      try {
        shopImage = await uploadFile(`businesses/${businessId}/shop_photo`, shopImageFile);
      } catch (err) {
        console.warn('[createWorkspace] Shop image upload failed, skipping:', err);
      }
    }

    // Create business document
    await setDoc(bizRef, {
      businessId,
      businessName,
      location: location || '',
      latitude,
      longitude,
      shopImage,
      ownerId: userId,
      createdAt: serverTimestamp(),
      subscriptionPlan: 'free',
      planStartDate: serverTimestamp(),
      planExpiryDate: null, // Unlimited for free? Or 1 month rolling?
      invoiceCountThisMonth: 0,
      productCount: 0,
      customerCount: 0,
      staffCount: 0,
      lastCountResetDate: serverTimestamp(),
    });
  }

  // Create user profile document
  await setDoc(doc(db, 'users', userId), {
    userId,
    fullName: name, // Aligning with joinBusiness which uses fullName
    phone,
    whatsappNumber: whatsappNumber || phone,
    role,
    businessId,
    setupCompleted: false, // Owners need to do setup too
    createdAt: serverTimestamp(),
  });

  return { businessId };
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, data) {
  ensureDb();
  await setDoc(doc(db, 'users', userId), data, { merge: true });
}

/**
 * Generic function to increment a counter in business or user document
 */
export async function incrementCounter(collectionName, docId, field, amount = 1) {
  ensureDb();
  const { increment } = await import('firebase/firestore');
  await updateDoc(doc(db, collectionName, docId), {
    [field]: increment(amount)
  });
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

// ─── User Management ───

/**
 * Get all users belonging to a specific business.
 */
export async function getBusinessUsers(businessId) {
  ensureDb();
  const q = query(collection(db, 'users'), where('businessId', '==', businessId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Update a user's role.
 */
export async function updateUserRole(userId, newRole) {
  ensureDb();
  await updateDoc(doc(db, 'users', userId), { role: newRole });
}

/**
 * Update a user's active status (e.g., deactivate).
 */
export async function updateUserStatus(userId, status) {
  ensureDb();
  await updateDoc(doc(db, 'users', userId), { status });
}

// ─── Join Requests ───

/**
 * Create a join request for a non-owner user wanting to join an existing business.
 * The request is stored as "pending" until the business owner approves it.
 * @returns {{ requestId: string }}
 */
export async function createJoinRequest(userId, fullName, phone, whatsappNumber, requestedRole, businessId) {
  ensureDb();
  const reqRef = doc(collection(db, 'joinRequests'));
  const requestId = reqRef.id;

  await setDoc(reqRef, {
    requestId,
    userId, // The Firebase Auth UID
    fullName,
    phone,
    whatsappNumber: whatsappNumber || phone,
    requestedRole,
    businessId,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  return { requestId };
}

/**
 * Get all join requests for a specific business.
 */
export async function getJoinRequests(businessId, status = 'pending') {
  ensureDb();
  const q = query(
    collection(db, 'joinRequests'),
    where('businessId', '==', businessId),
    where('status', '==', status)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Approve a join request — create a user document and update status.
 */
export async function approveJoinRequest(request) {
  ensureDb();
  const { requestId, userId, businessId } = request;

  // Update existing user document
  await updateDoc(doc(db, 'users', userId), {
    businessId,
    setupCompleted: true,
    joinStatus: 'approved',
  });

  // Update request status
  await updateDoc(doc(db, 'joinRequests', requestId), {
    status: 'approved',
  });
}

/**
 * Reject a join request.
 */
export async function rejectJoinRequest(requestId) {
  ensureDb();
  await updateDoc(doc(db, 'joinRequests', requestId), {
    status: 'rejected',
  });
}
