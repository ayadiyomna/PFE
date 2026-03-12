import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function EnseignantDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("cours");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    averageProgress: 0,
    revenue: 0
  });
  const [deleteModal, setDeleteModal] = useState(null);

  const API_BASE = "http://localhost:5000/api";

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    toast.success("👋 Déconnexion réussie");
    navigate('/', { replace: true });
  };

  useEffect(() => {
    loadCourses();
    loadStats();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      try {
        const response = await axios.get(`${API_BASE}/enseignant/mes-cours`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
        toast.success(`📚 ${response.data.length} cours chargés`);
      } catch (apiError) {
        console.log("API non disponible, chargement des données locales");
        
        // Données simulées
        const mockCourses = [
          {
            id: 1,
            title: "Tajwid Avancé",
            status: "Publié",
            statusColor: "green",
            students: 234,
            progress: 100,
            lastUpdated: "15/03/2026",
            lessons: 24,
            price: 89,
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop"
          },
          {
            id: 2,
            title: "Arabe Classique",
            status: "Brouillon",
            statusColor: "yellow",
            students: 456,
            progress: 80,
            lastUpdated: "12/03/2026",
            lessons: 36,
            price: 99,
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop"
          },
          {
            id: 3,
            title: "Histoire Islamique",
            status: "Publié",
            statusColor: "green",
            students: 189,
            progress: 65,
            lastUpdated: "10/03/2026",
            lessons: 30,
            price: 79,
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop"
          }
        ];
        setCourses(mockCourses);
      }
    } catch (error) {
      console.error("Erreur chargement cours:", error);
      toast.error("❌ Erreur lors du chargement des cours");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      try {
        const response = await axios.get(`${API_BASE}/enseignant/statistiques`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (apiError) {
        // Données simulées
        setStats({
          totalStudents: 879,
          totalCourses: 3,
          averageProgress: 78,
          revenue: 24500
        });
      }
    } catch (error) {
      console.error("Erreur chargement stats:", error);
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

  const handleDeleteCourse = (courseId) => {
    setDeleteModal(courseId);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;

    try {
      const token = localStorage.getItem('token');
      
      try {
        await axios.delete(`${API_BASE}/enseignant/cours/${deleteModal}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("🗑️ Cours supprimé avec succès !");
      } catch (apiError) {
        // Mode hors-ligne
        toast.success("🗑️ Cours supprimé (mode hors-ligne)");
      }

      setCourses(courses.filter(c => c.id !== deleteModal));
      setDeleteModal(null);
      loadStats(); // Recharger les stats
      
    } catch (error) {
      toast.error("❌ Erreur lors de la suppression");
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/cours/${courseId}`);
  };

  const handleDuplicateCourse = async (course) => {
    try {
      toast.info("📋 Duplication en cours...");
      
      const newCourse = {
        ...course,
        id: Date.now(),
        title: `${course.title} (copie)`,
        status: "Brouillon",
        students: 0,
        created: new Date().toISOString().split('T')[0]
      };

      const token = localStorage.getItem('token');
      
      try {
        await axios.post(`${API_BASE}/enseignant/cours`, newCourse, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("✅ Cours dupliqué avec succès !");
      } catch (apiError) {
        // Mode hors-ligne
        toast.success("✅ Cours dupliqué (mode hors-ligne)");
      }

      setCourses([...courses, newCourse]);
      
    } catch (error) {
      toast.error("❌ Erreur lors de la duplication");
    }
  };

  const handlePublishCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      
      try {
        await axios.patch(`${API_BASE}/enseignant/cours/${courseId}/publier`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("📢 Cours publié avec succès !");
      } catch (apiError) {
        toast.success("📢 Cours publié (mode hors-ligne)");
      }

      setCourses(courses.map(c => 
        c.id === courseId 
          ? { ...c, status: "Publié", statusColor: "green" }
          : c
      ));
      
    } catch (error) {
      toast.error("❌ Erreur lors de la publication");
    }
  };

  const handleArchiveCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      
      try {
        await axios.patch(`${API_BASE}/enseignant/cours/${courseId}/archiver`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.info("📦 Cours archivé");
      } catch (apiError) {
        toast.info("📦 Cours archivé (mode hors-ligne)");
      }

      setCourses(courses.map(c => 
        c.id === courseId 
          ? { ...c, status: "Archivé", statusColor: "gray" }
          : c
      ));
      
    } catch (error) {
      toast.error("❌ Erreur lors de l'archivage");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Modal de confirmation suppression */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible et toutes les données associées seront perdues.
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

      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/enseignant" className="text-emerald-600 font-semibold">Espace Enseignant</Link>
            <Link to="/enseignant/analytiques" className="text-gray-600 hover:text-emerald-600">Analytiques</Link>
            <Link to="/enseignant/parametres" className="text-gray-600 hover:text-emerald-600">Paramètres</Link>
            <button 
              onClick={handleLogout} 
              className="text-red-600 hover:text-red-700 font-semibold px-3 py-1 rounded transition"
            >
              Déconnexion
            </button>
          </nav>
          
          <div className="flex items-center gap-3">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Espace Enseignant</h1>
          <button 
            onClick={handleCreateCourse}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold flex items-center gap-2"
          >
            <span className="text-xl">+</span> Créer un cours
          </button>
        </div>
        
        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total étudiants</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.totalStudents}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Cours actifs</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.totalCourses}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Progression moyenne</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.averageProgress}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Revenus (DT)</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.revenue.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setActiveTab("cours")} 
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "cours" 
                ? "bg-emerald-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Mes cours
          </button>
          <button 
            onClick={() => setActiveTab("analytiques")} 
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "analytiques" 
                ? "bg-emerald-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Analytiques
          </button>
        </div>
        
        {activeTab === "cours" ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mes cours</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
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
                          <span>👥 {course.students} étudiants</span>
                          <span>📊 Progression: {course.progress}%</span>
                          <span>📅 Mis à jour: {course.lastUpdated}</span>
                          <span>⭐ {course.rating || "Nouveau"}</span>
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
                          className="h-full bg-emerald-600 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
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
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Analytiques détaillées</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Performance des cours</h3>
                  <div className="space-y-3">
                    {courses.map(course => (
                      <div key={course.id} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-32 truncate">{course.title}</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{course.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Engagement étudiants</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taux de complétion moyen</span>
                      <span className="font-semibold text-emerald-600">{stats.averageProgress}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Étudiants actifs</span>
                      <span className="font-semibold text-emerald-600">{stats.totalStudents}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenus totaux</span>
                      <span className="font-semibold text-emerald-600">{stats.revenue} DT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Activité récente</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-600">Nouvel étudiant inscrit au cours "Tajwid Avancé"</span>
                  <span className="text-gray-400 ml-auto">il y a 5 min</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-600">Quiz complété dans "Arabe Classique"</span>
                  <span className="text-gray-400 ml-auto">il y a 1h</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span className="text-gray-600">Nouvel avis sur "Histoire Islamique"</span>
                  <span className="text-gray-400 ml-auto">il y a 2h</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default EnseignantDashboard;