import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function EnseignantDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("cours");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/', { replace: true });
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setTimeout(() => {
        setCourses([
          {
            id: 1,
            title: "Tajwid Avancé",
            status: "Publié",
            statusColor: "green",
            students: 234,
            progress: 100,
            lastUpdated: "15/03/2026"
          },
          {
            id: 2,
            title: "Arabe Classique",
            status: "Brouillon",
            statusColor: "yellow",
            students: 456,
            progress: 80,
            lastUpdated: "12/03/2026"
          },
          {
            id: 3,
            title: "Histoire Islamique",
            status: "Publié",
            statusColor: "green",
            students: 189,
            progress: 65,
            lastUpdated: "10/03/2026"
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erreur chargement cours:", error);
      setLoading(false);
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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      setCourses(courses.filter(c => c.id !== courseId));
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/cours/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/enseignant" className="text-emerald-600 font-semibold">Espace Enseignant</Link>
            <Link to="/enseignant/analytiques" className="text-gray-600 hover:text-emerald-600">Analytiques</Link>
            <Link to="/enseignant/parametres" className="text-gray-600 hover:text-emerald-600">Paramètres</Link>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-semibold px-3 py-1 rounded transition">
              Déconnexion
            </button>
          </nav>
          
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/compte')} className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold">
              Mon compte
            </button>
            <button onClick={handleLogout} className="md:hidden p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Déconnexion">
              🚪
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Espace Enseignant</h1>
          <button onClick={handleCreateCourse} className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold flex items-center gap-2">
            <span>+</span> Créer un cours
          </button>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setActiveTab("cours")} className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === "cours" ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
            Mes cours
          </button>
          <button onClick={() => setActiveTab("analytiques")} className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === "analytiques" ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
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
                          <h3 className="font-semibold text-gray-900 cursor-pointer hover:text-emerald-600" onClick={() => handleViewCourse(course.id)}>
                            {course.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${course.statusColor === 'green' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {course.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span>{course.students} étudiants</span>
                          <span>Progression moyenne: {course.progress}%</span>
                          <span>Mis à jour: {course.lastUpdated}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleViewStats(course.id)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-semibold">
                          📊 Stats
                        </button>
                        <button onClick={() => handleEditCourse(course.id)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-semibold">
                          ✏️ Modifier
                        </button>
                        <button onClick={() => handleDeleteCourse(course.id)} className="px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition text-sm font-semibold">
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${course.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500">Vous avez {courses.length} cours au total</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Analytiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total étudiants</p>
                <p className="text-2xl font-bold text-emerald-600">879</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Cours actifs</p>
                <p className="text-2xl font-bold text-blue-600">3</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Taux de complétion</p>
                <p className="text-2xl font-bold text-purple-600">78%</p>
              </div>
            </div>
            <p className="text-gray-600">Graphiques et statistiques détaillées apparaîtront ici.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default EnseignantDashboard;
