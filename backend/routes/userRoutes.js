const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const userController = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

// Les fonctions de réinitialisation sont maintenant dans userController
const { forgotPassword, resetPassword } = userController;

// Configuration multer pour les photos de profil
const profileDir = path.join(__dirname, "../uploads/profile");
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const profileFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Format d'image non autorisé"));
};

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: profileFileFilter
});

// Routes publiques
router.post("/register", userController.register);
router.post("/login", userController.login);

// Routes de réinitialisation de mot de passe (publiques)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Routes protégées
router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, userController.updateProfile);
router.post("/profile/picture", protect, profileUpload.single("image"), userController.updateProfilePicture);

// Routes admin seulement
router.get("/", protect, authorizeRoles('administrateur'), userController.listerutilisateurs);
router.get("/:id", protect, authorizeRoles('administrateur'), userController.getutilisateurById);
router.put("/:id", protect, authorizeRoles('administrateur'), userController.updateutilisateur);
router.delete("/:id", protect, authorizeRoles('administrateur'), userController.deleteutilisateur);
router.patch("/:id/approuver", protect, authorizeRoles('administrateur'), userController.approuverEnseignant);

module.exports = router;