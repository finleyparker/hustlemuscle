import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkoutLogScreen from '../screens/WorkoutLogScreen';

//Mock Firebase-dependent DB functions
jest.mock('../database/WorkoutDB', () => ({
    getSessionName: jest.fn(() => Promise.resolve('Mocked Session')),
    getExerciseNamesFromSession: jest.fn(() =>
        Promise.resolve([
            { id: '1', name: 'Push Ups' },
        ])
    ),
}));

// setup navigator to satisfy useNavigation & useRoute
const Stack = createNativeStackNavigator();

const MockNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen
                name="WorkoutLog"
                component={WorkoutLogScreen}
                initialParams={{ sessionId: 'mockSessionId123' }}
            />
        </Stack.Navigator>
    </NavigationContainer>
);

describe('Exercise List', () => {
    //test for button rendering properly
    it('renders details button after loading', async () => {
        //go to workoutlogscreen through mock navigator and stack
        const { getByTestId } = render(<MockNavigator />);
        //find button in page
        const button = await waitFor(() => getByTestId('detailsButton'));

        //button should exist
        expect(button).toBeTruthy();
    });
});
