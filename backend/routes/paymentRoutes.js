const express = require("express");
const router = express.Router(); // <--- Cette ligne manquait probablement
const Stripe = require("stripe");

// Initialisation de Stripe (assurez-vous que votre .env est chargé dans server.js)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  const { course } = req.body;

  if (!course || course.prix === undefined) {
    return res.status(400).json({ error: "Données du cours incomplètes" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.titre,
              description: course.description,
              images: course.image ? [course.image] : [],
            },
            unit_amount: Math.round(Number(course.prix) * 100),
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