const Settings = require('../models/Settings');
const path = require('path');

// @desc    Get platform settings (public)
// @route   GET /api/settings
// @access  Public
exports.getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // Create default settings if none exists
    if (!settings) {
      settings = await Settings.create({
        email: 'contact@safouaacademy.com',
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving settings',
      error: error.message,
    });
  }
};

// @desc    Get platform settings (admin)
// @route   GET /api/settings/admin
// @access  Private/Admin
exports.getAdminSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne().populate('updatedBy', 'nom prenom email');

    // Create default settings if none exists
    if (!settings) {
      settings = await Settings.create({
        email: 'contact@safouaacademy.com',
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving settings',
      error: error.message,
    });
  }
};

// @desc    Update platform settings
// @route   PUT /api/settings/:id
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const { platformeName, email, phone, socialLinks } = req.body;

    // Find existing settings
    let settings = await Settings.findById(req.params.id);
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found',
      });
    }

    // Update basic fields
    if (platformeName) settings.platformeName = platformeName;
    if (email) settings.email = email;
    if (phone) settings.phone = phone;
    if (socialLinks) {
      settings.socialLinks = {
        ...settings.socialLinks,
        ...socialLinks,
      };
    }

    // Handle logo upload
    if (req.files && req.files.logo) {
      const logoFile = req.files.logo;
      const logoPath = `/uploads/settings/logo-${Date.now()}-${logoFile.name}`;
      await logoFile.mv(path.join(__dirname, `../uploads/settings/${path.basename(logoPath)}`));
      settings.logo = logoPath;
    }

    // Handle favicon upload
    if (req.files && req.files.favicon) {
      const faviconFile = req.files.favicon;
      const faviconPath = `/uploads/settings/favicon-${Date.now()}-${faviconFile.name}`;
      await faviconFile.mv(
        path.join(__dirname, `../uploads/settings/${path.basename(faviconPath)}`)
      );
      settings.favicon = faviconPath;
    }

    // Track who updated the settings
    settings.updatedBy = req.user._id;

    await settings.save();

    // Populate updatedBy before returning
    await settings.populate('updatedBy', 'nom prenom email');

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message,
    });
  }
};

// @desc    Delete logo
// @route   DELETE /api/settings/:id/logo
// @access  Private/Admin
exports.deleteLogo = async (req, res) => {
  try {
    const settings = await Settings.findById(req.params.id);
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found',
      });
    }

    if (settings.logo) {
      const logoPath = path.join(__dirname, `../..${settings.logo}`);
      try {
        const fs = require('fs');
        fs.unlinkSync(logoPath);
      } catch (err) {
        console.log('Error deleting logo file:', err.message);
      }
    }

    settings.logo = null;
    settings.updatedBy = req.user._id;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Logo deleted successfully',
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting logo',
      error: error.message,
    });
  }
};

// @desc    Delete favicon
// @route   DELETE /api/settings/:id/favicon
// @access  Private/Admin
exports.deleteFavicon = async (req, res) => {
  try {
    const settings = await Settings.findById(req.params.id);
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found',
      });
    }

    if (settings.favicon) {
      const faviconPath = path.join(__dirname, `../..${settings.favicon}`);
      try {
        const fs = require('fs');
        fs.unlinkSync(faviconPath);
      } catch (err) {
        console.log('Error deleting favicon file:', err.message);
      }
    }

    settings.favicon = null;
    settings.updatedBy = req.user._id;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Favicon deleted successfully',
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting favicon',
      error: error.message,
    });
  }
};
