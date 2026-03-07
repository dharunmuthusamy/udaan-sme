// ─── Assessment Firestore Service ───
import { 
  addDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Save assessment result to Firestore
 */
export async function saveAssessment(userId, businessId, resultData) {
  try {
    const docRef = await addDoc(collection(db, 'assessments'), {
      userId,
      businessId,
      ...resultData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error('[AssessmentService] Error saving:', err);
    throw err;
  }
}

/**
 * Get the most recent assessment for a user
 */
export async function getLatestAssessment(userId) {
  try {
    const q = query(
      collection(db, 'assessments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch (err) {
    console.error('[AssessmentService] Error fetching latest:', err);
    return null;
  }
}
