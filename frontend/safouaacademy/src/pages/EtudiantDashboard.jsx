import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function EtudiantDashboard() {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    language: ""
  });

  const courses = [
    {
      id: 1,
      title: "Tajwid Avancé",
      category: "Coran",
      level: "Expert",
      language: "Français",
      rating: 4.9,
      students: 234,
      duration: "8 semaines",
      price: 89,
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop",
      instructor: "Cheikh Ahmed Al-Mansouri",
      description: "Maîtrisez les règles avancées du Tajwid"
    },
    {
      id: 2,
      title: "Arabe Classique",
      category: "Langue",
      level: "Débutant",
      language: "Français",
      rating: 4.8,
      students: 456,
      duration: "12 semaines",
      price: 99,
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop",
      instructor: "Dr. Fatima Zahra",
      description: "Apprenez l'arabe classique depuis les bases"
    },
    {
      id: 3,
      title: "Fiqh et Usul",
      category: "Jurisprudence",
      level: "Intermédiaire",
      language: "Arabe",
      rating: 4.7,
      students: 189,
      duration: "10 semaines",
      price: 79,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop",
      instructor: "Cheikh Mohammed Al-Hassan",
      description: "Les fondements de la jurisprudence islamique"
    }
  ];

  const categories = ["Toutes", "Coran", "Langue", "Jurisprudence", "Histoire"];
  const levels = ["Tous", "Débutant", "Intermédiaire", "Expert"];
  const languages = ["Toutes", "Français", "Arabe", "Anglais"];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === "Toutes" || value === "Tous" ? "" : value
    }));
  };

  const filteredCourses = courses.filter(course => {
    const matchCategory = !filters.category || course.category === filters.category;
    const matchLevel = !filters.level || course.level === filters.level;
    const matchLanguage = !filters.language || course.language === filters.language;
    return matchCategory && matchLevel && matchLanguage;
  });

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
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/catalogue" className="text-emerald-600 font-semibold">
              Catalogue
            </Link>
            <Link to="/mes-cours" className="text-gray-600 hover:text-emerald-600">
              Mes cours
            </Link>
            <Link to="/progression" className="text-gray-600 hover:text-emerald-600">
              Progression
            </Link>
          </nav>
          
          <button 
            onClick={() => navigate('/compte')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
          >
            Mon compte
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Catalogue des cours</h1>
          <p className="text-gray-600 mt-2 md:mt-0">
            {filteredCourses.length} cours disponibles
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-emerald-600">🔍</span>
            <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
            
            {(filters.category || filters.level || filters.language) && (
              <button 
                onClick={() => setFilters({ category: "", level: "", language: "" })}
                className="ml-auto text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Réinitialiser
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catégorie
              </label>
              <select 
                name="category"
                value={filters.category || "Toutes"}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
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
                value={filters.level || "Tous"}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Langue
              </label>
              <select 
                name="language"
                value={filters.language || "Toutes"}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition cursor-pointer"
                onClick={() => handleViewCourse(course.id)}
              >
                <div className="relative h-48 bg-emerald-100 overflow-hidden">
                  <img 
                    alt={course.title} 
                    className="w-full h-full object-cover hover:scale-105 transition duration-300" 
                    src={course.image}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {course.level}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold text-gray-900">{course.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
                  <p className="text-xs text-gray-500 mb-3">{course.category}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>👥</span>
                      <span>{course.students}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600 font-bold text-xl">€{course.price}</span>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm">
                      Voir le cours
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
              onClick={() => setFilters({ category: "", level: "", language: "" })}
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

export default EtudiantDashboard;