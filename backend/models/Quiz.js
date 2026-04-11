const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0
  },
  explanation: {
    type: String,
    default: ''
  }
});

const quizSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours',
    required: true
  },
  module: {
    type: String,
    default: 'Général'
  },
  questions: [questionSchema],
  duration: {
    type: Number,
    default: 15 // minutes
  },
  difficulty: {
    type: String,
    enum: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'],
    default: 'Intermédiaire'
  },
  points: {
    type: Number,
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passingScore: {
    type: Number,
    default: 70
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);