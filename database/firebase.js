import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";




// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBD61luNcXCzwDoRnMzAlFVTIUgpeCp5U4",
  authDomain: "hustlemuscle-940f2.firebaseapp.com",
  projectId: "hustlemuscle-940f2",
  storageBucket: "hustlemuscle-940f2.firebasestorage.app",
  messagingSenderId: "36393126022",
  appId: "1:36393126022:web:8489f6aa6aa746b2bca907"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const db = initializeFirestore(app, {
experimentalForceLongPolling: true
})

export { db, auth };