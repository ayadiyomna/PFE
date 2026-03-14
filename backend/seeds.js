const mongoose = require("mongoose");
const User = require("./models/User");
const Cours = require("./models/Cours");
const dotenv = require("dotenv");

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
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

    console.log("✅ Utilisateurs créés avec succès");
    console.log("\n📝 Identifiants de test :");
    console.log("Admin: admin@example.com / admin123");
    console.log("Enseignant: ahmed@example.com / password123");
    console.log("Étudiant: mohamed@example.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur seeding:", error);
    process.exit(1);
  }
};

seedDatabase();