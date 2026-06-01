const express = require('express');
const router = express.Router();
const Cours = require('../models/Cours');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Stripe webhook secret (à configurer dans .env)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  const isDev = (process.env.USE_DEV_PAYMENT_MOCK || 'false').toLowerCase() === 'true';
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    if (isDev) {
      const rawPayload = req.body;
      const bodyPayload = rawPayload instanceof Buffer ? JSON.parse(rawPayload.toString('utf8')) : rawPayload;
      event = { type: 'checkout.session.completed', data: { object: bodyPayload } };
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
  } catch (err) {
    console.error('Erreur de vérification du webhook Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer l'événement checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      // On suppose que metadata contient courseId et userId
      const courseId = session.metadata.courseId;
      const userId = session.metadata.userId;
      if (!courseId || !userId) throw new Error('courseId ou userId manquant dans metadata Stripe');
      const cours = await Cours.findById(courseId);
      if (!cours) throw new Error('Cours non trouvé');
      // Vérifier si déjà inscrit
      if (!cours.students.some(id => id.toString() === userId)) {
        cours.students.push(userId);
        await cours.save();
        // Créer notification enseignant
        const etudiant = await User.findById(userId);
        await Notification.create({
          utilisateur: cours.instructeur,
          type: 'inscription',
          title: 'Nouvelle inscription à votre cours',
          message: `L'étudiant(e) ${etudiant.prenom} ${etudiant.nom} s'est inscrit(e) à votre cours : "${cours.titre}"`,
          data: { etudiantId: etudiant._id, coursId: cours._id }
        });
      }
    } catch (err) {
      console.error('Erreur lors du traitement du webhook Stripe:', err);
      return res.status(500).send('Erreur lors du traitement du webhook');
    }
  }
  res.status(200).json({ received: true });
});

module.exports = router;
