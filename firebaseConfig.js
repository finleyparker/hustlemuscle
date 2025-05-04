import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBD61luNcXCzwDoRnMzAlFVTIUgpeCp5U4",
  authDomain: "hustlemuscle-940f2.firebaseapp.com",
  projectId: "hustlemuscle-940f2",
  storageBucket: "hustlemuscle-940f2.firebasestorage.app",
  messagingSenderId: "36393126022",
  appId: "1:36393126022:web:8489f6aa6aa746b2bca907"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore(app);

export { firestore, app };
