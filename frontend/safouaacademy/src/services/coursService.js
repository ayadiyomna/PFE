import api from './api';

class CoursService {
  /**
   * Récupérer tous les cours
   * @param {Object} filters - Filtres optionnels
   * @returns {Promise<Object>}
   */
  async getAllCours(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `/cours/courslist?${queryParams}` : '/cours/courslist';
      
      const response = await api.get(url);
      
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
      console.error('Erreur getAllCours:', error);
      
      if (error.isOffline) {
        return this.getOfflineCourses();
      }
      
      return {
        success: false,
        message: error.message || 'Impossible de charger les cours'
      };
    }
  }

  /**
   * Récupérer les cours hors-ligne
   * @returns {Object}
   */
  getOfflineCourses() {
    const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    
    if (localCourses.length > 0) {
      return {
        success: true,
        data: localCourses,
        offline: true,
        message: 'Cours chargés depuis la mémoire locale'
      };
    }
    
    // Données par défaut
    const defaultCourses = [
      {
        id: 1,
        titre: "Tajwid Avancé",
        description: "Maîtrisez les règles avancées du Tajwid pour une récitation parfaite du Coran",
        category: "Coran",
        niveau: "Expert",
        prix: 89,
        image: "https://images.unsplash.com/photo-1609598429919-48079525b1a4?w=400&h=250&fit=crop",
        students: 234,
        rating: 4.9,
        instructor: "Cheikh Ahmed Al-Mansouri",
        lessons: 24,
        duration: "8 semaines"
      },
      {
        id: 2,
        titre: "Arabe Classique - Niveau 1",
        description: "Apprenez l'arabe classique depuis les bases jusqu'à la maîtrise",
        category: "Langue Arabe",
        niveau: "Débutant",
        prix: 99,
        image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop",
        students: 456,
        rating: 4.8,
        instructor: "Dr. Fatima Zahra",
        lessons: 36,
        duration: "12 semaines"
      },
      {
        id: 3,
        titre: "Fiqh des Prières",
        description: "Les fondements de la jurisprudence islamique concernant les prières",
        category: "Jurisprudence",
        niveau: "Intermédiaire",
        prix: 79,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=250&fit=crop",
        students: 189,
        rating: 4.7,
        instructor: "Cheikh Mohammed Al-Hassan",
        lessons: 30,
        duration: "10 semaines"
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

  /**
   * Récupérer un cours par ID
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async getCoursById(id) {
    try {
      const response = await api.get(`/cours/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error(`Erreur getCoursById ${id}:`, error);
      
      if (error.isOffline) {
        // Chercher dans localStorage
        const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        const course = localCourses.find(c => c.id == id);
        
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
        message: error.message || 'Cours non trouvé'
      };
    }
  }

  /**
   * Créer un nouveau cours
   * @param {Object} coursData
   * @returns {Promise<Object>}
   */
  async createCours(coursData) {
    try {
      const response = await api.post('/cours', coursData);
      
      // Mettre à jour localStorage
      await this.syncLocalCourses();
      
      return {
        success: true,
        data: response.data,
        message: 'Cours créé avec succès !'
      };
    } catch (error) {
      console.error('Erreur createCours:', error);
      
      if (error.isOffline) {
        return this.saveOfflineCourse(coursData);
      }
      
      return {
        success: false,
        message: error.message || 'Erreur lors de la création'
      };
    }
  }

  /**
   * Sauvegarder un cours en mode hors-ligne
   * @param {Object} coursData
   * @returns {Object}
   */
  saveOfflineCourse(coursData) {
    const offlineCourses = JSON.parse(localStorage.getItem('offlineCourses') || '[]');
    const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    
    const newCourse = {
      ...coursData,
      id: 'offline_' + Date.now(),
      status: 'Brouillon',
      createdAt: new Date().toISOString(),
      students: 0,
      _offline: true,
      _synced: false
    };
    
    offlineCourses.push(newCourse);
    localCourses.push(newCourse);
    
    localStorage.setItem('offlineCourses', JSON.stringify(offlineCourses));
    localStorage.setItem('courses', JSON.stringify(localCourses));
    
    return {
      success: true,
      data: newCourse,
      offline: true,
      message: 'Cours créé en mode hors-ligne (sera synchronisé plus tard)'
    };
  }

  /**
   * Mettre à jour un cours
   * @param {string|number} id
   * @param {Object} coursData
   * @returns {Promise<Object>}
   */
  async updateCours(id, coursData) {
    try {
      const response = await api.put(`/cours/${id}`, coursData);
      
      // Mettre à jour localStorage
      await this.syncLocalCourses();
      
      return {
        success: true,
        data: response.data,
        message: 'Cours modifié avec succès !'
      };
    } catch (error) {
      console.error(`Erreur updateCours ${id}:`, error);
      
      if (error.isOffline) {
        return this.updateOfflineCourse(id, coursData);
      }
      
      return {
        success: false,
        message: error.message || 'Erreur lors de la modification'
      };
    }
  }

  /**
   * Mettre à jour un cours hors-ligne
   * @param {string|number} id
   * @param {Object} coursData
   * @returns {Object}
   */
  updateOfflineCourse(id, coursData) {
    const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const offlineCourses = JSON.parse(localStorage.getItem('offlineCourses') || '[]');
    
    const index = localCourses.findIndex(c => c.id == id);
    if (index !== -1) {
      localCourses[index] = { 
        ...localCourses[index], 
        ...coursData, 
        updatedAt: new Date().toISOString(),
        _synced: false 
      };
      localStorage.setItem('courses', JSON.stringify(localCourses));
      
      // Mettre à jour aussi dans offlineCourses
      const offlineIndex = offlineCourses.findIndex(c => c.id == id);
      if (offlineIndex !== -1) {
        offlineCourses[offlineIndex] = localCourses[index];
        localStorage.setItem('offlineCourses', JSON.stringify(offlineCourses));
      }
      
      return {
        success: true,
        data: localCourses[index],
        offline: true,
        message: 'Cours modifié en mode hors-ligne'
      };
    }
    
    return {
      success: false,
      message: 'Cours non trouvé'
    };
  }

  /**
   * Supprimer un cours
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async deleteCours(id) {
    try {
      await api.delete(`/cours/${id}`);
      
      // Supprimer de localStorage
      const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const filtered = localCourses.filter(c => c.id != id);
      localStorage.setItem('courses', JSON.stringify(filtered));
      
      return {
        success: true,
        message: 'Cours supprimé avec succès !'
      };
    } catch (error) {
      console.error(`Erreur deleteCours ${id}:`, error);
      
      if (error.isOffline) {
        // Supprimer de localStorage uniquement
        const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        const filtered = localCourses.filter(c => c.id != id);
        localStorage.setItem('courses', JSON.stringify(filtered));
        
        return {
          success: true,
          offline: true,
          message: 'Cours supprimé en mode hors-ligne'
        };
      }
      
      return {
        success: false,
        message: error.message || 'Erreur lors de la suppression'
      };
    }
  }

  /**
   * S'inscrire à un cours
   * @param {string|number} coursId
   * @returns {Promise<Object>}
   */
  async enrollToCours(coursId) {
    try {
      const response = await api.post(`/cours/${coursId}/inscrire`);
      
      // Mettre à jour localStorage
      const enrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      if (!enrolled.includes(coursId.toString())) {
        enrolled.push(coursId.toString());
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolled));
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Inscription réussie !'
      };
    } catch (error) {
      console.error(`Erreur enrollToCours ${coursId}:`, error);
      
      if (error.isOffline) {
        // Mode hors-ligne
        const enrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        if (!enrolled.includes(coursId.toString())) {
          enrolled.push(coursId.toString());
          localStorage.setItem('enrolledCourses', JSON.stringify(enrolled));
        }
        
        return {
          success: true,
          offline: true,
          message: 'Inscription en mode hors-ligne'
        };
      }
      
      return {
        success: false,
        message: error.message || "Erreur lors de l'inscription"
      };
    }
  }

  /**
   * Récupérer les cours d'un étudiant
   * @returns {Promise<Object>}
   */
  async getStudentCourses() {
    try {
      const response = await api.get('/cours/etudiant/mes-cours');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Erreur getStudentCourses:', error);
      
      if (error.isOffline) {
        // Filtrer les cours où l'étudiant est inscrit
        const enrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        const studentCourses = allCourses.filter(c => enrolled.includes(c.id.toString()));
        
        return {
          success: true,
          data: studentCourses,
          offline: true
        };
      }
      
      return {
        success: false,
        message: error.message || 'Erreur lors du chargement'
      };
    }
  }

  /**
   * Récupérer les cours d'un enseignant
   * @returns {Promise<Object>}
   */
  async getTeacherCourses() {
    try {
      const response = await api.get('/cours/enseignant/mes-cours');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Erreur getTeacherCourses:', error);
      
      if (error.isOffline) {
        // En mode hors-ligne, prendre tous les cours
        const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        return {
          success: true,
          data: allCourses,
          offline: true
        };
      }
      
      return {
        success: false,
        message: error.message || 'Erreur lors du chargement'
      };
    }
  }

  /**
   * Synchroniser les données hors-ligne avec le serveur
   * @returns {Promise<Object>}
   */
  async syncOfflineData() {
    try {
      // Vérifier la connexion
      await api.get('/health');
      
      // Récupérer les cours hors-ligne
      const offlineCourses = JSON.parse(localStorage.getItem('offlineCourses') || '[]');
      
      if (offlineCourses.length === 0) {
        return { success: true, message: 'Aucune donnée à synchroniser' };
      }
      
      let syncedCount = 0;
      
      for (const course of offlineCourses) {
        if (course._synced) continue;
        
        try {
          if (course.id && course.id.toString().startsWith('offline_')) {
            // Nouveau cours à créer
            const { _offline, _synced, id, ...courseData } = course;
            await api.post('/cours', courseData);
          } else {
            // Cours existant à mettre à jour
            const { _offline, _synced, ...courseData } = course;
            await api.put(`/cours/${course.id}`, courseData);
          }
          course._synced = true;
          syncedCount++;
        } catch (syncError) {
          console.error('Erreur synchronisation cours:', syncError);
        }
      }
      
      // Mettre à jour localStorage
      const remainingOffline = offlineCourses.filter(c => !c._synced);
      localStorage.setItem('offlineCourses', JSON.stringify(remainingOffline));
      
      // Recharger tous les cours
      await this.syncLocalCourses();
      
      return {
        success: true,
        syncedCount,
        message: `${syncedCount} élément(s) synchronisé(s) avec le serveur`
      };
    } catch (error) {
      console.log('Pas de connexion serveur pour synchronisation');
      return { 
        success: false, 
        offline: true,
        message: 'Impossible de se connecter au serveur'
      };
    }
  }

  /**
   * Synchroniser les cours locaux avec le serveur
   * @returns {Promise<void>}
   */
  async syncLocalCourses() {
    try {
      const response = await api.get('/cours/courslist');
      if (response.data && response.data.data) {
        // Fusionner avec les cours hors-ligne
        const offlineCourses = JSON.parse(localStorage.getItem('offlineCourses') || '[]');
        const serverCourses = response.data.data;
        const localCourses = [...serverCourses];
        
        // Ajouter les cours hors-ligne non synchronisés
        offlineCourses.forEach(oc => {
          if (!oc._synced && !localCourses.some(lc => lc.id === oc.id)) {
            localCourses.push(oc);
          }
        });
        
        localStorage.setItem('courses', JSON.stringify(localCourses));
      }
    } catch (error) {
      console.log('Impossible de synchroniser avec le serveur');
    }
  }
}

export default new CoursService();