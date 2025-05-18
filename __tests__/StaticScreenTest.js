import React from 'react';
import { render } from '@testing-library/react';
import WorkoutLogScreen from '../screens/WorkoutLogScreen';
import AuthScreen from '../screens/AuthScreen';
import StaticScreen from '../screens/StaticScreen';


describe('Exercise List', () => {
    it('renders button', () => {
        render(<StaticScreen />);
    });
});