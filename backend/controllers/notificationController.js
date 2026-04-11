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