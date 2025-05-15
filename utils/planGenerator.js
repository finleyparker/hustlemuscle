import { getAllExercises } from '../api/exercises';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../database/firebase';
// Function to create workout session in Firestore
const createWorkoutSession = async (userId, sessionName, exercises) => {
  try {
    const workoutSessionsCollection = collection(db, 'workout_sessions');

    // Use original exercise IDs from API
    const exerciseIds = exercises.map(ex => ex.id);
    const exerciseNames = exercises.map(ex => ex.name);

    const newSession = {
      user_id: userId,
      session_id: sessionName.toLowerCase().replace('day_', '').replace('_', ''),
      session_name: sessionName.replace('Day_', '').replace('_', ' ').toLowerCase(),
      exercise_id: exerciseIds,
      exercise_name: exerciseNames,
      workout_plan_id: `plan_${userId}`,
      createdAt: new Date()
    };

    await addDoc(workoutSessionsCollection, newSession);
    console.log(`Created session: ${sessionName} for user ${userId}`);
  } catch (error) {
    console.error('Error creating workout session:', error);
  }
};

export const userInput = {
  goal: 'muscle gain',
  level: 'beginner',
  daysPerWeek: 3,
  equipment: ['body only', 'cable', 'machine',],
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
 */
export const generateWorkoutPlan = async (userInput, userId) => {
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

  try {
    const allExercises = await getAllExercises();
    const targetCategories = goalCategoryMap[goal.toLowerCase()] || [];
    const normalizedEquipment = equipment.map(e => e.toLowerCase());

    const filteredExercises = allExercises.filter(ex =>
      ex.level?.toLowerCase() === level.toLowerCase() &&
      (
        ex.equipment?.toLowerCase() === 'body only' ||
        ex.equipment?.toLowerCase() === 'none' ||
        normalizedEquipment.includes(ex.equipment?.toLowerCase())
      ) &&
      targetCategories.includes(ex.category?.toLowerCase())
    );

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

    const workoutPlan = await Promise.all(Object.entries(split)
      .slice(0, daysPerWeek)
      .map(async ([dayKey, muscleGroup]) => {
        const muscleToExercisesMap = {};
        muscleGroup.forEach(muscle => {
          muscleToExercisesMap[muscle] = filteredExercises.filter(ex =>
            ex.primaryMuscles?.includes(muscle)
          );
        });

        const selectedExercises = [];
        const perMuscleTarget = Math.ceil(maxExercisesPerDay / muscleGroup.length);

        muscleGroup.forEach(muscle => {
          const muscleExercises = muscleToExercisesMap[muscle] || [];
          const shuffled = muscleExercises.sort(() => 0.5 - Math.random());
          selectedExercises.push(...shuffled.slice(0, perMuscleTarget));
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

        // Create a workout session for the user for each day
        await createWorkoutSession(
          userId,
          dayKey, // e.g. "Day_1_push"
          finalExercises
        );

        return {
          day: dayKey.replace('_', ' ').toUpperCase(),
          session_id: dayKey.toLowerCase().replace('day_', '').replace('_', ''),
          muscleFocus: muscleGroup.join(' & '),
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

    // If too few total exercises
    const totalExercises = workoutPlan.reduce((sum, day) => sum + day.exercises.length, 0);
    if (totalExercises < daysPerWeek * 3) {
      warnings.push(`⚠️ Your plan has only ${totalExercises} exercises in total. Try increasing your equipment, training days, or selecting a higher fitness level.`);
    }

    return { plan: workoutPlan, warnings };
  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw error;
  }
};



// Test runner
const testGeneratePlan = async () => {
  const userInput = {
    goal: 'muscle gain',
    level: 'beginner',
    daysPerWeek: 3,
    equipment: ['body only', 'cable', 'machine',],
  };

  const { plan, warnings } = await generateWorkoutPlan(userInput);
  console.log('Generated Plan Preview:', plan);
  if (warnings.length) {
    console.log('Warnings:');
    warnings.forEach(w => console.warn(w));
  }
};

if (require.main === module) {
  testGeneratePlan();
}