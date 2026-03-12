import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function ProgressQuizPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("progression");
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({
    overall: 0,
    completedLessons: 0,
    totalLessons: 0,
    timeSpent: "0h",
    successfulQuizzes: 0,
    averageScore: 0,
    modules: [],
    streak: 0,
    lastActive: null
  });

  const [quizData, setQuizData] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizResult, setQuizResult] = useState(null);

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    loadProgressData();
    loadQuizHistory();
    loadAvailableQuizzes();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      try {
        const response = await axios.get(`${API_BASE}/etudiant/progression`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProgressData(response.data);
      } catch (apiError) {
        console.log("API non disponible, calcul depuis localStorage");
        
        // Calculer la progression depuis localStorage
        const enrolledIds = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        const lessonsProgress = JSON.parse(localStorage.getItem('lesson-progress') || '{}');
        const quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
        
        // Compter les leçons complétées
        const completedLessons = Object.values(lessonsProgress).filter(v => v === true).length;
        
        // Calculer le score moyen des quiz
        const avgScore = quizResults.length > 0
          ? Math.round(quizResults.reduce((acc, q) => acc + q.score, 0) / quizResults.length)
          : 0;

        // Données simulées
        setProgressData({
          overall: Math.round((completedLessons / 30) * 100) || 64,
          completedLessons: completedLessons || 13,
          totalLessons: 29,
          timeSpent: "8h 30min",
          successfulQuizzes: quizResults.filter(q => q.score >= 70).length || 2,
          averageScore: avgScore || 87,
          streak: 5,
          lastActive: "2026-03-15",
          modules: [
            { id: 1, name: "Introduction au Tajwid", progress: 100, completed: true, lessons: 5, completedLessons: 5 },
            { id: 2, name: "Les règles de prononciation", progress: 75, completed: false, lessons: 8, completedLessons: 6 },
            { id: 3, name: "Les pauses et arrêts", progress: 0, completed: false, lessons: 6, completedLessons: 0 },
            { id: 4, name: "Pratique avancée", progress: 0, completed: false, lessons: 10, completedLessons: 0 }
          ]
        });
      }
    } catch (error) {
      console.error("Erreur chargement progression:", error);
      toast.error("❌ Erreur lors du chargement de la progression");
    } finally {
      setLoading(false);
    }
  };

  const loadQuizHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      
      try {
        const response = await axios.get(`${API_BASE}/etudiant/quiz/historique`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuizData(response.data);
      } catch (apiError) {
        // Données simulées
        const mockQuizData = [
          { 
            id: 1, 
            title: "Quiz : Introduction au Tajwid", 
            module: "Introduction au Tajwid",
            date: "15/03/2026", 
            score: 90, 
            totalQuestions: 10,
            correctAnswers: 9,
            passed: true,
            time: "12min",
            questions: [
              { question: "Question 1", userAnswer: "A", correctAnswer: "A", correct: true },
              { question: "Question 2", userAnswer: "B", correctAnswer: "B", correct: true },
              { question: "Question 3", userAnswer: "C", correctAnswer: "A", correct: false }
            ]
          },
          { 
            id: 2, 
            title: "Quiz : Règles de base", 
            module: "Les règles de prononciation",
            date: "12/03/2026", 
            score: 75, 
            totalQuestions: 8,
            correctAnswers: 6,
            passed: true,
            time: "10min"
          },
          { 
            id: 3, 
            title: "Quiz : Prononciation avancée", 
            module: "Les règles de prononciation",
            date: "10/03/2026", 
            score: 60, 
            totalQuestions: 12,
            correctAnswers: 7,
            passed: false,
            time: "15min"
          }
        ];
        setQuizData(mockQuizData);
      }
    } catch (error) {
      console.error("Erreur chargement historique quiz:", error);
    }
  };

  const loadAvailableQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      
      try {
        const response = await axios.get(`${API_BASE}/etudiant/quiz/disponibles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableQuizzes(response.data);
      } catch (apiError) {
        // Données simulées
        setAvailableQuizzes([
          { 
            id: 5, 
            title: "Quiz : Les pauses et arrêts", 
            module: "Les pauses et arrêts", 
            questions: 10, 
            duration: "15min",
            difficulty: "Intermédiaire",
            points: 100
          },
          { 
            id: 6, 
            title: "Quiz : Pratique avancée", 
            module: "Pratique avancée", 
            questions: 15, 
            duration: "20min",
            difficulty: "Avancé",
            points: 150
          },
          { 
            id: 7, 
            title: "Quiz : Révision générale", 
            module: "Tous les modules", 
            questions: 25, 
            duration: "30min",
            difficulty: "Expert",
            points: 250
          }
        ]);
      }
    } catch (error) {
      console.error("Erreur chargement quiz disponibles:", error);
    }
  };

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizModal(true);
    setCurrentQuestion(0);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    // Simulation de correction
    const totalQuestions = selectedQuiz.questions || 10;
    const correctCount = Math.floor(Math.random() * (totalQuestions - 5)) + 5; // Simulation
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 70;

    setQuizResult({
      score,
      correctCount,
      totalQuestions,
      passed,
      answers: quizAnswers
    });

    // Sauvegarder le résultat
    const newResult = {
      id: Date.now(),
      title: selectedQuiz.title,
      module: selectedQuiz.module,
      date: new Date().toLocaleDateString('fr-FR'),
      score,
      totalQuestions,
      correctCount,
      passed,
      time: selectedQuiz.duration
    };

    const updatedQuizData = [...quizData, newResult];
    setQuizData(updatedQuizData);
    localStorage.setItem('quizResults', JSON.stringify(updatedQuizData));

    if (passed) {
      toast.success(`🎉 Félicitations ! Score: ${score}%`);
    } else {
      toast.warning(`📝 Score: ${score}% - Vous pouvez réessayer`);
    }
  };

  const handleCloseQuizModal = () => {
    setShowQuizModal(false);
    setSelectedQuiz(null);
    setQuizResult(null);
  };

  const handleRetryQuiz = (quizId) => {
    const quiz = availableQuizzes.find(q => q.id === quizId);
    if (quiz) {
      handleStartQuiz(quiz);
    }
  };

  const handleReviewQuiz = (quizId) => {
    navigate(`/quiz/revision/${quizId}`);
  };

  const circumference = 2 * Math.PI * 56;
  const strokeDashoffset = circumference - (progressData.overall / 100) * circumference;

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

      {/* Modal Quiz */}
      {showQuizModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedQuiz.title}</h3>
                <button
                  onClick={handleCloseQuizModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {!quizResult ? (
                <>
                  <div className="mb-4 p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-emerald-700">
                      Question {currentQuestion + 1} sur {selectedQuiz.questions}
                    </p>
                    <p className="text-lg font-semibold mt-2">
                      Question exemple {currentQuestion + 1}
                    </p>
                    <div className="mt-4 space-y-2">
                      {['A', 'B', 'C', 'D'].map((option, index) => (
                        <label
                          key={index}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                            quizAnswers[currentQuestion] === index
                              ? 'border-emerald-600 bg-emerald-50'
                              : 'border-gray-200 hover:border-emerald-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="answer"
                            value={index}
                            checked={quizAnswers[currentQuestion] === index}
                            onChange={() => handleAnswerSelect(currentQuestion, index)}
                            className="sr-only"
                          />
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            quizAnswers[currentQuestion] === index
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-gray-300'
                          }`}>
                            {option}
                          </span>
                          <span>Option de réponse {option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        currentQuestion === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      ← Précédent
                    </button>
                    
                    {currentQuestion === selectedQuiz.questions - 1 ? (
                      <button
                        onClick={handleSubmitQuiz}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
                      >
                        Terminer
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestion(currentQuestion + 1)}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
                      >
                        Suivant →
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className={`text-6xl mb-4 ${quizResult.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {quizResult.passed ? '🎉' : '📚'}
                  </div>
                  <h4 className="text-2xl font-bold mb-2">
                    {quizResult.passed ? 'Félicitations !' : 'Quiz terminé'}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Score: {quizResult.score}% ({quizResult.correctCount}/{quizResult.totalQuestions})
                  </p>
                  
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full ${quizResult.passed ? 'bg-emerald-600' : 'bg-amber-600'}`}
                      style={{ width: `${quizResult.score}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={handleCloseQuizModal}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/catalogue" className="text-gray-600 hover:text-emerald-600">Catalogue</Link>
            <Link to="/etudiant" className="text-gray-600 hover:text-emerald-600">Mes cours</Link>
            <Link to="/progression" className="text-emerald-600 font-semibold">Progression</Link>
            <Link to="/certificats" className="text-gray-600 hover:text-emerald-600">Certificats</Link>
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
        
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setActiveTab("progression")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "progression" 
                ? "bg-emerald-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Progression
          </button>
          <button 
            onClick={() => setActiveTab("quiz")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "quiz" 
                ? "bg-emerald-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Quiz & Résultats
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {activeTab === "progression" ? (
              <div className="space-y-6">
                {/* Progression globale */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Progression globale</h1>
                  
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <svg className="transform -rotate-90 w-32 h-32">
                        <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                        <circle 
                          cx="64" cy="64" r="56" 
                          stroke="#10b981" strokeWidth="12" fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-emerald-600">{progressData.overall}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Leçons complétées</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {progressData.completedLessons}/{progressData.totalLessons}
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Temps passé</p>
                        <p className="text-2xl font-bold text-emerald-600">{progressData.timeSpent}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Quiz réussis</p>
                        <p className="text-2xl font-bold text-emerald-600">{progressData.successfulQuizzes}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Score moyen</p>
                        <p className="text-2xl font-bold text-emerald-600">{progressData.averageScore}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🔥</span>
                        <div>
                          <p className="font-semibold text-amber-800">Série actuelle</p>
                          <p className="text-sm text-amber-600">{progressData.streak} jours consécutifs</p>
                        </div>
                      </div>
                      <p className="text-sm text-amber-600">Dernière activité: {progressData.lastActive}</p>
                    </div>
                  </div>
                </div>

                {/* Progression par module */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Progression par module</h2>
                  <div className="space-y-4">
                    {progressData.modules.map((module) => (
                      <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {module.completed && <span className="text-emerald-600">✓</span>}
                            <h3 className="font-semibold text-gray-900">{module.name}</h3>
                          </div>
                          <span className="text-sm font-semibold text-emerald-600">{module.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600 transition-all" 
                            style={{ width: `${module.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>{module.completedLessons}/{module.lessons} leçons</span>
                          {module.progress === 100 && (
                            <span className="text-emerald-600">Complété ✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Historique des quiz */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Historique des quiz</h2>
                  {quizData.length > 0 ? (
                    <div className="space-y-3">
                      {quizData.map((quiz) => (
                        <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  quiz.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {quiz.passed ? 'Réussi' : 'Échoué'}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <span>{quiz.module}</span>
                                <span>📅 {quiz.date}</span>
                                <span>⏱️ {quiz.time}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${quiz.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {quiz.score}%
                                </div>
                                <p className="text-xs text-gray-500">{quiz.correctAnswers}/{quiz.totalQuestions}</p>
                              </div>
                              <button 
                                onClick={() => handleReviewQuiz(quiz.id)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-semibold"
                              >
                                👁️ Revoir
                              </button>
                              {!quiz.passed && (
                                <button 
                                  onClick={() => handleRetryQuiz(quiz.id)}
                                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-semibold"
                                >
                                  🔄 Réessayer
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Aucun quiz effectué</p>
                  )}
                </div>

                {/* Quiz disponibles */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz disponibles</h2>
                  <div className="space-y-3">
                    {availableQuizzes.map((quiz) => (
                      <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-emerald-50/30">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span>{quiz.module}</span>
                              <span className="flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${
                                  quiz.difficulty === 'Débutant' ? 'bg-green-500' :
                                  quiz.difficulty === 'Intermédiaire' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></span>
                                {quiz.difficulty}
                              </span>
                              <span>❓ {quiz.questions} questions</span>
                              <span>⏱️ {quiz.duration}</span>
                              <span>⭐ {quiz.points} points</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleStartQuiz(quiz)}
                            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm"
                          >
                            ▶️ Commencer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistiques détaillées */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques détaillées</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-emerald-600">{quizData.length}</p>
                      <p className="text-sm text-gray-600">Quiz tentés</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-emerald-600">
                        {quizData.filter(q => q.passed).length}
                      </p>
                      <p className="text-sm text-gray-600">Réussis</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-emerald-600">
                        {quizData.length > 0 
                          ? Math.round(quizData.reduce((acc, q) => acc + q.score, 0) / quizData.length)
                          : 0}%
                      </p>
                      <p className="text-sm text-gray-600">Moyenne</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-emerald-600">
                        {quizData.reduce((acc, q) => {
                          const minutes = parseInt(q.time) || 0;
                          return acc + minutes;
                        }, 0)}min
                      </p>
                      <p className="text-sm text-gray-600">Temps total</p>
                    </div>
                  </div>

                  {quizData.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Performance par module</h3>
                      <div className="space-y-2">
                        {['Introduction au Tajwid', 'Les règles de prononciation'].map((module, idx) => {
                          const moduleQuizzes = quizData.filter(q => q.module === module);
                          const avgScore = moduleQuizzes.length > 0
                            ? Math.round(moduleQuizzes.reduce((acc, q) => acc + q.score, 0) / moduleQuizzes.length)
                            : 0;
                          
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 w-48">{module}</span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${avgScore >= 70 ? 'bg-emerald-600' : 'bg-amber-600'}`}
                                  style={{ width: `${avgScore}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-700 w-12">{avgScore}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ProgressQuizPage;