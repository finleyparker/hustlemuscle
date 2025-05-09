import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import SessionListScreen from './screens/SessionListScreen';
import WorkoutLogScreen from './screens/WorkoutLogScreen';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import Gender from './screens/Gender';
import EquipmentScreen from './screens/EquipmentScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Gender" component={Gender} options={{ headerShown: false }} />
        <Stack.Screen name="Equipment" component={EquipmentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Sessions" component={SessionListScreen} />
        <Stack.Screen name="WorkoutLog" component={WorkoutLogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0f0A',
  },
});