import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'orders';

export const orderService = {
  create: async (businessId, orderData) => {
    const orderRef = collection(db, COLLECTION_NAME);
    const finalData = {
      ...orderData,
      businessId,
      status: orderData.status || 'Pending',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(orderRef, finalData);
    return { id: docRef.id, ...finalData };
  },

  createFromQuotation: async (businessId, quotationId, orderData) => {
    try {
      return await runTransaction(db, async (transaction) => {
        const orderRef = doc(collection(db, COLLECTION_NAME));
        const quotationRef = doc(db, 'quotations', quotationId);

        const finalOrderData = {
          ...orderData,
          businessId,
          quotationId,
          status: 'Pending',
          createdAt: serverTimestamp(),
        };

        transaction.set(orderRef, finalOrderData);
        transaction.update(quotationRef, { 
          status: 'Converted',
          orderId: orderRef.id,
          convertedAt: serverTimestamp() 
        });

        return { id: orderRef.id, ...finalOrderData };
      });
    } catch (err) {
      console.error('[orderService] Conversion transaction failed:', err);
      throw err;
    }
  },

  getAll: async (businessId) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('businessId', '==', businessId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getById: async (orderId) => {
    const docRef = doc(db, COLLECTION_NAME, orderId);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  updateStatus: async (orderId, status) => {
    const docRef = doc(db, COLLECTION_NAME, orderId);
    await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
    return true;
  }
};
