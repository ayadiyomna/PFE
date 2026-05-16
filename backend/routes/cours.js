const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const Cours = require('../models/Cours');
const User = require('../models/User');
const Progress = require('../models/Progress');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for resource uploads (pdf, video, audio)
const resourcesDir = path.join(__dirname, '../uploads/resources');
if (!fs.existsSync(resourcesDir)) fs.mkdirSync(resourcesDir, { recursive: true });

const resourceStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, resourcesDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const resourceFileFilter = (req, file, cb) => {
  const allowed = /pdf|mp4|mkv|mov|webm|mp3|wav|ogg|doc|docx|ppt|pptx/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Type de fichier non autorisé'));
};

const resourceUpload = multer({ storage: resourceStorage, limits: { fileSize: 200 * 1024 * 1024 }, fileFilter: resourceFileFilter });

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'Cours API',
    version: '1.0.0'
  });
});

router.get('/courslist', async (req, res) => {
  try {
    const { categorie, niveau, search, page = 1, limit = 10 } = req.query;

    let query = { status: 'Publié' };

    if (categorie) query.categorie = categorie;
    if (niveau) query.niveau = niveau;

    if (search) {
      query.$or = [
        { titre: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const cours = await Cours.find(query)
      .populate('instructeur', 'nom prenom email')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Cours.countDocuments(query);

    res.json({
      success: true,
      data: cours,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur dans /courslist:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours',
      error: error.message
    });
  }
});

router.get('/admin/courslist', protect, authorizeRoles('admin', 'administrateur'), async (req, res) => {
  try {
    const { categorie, niveau, status, search, page = 1, limit = 20 } = req.query;

    let query = {};

    if (categorie) query.categorie = categorie;
    if (niveau) query.niveau = niveau;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { titre: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const cours = await Cours.find(query)
      .populate('instructeur', 'nom prenom email')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Cours.countDocuments(query);

    res.json({
      success: true,
      data: cours,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur dans /admin/courslist:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours admin',
      error: error.message
    });
  }
});

// Retourne la liste des catégories distinctes utilisées sur la plateforme
router.get('/categories', async (req, res) => {
  try {
    const categories = await Cours.distinct('categorie');
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Erreur dans GET /categories:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des catégories', error: error.message });
  }
});

router.get('/enseignant/mes-cours', protect, authorizeRoles('enseignant', 'admin', 'administrateur'), async (req, res) => {
  try {
    const cours = await Cours.find({ instructeur: req.user._id })
      .populate('students', 'nom prenom email createdAt')
      .sort('-createdAt');
    res.json({ success: true, data: cours });
  } catch (error) {
    console.error('Erreur dans /enseignant/mes-cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours'
    });
  }
});

router.get('/enseignant/:courseId/etudiants', protect, authorizeRoles('enseignant', 'admin', 'administrateur'), async (req, res) => {
  try {
    // Validation de l'ID du cours
    if (!req.params.courseId || req.params.courseId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'ID du cours invalide'
      });
    }

    const cours = await Cours.findById(req.params.courseId);

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    // Vérifier si l'utilisateur est l'instructeur ou un admin
    const instructeurId = cours.instructeur?.toString ? cours.instructeur.toString() : cours.instructeur;
    const userId = req.user._id?.toString ? req.user._id.toString() : req.user._id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'administrateur';

    if (instructeurId !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir les étudiants de ce cours'
      });
    }

    // Récupérer la progression de chaque étudiant
    const studentsWithProgress = await Promise.all(
      (cours.students || []).map(async (studentId) => {
        try {
          // Récupérer les infos de l'étudiant
          const student = await User.findById(studentId).select('nom prenom email');
          const progress = await Progress.findOne({ 
            utilisateur: studentId, 
            cours: req.params.courseId 
          });
          
          return {
            _id: student?._id,
            nom: student?.nom || '',
            prenom: student?.prenom || '',
            email: student?.email || '',
            dateInscription: new Date(),
            progression: progress?.progress || 0,
            leçonsCompletées: progress?.completedLessons?.length || 0,
            note: progress?.averageScore || 0
          };
        } catch (err) {
          console.error('Erreur récupération données étudiant:', err);
          return {
            _id: studentId,
            nom: 'Inconnu',
            prenom: '',
            email: 'N/A',
            dateInscription: new Date(),
            progression: 0,
            leçonsCompletées: 0,
            note: 0
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        coursId: cours._id,
        coursTitre: cours.titre || 'Sans titre',
        nombreEtudiants: studentsWithProgress.length,
        etudiants: studentsWithProgress
      }
    });
  } catch (error) {
    console.error('Erreur dans GET /enseignant/:courseId/etudiants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des étudiants',
      error: error.message
    });
  }
});

