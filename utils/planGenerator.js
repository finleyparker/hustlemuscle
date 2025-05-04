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

    const workoutPlan = Object.entries(split)
      .slice(0, daysPerWeek)
      .map(([dayKey, muscleGroup]) => {

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

        const { sets, reps, rest } = goalParameters[goal.toLowerCase()] || {};

        // Add exercise_id and exercise_name arrays
        const exerciseIds = finalExercises.map(ex => ex.id);
        const exerciseNames = finalExercises.map(ex => ex.name);

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
          exercise_id: exerciseIds,
          exercise_name: exerciseNames,
          exercises: dayExercises,
        };
      });

    return workoutPlan;
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
    daysPerWeek: 4,
    equipment: ['dumbbell', 'body only'],
  };

  const plan = await generateWorkoutPlan(userInput);
  console.log('Generated Plan Preview:', plan);
};

if (require.main === module) {
  testGeneratePlan();
}
