import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'attendance';

export const attendanceService = {
  /**
   * Get all attendance records for a business
   */
  async getAll(businessId) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('businessId', '==', businessId),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  /**
   * Get attendance records for a specific staff member
   */
  async getByStaff(businessId, staffId) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('businessId', '==', businessId),
      where('staffId', '==', staffId),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  /**
   * Check in a staff member
   */
  async checkIn(businessId, staffId, staffName) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      businessId,
      staffId,
      staffName,
      date: dateStr,
      checkInTime: serverTimestamp(),
      checkOutTime: null,
      hoursWorked: 0,
      createdAt: serverTimestamp()
    });
    
    return docRef.id;
  },

  /**
   * Check out a staff member
   */
  async checkOut(attendanceId) {
    const attendanceRef = doc(db, COLLECTION_NAME, attendanceId);
    const snap = await getDoc(attendanceRef);
    
    if (!snap.exists()) throw new Error('Attendance record not found');
    
    const data = snap.data();
    const checkInTime = data.checkInTime.toDate();
    const checkOutTime = new Date();
    
    const diffMs = checkOutTime - checkInTime;
    const hoursWorked = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    
    await updateDoc(attendanceRef, {
      checkOutTime: serverTimestamp(),
      hoursWorked
    });
    
    return { checkOutTime, hoursWorked };
  },

  /**
   * Find today's active attendance for a staff member (not checked out yet)
   */
  async getActiveAttendance(staffId) {
    const dateStr = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, COLLECTION_NAME),
      where('staffId', '==', staffId),
      where('date', '==', dateStr),
      where('checkOutTime', '==', null)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
    return null;
  }
};
