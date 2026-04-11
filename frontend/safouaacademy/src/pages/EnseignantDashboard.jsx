import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import api from "../services/api";
import coursService from "../services/coursService";
import authService from "../services/authService";

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
    const userData = authService.getCurrentUser();
    if (userData) {
      setUser(userData);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadTeacherData();
    }
  }, [user]);

  const handleLogout = () => {
    authService.logout();
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 500);
  };

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTeacherCourses(),
        loadTeacherStats(),
        loadRecentActivities(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherCourses = async () => {
    try {
      const response = await api.get('/cours/enseignant/mes-cours');
      const coursesData = response.data.data || response.data;
      setCourses(coursesData);
    } catch (error) {
      console.error("Erreur chargement cours enseignant:", error);
    }
  };

  const loadTeacherStats = async () => {
    try {
      const response = await api.get('/stats/enseignant');
      setStats(response.data.data);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const response = await api.get('/stats/activites');
      setRecentActivities(response.data.data || []);
    } catch (error) {
      console.error("Erreur chargement activités:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
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
        setCourses(courses.filter(c => c._id !== deleteModal));
        setDeleteModal(null);
        loadTeacherStats();
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleDuplicateCourse = async (course) => {
    try {
      const newCourse = {
        titre: `${course.titre} (copie)`,
        description: course.description,
        categorie: course.categorie,
        niveau: course.niveau,
        prix: course.prix,
        modules: course.modules || [],
        status: "Brouillon"
      };

      await coursService.createCours(newCourse);
      loadTeacherCourses();
    } catch (error) {
      console.error("Erreur duplication:", error);
    }
  };

  const handlePublishCourse = async (courseId) => {
    try {
      await api.patch(`/cours/${courseId}`, { status: "Publié" });
      setCourses(courses.map(c => 
        c._id === courseId ? { ...c, status: "Publié" } : c
      ));
    } catch (error) {
      console.error("Erreur publication:", error);
    }
  };

  const handleArchiveCourse = async (courseId) => {
    try {
      await api.patch(`/cours/${courseId}`, { status: "Archivé" });
      setCourses(courses.map(c => 
        c._id === courseId ? { ...c, status: "Archivé" } : c
      ));
    } catch (error) {
      console.error("Erreur archivage:", error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Erreur marquage notification:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            {activeTab === "cours" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mes cours</h2>
                
                {courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 
                                className="font-semibold text-gray-900 cursor-pointer hover:text-emerald-600"
                                onClick={() => handleViewCourse(course._id)}
                              >
                                {course.titre}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                course.status === 'Publié' 
                                  ? 'bg-green-100 text-green-700' 
                                  : course.status === 'Archivé'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {course.status || 'Brouillon'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <span>👥</span> {course.students?.length || 0} étudiants
                              </span>
                              <span className="flex items-center gap-1">
                                <span>📊</span> Progression: {course.progress || 0}%
                              </span>
                              <span className="flex items-center gap-1">
                                <span>📅</span> Mis à jour: {new Date(course.updatedAt || course.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <span>⭐</span> {course.rating || "Nouveau"}
                              </span>
                              <span className="flex items-center gap-1">
                                <span>💰</span> {course.prix} DT
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewStats(course._id)}
                              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                              title="Statistiques"
                            >
                              📊
                            </button>
                            <button 
                              onClick={() => handleEditCourse(course._id)}
                              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            {course.status === "Brouillon" && (
                              <button 
                                onClick={() => handlePublishCourse(course._id)}
                                className="p-2 border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition"
                                title="Publier"
                              >
                                📢
                              </button>
                            )}
                            {course.status === "Publié" && (
                              <button 
                                onClick={() => handleArchiveCourse(course._id)}
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
                              onClick={() => handleDeleteCourse(course._id)}
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
                              style={{ width: `${course.progress || 0}%` }}
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
                            <div key={course._id} className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 w-32 truncate" title={course.titre}>
                                {course.titre}
                              </span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-600 transition-all" 
                                  style={{ width: `${course.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-700 min-w-[40px] text-right">
                                {course.progress || 0}%
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
                    {recentActivities.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                      {courses.flatMap(course => 
                        (course.students || []).map((student, idx) => (
                          <tr key={`${course._id}-${student._id || idx}`} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-emerald-600">
                                    {student.prenom?.[0] || student.nom?.[0] || String.fromCharCode(65 + idx)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{student.prenom} {student.nom}</p>
                                  <p className="text-xs text-gray-500">{student.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{course.titre}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-600" 
                                    style={{ width: `${student.progress || Math.floor(Math.random() * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{student.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {student.lastActive ? new Date(student.lastActive).toLocaleDateString('fr-FR') : "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <button 
                                onClick={() => navigate(`/admin/etudiants/${student._id}`)}
                                className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold"
                              >
                                Voir
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                      {courses.flatMap(c => c.students || []).length === 0 && (
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
                      <p className="text-2xl font-bold text-emerald-600">{stats.revenue > 0 ? Math.round(stats.revenue * 0.7) : 2450} DT</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Date: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('fr-FR', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                      </p>
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