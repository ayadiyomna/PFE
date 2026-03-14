const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  description: String,
  videoUrl: String,
  duree: Number, // en minutes
  ordre: Number,
  ressources: [{
    titre: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'audio', 'lien'],
      default: 'pdf'
    },
    url: String,
    taille: String
  }]
});

const moduleSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  description: String,
  ordre: Number,
  duree: Number,
  lecons: [lessonSchema]
});

const avisSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  note: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  commentaire: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const coursSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire']
  },
  categorie: {
    type: String,
    required: [true, 'La catégorie est obligatoire']
  },
  niveau: {
    type: String,
    enum: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'],
    required: [true, 'Le niveau est obligatoire']
  },
  langue: {
    type: String,
    default: 'Français'
  },
  prix: {
    type: Number,
    required: [true, 'Le prix est obligatoire'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop'
  },
  instructeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modules: [moduleSchema],
  objectifs: [String],
  prerequis: [String],
  dureeTotale: {
    type: Number,
    default: 0
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  nombreAvis: {
    type: Number,
    default: 0
  },
  avis: [avisSchema],
  certificat: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Brouillon', 'Publié', 'Archivé'],
    default: 'Brouillon'
  },
  datePublication: Date,
  derniereMiseAJour: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour la recherche textuelle
coursSchema.index({ 
  titre: 'text', 
  description: 'text', 
  categorie: 'text' 
});

// Middleware pour calculer la durée totale avant sauvegarde
coursSchema.pre('save', function(next) {
  if (this.modules && this.modules.length > 0) {
    this.dureeTotale = this.modules.reduce((total, module) => {
      return total + (module.duree || 0);
    }, 0);
  }
  next();
});

module.exports = mongoose.model('Cours', coursSchema);