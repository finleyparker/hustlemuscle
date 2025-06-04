import {
  Timestamp,
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "./firebase";

// New fetch function from workoutTimeline
//get exercises from workout timeline for a given date
//if theres no workout for that date, find the next incomplete workout
export const getExercisesFromWorkoutTimeline = async (user_id, date) => {
  try {
    console.log("Getting exercises for date:", date);

    const userDocRef = doc(db, "workoutTimeline", user_id);
    const datedExercisesRef = collection(userDocRef, "datedExercises");

    // Step 1: Try to get today's workout
    const todayDoc = doc(datedExercisesRef, date);
    const todaySnap = await getDoc(todayDoc);

    if (todaySnap.exists()) {
      const data = todaySnap.data();
      console.log("Today's workout found.");
      return { exercises: data.exercises || [], date };
    }

    console.warn("No workout found for today:", date);

    // Step 2: Fallback – find next incomplete workout
    const allDocsSnap = await getDocs(datedExercisesRef);
    const futureIncompleteDocs = [];

    allDocsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (
        Array.isArray(data.exercises) &&
        (data.completionStatus || "").toLowerCase() === "incomplete"
      ) {
        futureIncompleteDocs.push({
          date: docSnap.id,
          exercises: data.exercises,
        });
      }
    });

    // Sort and return the earliest future incomplete workout
    const sorted = futureIncompleteDocs.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    if (sorted.length > 0) {
      console.log("workout: ", sorted[0]);
      console.log("Using fallback workout from:", sorted[0].date);
      return { exercises: sorted[0].exercises, date: sorted[0].date };
    }

    console.warn("No incomplete workouts found.");
    return { exercises: [], date: null };
  } catch (error) {
    console.error("Error fetching exercises from timeline:", error);
    return { exercises: [], date: null };
  }
};

//new save function for workoutTimeline
export const saveUpdatedTimeline = async (
  user_id,
  dateString,
  updatedExercises
) => {
  try {
    //navigates to the user's current session document
    const docRef = doc(
      db,
      "workoutTimeline",
      user_id,
      "datedExercises",
      dateString
    );
    //then updates the exercise list with reps, sets and weights
    //also changes completionStatus to complete
    await updateDoc(docRef, {
      exercises: updatedExercises,
      completionStatus: "complete",
    });
    console.log("Workout log updated.");
  } catch (error) {
    console.error("Failed to update workoutTimeline:", error);
  }
};

//old function for workouthistory
export const getCompletedSessions = async () => {
  const user = auth.currentUser;

  if (!user) {
    console.warn("User not logged in.");
    return [];
  }

  try {
    const sessionsRef = collection(db, "completed_sessions");
    const q = query(sessionsRef, where("user_id", "==", user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No completed sessions found for user:", user.uid);
      return [];
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      completion_date: doc.data().completion_date?.toDate(), // Convert Firestore timestamp to Date
    }));
  } catch (error) {
    console.error("Firebase error fetching completed sessions:", error);
    return [];
  }
};
