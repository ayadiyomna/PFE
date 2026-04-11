import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import coursService from "../services/coursService";
import authService from "../services/authService";
import api from "../services/api";

function Cours() {
  const navigate = useNavigate();
  const [cours, setCours] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    search: "",
    priceMin: "",
    priceMax: ""
  });
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    const enrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    setEnrolledCourses(enrolled);
    
    loadCourses();
  }, []);

  useEffect(() => {
    applyFilters();
    extractFilters();
  }, [cours, filters]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const result = await coursService.getAllCours();
      
      if (result.success) {
        setCours(result.data);
      }
    } catch (error) {
      console.error("Erreur chargement cours:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractFilters = () => {
    const uniqueCategories = [...new Set(cours.map(c => c.categorie).filter(Boolean))];
    const uniqueLevels = [...new Set(cours.map(c => c.niveau).filter(Boolean))];
    setCategories(uniqueCategories);
    setLevels(uniqueLevels);
  };

  const applyFilters = () => {
    let filtered = [...cours];
    
    if (filters.category) {
      filtered = filtered.filter(c => c.categorie === filters.category);
    }
    
    if (filters.level) {
      filtered = filtered.filter(c => c.niveau === filters.level);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.titre?.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower) ||
        c.instructeur?.nom?.toLowerCase().includes(searchLower) ||
        c.instructeur?.prenom?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.priceMin) {
      filtered = filtered.filter(c => c.prix >= parseInt(filters.priceMin));
    }

    if (filters.priceMax) {
      filtered = filtered.filter(c => c.prix <= parseInt(filters.priceMax));
    }
    
    setFilteredCourses(filtered);
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

  const handleViewCourse = (courseId) => {
    navigate(`/cours/${courseId}`);
  };

  const handleEnrollCourse = async (courseId, e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const result = await coursService.enrollToCours(courseId);
      if (result.success) {
        setEnrolledCourses(prev => [...prev, courseId]);
        loadCourses(); // Recharger pour mettre à jour le nombre d'étudiants
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/', { replace: true });
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.includes(courseId.toString()) || enrolledCourses.includes(courseId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-emerald-600">Accueil</Link>
            <Link to="/cours" className="text-emerald-600 font-semibold">Catalogue</Link>
            {!isAuthenticated ? (
              <Link to="/login" className="text-gray-600 hover:text-emerald-600">Connexion</Link>
            ) : (
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                Déconnexion
              </button>
            )}
          </nav>
          
          {!isAuthenticated ? (
            <Link 
              to="/login"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              Se connecter
            </Link>
          ) : (
            <button
              onClick={() => navigate('/etudiant')}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              Mon compte
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Nos Cours Disponibles</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
            {(filters.category || filters.level || filters.search || filters.priceMin || filters.priceMax) && (
              <button
                onClick={resetFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Titre, description, formateur..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Toutes</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Niveau
              </label>
              <select
                name="level"
                value={filters.level}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Tous</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prix max (DT)
              </label>
              <input
                type="number"
                name="priceMax"
                value={filters.priceMax}
                onChange={handleFilterChange}
                placeholder="Max"
                min="0"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          {filteredCourses.length} cours trouvés
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => (
              <div 
                key={c._id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition cursor-pointer group"
                onClick={() => handleViewCourse(c._id)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={c.image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop"}
                    alt={c.titre}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {c.niveau}
                    </span>
                  </div>
                  {c.prix === 0 && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        Gratuit
                      </span>
                    </div>
                  )}
                  {isEnrolled(c._id) && (
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        Inscrit ✓
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{c.titre}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold">{c.rating || 4.5}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                    {c.instructeur?.prenom} {c.instructeur?.nom}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">{c.categorie}</p>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {c.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <span>👥</span>
                      <span>{c.students?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📚</span>
                      <span>{c.modules?.length || 0} modules</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{c.dureeTotale || 0} min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600 font-bold text-xl">
                      {c.prix === 0 ? "Gratuit" : `${c.prix} DT`}
                    </span>
                    <button
                      onClick={(e) => handleEnrollCourse(c._id, e)}
                      disabled={isEnrolled(c._id)}
                      className={`px-4 py-2 rounded-lg transition font-semibold text-sm ${
                        isEnrolled(c._id)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {isEnrolled(c._id) ? 'Inscrit' : "S'inscrire"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-gray-500 text-lg mb-4">Aucun cours trouvé</p>
            <button
              onClick={resetFilters}
              className="text-emerald-600 font-semibold hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cours;