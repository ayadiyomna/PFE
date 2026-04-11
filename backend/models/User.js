const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: [true, "Le nom est requis"],
    trim: true 
  },
  prenom: { 
    type: String, 
    required: [true, "Le prénom est requis"],
    trim: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: [true, "L'email est requis"],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Email invalide"]
  },
  mdp: { 
    type: String, 
    required: [true, "Le mot de passe est requis"],
    minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"]
  },
  image: { 
    type: String,
    default: null 
  },
  role: {
    type: String,
    enum: ["administrateur", "etudiant", "enseignant"],
    default: "etudiant"
  },
  active: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ["actif", "inactif", "en_attente", "suspendu"],
    default: "actif"
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpire: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

// Middleware pour hasher le mot de passe avant sauvegarde
// Version utilisant une fonction normale (pas async)
userSchema.pre('save', function(next) {
  const user = this;
  
  // Ne hasher que si le mot de passe est modifié
  if (!user.isModified('mdp')) {
    return next();
  }
  
  // Hasher le mot de passe avec bcrypt
  bcrypt.hash(user.mdp, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.mdp = hash;
    next();
  });
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.mdp);
};

// Méthode pour retourner les infos publiques
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    nom: this.nom,
    prenom: this.prenom,
    email: this.email,
    role: this.role,
    status: this.status,
    image: this.image,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model("User", userSchema);