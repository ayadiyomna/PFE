// src/api.js
import axios from 'axios';

// Configuration
const API_BASE = 'http://localhost:5000/api';

// Instance axios
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Export a default request timeout constant for shared use
export const REQUEST_TIMEOUT_MS = 30000;

// Variable pour éviter les appels multiples à health check
let healthCheckPromise = null;

// Service de health check amélioré
export const checkBackendHealth = async (force = false) => {
  // Si un check est déjà en cours, retourner la même promesse
  if (healthCheckPromise && !force) {
    return healthCheckPromise;
  }

  healthCheckPromise = (async () => {
    try {
      const response = await api.get('/health', { 
        timeout: 3000,
        // Éviter la mise en cache
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('✅ Backend connecté:', response.data);
      return { 
        success: true, 
        data: response.data,
        connected: true 
      };
    } catch (error) {
      console.warn('⚠️ Backend non disponible:', error.message);
      
      // En mode développement, simuler une réponse
      if (window.location.hostname === 'localhost') {
        return { 
          success: false, 
          connected: false,
          mock: true,
          data: { 
            status: 'OK', 
            message: 'Mode développement - Backend simulé',
            mock: true 
          }
        };
      }
      
      return { 
        success: false, 
        connected: false,
        error: error.message 
      };
    } finally {
      // Réinitialiser après 2 secondes
      setTimeout(() => {
        healthCheckPromise = null;
      }, 2000);
    }
  })();

  return healthCheckPromise;
};

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log en développement
    if (window.location.hostname === 'localhost' && !config.url.includes('health')) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Éviter les boucles infinies
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Gestion spéciale pour health check
    if (originalRequest.url === '/health') {
      return Promise.reject(error);
    }
    
    // Gestion des erreurs réseau
    if (error.code === 'ERR_NETWORK') {
      console.warn('🌐 Backend non accessible');
      
      // Vérifier si c'est juste un problème de santé du backend
      const health = await checkBackendHealth();
      if (!health.connected) {
        return Promise.reject({ 
          ...error, 
          isOffline: true,
          message: 'Backend non accessible. Vérifiez que le serveur est démarré.'
        });
      }
    }
    
    // Gestion 401
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || error.message || 'Une erreur est survenue';
    
    return Promise.reject({
      ...error,
      message
    });
  }
);

// Hook personnalisé pour l'état du backend
export const useBackendStatus = () => {
  const [isConnected, setIsConnected] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    const result = await checkBackendHealth(true);
    setIsConnected(result.connected || result.mock);
    setChecking(false);
    return result;
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return { isConnected, checking, checkStatus };
};

// ===== SETTINGS API FUNCTIONS =====

export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getAdminSettings = async () => {
  try {
    const response = await api.get('/settings/admin');
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const updateSettings = async (settingsId, formData) => {
  try {
    const response = await api.put(`/settings/${settingsId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Error updating settings:', error);
    return {
      success: false,
      error: error.message || 'Error updating settings',
    };
  }
};

export const deleteLogo = async (settingsId) => {
  try {
    const response = await api.delete(`/settings/${settingsId}/logo`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Error deleting logo:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteFavicon = async (settingsId) => {
  try {
    const response = await api.delete(`/settings/${settingsId}/favicon`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Error deleting favicon:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default api;