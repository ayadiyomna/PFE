const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

// Import des routes
const userRoutes = require("./routes/userRoutes");
const coursRoutes = require("./routes/cours");

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Dossier static pour les uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Logger simple
app.use((req, res, next) => {
  console.log(`📌 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ✅ ROUTE HEALTH CHECK - AJOUTÉE ICI
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    success: true,
    status: "OK",
    message: "Serveur backend opérationnel",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes principales
app.use("/api/users", userRoutes);
app.use("/api/cours", coursRoutes);

// Route de test racine
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "API Safoua Academy fonctionne!",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      users: "/api/users",
      cours: "/api/cours"
    }
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route non trouvée: ${req.method} ${req.url}` 
  });
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur:", err);
  res.status(500).json({ 
    success: false,
    message: "Erreur interne du serveur"
  });
});

// Connexion à MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb://127.0.0.1:27017/safoua_academy";

console.log("🔄 Tentative de connexion à MongoDB...");
console.log(`📊 URI: ${MONGO_URI}`);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB avec succès");
    console.log(`📊 Base de données: ${mongoose.connection.name}`);
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion à MongoDB:");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    
    // Démarrer quand même le serveur sans MongoDB
    console.log("⚠️ Démarrage du serveur sans base de données (mode démo)");
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré en mode démo sur http://localhost:${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
      console.log("⚠️ Les données ne seront pas persistées (MongoDB non connecté)");
    });
  });

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('🔌 Connexion MongoDB fermée');
    process.exit(0);
  });
});