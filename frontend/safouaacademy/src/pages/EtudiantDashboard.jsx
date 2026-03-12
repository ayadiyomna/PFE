import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function EtudiantDashboard() {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    search: "",
    priceMin: "",
    priceMax: ""
  });

  const [myCourses, setMyCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    certificates: 0,
    averageScore: 0,
    nextLesson: null
  });
  const [activeTab, setActiveTab] = useState("mes-cours");
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const API_BASE = "http://localhost:5000/api";

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    toast.success("👋 Déconnexion réussie");
    navigate('/', { replace: true });
  };

  useEffect(() => {
    loadStudentData();
    loadRecommendedCourses();
    loadStats();
    loadWishlist();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      try {
        const response = await axios.get(`${API_BASE}/etudiant/mes-cours`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyCourses(response.data);
        toast.success(`📚 ${response.data.length} cours chargés`);
      } catch (apiError) {
        console.log("API non disponible, chargement des données locales");
        
        // Récupérer les inscriptions depuis localStorage
        const enrolledIds = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        
        const enrolledCourses = allCourses.filter(c => enrolledIds.includes(c.id));
        
        if (enrolledCourses.length > 0) {
          setMyCourses(enrolledCourses);
        } else {
          // Données simulées
          const mockCourses = [
            {
              id: 1,
              titre: "Tajwid Avancé",
              instructor: "Cheikh Ahmed Al-Mansouri",
              niveau: "Expert",
              progress: 64,
              remainingLessons: 8,
              nextLesson: { id: "l3", title: "Les règles de prolongation" },
              image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop",
              lastAccessed: "2026-03-15",
              certificate: true
            },
            {
              id: 2,
              titre: "Arabe Classique",
              instructor: "Dr. Fatima Zahra",
              niveau: "Débutant",
              progress: 32,
              remainingLessons: 24,
              nextLesson: { id: "l2", title: "Les verbes" },
              image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop",
              lastAccessed: "2026-03-14",
              certificate: true
            }
          ];
          setMyCourses(mockCourses);
        }

        // Extraire les catégories et niveaux
        const uniqueCategories = [...new Set(allCourses.map(c => c.category))];
        const uniqueLevels = [...new Set(allCourses.map(c => c.niveau))];
        setCategories(uniqueCategories);
        setLevels(uniqueLevels);
      }
    } catch (error) {
      console.error("Erreur chargement cours:", error);
      toast.error("❌ Erreur lors du chargement de vos cours");
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendedCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      
      try {
        const response = await axios.get(`${API_BASE}/cours/recommandes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecommendedCourses(response.data);
      } catch (apiError) {
        // Données simulées
        const mockRecommended = [
          {
            id: 3,
            titre: "Fiqh et Usul",
            instructor: "Cheikh Mohammed Al-Hassan",
            niveau: "Intermédiaire",
            category: "Jurisprudence",
            rating: 4.7,
            students: 189,
            price: 79,
            image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop",
            reason: "Basé sur vos cours précédents"
          },
          {
            id: 4,
            titre: "Tafsir du Coran",
            instructor: "Dr. Amina Al-Maghribi",
            niveau: "Intermédiaire",
            category: "Coran",
            rating: 4.9,
            students: 312,
            price: 99,
            image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=250&fit=crop",
            reason: "Populaire parmi les étudiants"
          }
        ];
        setRecommendedCourses(mockRecommended);
      }
    } catch (error) {
      console.error("Erreur chargement recommandations:", error);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      try {
        const response = await axios.get(`${API_BASE}/etudiant/statistiques`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (apiError) {
        // Calculer les stats depuis localStorage
        const enrolledIds = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        const completedLessons = JSON.parse(localStorage.getItem('lesson-progress') || '{}');
        const quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
        
        setStats({
          enrolledCourses: enrolledIds.length,
          completedCourses: Math.floor(enrolledIds.length * 0.3), // Simulation
          totalHours: 42,
          certificates: 1,
          averageScore: quizResults.length > 0 
            ? Math.round(quizResults.reduce((acc, q) => acc + q.score, 0) / quizResults.length)
            : 0,
          nextLesson: myCourses[0]?.nextLesson || null
        });
      }
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const loadWishlist = () => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(saved);
  };

  const handleContinueCourse = (courseId) => {
    navigate(`/cours/${courseId}`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/cours/${courseId}`);
  };

  const handleEnrollCourse = async (courseId, e) => {
    e.stopPropagation();
    
    try {
      toast.info("📝 Inscription en cours...");
      
      const token = localStorage.getItem('token');
      const enrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      
      if (!enrolled.includes(courseId)) {
        enrolled.push(courseId);
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolled));
        
        try {
          await axios.post(`${API_BASE}/cours/${courseId}/inscrire`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (apiError) {
          // Mode hors-ligne
        }
        
        toast.success("✅ Inscription réussie !");
        loadStudentData(); // Recharger les données
      } else {
        toast.info("📚 Vous êtes déjà inscrit à ce cours");
      }
    } catch (error) {
      toast.error("❌ Erreur lors de l'inscription");
    }
  };

  const handleToggleWishlist = (course, e) => {
    e.stopPropagation();
    
    let updated;
    if (wishlist.some(c => c.id === course.id)) {
      updated = wishlist.filter(c => c.id !== course.id);
      toast.info("❤️ Retiré de la wishlist");
    } else {
      updated = [...wishlist, course];
      toast.success("❤️ Ajouté à la wishlist !");
    }
    
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      level: "",
      search: "",
      priceMin: "",
      priceMax: ""
    });
    toast.info("🔄 Filtres réinitialisés");
  };

  const handleTakeQuiz = (courseId) => {
    navigate(`/quiz/cours/${courseId}`);
  };

  const handleViewCertificate = (courseId) => {
    navigate(`/certificats/${courseId}`);
  };

  const filteredCourses = recommendedCourses.filter(course => {
    const matchCategory = !filters.category || course.category === filters.category;
    const matchLevel = !filters.level || course.niveau === filters.level;
    const matchSearch = !filters.search || 
      course.titre.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.instructor.toLowerCase().includes(filters.search.toLowerCase());
    const matchPrice = (!filters.priceMin || course.price >= parseInt(filters.priceMin)) &&
                      (!filters.priceMax || course.price <= parseInt(filters.priceMax));
    
    return matchCategory && matchLevel && matchSearch && matchPrice;
  });

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

      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/catalogue" className="text-gray-600 hover:text-emerald-600">
              Catalogue
            </Link>
            <Link to="/etudiant" className="text-emerald-600 font-semibold">
              Mes cours
            </Link>
            <Link to="/progression" className="text-gray-600 hover:text-emerald-600">
              Progression
            </Link>
            <Link to="/certificats" className="text-gray-600 hover:text-emerald-600">
              Certificats
            </Link>
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
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
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
        
        {/* En-tête avec bienvenue */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {JSON.parse(localStorage.getItem('user'))?.name || 'Étudiant'} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Continuez votre apprentissage et suivez votre progression
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Cours inscrits</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.enrolledCourses}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Complétés</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.completedCourses}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Heures apprises</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.totalHours}h</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Certificats</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.certificates}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Score moyen</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.averageScore}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab("mes-cours")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "mes-cours" 
                ? "text-emerald-600 border-b-2 border-emerald-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Mes cours
          </button>
          <button 
            onClick={() => setActiveTab("recommandations")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "recommandations" 
                ? "text-emerald-600 border-b-2 border-emerald-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Recommandés
          </button>
          <button 
            onClick={() => setActiveTab("wishlist")}
            className={`px-6 py-3 font-semibold transition flex items-center gap-1 ${
              activeTab === "wishlist" 
                ? "text-emerald-600 border-b-2 border-emerald-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Wishlist
            {wishlist.length > 0 && (
              <span className="ml-2 bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-xs">
                {wishlist.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "mes-cours" && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
              </div>
            ) : myCourses.length > 0 ? (
              myCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-32 md:h-auto">
                      <img 
                        src={course.image} 
                        alt={course.titre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{course.titre}</h3>
                          <p className="text-sm text-gray-600">{course.instructor}</p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {course.niveau}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progression</span>
                          <span className="font-semibold text-emerald-600">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600 transition-all" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <span className="mr-4">📚 {course.remainingLessons} leçons restantes</span>
                          <span>📅 Dernier accès: {course.lastAccessed}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleContinueCourse(course.id)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm"
                          >
                            Continuer
                          </button>
                          <button
                            onClick={() => handleTakeQuiz(course.id)}
                            className="border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition font-semibold text-sm"
                          >
                            Quiz
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <span className="text-6xl mb-4 block">📚</span>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun cours pour le moment</h3>
                <p className="text-gray-500 mb-4">Explorez notre catalogue et commencez votre apprentissage</p>
                <Link 
                  to="/cours" 
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                >
                  <span>🔍</span>
                  Explorer les cours
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "recommandations" && (
          <div className="space-y-6">
            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filtres</h2>
                {(filters.category || filters.level || filters.search || filters.priceMin || filters.priceMax) && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  name="search"
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Toutes catégories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Tous niveaux</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <input
                  type="number"
                  name="priceMin"
                  placeholder="Prix min"
                  value={filters.priceMin}
                  onChange={handleFilterChange}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  name="priceMax"
                  placeholder="Prix max"
                  value={filters.priceMax}
                  onChange={handleFilterChange}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Liste des recommandations */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition cursor-pointer"
                       onClick={() => handleViewCourse(course.id)}>
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={course.image} 
                        alt={course.titre}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{course.titre}</h3>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm font-semibold">{course.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                          {course.category}
                        </span>
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs">
                          {course.niveau}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{course.reason}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>👥 {course.students}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleToggleWishlist(course, e)}
                            className={`p-2 rounded-lg transition ${
                              wishlist.some(c => c.id === course.id)
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            ❤️
                          </button>
                          <button
                            onClick={(e) => handleEnrollCourse(course.id, e)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm"
                          >
                            {course.price === 0 ? 'Gratuit' : `${course.price} DT`}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500">Aucun cours trouvé</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div className="space-y-4">
            {wishlist.length > 0 ? (
              wishlist.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={course.image} 
                      alt={course.titre}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.titre}</h3>
                      <p className="text-sm text-gray-600">{course.instructor}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {course.category}
                        </span>
                        <span className="text-xs text-emerald-600 font-semibold">
                          {course.price} DT
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewCourse(course.id)}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm"
                    >
                      Voir
                    </button>
                    <button
                      onClick={(e) => handleToggleWishlist(course, e)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <span className="text-6xl mb-4 block">❤️</span>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Wishlist vide</h3>
                <p className="text-gray-500 mb-4">Ajoutez des cours à votre wishlist pour les retrouver plus tard</p>
                <Link 
                  to="/cours" 
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                >
                  Découvrir des cours
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default EtudiantDashboard;