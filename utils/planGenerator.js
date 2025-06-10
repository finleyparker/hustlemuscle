import { getAllExercises } from '../api/exercises';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../database/firebase';
import { getUserDetailsFromUserDetailsCollection } from '../database/UserDB';
import { getAuth } from 'firebase/auth';


const createUserInputKey = (userInput) => {
  const { goal, level, daysPerWeek, equipment } = userInput;
  const sortedEquipment = [...equipment].sort(); // Ensure consistent order
  return `${goal}-${level}-${daysPerWeek}-${sortedEquipment.join(',')}`;
};

// Function to create workout session in Firestore
const createWorkoutSession = async (userId, sessionName, exercises, dayOfWeek, dates) => {
  try {
    const workoutSessionsCollection = collection(db, 'workout_sessions');
    const sessionId = sessionName.toLowerCase().replace('day_', '').replace('_', '');
    const planId = `plan_${userId}`;
    console.log('\n=== WORKOUT PLAN ID ===');
    console.log(planId);
    console.log('=====================\n');

    // Validate and format dates
    const validDates = (dates || []).map(date => {
      // Ensure date is a valid Date object
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        console.warn(`Invalid date: ${date}, using current date instead`);
        return new Date();
      }
      return d;
    });

    // Convert dates to Firestore Timestamps or ISO strings
    const formattedDates = validDates.map(d => d.toISOString());

    const exerciseIds = exercises.map(ex => ex.id);
    const exerciseNames = exercises.map(ex => ex.name);

    const sessionData = {
      user_id: userId,
      session_id: sessionId,
      session_name: sessionName.replace('Day_', '').replace('_', ' ').toLowerCase(),
      exercise_id: exerciseIds,
      exercise_name: exerciseNames,
      workout_plan_id: `plan_${userId}`,
      day_of_week: dayOfWeek,
      dates: formattedDates,
      createdAt: new Date().toISOString()  // Use ISO string for consistency
    };

    const existingQuery = query(
      workoutSessionsCollection,
      where('user_id', '==', userId),
      where('session_id', '==', sessionId)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      const docRef = existingSnapshot.docs[0].ref;
      await updateDoc(docRef, sessionData);
      console.log(`📝 Updated existing session "${sessionName}" for user ${userId}`);
    } else {
      await addDoc(workoutSessionsCollection, sessionData);
      console.log(`✅ Created session: ${sessionName} for user ${userId} on ${dayOfWeek}`);
    }
  } catch (error) {
    console.error('❌ Error creating/updating workout session:', error);
    throw error; // Re-throw to handle in calling function
  }
};



/**
 * Generates a personalized workout plan based on user preferences.
 *
 * @param {Object} userInput - The user's preferences.
 * @param {string} userInput.goal - Fitness goal (e.g., "muscle gain").
 * @param {string} userInput.level - Fitness level (e.g., "beginner").
 * @param {number} userInput.daysPerWeek - Days available to train (3, 4, or 5).
 * @param {string[]} userInput.equipment - Equipment user has access to.
 * @returns {Promise<{plan: Array, warnings: Array}>} - A workout plan and potential warnings.
 * @param {Date} startDate - The date the program starts
 * @param {string} targetWeekday - Weekday name, e.g. 'Monday'
 * @param {number} numberOfWeeks - How many weeks to generate dates for
 * @returns {Date[]} Array of Dates
 */


const getWeeklyDates = (startDate, targetWeekday, numberOfWeeks) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayIndex = daysOfWeek.indexOf(targetWeekday);

  if (targetDayIndex === -1) {
    throw new Error(`Invalid weekday: ${targetWeekday}`);
  }

  // Ensure startDate is valid
  const baseDate = new Date(startDate);
  if (isNaN(baseDate.getTime())) {
    throw new Error('Invalid start date');
  }

  // Reset time portion
  baseDate.setHours(0, 0, 0, 0);

  // Find the first occurrence of the target weekday on or after startDate
  const startDayIndex = baseDate.getDay();
  const daysUntilTarget = (targetDayIndex + 7 - startDayIndex) % 7;
  baseDate.setDate(baseDate.getDate() + daysUntilTarget);

  // Generate dates for each week
  const dates = [];
  for (let i = 0; i < numberOfWeeks; i++) {
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + i * 7);
    dates.push(nextDate);
  }
  return dates;
};
const generatePlanName = (goal, level, durationWeeks) => {
  const months = Math.round(durationWeeks / 4);
  const goalCapitalized = goal.charAt(0).toUpperCase() + goal.slice(1);
  return `${months} Month ${goalCapitalized} Program`;
};

