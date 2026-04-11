const mongoose = require("mongoose");
const User = require("./models/User");
const dotenv = require("dotenv");

dotenv.config();

const seedStudents = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/safoua_academy";
    await mongoose.connect(MONGO_URI);
    console.log("📦 Connecté à MongoDB pour le seeding des étudiants");

    // Liste des étudiants à ajouter
    const students = [
      {
        nom: "Ben Ali",
        prenom: "Omar",
        email: "omar@example.com",
        mdp: "password123",
        role: "etudiant"
      },
      {
        nom: "Hassan",
        prenom: "Fatima",
        email: "fatima@example.com",
        mdp: "password123",
        role: "etudiant"
      },
      {
        nom: "Khalid",
        prenom: "Youssef",
        email: "youssef@example.com",
        mdp: "password123",
        role: "etudiant"
      },
      {
        nom: "Mansour",
        prenom: "Aisha",
        email: "aisha@example.com",
        mdp: "password123",
        role: "etudiant"
      }
    ];

    // Ajouter les étudiants
    for (const data of students) {
      const existing = await User.findOne({ email: data.email });
      if (!existing) {
        await User.create(data);
        console.log(`✅ Étudiant '${data.prenom} ${data.nom}' ajouté avec succès`);
      } else {
        console.log(`⚠️ L'étudiant '${data.email}' existe déjà`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur seeding étudiants:", error);
    process.exit(1);
  }
};

seedStudents();
