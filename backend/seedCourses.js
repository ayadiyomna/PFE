const mongoose = require("mongoose");
const User = require("./models/User");
const Cours = require("./models/Cours");
const dotenv = require("dotenv");

dotenv.config();

const seedCourses = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/safoua_academy";
    await mongoose.connect(MONGO_URI);
    console.log("📦 Connecté à MongoDB pour le seeding des cours");

    // Trouver l'enseignant pour lui attribuer les cours
    const enseignant = await User.findOne({ email: "ahmed@example.com" });
    
    if (!enseignant) {
      console.log("❌ ERREUR: Enseignant ahmed@example.com introuvable. Avez-vous exécuté npm run seed?");
      process.exit(1);
    }

    // Vider les cours existants si on veut repartir proprement
    // await Cours.deleteMany({});

    // Liste des cours à ajouter
    const courses = [
      {
        titre: "Tajwid Avancé",
        description: "Maîtrisez les règles complexes du Tajwid pour une récitation parfaite du Saint Coran.",
        categorie: "Coran",
        niveau: "Expert",
        prix: 149,
        status: "Publié",
        instructeur: enseignant._id,
        modules: [
          {
            titre: "Les règles de Madd",
            ordre: 1,
            lecons: [
              { titre: "Madd naturel", ordre: 1, duree: 20 },
              { titre: "Madd prolongé", ordre: 2, duree: 30 }
            ]
          }
        ]
      },
      {
        titre: "Arabe Classique",
        description: "Apprentissage approfondi de la grammaire et du vocabulaire de la langue arabe.",
        categorie: "Langue",
        niveau: "Intermédiaire",
        prix: 99,
        status: "Publié",
        instructeur: enseignant._id
      },
      {
        titre: "Fiqh & Usul",
        description: "Introduction à la jurisprudence islamique et à ses fondements.",
        categorie: "Jurisprudence",
        niveau: "Avancé",
        prix: 120,
        status: "Publié",
        instructeur: enseignant._id
      }
    ];

    // Ajouter les cours
    for (const data of courses) {
      const coursExists = await Cours.findOne({ titre: data.titre });
      if (!coursExists) {
        await Cours.create(data);
        console.log(`✅ Cours '${data.titre}' ajouté avec succès`);
      } else {
        console.log(`⚠️ Le cours '${data.titre}' existe déjà`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur seeding cours:", error);
    process.exit(1);
  }
};

seedCourses();