router.get('/etudiant/mes-cours', protect, async (req, res) => {
  try {
    const cours = await Cours.find({ students: req.user._id })
      .populate('instructeur', 'nom prenom')
      .sort('-createdAt');

    res.json({ success: true, data: cours });
  } catch (error) {
    console.error('Erreur dans /etudiant/mes-cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours'
    });
  }
});

router.post('/', protect, authorizeRoles('enseignant', 'admin', 'administrateur'), async (req, res) => {
  try {
    let instructeurId = req.user._id;

    if ((req.user.role === 'admin' || req.user.role === 'administrateur') && req.body.instructeur) {
      instructeurId = req.body.instructeur;
    }

    const coursData = {
      ...req.body,
      instructeur: instructeurId,
      status: req.body.status || 'Brouillon',
      students: []
    };

    console.log('📝 Données du cours reçues:', coursData);

    const cours = new Cours(coursData);
    await cours.save();

    res.status(201).json({
      success: true,
      data: cours,
      message: 'Cours créé avec succès'
    });
  } catch (error) {
    console.error('Erreur dans POST /cours:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      console.error('Erreurs de validation:', errors);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors
      });
    }
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création du cours'
    });
  }
});

router.get('/:id/avis', async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id)
      .populate('avis.utilisateur', 'nom prenom email');

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    res.json({
      success: true,
      data: cours.avis || []
    });
  } catch (error) {
    console.error('Erreur dans GET /cours/:id/avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis'
    });
  }
});

router.post('/:id/avis', protect, async (req, res) => {
  try {
    const { note, commentaire } = req.body;

    if (!note || note < 1 || note > 5) {
      return res.status(400).json({
        success: false,
        message: 'La note doit être entre 1 et 5'
      });
    }

    const cours = await Cours.findById(req.params.id);

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    if (!cours.students.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez être inscrit pour laisser un avis'
      });
    }

    const dejaAvis = cours.avis.some(a => a.utilisateur.toString() === req.user._id.toString());
    if (dejaAvis) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà laissé un avis'
      });
    }

    cours.avis.push({
      utilisateur: req.user._id,
      note,
      commentaire,
      date: Date.now()
    });

    const totalNotes = cours.avis.reduce((sum, a) => sum + a.note, 0);
    cours.rating = totalNotes / cours.avis.length;
    cours.nombreAvis = cours.avis.length;

    await cours.save();

    res.json({
      success: true,
      message: 'Avis ajouté avec succès',
      data: {
        rating: cours.rating,
        nombreAvis: cours.nombreAvis
      }
    });
  } catch (error) {
    console.error('Erreur dans POST /:id/avis:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de l'ajout de l'avis"
    });
  }
});

router.post('/:id/inscrire', protect, async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id);
    if (!cours) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    const isAlreadyEnrolled = cours.students.some(
      studentId => studentId.toString() === req.user._id.toString()
    );

    if (isAlreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Vous êtes déjà inscrit à ce cours'
      });
    }

    cours.students.push(req.user._id);
    await cours.save();

    res.json({
      success: true,
      message: 'Inscription réussie au cours'
    });
  } catch (error) {
    console.error('Erreur dans POST /cours/:id/inscrire:', error);
    res.status(400).json({
      success: false,
      message: error.message || "Erreur lors de l'inscription"
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id)
      .populate('instructeur', 'nom prenom email')
      .populate('students', 'nom prenom email');

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    res.json({
      success: true,
      data: cours
    });
  } catch (error) {
    console.error('Erreur dans /cours/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du cours',
      error: error.message
    });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id);

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    if (cours.instructeur.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'administrateur') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce cours'
      });
    }

    const updatedCours = await Cours.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        derniereMiseAJour: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: updatedCours,
      message: 'Cours mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur dans PUT /cours/:id:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour'
    });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id);

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    if (cours.instructeur.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'administrateur') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce cours'
      });
    }

    await cours.deleteOne();

    res.json({
      success: true,
      message: 'Cours supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur dans DELETE /cours/:id:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression'
    });
  }
});

