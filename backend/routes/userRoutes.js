const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

// Routes publiques
router.post("/register", userController.register);
router.post("/login", userController.login);

// Routes protégées
router.get("/profile", protect, userController.getProfile);

// Routes admin seulement
router.get("/", protect, authorizeRoles('administrateur'), userController.listerutilisateurs);
router.get("/:id", protect, authorizeRoles('administrateur'), userController.getutilisateurById);
router.put("/:id", protect, authorizeRoles('administrateur'), userController.updateutilisateur);
router.delete("/:id", protect, authorizeRoles('administrateur'), userController.deleteutilisateur);

module.exports = router;