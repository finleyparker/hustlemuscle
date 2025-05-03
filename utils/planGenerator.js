import { getAllExercises } from '../api/exercises';

/**
 * Generates a personalized workout plan based on user preferences.
 *
 * @param {Object} userInput - The user's preferences.
 * @param {string} userInput.goal - Fitness goal (e.g., "muscle gain").
 * @param {string} userInput.level - Fitness level (e.g., "beginner").
 * @param {number} userInput.daysPerWeek - Days available to train (3, 4, or 5).
 * @param {string[]} userInput.equipment - Equipment user has access to.
 * @returns {Promise<Array>} - An array of structured workout plan days.
 */
export const generateWorkoutPlan = async (userInput) => {
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
    // Step 1: Fetch all exercises
    const allExercises = await getAllExercises();

    // Step 2: Determine matching categories for the user's goal
    const targetCategories = goalCategoryMap[goal.toLowerCase()] || [];

    // Step 3: Normalize equipment list for comparison
    const normalizedEquipment = equipment.map(e => e.toLowerCase());

    // Step 4: Filter exercises by level, equipment, and category
    const filteredExercises = allExercises.filter(ex =>
      ex.level?.toLowerCase() === level.toLowerCase() &&
      (
        ex.equipment?.toLowerCase() === 'body only' ||
        ex.equipment?.toLowerCase() === 'none' ||
        normalizedEquipment.includes(ex.equipment?.toLowerCase())
      ) &&
      targetCategories.includes(ex.category?.toLowerCase())
    );

    console.log(`Filtered ${filteredExercises.length} exercises for goal "${goal}", level "${level}", and equipment: ${equipment.join(', ')}`);

    // Step 5: Define workout split based on training days
    let split;
    if (daysPerWeek === 3) {
      split = {
        push: ['chest', 'shoulders', 'triceps'],
        pull: ['back', 'biceps'],
        legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
      };
    } else if (daysPerWeek === 4) {
      split = {
        upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
        lower: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        push: ['chest', 'shoulders', 'triceps'],
        pull: ['back', 'biceps'],
      };
    } else if (daysPerWeek === 5) {
      split = {
        chest_triceps: ['chest', 'triceps'],
        back_biceps: ['back', 'biceps'],
        legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        shoulders: ['shoulders'],
        core: ['abdominals', 'obliques'],
      };
    } else {
      throw new Error(`Unsupported training days: ${daysPerWeek}`);
    }

    // Step 6: Introduce exercise limit per day (e.g., 6 exercises max per day)
    const maxExercisesPerDay = 6;

    // Step 7: Assign exercises to each training day
    const workoutPlan = Object.entries(split).map(([dayKey, muscleGroup]) => {
      const exercisesForDay = filteredExercises.filter(ex =>
        muscleGroup.some(muscle => ex.primaryMuscles?.includes(muscle))
      );

      // Randomly pick exercises if there are more than maxExercisesPerDay
      const selectedExercises = exercisesForDay.length > maxExercisesPerDay 
        ? exercisesForDay.sort(() => 0.5 - Math.random()).slice(0, maxExercisesPerDay)
        : exercisesForDay;

      const { sets, reps, rest } = goalParameters[goal.toLowerCase()] || {};

      const dayExercises = selectedExercises.map(ex => ({
        name: ex.name,
        sets,
        reps: Array.isArray(reps) ? reps.join(' - ') : reps,
        restTime: rest,
        instructions: ex.instructions || 'Follow correct form.',
        muscles: ex.primaryMuscles || ['muscles not defined'],
      }));

      return {
        day: dayKey.replace('_', ' ').toUpperCase(),
        muscleFocus: muscleGroup.join(' & '),
        exercises: dayExercises,
      };
    });

    return workoutPlan;
  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw error;
  }
};

/**
 * Test runner to simulate usage when run directly via Node.
 */
const testGeneratePlan = async () => {
  const userInput = {
    goal: 'muscle gain',
    level: 'beginner',
    daysPerWeek: 4,
    equipment: ['dumbbell', 'body only'],
  };

  const plan = await generateWorkoutPlan(userInput);
  console.log('Generated Plan Preview:', plan);
};

// Only run test if this file is executed directly (not imported)
if (require.main === module) {
  testGeneratePlan();
}
