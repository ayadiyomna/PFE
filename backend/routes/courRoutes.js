const express = require("express");
const router = express.Router();
const Cours = require("../models/Cours");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

router.get("/courslist", async (req, res) => {
  try {
    const cours = await Cours.find().populate("enseignant", "nom prenom");
    res.json(cours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;