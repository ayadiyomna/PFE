import api from './api';

class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise<Object>}
   */
  async register(userData) {
    try {
      // Nettoyer les données (enlever confirmPassword, acceptTerms)
      const { confirmPassword, acceptTerms, ...userDataToSend } = userData;
      
      // Mapper les champs pour correspondre au backend
      const registerData = {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        mdp: userData.password,
        role: userData.role || "etudiant"
      };

      const response = await api.post('/users/register', registerData);
      
      // Vérifier la structure de la réponse
      if (response.data && response.data.token) {
        this.setSession({
          token: response.data.token,
          user: response.data.data
        });
      } else if (response.data && response.data.success && response.data.data) {
        this.setSession({
          token: response.data.token,
          user: response.data.data
        });
      }
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Inscription réussie !'
      };
    } catch (error) {
      console.error('Erreur register:', error);
      
      // Récupérer le message d'erreur du backend
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de l'inscription";
      
      return {
        success: false,
        message: errorMessage,
        status: error.response?.status
      };
    }
  }

  /**
   * Connexion utilisateur
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>}
   */
  async login(credentials) {
    try {
      const response = await api.post('/users/login', {
        email: credentials.email,
        mdp: credentials.password
      });
      
      // Vérifier la structure de la réponse
      if (response.data && response.data.token) {
        this.setSession({
          token: response.data.token,
          user: response.data.data
        });
      } else if (response.data && response.data.success && response.data.data) {
        this.setSession({
          token: response.data.token,
          user: response.data.data
        });
      }
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Connexion réussie !'
      };
    } catch (error) {
      console.error('Erreur login:', error);
      
      // Récupérer le message d'erreur du backend
      const errorMessage = error.response?.data?.message || error.message || "Email ou mot de passe incorrect";
      
      return {
        success: false,
        message: errorMessage,
        status: error.response?.status
      };
    }
  }

  /**
   * Sauvegarder la session
   * @param {Object} sessionData 
   */
  setSession(sessionData) {
    if (sessionData.token) {
      localStorage.setItem('token', sessionData.token);
    }
    if (sessionData.user) {
      localStorage.setItem('user', JSON.stringify(sessionData.user));
      localStorage.setItem('role', sessionData.user.role);
      
      // Sauvegarder pour le mode hors-ligne
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const exists = users.some(u => u._id === sessionData.user._id || u.id === sessionData.user.id);
      if (!exists) {
        users.push(sessionData.user);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
      }
    }
  }

  /**
   * Déconnexion
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }

  /**
   * Vérifier si l'utilisateur est connecté
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  /**
   * Récupérer l'utilisateur courant
   * @returns {Object|null}
   */
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Récupérer le rôle
   * @returns {string|null}
   */
  getCurrentRole() {
    return localStorage.getItem('role');
  }

  /**
   * Vérifier la santé du backend
   * @returns {Promise<boolean>}
   */
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data.status === 'ok' || response.data.success === true;
    } catch {
      return false;
    }
  }
}

export default new AuthService();