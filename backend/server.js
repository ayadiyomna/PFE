// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

// Import des routes
const userRoutes = require("./routes/userRoutes");
const coursRoutes = require("./routes/courRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dossier static pour les uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Logger simple pour le développement
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/cours", coursRoutes);

// Route de test
app.get("/", (req, res) => {
  res.json({ 
    message: "API Safoua Academy fonctionne!",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      cours: "/api/cours"
    }
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route non trouvée" 
  });
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err);
  res.status(500).json({ 
    success: false,
    message: "Erreur interne du serveur",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connexion à MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/safoua_academy";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB avec succès");
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📚 Documentation: http://localhost:${PORT}/`);
    });
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion à MongoDB:");
    console.error(err);
    process.exit(1);
  });

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Connexion MongoDB fermée');
    process.exit(0);
  });
});