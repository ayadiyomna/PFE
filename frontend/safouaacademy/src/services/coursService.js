
import * as authService from './authService'; 
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/cours';

export const getCoursList = async () => {
  try {
    const response = await axios.get(`${API_URL}/courslist`);
    return response.data;
  } catch (error) {
    console.error('Erreur chargement cours:', error.response?.data || error.message);
    throw error;
  }
};
export const exampleUsingAuth = async (data) => {
  try {
    const result = await authService.registerUser(data);
    return result;
  } catch (error) {
    throw error;
  }
};