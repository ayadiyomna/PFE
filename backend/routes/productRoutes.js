import express from "express";
import Product from "../models/Product.js";
const router = express.Router();
// GET /products?page=1&limit=10
router.get("/", async (req, res) => {
  try {
    // 1. Lire les paramètres
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Récupérer les données
    const products = await Product.find().skip(skip).limit(limit);

    // 3. Compter le total
    const total = await Product.countDocuments();

    // 4. Réponse JSON
    res.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
