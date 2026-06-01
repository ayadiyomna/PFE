const Certificat = require('../models/Certificat');
const Cours = require('../models/Cours');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

/**
 * Générer un PDF du certificat
 */
const generateCertificatePDF = (certificate, userInfo, courseInfo) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      let pdfBuffer = [];
      
      doc.on('data', (chunk) => {
        pdfBuffer.push(chunk);
      });

      doc.on('end', () => {
        const buffer = Buffer.concat(pdfBuffer);
        resolve(buffer);
      });

      doc.on('error', (err) => {
        reject(err);
      });

      // Add background color
      doc.rect(0, 0, 595, 842).fill('#f8f9fa');

      // Add decorative border
      doc.strokeColor('#2d9d6c').lineWidth(3);
      doc.rect(30, 30, 535, 782).stroke();

      doc.strokeColor('#d4af37').lineWidth(1);
      doc.rect(35, 35, 525, 772).stroke();

      // Title - Certificat
      doc.fillColor('#2d9d6c').fontSize(48).font('Helvetica-Bold').text('CERTIFICAT', 0, 100, {
        align: 'center'
      });

      // Subtitle
      doc.fillColor('#555555').fontSize(14).font('Helvetica').text('DE RÉUSSITE', 0, 160, {
        align: 'center'
      });

      // Decorative line
      doc.moveTo(150, 190).lineTo(445, 190).stroke('#d4af37');

      // Main text
      doc.fontSize(12).fillColor('#333333').font('Helvetica').text('Nous certifions par la présente que', 0, 220, {
        align: 'center'
      });

      // Student name
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#2d9d6c').text(
        userInfo.nom && userInfo.prenom 
          ? `${userInfo.prenom} ${userInfo.nom}`.toUpperCase()
          : 'ÉTUDIANT',
        0, 260,
        { align: 'center' }
      );

      // Course completion text
      doc.fontSize(12).font('Helvetica').fillColor('#333333');
      doc.text('a complété avec succès le cours', 0, 320, { align: 'center' });

      // Course title
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#2d9d6c').text(
        courseInfo.titre || 'Cours Safoua Academy',
        0, 355,
        { align: 'center', width: 495 }
      );

      // Course details
      doc.fontSize(11).font('Helvetica').fillColor('#555555');
      doc.text(`Niveau: ${courseInfo.niveau || 'Intermédiaire'}`, 0, 420, { align: 'center' });

      // Score
      doc.text(`Score obtenu: ${certificate.score}%`, 0, 445, { align: 'center' });

      // Certificate code
      doc.fontSize(10).fillColor('#888888');
      doc.text(`Certificat n°: ${certificate.code}`, 0, 510, { align: 'center' });

      // Date
      const options = { year: 'numeric', month: 'long', day: 'numeric', locale: 'fr-FR' };
      const dateStr = new Date(certificate.dateDelivrance).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Délivré le: ${dateStr}`, 0, 530, { align: 'center' });

      // Instructor section
      doc.fontSize(10).fillColor('#333333').text('Délivré par:', 50, 600);
      doc.fontSize(12).font('Helvetica-Bold').text(
        courseInfo.instructeur && courseInfo.instructeur.prenom && courseInfo.instructeur.nom
          ? `${courseInfo.instructeur.prenom} ${courseInfo.instructeur.nom}`
          : 'Safoua Academy',
        50, 625
      );

      // Footer text
      doc.fontSize(9).font('Helvetica').fillColor('#888888').text(
        'Ce certificat atteste de la réussite du cours et de l\'acquisition des compétences requises.',
        50, 720,
        { align: 'center', width: 495 }
      );

      // End document
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

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
      .populate('cours', 'titre niveau prix instructeur')
      .populate({
        path: 'cours',
        populate: { path: 'instructeur', select: 'nom prenom' }
      });
    
    if (!certificat) {
      return res.status(404).json({
        success: false,
        message: 'Certificat non trouvé'
      });
    }
    
    // Vérifier les droits (seul le propriétaire ou admin peut télécharger)
    if (certificat.utilisateur._id.toString() !== req.user._id.toString() && req.user.role !== 'administrateur' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }
    
    // Générer le PDF
    const pdfBuffer = await generateCertificatePDF(
      certificat,
      certificat.utilisateur,
      certificat.cours
    );
    
    // Définir les headers pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Certificat-${certificat.utilisateur.prenom}-${certificat.utilisateur.nom}-${certificat.code}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Envoyer le PDF
    res.send(pdfBuffer);
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
  downloadCertificat,
  generateCertificatePDF
};