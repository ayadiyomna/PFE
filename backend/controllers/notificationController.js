const Notification = require('../models/Notification');

/**
 * Récupérer les notifications de l'utilisateur
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ utilisateur: req.user._id })
      .sort('-createdAt')
      .limit(20);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Erreur getNotifications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Marquer une notification comme lue
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, utilisateur: req.user._id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Erreur markAsRead:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Marquer toutes les notifications comme lues
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { utilisateur: req.user._id, read: false },
      { read: true }
    );
    
    res.json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  } catch (error) {
    console.error('Erreur markAllAsRead:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};

// Liste des demandes (notifications de type 'message') pour les administrateurs
module.exports.getContactRequests = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const requests = await Notification.find({ type: 'message' }).sort('-createdAt');
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Erreur getContactRequests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Créer une demande de contact / requête vers l'admin (depuis un enseignant)
 * Cette route crée une notification pour chaque administrateur
 */
const createContactRequest = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Le message est requis' });
    }

    const User = require('../models/User');
    const admins = await User.find({ role: 'administrateur' });

    if (!admins || admins.length === 0) {
      return res.status(404).json({ success: false, message: 'Aucun administrateur trouvé' });
    }

    const fromUser = req.user;
    const title = subject && subject.trim() ? `Demande: ${subject.trim()}` : 'Demande de création de cours';
    const fullMessage = `${fromUser.prenom || ''} ${fromUser.nom || ''} <${fromUser.email}>\n\n${message}`;

    const created = [];
    for (const admin of admins) {
      const n = await Notification.create({
        utilisateur: admin._id,
        type: 'message',
        title,
        message: fullMessage,
        data: { from: fromUser._id, fromEmail: fromUser.email }
      });
      created.push(n);
    }

    res.status(201).json({ success: true, data: created, message: 'Demande envoyée aux administrateurs' });
  } catch (error) {
    console.error('Erreur createContactRequest:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.createContactRequest = createContactRequest;