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
  lastLogin: {
    type: Date
  }
}, { 
  timestamps: true 
});

// Middleware pour hasher le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  // Ne hasher que si le mot de passe est modifié
  if (!this.isModified('mdp')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.mdp = await bcrypt.hash(this.mdp, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.mdp);
};

// Méthode pour retourner les infos publiques
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    nom: this.nom,
    prenom: this.prenom,
    email: this.email,
    role: this.role,
    image: this.image,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model("User", userSchema);