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
        margin: 40
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

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const borderMargin = 30;

      // Background
      doc.rect(0, 0, pageWidth, pageHeight).fill('#f2f7f5');

      // Outer border
      doc.save();
      doc.lineWidth(4).strokeColor('#1f7a5f');
      doc.roundedRect(borderMargin, borderMargin, pageWidth - borderMargin * 2, pageHeight - borderMargin * 2, 20).stroke();
      doc.restore();

      // Inner card
      doc.save();
      doc.roundedRect(borderMargin + 8, borderMargin + 8, pageWidth - (borderMargin + 8) * 2, pageHeight - (borderMargin + 8) * 2, 16);
      doc.fillOpacity(0.92).fill('#ffffff');
      doc.restore();

      // Top banner
      doc.save();
      doc.roundedRect(borderMargin + 20, borderMargin + 20, pageWidth - (borderMargin + 20) * 2, 90, 16);
      doc.fill('#1f7a5f');
      doc.restore();

      doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('SAFOUA ACADEMY', borderMargin + 40, borderMargin + 35);
      doc.fontSize(10).font('Helvetica').text('Plateforme de formation en ligne', borderMargin + 40, borderMargin + 58);

      const titleY = borderMargin + 140;
      doc.fillColor('#1f7a5f').fontSize(44).font('Helvetica-Bold').text('CERTIFICAT', 0, titleY, {
        align: 'center'
      });
      doc.fillColor('#2d9d6c').fontSize(16).font('Helvetica').text('DE RÉUSSITE', 0, titleY + 55, {
        align: 'center'
      });

      doc.moveTo(pageWidth * 0.2, titleY + 95).lineTo(pageWidth * 0.8, titleY + 95).lineWidth(2).stroke('#d4af37');

      doc.fontSize(12).fillColor('#4b5563').font('Helvetica').text('Nous certifions par la présente que', 0, titleY + 115, {
        align: 'center'
      });

      const studentName = userInfo.nom && userInfo.prenom
        ? `${userInfo.prenom} ${userInfo.nom}`.toUpperCase()
        : 'ÉTUDIANT SAFouA';

      doc.fontSize(30).font('Helvetica-Bold').fillColor('#0f5132').text(studentName, 0, titleY + 145, {
        align: 'center',
        characterSpacing: 1
      });

      doc.fontSize(12).font('Helvetica').fillColor('#4b5563').text('a complété avec succès le programme suivant :', 0, titleY + 200, {
        align: 'center'
      });

      const courseTitle = courseInfo.titre || 'Cours Safoua Academy';
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#1f7a5f').text(courseTitle, 80, titleY + 235, {
        align: 'center',
        width: pageWidth - 160
      });

      const detailTop = titleY + 300;
      const durationHours = Math.round((courseInfo.dureeTotale || 0) / 60);

      doc.fontSize(11).font('Helvetica').fillColor('#4b5563');
      doc.text(`Niveau : ${courseInfo.niveau || 'Intermédiaire'}`, borderMargin + 60, detailTop, { width: 220 });
      doc.text(`Score obtenu : ${certificate.score || 0}%`, borderMargin + 60, detailTop + 20, { width: 220 });
      doc.text(`Durée estimée : ${durationHours || 0} heures`, borderMargin + 60, detailTop + 40, { width: 220 });

      doc.text(`Date de délivrance : ${new Date(certificate.dateDelivrance).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, pageWidth - borderMargin - 280, detailTop, { width: 220, align: 'right' });

      const instructorName = courseInfo.instructeur && courseInfo.instructeur.prenom && courseInfo.instructeur.nom
        ? `${courseInfo.instructeur.prenom} ${courseInfo.instructeur.nom}`
        : 'Safoua Academy';

      doc.text(`Instructeur : ${instructorName}`, pageWidth - borderMargin - 280, detailTop + 20, { width: 220, align: 'right' });
      doc.text(`Certification : ${certificate.code}`, pageWidth - borderMargin - 280, detailTop + 40, { width: 220, align: 'right' });

      // Signature area
      const signatureY = detailTop + 110;
      doc.moveTo(borderMargin + 90, signatureY).lineTo(borderMargin + 260, signatureY).lineWidth(1).stroke('#9ca3af');
      doc.fontSize(10).fillColor('#6b7280').text('Signature du formateur', borderMargin + 90, signatureY + 8, { width: 170, align: 'center' });

      doc.moveTo(pageWidth - borderMargin - 260, signatureY).lineTo(pageWidth - borderMargin - 90, signatureY).lineWidth(1).stroke('#9ca3af');
      doc.text('Cachet officiel', pageWidth - borderMargin - 260, signatureY + 8, { width: 170, align: 'center' });

      // Footer note
      doc.fontSize(9).fillColor('#6b7280').text(
        'Ce certificat atteste de la réussite du cours et de l’acquisition des compétences requises sur Safoua Academy.',
        borderMargin + 50,
        pageHeight - borderMargin - 80,
        { width: pageWidth - (borderMargin + 50) * 2, align: 'center' }
      );

      doc.fontSize(9).fillColor('#9ca3af').text(
        'Vérification du certificat : safouaacademy.com',
        borderMargin + 50,
        pageHeight - borderMargin - 55,
        { width: pageWidth - (borderMargin + 50) * 2, align: 'center' }
      );

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