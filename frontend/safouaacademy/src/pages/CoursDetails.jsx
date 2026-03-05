import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";

function CourseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    loadCourse();
    checkEnrollment();
  }, [id]);

  const loadCourse = async () => {
    try {
      // Simuler un appel API
      setTimeout(() => {
        setCourse({
          id: parseInt(id) || 1,
          title: "Tajwid Avancé",
          instructor: "Cheikh Ahmed Al-Mansouri",
          level: "Expert",
          description: "Maîtrisez les règles avancées du Tajwid pour une récitation parfaite du Coran. Ce cours approfondit les subtilités de la prononciation arabe et les règles de récitation.",
          rating: 4.9,
          reviews: 234,
          duration: "8 semaines",
          students: 234,
          modules: 4,
          price: 89,
          image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop",
          objectives: [
            "Comprendre les règles complexes du Tajwid",
            "Améliorer la prononciation des lettres arabes",
            "Maîtriser les pauses et les arrêts",
            "Appliquer les règles dans la récitation"
          ],
          prerequisites: [
            "Niveau intermédiaire en arabe",
            "Connaissance de base du Tajwid"
          ],
          curriculum: [
            { id: 1, title: "Introduction au Tajwid", lessons: 5, duration: "2h" },
            { id: 2, title: "Les règles de prononciation", lessons: 8, duration: "4h" },
            { id: 3, title: "Les pauses et arrêts", lessons: 6, duration: "3h" },
            { id: 4, title: "Pratique avancée", lessons: 10, duration: "6h" }
          ]
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erreur chargement cours:", error);
      setLoading(false);
    }
  };

  const checkEnrollment = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      // Vérifier si l'utilisateur est inscrit
      const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      setIsEnrolled(enrolledCourses.includes(parseInt(id)));
    }
  };

  const handleEnroll = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }

    // Simuler l'inscription
    const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    if (!enrolledCourses.includes(parseInt(id))) {
      enrolledCourses.push(parseInt(id));
      localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
      setIsEnrolled(true);
      alert("Inscription réussie !");
    }
  };

  const handleStartCourse = () => {
    if (course.curriculum && course.curriculum.length > 0) {
      navigate(`/cours/${id}/lecon/${course.curriculum[0].id}`);
    }
  };

  const handleModuleClick = (moduleId) => {
    if (isEnrolled) {
      navigate(`/cours/${id}/lecon/${moduleId}`);
    } else {
      alert("Vous devez être inscrit pour accéder aux leçons");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cours non trouvé</h2>
          <Link to="/cours" className="text-emerald-600 hover:underline">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              ←
            </button>
            <Link to="/" className="text-2xl font-extrabold text-emerald-700 tracking-wider">
              Safoua Academy
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link to="/cours" className="text-gray-600 hover:text-emerald-600">Catalogue</Link>
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Carte principale */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative h-64 bg-emerald-100">
            <img 
              alt={course.title} 
              className="w-full h-full object-cover" 
              src={course.image}
            />
            <div className="absolute top-4 left-4">
              <span className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-full font-semibold">
                {course.level}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600">Par {course.instructor}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-2xl">★</span>
                <span className="text-2xl font-bold text-gray-900">{course.rating}</span>
                <span className="text-gray-500">({course.reviews})</span>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{course.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span>⏱️</span>
                <div>
                  <p className="text-sm text-gray-500">Durée</p>
                  <p className="font-semibold text-gray-900">{course.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>👥</span>
                <div>
                  <p className="text-sm text-gray-500">Étudiants</p>
                  <p className="font-semibold text-gray-900">{course.students}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>📚</span>
                <div>
                  <p className="text-sm text-gray-500">Modules</p>
                  <p className="font-semibold text-gray-900">{course.modules}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="text-3xl font-bold text-emerald-600">€{course.price}</p>
                <p className="text-sm text-gray-500">Prix unique</p>
              </div>
              {isEnrolled ? (
                <button
                  onClick={handleStartCourse}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold text-lg"
                >
                  Continuer le cours
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold text-lg"
                >
                  S'inscrire maintenant
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Objectifs */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Objectifs d'apprentissage</h2>
          <ul className="space-y-2">
            {course.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-emerald-600 text-lg">✓</span>
                <span className="text-gray-700">{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prérequis */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Prérequis</h2>
          <ul className="space-y-2">
            {course.prerequisites.map((prerequisite, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-emerald-600 text-lg">📋</span>
                <span className="text-gray-700">{prerequisite}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Programme */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Programme du cours</h2>
          <div className="space-y-3">
            {course.curriculum.map((module, index) => (
              <div 
                key={module.id} 
                className={`border border-gray-200 rounded-lg p-4 transition ${
                  isEnrolled ? 'hover:shadow-md cursor-pointer' : 'opacity-75'
                }`}
                onClick={() => handleModuleClick(module.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{module.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{module.lessons} leçons</span>
                        <span>{module.duration}</span>
                      </div>
                    </div>
                  </div>
                  {isEnrolled ? (
                    <span className="text-gray-400">→</span>
                  ) : (
                    <span className="text-xs text-gray-400">🔒</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!isEnrolled && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Inscrivez-vous pour accéder au contenu du cours
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default CourseDetail;