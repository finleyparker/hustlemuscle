import axios from 'axios';

// API key is hardcoded for demonstration purposes, but in production it should
// be handled using backend proxy
const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const EXERCISE_DB_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

// Get all exercises
export const getAllExercises = async () => {
  console.log('Starting API request...');

  try {
    const response = await axios.get(EXERCISE_DB_URL);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
};

// Get exercises by name
export const getExercisesByName = async (name) => {
  try {
    const response = await axios.get(BASE_URL);
    const allExercises = response.data;

    const filtered = allExercises.filter(exercise =>
      exercise.name.toLowerCase().includes(name.toLowerCase())
    );

    return filtered;
  } catch (error) {
    console.error('Error getting exercises by name:', error);
    throw error;
  }
};


// Get exercises by muscle group
export const getExercisesByMuscle = async (primaryMuscles = [], secondaryMuscles = []) => {
  try {
    const response = await axios.get(BASE_URL);
    const allExercises = response.data;

    const filtered = allExercises.filter(exercise => {
      const hasPrimary = primaryMuscles.some(muscle => exercise.primaryMuscles.includes(muscle));
      const hasSecondary = secondaryMuscles.some(muscle => exercise.secondaryMuscles?.includes(muscle));
      return hasPrimary || hasSecondary;
    });

    return filtered;
  } catch (error) {
    console.error('Error getting exercises by muscle:', error);
    throw error;
  }
};


// Get exercises by type
export const getExercisesByType = async (mechanic) => {
  try {
    const response = await axios.get(BASE_URL);
    const allExercises = response.data;

    const filtered = allExercises.filter(exercise =>
      exercise.mechanic?.toLowerCase() === mechanic.toLowerCase()
    );

    return filtered;
  } catch (error) {
    console.error('Error getting exercises by type:', error);
    throw error;
  }
};


// Get exercises by difficulty
export const getExercisesByDifficulty = async (level) => {
  try {
    const response = await axios.get(BASE_URL);
    const allExercises = response.data;

    const filtered = allExercises.filter(exercise =>
      exercise.level?.toLowerCase() === level.toLowerCase()
    );

    return filtered;
  } catch (error) {
    console.error('Error getting exercises by difficulty:', error);
    throw error;
  }
};