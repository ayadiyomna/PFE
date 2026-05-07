const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Cours = require('./models/Cours');
const Assignment = require('./models/Assignment');

async function seedAssignments() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/safoua_academy';
  await mongoose.connect(MONGO_URI);
  console.log('🔌 Connecté à MongoDB pour seedAssignments');

  try {
    // Nettoyer les assignments existants (optionnel)
    await Assignment.deleteMany({});

    // Récupérer quelques cours et un utilisateur existant
    const courses = await Cours.find().limit(2);
    const user = await User.findOne();

    if (!courses || courses.length === 0) {
      console.warn('⚠️ Aucun cours trouvé pour attacher les assignments. Créez d\'abord des cours via seeds.js');
      process.exit(0);
    }

    const now = new Date();
    const assignments = [];

    assignments.push({
      titre: 'Devoir: Résumé du module 1',
      description: 'Rédigez un court résumé des points clés du module 1.',
      cours: courses[0]._id,
      createdBy: user?._id,
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // +7 jours
    });

    if (courses[1]) {
      assignments.push({
        titre: 'Quiz pratique: Chapitre 2',
        description: 'Complétez le quiz pratique sur le chapitre 2.',
        cours: courses[1]._id,
        createdBy: user?._id,
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // +3 jours
      });
    }

    const created = await Assignment.insertMany(assignments);
    console.log('✅ Assignments seedés:', created.map(a => ({ id: a._id, titre: a.titre })));
  } catch (err) {
    console.error('Erreur seedAssignments:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

seedAssignments();
