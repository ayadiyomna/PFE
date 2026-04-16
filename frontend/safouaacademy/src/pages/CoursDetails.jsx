import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import coursService from "../services/coursService";
import authService from "../services/authService";
import api from "../services/api";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = authService.getCurrentUser();
    setIsAuthenticated(!!token);
    setUser(userData);

    loadCourse();
    loadReviews();
    loadProgress();
  }, [id]);

  useEffect(() => {
    if (course && user) {
      checkEnrollment();
    }
  }, [course, user]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const result = await coursService.getCoursById(id);

      if (result.success) {
        setCourse(result.data);
      } else {
        navigate("/cours");
      }
    } catch (error) {
      console.error("Erreur chargement cours:", error);
      navigate("/cours");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!isAuthenticated || !user || !course) return;

    try {
      const isUserEnrolled = course.students?.some((s) => {
        const studentId = s._id ? s._id.toString() : s.toString();
        return (
          studentId === user.id?.toString() ||
          studentId === user._id?.toString()
        );
      });
      setIsEnrolled(isUserEnrolled);
    } catch (error) {
      console.error("Erreur vérification inscription:", error);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await api.get(`/cours/${id}/avis`);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error("Erreur chargement avis:", error);
    }
  };

  const loadProgress = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get(`/progress/cours/${id}`);
      setProgress(response.data.data?.progress || 0);
    } catch (error) {
      console.error("Erreur chargement progression:", error);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const result = await coursService.enrollToCours(id);
      if (result.success) {
        setIsEnrolled(true);
        loadCourse();
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
    }
  };

  const handleCheckout = async () => {
    if (!course) return;

    try {
      const response = await fetch(
        "http://localhost:5000/api/payment/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ course }),
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Stripe URL introuvable:", data);
      }
    } catch (error) {
      console.error("Payment Error:", error);
    }
  };

  const handleStartCourse = () => {
    if (course?.modules && course.modules.length > 0) {
      const firstLessonId = course.modules[0]?.lecons?.[0]?._id;
      if (firstLessonId) {
        navigate(`/cours/${id}/lecon/${firstLessonId}`);
      } else {
        navigate(`/cours/${id}/lecon/1`);
      }
    }
  };

  const handleModuleClick = (moduleIndex, lessonIndex) => {
    if (isEnrolled) {
      const lessonId = course?.modules[moduleIndex]?.lecons?.[lessonIndex]?._id;
      if (lessonId) {
        navigate(`/cours/${id}/lecon/${lessonId}`);
      }
    }
  };

  const handleTakeQuiz = () => {
    if (isEnrolled) {
      navigate(`/quiz/cours/${id}`);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!userReview.comment.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/cours/${id}/avis`, {
        note: userReview.rating,
        commentaire: userReview.comment,
      });

      setUserReview({ rating: 5, comment: "" });
      loadReviews();
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
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
            <Link to="/cours" className="text-gray-600 hover:text-emerald-600">
              Catalogue
            </Link>
            {!isAuthenticated ? (
              <Link to="/login" className="text-gray-600 hover:text-emerald-600">
                Connexion
              </Link>
            ) : (
              <button
                onClick={() => {
                  authService.logout();
                  navigate("/");
                }}
                className="text-red-600 hover:text-red-700"
              >
                Déconnexion
              </button>
            )}
          </nav>

          {isAuthenticated ? (
            <button
              onClick={() => navigate("/etudiant")}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              Mon compte
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              Se connecter
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative h-64 bg-emerald-100">
            <img
              alt={course.titre}
              className="w-full h-full object-cover"
              src={
                course.image ||
                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop"
              }
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-full font-semibold">
                {course.niveau}
              </span>
              {course.certificat && (
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
                <p className="text-gray-600">
                  Par {course.instructeur?.prenom} {course.instructeur?.nom}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-2xl">★</span>
                <span className="text-2xl font-bold text-gray-900">
                  {course.rating || 4.5}
                </span>
                <span className="text-gray-500">({course.nombreAvis || 0} avis)</span>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{course.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="text-sm text-gray-500">Durée</p>
                  <p className="font-semibold text-gray-900">
                    {Math.floor((course.dureeTotale || 0) / 60)}h{" "}
                    {(course.dureeTotale || 0) % 60}min
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="text-sm text-gray-500">Étudiants</p>
                  <p className="font-semibold text-gray-900">
                    {course.students?.length || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="text-sm text-gray-500">Modules</p>
                  <p className="font-semibold text-gray-900">
                    {course.modules?.length || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                <span className="text-2xl">🌐</span>
                <div>
                  <p className="text-sm text-gray-500">Langue</p>
                  <p className="font-semibold text-gray-900">
                    {course.langue || "Français"}
                  </p>
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
                      {progress > 0 ? `Continuer (${progress}%)` : "Commencer le cours"}
                    </button>
                    <button
                      onClick={handleTakeQuiz}
                      className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition font-semibold"
                    >
                      📝 Quiz
                    </button>
                  </>
                ) : course.prix === 0 ? (
                  <button
                    onClick={handleEnroll}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold text-lg"
                  >
                    S'inscrire maintenant
                  </button>
                ) : (
                  <button
                    onClick={handleCheckout}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold text-lg"
                  >
                    Acheter le cours
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

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

        {activeTab === "apercu" && (
          <div className="space-y-6">
            {course.objectifs && course.objectifs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Objectifs d'apprentissage
                </h2>
                <ul className="space-y-2">
                  {course.objectifs.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-emerald-600 text-lg">✓</span>
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.prerequis && course.prerequis.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Prérequis</h2>
                <ul className="space-y-2">
                  {course.prerequis.map((prerequisite, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-emerald-600 text-lg">📋</span>
                      <span className="text-gray-700">{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Informations complémentaires
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Dernière mise à jour</p>
                  <p className="font-semibold text-gray-900">
                    {course.updatedAt
                      ? new Date(course.updatedAt).toLocaleDateString("fr-FR")
                      : "2026-01-15"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Certificat</p>
                  <p className="font-semibold text-gray-900">
                    {course.certificat ? "Oui" : "Non"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Catégorie</p>
                  <p className="font-semibold text-gray-900">{course.categorie}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Langue</p>
                  <p className="font-semibold text-gray-900">
                    {course.langue || "Français"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "programme" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Programme du cours</h2>

            {course.modules && course.modules.length > 0 ? (
              <div className="space-y-3">
                {course.modules.map((module, moduleIndex) => (
                  <div
                    key={moduleIndex}
                    className={`border border-gray-200 rounded-lg p-4 transition ${
                      isEnrolled ? "hover:shadow-md cursor-pointer" : "opacity-75"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                          {moduleIndex + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{module.titre}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>{module.lecons?.length || 0} leçons</span>
                            <span>{module.duree || 0} min</span>
                          </div>
                        </div>
                      </div>
                      {isEnrolled && <span className="text-emerald-600">▶</span>}
                    </div>

                    {module.lecons && module.lecons.length > 0 && (
                      <div className="ml-14 space-y-2 mt-2">
                        {module.lecons.map((lecon, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            onClick={() => handleModuleClick(moduleIndex, lessonIndex)}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-sm">📖</span>
                              <span className="text-sm text-gray-700">{lecon.titre}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {lecon.duree || 0} min
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Programme en cours de préparation
              </p>
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
            {isEnrolled && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Donnez votre avis
                </h2>
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
                          onClick={() =>
                            setUserReview({ ...userReview, rating: star })
                          }
                          className={`text-3xl transition ${
                            star <= userReview.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
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
                      onChange={(e) =>
                        setUserReview({ ...userReview, comment: e.target.value })
                      }
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

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Avis des étudiants
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="border-b border-gray-100 pb-4 last:border-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {review.utilisateur?.prenom} {review.utilisateur?.nom}
                          </span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={i < review.note ? "text-yellow-400" : "text-gray-300"}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.commentaire}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aucun avis pour le moment
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CourseDetail;