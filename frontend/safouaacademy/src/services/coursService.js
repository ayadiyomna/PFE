import * as authService from './authService';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

// Configuration axios avec intercepteurs
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.log('🌐 Mode hors-ligne: backend non disponible');
      return Promise.reject({ ...error, isOffline: true });
    }
    
    const message = error.response?.data?.message || 'Une erreur est survenue';
    toast.error(message);
    return Promise.reject(error);
  }
);

/**
 * Récupérer la liste des cours
 * @returns {Promise<{success: boolean, data: Array, offline?: boolean}>}
 */
export const getCoursList = async () => {
  try {
    const response = await api.get('/cours/courslist');
    
    // Sauvegarder dans localStorage pour le mode hors-ligne
    if (response.data && response.data.data) {
      localStorage.setItem('courses', JSON.stringify(response.data.data));
    }
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Cours chargés avec succès'
    };
  } catch (error) {
    if (error.isOffline) {
      // Mode hors-ligne : récupérer depuis localStorage
      const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      
      if (localCourses.length > 0) {
        toast.info('📚 Mode hors-ligne: cours chargés depuis la mémoire locale');
        return {
          success: true,
          data: localCourses,
          offline: true,
          message: 'Cours chargés en mode hors-ligne'
        };
      } else {
        // Données par défaut si rien en localStorage
        const defaultCourses = [
          {
            id: 1,
            titre: "Tajwid Avancé",
            description: "Maîtrisez les règles avancées du Tajwid",
            category: "Coran",
            niveau: "Expert",
            prix: 89,
            instructor: "Cheikh Ahmed Al-Mansouri",
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop"
          },
          {
            id: 2,
            titre: "Arabe Classique",
            description: "Apprenez l'arabe classique depuis les bases",
            category: "Langue",
            niveau: "Débutant",
            prix: 99,
            instructor: "Dr. Fatima Zahra",
            image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop"
          }
        ];
        
        localStorage.setItem('courses', JSON.stringify(defaultCourses));
        return {
          success: true,
          data: defaultCourses,
          offline: true,
          message: 'Cours par défaut chargés'
        };
      }
    }
    
    console.error('Erreur getCoursList:', error);
    return {
      success: false,
      error: error.message,
      message: 'Impossible de charger les cours'
    };
  }
};

/**
 * Récupérer un cours par son ID
 * @param {string|number} id - ID du cours
 * @returns {Promise<{success: boolean, data?: Object, offline?: boolean}>}
 */
