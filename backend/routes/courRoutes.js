const express = require("express");
const router = express.Router();
const Cours = require("../models/Cours");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

// @desc    Get all courses
// @route   GET /api/cours
// @access  Public

router.get("/courslist", async (req, res) => {
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
      .populate("enseignant", "nom prenom")
      .sort({ createdAt: -1 }); // par défaut plus récent

    // 🔃 Tri personnalisé
    if (sort === "prix_asc") {
      coursQuery = Cours.find(query)
        .populate("enseignant", "nom prenom")
        .sort({ prix: 1 });
    }

    if (sort === "prix_desc") {
      coursQuery = Cours.find(query)
        .populate("enseignant", "nom prenom")
        .sort({ prix: -1 });
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

module.exports = router;