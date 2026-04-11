const mongoose = require("mongoose");
const User = require("./models/User");
const Cours = require("./models/Cours");
const Quiz = require("./models/Quiz");
const Progress = require("./models/Progress");
const QuizResult = require("./models/QuizResult");
const dotenv = require("dotenv");

dotenv.config();

const seedDatabase = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/safoua_academy";
    await mongoose.connect(MONGO_URI);
    console.log("📦 Connecté à MongoDB pour le seeding");

    // Nettoyer toutes les collections
    await User.deleteMany({});
    await Cours.deleteMany({});
    await Quiz.deleteMany({});
    await Progress.deleteMany({});
    await QuizResult.deleteMany({});
    console.log("🗑️  Collections nettoyées");

    // ═══════════════════════════════════════
    // 1. UTILISATEURS
    // ═══════════════════════════════════════
    const admin = await User.create({
      nom: "Admin", prenom: "Super",
      email: "admin@safoua.com", mdp: "admin123",
      role: "administrateur"
    });

    const enseignant1 = await User.create({
      nom: "Al-Mansouri", prenom: "Ahmed",
      email: "ahmed@safoua.com", mdp: "password123",
      role: "enseignant"
    });

    const enseignant2 = await User.create({
      nom: "Zahra", prenom: "Fatima",
      email: "fatima@safoua.com", mdp: "password123",
      role: "enseignant"
    });

    const enseignant3 = await User.create({
      nom: "Al-Hassan", prenom: "Mohammed",
      email: "mohammed@safoua.com", mdp: "password123",
      role: "enseignant"
    });

    const etudiant1 = await User.create({
      nom: "Ali", prenom: "Mohamed",
      email: "mohamed@example.com", mdp: "password123",
      role: "etudiant"
    });

    const etudiant2 = await User.create({
      nom: "Ben Salah", prenom: "Amina",
      email: "amina@example.com", mdp: "password123",
      role: "etudiant"
    });

    const etudiant3 = await User.create({
      nom: "Trabelsi", prenom: "Youssef",
      email: "youssef@example.com", mdp: "password123",
      role: "etudiant"
    });

    const etudiant4 = await User.create({
      nom: "Bouazizi", prenom: "Sara",
      email: "sara@example.com", mdp: "password123",
      role: "etudiant"
    });

    const etudiant5 = await User.create({
      nom: "Khelifi", prenom: "Omar",
      email: "omar@example.com", mdp: "password123",
      role: "etudiant"
    });

    console.log("👥 9 utilisateurs créés (1 admin, 3 enseignants, 5 étudiants)");

    // ═══════════════════════════════════════
    // 2. COURS COMPLETS (avec modules et leçons)
    // ═══════════════════════════════════════

    // --- COURS 1 : Tajwid Avancé ---
    const cours1 = await Cours.create({
      titre: "Tajwid Avancé",
      description: "Maîtrisez les règles avancées du Tajwid pour une récitation parfaite du Coran. Ce cours approfondit les règles de prononciation, les pauses et les intonations essentielles.",
      categorie: "Coran",
      niveau: "Avancé",
      langue: "Arabe",
      prix: 89,
      image: "https://images.unsplash.com/photo-1609598429919-48079525b1a4?w=800&h=400&fit=crop",
      instructeur: enseignant1._id,
      status: "Publié",
      certificat: true,
      objectifs: [
        "Maîtriser les règles du Noon Saakin et Tanween",
        "Appliquer correctement les pauses (Waqf)",
        "Perfectionner la prononciation des lettres emphatiques",
        "Réciter avec les modes de lecture (Qira'at)"
      ],
      prerequis: ["Lecture basique du Coran", "Connaissance de l'alphabet arabe"],
      students: [etudiant1._id, etudiant2._id, etudiant3._id],
      modules: [
        {
          titre: "Les bases du Tajwid",
          description: "Révision des fondamentaux du Tajwid",
          ordre: 1,
          duree: 45,
          lecons: [
            { titre: "Introduction au Tajwid avancé", description: "Présentation du programme et des objectifs du cours avancé.", duree: 15, ordre: 1 },
            { titre: "Les points d'articulation (Makharij)", description: "Étude approfondie des points d'articulation de chaque lettre arabe.", duree: 15, ordre: 2 },
            { titre: "Les attributs des lettres (Sifaat)", description: "Apprentissage des caractéristiques sonores de chaque lettre.", duree: 15, ordre: 3 }
          ]
        },
        {
          titre: "Règles du Noon et Meem",
          description: "Approfondissement des règles liées au Noon et Meem",
          ordre: 2,
          duree: 60,
          lecons: [
            { titre: "Idgham, Ikhfa, Iqlab et Izhar", description: "Les 4 règles du Noon Saakin et Tanween expliquées en détail.", duree: 20, ordre: 1 },
            { titre: "Règles du Meem Saakin", description: "Ikhfa Shafawi, Idgham Shafawi et Izhar Shafawi.", duree: 20, ordre: 2 },
            { titre: "Exercices pratiques de récitation", description: "Application des règles sur des versets choisis.", duree: 20, ordre: 3 }
          ]
        },
        {
          titre: "Les prolongations (Madd)",
          description: "Maîtriser les différents types de Madd",
          ordre: 3,
          duree: 50,
          lecons: [
            { titre: "Madd Tabii et Madd Far'i", description: "Différence entre les prolongations naturelles et dérivées.", duree: 15, ordre: 1 },
            { titre: "Madd Lazim et Madd Arid", description: "Prolongations obligatoires et celles dues à l'arrêt.", duree: 20, ordre: 2 },
            { titre: "Révision générale et passage pratique", description: "Récitation complète en appliquant toutes les règles.", duree: 15, ordre: 3 }
          ]
        }
      ],
      rating: 4.9,
      nombreAvis: 3,
      avis: [
        { utilisateur: etudiant1._id, note: 5, commentaire: "Excellent cours, très complet et bien structuré !" },
        { utilisateur: etudiant2._id, note: 5, commentaire: "Le cheikh explique très clairement. Merci !" },
        { utilisateur: etudiant3._id, note: 4, commentaire: "Bon cours mais j'aurais aimé plus d'exercices audio." }
      ]
    });

    // --- COURS 2 : Arabe Classique Niveau 1 ---
    const cours2 = await Cours.create({
      titre: "Arabe Classique - Niveau 1",
      description: "Apprenez l'arabe classique depuis les bases. Alphabet, grammaire élémentaire, vocabulaire essentiel et premières phrases de conversation.",
      categorie: "Langue Arabe",
      niveau: "Débutant",
      langue: "Français",
      prix: 99,
      image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=400&fit=crop",
      instructeur: enseignant2._id,
      status: "Publié",
      certificat: true,
      objectifs: [
        "Lire et écrire l'alphabet arabe",
        "Comprendre les bases de la grammaire (Nahw)",
        "Acquérir un vocabulaire de 200 mots courants",
        "Construire des phrases simples en arabe"
      ],
      prerequis: [],
      students: [etudiant1._id, etudiant4._id, etudiant5._id],
      modules: [
        {
          titre: "L'alphabet arabe",
          description: "Apprendre à lire et écrire les 28 lettres",
          ordre: 1,
          duree: 60,
          lecons: [
            { titre: "Les lettres de Alif à Tha", description: "Apprentissage des 7 premières lettres avec leur forme isolée, initiale, médiane et finale.", duree: 20, ordre: 1 },
            { titre: "Les lettres de Jim à Shin", description: "Suite de l'alphabet avec exercices d'écriture.", duree: 20, ordre: 2 },
            { titre: "Les lettres de Sad à Ya", description: "Les dernières lettres et révision complète de l'alphabet.", duree: 20, ordre: 3 }
          ]
        },
        {
          titre: "Les voyelles et la prononciation",
          description: "Maîtriser les voyelles courtes et longues",
          ordre: 2,
          duree: 45,
          lecons: [
            { titre: "Fatha, Damma et Kasra", description: "Les trois voyelles courtes de l'arabe.", duree: 15, ordre: 1 },
            { titre: "Les voyelles longues (Madd)", description: "Alif, Waw et Ya comme voyelles longues.", duree: 15, ordre: 2 },
            { titre: "Le Sukun et la Shadda", description: "L'absence de voyelle et le redoublement.", duree: 15, ordre: 3 }
          ]
        },
        {
          titre: "Vocabulaire et phrases simples",
          description: "Les premiers mots et expressions en arabe",
          ordre: 3,
          duree: 50,
          lecons: [
            { titre: "Salutations et présentations", description: "As-salamu alaykum, comment s'appeler, se présenter.", duree: 15, ordre: 1 },
            { titre: "Les nombres de 1 à 20", description: "Apprendre les nombres et les utiliser dans des phrases.", duree: 15, ordre: 2 },
            { titre: "La famille et les pronoms", description: "Vocabulaire de la famille et les pronoms personnels.", duree: 20, ordre: 3 }
          ]
        }
      ],
      rating: 4.8,
      nombreAvis: 2,
      avis: [
        { utilisateur: etudiant1._id, note: 5, commentaire: "Parfait pour commencer l'arabe, très progressif." },
        { utilisateur: etudiant4._id, note: 4, commentaire: "Le contenu est bien fait, j'attends la suite !" }
      ]
    });

    // --- COURS 3 : Fiqh des Prières ---
    const cours3 = await Cours.create({
      titre: "Fiqh des Prières",
      description: "Les fondements de la jurisprudence islamique concernant les prières. Apprenez les règles, conditions et piliers de la prière selon les quatre écoles de pensée.",
      categorie: "Jurisprudence",
      niveau: "Intermédiaire",
      langue: "Français",
      prix: 79,
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=400&fit=crop",
      instructeur: enseignant3._id,
      status: "Publié",
      certificat: true,
      objectifs: [
        "Connaître les conditions de validité de la prière",
        "Maîtriser les piliers et obligations de chaque prière",
        "Comprendre les différences entre les écoles juridiques",
        "Appliquer correctement les règles de la prière du voyageur"
      ],
      prerequis: ["Connaissances de base sur l'Islam"],
      students: [etudiant2._id, etudiant3._id],
      modules: [
        {
          titre: "Les conditions de la prière",
          description: "Tout ce qu'il faut remplir avant de prier",
          ordre: 1,
          duree: 40,
          lecons: [
            { titre: "La purification (Tahara)", description: "Les ablutions (wudu), le bain rituel (ghusl) et le tayammum.", duree: 15, ordre: 1 },
            { titre: "Les horaires des prières", description: "Comment déterminer les heures de chaque prière obligatoire.", duree: 12, ordre: 2 },
            { titre: "La direction (Qibla) et les vêtements", description: "Comment trouver la Qibla et les règles vestimentaires.", duree: 13, ordre: 3 }
          ]
        },
        {
          titre: "Les piliers de la prière",
          description: "Les actes essentiels sans lesquels la prière est invalide",
          ordre: 2,
          duree: 50,
          lecons: [
            { titre: "L'intention et le Takbir", description: "La formulation de l'intention et le Takbirat al-Ihram.", duree: 15, ordre: 1 },
            { titre: "La récitation et les positions", description: "Al-Fatiha, le Ruku', le Sujud et le Jalsa.", duree: 20, ordre: 2 },
            { titre: "Le Tashahhud et les Salutations", description: "Les formules du Tashahhud et le Taslim final.", duree: 15, ordre: 3 }
          ]
        }
      ],
      rating: 4.7,
      nombreAvis: 2,
      avis: [
        { utilisateur: etudiant2._id, note: 5, commentaire: "Très instructif, le cheikh est très pédagogue." },
        { utilisateur: etudiant3._id, note: 4, commentaire: "J'ai appris beaucoup de choses que j'ignorais." }
      ]
    });

    // --- COURS 4 : Sciences du Hadith ---
    const cours4 = await Cours.create({
      titre: "Introduction aux Sciences du Hadith",
      description: "Découvrez les sciences du Hadith : classification, chaînes de transmission (isnad), et méthodologie d'authentification des paroles prophétiques.",
      categorie: "Hadith",
      niveau: "Intermédiaire",
      langue: "Français",
      prix: 69,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
      instructeur: enseignant1._id,
      status: "Publié",
      certificat: true,
      objectifs: [
        "Comprendre la terminologie du Hadith",
        "Distinguer entre Hadith Sahih, Hassan et Da'if",
        "Analyser une chaîne de transmission",
        "Utiliser les recueils de référence"
      ],
      prerequis: ["Bases de la religion islamique"],
      students: [etudiant1._id, etudiant5._id],
      modules: [
        {
          titre: "Introduction aux Hadiths",
          description: "Qu'est-ce qu'un Hadith et pourquoi les étudier",
          ordre: 1,
          duree: 35,
          lecons: [
            { titre: "Définition et importance du Hadith", description: "Le rôle du Hadith dans la compréhension de l'Islam.", duree: 12, ordre: 1 },
            { titre: "Les compilateurs célèbres", description: "Al-Bukhari, Muslim, Abu Dawud et les autres.", duree: 12, ordre: 2 },
            { titre: "Différence entre Hadith et Athar", description: "Paroles du Prophète vs paroles des Compagnons.", duree: 11, ordre: 3 }
          ]
        },
        {
          titre: "Classification des Hadiths",
          description: "Comment les savants classifient les hadiths",
          ordre: 2,
          duree: 45,
          lecons: [
            { titre: "Hadith Sahih et ses conditions", description: "Les 5 conditions pour qu'un hadith soit authentique.", duree: 15, ordre: 1 },
            { titre: "Hadith Hassan et Da'if", description: "Les hadiths acceptables et ceux qui sont faibles.", duree: 15, ordre: 2 },
            { titre: "Hadith Mawdu' (fabriqué)", description: "Comment identifier les hadiths inventés.", duree: 15, ordre: 3 }
          ]
        }
      ],
      rating: 4.6,
      nombreAvis: 1,
      avis: [
        { utilisateur: etudiant5._id, note: 5, commentaire: "Un cours indispensable pour tout étudiant en sciences islamiques." }
      ]
    });

    // --- COURS 5 : Mémorisation du Coran (Gratuit) ---
    const cours5 = await Cours.create({
      titre: "Mémorisation du Coran - Juz Amma",
      description: "Programme gratuit de mémorisation des courtes sourates du Coran (Juz Amma). Apprenez les techniques de mémorisation et révisez efficacement.",
      categorie: "Coran",
      niveau: "Débutant",
      langue: "Arabe",
      prix: 0,
      image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&h=400&fit=crop",
      instructeur: enseignant1._id,
      status: "Publié",
      certificat: false,
      objectifs: [
        "Mémoriser les 10 dernières sourates du Coran",
        "Appliquer les techniques de répétition espacée",
        "Comprendre le sens des sourates mémorisées"
      ],
      prerequis: [],
      students: [etudiant1._id, etudiant2._id, etudiant3._id, etudiant4._id, etudiant5._id],
      modules: [
        {
          titre: "Techniques de mémorisation",
          description: "Les fondamentaux de la mémorisation efficace",
          ordre: 1,
          duree: 30,
          lecons: [
            { titre: "Les bases de la mémorisation", description: "Techniques éprouvées pour mémoriser le Coran.", duree: 10, ordre: 1 },
            { titre: "La répétition espacée", description: "Comment organiser ses révisions pour ne rien oublier.", duree: 10, ordre: 2 },
            { titre: "L'environnement idéal", description: "Créer les conditions optimales pour la mémorisation.", duree: 10, ordre: 3 }
          ]
        },
        {
          titre: "Sourates An-Nas à Al-Falaq",
          description: "Mémorisation des deux premières sourates",
          ordre: 2,
          duree: 25,
          lecons: [
            { titre: "Sourate An-Nas", description: "Mémorisation et explication de Sourate An-Nas.", duree: 12, ordre: 1 },
            { titre: "Sourate Al-Falaq", description: "Mémorisation et explication de Sourate Al-Falaq.", duree: 13, ordre: 2 }
          ]
        },
        {
          titre: "Sourates Al-Ikhlas à Al-Kawthar",
          description: "Suite de la mémorisation",
          ordre: 3,
          duree: 30,
          lecons: [
            { titre: "Sourate Al-Ikhlas", description: "Le monothéisme pur : mémorisation et tafsir.", duree: 10, ordre: 1 },
            { titre: "Sourate Al-Masad", description: "Mémorisation et contexte de révélation.", duree: 10, ordre: 2 },
            { titre: "Sourate Al-Kawthar", description: "La plus courte sourate : mémorisation et sens.", duree: 10, ordre: 3 }
          ]
        }
      ],
      rating: 4.9,
      nombreAvis: 4,
      avis: [
        { utilisateur: etudiant1._id, note: 5, commentaire: "Gratuit et de qualité, merci !" },
        { utilisateur: etudiant2._id, note: 5, commentaire: "Mon fils a adoré ce programme." },
        { utilisateur: etudiant4._id, note: 5, commentaire: "Les techniques de mémorisation sont très efficaces." },
        { utilisateur: etudiant5._id, note: 4, commentaire: "Très bien, j'aimerais plus de sourates." }
      ]
    });

    // --- COURS 6 : Grammaire arabe Niveau 2 ---
    const cours6 = await Cours.create({
      titre: "Grammaire Arabe - Niveau 2",
      description: "Approfondissez vos connaissances en grammaire arabe (Nahw et Sarf). Les verbes, les déclinaisons et la construction avancée des phrases.",
      categorie: "Langue Arabe",
      niveau: "Intermédiaire",
      langue: "Français",
      prix: 119,
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop",
      instructeur: enseignant2._id,
      status: "Publié",
      certificat: true,
      objectifs: [
        "Conjuguer les verbes au passé, présent et futur",
        "Comprendre le système des déclinaisons (I'rab)",
        "Analyser grammaticalement des phrases complexes"
      ],
      prerequis: ["Arabe Classique - Niveau 1"],
      students: [etudiant1._id, etudiant4._id],
      modules: [
        {
          titre: "Le système verbal",
          description: "Les conjugaisons et formes verbales",
          ordre: 1,
          duree: 55,
          lecons: [
            { titre: "Le verbe au passé (Al-Madi)", description: "Conjugaison des verbes trilitères au passé.", duree: 20, ordre: 1 },
            { titre: "Le verbe au présent (Al-Mudari')", description: "Formation et conjugaison du présent/futur.", duree: 20, ordre: 2 },
            { titre: "L'impératif (Al-Amr)", description: "Formation de l'impératif et ses usages.", duree: 15, ordre: 3 }
          ]
        },
        {
          titre: "Les déclinaisons",
          description: "Comprendre le I'rab (analyse grammaticale)",
          ordre: 2,
          duree: 50,
          lecons: [
            { titre: "Le sujet (Fa'il) et l'objet (Maf'ul)", description: "Rôles grammaticaux dans la phrase verbale.", duree: 15, ordre: 1 },
            { titre: "La phrase nominale (Jumlah Ismiyyah)", description: "Mubtada et Khabar : structure et règles.", duree: 20, ordre: 2 },
            { titre: "Les prépositions et annexion (Idafa)", description: "Les prépositions arabes et la construction possessive.", duree: 15, ordre: 3 }
          ]
        }
      ],
      rating: 4.7,
      nombreAvis: 1,
      avis: [
        { utilisateur: etudiant4._id, note: 5, commentaire: "Exactement ce qu'il me fallait après le niveau 1 !" }
      ]
    });

    console.log(`📚 6 cours créés avec modules et leçons`);

    // ═══════════════════════════════════════
    // 3. QUIZZES
    // ═══════════════════════════════════════

    // Quiz pour Tajwid Avancé
    const quiz1 = await Quiz.create({
      titre: "Quiz - Les bases du Tajwid",
      cours: cours1._id,
      module: "Les bases du Tajwid",
      difficulty: "Intermédiaire",
      duration: 10,
      points: 100,
      passingScore: 70,
      questions: [
        {
          question: "Combien de points d'articulation (Makharij) principaux y a-t-il ?",
          options: ["3", "5", "17", "28"],
          correctAnswer: 2,
          explanation: "Il y a 17 points d'articulation principaux regroupés en 5 zones."
        },
        {
          question: "Qu'est-ce que l'Idgham ?",
          options: [
            "L'insertion d'une lettre dans une autre",
            "La prononciation claire d'une lettre",
            "Le masquage du son",
            "La transformation du Noon en Meem"
          ],
          correctAnswer: 0,
          explanation: "L'Idgham signifie l'insertion/fusion d'une lettre dans la suivante."
        },
        {
          question: "Quelle est la durée du Madd Tabii (prolongation naturelle) ?",
          options: ["1 temps", "2 temps", "4 temps", "6 temps"],
          correctAnswer: 1,
          explanation: "Le Madd Tabii dure exactement 2 temps (harakatain)."
        },
        {
          question: "Parmi ces lettres, laquelle est emphatique (Mufakhama) ?",
          options: ["ب (Ba)", "ص (Sad)", "ف (Fa)", "ك (Kaf)"],
          correctAnswer: 1,
          explanation: "Sad (ص) fait partie des lettres d'emphase (Isti'la)."
        },
        {
          question: "L'Ikhfa se produit avec combien de lettres ?",
          options: ["6", "10", "15", "4"],
          correctAnswer: 2,
          explanation: "L'Ikhfa (dissimulation) se produit avec 15 lettres de l'alphabet arabe."
        }
      ]
    });

    const quiz1b = await Quiz.create({
      titre: "Quiz - Les prolongations (Madd)",
      cours: cours1._id,
      module: "Les prolongations (Madd)",
      difficulty: "Avancé",
      duration: 12,
      points: 120,
      passingScore: 70,
      questions: [
        {
          question: "Quelle est la durée maximale du Madd Lazim ?",
          options: ["2 temps", "4 temps", "5 temps", "6 temps"],
          correctAnswer: 3,
          explanation: "Le Madd Lazim dure toujours 6 temps."
        },
        {
          question: "Le Madd Arid Lis-Sukun est dû à quoi ?",
          options: ["Une Hamza", "Un arrêt (waqf)", "Un Sukun original", "Une Shadda"],
          correctAnswer: 1,
          explanation: "Ce Madd est dû à un arrêt temporaire dans la récitation."
        },
        {
          question: "Combien de types de Madd Far'i existe-t-il ?",
          options: ["3", "5", "9", "14"],
          correctAnswer: 2,
          explanation: "Il y a 9 types de Madd dérivés selon les savants."
        }
      ]
    });

    // Quiz pour Arabe Classique
    const quiz2 = await Quiz.create({
      titre: "Quiz - L'alphabet arabe",
      cours: cours2._id,
      module: "L'alphabet arabe",
      difficulty: "Débutant",
      duration: 8,
      points: 80,
      passingScore: 60,
      questions: [
        {
          question: "Combien de lettres contient l'alphabet arabe ?",
          options: ["24", "26", "28", "30"],
          correctAnswer: 2,
          explanation: "L'alphabet arabe compte 28 lettres."
        },
        {
          question: "Quelle est la première lettre de l'alphabet arabe ?",
          options: ["ب (Ba)", "أ (Alif)", "ت (Ta)", "ع (Ain)"],
          correctAnswer: 1,
          explanation: "Alif (أ) est la première lettre de l'alphabet arabe."
        },
        {
          question: "Combien de voyelles courtes y a-t-il en arabe ?",
          options: ["2", "3", "4", "5"],
          correctAnswer: 1,
          explanation: "Il y a 3 voyelles courtes : Fatha, Damma et Kasra."
        },
        {
          question: "Que signifie le signe 'Shadda' (ـّ) ?",
          options: [
            "Absence de voyelle",
            "Voyelle longue",
            "Doublement de la lettre",
            "Arrêt de la lecture"
          ],
          correctAnswer: 2,
          explanation: "La Shadda indique que la lettre est doublée (prononcée deux fois)."
        },
        {
          question: "L'arabe s'écrit dans quelle direction ?",
          options: ["De gauche à droite", "De droite à gauche", "De haut en bas", "Cela dépend"],
          correctAnswer: 1,
          explanation: "L'arabe s'écrit et se lit de droite à gauche."
        }
      ]
    });

    // Quiz pour Fiqh des Prières
    const quiz3 = await Quiz.create({
      titre: "Quiz - Les conditions de la prière",
      cours: cours3._id,
      module: "Les conditions de la prière",
      difficulty: "Intermédiaire",
      duration: 10,
      points: 100,
      passingScore: 70,
      questions: [
        {
          question: "Combien de prières obligatoires y a-t-il par jour ?",
          options: ["3", "4", "5", "7"],
          correctAnswer: 2,
          explanation: "Les 5 prières obligatoires : Fajr, Dhuhr, Asr, Maghrib et Isha."
        },
        {
          question: "Quelle est la première condition de la prière ?",
          options: ["L'intention", "La purification", "Faire face à la Qibla", "Être musulman"],
          correctAnswer: 1,
          explanation: "La purification (Tahara) est la première condition selon la majorité des savants."
        },
        {
          question: "Le Tayammum est autorisé quand ?",
          options: [
            "Quand on est pressé",
            "Quand l'eau est absente ou nuisible",
            "Quand on est en voyage uniquement",
            "Quand on le souhaite"
          ],
          correctAnswer: 1,
          explanation: "Le Tayammum remplace les ablutions quand l'eau est indisponible ou nuisible."
        },
        {
          question: "Combien de Rak'at (unités) contient la prière de Fajr ?",
          options: ["2", "3", "4", "1"],
          correctAnswer: 0,
          explanation: "La prière de Fajr contient 2 Rak'at obligatoires."
        }
      ]
    });

    // Quiz pour Sciences du Hadith
    const quiz4 = await Quiz.create({
      titre: "Quiz - Classification des Hadiths",
      cours: cours4._id,
      module: "Classification des Hadiths",
      difficulty: "Intermédiaire",
      duration: 10,
      points: 100,
      passingScore: 70,
      questions: [
        {
          question: "Combien de conditions doit remplir un Hadith pour être classé Sahih ?",
          options: ["3", "4", "5", "7"],
          correctAnswer: 2,
          explanation: "Les 5 conditions : chaîne continue, narrateurs fiables, mémorisation, absence d'anomalie, absence de défaut caché."
        },
        {
          question: "Qui est l'auteur du recueil le plus authentique de Hadiths ?",
          options: ["Imam Muslim", "Imam Al-Bukhari", "Imam Ahmad", "Imam Malik"],
          correctAnswer: 1,
          explanation: "Le Sahih d'Al-Bukhari est considéré comme le recueil le plus authentique."
        },
        {
          question: "Qu'est-ce qu'un Hadith Mawdu' ?",
          options: [
            "Un hadith authentique",
            "Un hadith fabriqué/inventé",
            "Un hadith faible mais acceptable",
            "Un hadith avec peu de narrateurs"
          ],
          correctAnswer: 1,
          explanation: "Mawdu' signifie fabriqué, c'est un hadith inventé et attribué faussement au Prophète."
        },
        {
          question: "Qu'est-ce que l'Isnad ?",
          options: [
            "Le texte du hadith",
            "La chaîne de transmission",
            "Le commentaire du savant",
            "La classification du hadith"
          ],
          correctAnswer: 1,
          explanation: "L'Isnad est la chaîne de narrateurs qui transmettent le hadith."
        }
      ]
    });

    // Quiz pour Mémorisation du Coran
    const quiz5 = await Quiz.create({
      titre: "Quiz - Sourates courtes",
      cours: cours5._id,
      module: "Sourates An-Nas à Al-Falaq",
      difficulty: "Débutant",
      duration: 8,
      points: 80,
      passingScore: 60,
      questions: [
        {
          question: "Combien de versets contient Sourate Al-Ikhlas ?",
          options: ["3", "4", "5", "6"],
          correctAnswer: 1,
          explanation: "Sourate Al-Ikhlas contient 4 versets."
        },
        {
          question: "Quelle est la plus courte sourate du Coran ?",
          options: ["Al-Ikhlas", "Al-Kawthar", "An-Nas", "Al-Falaq"],
          correctAnswer: 1,
          explanation: "Sourate Al-Kawthar est la plus courte avec seulement 3 versets."
        },
        {
          question: "Sourate An-Nas parle de la protection contre quoi ?",
          options: [
            "Le feu",
            "Les chuchotements du diable",
            "Les maladies",
            "La pauvreté"
          ],
          correctAnswer: 1,
          explanation: "An-Nas est une demande de protection contre les chuchotements du mauvais (Al-Waswas)."
        },
        {
          question: "Quel est le meilleur moment pour mémoriser le Coran ?",
          options: ["Après le Dhuhr", "Après le Fajr", "Avant de dormir", "Après le Maghrib"],
          correctAnswer: 1,
          explanation: "Après la prière de Fajr, l'esprit est frais et la mémorisation est plus efficace."
        }
      ]
    });

    // Quiz pour Grammaire Arabe
    const quiz6 = await Quiz.create({
      titre: "Quiz - Le système verbal arabe",
      cours: cours6._id,
      module: "Le système verbal",
      difficulty: "Intermédiaire",
      duration: 10,
      points: 100,
      passingScore: 70,
      questions: [
        {
          question: "Comment s'appelle le verbe au passé en arabe ?",
          options: ["Al-Mudari'", "Al-Madi", "Al-Amr", "Al-Masdar"],
          correctAnswer: 1,
          explanation: "Al-Madi (الماضي) désigne le verbe au passé en grammaire arabe."
        },
        {
          question: "Combien de lettres racines a un verbe trilitère ?",
          options: ["2", "3", "4", "5"],
          correctAnswer: 1,
          explanation: "Un verbe trilitère (thulathi) a 3 lettres racines."
        },
        {
          question: "Qu'est-ce que le Fa'il ?",
          options: ["L'objet", "Le sujet/agent", "Le verbe", "Le complément"],
          correctAnswer: 1,
          explanation: "Le Fa'il est le sujet qui fait l'action dans la phrase verbale."
        },
        {
          question: "Le Mubtada et le Khabar forment quoi ?",
          options: [
            "Une phrase verbale",
            "Une phrase nominale",
            "Une préposition",
            "Un adverbe"
          ],
          correctAnswer: 1,
          explanation: "Le Mubtada (sujet) et le Khabar (prédicat) forment la phrase nominale (Jumlah Ismiyyah)."
        }
      ]
    });

    console.log(`📝 7 quizzes créés avec ${5+3+5+4+4+4+4} questions au total`);

    // ═══════════════════════════════════════
    // 4. PROGRESSION DES ÉTUDIANTS
    // ═══════════════════════════════════════
    
    // Étudiant 1 — a avancé dans le cours de Tajwid
    await Progress.create({
      utilisateur: etudiant1._id,
      cours: cours1._id,
      completedLessons: [
        cours1.modules[0].lecons[0]._id.toString(),
        cours1.modules[0].lecons[1]._id.toString(),
        cours1.modules[0].lecons[2]._id.toString(),
        cours1.modules[1].lecons[0]._id.toString()
      ],
      progress: 44,
      currentLesson: cours1.modules[1].lecons[1]._id.toString(),
      currentPosition: 120
    });

    // Étudiant 1 — a commencé l'Arabe Classique
    await Progress.create({
      utilisateur: etudiant1._id,
      cours: cours2._id,
      completedLessons: [
        cours2.modules[0].lecons[0]._id.toString()
      ],
      progress: 11,
      currentLesson: cours2.modules[0].lecons[1]._id.toString(),
      currentPosition: 0
    });

    // Étudiant 2 — a terminé toutes les leçons du cours gratuit
    const allCours5Lessons = [];
    cours5.modules.forEach(m => m.lecons.forEach(l => allCours5Lessons.push(l._id.toString())));
    await Progress.create({
      utilisateur: etudiant2._id,
      cours: cours5._id,
      completedLessons: allCours5Lessons,
      progress: 100,
      currentLesson: allCours5Lessons[allCours5Lessons.length - 1],
      currentPosition: 0
    });

    console.log("📊 3 progressions créées");

    // ═══════════════════════════════════════
    // 5. RÉSULTATS DE QUIZ
    // ═══════════════════════════════════════

    await QuizResult.create({
      utilisateur: etudiant1._id,
      quiz: quiz1._id,
      answers: [2, 0, 1, 1, 2],
      score: 100,
      totalQuestions: 5,
      correctAnswers: 5,
      duration: 420
    });

    await QuizResult.create({
      utilisateur: etudiant2._id,
      quiz: quiz5._id,
      answers: [1, 1, 1, 1],
      score: 100,
      totalQuestions: 4,
      correctAnswers: 4,
      duration: 300
    });

    await QuizResult.create({
      utilisateur: etudiant1._id,
      quiz: quiz2._id,
      answers: [2, 1, 1, 2, 0],
      score: 80,
      totalQuestions: 5,
      correctAnswers: 4,
      duration: 350
    });

    console.log("🏆 3 résultats de quiz créés");

    // ═══════════════════════════════════════
    // RÉSUMÉ
    // ═══════════════════════════════════════
    console.log("\n════════════════════════════════════════");
    console.log("✅ Base de données remplie avec succès !");
    console.log("════════════════════════════════════════");
    console.log("👥 Utilisateurs : 9 (1 admin, 3 enseignants, 5 étudiants)");
    console.log("📚 Cours       : 6 (avec modules et leçons)");
    console.log("📝 Quizzes     : 7 (avec 29 questions)");
    console.log("📊 Progressions: 3");
    console.log("🏆 Résultats   : 3");
    console.log("════════════════════════════════════════");
    console.log("\nComptes de test :");
    console.log("  Admin      : admin@safoua.com / admin123");
    console.log("  Enseignant : ahmed@safoua.com / password123");
    console.log("  Enseignant : fatima@safoua.com / password123");
    console.log("  Étudiant   : mohamed@example.com / password123");
    console.log("  Étudiant   : amina@example.com / password123");
    console.log("  Étudiant   : youssef@example.com / password123");
    console.log("════════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur seeding:", error);
    process.exit(1);
  }
};

seedDatabase();