const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const Cours = require('../models/Cours');
const User = require('../models/User');

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

router.get('/enseignant/mes-cours', protect, authorizeRoles('enseignant', 'admin', 'administrateur'), async (req, res) => {
  try {
    const cours = await Cours.find({ instructeur: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: cours });
  } catch (error) {
    console.error('Erreur dans /enseignant/mes-cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours'
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

    if (cours.instructeur.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

    if (cours.instructeur.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

module.exports = router;