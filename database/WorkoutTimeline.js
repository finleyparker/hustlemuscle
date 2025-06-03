import { db, auth } from './firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';
import { formatDurationWeeks } from '../utils/planFormatters';

// =============================================
// Current Functions
// =============================================

const createWorkoutTimeline = async () => {
  try {
    const userId = auth.currentUser && auth.currentUser.uid;
    if (!userId) {
      throw new Error('No authenticated user found');
    }

    const workoutTimelineRef = doc(db, "workoutTimeline", userId);
    console.log('Creating new timeline document at path:', workoutTimelineRef.path);

    const workoutPlansRef = collection(db, "workoutPlans");
    const q = query(workoutPlansRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    let durationWeeks = 0;
    let workoutPlan = null;
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      durationWeeks = formatDurationWeeks(data.durationWeeks);
      workoutPlan = data.plan;
    }
    
    await setDoc(workoutTimelineRef, {
      userId: userId,
      durationWeeks: durationWeeks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Create the datedExercises subcollection
    const datedExercisesRef = collection(workoutTimelineRef, "datedExercises");
    
    // Migrate workout plan to timeline
    if (workoutPlan) {
      await migrateWorkoutPlanToTimeline(datedExercisesRef, workoutPlan, durationWeeks);
    }
    
    console.log('Successfully created timeline document with datedExercises subcollection');
    return true;
  } catch (error) {
    console.error('Error creating timeline document:', error);
    throw error;
  }
};

const getWorkoutTimeline = async () => {
  try {
    const userId = auth.currentUser && auth.currentUser.uid;
    console.log('Current user ID:', userId);
    
    const workoutTimelineRef = doc(db, "workoutTimeline", userId);
    const timelineDoc = await getDocs(workoutTimelineRef);
    
    if (!timelineDoc.exists()) {
      console.log('No timeline document found');
      return null;
    }

    const timelineData = timelineDoc.data();
    const datedExercisesRef = collection(workoutTimelineRef, "datedExercises");
    const exercisesSnapshot = await getDocs(datedExercisesRef);
    
    const exercises = exercisesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      durationWeeks: timelineData.durationWeeks,
      exercises: exercises
    };
  } catch (error) {
    console.error('Error in getWorkoutTimeline:', error);
    return null;
  }
};

// =============================================
// Migration Functions
// =============================================

const migrateWorkoutPlanToTimeline = async (datedExercisesRef, workoutPlan, durationWeeks) => {
  try {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (durationWeeks * 7));

    // Create a map of day names to their numeric values (0 = Sunday, 1 = Monday, etc.)
    const dayMap = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };

    // For each workout day in the plan
    for (const workoutDay of workoutPlan) {
      const dayOfWeek = dayMap[workoutDay.dayOfWeek.toLowerCase()];
      
      // Calculate all dates for this day of the week within the duration
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        if (currentDate.getDay() === dayOfWeek) {
          // Format date as YYYY-MM-DD for document ID
          const dateStr = currentDate.toISOString().split('T')[0];
          
          // Create document for this date
          await setDoc(doc(datedExercisesRef, dateStr), {
            date: dateStr,
            programId: workoutDay.programId || 'default',
            exercises: workoutDay.exercises.map(exercise => ({
              exerciseName: exercise.name,
              instructions: exercise.steps || [],
              reps: exercise.reps,
              sets: exercise.sets,
              restTime: exercise.restTime || '60s'
            }))
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    console.log('Successfully migrated workout plan to timeline');
  } catch (error) {
    console.error('Error migrating workout plan:', error);
    throw error;
  }
};

// =============================================
// Future Storage Functions
// =============================================
/*
TODO: Implement the following functions:

1. addExerciseToTimeline
   - Add a new exercise to the datedExercises subcollection
   - Parameters: exercise data, date
   - Returns: success status

2. updateExerciseInTimeline
   - Update an existing exercise in the datedExercises subcollection
   - Parameters: exerciseId, updated data
   - Returns: success status

3. deleteExerciseFromTimeline
   - Remove an exercise from the datedExercises subcollection
   - Parameters: exerciseId
   - Returns: success status

4. getExercisesByDateRange
   - Get all exercises within a date range
   - Parameters: startDate, endDate
   - Returns: array of exercises

5. getExerciseById
   - Get a specific exercise by its ID
   - Parameters: exerciseId
   - Returns: exercise data

6. updateTimelineMetadata
   - Update the main timeline document metadata
   - Parameters: updated fields
   - Returns: success status
*/

export { createWorkoutTimeline };
export default getWorkoutTimeline;
