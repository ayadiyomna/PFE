const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    platformeName: {
      type: String,
      default: 'Safoua Academy',
      required: true,
      trim: true,
      maxlength: [100, 'Platform name cannot exceed 100 characters'],
    },
    logo: {
      type: String, // URL or file path to logo
      default: null,
    },
    favicon: {
      type: String, // URL or file path to favicon
      default: null,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
      default: null,
      match: [
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        'Please provide a valid phone number',
      ],
    },
    socialLinks: {
      facebook: {
        type: String,
        default: null,
        trim: true,
      },
      linkedin: {
        type: String,
        default: null,
        trim: true,
      },
      twitter: {
        type: String,
        default: null,
        trim: true,
      },
      instagram: {
        type: String,
        default: null,
        trim: true,
      },
      youtube: {
        type: String,
        default: null,
        trim: true,
      },
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Ensure only one Settings document exists
settingsSchema.statics.getOrCreate = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ email: 'contact@safouaacademy.com' });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
