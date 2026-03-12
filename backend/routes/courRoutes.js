const express = require("express");
const router = express.Router();
const Cours = require("../models/Cours");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

// @desc    Get all courses
// @route   GET /api/cours
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { niveau, search, sort } = req.query;
    let query = {};

    // 🔎 Filtrage par niveau
    if (niveau) {
      query.niveau = niveau;
    }

    // 🔍 Recherche par titre
    if (search) {
      query.titre = { $regex: search, $options: "i" };
    }

    let coursQuery = Cours.find(query)
      .populate("enseignant", "nom prenom email")
      .sort({ createdAt: -1 });

    // 🔃 Tri personnalisé
    if (sort === "prix_asc") {
      coursQuery = coursQuery.sort({ prix: 1 });
    } else if (sort === "prix_desc") {
      coursQuery = coursQuery.sort({ prix: -1 });
    } else if (sort === "titre_asc") {
      coursQuery = coursQuery.sort({ titre: 1 });
    }

    const cours = await coursQuery;

    res.status(200).json({
      success: true,
      count: cours.length,
      data: cours,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get single course
// @route   GET /api/cours/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id)
      .populate("enseignant", "nom prenom email bio");

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: "Cours non trouvé"
      });
    }

    res.status(200).json({
      success: true,
      data: cours
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Create course
// @route   POST /api/cours
// @access  Private (Enseignant/Admin)
router.post("/", protect, authorizeRoles('enseignant', 'admin'), async (req, res) => {
  try {
    const coursData = {
      ...req.body,
      enseignant: req.user.id // L'enseignant connecté
    };

    const cours = await Cours.create(coursData);

    res.status(201).json({
      success: true,
      data: cours
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Update course
// @route   PUT /api/cours/:id
// @access  Private (Enseignant/Admin)
router.put("/:id", protect, authorizeRoles('enseignant', 'admin'), async (req, res) => {
  try {
    let cours = await Cours.findById(req.params.id);

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: "Cours non trouvé"
      });
    }

    // Vérifier que l'enseignant est bien le propriétaire (sauf admin)
    if (req.user.role !== 'admin' && cours.enseignant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à modifier ce cours"
      });
    }

    cours = await Cours.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: cours
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Delete course
// @route   DELETE /api/cours/:id
// @access  Private (Enseignant/Admin)
router.delete("/:id", protect, authorizeRoles('enseignant', 'admin'), async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id);

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: "Cours non trouvé"
      });
    }

    // Vérifier que l'enseignant est bien le propriétaire (sauf admin)
    if (req.user.role !== 'admin' && cours.enseignant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à supprimer ce cours"
      });
    }

    await cours.deleteOne();

    res.status(200).json({
      success: true,
      message: "Cours supprimé avec succès"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get teacher's courses
// @route   GET /api/cours/enseignant/mes-cours
// @access  Private (Enseignant)
router.get("/enseignant/mes-cours", protect, authorizeRoles('enseignant', 'admin'), async (req, res) => {
  try {
    const cours = await Cours.find({ enseignant: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cours.length,
      data: cours
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Search courses
// @route   GET /api/cours/recherche
// @access  Public
router.get("/recherche", async (req, res) => {
  try {
    const { q, niveau, minPrix, maxPrix } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { titre: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ];
    }

    if (niveau) {
      query.niveau = niveau;
    }

    if (minPrix || maxPrix) {
      query.prix = {};
      if (minPrix) query.prix.$gte = parseInt(minPrix);
      if (maxPrix) query.prix.$lte = parseInt(maxPrix);
    }

    const cours = await Cours.find(query)
      .populate("enseignant", "nom prenom")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cours.length,
      data: cours
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Route existante (gardée pour compatibilité)
router.get("/courslist", async (req, res) => {
  try {
    const cours = await Cours.find()
      .populate("enseignant", "nom prenom")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cours.length,
      data: cours,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;