// Helper: remove lesson ids from all Progress documents and recalc progress
async function _removeLessonsFromProgress(courseId, lessonIds) {
  try {
    const progresses = await Progress.find({ cours: courseId });
    for (const p of progresses) {
      const before = p.completedLessons.length;
      p.completedLessons = p.completedLessons.filter(id => !lessonIds.includes(id.toString()));
      // Recalculate progress percentage
      const course = await Cours.findById(courseId);
      const totalLessons = course.modules?.reduce((s, m) => s + (m.lecons?.length || 0), 0) || 0;
      p.progress = totalLessons === 0 ? 0 : Math.round((p.completedLessons.length / totalLessons) * 100);
      await p.save();
    }
  } catch (err) {
    console.error('Erreur lors du nettoyage des Progress après suppression de leçon/module:', err);
  }
}

// === Modules CRUD ===
router.post('/:courseId/modules', protect, authorizeRoles('enseignant', 'admin', 'administrateur'), async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.courseId);
    if (!cours) return res.status(404).json({ success: false, message: 'Cours non trouvé' });

    if (cours.instructeur.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'administrateur') {
      return res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé à modifier ce cours' });
    }

    const newModule = {
      titre: req.body.titre,
      description: req.body.description || '',
      ordre: req.body.ordre || (cours.modules.length + 1),
      duree: req.body.duree || 0,
      lecons: []
    };

    cours.modules.push(newModule);
    await cours.save();

    res.status(201).json({ success: true, data: cours.modules[cours.modules.length - 1], message: 'Module ajouté avec succès' });
  } catch (error) {
    console.error('Erreur dans POST /:courseId/modules:', error);
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de l\'ajout du module' });
  }
});

router.put('/:courseId/modules/:moduleId', protect, authorizeRoles('enseignant', 'admin', 'administrateur'), async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.courseId);
    if (!cours) return res.status(404).json({ success: false, message: 'Cours non trouvé' });

    if (cours.instructeur.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'administrateur') {
      return res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé à modifier ce cours' });
    }

    const moduleIndex = cours.modules.findIndex(m => m._id.toString() === req.params.moduleId);
    if (moduleIndex === -1) return res.status(404).json({ success: false, message: 'Module non trouvé' });

    cours.modules[moduleIndex] = { ...cours.modules[moduleIndex].toObject(), ...req.body, _id: cours.modules[moduleIndex]._id };
    await cours.save();

    res.json({ success: true, data: cours.modules[moduleIndex], message: 'Module mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur dans PUT /:courseId/modules/:moduleId:', error);
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de la mise à jour du module' });
  }
});

router.delete('/:courseId/modules/:moduleId', protect, authorizeRoles('enseignant', 'admin', 'administrateur'), async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.courseId);
    if (!cours) return res.status(404).json({ success: false, message: 'Cours non trouvé' });

    if (cours.instructeur.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'administrateur') {
      return res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé à modifier ce cours' });
    }

    const module = cours.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ success: false, message: 'Module non trouvé' });

    const lessonIds = (module.lecons || []).map(l => l._id.toString());
    module.remove();
    await cours.save();

    // Cleanup progress
    if (lessonIds.length) await _removeLessonsFromProgress(cours._id, lessonIds);

    res.json({ success: true, message: 'Module supprimé avec succès' });
  } catch (error) {
    console.error('Erreur dans DELETE /:courseId/modules/:moduleId:', error);
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de la suppression du module' });
  }
});

// === Leçons (Lessons) CRUD ===
router.post('/:courseId/modules/:moduleId/lecons', protect, authorizeRoles('enseignant', 'admin', 'administrateur'), async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.courseId);
    if (!cours) return res.status(404).json({ success: false, message: 'Cours non trouvé' });

    if (cours.instructeur.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'administrateur') {
      return res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé à modifier ce cours' });
    }

    const module = cours.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ success: false, message: 'Module non trouvé' });

    const newLesson = {
      titre: req.body.titre,
      description: req.body.description || '',
      videoUrl: req.body.videoUrl || '',
      duree: req.body.duree || 0,
      ordre: req.body.ordre || (module.lecons.length + 1),
      ressources: req.body.ressources || []
    };

    module.lecons.push(newLesson);
    await cours.save();

    res.status(201).json({ success: true, data: module.lecons[module.lecons.length - 1], message: 'Leçon ajoutée avec succès' });
  } catch (error) {
    console.error('Erreur dans POST /:courseId/modules/:moduleId/lecons:', error);
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de l\'ajout de la leçon' });
  }
});

