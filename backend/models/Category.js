const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la catégorie est requis'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    icon: {
      type: String,
      default: '📚'
    },
    couleur: {
      type: String,
      default: '#10b981'
    },
    actif: {
      type: Boolean,
      default: true
    },
    ordre: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

categorySchema.pre('save', function (next) {
  if (this.isModified('nom')) {
    this.slug = this.nom
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