export const generateWorkoutPlan = async (startDate = new Date()) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated.');
  }

  // Validate startDate
  if (isNaN(new Date(startDate).getTime())) {
    startDate = new Date(); // Fallback to current date if invalid
  }

  const userId = currentUser.uid;
  console.log('Plan ID:', `plan_${userId}`);

  const userInput = await getUserDetailsFromUserDetailsCollection(userId);
  if (!userInput) {
    throw new Error('User preferences not found in Firestore.');
  }

  const { goal, level, daysPerWeek, equipment } = userInput;

  const goalCategoryMap = {
    'weight loss': ['cardio', 'plyometrics'],
    'muscle gain': ['strength', 'powerlifting', 'strongman'],
    'flexibility': ['stretching'],
    'endurance': ['cardio', 'plyometrics'],
    'strength': ['strength', 'olympic weightlifting', 'powerlifting'],
  };

  const goalParameters = {
    'muscle gain': { sets: 3, reps: [8, 12], rest: '60-90s' },
    'strength': { sets: 4, reps: [4, 6], rest: '2-3 min' },
    'weight loss': { sets: 3, reps: [12, 15], rest: '30-60s' },
    'flexibility': { sets: 'N/A', reps: '10-20s hold', rest: 'N/A' },
    'endurance': { sets: 3, reps: [15, 20], rest: '30s' },
  };

  // New: Weekday mappings for each daysPerWeek option
  const weekdayMapping = {
    3: ['Monday', 'Wednesday', 'Friday'],
    4: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    5: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  };
  const durationMap = {
      'muscle gain': { beginner: 8, intermediate: 12, expert: 16 },
      'weight loss': { beginner: 4, intermediate: 8, expert: 12 },
      'strength': { beginner: 8, intermediate: 12, expert: 16 },
      'flexibility': { beginner: 4, intermediate: 6, expert: 8 },
      'endurance': { beginner: 4, intermediate: 8, expert: 12 },
    };
    const planDurationWeeks = durationMap[goal.toLowerCase()]?.[level.toLowerCase()] || 4; // Default to 4 weeks if no match
  try {
    const allExercises = await getAllExercises();
    const targetCategories = goalCategoryMap[goal.toLowerCase()] || [];
    const normalizedEquipment = equipment.map(e => e.toLowerCase());

    // Define level priority based on user's selected level
    const levelPriority = {
      beginner: ['beginner'],
      intermediate: ['intermediate', 'beginner'],
      expert: ['expert', 'intermediate', 'beginner']
    };

    const filteredExercises = allExercises.filter(ex =>
      levelPriority[level.toLowerCase()]?.includes(ex.level?.toLowerCase()) &&
      (
        ex.equipment?.toLowerCase() === 'body only' ||
        ex.equipment?.toLowerCase() === 'none' ||
        normalizedEquipment.includes(ex.equipment?.toLowerCase())
      ) &&
      targetCategories.includes(ex.category?.toLowerCase())
    );


    // Sort exercises to prioritize the user's selected level first
    const userLevel = level.toLowerCase();
    filteredExercises.sort((a, b) => {
      if (a.level?.toLowerCase() === userLevel && b.level?.toLowerCase() !== userLevel) return -1;
      if (a.level?.toLowerCase() !== userLevel && b.level?.toLowerCase() === userLevel) return 1;
      return 0;
    });

    if (filteredExercises.length === 0) {
      throw new Error('No exercises found matching your filters. Try different equipment or goal.');
    }

    console.log(`Filtered ${filteredExercises.length} exercises for goal "${goal}", level "${level}", and equipment: ${equipment.join(', ')}`);

    let split;
    if (daysPerWeek === 3) {
      split = {
        Day_1_push: ['chest', 'shoulders', 'triceps'],
        Day_2_pull: ['lats', 'lower back', 'middle back', 'traps', 'biceps'],
        Day_3_legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
      };
    } else if (daysPerWeek === 4) {
      split = {
        Day_1_upper: ['chest', 'lats', 'lower back', 'middle back', 'traps', 'shoulders', 'biceps', 'triceps'],
        Day_2_lower: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        Day_3_push: ['chest', 'shoulders', 'triceps'],
        Day_4_pull: ['lats', 'lower back', 'middle back', 'traps', 'biceps'],
      };
    } else if (daysPerWeek === 5) {
      split = {
        Day_1_chest_triceps: ['chest', 'triceps'],
        Day_2_back_biceps: ['lats', 'lower back', 'middle back', 'traps', 'biceps'],
        Day_3_legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        Day_4_shoulders: ['shoulders'],
        Day_5_core: ['abdominals', 'obliques'],
      };
    } else {
      throw new Error(`Unsupported training days: ${daysPerWeek}`);
    }

    const maxExercisesPerDay = 6;
    const warnings = [];

    const assignedWeekdays = weekdayMapping[daysPerWeek] || [];
    const planName = generatePlanName(goal, level, planDurationWeeks);

    const workoutPlan = await Promise.all(Object.entries(split)
      .slice(0, daysPerWeek)
      .map(async ([dayKey, muscleGroup], index) => {
        const muscleToExercisesMap = {};
        muscleGroup.forEach(muscle => {
          // First get all exercises that have this as primary muscle
          const primaryExercises = filteredExercises.filter(ex =>
            ex.primaryMuscles?.includes(muscle)
          );
          
          // Then get exercises that have this as secondary muscle
          const secondaryExercises = filteredExercises.filter(ex =>
            ex.secondaryMuscles?.includes(muscle) && 
            !primaryExercises.some(pe => pe.id === ex.id) // Don't include duplicates
          );
          
          // Combine with primary exercises first
          muscleToExercisesMap[muscle] = [...primaryExercises, ...secondaryExercises];
        });



        const selectedExercises = [];
        const perMuscleTarget = Math.ceil(maxExercisesPerDay / muscleGroup.length);


        const usedExerciseIds = new Set();

        muscleGroup.forEach(muscle => {
        const allMuscleExercises = muscleToExercisesMap[muscle] || [];
        
        const availableExercises = allMuscleExercises.filter(
          ex => !usedExerciseIds.has(ex.id)
        );
        if (availableExercises.length === 0) return; // Skip if no available exercises

        
        
        // Separate primary and secondary exercises
        const primaryExercises = availableExercises.filter(ex => 
          ex.primaryMuscles?.includes(muscle)
        );
        const secondaryExercises = availableExercises.filter(ex => 
          ex.secondaryMuscles?.includes(muscle) && 
          !primaryExercises.some(pe => pe.id === ex.id)
        );

        const exercisesToTake = Math.min(
          perMuscleTarget,
          primaryExercises.length + secondaryExercises.length
        );

        if (exercisesToTake <= 0) return;

        const shuffledPrimary = [...primaryExercises].sort(() => 0.5 - Math.random());
        const takenPrimary = shuffledPrimary.slice(0, exercisesToTake);

        const remaining = exercisesToTake - takenPrimary.length;
        const takenSecondary = remaining > 0 
        ? [...secondaryExercises]
          .sort(() => 0.5 - Math.random())
          .slice(0, remaining)
        : [];
        
        // Combine and add to selected exercises
        const newExercises = [...takenPrimary, ...takenSecondary];
        selectedExercises.push(...newExercises);

        // Mark these exercises as used
        newExercises.forEach(ex => usedExerciseIds.add(ex.id));



        
      });



        const finalExercises = selectedExercises
          .sort(() => 0.5 - Math.random())
          .slice(0, maxExercisesPerDay);

        if (finalExercises.length === 0) {
          warnings.push(`⚠️ No exercises found for ${dayKey.replace('_', ' ')}. Try adding more equipment or changing your fitness goal.`);
        } else if (finalExercises.length < 3) {
          warnings.push(`⚠️ Very few exercises for ${dayKey.replace('_', ' ')}. Consider adjusting equipment, fitness level, or training days.`);
        }

        const { sets, reps, rest } = goalParameters[goal.toLowerCase()] || {};

        // Get assigned weekday for this day index
        const dayOfWeek = assignedWeekdays[index] || 'Day';

        
        // Calculate all session dates for this day
        const dates = getWeeklyDates(startDate, dayOfWeek, planDurationWeeks);

        await createWorkoutSession(
          userId,
          dayKey,
          finalExercises,
          dayOfWeek,
          dates
        );

        

        return {
          day: `${dayKey.replace('_', ' ').toUpperCase()}`, // Add weekday in display string
          session_id: dayKey.toLowerCase().replace('day_', '').replace('_', ''),
          muscleFocus: muscleGroup.join(' & '),
          dayOfWeek, // add weekday property here too
          exercises: finalExercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            sets,
            reps: Array.isArray(reps) ? reps.join(' - ') : reps,
            restTime: rest,
            instructions: ex.instructions || 'Follow correct form.',
            muscles: ex.primaryMuscles || ['muscles not defined'],
          })),
        };
      })
    );

    const totalExercises = workoutPlan.reduce((sum, day) => sum + day.exercises.length, 0);
    if (totalExercises < daysPerWeek * 3) {
      warnings.push(`⚠️ Your plan has only ${totalExercises} exercises in total. Try increasing your equipment, training days, or selecting a higher fitness level.`);
    }
    // Determine duration in weeks
    

    

    return { 
    plan: workoutPlan, 
    warnings, 
    durationWeeks: planDurationWeeks,
    planName,
  };

  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw error;
  }
};




