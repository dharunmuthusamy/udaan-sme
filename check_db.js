import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyATN8Um2OBvWgHCDz5oBcvnb76ad54a5p4",
  authDomain: "udaan-sme.firebaseapp.com",
  projectId: "udaan-sme",
  storageBucket: "udaan-sme.firebasestorage.app",
  messagingSenderId: "133064407873",
  appId: "1:133064407873:web:ded785ad8956b5fb157fc0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  console.log('Fetching users and businesses from Firestore...');
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    console.log(`\nFound ${usersSnap.size} user(s):`);
    usersSnap.forEach(doc => {
      console.log(`- User ID: ${doc.id}`);
      console.log(doc.data());
    });

    const bizSnap = await getDocs(collection(db, 'businesses'));
    console.log(`\nFound ${bizSnap.size} business(es):`);
    bizSnap.forEach(doc => {
      console.log(`- Business ID: ${doc.id}`);
      console.log(doc.data());
    });
  } catch (err) {
    console.error('Error fetching data:', err.message);
  }
  process.exit(0);
}

check();
