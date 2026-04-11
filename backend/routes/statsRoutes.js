const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const statsController = require('../controllers/statsController');

// Admin stats
router.get('/admin', protect, authorizeRoles('administrateur'), statsController.getAdminStats);

// Teacher stats
router.get('/enseignant', protect, authorizeRoles('enseignant', 'administrateur'), statsController.getTeacherStats);

// Student stats
router.get('/etudiant', protect, statsController.getStudentStats);

// Activités récentes
router.get('/activites', protect, statsController.getRecentActivities);

module.exports = router;