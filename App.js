import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Button } from 'react-native';

import WorkoutPlanScreen from './screens/WorkoutPlanScreen'; // Make sure this path is correct

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* Home screen just generates and navigates for now */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="WorkoutPlanScreen" component={WorkoutPlanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Temporary Home Screen that navigates to the Workout Plan
function HomeScreen({ navigation }) {
  const userInput = {
    goal: 'muscle gain',
    level: 'beginner',
    daysPerWeek: 4,
    equipment: ['dumbbell', 'body only'],
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title="Generate Workout Plan"
        onPress={() => navigation.navigate('WorkoutPlanScreen', { userInput })}
      />
    </View>
  );
}
