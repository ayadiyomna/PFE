// controllers/authController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || "secret_temporaire_123", 
    { expiresIn: "30d" }
  );
};

// REGISTER
const register = async (req, res) => {
  try {
    console.log("📝 Register - Données reçues:", {
      ...req.body,
      mdp: "***"
    });
    
    const { nom, prenom, email, mdp, role } = req.body;
    
    // Validation
    if (!nom || !prenom || !email || !mdp) {
      return res.status(400).json({ 
        success: false,
        message: "Tous les champs sont requis" 
      });
    }

    // Vérifier si l'utilisateur existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: "Cet email est déjà utilisé" 
      });
    }
    
    // Déterminer le statut initial (uniquement étudiant ou enseignant)
    let finalRole = role || "etudiant";
    let status = "actif";
    
    // Si c'est un enseignant, il doit être approuvé
    if (finalRole === "enseignant") {
      status = "en_attente";
    }
    
    // Empêcher l'inscription directe en tant qu'administrateur
    if (finalRole === "administrateur") {
      return res.status(403).json({ 
        success: false,
        message: "L'inscription en tant qu'administrateur n'est pas autorisée" 
      });
    }
    
    // Créer l'utilisateur
    const user = await User.create({
      nom,
      prenom,
      email,
      mdp,
      role: finalRole,
      active: true,
      status: status
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: user.getPublicProfile(),
      token
    });

  } catch (error) {
    console.error("❌ Erreur register:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "Cet email est déjà utilisé" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message || "Erreur lors de l'inscription" 
    });
  }
};

// LOGIN - Version corrigée (sans save pour éviter le middleware)
const login = async (req, res) => {
  try {
    const { email, mdp } = req.body;
    
    if (!email || !mdp) {
      return res.status(400).json({ 
        success: false,
        message: "Email et mot de passe requis" 
      });
    }
    
    const user = await User.findOne({ email }).select("+mdp");
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Email ou mot de passe incorrect" 
      });
    }
    
    // Vérifier si le compte est actif
    if (!user.active) {
      return res.status(401).json({ 
        success: false,
        message: "Compte désactivé. Contactez l'administrateur." 
      });
    }
    
    // Vérifier si l'enseignant est approuvé
    if (user.role === "enseignant" && user.status === "en_attente") {
      return res.status(401).json({ 
        success: false,
        message: "Votre compte enseignant est en attente d'approbation." 
      });
    }
    
    const isMatch = await user.comparePassword(mdp);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Email ou mot de passe incorrect" 
      });
    }
    
    // NE PAS sauvegarder l'utilisateur pour éviter le middleware pre('save')
    // user.lastLogin = new Date();
    // await user.save(); // ← Commenté pour éviter l'erreur next is not a function
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      data: user.getPublicProfile(),
      token
    });

  } catch (error) {
    console.error("❌ Erreur login:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la connexion" 
    });
  }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  let user; // Déclarer user en dehors du try pour pouvoir l'utiliser dans le catch
  
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "L'email est requis"
      });
    }

    user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Aucun utilisateur trouvé avec cet email" 
      });
    }

    // Créer le token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // URL de réinitialisation (adapter selon votre frontend)
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    // Configuration du mailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const message = `
      Bonjour ${user.prenom} ${user.nom},

      Vous avez demandé la réinitialisation de votre mot de passe.
      Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe (ce lien est valable 15 minutes) :

      ${resetUrl}

      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

      Cordialement,
      L'équipe
    `;

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL}>`,
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      text: message
    });

    res.json({ 
      success: true,
      message: "Email de réinitialisation envoyé" 
    });

  } catch (error) {
    console.error("❌ Erreur forgotPassword:", error);
    
    // Réinitialiser les champs en cas d'erreur
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    }
    
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de l'envoi de l'email de réinitialisation" 
    });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validation du mot de passe
    if (!password) {
      return res.status(400).json({ 
        success: false,
        message: "Le nouveau mot de passe est requis" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Le mot de passe doit contenir au moins 6 caractères" 
      });
    }

    // Trouver l'utilisateur avec le token valide
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Token invalide ou expiré" 
      });
    }

    // Mettre à jour le mot de passe
    // Le middleware pre('save') va automatiquement hasher le mot de passe
    user.mdp = password;
    
    // Supprimer les champs de réinitialisation
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ 
      success: true,
      message: "Mot de passe réinitialisé avec succès" 
    });

  } catch (error) {
    console.error("❌ Erreur resetPassword:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la réinitialisation du mot de passe" 
    });
  }
};

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error("❌ Erreur getProfile:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// LISTER TOUS LES UTILISATEURS
const listerutilisateurs = async (req, res) => {
  try {
    const users = await User.find().select("-mdp").sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      count: users.length,
      data: users 
    });
  } catch (error) {
    console.error("❌ Erreur listerutilisateurs:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// GET UTILISATEUR BY ID
const getutilisateurById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-mdp");
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }
    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error("❌ Erreur getutilisateurById:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// UPDATE UTILISATEUR
const updateutilisateur = async (req, res) => {
  try {
    const { mdp, ...updateData } = req.body;
    
    if (mdp) {
      updateData.mdp = mdp;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-mdp");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }
    
    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error("❌ Erreur updateutilisateur:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// DELETE UTILISATEUR
const deleteutilisateur = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }
    res.json({ 
      success: true, 
      message: "Utilisateur supprimé" 
    });
  } catch (error) {
    console.error("❌ Erreur deleteutilisateur:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// APPROUVER UN ENSEIGNANT
const approuverEnseignant = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }
    
    if (user.role !== "enseignant") {
      return res.status(400).json({ 
        success: false,
        message: "Cet utilisateur n'est pas un enseignant" 
      });
    }
    
    user.status = "actif";
    await user.save();
    
    res.json({ 
      success: true, 
      data: user.getPublicProfile(),
      message: "Enseignant approuvé avec succès" 
    });
  } catch (error) {
    console.error("❌ Erreur approuverEnseignant:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  listerutilisateurs,
  getutilisateurById,
  updateutilisateur,
  deleteutilisateur,
  approuverEnseignant
};