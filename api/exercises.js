import axios from 'axios';

// Temporarily hardcode the API key for testing
const API_KEY = "Nd9CE7dRGMkA1sKpPwYqIQ==nTlHhZdcbNQy5vCf"; // Replace this with your actual API key
const BASE_URL = 'https://api.api-ninjas.com/v1/exercises';

// Create axios instance with timeout and other configurations
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'X-Api-Key': API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept all status codes less than 500
  }
});

// Get all exercises
export const getAllExercises = async () => {
  console.log('Starting API request...');
  
  try {
    // Simple GET request with API key in URL
    const url = `${BASE_URL}?X-Api-Key=${API_KEY}`;
    console.log('Request URL:', url);
    
    const response = await axios.get(url);
    console.log('Response received:', response.status);
    
    return response.data;
  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Get exercises by name
export const getExercisesByName = async (name) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: { name },
      headers: {
        'X-Api-Key': API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting exercises by name:', error);
    throw error;
  }
};

// Get exercises by muscle group
export const getExercisesByMuscle = async (muscle) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: { muscle },
      headers: {
        'X-Api-Key': API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting exercises by muscle:', error);
    throw error;
  }
};

// Get exercises by type
export const getExercisesByType = async (type) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: { type },
      headers: {
        'X-Api-Key': API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting exercises by type:', error);
    throw error;
  }
};

// Get exercises by difficulty
export const getExercisesByDifficulty = async (difficulty) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: { difficulty },
      headers: {
        'X-Api-Key': API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting exercises by difficulty:', error);
    throw error;
  }
}; 