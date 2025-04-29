import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import AuthScreen from './screens/AuthScreen';
import ExerciseListScreen from './screens/ExerciseListScreen';
export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ExerciseListScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0f0A',
  },
});