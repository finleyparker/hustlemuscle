import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Fetch all workout sessions
export const getSessionDetails = async () => {
    const querySnapshot = await getDocs(collection(db, 'WorkoutSession'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

//get session and exercises in it
export const getExerciseNamesFromSession = async (sessionId) => {
    try {
        const ref = doc(db, 'WorkoutSession', sessionId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            console.warn('No session found for ID:', sessionId);
            return [];
        }
        console.log('Get successfull');
        const data = snap.data();
        return data.exercise_name || [];
    } catch (error) {
        console.error('Firestore error:', error);
        return [];
    }
};


// Update an exercise's completion status, reps and sets
export const updateExerciseCompletion = async (completions) => {
    const promises = completions.map((completion) => {
        const ref = doc(db, 'exerciseCompletions', `${completion.workout_session_id}_${completion.exercise_id}`);
        return setDoc(ref, completion);
    });

    await Promise.all(promises);
};



