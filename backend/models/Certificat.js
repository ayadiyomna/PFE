const mongoose = require('mongoose');

const certificatSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours',
    required: true
  },
  code: {
    type: String,
    unique: true,
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  dateDelivrance: {
    type: Date,
    default: Date.now
  },
  pdfUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Générer un code unique avant sauvegarde
certificatSchema.pre('save', async function(next) {
  if (!this.code) {
    const prefix = 'SAF';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.code = `${prefix}-${date}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Certificat', certificatSchema);