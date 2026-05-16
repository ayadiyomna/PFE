const Certificat = require('../models/Certificat');
const Cours = require('../models/Cours');
const User = require('../models/User');

/**
 * Récupérer les certificats de l'utilisateur connecté
 */
const getMyCertificats = async (req, res) => {
  try {
    const certificats = await Certificat.find({ utilisateur: req.user._id })
      .populate('cours', 'titre niveau prix image instructeur')
      .sort('-dateDelivrance');
    
    // Formater les données pour le frontend
    const formattedCertificats = certificats.map(cert => ({
      id: cert.code,
      course: cert.cours?.titre,
      level: cert.cours?.niveau,
      date: new Date(cert.dateDelivrance).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      instructor: cert.cours?.instructeur?.nom && cert.cours?.instructeur?.prenom 
        ? `${cert.cours.instructeur.prenom} ${cert.cours.instructeur.nom}`
        : 'Safoua Academy',
      score: cert.score,
      hours: Math.round(cert.cours?.dureeTotale / 60) || 42,
      image: cert.cours?.image,
      pdf: `/certificats/${cert.code}.pdf`
    }));
    
    res.json({
      success: true,
      data: formattedCertificats
    });
  } catch (error) {
    console.error('Erreur getMyCertificats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Générer un certificat pour un cours terminé
 */
const generateCertificat = async (req, res) => {
  try {
    const { coursId } = req.params;
    const userId = req.user._id;
    // Permettre à un admin ou à l'instructeur du cours de générer un certificat
    // pour un autre utilisateur en passant `utilisateur` dans le body.
    const targetUserId = req.body?.utilisateur || userId;

    // Vérifier si le cours existe
    const cours = await Cours.findById(coursId).populate('instructeur');
    if (!cours) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    // Autorisation: si on génère pour un autre utilisateur, autoriser seulement
    // l'admin ou l'instructeur du cours.
    const isSelf = targetUserId.toString() === userId.toString();
    const isAdmin = req.user.role === 'administrateur' || req.user.role === 'admin';
    const isInstructor = cours.instructeur && (cours.instructeur._id ? cours.instructeur._id.toString() === userId.toString() : cours.instructeur.toString() === userId.toString());

    if (!isSelf && !(isAdmin || isInstructor)) {
      return res.status(403).json({ success: false, message: 'Non autorisé à générer un certificat pour cet utilisateur' });
    }

    // Vérifier que l'utilisateur cible est inscrit au cours
    const studentIds = (cours.students || []).map(s => s.toString());
    if (!studentIds.includes(targetUserId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'L\'utilisateur doit être inscrit au cours pour obtenir un certificat'
      });
    }
    
    // Vérifier si le cours est terminé
    const Progress = require('../models/Progress');
    const progress = await Progress.findOne({ cours: coursId, utilisateur: targetUserId });
    
    if (!progress || progress.progress < 100) {
      return res.status(400).json({
        success: false,
        message: 'L\'utilisateur doit terminer le cours pour obtenir un certificat'
      });
    }
    
    // Vérifier si un certificat existe déjà pour l'utilisateur cible
    const existingCert = await Certificat.findOne({ 
      utilisateur: targetUserId, 
      cours: coursId 
    });
    
    if (existingCert) {
      return res.json({
        success: true,
        data: existingCert,
        message: 'Certificat déjà existant'
      });
    }
    
    // Créer le certificat pour l'utilisateur cible
    const certificat = await Certificat.create({
      utilisateur: targetUserId,
      cours: coursId,
      score: progress.averageScore || 85,
      dateDelivrance: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: certificat,
      message: 'Certificat généré avec succès'
    });
  } catch (error) {
    console.error('Erreur generateCertificat:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Télécharger un certificat (PDF)
 */
const downloadCertificat = async (req, res) => {
  try {
    const { code } = req.params;
    
    const certificat = await Certificat.findOne({ code })
      .populate('utilisateur', 'nom prenom')
      .populate('cours', 'titre niveau prix');
    
    if (!certificat) {
      return res.status(404).json({
        success: false,
        message: 'Certificat non trouvé'
      });
    }
    
    // Vérifier les droits (seul le propriétaire ou admin peut télécharger)
    if (certificat.utilisateur._id.toString() !== req.user._id.toString() && req.user.role !== 'administrateur') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }
    
    // Générer le PDF (à implémenter avec une lib comme pdfkit)
    // Pour l'instant, on retourne les données du certificat
    
    res.json({
      success: true,
      data: certificat,
      message: 'Certificat disponible'
    });
  } catch (error) {
    console.error('Erreur downloadCertificat:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getMyCertificats,
  generateCertificat,
  downloadCertificat
};