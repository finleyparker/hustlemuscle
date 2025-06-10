import { db, auth } from '../database/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { clearTodaysSessionCache } from './cacheManager';

let sessionRefreshCallbacks = [];

export const registerSessionRefreshCallback = (callback) => {
    sessionRefreshCallbacks.push(callback);
    return () => {
        sessionRefreshCallbacks = sessionRefreshCallbacks.filter(cb => cb !== callback);
    };
};

export const triggerSessionRefetch = async () => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            console.log("No user found for session refresh");
            return;
        }

        // Clear the cache first
        await clearTodaysSessionCache();

        // Get fresh data from Firestore
        const workoutTimelineRef = doc(db, "workoutTimeline", userId);
        const timelineDoc = await getDoc(workoutTimelineRef);

        if (!timelineDoc.exists()) {
            console.log("No timeline document found during refresh");
            return;
        }

        // Notify all registered callbacks
        sessionRefreshCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error("Error in session refresh callback:", error);
            }
        });

        console.log("Session refresh completed successfully");
    } catch (error) {
        console.error("Error during session refresh:", error);
    }
}; 