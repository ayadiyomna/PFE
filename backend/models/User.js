// models/User.js - Version sans middleware
const mongoose = require("mongoose");

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
    trim: true
  },
  mdp: { 
    type: String, 
    required: [true, "Le mot de passe est requis"]
  },
  image: { 
    type: String,
    default: null 
  },
  role: {
    type: String,
    enum: ["administrateur", "etudiant", "enseignant"],
    default: "etudiant"
  }
}, { 
  timestamps: true 
});

// PAS DE MIDDLEWARE PRE('SAVE') !

module.exports = mongoose.model("User", userSchema);