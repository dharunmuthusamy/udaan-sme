import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  addDoc,
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'tasks';

export const taskService = {
  create: async (businessId, taskData) => {
    try {
      const taskRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(taskRef, {
        ...taskData,
        businessId,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...taskData };
    } catch (error) {
      console.error('[taskService] Create error:', error);
      throw error;
    }
  },

  getAll: async (businessId) => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('businessId', '==', businessId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[taskService] Get all error:', error);
      throw error;
    }
  },

  updateStatus: async (taskId, status) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, taskId);
      await updateDoc(docRef, { 
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('[taskService] Update status error:', error);
      throw error;
    }
  }
};
