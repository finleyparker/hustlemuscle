import { collection, setDoc, getDocs, doc, getDoc, addDoc, updateDoc, query, where } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Alert } from 'react-native';


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

export const getUserID = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.warn('User not logged in.');
        return [];
    }
    return user.uid;
}

export function logout(navigation) {
    auth.signOut()
        .then(() => {
            navigation.navigate('Login');
            Alert.alert("Logged out.");

        }).catch(error => {
            console.log('error: ', error);
            Alert.alert('Error: unable to logout.');
        })
}

export async function getUserName(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            return data.name || 'Unknown User';
        } else {
            return 'Unknown User';
        }
    } catch (error) {
        console.error('Error fetching username:', error);
        return 'Unknown User';
    }
}

// Update gender field in the specific document
export const updateGender = async (gender) => {
    const genderDocRef = doc(db, 'UserDetails', '07QDnA7D3QOrcZNS3Dfe');

    try {
        await setDoc(genderDocRef, { Gender: gender }, { merge: true });
        console.log('Gender updated successfully!');
    } catch (error) {
        console.error('Firestore error:', error);
        return [];
    }
};
