import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { generateWorkoutPlan } from '../utils/planGenerator';
import { db } from '../database/firebase';
import { collection, addDoc, getDocs, getDoc, query, where, doc} from 'firebase/firestore';
import { updateDoc } from 'firebase/firestore';
import { getAllExercises } from '../api/exercises';
import { getAuth } from 'firebase/auth';



const createUserInputKey = (userInput) => {
  if (!userInput) return 'default-key';
  const { goal = '', level = '', daysPerWeek = 0, equipment = [] } = userInput;
  const sortedEquipment = [...equipment].sort();
  return `${goal}-${level}-${daysPerWeek}-${sortedEquipment.join(',')}`;
};

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
          // Construct userInput to match your expected structure
          const constructedInput = {
            goal: data.PhysiqueGoal || '',
            level: data.ExperienceLevel || '',
            daysPerWeek: data.WorkoutDaysPerWeek || 0,
            equipment: data.Equipment || [],
            // add more fields if needed
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

        const startDate = new Date();
        const generated = await generateWorkoutPlan(userInput, userId, startDate);

        if (!querySnapshot.empty) {
          // Update existing document
          const existingDoc = querySnapshot.docs[0];
          await updateDoc(existingDoc.ref, {
            plan: generated.plan,
            warnings: generated.warnings || [],
            durationWeeks: generated.durationWeeks,
            planName: generated.planName,
            updatedAt: startDate,
            userInput, // Update the userInput in case it changed
          });
        } else {
          // Create new document if none exists
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
        }

        // Update the state with the new plan
        setPlan(generated.plan);
        setWarnings(generated.warnings || []);
        setDurationWeeks(generated.durationWeeks || null);
        setPlanName(generated.planName || '');

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

      // Rest of your update logic remains the same...
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



  const regeneratePlan = async () => {
    try {
      setLoading(true);
      const newStartDate = new Date();
      const generated = await generateWorkoutPlan(userInput, userId, newStartDate);
      

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

      if (!planSnap.empty) {
        // Update existing document
        const planDoc = planSnap.docs[0];
        await updateDoc(planDoc.ref, {
          plan: generated.plan,
          warnings: generated.warnings || [],
          durationWeeks: generated.durationWeeks,
          planName: generated.planName,
          updatedAt: newStartDate,
        });
      } else {
        // Create new document if none exists (fallback)
        await addDoc(workoutPlansRef, {
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
      }
    } catch (error) {
    console.error('Failed to regenerate workout plan:', error);
    Alert.alert('Error', 'Failed to regenerate workout plan. Please try again.');
  } finally {
    setLoading(false);
  }
};



  return (
    <ScrollView style={styles.container}
    contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Plan Duration */}
      <View style={styles.durationBox}>
        <Text style={styles.durationText}>📅 Plan Duration: {durationWeeks || 'N/A'} weeks</Text>
        {planName ? (
          <Text style={styles.planNameText}>🏋️‍♂️ Plan Name: {planName}</Text>
          ) : null}

      </View>

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
              <TouchableOpacity
                onPress={() => handleReplaceExercise(index, exIndex)}
                style={styles.replaceButton}
              >
                <Text style={{ color: 'blue' }}>🔁 Replace Exercise</Text>
              </TouchableOpacity>

            </View>
          ))}
        </View>
      ))}
      {/* 🔁 Regenerate Button - insert it here */}
      <TouchableOpacity style={styles.backButton} onPress={regeneratePlan}>
        <Text style={styles.backButtonText}>🔄 Regenerate Plan</Text>
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

const styles = StyleSheet.create({
  planNameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginTop: 8,
  },

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
  durationBox: {
    padding: 16,
    backgroundColor: '#e6f2ff',
    borderRadius: 8,
    marginBottom: 20,
  },
  durationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005bb5',
  },
  replaceButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },


});

export default WorkoutPlanScreen;