import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import { readFileSync } from "fs";

const firebaseConfig = {
    apiKey: "AIzaSyBD61luNcXCzwDoRnMzAlFVTIUgpeCp5U4",
    authDomain: "hustlemuscle-940f2.firebaseapp.com",
    projectId: "hustlemuscle-940f2",
    storageBucket: "hustlemuscle-940f2.firebasestorage.app",
    messagingSenderId: "36393126022",
    appId: "1:36393126022:web:8489f6aa6aa746b2bca907"
};

//change these depending on the file and target firestore collection
const file = "./scripts/Sessions.json";
const target = "WorkoutSession";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const workoutPlans = JSON.parse(readFileSync(file, "utf8"));
const batch = writeBatch(db);
const workoutPlanCollection = collection(db, target);

workoutPlans.forEach((plan) => {
    const docRef = doc(workoutPlanCollection); // auto-generated ID
    batch.set(docRef, plan);
});

// Commit batch write
batch.commit().then(() => {
    console.log("entries added successfully!");
}).catch((error) => {
    console.error("Error adding entries: ", error);
});

//after setting up json file and editing file and target variables
//  run this command in terminal
//
//  node ./scripts/WriteWorkouts.js
//