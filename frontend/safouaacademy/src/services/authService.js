import axios from 'axios';
const API_URL = 'http://localhost:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});
api.interceptors.request.use(request => {
  return request;
});

export const registerUser = async (userData) => {
  try {
    const { confirmMdp, acceptTerms, ...userDataToSend } = userData;
    
    console.log(' Données envoyées:', {
      ...userDataToSend,
      mdp: '***'
    });
    
    const response = await api.post('/users/register', userDataToSend);
    return {
      token: response.data.token,
      data: response.data.user || response.data.data
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message ||
                        'Erreur lors de l\'inscription';
    
    throw new Error(errorMessage);
  }
};

export const loginUser = async (userData) => {
  try {    
    const response = await api.post('/users/login', {
      email: userData.email,
      mdp: userData.mdp
    });
    return {
      token: response.data.token,
      data: response.data.user || response.data.data
    };
  } catch (error) {    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        'Email ou mot de passe incorrect';
    
    throw new Error(errorMessage);
  }
};
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/');
    return true;
  } catch (error) {
    return false;
  }
};