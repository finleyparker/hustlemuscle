import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyAx2nzHu9zjwavPd6m4Of47XU9ijLaK7qs",
  authDomain: "hustlemuscle-940f2.firebaseapp.com",
  projectId: "hustlemuscle-940f2",
  storageBucket: "hustlemuscle-940f2.appspot.com",
  messagingSenderId: "36393126022",
  appId: "1:36393126022:android:331299dadbe265fbbca907"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };


export default app; 