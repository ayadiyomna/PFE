// routes/userRoutes.js - VERSION CORRIGÉE
const express = require("express");
const router = express.Router();

// Import du contrôleur
const userController = require("../controllers/userController");
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/", userController.listerutilisateurs);
router.get("/:id", userController.getutilisateurById);
router.put("/:id", userController.updateutilisateur);
router.delete("/:id", userController.deleteutilisateur);

module.exports = router;