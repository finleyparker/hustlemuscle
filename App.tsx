import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from './database/firebase';  // your fixed firebase.js
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
//import { StyleSheet, View } from 'react-native';

//workout screens
import WorkoutPlanScreen from './screens/WorkoutPlanScreen';
import SessionListScreen from './screens/SessionListScreen';
import WorkoutLogScreen from './screens/WorkoutLogScreen';
import WorkoutHistoryScreen from './screens/WorkoutHistoryScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import TestWorkoutTimeline from './screens/TestWorkoutTimeline';

//main app screens
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';

//onboarding screens
import GenderScreen from './screens/GenderScreen';
import EquipmentScreen from './screens/EquipmentScreen';
import WeightScreen from './screens/Weight';
import FitnessGoal from './screens/FitnessGoal';
import ExperienceLevelScreen from './screens/ExperienceLevel';
import ActivityLevelScreen from './screens/ActivityLevel';
import DietaryRestrictionsScreen from './screens/DietaryRestrictions';

//diet screens
import DietScreen from './screens/DietScreen'; //main diet page
import NewDiet from './screens/NewDiet';
import CurrentPlan from './screens/CurrentPlan';
import FreeDaysPerWeekScreen from './screens/FreeDays';
import WorkoutCalendarScreen from './screens/WorkoutCalendarScreen';


//settings screen
import SettingsScreen from './screens/SettingsScreen';
import UpdateMetricsScreen from './screens/UpdateMetricsScreen';


const Stack = createNativeStackNavigator();

export default function App() {
    /*const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null); // <-- FIX


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }*/
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={'Login'} screenOptions={{ headerStyle: { backgroundColor: 'black' }, headerTintColor: 'white' }}>
                <Stack.Screen name="Login" component={AuthScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Sessions" component={SessionListScreen} />
                <Stack.Screen name="WorkoutPlan" component={WorkoutPlanScreen} />
                <Stack.Screen name="WorkoutLog" component={WorkoutLogScreen} />
                <Stack.Screen name="DietScreen" component={DietScreen} />
                <Stack.Screen name="FreeDays" component={FreeDaysPerWeekScreen} options={{ headerShown: false }} />
                <Stack.Screen name="NewDiet" component={NewDiet} />
                <Stack.Screen name="ExperienceLevel" component={ExperienceLevelScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Current" component={CurrentPlan} />
                <Stack.Screen name="Gender" component={GenderScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} options={{ headerShown: false }} />
                <Stack.Screen name="DietaryRestrictions" component={DietaryRestrictionsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Equipment" component={EquipmentScreen} options={{ headerShown: false }} />
                <Stack.Screen name="FitnessGoal" component={FitnessGoal} options={{ headerShown: false }} />
                <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
                <Stack.Screen name="Weight" component={WeightScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="WorkoutCalendar" component={WorkoutCalendarScreen} />
                <Stack.Screen name="UpdateMetrics" component={UpdateMetricsScreen} />
                <Stack.Screen name="Workout" component={WorkoutScreen} />
                <Stack.Screen name="TestWorkoutTimeline" component={TestWorkoutTimeline} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
/*
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0f0A',
  },
});
*/