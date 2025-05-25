import { collection, setDoc, getDocs, doc, getDoc, addDoc, updateDoc, query, where } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Alert } from 'react-native';


export const getUserDetailsFromUserDetailsCollection = async (userId) => {
  try {
    const docRef = doc(db, 'UserDetails', userId); // or 'user_details' if that's your actual collection name
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Ensure all required fields exist
      if (!data.PhysiqueGoal || !data.ExperienceLevel || !data.WorkoutDaysPerWeek || !data.Equipment) {
        throw new Error('Missing required user preference fields');
      }
      return {
        goal: data.PhysiqueGoal,
        level: data.ExperienceLevel,
        daysPerWeek: data.WorkoutDaysPerWeek,
        equipment: data.Equipment,
        // Add any other fields you need
      };
    } else {
      throw new Error('User details document does not exist');
    }
  } catch (error) {
    console.error('Error in getUserDetailsFromUserDetailsCollection:', error);
    throw error; // Re-throw to handle in calling function
  }
};

//get the details of currently logged in user
export const getUserDetails = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.warn('User not logged in.');
        return [];
    }
    try {
        const docRef = doc(db, 'UserDetails', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.log('No details found for user:', user.uid);
            return [];
        }

        return [docSnap.data()]; // Return as array to maintain compatibility
    } catch (error) {
        console.error('Firebase error fetching user details:', error);
        return [];
    }
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
