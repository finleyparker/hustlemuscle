import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where } from 'firebase/firestore';
import { db, auth } from './firebase';

// Fetch all workout sessions
export const getAllSessions = async () => {
    const querySnapshot = await getDocs(collection(db, 'workout_sessions'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// fetch session of currentuser
export const getSessionDetails = async () => {
    const user = auth.currentUser;

    if (!user) {
        console.warn('User not logged in.');
        return [];
    }

    console.log('Logged in user:', user.uid);

    try {
        const sessionsRef = collection(db, 'workout_sessions');
        const q = query(sessionsRef, where('user_id', '==', user.uid));
        const snapshot = await getDocs(q);

        console.log('Sessions found:', snapshot.size);

        if (snapshot.empty) {
            console.log('No matching sessions found for user:', user.uid);
        }

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Firebase error fetching sessions:', error);
        return [];
    }
};


//get session and exercises in it
export const getExerciseNamesFromSession = async (sessionId) => {
    try {
        const ref = doc(db, 'workout_sessions', sessionId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            console.warn('No session found for ID:', sessionId);
            return [];
        }
        console.log('Get exercise name successfull');
        const data = snap.data();
        return data.exercise_name || [];
    } catch (error) {
        console.error('Firestore error:', error);
        return [];
    }
};

// Update an exercise's completion status, reps, sets and weights
export const updateExerciseCompletion = async (completions) => {
    const promises = completions.map(completion =>
        addDoc(collection(db, 'ExerciseCompletion'), completion)
    );
    await Promise.all(promises);
};

export const getSessionName = async (sessionId) => {
    try {
        console.log('getting session name...');
        const ref = doc(db, 'workout_sessions', sessionId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            console.warn('No session name found for ID:', sessionId);
            return [];
        }
        console.log('Get session name successfull');
        const data = snap.data();
        return data.session_name || [];
    } catch (error) {
        console.error('Firestore error:', error);
        return [];
    }
};



