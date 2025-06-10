import {
  collection,
  setDoc,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { Alert } from "react-native";

export const getUserDetailsFromUserDetailsCollection = async (userId) => {
  try {
    const docRef = doc(db, "UserDetails", userId); // or 'user_details' if that's your actual collection name
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Ensure all required fields exist
      if (
        !data.PhysiqueGoal ||
        !data.ExperienceLevel ||
        !data.WorkoutDaysPerWeek ||
        !data.Equipment
      ) {
        throw new Error("Missing required user preference fields");
      }
      return {
        goal: data.PhysiqueGoal,
        level: data.ExperienceLevel,
        daysPerWeek: data.WorkoutDaysPerWeek,
        equipment: data.Equipment,
        streak: data.streak || 0,
        streakResetDate: data.streakResetDate || null,
        // Add any other fields you need
      };
    } else {
      throw new Error("User details document does not exist");
    }
  } catch (error) {
    console.error("Error in getUserDetailsFromUserDetailsCollection:", error);
    throw error; // Re-throw to handle in calling function
  }
};

export const getUserID = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.warn("User not logged in.");
    return [];
  }
  return user.uid;
};

export function logout(navigation) {
  auth
    .signOut()
    .then(() => {
      navigation.navigate("Login");
      Alert.alert("Logged out.");
    })
    .catch((error) => {
      console.log("error: ", error);
      Alert.alert("Error: unable to logout.");
    });
}

//fetch username from user details collection
export async function getUserName(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.name || "Unknown User";
    } else {
      return "Unknown User";
    }
  } catch (error) {
    console.error("Error fetching username:", error);
    return "Unknown User";
  }
}

// Update gender field in the specific document
export const updateGender = async (gender) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user is signed in");
    return [];
  }

  const genderDocRef = doc(db, "UserDetails", user.uid);

  try {
    await setDoc(genderDocRef, { Gender: gender }, { merge: true });
    console.log("Gender updated successfully!");
  } catch (error) {
    console.error("Firestore error:", error);
    return [];
  }
};

// Update fitness goal field in the specific document
export const updateFitnessGoal = async (goal) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user is signed in");
    return [];
  }

  const goalDocRef = doc(db, "UserDetails", user.uid);

  try {
    await setDoc(goalDocRef, { PhysiqueGoal: goal }, { merge: true });
    console.log("Fitness goal updated successfully!");
  } catch (error) {
    console.error("Firestore error:", error);
    return [];
  }
};

// Update experience level field in the specific document
export const updateExperienceLevel = async (level) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user is signed in");
    return [];
  }

  const levelDocRef = doc(db, "UserDetails", user.uid);

  try {
    await setDoc(levelDocRef, { ExperienceLevel: level }, { merge: true });
    console.log("Experience level updated successfully!");
  } catch (error) {
    console.error("Firestore error:", error);
    return [];
  }
};

// Update free days field in the specific document
export const updateFreeDays = async (days) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user is signed in");
    return [];
  }

  const daysDocRef = doc(db, "UserDetails", user.uid);

  try {
    await setDoc(daysDocRef, { WorkoutDaysPerWeek: days }, { merge: true });
    console.log("Free days updated successfully!");
  } catch (error) {
    console.error("Firestore error:", error);
    return [];
  }
};

// Update weight field in the specific document
export const updateWeight = async (weight, unit) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user is signed in");
    return [];
  }

  const weightDocRef = doc(db, "UserDetails", user.uid);

  try {
    await setDoc(
      weightDocRef,
      {
        Weight: parseFloat(weight),
        WeightUnit: unit,
      },
      { merge: true }
    );
    console.log("Weight updated successfully!");
  } catch (error) {
    console.error("Firestore error:", error);
    return [];
  }
};

// Update diet restrictions field in the specific document
export const updateDietRestrictions = async (restriction) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user is signed in");
    return [];
  }

  const restrictionsDocRef = doc(db, "UserDetails", user.uid);

  try {
    await setDoc(
      restrictionsDocRef,
      {
        DietaryRestrictions: restriction,
      },
      { merge: true }
    );
    console.log("Diet restriction updated successfully!");
  } catch (error) {
    console.error("Firestore error:", error);
    return [];
  }
};

// Update equipment field in the specific document
export const updateEquipment = async (equipment) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user is signed in");
    return [];
  }

  const equipmentDocRef = doc(db, "UserDetails", user.uid);

  try {
    await setDoc(
      equipmentDocRef,
      {
        Equipment: equipment,
      },
      { merge: true }
    );
    console.log("Equipment updated successfully!");
  } catch (error) {
    console.error("Firestore error:", error);
    return [];
  }
};
