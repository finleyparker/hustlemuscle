import { getAllExercises } from '../api/exercises';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
// Function to create workout session in Firestore
const createWorkoutSession = async (userId, sessionName, exercises, dayOfWeek, dates) => {
  try {
    const workoutSessionsCollection = collection(firestore, 'workout_sessions');
    
    const exerciseIds = exercises.map(ex => ex.id); 
    const exerciseNames = exercises.map(ex => ex.name);

    const newSession = {
      user_id: userId,
      session_id: sessionName.toLowerCase().replace('day_', '').replace('_', ''),
      session_name: sessionName.replace('Day_', '').replace('_', ' ').toLowerCase(),
      exercise_id: exerciseIds, 
      exercise_name: exerciseNames,
      workout_plan_id: `plan_${userId}`,
      day_of_week: dayOfWeek,
      dates: dates || [],   
      createdAt: new Date()
    };

    await addDoc(workoutSessionsCollection, newSession);
    console.log(`Created session: ${sessionName} for user ${userId} on ${dayOfWeek} with ${dates.length} dates`);
  } catch (error) {
    console.error('Error creating workout session:', error);
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

  // Clone startDate without time part
  const date = new Date(startDate);
  date.setHours(0, 0, 0, 0);

  // Find the first occurrence of the target weekday on or after startDate
  const startDayIndex = date.getDay();
  const daysUntilTarget = (targetDayIndex + 7 - startDayIndex) % 7;
  date.setDate(date.getDate() + daysUntilTarget);

  // Generate dates for each week
  const dates = [];
  for (let i = 0; i < numberOfWeeks; i++) {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + i * 7);
    dates.push(nextDate);
  }
  return dates;
};

export const generateWorkoutPlan = async (userInput, userId, startDate = new Date()) => {
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
      'muscle gain': { beginner: 8, intermediate: 12, advanced: 16 },
      'weight loss': { beginner: 4, intermediate: 8, advanced: 12 },
      'strength': { beginner: 8, intermediate: 12, advanced: 16 },
      'flexibility': { beginner: 4, intermediate: 6, advanced: 8 },
      'endurance': { beginner: 4, intermediate: 8, advanced: 12 },
    };
    const planDurationWeeks = durationMap[goal.toLowerCase()]?.[level.toLowerCase()] || 4; // Default to 4 weeks if no match
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

    const assignedWeekdays = weekdayMapping[daysPerWeek] || [];

    const workoutPlan = await Promise.all(Object.entries(split)
      .slice(0, daysPerWeek)
      .map(async ([dayKey, muscleGroup], index) => {
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
          day: `${dayKey.replace('_', ' ').toUpperCase()} (${dayOfWeek})`, // Add weekday in display string
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
      durationWeeks: planDurationWeeks 
    };

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
    equipment: ['body only', 'cable', 'machine', ],
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