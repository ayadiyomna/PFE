import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function ProgressQuizPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("progression");

  const progressData = {
    overall: 64,
    completedLessons: 13,
    totalLessons: 29,
    timeSpent: "8h 30min",
    successfulQuizzes: 5,
    averageScore: 87,
    modules: [
      { id: 1, name: "Introduction au Tajwid", progress: 100, completed: true },
      { id: 2, name: "Les règles de prononciation", progress: 75, completed: false },
      { id: 3, name: "Les pauses et arrêts", progress: 0, completed: false },
      { id: 4, name: "Pratique avancée", progress: 0, completed: false }
    ]
  };

  const quizData = [
    { 
      id: 1, 
      title: "Quiz : Introduction au Tajwid", 
      module: "Introduction au Tajwid",
      date: "15/03/2026", 
      score: 90, 
      totalQuestions: 10,
      passed: true,
      time: "12min"
    },
    { 
      id: 2, 
      title: "Quiz : Règles de base", 
      module: "Les règles de prononciation",
      date: "12/03/2026", 
      score: 75, 
      totalQuestions: 8,
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
      passed: false,
      time: "15min"
    }
  ];

  const availableQuizzes = [
    { id: 5, title: "Quiz : Les pauses et arrêts", module: "Les pauses et arrêts", questions: 10, duration: "15min" },
    { id: 6, title: "Quiz : Pratique avancée", module: "Pratique avancée", questions: 15, duration: "20min" }
  ];

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const handleReviewQuiz = (quizId) => {
    navigate(`/quiz/revision/${quizId}`);
  };

  const circumference = 2 * Math.PI * 56;
  const strokeDashoffset = circumference - (progressData.overall / 100) * circumference;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/catalogue" className="text-gray-600 hover:text-emerald-600">Catalogue</Link>
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

        {activeTab === "progression" ? (
          <div className="space-y-6">
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

                <div className="grid grid-cols-2 gap-4 flex-1">
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
            </div>

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
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Historique des quiz</h2>
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
                        </div>
                        <button 
                          onClick={() => handleReviewQuiz(quiz.id)}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-semibold"
                        >
                          👁️ Revoir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                          <span>❓ {quiz.questions} questions</span>
                          <span>⏱️ {quiz.duration}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleStartQuiz(quiz.id)}
                        className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm"
                      >
                        ▶️ Commencer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques</h2>
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
                    {Math.round(quizData.reduce((acc, q) => acc + q.score, 0) / quizData.length)}%
                  </p>
                  <p className="text-sm text-gray-600">Moyenne</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-600">45min</p>
                  <p className="text-sm text-gray-600">Temps total</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProgressQuizPage;