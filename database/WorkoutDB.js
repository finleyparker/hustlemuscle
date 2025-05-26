import { Timestamp, collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where } from 'firebase/firestore';
import { db, auth } from './firebase';
import { getUserID } from './UserDB';

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
        console.log(data.exercise_name);
        return data.exercise_name || [];
    } catch (error) {
        console.error('Firestore error:', error);
        return [];
    }
};

export const getExerciseIDFromSession = async (sessionId) => {
    try {
        const ref = doc(db, 'workout_sessions', sessionId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            console.warn('No session found for ID:', sessionId);
            return [];
        }
        console.log('Get exercise ID successfull');
        const data = snap.data();
        console.log("exercise IDS: ", data.exercise_id);
        return data.exercise_id || [];
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

export const updateSessionCompletion = async (sessionId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not logged in');
        }

        // Get session details
        const sessionRef = doc(db, 'workout_sessions', sessionId);
        const sessionSnap = await getDoc(sessionRef);

        if (!sessionSnap.exists()) {
            throw new Error('Session not found');
        }

        const sessionData = sessionSnap.data();

        // Create completed session document

        //date
        const completion_date = new Date();
        completion_date.setSeconds(0, 0);
        console.log('session_completion date: ', completion_date);

        //get exercise_completion_ids
        //get all exercisecompletion documents with the same:
        //workout_session_id, user_id, completion_date

        const exercise_completion_ids = await getExerciseCompletions(user.uid, completion_date, sessionId);


        const completedSession = {
            completion_date: completion_date,
            session_name: sessionData.session_name,
            exercise_completion_ids: [], // This will be populated when exercises are completed
            user_id: user.uid,
            workout_session_id: sessionId
        };

        // Add to completed_sessions collection
        const docRef = await addDoc(collection(db, 'completed_sessions'), completedSession);
        console.log('Completed session added with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error completing session:', error);
        throw error;
    }
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


export const getExerciseCompletions = async (user_id, completion_date, sessionId) => {
    try {
        // Convert JS Date to Firestore Timestamp if needed
        const dateTimestamp = Timestamp.fromDate(new Date(completion_date)); // assumes completion_date is a valid JS Date or ISO string

        const sessionsRef = collection(db, 'ExerciseCompletion');
        const q = query(
            sessionsRef,
            where('user_id', '==', user_id),
            where('completion_date', '==', dateTimestamp),
            where('workout_session_id', '==', sessionId)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('No matching exercise completions found.');
            return [];
        }

        // Return only the document IDs
        return snapshot.docs.map((doc) => doc.id);

    } catch (error) {
        console.error('Firebase error fetching completed sessions:', error);
        return [];
    }
};


export const getCompletedSessions = async () => {
    const user = auth.currentUser;

    if (!user) {
        console.warn('User not logged in.');
        return [];
    }

    try {
        const sessionsRef = collection(db, 'completed_sessions');
        const q = query(sessionsRef, where('user_id', '==', user.uid));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('No completed sessions found for user:', user.uid);
            return [];
        }

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            completion_date: doc.data().completion_date?.toDate() // Convert Firestore timestamp to Date
        }));
    } catch (error) {
        console.error('Firebase error fetching completed sessions:', error);
        return [];
    }
};



