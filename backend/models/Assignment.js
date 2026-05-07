const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, default: '' },
  cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Cours', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
