import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { generateWorkoutPlan } from '../utils/planGenerator'; // Adjust path if needed

const WorkoutPlanScreen = ({ route }) => {
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);

  const { userInput } = route.params;

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const generatedPlan = await generateWorkoutPlan(userInput);
        setPlan(generatedPlan);
      } catch (error) {
        console.error('Failed to generate plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [userInput]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Generating your workout plan...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {plan.map((day, index) => (
        <View key={index} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{day.day}</Text>
          <Text style={styles.muscleFocus}>Muscle Focus: {day.muscleFocus}</Text>
          {day.exercises.map((exercise, exIndex) => (
            <View key={`${exercise.name}-${exIndex}`} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text>Sets: {exercise.sets}</Text>
              <Text>Reps: {exercise.reps}</Text>
              <Text>Rest: {exercise.restTime}</Text>
              <Text>Muscles: {exercise.muscles.join(', ')}</Text>
              <Text style={styles.instructions}>{exercise.instructions}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  dayContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  muscleFocus: {
    marginBottom: 10,
    fontStyle: 'italic',
  },
  exerciseCard: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
  },
  exerciseName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  instructions: {
    marginTop: 4,
    fontStyle: 'italic',
    color: '#666',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default WorkoutPlanScreen;
