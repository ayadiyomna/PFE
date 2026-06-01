const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const quizController = require('../controllers/quizController');


// Routes protégées
router.get('/historique', protect, quizController.getQuizHistory);
router.get('/disponibles', protect, quizController.getAvailableQuizzes);
router.post('/submit', protect, quizController.submitQuiz);

// Quiz management (enseignant)
router.post('/', protect, authorizeRoles('enseignant', 'admin'), quizController.createQuiz);
router.put('/:quizId', protect, authorizeRoles('enseignant', 'admin'), quizController.updateQuiz);
router.delete('/:quizId', protect, authorizeRoles('enseignant', 'admin'), quizController.deleteQuiz);
router.get('/cours/:courseId', protect, authorizeRoles('enseignant', 'admin'), quizController.listQuizzesByCourse);
router.get('/:quizId', protect, authorizeRoles('enseignant', 'admin'), quizController.getQuizById);

module.exports = router;