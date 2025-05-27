import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache duration constants
export const CACHE_DURATIONS = {
  SHORT: 1000 * 60 * 15,    // 15 minutes
  MEDIUM: 1000 * 60 * 60,   // 1 hour
  LONG: 1000 * 60 * 60 * 24 // 24 hours
};

export const createCacheKey = (prefix, id) => `${prefix}_${id}`;

export const loadFromCache = async (cacheKey, timestampKey, duration = CACHE_DURATIONS.MEDIUM) => {
  try {
    const cachedData = await AsyncStorage.getItem(cacheKey);
    const timestamp = await AsyncStorage.getItem(timestampKey);
    
    if (cachedData && timestamp) {
      const now = Date.now();
      const cacheAge = now - parseInt(timestamp);
      
      if (cacheAge < duration) {
        return JSON.parse(cachedData);
      }
    }
    return null;
  } catch (error) {
    console.error('Error loading from cache:', error);
    return null;
  }
};

export const saveToCache = async (cacheKey, timestampKey, data) => {
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    await AsyncStorage.setItem(timestampKey, Date.now().toString());
    return true;
  } catch (error) {
    console.error('Error saving to cache:', error);
    return false;
  }
};

export const clearCache = async (cacheKey, timestampKey) => {
  try {
    await AsyncStorage.removeItem(cacheKey);
    await AsyncStorage.removeItem(timestampKey);
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// Specific cache keys for different features
export const CACHE_KEYS = {
  WORKOUT_PLAN: {
    DATA: 'workout_plan_cache',
    TIMESTAMP: 'workout_plan_cache_timestamp'
  },
  // Add more cache keys for other features here
}; 