import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { getAllExercises } from '../database/exercises';

export default function ExerciseListScreen() {
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      console.log('Starting to fetch exercises...');
      try {
        const data = await getAllExercises();
        console.log('Received data:', data);
        if (data && Array.isArray(data)) {
          setExercises(data);
        } else {
          setError('Invalid data received from API');
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        let errorMessage = 'Failed to load exercises. ';
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage += `Server responded with status ${error.response.status}: ${error.response.data?.error || 'Unknown error'}`;
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage += 'No response received from server';
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage += error.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Please check your API key and try again.</Text>
      </View>
    );
  }

  if (exercises.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No exercises found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {exercises.map((exercise, index) => (
        <View key={index} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseInfo}>Muscle: {exercise.primaryMuscles}{exercise.secondaryMuscles?.length > 0 ? `, ${exercise.secondaryMuscles.join(', ')}` : ''}</Text>
          <Text style={styles.exerciseInfo}>Type: {exercise.mechanic}</Text>
          <Text style={styles.exerciseInfo}>Equipment: {exercise.equipment}</Text>
          <Text style={styles.exerciseInfo}>Difficulty: {exercise.level}</Text>
          <Text style={styles.exerciseDescription}>{exercise.instructions}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exerciseInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  exerciseDescription: {
    fontSize: 14,
    marginTop: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});
