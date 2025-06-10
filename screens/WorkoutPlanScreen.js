import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { generateWorkoutPlan } from '../utils/planGenerator';
import { db } from '../database/firebase';
import { collection, addDoc, getDocs, getDoc, query, where, doc} from 'firebase/firestore';
import { updateDoc } from 'firebase/firestore';
import { getAllExercises } from '../api/exercises';
import { getAuth } from 'firebase/auth';


// Creates a cache key from user preferences
// Returns 'default-key' if no input provided (fallback)
const createUserInputKey = (userInput) => {
  if (!userInput) return 'default-key';
  const { goal = '', level = '', daysPerWeek = 0, equipment = [] } = userInput;
  const sortedEquipment = [...equipment].sort();
  return `${goal}-${level}-${daysPerWeek}-${sortedEquipment.join(',')}`;
};

// Main screen that displays and manages the generated workout plan
// Handles:
// - Plan display
// - Exercise replacement
// - Plan regeneration
// - Warning display
const WorkoutPlanScreen = ({ route, navigation }) => {
  const [plan, setPlan] = useState([]);
  const [planName, setPlanName] = useState('');

  const [warnings, setWarnings] = useState([]);
  const [durationWeeks, setDurationWeeks] = useState(null); 
  const [loading, setLoading] = useState(true);

  const [userInput, setUserInput] = useState(null);
  const [userInputReady, setUserInputReady] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;
  
  // Fetches user preferences from Firestore when component mounts
  // Constructs userInput object from stored data
  useEffect(() => {
    const fetchUserInput = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('User not authenticated');
        return;
      }
      const userId = currentUser.uid;

      try {
        const userDetailsDoc = await getDoc(doc(db, 'UserDetails', userId));
        if (userDetailsDoc.exists()) {
          const data = userDetailsDoc.data();
          const constructedInput = {
            goal: data.PhysiqueGoal || '',
            level: data.ExperienceLevel || '',
            daysPerWeek: data.WorkoutDaysPerWeek || 0,
            equipment: data.Equipment || [],
          };
          setUserInput(constructedInput);
          setUserInputReady(true);
        } else {
          console.error('No user details found for user:', userId);
          setUserInputReady(true); 
        }
      } catch (err) {
        console.error('Failed to fetch user input:', err);
        setUserInputReady(true);
      }
    };

    fetchUserInput();
  }, []);

  // Checks for existing workout plan when userInput becomes available
  // Uses userInputKey to find matching cached plan
  useEffect(() => {
    if (!userInputReady || !userInput) return;
    const loadPlan = async () => {
      try {
        const workoutPlansCollection = collection(db, 'workoutPlans');
        const userInputKey = createUserInputKey(userInput);
        
        // Query for existing document
        const q = query(
          workoutPlansCollection, 
          where('userId', '==', userId),
          where('userInputKey', '==', userInputKey)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Use existing plan
          const existingDoc = querySnapshot.docs[0];
          const data = existingDoc.data();
          setPlan(data.plan || []);
          setWarnings(data.warnings || []);
          setDurationWeeks(data.durationWeeks || null);
          setPlanName(data.planName || '');
        } else {
          // Generate new plan only if none exists
          const startDate = new Date();
          const generated = await generateWorkoutPlan(userInput, userId, startDate);
          
          // Create new document
          await addDoc(workoutPlansCollection, {
            userId: userId,
            userInput,
            userInputKey,
            plan: generated.plan,
            warnings: generated.warnings || [],
            durationWeeks: generated.durationWeeks,
            planName: generated.planName,
            createdAt: startDate,
            updatedAt: startDate,
          });

          // Update state with new plan
          setPlan(generated.plan);
          setWarnings(generated.warnings || []);
          setDurationWeeks(generated.durationWeeks || null);
          setPlanName(generated.planName || '');

          // Create the workout timeline for new plan
          const { createWorkoutTimeline } = require('../database/WorkoutTimeline');
          await createWorkoutTimeline();
          console.log('Timeline created successfully');
        }

      } catch (error) {
        console.error('Failed to retrieve or generate plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [userInput, userInputReady, userId]);
  

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Generating your workout plan...</Text>
      </View>
    );
  }

  // Allows user to replace an exercise with a random alternative
  // Finds exercises that:
  // - Match current muscle groups
  // - Fit user's equipment/level
  // - Aren't already in the day's plan
  // Updates both local state and Firestore documents
  const handleReplaceExercise = async (dayIndex, exerciseIndex) => {
    const currentDay = plan[dayIndex];
    const currentExercise = currentDay.exercises[exerciseIndex];

    try {
      const allExercises = await getAllExercises();
      const targetCategories = {
        'weight loss': ['cardio', 'plyometrics'],
        'muscle gain': ['strength', 'powerlifting', 'strongman'],
        'flexibility': ['stretching'],
        'endurance': ['cardio', 'plyometrics'],
        'strength': ['strength', 'olympic weightlifting', 'powerlifting'],
      }[userInput.goal.toLowerCase()] || [];

      const normalizedEquipment = userInput.equipment.map(e => e.toLowerCase());

      // Get all exercise IDs currently in this day's plan
      const currentDayExerciseIds = currentDay.exercises.map(ex => ex.id);

      const alternatives = allExercises.filter(ex =>
        !currentDayExerciseIds.includes(ex.id) &&
        (
          ex.level?.toLowerCase() === userInput.level.toLowerCase() ||
          (userInput.level.toLowerCase() === 'intermediate' && ex.level?.toLowerCase() === 'beginner') ||
          (userInput.level.toLowerCase() === 'expert' && 
            (ex.level?.toLowerCase() === 'intermediate' || ex.level?.toLowerCase() === 'beginner'))
        ) &&
        (
          ex.equipment?.toLowerCase() === 'body only' ||
          ex.equipment?.toLowerCase() === 'none' ||
          normalizedEquipment.includes(ex.equipment?.toLowerCase())
        ) &&
        (
          ex.primaryMuscles?.some(m => currentExercise.muscles.includes(m)) ||
          ex.secondaryMuscles?.some(m => currentExercise.muscles.includes(m))
        ) &&
        targetCategories.includes(ex.category?.toLowerCase())
      );
      

      if (alternatives.length === 0) {
        alert('⚠️ No more alternative exercises available for this muscle group.');
        return;
      }

      const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
      const updatedExercise = {
        ...currentExercise,
        id: replacement.id,
        name: replacement.name,
        instructions: replacement.instructions || 'Follow correct form.',
        muscles: replacement.primaryMuscles || currentExercise.muscles,
      };

      const updatedDay = { ...currentDay };
      updatedDay.exercises[exerciseIndex] = updatedExercise;

      const updatedPlan = [...plan];
      updatedPlan[dayIndex] = updatedDay;

      setPlan(updatedPlan);


      const workoutPlansRef = collection(db, 'workoutPlans');
      const planQuery = query(
        workoutPlansRef,
        where('userId', '==', userId),
        where('userInputKey', '==', createUserInputKey(userInput))
      );
      
      const planSnap = await getDocs(planQuery);
      
      if (!planSnap.empty) {
        const planDoc = planSnap.docs[0];
        await updateDoc(planDoc.ref, {
          plan: updatedPlan,
          updatedAt: new Date().toISOString(),
        });
      } else {
        console.warn('No workout plan document found to update');
      }

      const workoutSessionsRef = collection(db, 'workout_sessions');
      const sessionQuery = query(
        workoutSessionsRef,
        where('user_id', '==', userId),
        where('session_id', '==', updatedDay.session_id)
      );
      
      const sessionSnap = await getDocs(sessionQuery);
      
      if (!sessionSnap.empty) {
        const sessionDoc = sessionSnap.docs[0];
        await updateDoc(sessionDoc.ref, {
          exercise_id: updatedDay.exercises.map(ex => ex.id),
          exercise_name: updatedDay.exercises.map(ex => ex.name),
          updatedAt: new Date().toISOString(),
        });
      } else {
        console.warn('No workout session document found to update');
      }

      alert('✅ Exercise replaced successfully!');
    } catch (err) {
      console.error('Failed to replace exercise:', err);
      alert('❌ Failed to replace exercise. Please try again.');
    }
  };


  // Completely regenerates the workout plan with new exercises
  // Preserves user preferences but creates fresh workout split
  // Updates Firestore and recreates workout timeline
  const regeneratePlan = async () => {
    try {
      setLoading(true);
      const newStartDate = new Date();
      console.log('Starting plan regeneration...');
      console.log('Current userInput:', userInput);
      console.log('Current userInputKey:', createUserInputKey(userInput));
      
      const generated = await generateWorkoutPlan(userInput, userId, newStartDate);
      console.log('Generated plan:', generated.plan);
      console.log('Generated durationWeeks:', generated.durationWeeks);
      
      setPlan(generated.plan);
      setWarnings(generated.warnings || []);
      setDurationWeeks(generated.durationWeeks || null);
      setPlanName(generated.planName || '');

      const workoutPlansRef = collection(db, 'workoutPlans');
      const userInputKey = createUserInputKey(userInput);

      // Query existing document
      const planQuery = query(
        workoutPlansRef,
        where('userId', '==', userId),
        where('userInputKey', '==', userInputKey)
      );
      const planSnap = await getDocs(planQuery);
      console.log('Found existing plans:', planSnap.size);

      if (!planSnap.empty) {
        // Update existing document
        const planDoc = planSnap.docs[0];
        console.log('Updating existing plan with ID:', planDoc.id);
        await updateDoc(planDoc.ref, {
          plan: generated.plan,
          warnings: generated.warnings || [],
          durationWeeks: generated.durationWeeks,
          planName: generated.planName,
          updatedAt: newStartDate,
        });
        console.log('Plan updated successfully');
      } else {
        console.log('No existing plan found, creating new one');
        // Create new document if none exists (fallback)
        const newDoc = await addDoc(workoutPlansRef, {
          userId: userId,
          userInput,
          userInputKey,
          plan: generated.plan,
          warnings: generated.warnings || [],
          durationWeeks: generated.durationWeeks,
          planName: generated.planName,
          createdAt: newStartDate,
          updatedAt: newStartDate,
        });
        console.log('New plan created with ID:', newDoc.id);
      }

      // Recreate the timeline with the new plan
      const { createWorkoutTimeline } = require('../database/WorkoutTimeline');
      await createWorkoutTimeline();
      console.log('Timeline recreated successfully');

    } catch (error) {
      console.error('Failed to regenerate workout plan:', error);
      Alert.alert('Error', 'Failed to regenerate workout plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // Main render method showing:
  // - Plan duration and name
  // - Any warnings/suggestions
  // - Daily workout cards with exercises
  // - Regeneration controls
  return (
    <ScrollView style={styles.container}
    contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Plan Duration */}
      <View style={styles.durationBox}>
        <Text style={styles.durationText}>
          <Text>📅</Text> Plan Duration: {durationWeeks || 'N/A'} weeks
        </Text>
        {planName ? (
          <Text style={styles.planNameText}>
            <Text>🏋️‍♂️</Text> Plan Name: {planName}
          </Text>
        ) : null}
      </View>

      {warnings.length > 0 && (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>
            <Text>⚠️</Text> Suggestions to Improve Your Plan:
          </Text>
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
              <Text style={styles.exerciseDetail}>Sets: {exercise.sets}</Text>
              <Text style={styles.exerciseDetail}>Reps: {exercise.reps}</Text>
              <Text style={styles.exerciseDetail}>Rest: {exercise.restTime}</Text>
              <Text style={styles.exerciseDetail}>Muscles: {exercise.muscles.join(', ')}</Text>

              <Text style={styles.instructions}>{exercise.instructions}</Text>
              <TouchableOpacity
                onPress={() => handleReplaceExercise(index, exIndex)}
                style={styles.replaceButton}
              >
                <Text style={{ color: '#4d9de0' }}>
                  <Text>🔁</Text> Replace Exercise
                </Text>
              </TouchableOpacity>

            </View>
          ))}
        </View>
      ))}

      {/* Regenerate Button */}
      <TouchableOpacity
        style={styles.regenerateButton}
        onPress={regeneratePlan}
      >
        <Text style={styles.regenerateButtonText}>
          <Text>🔄</Text> Regenerate Workout Plan
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );

};

