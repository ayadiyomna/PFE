const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
  completedLessons: [{
    type: String,
    default: []
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentLesson: {
    type: String,
    default: null
  },
  currentPosition: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index unique pour éviter les doublons
progressSchema.index({ utilisateur: 1, cours: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);