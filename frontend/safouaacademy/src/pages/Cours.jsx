import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Cours() {
  const navigate = useNavigate();
  const [cours, setCours] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    search: ""
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    // Appliquer les filtres
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
        c.description?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredCourses(filtered);
  }, [filters, cours]);

  const loadCourses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/cours/courslist");
      const coursesData = response.data.data || [];
      
      // Ajouter des catégories et niveaux pour le filtrage
      const enrichedData = coursesData.map((c, index) => ({
        ...c,
        id: c._id || index + 1,
        category: getCategoryFromTitle(c.titre),
        niveau: c.niveau || getLevelFromTitle(c.titre),
        price: c.prix || Math.floor(Math.random() * 100) + 50,
        students: Math.floor(Math.random() * 300) + 50,
        rating: (Math.random() * 1 + 4).toFixed(1)
      }));
      
      setCours(enrichedData);
      setFilteredCourses(enrichedData);
    } catch (error) {
      console.error("Erreur chargement cours:", error);
      // Données de secours
      const mockData = [
        {
          id: 1,
          titre: "Tajwid Avancé",
          description: "Maîtrisez les règles avancées du Tajwid",
          category: "Coran",
          niveau: "Expert",
          prix: 89,
          image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop",
          students: 234,
          rating: 4.9
        },
        {
          id: 2,
          titre: "Arabe Classique",
          description: "Apprenez l'arabe classique depuis les bases",
          category: "Langue",
          niveau: "Débutant",
          prix: 99,
          image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop",
          students: 456,
          rating: 4.8
        },
        {
          id: 3,
          titre: "Fiqh et Usul",
          description: "Les fondements de la jurisprudence islamique",
          category: "Jurisprudence",
          niveau: "Intermédiaire",
          prix: 79,
          image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop",
          students: 189,
          rating: 4.7
        }
      ];
      setCours(mockData);
      setFilteredCourses(mockData);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromTitle = (title) => {
    if (title.includes("Tajwid") || title.includes("Coran")) return "Coran";
    if (title.includes("Arabe") || title.includes("Grammaire")) return "Langue";
    if (title.includes("Fiqh") || title.includes("Jurisprudence")) return "Jurisprudence";
    if (title.includes("Histoire")) return "Histoire";
    return "Autre";
  };

  const getLevelFromTitle = (title) => {
    if (title.includes("Avancé") || title.includes("Expert")) return "Expert";
    if (title.includes("Intermédiaire")) return "Intermédiaire";
    return "Débutant";
  };

  const handleViewCourse = (courseId) => {
    navigate(`/cours/${courseId}`);
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
      search: ""
    });
  };

  const categories = ["Toutes", "Coran", "Langue", "Jurisprudence", "Histoire"];
  const levels = ["Tous", "Débutant", "Intermédiaire", "Expert"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-emerald-600">Accueil</Link>
            <Link to="/cours" className="text-emerald-600 font-semibold">Catalogue</Link>
            <Link to="/login" className="text-gray-600 hover:text-emerald-600">Connexion</Link>
          </nav>
          
          <Link 
            to="/login"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
          >
            Se connecter
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Nos Cours Disponibles</h1>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Titre du cours..."
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
                {categories.map(cat => (
                  <option key={cat} value={cat === "Toutes" ? "" : cat}>{cat}</option>
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
                {levels.map(level => (
                  <option key={level} value={level === "Tous" ? "" : level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {(filters.category || filters.level || filters.search) && (
            <div className="mt-4 text-right">
              <button
                onClick={resetFilters}
                className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
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
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition cursor-pointer"
                onClick={() => handleViewCourse(c.id)}
              >
                <img
                  src={c.image || "https://via.placeholder.com/400x200"}
                  alt={c.titre}
                  className="w-full h-48 object-cover"
                />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{c.titre}</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold">{c.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {c.description}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                      {c.category}
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs">
                      {c.niveau}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <span>👥</span>
                      <span>{c.students}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600 font-bold text-xl">
                      {c.prix === 0 ? "Gratuit" : `${c.prix} DT`}
                    </span>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm">
                      Voir Détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">Aucun cours trouvé</p>
            <button
              onClick={resetFilters}
              className="mt-4 text-emerald-600 font-semibold hover:underline"
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