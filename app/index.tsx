// App.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen'; // adjust the path if needed
import NewDiet from '../screens/NewDiet'; 
import CurrentPlan from '../screens/CurrentPlan'; 
import { enableScreens } from 'react-native-screens';

; // boost performance and fix the component error

enableScreens()
const Stack = createNativeStackNavigator();
 
const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="New" component={NewDiet} />
      <Stack.Screen name="Current" component={CurrentPlan} />
    </Stack.Navigator>
  );
};



export default AppNavigator;
