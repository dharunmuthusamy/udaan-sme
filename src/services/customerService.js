import { collection, addDoc, query, where, getDocs, getDoc, doc, updateDoc, deleteDoc, serverTimestamp, orderBy, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'customers';

export const customerService = {
  create: async (businessId, data) => {
    const finalData = {
      ...data,
      businessId,
      totalPurchases: 0,
      recentInvoices: [],
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

  getById: async (customerId) => {
    const docRef = doc(db, COLLECTION_NAME, customerId);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  update: async (customerId, data) => {
    const docRef = doc(db, COLLECTION_NAME, customerId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    return true;
  },

  delete: async (customerId) => {
    const docRef = doc(db, COLLECTION_NAME, customerId);
    await deleteDoc(docRef);
    return true;
  },

  /**
   * Internal helper to record a purchase.
   * Usually called within an invoice creation transaction.
   */
  recordPurchase: async (transaction, customerId, invoiceId, amount) => {
    const customerRef = doc(db, COLLECTION_NAME, customerId);
    transaction.update(customerRef, {
      totalPurchases: increment(amount),
      recentInvoices: arrayUnion(invoiceId),
      updatedAt: serverTimestamp()
    });
  }
};
