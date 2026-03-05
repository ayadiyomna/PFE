// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_temporaire_123");
      console.log("✅ Token décodé, ID:", decoded.id);
      const user = await User.findById(decoded.id).select("-mdp");
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: "Utilisateur non trouvé" 
        });
      }
      req.user = user;
      next();
      
    } catch (error) {
      return res.status(401).json({ 
        success: false,
        message: "Token invalide" 
      });
    }
  } else {
    return res.status(401).json({ 
      success: false,
      message: "Non autorisé, token manquant" 
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log("❌ req.user est undefined");
      return res.status(401).json({ 
        success: false,
        message: "Non autorisé - Utilisateur non authentifié" 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Accès interdit. Rôle requis: ${roles.join(", ")}` 
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };