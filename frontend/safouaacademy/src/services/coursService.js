import api from "./api";

class CoursService {
  async getAllCours(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `/cours/courslist?${queryParams}` : "/cours/courslist";
      const response = await api.get(url);

      if (response.data && response.data.data) {
        localStorage.setItem("courses", JSON.stringify(response.data.data));
      }

      return {
        success: true,
        data: response.data.data || response.data,
        message: "Cours chargés avec succès"
      };
    } catch (error) {
      console.error("Erreur getAllCours:", error);

      if (error.isOffline) {
        return this.getOfflineCourses();
      }

      return {
        success: false,
        message: error.message || "Impossible de charger les cours"
      };
    }
  }

  getOfflineCourses() {
    const localCourses = JSON.parse(localStorage.getItem("courses") || "[]");

    if (localCourses.length > 0) {
      return {
        success: true,
        data: localCourses,
        offline: true,
        message: "Cours chargés depuis la mémoire locale"
      };
    }

    const defaultCourses = [
      {
        id: 1,
        titre: "Tajwid Avancé",
        description: "Maîtrisez les règles avancées du Tajwid pour une récitation parfaite du Coran",
        categorie: "Coran",
        niveau: "Expert",
        prix: 89,
        image: "https://images.unsplash.com/photo-1609598429919-48079525b1a4?w=400&h=250&fit=crop",
        students: 0,
        rating: 4.9,
        instructeur: { nom: "Al-Mansouri", prenom: "Cheikh Ahmed" },
        modules: [],
        dureeTotale: 0
      }
    ];

    localStorage.setItem("courses", JSON.stringify(defaultCourses));

    return {
      success: true,
      data: defaultCourses,
      offline: true,
      message: "Cours par défaut chargés"
    };
  }

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
        const localCourses = JSON.parse(localStorage.getItem("courses") || "[]");
        const course = localCourses.find((c) => c._id == id || c.id == id);

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
        message: error.message || "Cours non trouvé"
      };
    }
  }

  async createCours(coursData) {
    try {
      console.log('📤 Envoi données cours:', coursData);
      const response = await api.post("/cours", coursData);
      console.log('✅ Cours créé:', response.data);
      await this.syncLocalCourses();
      return {
        success: true,
        data: response.data,
        message: "Cours créé avec succès !"
      };
    } catch (error) {
      console.error("❌ Erreur createCours:", error);
      console.error("❌ Réponse erreur:", error.response?.data);

      if (error.isOffline) {
        return this.saveOfflineCourse(coursData);
      }

      // Extract validation errors array if available
      const errors = error.response?.data?.errors;
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la création";
      
      if (Array.isArray(errors) && errors.length > 0) {
        return {
          success: false,
          message: `${errorMessage}: ${errors.join(', ')}`
        };
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  saveOfflineCourse(coursData) {
    const offlineCourses = JSON.parse(localStorage.getItem("offlineCourses") || "[]");
    const localCourses = JSON.parse(localStorage.getItem("courses") || "[]");

    const newCourse = {
      ...coursData,
      id: "offline_" + Date.now(),
      status: "Brouillon",
      createdAt: new Date().toISOString(),
      students: [],
      _offline: true,
      _synced: false
    };

    offlineCourses.push(newCourse);
    localCourses.push(newCourse);

    localStorage.setItem("offlineCourses", JSON.stringify(offlineCourses));
    localStorage.setItem("courses", JSON.stringify(localCourses));

    return {
      success: true,
      data: newCourse,
      offline: true,
      message: "Cours créé en mode hors-ligne (sera synchronisé plus tard)"
    };
  }

  async updateCours(id, coursData) {
    try {
      const response = await api.put(`/cours/${id}`, coursData);
      await this.syncLocalCourses();
      return {
        success: true,
        data: response.data,
        message: "Cours modifié avec succès !"
      };
    } catch (error) {
      console.error(`Erreur updateCours ${id}:`, error);

      if (error.isOffline) {
        return this.updateOfflineCourse(id, coursData);
      }

      return {
        success: false,
        message: error.message || "Erreur lors de la modification"
      };
    }
  }

  updateOfflineCourse(id, coursData) {
    const localCourses = JSON.parse(localStorage.getItem("courses") || "[]");
    const offlineCourses = JSON.parse(localStorage.getItem("offlineCourses") || "[]");

    const index = localCourses.findIndex((c) => c._id == id || c.id == id);
    if (index !== -1) {
      localCourses[index] = {
        ...localCourses[index],
        ...coursData,
        updatedAt: new Date().toISOString(),
        _synced: false
      };
      localStorage.setItem("courses", JSON.stringify(localCourses));

      const offlineIndex = offlineCourses.findIndex((c) => c._id == id || c.id == id);
      if (offlineIndex !== -1) {
        offlineCourses[offlineIndex] = localCourses[index];
        localStorage.setItem("offlineCourses", JSON.stringify(offlineCourses));
      }

      return {
        success: true,
        data: localCourses[index],
        offline: true,
        message: "Cours modifié en mode hors-ligne"
      };
    }

    return {
      success: false,
      message: "Cours non trouvé"
    };
  }

  async deleteCours(id) {
    try {
      await api.delete(`/cours/${id}`);
      const localCourses = JSON.parse(localStorage.getItem("courses") || "[]");
      const filtered = localCourses.filter((c) => c._id != id && c.id != id);
      localStorage.setItem("courses", JSON.stringify(filtered));
      return {
        success: true,
        message: "Cours supprimé avec succès !"
      };
    } catch (error) {
      console.error(`Erreur deleteCours ${id}:`, error);

      if (error.isOffline) {
        const localCourses = JSON.parse(localStorage.getItem("courses") || "[]");
        const filtered = localCourses.filter((c) => c._id != id && c.id != id);
        localStorage.setItem("courses", JSON.stringify(filtered));
        return {
          success: true,
          offline: true,
          message: "Cours supprimé en mode hors-ligne"
        };
      }

      return {
        success: false,
        message: error.message || "Erreur lors de la suppression"
      };
    }
  }

  async enrollToCours(coursId) {
    try {
      const response = await api.post(`/cours/${coursId}/inscrire`);
      return {
        success: true,
        data: response.data,
        message: "Inscription réussie !"
      };
    } catch (error) {
      console.error(`Erreur enrollToCours ${coursId}:`, error);
      return {
        success: false,
        message: error.message || "Erreur lors de l'inscription"
      };
    }
  }

  async getStudentCourses() {
    try {
      const response = await api.get("/cours/etudiant/mes-cours");
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error("Erreur getStudentCourses:", error);

      if (error.isOffline) {
        const enrolled = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
        const allCourses = JSON.parse(localStorage.getItem("courses") || "[]");
        const studentCourses = allCourses.filter((c) => enrolled.includes((c._id || c.id).toString()));

        return {
          success: true,
          data: studentCourses,
          offline: true
        };
      }

      return {
        success: false,
        message: error.message || "Erreur lors du chargement"
      };
    }
  }

  async getTeacherCourses() {
    try {
      const response = await api.get("/cours/enseignant/mes-cours");
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error("Erreur getTeacherCourses:", error);

      if (error.isOffline) {
        const allCourses = JSON.parse(localStorage.getItem("courses") || "[]");
        return {
          success: true,
          data: allCourses,
          offline: true
        };
      }

      return {
        success: false,
        message: error.message || "Erreur lors du chargement"
      };
    }
  }

  async getCourseReviews(id) {
    try {
      const response = await api.get(`/cours/${id}/avis`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors du chargement des avis"
      };
    }
  }

  async syncOfflineData() {
    try {
      await api.get("/health");

      const offlineCourses = JSON.parse(localStorage.getItem("offlineCourses") || "[]");

      if (offlineCourses.length === 0) {
        return { success: true, message: "Aucune donnée à synchroniser" };
      }

      let syncedCount = 0;

      for (const course of offlineCourses) {
        if (course._synced) continue;

        try {
          if ((course.id || "").toString().startsWith("offline_")) {
            const { _offline, _synced, id, ...courseData } = course;
            await api.post("/cours", courseData);
          } else {
            const { _offline, _synced, ...courseData } = course;
            await api.put(`/cours/${course.id || course._id}`, courseData);
          }
          course._synced = true;
          syncedCount++;
        } catch (syncError) {
          console.error("Erreur synchronisation cours:", syncError);
        }
      }

      const remainingOffline = offlineCourses.filter((c) => !c._synced);
      localStorage.setItem("offlineCourses", JSON.stringify(remainingOffline));
      await this.syncLocalCourses();

      return {
        success: true,
        syncedCount,
        message: `${syncedCount} élément(s) synchronisé(s) avec le serveur`
      };
    } catch (error) {
      return {
        success: false,
        offline: true,
        message: "Impossible de se connecter au serveur"
      };
    }
  }

  async syncLocalCourses() {
    try {
      const response = await api.get("/cours/courslist");
      if (response.data && response.data.data) {
        const offlineCourses = JSON.parse(localStorage.getItem("offlineCourses") || "[]");
        const serverCourses = response.data.data;
        const localCourses = [...serverCourses];

        offlineCourses.forEach((oc) => {
          if (!oc._synced && !localCourses.some((lc) => (lc._id || lc.id) === (oc._id || oc.id))) {
            localCourses.push(oc);
          }
        });

        localStorage.setItem("courses", JSON.stringify(localCourses));
      }
    } catch (error) {
      console.log("Impossible de synchroniser avec le serveur");
    }
  }
}

export default new CoursService();