import { collection, addDoc, query, where, getDocs, getDoc, doc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'products';

export const productService = {
  create: async (businessId, data) => {
    const finalData = {
      ...data,
      businessId,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), finalData);
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

  getById: async (productId) => {
    const docRef = doc(db, COLLECTION_NAME, productId);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  update: async (productId, data) => {
    const docRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    return true;
  },

  delete: async (productId) => {
    const docRef = doc(db, COLLECTION_NAME, productId);
    await deleteDoc(docRef);
    return true;
  },

  /**
   * Helper to update stock (used by invoice service or manual correction)
   */
  updateStock: async (productId, newQuantity) => {
    const docRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(docRef, { stockQuantity: newQuantity, updatedAt: serverTimestamp() });
  },

  getLowStock: async (businessId, threshold = 10) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('businessId', '==', businessId),
      where('stockQuantity', '<=', threshold)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
