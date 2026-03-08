import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'quotations';

export const quotationService = {
  create: async (businessId, quotationData) => {
    const quotationRef = collection(db, COLLECTION_NAME);
    const finalData = {
      ...quotationData,
      businessId,
      status: quotationData.status || 'Draft',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(quotationRef, finalData);
    return { id: docRef.id, ...finalData };
  },

  getAll: async (businessId) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('businessId', '==', businessId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getById: async (quotationId) => {
    const docRef = doc(db, COLLECTION_NAME, quotationId);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  updateStatus: async (quotationId, status) => {
    const docRef = doc(db, COLLECTION_NAME, quotationId);
    await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
    return true;
  }
};
