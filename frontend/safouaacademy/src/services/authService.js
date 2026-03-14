import api from './api';

class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise<Object>}
   */
  async register(userData) {
    try {
      // Nettoyer les données (enlever confirmMdp, acceptTerms)
      const { confirmMdp, acceptTerms, ...userDataToSend } = userData;
      
      // Mapper les champs pour correspondre au backend
      const registerData = {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        mdp: userData.password,
        role: userData.role
      };

      const response = await api.post('/users/register', registerData);
      
      if (response.data.token) {
        this.setSession(response.data);
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Inscription réussie !'
      };
    } catch (error) {
      console.error('Erreur register:', error);
      
      // Mode hors-ligne - Simulation
      if (error.isOffline) {
        return this.simulateRegister(userData);
      }
      
      return {
        success: false,
        message: error.message || "Erreur lors de l'inscription"
      };
    }
  }

  /**
   * Simulation d'inscription hors-ligne
   * @param {Object} userData 
   * @returns {Object}
   */
  simulateRegister(userData) {
    const mockUser = {
      id: Date.now(),
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      role: userData.role || 'etudiant',
      name: `${userData.prenom} ${userData.nom}`
    };
    
    const mockToken = 'mock-token-' + Date.now();
    
    this.setSession({
      token: mockToken,
      user: mockUser
    });
    
    return {
      success: true,
      data: {
        token: mockToken,
        user: mockUser
      },
      offline: true,
      message: 'Inscription réussie (mode hors-ligne)'
    };
  }

  /**
   * Connexion utilisateur
   * @param {Object} credentials - { email, mdp }
   * @returns {Promise<Object>}
   */
  async login(credentials) {
    try {
      const response = await api.post('/users/login', {
        email: credentials.email,
        mdp: credentials.password
      });
      
      if (response.data.token) {
        this.setSession(response.data);
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Connexion réussie !'
      };
    } catch (error) {
      console.error('Erreur login:', error);
      
      // Mode hors-ligne - Simulation
      if (error.isOffline) {
        return this.simulateLogin(credentials);
      }
      
      return {
        success: false,
        message: error.message || "Email ou mot de passe incorrect"
      };
    }
  }

  /**
   * Simulation de connexion hors-ligne
   * @param {Object} credentials 
   * @returns {Object}
   */
  simulateLogin(credentials) {
    // Vérifier si l'utilisateur existe dans localStorage
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    let user = users.find(u => u.email === credentials.email);
    
    if (!user) {
      // Créer un utilisateur par défaut
      user = {
        id: 1,
        nom: 'Utilisateur',
        prenom: 'Test',
        email: credentials.email,
        role: credentials.email.includes('admin') ? 'admin' : 
               credentials.email.includes('enseignant') ? 'enseignant' : 'etudiant',
        name: 'Utilisateur Test'
      };
    }
    
    const mockToken = 'mock-token-' + Date.now();
    
    this.setSession({
      token: mockToken,
      user: user
    });
    
    return {
      success: true,
      data: {
        token: mockToken,
        user: user
      },
      offline: true,
      message: 'Connexion réussie (mode hors-ligne)'
    };
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
      const exists = users.some(u => u.id === sessionData.user.id);
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
      return response.data.status === 'ok';
    } catch {
      return false;
    }
  }
}

export default new AuthService();