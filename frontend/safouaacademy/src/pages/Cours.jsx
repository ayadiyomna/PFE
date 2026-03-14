import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

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

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    applyFilters();
    extractFilters();
  }, [cours]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      try {
        const response = await axios.get(`${API_BASE}/cours`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCours(response.data);
        toast.success(`📚 ${response.data.length} cours chargés`);
      } catch (apiError) {
        console.log("API non disponible, chargement des données locales");
        
        // Charger les cours du localStorage
        const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        
        if (localCourses.length > 0) {
          setCours(localCourses);
        } else {
          // Données par défaut si aucun cours
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
          setCours(defaultCourses);
          localStorage.setItem('courses', JSON.stringify(defaultCourses));
        }
      }
    } catch (error) {
      console.error("Erreur chargement cours:", error);
      toast.error("❌ Erreur lors du chargement des cours");
    } finally {
      setLoading(false);
    }
  };

  const extractFilters = () => {
    // Extraire les catégories et niveaux uniques
    const uniqueCategories = [...new Set(cours.map(c => c.category))];
    const uniqueLevels = [...new Set(cours.map(c => c.niveau))];
    setCategories(uniqueCategories);
    setLevels(uniqueLevels);
  };

  const applyFilters = () => {
    let filtered = [...cours];
    
    if (filters.category) {
      filtered = filtered.filter(c => c.category === filters.category);
    }
    
    if (filters.level) {
      filtered = filtered.filter(c => c.niveau === filters.level);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.titre.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower) ||
        c.instructor?.toLowerCase().includes(searchLower)
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

  const handleViewCourse = (courseId) => {
    navigate(`/cours/${courseId}`);
  };

  const handleEnrollCourse = async (courseId, e) => {
    e.stopPropagation();
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.warning("🔐 Connectez-vous pour vous inscrire");
      navigate('/login');
      return;
    }

    try {
      toast.info("📝 Inscription en cours...");
      
      const token = localStorage.getItem('token');
      
      try {
        await axios.post(`${API_BASE}/cours/${courseId}/inscrire`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("✅ Inscription réussie !");
      } catch (apiError) {
        // Mode hors-ligne
        const enrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        if (!enrolled.includes(courseId)) {
          enrolled.push(courseId);
          localStorage.setItem('enrolledCourses', JSON.stringify(enrolled));
          toast.success("✅ Inscription réussie (mode hors-ligne)");
        } else {
          toast.info("📚 Vous êtes déjà inscrit à ce cours");
        }
      }
    } catch (error) {
      toast.error("❌ Erreur lors de l'inscription");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    toast.success("👋 Déconnexion réussie");
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);
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

      {/* Header */}
      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-emerald-600">Accueil</Link>
            <Link to="/cours" className="text-emerald-600 font-semibold">Catalogue</Link>
            {!localStorage.getItem('token') ? (
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
          
          {!localStorage.getItem('token') ? (
            <Link 
              to="/login"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              Se connecter
            </Link>
          ) : (
            <button
              onClick={() => navigate('/compte')}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              Mon compte
            </button>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Nos Cours Disponibles</h1>

        {/* Filtres */}
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
            {/* Recherche */}
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

            {/* Catégorie */}
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

            {/* Niveau */}
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

            {/* Prix */}
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

        {/* Résultats */}
        <p className="text-gray-600 mb-4">
          {filteredCourses.length} cours trouvés
        </p>

        {/* Grille des cours */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => (
              <div 
                key={c.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition cursor-pointer group"
                onClick={() => handleViewCourse(c.id)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={c.image || "https://via.placeholder.com/400x200?text=Cours"}
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
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{c.titre}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold">{c.rating || 4.5}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">{c.instructor || "Formateur"}</p>
                  <p className="text-xs text-gray-500 mb-3">{c.category}</p>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {c.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <span>👥</span>
                      <span>{c.students || Math.floor(Math.random() * 300) + 50}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📚</span>
                      <span>{c.lessons || c.curriculum?.length || 20} leçons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{c.duration || "8 sem"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600 font-bold text-xl">
                      {c.prix === 0 ? "Gratuit" : `${c.prix} DT`}
                    </span>
                    <button
                      onClick={(e) => handleEnrollCourse(c.id, e)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm"
                    >
                      S'inscrire
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