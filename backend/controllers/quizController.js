const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Cours = require('../models/Cours');
const QuizResult = require('../models/QuizResult');

/**
 * Récupérer l'historique des quiz d'un étudiant
 */
const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const quizResults = await QuizResult.find({ utilisateur: userId })
      .populate('quiz')
      .sort('-completedAt') || [];
    
    const formattedResults = (quizResults || []).map(result => ({
      id: result._id,
      title: result.quiz?.titre || 'Quiz',
      module: result.quiz?.module || 'Général',
      date: new Date(result.completedAt).toLocaleDateString('fr-FR'),
      score: result.score,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      passed: result.score >= 70,
      time: `${Math.floor((result.duration || 0) / 60)}min`
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
      _id: quiz._id,
      id: quiz._id,
      title: quiz.titre,
      module: quiz.module,
      questions: quiz.questions,
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

    // Debug info: log who is submitting and payload (helpful for reproducing 404/500)
    console.log(`➡️ POST /api/quiz/submit - user: ${userId} - quizId: ${quizId}`);
    console.log('Payload answers length:', Array.isArray(answers) ? answers.length : typeof answers);
    
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
    
    // Génération automatique du certificat si conditions réunies
    let certificatGenere = null;
    if (passed) {
      // Vérifier la progression de l'étudiant sur ce cours
      const progress = await require('../models/Progress').findOne({
        utilisateur: userId,
        cours: quiz.cours
      });
      if (progress && progress.progress === 100) {
        // Vérifier qu'il n'a pas déjà un certificat
        const Certificat = require('../models/Certificat');
        const existingCert = await Certificat.findOne({ utilisateur: userId, cours: quiz.cours });
        if (!existingCert) {
          // Générer un code unique pour le certificat
          const prefix = 'SAF';
          const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          const code = `${prefix}-${date}-${random}`;
          
          // Générer le certificat
          certificatGenere = await Certificat.create({
            utilisateur: userId,
            cours: quiz.cours,
            code,
            score,
            dateDelivrance: new Date()
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        score,
        correctCount,
        totalQuestions: quiz.questions.length,
        passed,
        certificat: certificatGenere
      },
      message: passed ? 'Quiz réussi !' : 'Quiz terminé'
    });
  } catch (error) {
    // Log full error server-side
    console.error('Erreur submitQuiz:', error);

    // Return more detailed error in development for easier debugging
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({
        success: false,
        message: error.message,
        stack: error.stack
      });
    }

    // In production, avoid leaking stack traces
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Créer un nouveau quiz pour un cours
 */
const createQuiz = async (req, res) => {
  try {
    const { titre, cours, module, questions, duration, difficulty, points, isActive, passingScore } = req.body;
    const quiz = await Quiz.create({
      titre,
      cours,
      module,
      questions,
      duration,
      difficulty,
      points,
      isActive,
      passingScore
    });
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mettre à jour un quiz existant
 */
const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const updates = req.body;
    const quiz = await Quiz.findByIdAndUpdate(quizId, updates, { new: true });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz non trouvé' });
    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Supprimer un quiz
 */
const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findByIdAndDelete(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz non trouvé' });
    res.json({ success: true, message: 'Quiz supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lister les quiz d'un cours
 */
const listQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await Quiz.find({ cours: courseId });
    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Obtenir un quiz par ID
 */
const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz non trouvé' });
    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuizHistory,
  getAvailableQuizzes,
  submitQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  listQuizzesByCourse,
  getQuizById
};