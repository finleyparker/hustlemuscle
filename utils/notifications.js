import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }
  
  return true;
};

// Disable notifications completely
export const disableNotifications = async () => {
  try {
    // Cancel all scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Remove all notification handlers
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    
    // Clear any pending notifications
    await Notifications.dismissAllNotificationsAsync();
    
    console.log('Notifications disabled successfully');
    return true;
  } catch (error) {
    console.error('Error disabling notifications:', error);
    return false;
  }
};

// Enable notifications
export const enableNotifications = async () => {
  try {
    // Reset notification handler to default
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    
    console.log('Notifications enabled successfully');
    return true;
  } catch (error) {
    console.error('Error enabling notifications:', error);
    return false;
  }
};

// Schedule a notification for a missed workout
export const scheduleMissedWorkoutNotification = async (workoutDate, missedCount) => {
  console.log('Attempting to schedule notification:', { workoutDate, missedCount });
  
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('No notification permissions');
    return;
  }

  try {
    // Format the date for display
    const date = new Date(workoutDate);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });

    // Send immediate notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Missed Workout",
        body: "You missed a workout this week. Time to lock in! 💪",
        data: { workoutDate, missedCount },
        sound: true,
        priority: 'high',
      },
      trigger: null, // null trigger means show immediately
    });
    console.log('Notification scheduled successfully');
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.dismissAllNotificationsAsync();
}; 