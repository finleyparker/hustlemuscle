import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Button, StyleSheet } from 'react-native';
import WorkoutPlanScreen from './screens/WorkoutPlanScreen'; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Fitness App',
            headerStyle: { backgroundColor: '#007AFF' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="WorkoutPlanScreen"
          component={WorkoutPlanScreen}
          options={{
            title: 'Your Workout Plan',
            headerStyle: { backgroundColor: '#007AFF' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
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
  
  console.log("Navigating with User Input:", userInput); // Log the userInput for debugging
  
  return (
    <View style={styles.homeContainer}>
      <Button
        title="Generate Workout Plan"
        onPress={() => navigation.navigate('WorkoutPlanScreen', { userInput })}
        color="#007AFF"
      />
    </View>
  );
  
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
});