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

    // --- Weekly Workouts Count Logic ---
    const userDetailsRef = doc(db, 'UserDetails', user_id);
    const userDetailsSnap = await getDoc(userDetailsRef);
    
    // Get the start of the current week (Sunday)
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get all completed workouts for this week
    const datedExercisesRef = collection(db, "workoutTimeline", user_id, "datedExercises");
    const q = query(
      datedExercisesRef,
      where("completionStatus", "==", "complete")
    );
    const snapshot = await getDocs(q);
    
    // Count workouts completed this week
    let weeklyWorkouts = 0;
    snapshot.forEach(doc => {
      const workoutDate = new Date(doc.data().date);
      if (workoutDate >= startOfWeek) {
        weeklyWorkouts++;
      }
    });
    
    // Update the streak field with weekly count
    let bestStreak = 0;
    if (userDetailsSnap.exists()) {
      bestStreak = userDetailsSnap.data().bestStreak || 0;
    }
    const updateData = {
      streak: weeklyWorkouts,
      streakResetDate: startOfWeek.toISOString().split('T')[0], // Store week start date
    };
    if (weeklyWorkouts > bestStreak) {
      updateData.bestStreak = weeklyWorkouts;
    }
    await updateDoc(userDetailsRef, updateData);
    // --- End Weekly Workouts Count Logic ---
  } catch (error) {
    console.error("Failed to update workoutTimeline:", error);
  }
};

//new function for workouthistory
export const getCompletedSessions = async () => {
  const user = auth.currentUser;

  if (!user) {
    console.warn("User not logged in.");
    return [];
  }

  try {
    console.log("searching workouthistory for user: ", user.uid);
    const timelineRef = collection(
      db,
      "workoutTimeline",
      user.uid,
      "datedExercises"
    );
    const q = query(timelineRef, where("completionStatus", "==", "complete"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No completed workout sessions found for user:", user.uid);
      return [];
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      console.log(data);
      return {
        id: doc.id,
        ...data,
        completion_date: data.completion_date?.toDate?.() || null, // if field exists
      };
    });
  } catch (error) {
    console.error("Error fetching completed workoutTimeline sessions:", error);
    return [];
  }
};

//old function for workouthistory
/*
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
};*/
