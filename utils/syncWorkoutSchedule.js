import { db, auth } from '../database/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearCache, createCacheKey, clearTodaysSessionCache } from '../utils/cacheManager';

const runDailyTask = async (testDate = null) => {
    try {
        const userId = auth.currentUser?.uid;
        console.log("Current user ID:", userId);
        
        if (!userId) {
            console.log("No user found");
            return { success: false, message: "No user found" };
        }

        const handlePlanShift = async () => {
            const todayStr = new Date().toISOString().split('T')[0];
            const cacheKey = createCacheKey('todays_session', todayStr);
            const timestampKey = createCacheKey('todays_session_timestamp', todayStr);
            await clearCache(cacheKey, timestampKey);
            // Optionally, trigger a refetch or update state to force UI refresh
        };


        // Use testDate if provided, otherwise use current date
        const today = testDate ? new Date(testDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
        console.log("Checking for late exercises on:", today);

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
        
        // Find incomplete exercises
        const incompleteExercises = allExercisesSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(exercise => exercise.completionStatus === "incomplete")
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log("Incomplete exercises found:", incompleteExercises.length);
        
        if (incompleteExercises.length > 0) {
            const earliestExercise = incompleteExercises[0];
            const daysLate = Math.floor((new Date(today) - new Date(earliestExercise.date)) / (1000 * 60 * 60 * 24));
            
            console.log(`Earliest incomplete exercise is ${daysLate} days late`);
            console.log("Earliest exercise date:", earliestExercise.date);
            console.log("Today's date:", today);

            if (daysLate > 0) {
                // Update dates for all incomplete exercises
                for (const exercise of incompleteExercises) {
                    const newDate = new Date(exercise.date);
                    newDate.setDate(newDate.getDate() + daysLate);
                    const newDateStr = newDate.toISOString().slice(0, 10);

                    console.log(`Updating exercise from ${exercise.date} to ${newDateStr}`);

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

                console.log(`Successfully shifted all incomplete exercises forward by ${daysLate} days`);
                // Clear today's session cache
                await clearTodaysSessionCache();

                return { success: true, message: `Shifted exercises forward by ${daysLate} days` };
            }
        } else {
            console.log("No incomplete exercises found");
            return { success: true, message: "No incomplete exercises found" };
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