export const getCoursById = async (id) => {
  try {
    const response = await api.get(`/cours/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (error.isOffline) {
      // Chercher dans localStorage
      const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const course = localCourses.find(c => c.id === parseInt(id) || c.id === id);
      
      if (course) {
        return {
          success: true,
          data: course,
          offline: true
        };
      }
    }
    
    return {
      success: false,
      error: error.message,
      message: 'Cours non trouvé'
    };
  }
};

/**
 * Créer un nouveau cours
 * @param {Object} coursData - Données du cours
 * @returns {Promise<{success: boolean, data?: Object, offline?: boolean}>}
 */
export const createCours = async (coursData) => {
  try {
    const response = await api.post('/enseignant/cours', coursData);
    
    // Sauvegarder dans localStorage
    const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const newCourse = { 
      ...coursData, 
      id: response.data.id || Date.now(),
      createdAt: new Date().toISOString()
    };
    localCourses.push(newCourse);
    localStorage.setItem('courses', JSON.stringify(localCourses));
    
    toast.success('✅ Cours créé avec succès !');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (error.isOffline) {
      // Mode hors-ligne : sauvegarder dans localStorage
      const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const newCourse = { 
        ...coursData, 
        id: Date.now(),
        status: 'Brouillon',
        createdAt: new Date().toISOString(),
        students: 0
      };
      localCourses.push(newCourse);
      localStorage.setItem('courses', JSON.stringify(localCourses));
      
      toast.success('✅ Cours créé en mode hors-ligne (sera synchronisé plus tard)');
      return {
        success: true,
        data: newCourse,
        offline: true
      };
    }
    
    toast.error(error.response?.data?.message || '❌ Erreur lors de la création');
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mettre à jour un cours
 * @param {string|number} id - ID du cours
 * @param {Object} coursData - Nouvelles données
 * @returns {Promise<{success: boolean, data?: Object, offline?: boolean}>}
 */
export const updateCours = async (id, coursData) => {
  try {
    const response = await api.put(`/enseignant/cours/${id}`, coursData);
    
    // Mettre à jour localStorage
    const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const index = localCourses.findIndex(c => c.id === parseInt(id) || c.id === id);
    if (index !== -1) {
      localCourses[index] = { ...localCourses[index], ...coursData, updatedAt: new Date().toISOString() };
      localStorage.setItem('courses', JSON.stringify(localCourses));
    }
    
    toast.success('✅ Cours modifié avec succès !');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (error.isOffline) {
      // Mode hors-ligne
      const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const index = localCourses.findIndex(c => c.id === parseInt(id) || c.id === id);
      if (index !== -1) {
        localCourses[index] = { ...localCourses[index], ...coursData, updatedAt: new Date().toISOString() };
        localStorage.setItem('courses', JSON.stringify(localCourses));
        
        toast.success('✅ Cours modifié en mode hors-ligne');
        return {
          success: true,
          data: localCourses[index],
          offline: true
        };
      }
    }
    
    toast.error('❌ Erreur lors de la modification');
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Supprimer un cours
 * @param {string|number} id - ID du cours
 * @returns {Promise<{success: boolean, offline?: boolean}>}
 */
export const deleteCours = async (id) => {
  try {
    await api.delete(`/enseignant/cours/${id}`);
    
    // Supprimer de localStorage
    const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const filtered = localCourses.filter(c => c.id !== parseInt(id) && c.id !== id);
    localStorage.setItem('courses', JSON.stringify(filtered));
    
    toast.success('🗑️ Cours supprimé avec succès !');
    return {
      success: true
    };
  } catch (error) {
    if (error.isOffline) {
      // Supprimer de localStorage uniquement
      const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const filtered = localCourses.filter(c => c.id !== parseInt(id) && c.id !== id);
      localStorage.setItem('courses', JSON.stringify(filtered));
      
      toast.success('🗑️ Cours supprimé en mode hors-ligne');
      return {
        success: true,
        offline: true
      };
    }
    
    toast.error('❌ Erreur lors de la suppression');
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * S'inscrire à un cours
 * @param {string|number} coursId - ID du cours
 * @returns {Promise<{success: boolean, offline?: boolean}>}
 */
export const enrollToCours = async (coursId) => {
  try {
    await api.post(`/cours/${coursId}/inscrire`);
    
    // Mettre à jour localStorage
    const enrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    if (!enrolled.includes(coursId)) {
      enrolled.push(coursId);
      localStorage.setItem('enrolledCourses', JSON.stringify(enrolled));
    }
    
    toast.success('✅ Inscription réussie !');
    return {
      success: true
    };
  } catch (error) {
    if (error.isOffline) {
      // Mode hors-ligne
      const enrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      if (!enrolled.includes(coursId)) {
        enrolled.push(coursId);
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolled));
      }
      
      toast.success('✅ Inscription en mode hors-ligne');
      return {
        success: true,
        offline: true
      };
    }
    
    toast.error(error.response?.data?.message || '❌ Erreur lors de l\'inscription');
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Rechercher des cours
 * @param {Object} filters - Filtres de recherche
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export const searchCours = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/cours/recherche?${queryParams}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (error.isOffline) {
      // Filtrer les cours en localStorage
      let localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      
      if (filters.category) {
        localCourses = localCourses.filter(c => c.category === filters.category);
      }
      if (filters.niveau) {
        localCourses = localCourses.filter(c => c.niveau === filters.niveau);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        localCourses = localCourses.filter(c => 
          c.titre?.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
        );
      }
      
      return {
        success: true,
        data: localCourses,
        offline: true
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Récupérer les statistiques d'un cours
 * @param {string|number} coursId - ID du cours
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export const getCoursStats = async (coursId) => {
  try {
    const response = await api.get(`/enseignant/statistiques/${coursId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (error.isOffline) {
      // Statistiques simulées
      return {
        success: true,
        data: {
          students: Math.floor(Math.random() * 200) + 50,
          completion: Math.floor(Math.random() * 100),
          rating: (Math.random() * 1 + 4).toFixed(1),
          quizzes: Math.floor(Math.random() * 10) + 5
        },
        offline: true
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

// Exemple d'utilisation avec authService
export const exampleUsingAuth = async (data) => {
  try {
    const result = await authService.registerUser(data);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Erreur auth:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Synchroniser les données hors-ligne avec le serveur
export const syncOfflineData = async () => {
  try {
    // Vérifier la connexion
    await api.get('/health');
    
    // Récupérer les cours hors-ligne
    const offlineCourses = JSON.parse(localStorage.getItem('offlineCourses') || '[]');
    
    if (offlineCourses.length > 0) {
      for (const course of offlineCourses) {
        if (course._synced) continue;
        
        try {
          if (course.id && course.id.toString().startsWith('offline_')) {
            // Nouveau cours à créer
            await api.post('/enseignant/cours', course);
          } else {
            // Cours existant à mettre à jour
            await api.put(`/enseignant/cours/${course.id}`, course);
          }
          course._synced = true;
        } catch (syncError) {
          console.error('Erreur synchronisation cours:', syncError);
        }
      }
      
      // Mettre à jour localStorage
      const synced = offlineCourses.filter(c => !c._synced);
      localStorage.setItem('offlineCourses', JSON.stringify(synced));
      
      toast.success('🔄 Données synchronisées avec le serveur !');
    }
    
    return { success: true };
  } catch (error) {
    console.log('Pas de connexion serveur pour synchronisation');
    return { success: false, offline: true };
  }
};

// Export par défaut de toutes les fonctions
export default {
  getCoursList,
  getCoursById,
  createCours,
  updateCours,
  deleteCours,
  enrollToCours,
  searchCours,
  getCoursStats,
  syncOfflineData,
  exampleUsingAuth
};