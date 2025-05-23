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

//main app screens
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';

//onboarding screens
import GenderScreen from './screens/GenderScreen';
import EquipmentScreen from './screens/EquipmentScreen';
import WeightScreen from './screens/Weight';
import PhysiqueScreen from './screens/Physique';
import AthleticAbilityScreen from './screens/ExperienceLevel';

//diet screens
import DietScreen from './screens/DietScreen'; //main diet page
import NewDiet from './screens/NewDiet';
import CurrentPlan from './screens/CurrentPlan';
import FreeDaysPerWeekScreen from './screens/FreeDay';


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
                <Stack.Screen name="Current" component={CurrentPlan} />
                <Stack.Screen name="Gender" component={GenderScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Equipment" component={EquipmentScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Physique" component={PhysiqueScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AthleticAbility" component={AthleticAbilityScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Weight" component={WeightScreen} options={{ headerShown: false }} />
                <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} options={{ headerShown: false }} />
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