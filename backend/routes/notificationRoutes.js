const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

// Routes protégées
router.get('/', protect, notificationController.getNotifications);
router.patch('/:id/read', protect, notificationController.markAsRead);
router.patch('/read-all', protect, notificationController.markAllAsRead);
// Créer une demande/contact vers l'admin
router.post('/contact', protect, notificationController.createContactRequest);
// Récupérer toutes les demandes (admin)
router.get('/requests', protect, require('../middlewares/authMiddleware').authorizeRoles('administrateur'), notificationController.getContactRequests);

module.exports = router;