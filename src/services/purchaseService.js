import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  runTransaction,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'purchases';
const PRODUCTS_COLLECTION = 'products';

export const purchaseService = {
  create: async (businessId, purchaseData) => {
    const purchaseRef = collection(db, COLLECTION_NAME);
    const productRef = doc(db, PRODUCTS_COLLECTION, purchaseData.productId);

    return await runTransaction(db, async (transaction) => {
      const productSnap = await transaction.get(productRef);
      if (!productSnap.exists()) {
        throw new Error('Product does not exist');
      }

      const currentStock = Number(productSnap.data().stockQuantity || 0);
      const purchaseQty = Number(purchaseData.quantity);
      const newStock = currentStock + purchaseQty;

      // 1. Create Purchase record
      const finalPurchaseData = {
        ...purchaseData,
        businessId,
        createdAt: serverTimestamp(),
      };
      const newPurchaseRef = doc(purchaseRef);
      transaction.set(newPurchaseRef, finalPurchaseData);

      // 2. Update Product stock
      transaction.update(productRef, {
        stockQuantity: newStock,
        updatedAt: serverTimestamp()
      });

      return { id: newPurchaseRef.id, ...finalPurchaseData };
    });
  },

  getAll: async (businessId) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('businessId', '==', businessId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
