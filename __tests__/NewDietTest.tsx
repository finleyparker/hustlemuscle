import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import NewDiet from '../screens/NewDiet';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../database/firebase';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../database/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user-id' } },
}));

describe('NewDiet', () => {
  it('renders meals after fetching', async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      docs: [
        {
          id: '2025-06-06',
          data: () => ({
            totalCalories: 1800,
            totalCarbs: 200,
            totalProtein: 100,
            totalFats: 80,
          }),
        },
      ],
    });

    const { getByText } = render(<NewDiet />);

    await waitFor(() => {
      expect(getByText('Date: 2025-06-06')).toBeTruthy();
      expect(getByText('Calories: 1800')).toBeTruthy();
      expect(getByText('Carbs: 200')).toBeTruthy();
      expect(getByText('Protein: 100')).toBeTruthy();
      expect(getByText('Fat: 80')).toBeTruthy();
    });
  });
});

describe('NewDiet Firebase interaction', () => {
    it('calls getDocs with the correct collection path', async () => {
      // Mock return of getDocs
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
  
      render(<NewDiet />);
  
      await waitFor(() => {
        expect(collection).toHaveBeenCalledWith(db, 'UserDetails', 'test-user-id', 'days');
        expect(getDocs).toHaveBeenCalled();
      });
    });
  });
