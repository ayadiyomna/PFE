const mongoose = require("mongoose");

const coursSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  prix: { type: Number, default: 0 },
  duree: Number,
  niveau: { 
    type: String, 
    enum: ["débutant", "intermédiaire", "avancé"],
    default: "débutant"
  },
  image: String
}, { timestamps: true });

module.exports = mongoose.model("Cours", coursSchema);