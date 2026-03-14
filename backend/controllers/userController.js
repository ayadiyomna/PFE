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
    
    // Créer l'utilisateur (le middleware pre('save') va hasher le mot de passe)
    const user = await User.create({
      nom,
      prenom,
      email,
      mdp, // Pas besoin de hasher ici, le middleware le fera
      role: role || "etudiant"
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
      message: "Erreur lors de l'inscription" 
    });
  }
};

// LOGIN
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
    
    const isMatch = await user.comparePassword(mdp);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Email ou mot de passe incorrect" 
      });
    }
    
    // Mettre à jour la date de dernière connexion
    user.lastLogin = new Date();
    await user.save();
    
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
    // Si le mot de passe est fourni, le middleware pre('save') le hashera
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

module.exports = {
  register,
  login,
  getProfile,
  listerutilisateurs,
  getutilisateurById,
  updateutilisateur,
  deleteutilisateur
};