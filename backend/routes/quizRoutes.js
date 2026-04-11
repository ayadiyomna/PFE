const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const quizController = require('../controllers/quizController');

// Routes protégées
router.get('/historique', protect, quizController.getQuizHistory);
router.get('/disponibles', protect, quizController.getAvailableQuizzes);
router.post('/submit', protect, quizController.submitQuiz);

module.exports = router;