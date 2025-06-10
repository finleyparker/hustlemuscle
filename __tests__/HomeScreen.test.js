import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';
import { auth } from '../database/firebase';
import { getWorkoutTimeline } from '../database/WorkoutTimeline';
import { loadFromCache } from '../utils/cacheManager';

// Mock the required dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../database/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-id',
    },
  },
  db: {},
}));

jest.mock('../database/UserDB', () => ({
  getUserName: jest.fn().mockResolvedValue('Test User'),
}));

jest.mock('../database/WorkoutTimeline', () => ({
  getWorkoutTimeline: jest.fn(),
}));

jest.mock('../utils/cacheManager', () => ({
  loadFromCache: jest.fn(),
  saveToCache: jest.fn(),
  createCacheKey: jest.fn().mockReturnValue('test-cache-key'),
  CACHE_DURATIONS: {
    LONG: 86400000,
  },
}));

describe('HomeScreen Workout Session Display', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should display today\'s workout session when available', async () => {
    // Mock the cache to return null (forcing a fresh fetch)
    loadFromCache.mockResolvedValue(null);

    // Mock the workout timeline data
    const mockTimelineData = {
      exercises: [
        {
          day: 'Monday',
          exercises: [],
        },
      ],
    };
    getWorkoutTimeline.mockResolvedValue(mockTimelineData);

    // Render the component
    const { getByText } = render(<HomeScreen />);

    // Wait for the session to be loaded and displayed
    await waitFor(() => {
      expect(getByText('TODAY\'S SESSION:')).toBeTruthy();
      expect(getByText('Monday')).toBeTruthy();
    });
  });

  it('should display cached workout session when available', async () => {
    // Mock the cache to return a session
    loadFromCache.mockResolvedValue('Cached Session');

    // Render the component
    const { getByText } = render(<HomeScreen />);

    // Wait for the cached session to be displayed
    await waitFor(() => {
      expect(getByText('TODAY\'S SESSION:')).toBeTruthy();
      expect(getByText('Cached Session')).toBeTruthy();
    });

    // Verify that getWorkoutTimeline was not called (using cached data)
    expect(getWorkoutTimeline).not.toHaveBeenCalled();
  });

  it('should not display session section when no session is available', async () => {
    // Mock the cache to return null
    loadFromCache.mockResolvedValue(null);

    // Mock the workout timeline to return no exercises
    getWorkoutTimeline.mockResolvedValue({ exercises: [] });

    // Render the component
    const { queryByText } = render(<HomeScreen />);

    // Wait for the component to settle
    await waitFor(() => {
      // Verify that the session section is not displayed
      expect(queryByText('TODAY\'S SESSION:')).toBeNull();
    });
  });

  it('should handle errors gracefully when fetching workout timeline', async () => {
    // Mock the cache to return null
    loadFromCache.mockResolvedValue(null);

    // Mock the workout timeline to throw an error
    getWorkoutTimeline.mockRejectedValue(new Error('Failed to fetch timeline'));

    // Render the component
    const { queryByText } = render(<HomeScreen />);

    // Wait for the component to settle
    await waitFor(() => {
      // Verify that the session section is not displayed
      expect(queryByText('TODAY\'S SESSION:')).toBeNull();
    });
  });

  it('should update workout session when day changes', async () => {
    // Mock the cache to return null (forcing a fresh fetch)
    loadFromCache.mockResolvedValue(null);

    // Initial workout timeline data
    const initialTimelineData = {
      exercises: [
        {
          day: 'Monday',
          exercises: [],
        },
      ],
    };

    // Updated workout timeline data
    const updatedTimelineData = {
      exercises: [
        {
          day: 'Tuesday',
          exercises: [],
        },
      ],
    };

    // First render with Monday's workout
    getWorkoutTimeline.mockResolvedValueOnce(initialTimelineData);
    const { getByText, rerender } = render(<HomeScreen />);

    // Wait for initial session to be displayed
    await waitFor(() => {
      expect(getByText('TODAY\'S SESSION:')).toBeTruthy();
      expect(getByText('Monday')).toBeTruthy();
    });

    // Update the timeline data to Tuesday
    getWorkoutTimeline.mockResolvedValueOnce(updatedTimelineData);

    // Force a re-render to simulate day change
    await act(async () => {
      // Trigger the useEffect that checks for date changes
      const today = new Date();
      today.setDate(today.getDate() + 1); // Move to next day
      jest.advanceTimersByTime(60000); // Advance time by 1 minute
    });

    // Wait for updated session to be displayed
    await waitFor(() => {
      expect(getByText('TODAY\'S SESSION:')).toBeTruthy();
      expect(getByText('Tuesday')).toBeTruthy();
    });
  });
}); 