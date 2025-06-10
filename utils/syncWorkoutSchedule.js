import { db, auth } from '../database/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearCache, createCacheKey, clearTodaysSessionCache } from '../utils/cacheManager';
import { scheduleMissedWorkoutNotification } from './notifications';

const runDailyTask = async (newDate = null, oldDate = null) => {
    try {
        const userId = auth.currentUser?.uid;
        console.log("Current user ID:", userId);
        
        if (!userId) {
            console.log("No user found");
            return { success: false, message: "No user found" };
        }

        // Use provided oldDate if available, otherwise use current date
        const originalDate = oldDate || new Date().toISOString().slice(0, 10);
        // Use newDate if provided, otherwise use original date
        const targetDate = newDate || originalDate;
        
        console.log("Original date (from context):", originalDate);
        console.log("Target date (new date):", targetDate);

        // Get the timeline document
        const workoutTimelineRef = doc(db, "workoutTimeline", userId);
        const timelineDoc = await getDoc(workoutTimelineRef);
        
        if (!timelineDoc.exists()) {
            console.log("No timeline document found");
            return { success: false, message: "No timeline found" };
        }

        // Get all exercises
        const datedExercisesRef = collection(workoutTimelineRef, "datedExercises");
        const allExercisesSnapshot = await getDocs(datedExercisesRef);
        console.log("Total exercises found:", allExercisesSnapshot.docs.length);
        
        // First, find all incomplete exercises to check for missed workouts
        const allIncompleteExercises = allExercisesSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(exercise => exercise.completionStatus === "incomplete")
            .sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB; // Sort ascending (earliest first)
            });

        // Check for missed workouts before any shifting
        const missedWorkouts = allIncompleteExercises.filter(exercise => {
            const exerciseDate = new Date(exercise.date);
            const originalDateObj = new Date(originalDate);
            exerciseDate.setHours(0, 0, 0, 0);
            originalDateObj.setHours(0, 0, 0, 0);
            // Only count as missed if more than 1 day ahead
            const daysDiff = Math.floor((originalDateObj - exerciseDate) / (1000 * 60 * 60 * 24));
            return daysDiff > 1;
        });

        // If there are missed workouts, send notification immediately
        if (missedWorkouts.length > 0) {
            console.log("Found missed workouts:", missedWorkouts.length);
            
            try {
                // Send notification immediately with the count of missed workouts
                await scheduleMissedWorkoutNotification(
                    originalDate,
                    missedWorkouts.length
                );
                console.log('Notification sent for missed workouts:', missedWorkouts.length);
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        }

        // Get all exercises that need to be shifted
        const allExercises = allExercisesSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB; // Sort ascending (earliest first)
            });

        // Find the earliest incomplete exercise to determine shift amount
        const earliestIncomplete = allExercises.find(ex => ex.completionStatus === "incomplete");
        if (earliestIncomplete) {
            // Calculate days to shift so that earliest incomplete workout lands on target date
            const earliestDate = new Date(earliestIncomplete.date);
            const targetDateObj = new Date(targetDate);
            earliestDate.setHours(0, 0, 0, 0);
            targetDateObj.setHours(0, 0, 0, 0);
            const daysToShift = Math.floor((targetDateObj - earliestDate) / (1000 * 60 * 60 * 24));

            if (daysToShift > 0) {
                // Only shift if the new date is ahead
                // Send notification for missed workout
                try {
                    await scheduleMissedWorkoutNotification(
                        earliestIncomplete.date,
                        1 // Always 1, since this is the missed workout
                    );
                    console.log('Notification sent for missed workout:', earliestIncomplete.date);
                } catch (error) {
                    console.error('Error sending notification:', error);
                }

                // Shift all incomplete workouts forward by daysToShift
                for (const exercise of allExercises) {
                    if (exercise.completionStatus !== 'complete') {
                        const newDate = new Date(exercise.date);
                        newDate.setDate(newDate.getDate() + daysToShift);
                        const newDateStr = newDate.toISOString().slice(0, 10);
                        try {
                            await setDoc(doc(datedExercisesRef, exercise.id), {
                                ...exercise,
                                date: newDateStr
                            });
                            console.log(`Successfully updated document ${exercise.id}`);
                        } catch (error) {
                            console.error(`Error updating document ${exercise.id}:`, error);
                            return { success: false, message: "Error updating exercises" };
                        }
                    }
                }
                // Clear today's session cache
                await clearTodaysSessionCache();
                return { success: true, message: `Shifted incomplete exercises by ${daysToShift} days`, dateShifted: true, newDate: targetDate };
            } else {
                // No shift needed, new date is not ahead
                return { success: true, message: "No shift needed", dateShifted: false, newDate: targetDate };
            }
        } else {
            console.log("No incomplete exercises found");
            return { success: true, message: "No incomplete exercises found", dateShifted: false, newDate: targetDate };
        }
    } catch (error) {
        console.error("Error in runDailyTask:", error);
        return { success: false, message: error.message };
    }
};

// Test function to simulate different dates
const testRunDailyTask = async () => {
    console.log("Starting testRunDailyTask...");
    // Get current date
    const currentDate = new Date();
    console.log("Current date:", currentDate.toISOString());
    
    // Create a date 2 days in the future
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 2);
    console.log("Simulating future date:", futureDate.toISOString());
    
    try {
        const result = await runDailyTask(futureDate);
        console.log("Test run completed successfully");
        return result; // Return the result from runDailyTask
    } catch (error) {
        console.error("Error in test run:", error);
        return { success: false, message: error.message }; // Return error result
    }
};

export { runDailyTask, testRunDailyTask };
