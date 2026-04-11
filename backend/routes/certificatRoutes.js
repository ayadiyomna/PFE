const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const certificatController = require('../controllers/certificatController');

// Routes protégées
router.get('/mes-certificats', protect, certificatController.getMyCertificats);
router.post('/generer/:coursId', protect, certificatController.generateCertificat);
router.get('/:code/pdf', protect, certificatController.downloadCertificat);

module.exports = router;