router.put('/:courseId/modules/:moduleId/lecons/:lessonId', protect, authorizeRoles('enseignant', 'admin', 'administrateur'), async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.courseId);
    if (!cours) return res.status(404).json({ success: false, message: 'Cours non trouvé' });

    if (cours.instructeur.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'administrateur') {
      return res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé à modifier ce cours' });
    }

    const module = cours.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ success: false, message: 'Module non trouvé' });

    const lesson = module.lecons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Leçon non trouvée' });

    Object.assign(lesson, req.body);
    await cours.save();

    res.json({ success: true, data: lesson, message: 'Leçon mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur dans PUT /:courseId/modules/:moduleId/lecons/:lessonId:', error);
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de la mise à jour de la leçon' });
  }
});

router.delete('/:courseId/modules/:moduleId/lecons/:lessonId', protect, authorizeRoles('enseignant', 'admin', 'administrateur'), async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.courseId);
    if (!cours) return res.status(404).json({ success: false, message: 'Cours non trouvé' });

    if (cours.instructeur.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'administrateur') {
      return res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé à modifier ce cours' });
    }

    const module = cours.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ success: false, message: 'Module non trouvé' });

    const lesson = module.lecons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Leçon non trouvée' });

    const removedId = lesson._id.toString();
    lesson.remove();
    await cours.save();

    // Cleanup progress entries that referenced this lesson
    await _removeLessonsFromProgress(cours._id, [removedId]);

    res.json({ success: true, message: 'Leçon supprimée avec succès' });
  } catch (error) {
    console.error('Erreur dans DELETE /:courseId/modules/:moduleId/lecons/:lessonId:', error);
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de la suppression de la leçon' });
  }
});

// === Ressources ===
router.post('/:courseId/modules/:moduleId/lecons/:lessonId/ressources', protect, authorizeRoles('enseignant', 'admin', 'administrateur'), async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.courseId);
    if (!cours) return res.status(404).json({ success: false, message: 'Cours non trouvé' });

    if (cours.instructeur.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'administrateur') {
      return res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé à modifier ce cours' });
    }

    const module = cours.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ success: false, message: 'Module non trouvé' });

    const lesson = module.lecons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Leçon non trouvée' });

    const newResource = {
      titre: req.body.titre,
      type: req.body.type || 'pdf',
      url: req.body.url,
      taille: req.body.taille || ''
    };

    lesson.ressources.push(newResource);
    await cours.save();

    res.status(201).json({ success: true, data: lesson.ressources[lesson.ressources.length - 1], message: 'Ressource ajoutée avec succès' });
  } catch (error) {
    console.error('Erreur dans POST ressources:', error);
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de l\'ajout de la ressource' });
  }
});

router.delete('/:courseId/modules/:moduleId/lecons/:lessonId/ressources/:resourceId', protect, authorizeRoles('enseignant', 'admin', 'administrateur'), async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.courseId);
    if (!cours) return res.status(404).json({ success: false, message: 'Cours non trouvé' });

    if (cours.instructeur.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'administrateur') {
      return res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé à modifier ce cours' });
    }

    const module = cours.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ success: false, message: 'Module non trouvé' });

    const lesson = module.lecons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Leçon non trouvée' });

    lesson.ressources = lesson.ressources.filter(r => r._id.toString() !== req.params.resourceId);
    await cours.save();

    res.json({ success: true, message: 'Ressource supprimée avec succès' });
  } catch (error) {
    console.error('Erreur dans DELETE ressource:', error);
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de la suppression de la ressource' });
  }
});

// Upload file endpoint for resources (returns file URL path)
router.post('/upload/resource', protect, authorizeRoles('enseignant', 'admin', 'administrateur'), resourceUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Fichier manquant' });
    const relativePath = path.relative(path.join(__dirname, '..'), req.file.path).split(path.sep).join('/');
    res.status(201).json({ success: true, data: { url: `/${relativePath}` }, message: 'Fichier uploadé' });
  } catch (error) {
    console.error('Erreur dans POST /upload/resource:', error);
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de l\'upload' });
  }
});

module.exports = router;