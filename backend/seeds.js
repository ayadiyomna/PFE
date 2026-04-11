const mongoose = require("mongoose");
const User = require("./models/User");
const Cours = require("./models/Cours");
const dotenv = require("dotenv");

dotenv.config();

const seedDatabase = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/safoua_academy";
    await mongoose.connect(MONGO_URI);
    console.log("📦 Connecté à MongoDB pour le seeding");

    // Nettoyer les collections
    await User.deleteMany({});
    await Cours.deleteMany({});

    // Créer un admin
    const admin = await User.create({
      nom: "Admin",
      prenom: "Super",
      email: "admin@example.com",
      mdp: "admin123",
      role: "administrateur"
    });

    // Créer un enseignant
    const enseignant = await User.create({
      nom: "Al-Mansouri",
      prenom: "Ahmed",
      email: "ahmed@example.com",
      mdp: "password123",
      role: "enseignant"
    });

    // Créer un étudiant
    const etudiant = await User.create({
      nom: "Ali",
      prenom: "Mohamed",
      email: "mohamed@example.com",
      mdp: "password123",
      role: "etudiant"
    });


    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur seeding:", error);
    process.exit(1);
  }
};

seedDatabase();