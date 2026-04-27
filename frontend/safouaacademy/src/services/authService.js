import api from './api';

class AuthService {
  async register(userData) {
    try {
      const { confirmPassword, acceptTerms, password, ...rest } = userData;

      const registerData = {
        ...rest,
        mdp: password,
        role: userData.role || "etudiant"
      };

      const response = await api.post('/users/register', registerData);

      if (response.data?.token && response.data?.data) {
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
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Erreur lors de l'inscription",
        status: error.response?.status
      };
    }
  }

  async login(credentials) {
    try {
      const response = await api.post('/users/login', {
        email: credentials.email,
        mdp: credentials.password
      });

      if (response.data?.token && response.data?.data) {
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
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Email ou mot de passe incorrect",
        status: error.response?.status
      };
    }
  }

  setSession(sessionData) {
    if (sessionData.token) {
      localStorage.setItem('token', sessionData.token);
    }
    if (sessionData.user) {
      localStorage.setItem('user', JSON.stringify(sessionData.user));
      localStorage.setItem('role', sessionData.user.role);

      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const exists = users.some(u => u._id === sessionData.user._id || u.id === sessionData.user.id);
      if (!exists) {
        users.push(sessionData.user);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
      }
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('enrolledCourses');
    localStorage.removeItem('courses');
    localStorage.removeItem('offlineCourses');
    localStorage.removeItem('wishlist');
    localStorage.removeItem('registeredUsers');

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('lesson-progress-') || key.startsWith('notes-') || key.startsWith('bookmarks-'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getCurrentRole() {
    return localStorage.getItem('role');
  }

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