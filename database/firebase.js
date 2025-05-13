
// Your web app's Firebase configuration
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

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app; const auth = getAuth(app)

const db = initializeFirestore(app, {
experimentalForceLongPolling: true
})

export { db, auth };