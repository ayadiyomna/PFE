// services/authService.js
import axios from 'axios';

// Ne pas utiliser process.env directement, définir une valeur par défaut
const API_URL = 'http://localhost:5000/api'; // URL fixe pour le développement

// Ou si vous voulez vraiment utiliser des variables d'environnement React :
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🌐 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Intercepteur pour logger
api.interceptors.request.use(request => {
  console.log('🚀 Requête:', request.method.toUpperCase(), request.url);
  return request;
});

export const registerUser = async (userData) => {
  try {
    console.log('📝 Tentative d\'inscription...');
    
    // Préparer les données (supprimer confirmMdp)
    const { confirmMdp, acceptTerms, ...userDataToSend } = userData;
    
    console.log('📦 Données envoyées:', {
      ...userDataToSend,
      mdp: '***' // Cacher le mot de passe dans les logs
    });
    
    const response = await api.post('/users/register', userDataToSend);
    
    console.log('✅ Inscription réussie:', response.data);
    
    // Adapter selon la structure de réponse de votre backend
    return {
      token: response.data.token,
      data: response.data.user || response.data.data
    };
  } catch (error) {
    console.error('❌ Erreur inscription:', error.response?.data || error.message);
    
    // Extraire le message d'erreur
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message ||
                        'Erreur lors de l\'inscription';
    
    throw new Error(errorMessage);
  }
};

export const loginUser = async (userData) => {
  try {
    console.log('🔐 Tentative de connexion...');
    
    const response = await api.post('/users/login', {
      email: userData.email,
      mdp: userData.mdp
    });
    
    console.log('✅ Connexion réussie:', response.data);
    
    return {
      token: response.data.token,
      data: response.data.user || response.data.data
    };
  } catch (error) {
    console.error('❌ Erreur connexion:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        'Email ou mot de passe incorrect';
    
    throw new Error(errorMessage);
  }
};

// Vérifier si le backend est accessible
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/');
    console.log('✅ Backend accessible:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend inaccessible:', error.message);
    return false;
  }
};