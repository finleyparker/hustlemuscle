import React, { createContext, useState, useContext } from 'react';
import { runDailyTask } from '../utils/syncWorkoutSchedule';
import { triggerSessionRefetch } from '../utils/sessionManager';

const DateContext = createContext();

export const DateProvider = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  const updateDate = async (newDate) => {
    // Store the old date before updating
    const oldDate = currentDate;
    
    // Ensure we're working with a Date object
    const date = new Date(newDate);
    // Get the local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    console.log('DateContext - Updating date:', {
      oldDate,
      newDate: dateString,
      localDate: date.toLocaleDateString()
    });
    
    // Run the sync logic with both old and new dates
    try {
      // Run the daily task to shift workouts
      const result = await runDailyTask(dateString, oldDate);
      console.log('Sync result:', result);

      // Trigger a session refresh
      await triggerSessionRefetch();
    } catch (error) {
      console.error('Error in date update process:', error);
    }
    
    setCurrentDate(dateString);
  };

  return (
    <DateContext.Provider value={{ currentDate, updateDate }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
}; 