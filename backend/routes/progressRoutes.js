const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const progressController = require('../controllers/progressController');

// Routes protégées
router.get('/etudiant', protect, progressController.getProgress);
router.get('/cours/:courseId', protect, progressController.getCourseProgress);
router.patch('/cours/:courseId/lecon/:lessonId', protect, progressController.updateLessonProgress);

module.exports = router;