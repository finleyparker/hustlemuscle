import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

//workout screens
import WorkoutPlanScreen from '../screens/WorkoutPlanScreen';
import SessionListScreen from '../screens/SessionListScreen';
import WorkoutLogScreen from '../screens/WorkoutLogScreen';

//main app screens
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';

//diet screens
import DietScreen from '../screens/DietScreen'; //main diet page
import NewDiet from '../screens/NewDiet';
import CurrentPlan from '../screens/CurrentPlan';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Stack.Navigator initialRouteName="WorkoutPlan">
      <Stack.Screen name="Login" component={AuthScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Sessions" component={SessionListScreen} />
      <Stack.Screen name="WorkoutPlan" component={WorkoutPlanScreen} />
      <Stack.Screen name="WorkoutLog" component={WorkoutLogScreen} />
      <Stack.Screen name="DietScreen" component={DietScreen} />
      <Stack.Screen name="NewDiet" component={NewDiet} />
      <Stack.Screen name="Current" component={CurrentPlan} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0f0A',
  },
});