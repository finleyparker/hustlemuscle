import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Fetch all workout plans
export const getWorkoutPlans = async () => {
    const querySnapshot = await getDocs(collection(db, 'WorkoutPlans'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Update specific plan's exercises (if you add saving)
export const updateWorkoutPlan = async (planId, exercises) => {
    const planRef = doc(db, 'workoutPlans', planId);
    await updateDoc(planRef, { exercises });
};