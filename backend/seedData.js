const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");
const Cours = require("./models/Cours");
const Quiz = require("./models/Quiz");
const Progress = require("./models/Progress");
const QuizResult = require("./models/QuizResult");

const seedDatabase = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/safoua_academy";
    await mongoose.connect(MONGO_URI);
    console.log("Connecté à MongoDB pour le seeding");

    await User.deleteMany({});
    await Cours.deleteMany({});
    await Quiz.deleteMany({});
    await Progress.deleteMany({});
    await QuizResult.deleteMany({});

    const admin = await User.create({
      nom: "Admin",
      prenom: "Super",
      email: "admin@safoua.com",
      mdp: "admin123",
      role: "administrateur"
    });

    const enseignant = await User.create({
      nom: "Mansouri",
      prenom: "Ahmed",
      email: "ahmed@safoua.com",
      mdp: "password123",
      role: "enseignant"
    });

    const etudiant = await User.create({
      nom: "Ben",
      prenom: "Amina",
      email: "amina@example.com",
      mdp: "password123",
      role: "etudiant"
    });

    const cours1 = await Cours.create({
      titre: "Arabe Classique - Niveau 1",
      description: "Apprenez l'arabe classique depuis les bases.",
      categorie: "Langue Arabe",
      niveau: "Débutant",
      langue: "Français",
      prix: 99,
      image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=400&fit=crop",
      instructeur: enseignant._id,
      status: "Publié",
      certificat: true,
      objectifs: [
        "Lire et écrire l'alphabet arabe",
        "Comprendre les bases de la grammaire"
      ],
      prerequis: [],
      students: [etudiant._id],
      modules: [
        {
          titre: "L'alphabet arabe",
          description: "Apprendre à lire et écrire les 28 lettres.",
          ordre: 1,
          duree: 60,
          lecons: [
            {
              titre: "Les lettres de Alif à Tha",
              description: "Apprentissage des 7 premières lettres.",
              videoUrl: "https://example.com/videos/alif-tha.mp4",
              duree: 20,
              ordre: 1
            },
            {
              titre: "Les lettres de Jim à Shin",
              description: "Apprentissage des lettres suivantes.",
              videoUrl: "https://example.com/videos/jim-shin.mp4",
              duree: 20,
              ordre: 2
            },
            {
              titre: "Les lettres de Sad à Ya",
              description: "Révision finale de l'alphabet.",
              videoUrl: "https://example.com/videos/sad-ya.mp4",
              duree: 20,
              ordre: 3
            }
          ]
        },
        {
          titre: "Voyelles et prononciation",
          description: "Maîtriser Fatha, Damma, Kasra et Sukun.",
          ordre: 2,
          duree: 45,
          lecons: [
            {
              titre: "Voyelles courtes",
              description: "Fatha, Damma, Kasra.",
              videoUrl: "https://example.com/videos/voyelles-courtes.mp4",
              duree: 15,
              ordre: 1
            },
            {
              titre: "Voyelles longues",
              description: "Alif, Waw, Ya.",
              videoUrl: "https://example.com/videos/voyelles-longues.mp4",
              duree: 15,
              ordre: 2
            },
            {
              titre: "Shadda et Sukun",
              description: "Doublement et absence de voyelle.",
              videoUrl: "https://example.com/videos/shadda-sukun.mp4",
              duree: 15,
              ordre: 3
            }
          ]
        }
      ]
    });

    const cours2 = await Cours.create({
      titre: "Tajwid Avancé",
      description: "Approfondissez les règles du Tajwid pour une récitation parfaite.",
      categorie: "Coran",
      niveau: "Avancé",
      langue: "Arabe",
      prix: 89,
      image: "https://images.unsplash.com/photo-1609598429919-48079525b1a4?w=800&h=400&fit=crop",
      instructeur: enseignant._id,
      status: "Publié",
      certificat: true,
      objectifs: [
        "Maîtriser les règles du Noon et du Meem",
        "Perfectionner la prononciation des lettres emphatiques"
      ],
      prerequis: ["Lecture basique du Coran"],
      students: [etudiant._id],
      modules: [
        {
          titre: "Les bases du Tajwid",
          description: "Révision des fondamentaux du Tajwid.",
          ordre: 1,
          duree: 45,
          lecons: [
            {
              titre: "Introduction au Tajwid avancé",
              description: "Présentation du programme et des objectifs.",
              videoUrl: "https://example.com/videos/tajwid-intro.mp4",
              duree: 15,
              ordre: 1
            },
            {
              titre: "Makharij",
              description: "Points d'articulation des lettres.",
              videoUrl: "https://example.com/videos/tajwid-makharij.mp4",
              duree: 15,
              ordre: 2
            },
            {
              titre: "Sifaat",
              description: "Attributs sonores des lettres.",
              videoUrl: "https://example.com/videos/tajwid-sifaat.mp4",
              duree: 15,
              ordre: 3
            }
          ]
        }
      ]
    });

    const quiz1 = await Quiz.create({
      titre: "Quiz - L'alphabet arabe",
      cours: cours1._id,
      module: "L'alphabet arabe",
      difficulty: "Débutant",
      duration: 10,
      points: 100,
      passingScore: 70,
      questions: [
        {
          question: "Combien de lettres contient l'alphabet arabe ?",
          options: ["24", "26", "28", "30"],
          correctAnswer: 2,
          explanation: "L'alphabet arabe compte 28 lettres."
        },
        {
          question: "Quelle est la première lettre de l'alphabet arabe ?",
          options: ["ب", "أ", "ت", "ع"],
          correctAnswer: 1,
          explanation: "La première lettre est Alif (أ)."
        }
      ]
    });

    const quiz2 = await Quiz.create({
      titre: "Quiz - Les bases du Tajwid",
      cours: cours2._id,
      module: "Les bases du Tajwid",
      difficulty: "Intermédiaire",
      duration: 12,
      points: 100,
      passingScore: 70,
      questions: [
        {
          question: "Quel est le nombre de points d'articulation principaux ?",
          options: ["5", "7", "12", "17"],
          correctAnswer: 3,
          explanation: "Il y a 17 points d'articulation."
        },
        {
          question: "Que signifie Shadda ?",
          options: ["Absence de voyelle", "Doublement de la lettre", "Voyelle longue", "Pause"],
          correctAnswer: 1,
          explanation: "La Shadda indique le doublement de la lettre."
        }
      ]
    });

    await Progress.create({
      utilisateur: etudiant._id,
      cours: cours1._id,
      completedLessons: [cours1.modules[0].lecons[0]._id.toString()],
      progress: 20,
      currentLesson: cours1.modules[0].lecons[1]._id.toString(),
      currentPosition: 0
    });

    await QuizResult.create({
      utilisateur: etudiant._id,
      quiz: quiz1._id,
      answers: [2, 1],
      score: 100,
      totalQuestions: 2,
      correctAnswers: 2,
      duration: 300
    });

    console.log("Seed terminé avec succès");
    process.exit(0);
  } catch (err) {
    console.error("Erreur de seed :", err);
    process.exit(1);
  }
};

seedDatabase();