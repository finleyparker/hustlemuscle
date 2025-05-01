import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import GenderScreen from './screens/onboarding/GenderScreen';
import WeightScreen from './screens/onboarding/WeightScreen';
import PhysiqueScreen from './screens/onboarding/PhysiqueScreen';
import AthleticAbilityScreen from './screens/onboarding/AthleticAbilityScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Gender"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' }
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Gender" component={GenderScreen} />
        <Stack.Screen name="Weight" component={WeightScreen} />
        <Stack.Screen name="Physique" component={PhysiqueScreen} />
        <Stack.Screen name="AthleticAbility" component={AthleticAbilityScreen} />
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