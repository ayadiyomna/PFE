const express = require('express');
const router = express.Router();
const {
  getPublicSettings,
  getAdminSettings,
  updateSettings,
  deleteLogo,
  deleteFavicon,
} = require('../controllers/settingsController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// Public route - get settings (non-sensitive data)
router.get('/', getPublicSettings);

// Admin routes
router.get('/admin', protect, authorizeRoles('administrateur'), getAdminSettings);

router.put(
  '/:id',
  protect,
  authorizeRoles('administrateur'),
  updateSettings
);

router.delete(
  '/:id/logo',
  protect,
  authorizeRoles('administrateur'),
  deleteLogo
);

router.delete(
  '/:id/favicon',
  protect,
  authorizeRoles('administrateur'),
  deleteFavicon
);

module.exports = router;
