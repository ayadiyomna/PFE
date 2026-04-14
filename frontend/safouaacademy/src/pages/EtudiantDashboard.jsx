import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import api from "../services/api";
import coursService from "../services/coursService";
import authService from "../services/authService";

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
  const [user, setUser] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

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
      loadStudentData();
      loadStats();
      loadWishlist();
      loadRecentActivities();
      loadUpcomingDeadlines();
    }
  }, [user]);

  const handleLogout = () => {
    authService.logout();
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 500);
  };

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const result = await coursService.getStudentCourses();
      
      if (result.success) {
        setMyCourses(result.data);
        
        const uniqueCategories = [...new Set(result.data.map(c => c.categorie))];
        const uniqueLevels = [...new Set(result.data.map(c => c.niveau))];
        setCategories(uniqueCategories.filter(Boolean));
        setLevels(uniqueLevels.filter(Boolean));
      }
    } catch (error) {
      console.error("Erreur chargement cours:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/stats/etudiant');
      setStats(response.data.data);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const loadWishlist = () => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(saved);
  };

  const loadRecentActivities = async () => {
    try {
      const response = await api.get('/stats/activites');
      setRecentActivities(response.data.data || []);
    } catch (error) {
      console.error("Erreur chargement activités:", error);
    }
  };

  const loadUpcomingDeadlines = async () => {
    try {
      const response = await api.get('/progress/echeances');
      setUpcomingDeadlines(response.data.data || []);
    } catch (error) {
      console.error("Erreur chargement échéances:", error);
    }
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
      const result = await coursService.enrollToCours(courseId);
      if (result.success) {
        loadStudentData();
        loadStats();
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
    }
  };

  const handleToggleWishlist = (course, e) => {
    e.stopPropagation();
    
    let updated;
    if (wishlist.some(c => c._id === course._id)) {
      updated = wishlist.filter(c => c._id !== course._id);
    } else {
      updated = [...wishlist, course];
    }
    
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      level: "",
      search: "",
      priceMin: "",
      priceMax: ""
    });
  };

  const handleTakeQuiz = (courseId) => {
    navigate(`/quiz/cours/${courseId}`);
  };

  const loadRecommendedCourses = async () => {
    try {
      const response = await api.get('/cours/recommandations');
      setRecommendedCourses(response.data.data || []);
    } catch (error) {
      console.error("Erreur chargement recommandations:", error);
      // Fallback: courses populaires
      const allCourses = await coursService.getAllCours();
      if (allCourses.success) {
        setRecommendedCourses(allCourses.data.slice(0, 6));
      }
    }
  };

  const filteredCourses = recommendedCourses.filter(course => {
    const matchCategory = !filters.category || course.categorie === filters.category;
    const matchLevel = !filters.level || course.niveau === filters.level;
    const matchSearch = !filters.search || 
      course.titre?.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.instructeur?.prenom?.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.instructeur?.nom?.toLowerCase().includes(filters.search.toLowerCase());
    const matchPrice = (!filters.priceMin || course.prix >= parseInt(filters.priceMin)) &&
                      (!filters.priceMax || course.prix <= parseInt(filters.priceMax));
    
    return matchCategory && matchLevel && matchSearch && matchPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md border-t-4 border-emerald-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/cours" className="text-gray-600 hover:text-emerald-600 transition">
              Catalogue
            </Link>
            <button 
              onClick={() => setActiveTab("mes-cours")}
              className={`${activeTab === "mes-cours" ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              Mes cours ({myCourses.length})
            </button>
            <Link to="/etudiant/progression" className="text-gray-600 hover:text-emerald-600 transition">
              Progression
            </Link>
            <Link to="/etudiant/certificats" className="text-gray-600 hover:text-emerald-600 transition">
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
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
              <span className="text-emerald-600">👤</span>
              <span className="text-sm font-semibold text-gray-700">
                {user?.prenom || user?.nom || 'Étudiant'}
              </span>
            </div>
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
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user?.prenom || user?.nom || 'Étudiant'} 👋
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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Cours inscrits</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.enrolledCourses}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Complétés</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.completedCourses}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Heures apprises</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.totalHours}h</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Certificats</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.certificates}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Progression</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.averageScore}%</p>
          </div>
        </div>

        {upcomingDeadlines.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-600">⏰</span>
              <h3 className="font-semibold text-amber-800">Échéances à venir</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline._id} className="bg-white rounded-lg px-4 py-2 shadow-sm">
                  <p className="text-sm font-medium text-gray-900">{deadline.course}</p>
                  <p className="text-xs text-gray-600">{deadline.task} - {new Date(deadline.dueDate).toLocaleDateString('fr-FR')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab("mes-cours")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "mes-cours" 
                ? "text-emerald-600 border-b-2 border-emerald-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Mes cours ({myCourses.length})
          </button>
          <button 
            onClick={() => {
              setActiveTab("recommandations");
              loadRecommendedCourses();
            }}
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
          <button 
            onClick={() => setActiveTab("activites")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "activites" 
                ? "text-emerald-600 border-b-2 border-emerald-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Activités
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {activeTab === "mes-cours" && (
              <div className="space-y-4">
                {myCourses.length > 0 ? (
                  myCourses.map((course) => (
                    <div 
                      key={course._id} 
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition cursor-pointer"
                      onClick={() => handleContinueCourse(course._id)}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-48 h-32 md:h-auto relative">
                          <img 
                            src={course.image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop"} 
                            alt={course.titre}
                            className="w-full h-full object-cover"
                          />
                          {course.progress === 100 && (
                            <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                              ✅ Complété
                            </span>
                          )}
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{course.titre}</h3>
                              <p className="text-sm text-gray-600">
                                {course.instructeur?.prenom} {course.instructeur?.nom}
                              </p>
                            </div>
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                              {course.niveau}
                            </span>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Progression</span>
                              <span className="font-semibold text-emerald-600">{course.progress || 0}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-600 transition-all" 
                                style={{ width: `${course.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              <span className="mr-4">📚 {course.remainingLessons || 0} leçons restantes</span>
                              <span>📅 Dernier accès: {course.lastAccessed ? new Date(course.lastAccessed).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleContinueCourse(course._id)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm"
                              >
                                {course.progress === 0 ? 'Commencer' : 'Continuer'}
                              </button>
                              <button
                                onClick={() => handleTakeQuiz(course._id)}
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
                    <button 
                      onClick={() => setActiveTab("recommandations")}
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                    >
                      <span>🔍</span>
                      Explorer les cours
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "recommandations" && (
              <div className="space-y-6">
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
                      min="0"
                      className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="number"
                      name="priceMax"
                      placeholder="Prix max"
                      value={filters.priceMax}
                      onChange={handleFilterChange}
                      min="0"
                      className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCourses.map((course) => (
                      <div 
                        key={course._id} 
                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition cursor-pointer"
                        onClick={() => handleViewCourse(course._id)}
                      >
                        <div className="h-40 overflow-hidden relative">
                          <img 
                            src={course.image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop"} 
                            alt={course.titre}
                            className="w-full h-full object-cover hover:scale-105 transition duration-300"
                          />
                          {course.prix === 0 && (
                            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              Gratuit
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-gray-900 line-clamp-1">{course.titre}</h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-yellow-400">★</span>
                              <span className="text-sm font-semibold">{course.rating || 4.5}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                            {course.instructeur?.prenom} {course.instructeur?.nom}
                          </p>
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                              {course.categorie}
                            </span>
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs">
                              {course.niveau}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2 italic">Basé sur vos intérêts</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>👥 {course.students?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleToggleWishlist(course, e)}
                                className={`p-2 rounded-lg transition ${
                                  wishlist.some(c => c._id === course._id)
                                    ? 'text-red-500 hover:bg-red-50'
                                    : 'text-gray-400 hover:bg-gray-100'
                                }`}
                                title={wishlist.some(c => c._id === course._id) ? "Retirer de la wishlist" : "Ajouter à la wishlist"}
                              >
                                {wishlist.some(c => c._id === course._id) ? '❤️' : '🤍'}
                              </button>
                              <button
                                onClick={(e) => handleEnrollCourse(course._id, e)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm"
                              >
                                {course.prix === 0 ? 'Gratuit' : `${course.prix} DT`}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <span className="text-6xl mb-4 block">🔍</span>
                    <p className="text-gray-500">Aucun cours trouvé avec ces filtres</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="space-y-4">
                {wishlist.length > 0 ? (
                  wishlist.map((course) => (
                    <div 
                      key={course._id} 
                      className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-4">
                        <img 
                          src={course.image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop"} 
                          alt={course.titre}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{course.titre}</h3>
                          <p className="text-sm text-gray-600">{course.instructeur?.prenom} {course.instructeur?.nom}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {course.categorie}
                            </span>
                            <span className="text-xs text-emerald-600 font-semibold">
                              {course.prix === 0 ? 'Gratuit' : `${course.prix} DT`}
                            </span>
                            <span className="text-xs text-gray-500">
                              ★ {course.rating || 4.5}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewCourse(course._id)}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm"
                        >
                          Voir
                        </button>
                        <button
                          onClick={(e) => handleEnrollCourse(course._id, e)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm"
                        >
                          S'inscrire
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
                    <button 
                      onClick={() => setActiveTab("recommandations")}
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                    >
                      Découvrir des cours
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "activites" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Activités récentes</h2>
                
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'course' ? 'bg-blue-100' :
                        activity.type === 'quiz' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        <span className="text-lg">
                          {activity.type === 'course' ? '📚' : activity.type === 'quiz' ? '📝' : '🏆'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                  {recentActivities.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Statistiques d'apprentissage</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Jours consécutifs</p>
                      <p className="text-2xl font-bold text-emerald-600">{stats.streak || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Moyenne hebdomadaire</p>
                      <p className="text-2xl font-bold text-emerald-600">{stats.weeklyHours || 0}h</p>
                    </div>
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

export default EtudiantDashboard;