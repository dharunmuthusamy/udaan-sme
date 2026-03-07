import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  updateDoc,
  serverTimestamp, 
  orderBy,
  runTransaction,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'invoices';

export const invoiceService = {
  /**
   * Creates an invoice, deducts stock, and updates customer purchase totals atomically.
   */
  create: async (businessId, invoiceData) => {
    return await runTransaction(db, async (transaction) => {
      const invoiceRef = doc(collection(db, COLLECTION_NAME));
      
      // 1. Verify and Prepare Inventory Updates
      const productUpdates = [];
      for (const item of invoiceData.products) {
        const productRef = doc(db, 'products', item.productId);
        const productSnap = await transaction.get(productRef);
        
        if (!productSnap.exists()) {
          throw new Error(`Product ${item.name} does not exist.`);
        }
        
        const currentStock = productSnap.data().stockQuantity || 0;
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Available: ${currentStock}`);
        }
        
        productUpdates.push({
          ref: productRef,
          newStock: currentStock - item.quantity
        });
      }

      // 2. Prepare Customer Update
      const customerRef = doc(db, 'customers', invoiceData.customerId);
      const customerSnap = await transaction.get(customerRef);
      if (!customerSnap.exists()) {
        throw new Error("Customer not found.");
      }

      // 3. Commit Inventory Updates
      for (const update of productUpdates) {
        transaction.update(update.ref, { stockQuantity: update.newStock });
      }

      // 4. Commit Customer CRM Update
      transaction.update(customerRef, {
        totalPurchases: increment(invoiceData.totalAmount),
        recentInvoices: arrayUnion(invoiceRef.id),
        updatedAt: serverTimestamp()
      });

      // 5. Create final invoice document
      const finalInvoiceData = {
        ...invoiceData,
        businessId,
        status: invoiceData.status || 'Pending',
        createdAt: serverTimestamp(),
      };
      
      transaction.set(invoiceRef, finalInvoiceData);
      
      return { id: invoiceRef.id, ...finalInvoiceData };
    });
  },

  getAll: async (businessId) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('businessId', '==', businessId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getById: async (invoiceId) => {
    const docRef = doc(db, COLLECTION_NAME, invoiceId);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  updateStatus: async (invoiceId, status) => {
    const docRef = doc(db, COLLECTION_NAME, invoiceId);
    await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
    return true;
  }
};