// StyleSheet for the component
// Uses dark theme to match the apps colours
// Consistent spacing and card styling
const styles = StyleSheet.create({
  planNameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#a0a0a0', // Lighter gray for better readability on dark
    marginTop: 8,
  },
  container: {
    padding: 16,
    backgroundColor: '#121212', // Dark background
  },
  warningBox: {
    backgroundColor: '#2d2d00', // Dark yellow background
    borderLeftWidth: 6,
    borderLeftColor: '#ffcc00',
    padding: 16,
    marginBottom: 20,
    borderRadius: 8,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffcc00', // Yellow warning text
    marginBottom: 8,
  },
  warningText: {
    color: '#ffcc00', // Yellow warning text
    marginBottom: 4,
    fontSize: 15,
  },
  dayContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#1e1e1e', // Dark gray cards
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4d9de0', // Softer blue for headings
  },
  muscleFocus: {
    marginBottom: 10,
    fontStyle: 'italic',
    color: '#4d9de0', // Softer blue
  },
  exerciseCard: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#2a2a2a', // Slightly lighter gray for cards
    borderRadius: 8,
    elevation: 3,
  },
  exerciseName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#e0e0e0', // Light gray for text
  },
  instructions: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#a0a0a0', // Lighter gray for secondary text
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212', // Dark background
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4d9de0', // Softer blue
  },
  backButton: {
    backgroundColor: '#1a4b8c', // Darker blue for buttons
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  durationBox: {
    padding: 16,
    backgroundColor: '#1a1a2e', // Dark blue-gray
    borderRadius: 8,
    marginBottom: 20,
  },
  durationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4d9de0', // Softer blue
  },
  replaceButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  regenerateButton: {
    backgroundColor: '#1a4b8c', // Darker blue for buttons
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  regenerateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  exerciseDetail: {
    color: '#e0e0e0', // Light gray text
    fontSize: 15,
  },

});



export default WorkoutPlanScreen;