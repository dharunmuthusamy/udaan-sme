import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'vendors';

export const vendorService = {
  create: async (businessId, vendorData) => {
    const vendorRef = collection(db, COLLECTION_NAME);
    const finalData = {
      ...vendorData,
      businessId,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(vendorRef, finalData);
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

  getById: async (vendorId) => {
    const docRef = doc(db, COLLECTION_NAME, vendorId);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }
};
