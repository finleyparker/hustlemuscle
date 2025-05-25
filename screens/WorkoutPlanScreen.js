import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { generateWorkoutPlan } from '../utils/planGenerator';
import { db } from '../database/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { auth } from '../database/firebase';
import { fetchUserInputFromFirestore } from '../utils/planGenerator';  



const WorkoutPlanScreen = ({ route, navigation }) => {
  const [plan, setPlan] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  


  useEffect(() => {
    const loadPlan = async () => {
      if (!userId) {
        console.error('No user is signed in');
        setLoading(false);
        return;
      }

      // fetch userInput from Firestore (your new function)
      const userInput = await fetchUserInputFromFirestore();
      if (!userInput) {
        console.error('Failed to fetch user input');
        setLoading(false);
        return;
      }

      try {
        const workoutPlansCollection = collection(db, 'workoutPlans');

        // Query for existing plans matching userId and input
        const q = query(
          workoutPlansCollection,
          where('userId', '==', userId),
          where('userInput.goal', '==', userInput.goal),
          where('userInput.level', '==', userInput.level),
          where('userInput.daysPerWeek', '==', userInput.daysPerWeek),
          where('userInput.equipment', 'array-contains-any', userInput.equipment)
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
          // Generate new plan and save to Firestore
          const generated = await generateWorkoutPlan(userInput, userId);
          setPlan(generated.plan);
          setWarnings(generated.warnings || []);

          await addDoc(workoutPlansCollection, {
            userId,
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
  }, [userId]);



  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#446df6" />
          <Text style={{ color: '#fff', marginTop: -100 }}>Loading sessions...</Text>
        </View>
      </SafeAreaView>
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

      <Text>Coming Soon: This feature is not implemented yet.</Text>

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