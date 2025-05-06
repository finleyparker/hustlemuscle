import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { generateWorkoutPlan } from '../utils/planGenerator';
import { firestore } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const WorkoutPlanScreen = ({ route, navigation }) => {
  const [plan, setPlan] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  const { userInput } = route.params;

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const workoutPlansCollection = collection(firestore, 'workoutPlans');
        
        // Use a test userId for now (replace with actual userId once authentication is in place)
        const testUserId = 'testUserId123'; // Replace with actual userId when authentication is integrated
  
        // Adding multiple fields to the query
        const q = query(
          workoutPlansCollection, 
          where('userId', '==', testUserId), // Add this
          where('userInput.goal', '==', userInput.goal),
          where('userInput.level', '==', userInput.level),
          where('userInput.daysPerWeek', '==', userInput.daysPerWeek),
          where('userInput.equipment', 'array-contains', userInput.equipment)
        );
  
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.plan?.plan) {
              setPlan(data.plan.plan);
              setWarnings(data.plan.warnings || []);
            } else {
              setPlan(data.plan || []);
              setWarnings([]);
            }
          });
        } else {
          // If no plan matches, generate a new one and create workout sessions
          const generated = await generateWorkoutPlan(userInput, testUserId); // Pass test userId
          setPlan(generated.plan);
          setWarnings(generated.warnings || []);
          
          // Store the workout plan in Firestore
          await addDoc(workoutPlansCollection, {
            userId: testUserId, // Use the testUserId instead
            userInput,
            plan: generated,
            createdAt: new Date(),
          });
          
          
        }
      } catch (error) {
        console.error('Failed to retrieve or generate plan:', error);
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
        <Text style={styles.loadingText}>Generating your workout plan...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {warnings.length > 0 && (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Suggestions to Improve Your Plan:</Text>
          {warnings.map((warning, index) => (
            <Text key={index} style={styles.warningText}>• {warning}</Text>
          ))}
        </View>
      )}

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

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 6,
    borderLeftColor: '#ffcc00',
    padding: 16,
    marginBottom: 20,
    borderRadius: 8,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    color: '#856404',
    marginBottom: 4,
    fontSize: 15,
  },
  dayContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  muscleFocus: {
    marginBottom: 10,
    fontStyle: 'italic',
    color: '#007AFF',
  },
  exerciseCard: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 3,
  },
  exerciseName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  instructions: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#666',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default WorkoutPlanScreen;