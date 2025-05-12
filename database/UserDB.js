import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where } from 'firebase/firestore';
import { db, auth } from './firebase';

//get the details of currently logged in user
export const getUserDetails = async () => {
    const user = auth.currentUser;

    if (!user) {
        console.warn('User not logged in.');
        return [];
    }
    try {
        const ref = collection(db, 'users');
        const q = query(ref, where('user_id', '==', user.uid));
        const snap = await getDocs(q);

        if (snap.empty) {
            console.log('No details found for user:', user.uid);
        }

        return snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Firebase error fetching user details:', error);
        return [];
    }
}

export const getUserName = async (sessionId) => {
    try {
        console.log('getting user name...');
        console.log(sessionId);
        const ref = doc(db, 'users', sessionId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            console.warn('No user name found for ID:', sessionId);
            return [];
        }
        console.log('Get user name successfull');
        const data = snap.data();
        return data.name || [];
    } catch (error) {
        console.error('Firestore error:', error);
        return [];
    }
};