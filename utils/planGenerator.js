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

    if (filteredExercises.length === 0) {
      throw new Error('No exercises found matching your filters. Try different equipment or goal.');
    }
    
    console.log(`Filtered ${filteredExercises.length} exercises for goal "${goal}", level "${level}", and equipment: ${equipment.join(', ')}`);

    // Step 5: Define workout split based on training days
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

    // Step 6: Introduce exercise limit per day (e.g., 6 exercises max per day)
    const maxExercisesPerDay = 6;

    // Step 7: Assign exercises to each training day
    const workoutPlan = Object.entries(split)
    .slice(0, daysPerWeek) // limit to the number of training days
    .map(([dayKey, muscleGroup]) => {

      // Group filtered exercises by muscle
      const muscleToExercisesMap = {};
      muscleGroup.forEach(muscle => {
        muscleToExercisesMap[muscle] = filteredExercises.filter(ex =>
          ex.primaryMuscles?.includes(muscle)
        );
      });

      // Pick evenly from each muscle group
      const selectedExercises = [];
      const perMuscleTarget = Math.ceil(maxExercisesPerDay / muscleGroup.length);

      muscleGroup.forEach(muscle => {
        const muscleExercises = muscleToExercisesMap[muscle] || [];
        const shuffled = muscleExercises.sort(() => 0.5 - Math.random());
        selectedExercises.push(...shuffled.slice(0, perMuscleTarget));
      });

      // Trim in case we went over
      const finalExercises = selectedExercises
        .sort(() => 0.5 - Math.random())
        .slice(0, maxExercisesPerDay);


      const { sets, reps, rest } = goalParameters[goal.toLowerCase()] || {};

      const dayExercises = finalExercises.map(ex => ({
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
    daysPerWeek: 3,
    equipment: ['dumbbell', 'body only'],
  };

  const plan = await generateWorkoutPlan(userInput);
  console.log('Generated Plan Preview:', plan);
};

// Only run test if this file is executed directly (not imported)
if (require.main === module) {
  testGeneratePlan();
}