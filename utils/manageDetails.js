import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebase';

/**
 * Retrieves managed user details from Firestore for the current user.
 * Returns an object with Gender, Weight, PhysiqueGoal, ExperienceLevel, and WorkoutDaysPerWeek.
 */
export async function getUserManagedDetails() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not logged in.');
  }
  try {
    const docRef = doc(db, 'UserDetails', user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('No details found for user: ' + user.uid);
    }
    const data = docSnap.data();
    console.log('Raw data from Firestore:', data);
    return {
      Gender: data.Gender || null,
      Weight: data.Weight || null,
      WeightUnit: data.WeightUnit || 'kg',
      PhysiqueGoal: data.PhysiqueGoal || null,
      ExperienceLevel: data.ExperienceLevel || null,
      WorkoutDaysPerWeek: data.WorkoutDaysPerWeek || null,
      DietaryRestrictions: data.DietaryRestrictions || [],
    };
  } catch (error) {
    console.error('Error fetching managed user details:', error);
    throw error;
  }
} 