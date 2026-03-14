import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function CourseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("apercu");
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    loadCourse();
    checkEnrollment();
    loadReviews();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      try {
        const response = await axios.get(`${API_BASE}/cours/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(response.data);
      } catch (apiError) {
        console.log("API non disponible, chargement des données locales");
        
        // Chercher dans le localStorage
        const courses = JSON.parse(localStorage.getItem('courses') || '[]');
        const foundCourse = courses.find(c => c.id == id);
        
        if (foundCourse) {
          setCourse(foundCourse);
        } else {
          toast.error("Cours non trouvé");
          navigate('/cours');
        }
      }
    } catch (error) {
      console.error("Erreur chargement cours:", error);
      toast.error("❌ Erreur lors du chargement du cours");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      setIsEnrolled(enrolledCourses.includes(parseInt(id)) || enrolledCourses.includes(id));
    }
  };

  const loadReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      
      try {
        const response = await axios.get(`${API_BASE}/cours/${id}/avis`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReviews(response.data);
      } catch (apiError) {
        // Charger les avis du localStorage
        const localReviews = JSON.parse(localStorage.getItem(`reviews-${id}`) || '[]');
        setReviews(localReviews);
      }
    } catch (error) {
      console.error("Erreur chargement avis:", error);
    }
  };

  const handleEnroll = async () => {
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
        await axios.post(`${API_BASE}/cours/${id}/inscrire`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Mettre à jour localStorage
        const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        if (!enrolledCourses.includes(parseInt(id))) {
          enrolledCourses.push(parseInt(id));
          localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
        }
        
        setIsEnrolled(true);
        toast.success("✅ Inscription réussie !");
      } catch (apiError) {
        // Mode hors-ligne
        const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        if (!enrolledCourses.includes(parseInt(id))) {
          enrolledCourses.push(parseInt(id));
          localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
          setIsEnrolled(true);
          toast.success("✅ Inscription réussie (mode hors-ligne)");
        } else {
          toast.info("📚 Vous êtes déjà inscrit à ce cours");
        }
      }
    } catch (error) {
      toast.error("❌ Erreur lors de l'inscription");
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
      toast.warning("🔒 Vous devez être inscrit pour accéder aux leçons");
    }
  };

  const handleTakeQuiz = () => {
    if (isEnrolled) {
      navigate(`/quiz/cours/${id}`);
    } else {
      toast.warning("🔒 Inscrivez-vous d'abord pour accéder aux quiz");
    }
  };

  const handleSubmitReview = async () => {
    if (!isEnrolled) {
      toast.warning("🔒 Vous devez être inscrit pour laisser un avis");
      return;
    }

    if (!userReview.comment.trim()) {
      toast.error("Veuillez écrire un commentaire");
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const reviewData = {
        id: Date.now(),
        userId: user?.id,
        userName: user?.name || "Utilisateur",
        rating: userReview.rating,
        comment: userReview.comment,
        date: new Date().toISOString().split('T')[0]
      };

      try {
        await axios.post(`${API_BASE}/cours/${id}/avis`, reviewData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (apiError) {
        // Mode hors-ligne
        const allReviews = JSON.parse(localStorage.getItem(`reviews-${id}`) || '[]');
        allReviews.push(reviewData);
        localStorage.setItem(`reviews-${id}`, JSON.stringify(allReviews));
      }

      toast.success("✅ Avis publié avec succès !");
      setUserReview({ rating: 5, comment: "" });
      loadReviews(); // Recharger les avis
      
    } catch (error) {
      toast.error("❌ Erreur lors de la publication");
    } finally {
      setSubmitting(false);
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
          <span className="text-6xl mb-4 block">🔍</span>
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
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Retour"
            >
              ←
            </button>
            <Link to="/" className="text-2xl font-extrabold text-emerald-700 tracking-wider">
              Safoua Academy
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link to="/cours" className="text-gray-600 hover:text-emerald-600">Catalogue</Link>
            {!localStorage.getItem('token') ? (
              <Link to="/login" className="text-gray-600 hover:text-emerald-600">Connexion</Link>
            ) : (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate('/');
                  toast.success("👋 Déconnexion réussie");
                }}
                className="text-red-600 hover:text-red-700"
              >
                Déconnexion
              </button>
            )}
          </nav>
          <Link 
            to="/login"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
          >
            Mon compte
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Carte principale */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative h-64 bg-emerald-100">
            <img 
              alt={course.titre} 
              className="w-full h-full object-cover" 
              src={course.image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop"}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-full font-semibold">
                {course.niveau}
              </span>
              {course.certificate && (
                <span className="bg-amber-500 text-white text-sm px-4 py-2 rounded-full font-semibold">
                  🏆 Certifiant
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.titre}</h1>
                <p className="text-gray-600">Par {course.instructor}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-2xl">★</span>
                <span className="text-2xl font-bold text-gray-900">{course.rating || 4.5}</span>
                <span className="text-gray-500">({course.reviews || 0} avis)</span>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{course.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="text-sm text-gray-500">Durée</p>
                  <p className="font-semibold text-gray-900">{course.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="text-sm text-gray-500">Étudiants</p>
                  <p className="font-semibold text-gray-900">{course.students || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="text-sm text-gray-500">Modules</p>
                  <p className="font-semibold text-gray-900">{course.curriculum?.length || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                <span className="text-2xl">🌐</span>
                <div>
                  <p className="text-sm text-gray-500">Langue</p>
                  <p className="font-semibold text-gray-900">{course.language || "Français"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="text-3xl font-bold text-emerald-600">{course.prix} DT</p>
                <p className="text-sm text-gray-500">Accès à vie</p>
              </div>
              <div className="flex gap-3">
                {isEnrolled ? (
                  <>
                    <button
                      onClick={handleStartCourse}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold text-lg"
                    >
                      Continuer le cours
                    </button>
                    <button
                      onClick={handleTakeQuiz}
                      className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition font-semibold"
                    >
                      📝 Quiz
                    </button>
                  </>
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
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("apercu")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "apercu" 
                ? "text-emerald-600 border-b-2 border-emerald-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Aperçu
          </button>
          <button
            onClick={() => setActiveTab("programme")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "programme" 
                ? "text-emerald-600 border-b-2 border-emerald-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Programme
          </button>
          <button
            onClick={() => setActiveTab("avis")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "avis" 
                ? "text-emerald-600 border-b-2 border-emerald-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Avis ({reviews.length})
          </button>
        </div>

        {/* Contenu des tabs */}
        {activeTab === "apercu" && (
          <div className="space-y-6">
            {/* Objectifs */}
            {course.objectives && course.objectives.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
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
            )}

            {/* Prérequis */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
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
            )}

            {/* Informations complémentaires */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Informations complémentaires</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Dernière mise à jour</p>
                  <p className="font-semibold text-gray-900">{course.lastUpdated || "2026-01-15"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Certificat</p>
                  <p className="font-semibold text-gray-900">{course.certificate ? "Oui" : "Non"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Catégorie</p>
                  <p className="font-semibold text-gray-900">{course.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Langue</p>
                  <p className="font-semibold text-gray-900">{course.language}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "programme" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Programme du cours</h2>
            {course.curriculum && course.curriculum.length > 0 ? (
              <div className="space-y-3">
                {course.curriculum.map((module, index) => (
                  <div 
                    key={module.id || index} 
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
                        <span className="text-emerald-600">▶</span>
                      ) : (
                        <span className="text-xs text-gray-400">🔒</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Programme en cours de préparation</p>
            )}
            {!isEnrolled && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Inscrivez-vous pour accéder au contenu du cours
              </p>
            )}
          </div>
        )}

        {activeTab === "avis" && (
          <div className="space-y-6">
            {/* Formulaire d'avis */}
            {isEnrolled && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Donnez votre avis</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Note
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserReview({ ...userReview, rating: star })}
                          className={`text-3xl transition ${
                            star <= userReview.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Commentaire
                    </label>
                    <textarea
                      value={userReview.comment}
                      onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      rows="3"
                      placeholder="Partagez votre expérience..."
                    ></textarea>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                  >
                    {submitting ? "Publication..." : "Publier l'avis"}
                  </button>
                </div>
              </div>
            )}

            {/* Liste des avis */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Avis des étudiants</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{review.userName || review.user}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun avis pour le moment</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CourseDetail;