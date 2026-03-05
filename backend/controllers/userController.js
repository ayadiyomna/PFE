// controllers/userController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || "secret_temporaire_123", 
    { expiresIn: "30d" },
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
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mdp, salt);
    const user = await User.create({
      nom,
      prenom,
      email,
      mdp: hashedPassword,
      role: role || "etudiant"
    });

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
    const isMatch = await bcrypt.compare(mdp, user.mdp);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Email ou mot de passe incorrect" 
      });
    }
    
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
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la connexion" 
    });
  }
};
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
const updateutilisateur = async (req, res) => {
  try {
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