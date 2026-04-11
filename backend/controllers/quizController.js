const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Cours = require('../models/Cours');

/**
 * Récupérer l'historique des quiz d'un étudiant
 */
const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const quizResults = await QuizResult.find({ utilisateur: userId })
      .populate('quiz')
      .sort('-completedAt');
    
    const formattedResults = quizResults.map(result => ({
      id: result._id,
      title: result.quiz?.titre || 'Quiz',
      module: result.quiz?.module || 'Général',
      date: new Date(result.completedAt).toLocaleDateString('fr-FR'),
      score: result.score,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      passed: result.score >= 70,
      time: `${Math.floor(result.duration / 60)}min`
    }));
    
    res.json({
      success: true,
      data: formattedResults
    });
  } catch (error) {
    console.error('Erreur getQuizHistory:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Récupérer les quiz disponibles pour un étudiant
 */
const getAvailableQuizzes = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Récupérer les cours où l'étudiant est inscrit
    const enrolledCourses = await Cours.find({ students: userId });
    const courseIds = enrolledCourses.map(c => c._id);
    
    // Récupérer les quiz associés à ces cours
    const quizzes = await Quiz.find({
      cours: { $in: courseIds },
      isActive: true
    }).sort('-createdAt');
    
    const formattedQuizzes = quizzes.map(quiz => ({
      id: quiz._id,
      title: quiz.titre,
      module: quiz.module,
      questions: quiz.questions?.length || 10,
      duration: `${quiz.duration || 15}min`,
      difficulty: quiz.difficulty || 'Intermédiaire',
      points: quiz.points || 100
    }));
    
    res.json({
      success: true,
      data: formattedQuizzes
    });
  } catch (error) {
    console.error('Erreur getAvailableQuizzes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Soumettre un quiz
 */
const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user._id;
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz non trouvé'
      });
    }
    
    // Calculer le score
    let correctCount = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      if (answers[i] === quiz.questions[i].correctAnswer) {
        correctCount++;
      }
    }
    
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= 70;
    
    // Sauvegarder le résultat
    const quizResult = await QuizResult.create({
      utilisateur: userId,
      quiz: quizId,
      answers,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      duration: quiz.duration,
      completedAt: new Date()
    });
    
    res.json({
      success: true,
      data: {
        score,
        correctCount,
        totalQuestions: quiz.questions.length,
        passed
      },
      message: passed ? 'Quiz réussi !' : 'Quiz terminé'
    });
  } catch (error) {
    console.error('Erreur submitQuiz:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getQuizHistory,
  getAvailableQuizzes,
  submitQuiz
};