const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema({
  name: { 
    type: String, 
    default: 'llama3',
    required: true 
  },
  systemPrompt: { 
    type: String, 
    required: true 
  },
  temperature: { 
    type: Number, 
    default: 0.7,
    min: 0,
    max: 1 
  },
  maxTokens: { 
    type: Number, 
    default: 512,
    min: 100,
    max: 2000 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Mettre à jour la date de modification
aiModelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AIModel', aiModelSchema);