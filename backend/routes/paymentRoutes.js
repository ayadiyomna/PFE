const express = require("express");
const router = express.Router(); // <--- Cette ligne manquait probablement
const Stripe = require("stripe");

// Vérifier la présence d'une clé Stripe valide dans l'environnement
const stripeKey = process.env.STRIPE_SECRET_KEY || "";
let stripe = null;
if (!stripeKey || stripeKey.includes("votre_cle") || stripeKey.trim() === "") {
  console.error(
    "⚠️ STRIPE_SECRET_KEY non configurée ou contient un placeholder. Définissez une clé Stripe valide dans .env"
  );
} else {
  stripe = new Stripe(stripeKey);
}

router.post("/create-checkout-session", async (req, res) => {
  const { course } = req.body;
  if (!stripe) {
    return res.status(500).json({ error: "Stripe non configuré sur le serveur" });
  }

  if (!course || course.prix === undefined) {
    return res.status(400).json({ error: "Données du cours incomplètes" });
  }

  try {
    // Nettoyer le prix (au cas où il contiendrait du texte comme "100 DT")
    const rawPrice = String(course.prix || "");
    const numericPrice = Number(rawPrice.replace(/[^0-9.\-]/g, "")) || 0;
    const currency = course.currency || "usd";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: course.titre,
              description: course.description,
              images: course.image ? [course.image] : [],
            },
            unit_amount: Math.round(numericPrice * 100),
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error("Erreur Stripe :", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;