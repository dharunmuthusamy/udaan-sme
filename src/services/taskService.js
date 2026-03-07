import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'tasks';

export const taskService = {
  create: async (businessId, data) => {
    return await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      businessId,
      createdAt: serverTimestamp(),
    });
  },

  getAll: async (businessId) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('businessId', '==', businessId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
