import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { createWorkoutTimeline } from '../database/WorkoutTimeline';
import { db, auth } from '../database/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { formatDurationWeeks } from '../utils/planFormatters';

const TestWorkoutTimeline = () => {
  const [durationWeeks, setDurationWeeks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testTimeline = async () => {
      try {
        await createWorkoutTimeline();
        
        // Get duration weeks from workout plan
        const userId = auth.currentUser && auth.currentUser.uid;
        const workoutPlansRef = collection(db, "workoutPlans");
        const q = query(workoutPlansRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setDurationWeeks(formatDurationWeeks(data.durationWeeks));
        }
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    testTimeline();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Duration Weeks:</Text>
          <Text style={styles.resultValue}>{durationWeeks}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  resultContainer: {
    backgroundColor: '#1C1C1E',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  resultLabel: {
    color: '#8E8E93',
    fontSize: 16,
    marginBottom: 8,
  },
  resultValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff5e69',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default TestWorkoutTimeline; 