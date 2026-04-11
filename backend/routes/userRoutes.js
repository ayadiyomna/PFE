const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

// Les fonctions de réinitialisation sont maintenant dans userController
const { forgotPassword, resetPassword } = userController;

// Routes publiques
router.post("/register", userController.register);
router.post("/login", userController.login);

// Routes de réinitialisation de mot de passe (publiques)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Routes protégées
router.get("/profile", protect, userController.getProfile);

// Routes admin seulement
router.get("/", protect, authorizeRoles('administrateur'), userController.listerutilisateurs);
router.get("/:id", protect, authorizeRoles('administrateur'), userController.getutilisateurById);
router.put("/:id", protect, authorizeRoles('administrateur'), userController.updateutilisateur);
router.delete("/:id", protect, authorizeRoles('administrateur'), userController.deleteutilisateur);
router.patch("/:id/approuver", protect, authorizeRoles('administrateur'), userController.approuverEnseignant);

module.exports = router;