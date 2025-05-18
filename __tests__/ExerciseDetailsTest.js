import React from 'react';
import { render } from '@testing-library/react';
import WorkoutLogScreen from '../screens/WorkoutLogScreen';
import AuthScreen from '../screens/AuthScreen';


describe('Exercise List', () => {
    it('renders button', () => {
        render(<AuthScreen />);
    });
});