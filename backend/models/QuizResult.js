const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    type: Number,
    default: null
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour éviter les doublons de tentative par quiz
quizResultSchema.index({ utilisateur: 1, quiz: 1, completedAt: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);