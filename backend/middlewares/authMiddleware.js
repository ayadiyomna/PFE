// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  
  console.log("🔐 Vérification d'authentification...");
  console.log("Headers:", req.headers.authorization);
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("📦 Token reçu");
      
      // Décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_temporaire_123");
      console.log("✅ Token décodé, ID:", decoded.id);
      
      // Récupérer l'utilisateur complet
      const user = await User.findById(decoded.id).select("-mdp");
      
      if (!user) {
        console.log("❌ Utilisateur non trouvé en base");
        return res.status(401).json({ 
          success: false,
          message: "Utilisateur non trouvé" 
        });
      }
      
      // Attacher l'utilisateur à req.user
      req.user = user;
      console.log("✅ Utilisateur authentifié:", req.user.email, "Rôle:", req.user.role);
      
      next();
      
    } catch (error) {
      console.error("❌ Erreur auth:", error.message);
      return res.status(401).json({ 
        success: false,
        message: "Token invalide" 
      });
    }
  } else {
    console.log("❌ Pas de token dans la requête");
    return res.status(401).json({ 
      success: false,
      message: "Non autorisé, token manquant" 
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log("🔑 Vérification des rôles...");
    console.log("req.user existe?", !!req.user);
    
    if (!req.user) {
      console.log("❌ req.user est undefined");
      return res.status(401).json({ 
        success: false,
        message: "Non autorisé - Utilisateur non authentifié" 
      });
    }
    
    console.log("👤 Rôle utilisateur:", req.user.role);
    console.log("📋 Rôles autorisés:", roles);
    
    if (!roles.includes(req.user.role)) {
      console.log(`❌ Rôle ${req.user.role} non autorisé`);
      return res.status(403).json({ 
        success: false,
        message: `Accès interdit. Rôle requis: ${roles.join(", ")}` 
      });
    }
    
    console.log("✅ Autorisation accordée");
    next();
  };
};

module.exports = { protect, authorizeRoles };