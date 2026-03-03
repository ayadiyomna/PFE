// controllers/userController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || "secret_temporaire_123", 
    { expiresIn: "30d" }
  );
};

// REGISTER - avec hachage explicite
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
    
    // HACHER LE MOT DE PASSE ICI
    console.log("🔐 Hachage du mot de passe...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mdp, salt);
    console.log("✅ Mot de passe haché avec succès");

    // Créer l'utilisateur avec le mot de passe déjà haché
    const user = await User.create({
      nom,
      prenom,
      email,
      mdp: hashedPassword, // Important: utiliser le mot de passe haché
      role: role || "etudiant"
    });

    console.log("✅ Utilisateur créé avec ID:", user._id);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      },
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
      message: "Erreur lors de l'inscription" 
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    console.log("🔐 Login - Email:", req.body.email);

    const { email, mdp } = req.body;
    
    if (!email || !mdp) {
      return res.status(400).json({ 
        success: false,
        message: "Email et mot de passe requis" 
      });
    }
    
    // Chercher l'utilisateur avec le mot de passe
    const user = await User.findOne({ email }).select("+mdp");
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Email ou mot de passe incorrect" 
      });
    }
    
    // Comparer les mots de passe
    console.log("🔍 Vérification du mot de passe...");
    const isMatch = await bcrypt.compare(mdp, user.mdp);
    
    if (!isMatch) {
      console.log("❌ Mot de passe incorrect");
      return res.status(401).json({ 
        success: false,
        message: "Email ou mot de passe incorrect" 
      });
    }
    
    console.log("✅ Mot de passe correct");
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      data: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      },
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

// Lister tous les utilisateurs
const listerutilisateurs = async (req, res) => {
  try {
    const users = await User.find().select("-mdp");
    res.json({ 
      success: true, 
      count: users.length,
      data: users 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get utilisateur par ID
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
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update utilisateur
const updateutilisateur = async (req, res) => {
  try {
    // Si le mot de passe est fourni, le hacher
    if (req.body.mdp) {
      const salt = await bcrypt.genSalt(10);
      req.body.mdp = await bcrypt.hash(req.body.mdp, salt);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete utilisateur
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
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  register,
  login,
  listerutilisateurs,
  getutilisateurById,
  updateutilisateur,
  deleteutilisateur
};