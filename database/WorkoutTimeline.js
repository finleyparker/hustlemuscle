/**
 * WorkoutTimeline.js
 * This module manages workout timelines in Firebase Firestore.
 * It handles creating timelines, migrating workout plans, and managing exercises.
 */

import { db, auth } from './firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc, getDoc } from 'firebase/firestore';
import { formatDurationWeeks } from '../utils/planFormatters';

// =============================================
// Current Functions
// =============================================

/**
 * Creates a new workout timeline for the current user
 * This function:
 * 1. Gets the current user's workout plan
 * 2. Creates a timeline document
 * 3. Migrates the workout plan to a timeline format
 * @returns {Promise<boolean>} True if successful
 * @throws {Error} If user is not authenticated or creation fails
 */
const createWorkoutTimeline = async () => {
  try {
    // Get current user ID and verify authentication
    const userId = auth.currentUser && auth.currentUser.uid;
    if (!userId) {
      throw new Error('No authenticated user found');
    }

    // Create reference to the user's timeline document
    const workoutTimelineRef = doc(db, "workoutTimeline", userId);
    //and this is the path to the timeline document
    

    
    // Query for existing workout plan from Taha's workoutPlanscollection
    const workoutPlansRef = collection(db, "workoutPlans");
    const q = query(workoutPlansRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    // Extract duration and plan from existing workout plan if it exists
    let durationWeeks = 0; //duration weeks equals 0 if no workout plan exists
    let workoutPlan = null; //workoutplan equals null if no workout plan exists
    if (!querySnapshot.empty) { //if there is a workout plan
      const data = querySnapshot.docs[0].data();
      durationWeeks = formatDurationWeeks(data.durationWeeks);
      workoutPlan = data.plan;  // here we take the plan array from the workoutPlan document for looping over the days of the week in the migrateWorkoutPlanToTimeline function
      console.log('Successfully retrieved workout plan:', workoutPlan);
    }
    
    // Create the timeline document with metadata if it doesn't already exist
    const timelineDoc = await getDoc(workoutTimelineRef);
    if (!timelineDoc.exists()) {
      await setDoc(workoutTimelineRef, {
        userId: userId,
        durationWeeks: durationWeeks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    

    // Create a new subcollection for storing dated exercises
    
    const datedExercisesRef = collection(workoutTimelineRef, "datedExercises");
    console.log('Creating new timeline document at path:', workoutTimelineRef.path);

    
    
    // If a workout plan exists, migrate it to the timeline
    if (workoutPlan) {
      await migrateWorkoutPlanToTimeline(datedExercisesRef, workoutPlan, durationWeeks);
      console.log('Successfully migrated workout plan to timeline');
    } else {
      console.log('No workout plan found to migrate');
    }
    
    console.log('Successfully created timeline document with datedExercises subcollection'); 
    return true;
  } catch (error) {
    console.error('Error creating timeline document:', error);
    throw error;
  }
};

/**
 * Retrieves the complete workout timeline for the current user
 * This function:
 * 1. Gets the user's timeline document
 * 2. Retrieves all dated exercises from the subcollection
 * 3. Returns the timeline metadata and exercises in a structured format
 * 
 * @returns {Promise<Object|null>} Returns an object containing:
 *   - durationWeeks: Number of weeks in the workout plan
 *   - exercises: Array of all exercises with their dates and details
 *   - markedDates: Object with dates marked for the calendar
 *   Returns null if no timeline exists or if there's an error
 */
const getWorkoutTimeline = async () => {
  try {
    const userId = auth.currentUser && auth.currentUser.uid;
    console.log('Current user ID:', userId);
    
    // Get the main timeline document for this user
    const workoutTimelineRef = doc(db, "workoutTimeline", userId);
    const timelineDoc = await getDoc(workoutTimelineRef);
    
    if (!timelineDoc.exists()) {
      console.log('No timeline document found');
      return null;
    }

    // Get the timeline metadata (duration, creation date, etc.)
    const timelineData = timelineDoc.data();
    
    // Get reference to the datedExercises subcollection
    const datedExercisesRef = collection(workoutTimelineRef, "datedExercises");
    const exercisesSnapshot = await getDocs(datedExercisesRef);
    
    // Transform the exercises data into a more usable format
    const exercises = exercisesSnapshot.docs.map(doc => ({
      id: doc.id,  // The date of the exercise (YYYY-MM-DD format)
      ...doc.data()  // Spread the exercise data (programId, exercises array, etc.)
    }));

    // Create marked dates object for the calendar
    const markedDates = {};
    exercises.forEach(exercise => {
      markedDates[exercise.date] = {
        marked: true,
        dotColor: '#ff5e69',
        selected: true,
        selectedColor: '#ff5e69',
        completionStatus: exercise.completionStatus || 'incomplete'
      };
    });

    // Return the complete timeline data
    return {
      durationWeeks: timelineData.durationWeeks,
      exercises: exercises,
      markedDates: markedDates
    };
  } catch (error) {
    console.error('Error in getWorkoutTimeline:', error);
    return null;
  }
};

// =============================================
// Migration Functions
// =============================================

/**
 * Migrates a workout plan to a timeline format
 * Creates dated exercise documents for each workout day within the duration period
 * @param {CollectionReference} datedExercisesRef - Reference to the datedExercises subcollection
 * @param {Array} workoutPlan - The workout plan to migrate
 * @param {number} durationWeeks - Duration of the workout plan in weeks
 */
const migrateWorkoutPlanToTimeline = async (datedExercisesRef, workoutPlan, durationWeeks) => {
  try {
    // Calculate start and end dates for the timeline
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (durationWeeks * 7));

    // Map day names to their numeric values (0 = Sunday, 1 = Monday, etc.)
    const dayMap = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };

    // Process each workout day in the plan
    for (const workoutDay of workoutPlan) { //workoutDay is a member of the plan array in the workoutPlan document
      const dayOfWeek = dayMap[workoutDay.dayOfWeek.toLowerCase()];  //dayOfWeek is the literal dayOfWeek key in the workoutPlan document, mapped to the values listed in the dayMap object above
      
      
      // Generate dates for this workout day within the duration
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        if (currentDate.getDay() === dayOfWeek) {
          // Create a document for each matching date
          const dateStr = currentDate.toISOString().split('T')[0];
          
          await setDoc(doc(datedExercisesRef, dateStr), {
            date: dateStr,
            programId: workoutDay.programId || 'default', //default is the default programId if no programId is provided or until it comes in handy later
            completionStatus: "incomplete", //incomplete is the default completion status until the user completes the day's workout
            exercises: workoutDay.exercises.map(exercise => ({
              exerciseName: exercise.name,
              instructions: exercise.steps || [],
              suggestedReps: exercise.reps,
              suggestedSets: exercise.sets,
              weight: 0,
              reps: 0,
              sets: 0, //sets, reps, and weight are 0 until the user completes the day's workout and fills in the reps and sets
              restTime: exercise.restTime || '60s' //60 seconds is the default rest time if no rest time is provided
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

export { createWorkoutTimeline, getWorkoutTimeline };
