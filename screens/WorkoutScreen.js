import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const exercises = [
  { name: 'Pull-ups', sets: 4, reps: '8-10' },
  { name: 'Barbell Rows', sets: 4, reps: '8-10' },
  { name: 'Face Pulls', sets: 3, reps: '12-15' },
  { name: 'Bicep Curls', sets: 3, reps: '10-12' },
  { name: 'Hammer Curls', sets: 3, reps: '10-12' },
];

const WorkoutScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Program Section */}
        <Text style={styles.heading}>Your program:</Text>
        <TouchableOpacity style={styles.programBox} onPress={() => navigation.navigate('WorkoutPlan')} activeOpacity={0.85}>
          <Text style={styles.programName}>3-Day a Week Muscle Gain Program</Text>
          <Text style={styles.programDate}>Started on : dd/mm/yyyy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={() => {/* handle reset */}}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
        {/* Today's Workout */}
        <Text style={styles.heading}>Today's Workout:</Text>
        <Text style={styles.workoutTitle}>Day #7: Upper Body</Text>
        <View style={styles.exerciseList}>
          {exercises.map((ex, idx) => (
            <View key={ex.name} style={styles.exerciseCard}>
              <View>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.exerciseSets}>Sets: {ex.sets}</Text>
              </View>
              <Text style={styles.exerciseReps}>Reps: {ex.reps}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>Start Now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    backgroundColor: '#000',
  },
  heading: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 2,
    marginBottom: 6,
    marginTop: 8,
  },
  programBox: {
    backgroundColor: '#232325',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  programName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  programDate: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  resetButton: {
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  resetText: {
    color: '#bbb',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  workoutTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
  },
  exerciseList: {
    gap: 10,
  },
  exerciseCard: {
    backgroundColor: '#232325',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseSets: {
    color: '#bbb',
    fontSize: 13,
    marginTop: 2,
  },
  exerciseReps: {
    color: '#bbb',
    fontSize: 15,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#d3d3d3',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#222',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default WorkoutScreen; 