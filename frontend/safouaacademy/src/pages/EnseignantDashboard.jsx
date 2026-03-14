import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../services/api";
import coursService from "../services/coursService";

function EnseignantDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("cours");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    averageProgress: 0,
    revenue: 0,
    pendingReviews: 0
  });
  const [deleteModal, setDeleteModal] = useState(null);
  const [user, setUser] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        toast.warning("🔐 Veuillez vous connecter");
        navigate('/login');
      }
    } catch (error) {
      console.error("Erreur chargement utilisateur:", error);
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadTeacherData();
      loadRecentActivities();
      loadNotifications();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    toast.success("👋 Déconnexion réussie");
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);
  };

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      
      // Charger les cours de l'enseignant
      await loadTeacherCourses();
      
      // Charger les statistiques
      await loadTeacherStats();
      
    } catch (error) {
      console.error("Erreur chargement données:", error);
      toast.error("❌ Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherCourses = async () => {
    try {
      const result = await coursService.getTeacherCourses();
      if (result.success) {
        // Formater les données
        const formattedCourses = result.data.map(course => ({
          id: course.id,
          title: course.titre || course.title,
          status: course.status || "Brouillon",
          statusColor: course.status === "Publié" ? "green" : 
                      course.status === "Archivé" ? "gray" : "yellow",
          students: course.students || 0,
          progress: course.progress || 0,
          lastUpdated: course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('fr-FR') : 
                      course.createdAt ? new Date(course.createdAt).toLocaleDateString('fr-FR') : 
                      new Date().toLocaleDateString('fr-FR'),
          lessons: course.lessons || course.curriculum?.length || 0,
          price: course.prix || course.price || 0,
          rating: course.rating || 0,
          image: course.image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop"
        }));
        
        setCourses(formattedCourses);
        
        // Sauvegarder en cache
        localStorage.setItem('teacherCourses', JSON.stringify(formattedCourses));
      }
    } catch (error) {
      console.error("Erreur chargement cours enseignant:", error);
      
      // Utiliser le cache si disponible
      const cached = JSON.parse(localStorage.getItem('teacherCourses') || '[]');
      if (cached.length > 0) {
        setCourses(cached);
        toast.info("📚 Cours chargés depuis le cache");
      }
    }
  };

  const loadTeacherStats = async () => {
    try {
      const response = await api.get('/enseignant/statistiques');
      setStats(response.data.data || response.data);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
      
      // Calculer les stats depuis les cours
      const totalStudents = courses.reduce((acc, course) => acc + (course.students || 0), 0);
      const avgProgress = courses.length > 0 
        ? Math.round(courses.reduce((acc, course) => acc + (course.progress || 0), 0) / courses.length)
        : 0;
      const totalRevenue = courses.reduce((acc, course) => acc + ((course.students || 0) * (course.price || 0)), 0);
      
      setStats({
        totalStudents: totalStudents || 0,
        totalCourses: courses.length,
        averageProgress: avgProgress,
        revenue: totalRevenue,
        pendingReviews: 2
      });
    }
  };

  const loadRecentActivities = async () => {
    try {
      const response = await api.get('/enseignant/activites');
      setRecentActivities(response.data.data || response.data);
    } catch (error) {
      // Activités simulées
      setRecentActivities([
        { id: 1, type: 'student', message: 'Nouvel étudiant inscrit à "Tajwid Avancé"', time: 'il y a 10 min' },
        { id: 2, type: 'review', message: 'Nouvel avis sur "Arabe Classique" (5★)', time: 'il y a 1h' },
        { id: 3, type: 'quiz', message: 'Quiz complété dans "Tajwid Avancé"', time: 'il y a 2h' }
      ]);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await api.get('/enseignant/notifications');
      setNotifications(response.data.data || response.data);
    } catch (error) {
      setNotifications([
        { id: 1, message: '3 étudiants ont terminé leur cours', read: false },
        { id: 2, message: 'Nouvelle question en attente de réponse', read: false }
      ]);
    }
  };

  const handleCreateCourse = () => {
    navigate('/enseignant/creer-cours');
  };

  const handleEditCourse = (courseId) => {
    navigate(`/enseignant/modifier-cours/${courseId}`);
  };

  const handleViewStats = (courseId) => {
    navigate(`/enseignant/statistiques/${courseId}`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/cours/${courseId}`);
  };

  const handleDeleteCourse = (courseId) => {
    setDeleteModal(courseId);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;

    try {
      const result = await coursService.deleteCours(deleteModal);
      
      if (result.success) {
        toast.success(result.message);
        setCourses(courses.filter(c => c.id !== deleteModal));
        setDeleteModal(null);
        loadTeacherStats(); // Recharger les stats
      }
      
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("❌ Erreur lors de la suppression");
    }
  };

  const handleDuplicateCourse = async (course) => {
    try {
      toast.info("📋 Duplication en cours...");
      
      const newCourse = {
        ...course,
        titre: `${course.title} (copie)`,
        status: "Brouillon",
        students: 0,
        progress: 0
      };

      delete newCourse.id;
      delete newCourse._id;

      const result = await coursService.createCours(newCourse);
      
      if (result.success) {
        toast.success("✅ Cours dupliqué avec succès !");
        loadTeacherCourses(); // Recharger
      }
      
    } catch (error) {
      console.error("Erreur duplication:", error);
      toast.error("❌ Erreur lors de la duplication");
    }
  };

  const handlePublishCourse = async (courseId) => {
    try {
      await api.patch(`/enseignant/cours/${courseId}/publier`);
      toast.success("📢 Cours publié avec succès !");
      
      setCourses(courses.map(c => 
        c.id === courseId 
          ? { ...c, status: "Publié", statusColor: "green" }
          : c
      ));
      
    } catch (error) {
      console.error("Erreur publication:", error);
      
      if (error.offline) {
        // Mode hors-ligne
        setCourses(courses.map(c => 
          c.id === courseId 
            ? { ...c, status: "Publié", statusColor: "green" }
            : c
        ));
        toast.success("📢 Cours publié en mode hors-ligne");
      } else {
        toast.error("❌ Erreur lors de la publication");
      }
    }
  };

  const handleArchiveCourse = async (courseId) => {
    try {
      await api.patch(`/enseignant/cours/${courseId}/archiver`);
      toast.info("📦 Cours archivé");
      
      setCourses(courses.map(c => 
        c.id === courseId 
          ? { ...c, status: "Archivé", statusColor: "gray" }
          : c
      ));
      
    } catch (error) {
      console.error("Erreur archivage:", error);
      
      if (error.offline) {
        setCourses(courses.map(c => 
          c.id === courseId 
            ? { ...c, status: "Archivé", statusColor: "gray" }
            : c
        ));
        toast.info("📦 Cours archivé en mode hors-ligne");
      } else {
        toast.error("❌ Erreur lors de l'archivage");
      }
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
        theme="colored"
      />

      {/* Modal de confirmation suppression */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Supprimer
              </button>
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 border border-gray-200 py-2 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white shadow-md border-t-4 border-emerald-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <button 
              onClick={() => setActiveTab("cours")}
              className={`${activeTab === "cours" ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              Mes cours
            </button>
            <button 
              onClick={() => setActiveTab("analytiques")}
              className={`${activeTab === "analytiques" ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              Analytiques
            </button>
            <button 
              onClick={() => setActiveTab("etudiants")}
              className={`${activeTab === "etudiants" ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              Étudiants
            </button>
            <button 
              onClick={() => setActiveTab("parametres")}
              className={`${activeTab === "parametres" ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              Paramètres
            </button>
            <button 
              onClick={handleLogout} 
              className="text-red-600 hover:text-red-700 font-semibold px-3 py-1 rounded transition"
            >
              Déconnexion
            </button>
          </nav>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <span className="text-xl">🔔</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
              <span className="text-emerald-600">👨‍🏫</span>
              <span className="text-sm font-semibold text-gray-700">
                {user?.prenom || user?.name || 'Enseignant'}
              </span>
            </div>
            
            <button 
              onClick={() => navigate('/compte')}
              className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              Mon compte
            </button>
            
            <button 
              onClick={handleLogout} 
              className="md:hidden p-2 text-red-600 hover:bg-red-50 rounded-lg transition" 
              title="Déconnexion"
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête avec bienvenue */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour, {user?.prenom || user?.name || 'Enseignant'} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <button 
            onClick={handleCreateCourse}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold flex items-center gap-2 shadow-lg"
          >
            <span className="text-xl">+</span> Créer un cours
          </button>
        </div>
        
        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Total étudiants</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.totalStudents.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Cours actifs</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.totalCourses}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Progression moyenne</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.averageProgress}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Revenus (DT)</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Avis en attente</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pendingReviews}</p>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {/* TAB MES COURS */}
            {activeTab === "cours" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mes cours</h2>
                
                {courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 
                                className="font-semibold text-gray-900 cursor-pointer hover:text-emerald-600"
                                onClick={() => handleViewCourse(course.id)}
                              >
                                {course.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                course.statusColor === 'green' 
                                  ? 'bg-green-100 text-green-700' 
                                  : course.statusColor === 'yellow'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {course.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <span>👥</span> {course.students} étudiants
                              </span>
                              <span className="flex items-center gap-1">
                                <span>📊</span> Progression: {course.progress}%
                              </span>
                              <span className="flex items-center gap-1">
                                <span>📅</span> Mis à jour: {course.lastUpdated}
                              </span>
                                                            <span className="flex items-center gap-1">
                                <span>⭐</span> {course.rating || "Nouveau"}
                              </span>
                              <span className="flex items-center gap-1">
                                <span>💰</span> {course.price} DT
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewStats(course.id)}
                              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                              title="Statistiques"
                            >
                              📊
                            </button>
                            <button 
                              onClick={() => handleEditCourse(course.id)}
                              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            {course.status === "Brouillon" && (
                              <button 
                                onClick={() => handlePublishCourse(course.id)}
                                className="p-2 border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition"
                                title="Publier"
                              >
                                📢
                              </button>
                            )}
                            {course.status === "Publié" && (
                              <button 
                                onClick={() => handleArchiveCourse(course.id)}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                title="Archiver"
                              >
                                📦
                              </button>
                            )}
                            <button 
                              onClick={() => handleDuplicateCourse(course)}
                              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                              title="Dupliquer"
                            >
                              📋
                            </button>
                            <button 
                              onClick={() => handleDeleteCourse(course.id)}
                              className="p-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-600 rounded-full transition-all" 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <span className="text-6xl mb-4 block">📚</span>
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore de cours</p>
                    <button
                      onClick={handleCreateCourse}
                      className="text-emerald-600 font-semibold hover:underline"
                    >
                      Créer votre premier cours
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB ANALYTIQUES */}
            {activeTab === "analytiques" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Analytiques détaillées</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Performance des cours</h3>
                      <div className="space-y-3">
                        {courses.length > 0 ? (
                          courses.map(course => (
                            <div key={course.id} className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 w-32 truncate" title={course.title}>
                                {course.title}
                              </span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-600 transition-all" 
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-700 min-w-[40px] text-right">
                                {course.progress}%
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Engagement étudiants</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Taux de complétion moyen</span>
                          <span className="font-semibold text-emerald-600">{stats.averageProgress}%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Étudiants actifs</span>
                          <span className="font-semibold text-emerald-600">{stats.totalStudents.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Revenus totaux</span>
                          <span className="font-semibold text-emerald-600">{stats.revenue.toLocaleString()} DT</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Cours publiés</span>
                          <span className="font-semibold text-emerald-600">
                            {courses.filter(c => c.status === "Publié").length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Activité récente</h3>
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 text-sm p-2 hover:bg-gray-50 rounded-lg transition">
                        <span className={`w-2 h-2 rounded-full ${
                          activity.type === 'student' ? 'bg-green-500' :
                          activity.type === 'review' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></span>
                        <span className="text-gray-600">{activity.message}</span>
                        <span className="text-gray-400 ml-auto">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB ÉTUDIANTS */}
            {activeTab === "etudiants" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mes étudiants</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Étudiant</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Cours</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Progression</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Dernière activité</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {courses.length > 0 ? (
                        courses.flatMap(course => 
                          Array(course.students || 3).fill(null).map((_, idx) => (
                            <tr key={`${course.id}-${idx}`} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-emerald-600">
                                      {String.fromCharCode(65 + idx)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">Étudiant {idx + 1}</p>
                                    <p className="text-xs text-gray-500">etudiant{idx+1}@email.com</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{course.title}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-emerald-600" 
                                      style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">{Math.floor(Math.random() * 100)}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(Date.now() - Math.random() * 86400000).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-4 py-3">
                                <button className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold">
                                  Voir
                                </button>
                              </td>
                            </tr>
                          ))
                        )
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-gray-500">
                            Aucun étudiant inscrit pour le moment
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB PARAMÈTRES */}
            {activeTab === "parametres" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Paramètres du compte enseignant</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Informations personnelles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label>
                        <input
                          type="text"
                          value={user?.nom || ''}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom</label>
                        <input
                          type="text"
                          value={user?.prenom || ''}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Rôle</label>
                        <input
                          type="text"
                          value="Enseignant"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Préférences de notification</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                        <span className="text-sm text-gray-700">Nouvel étudiant inscrit</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                        <span className="text-sm text-gray-700">Nouvel avis sur mes cours</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                        <span className="text-sm text-gray-700">Question des étudiants</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-emerald-600" />
                        <span className="text-sm text-gray-700">Rapports hebdomadaires</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Paiements</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Prochain versement estimé</p>
                      <p className="text-2xl font-bold text-emerald-600">2,450 DT</p>
                      <p className="text-xs text-gray-500 mt-1">Date: 30/03/2026</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold">
                      Sauvegarder les modifications
                    </button>
                    <button className="border border-gray-200 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold">
                      Changer le mot de passe
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default EnseignantDashboard;