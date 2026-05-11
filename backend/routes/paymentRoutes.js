const express = require("express");
const router = express.Router(); // <--- Cette ligne manquait probablement
const Stripe = require("stripe");

// Environment / dev helpers
const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const isDev = process.env.NODE_ENV !== "production";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5175";
const USE_DEV_PAYMENT_MOCK = (process.env.USE_DEV_PAYMENT_MOCK || "false").toLowerCase() === "true";

let stripe = null;
if (!stripeKey || stripeKey.includes("votre_cle") || stripeKey.trim() === "") {
  console.warn(
    "⚠️ STRIPE_SECRET_KEY non configurée ou contient un placeholder. Vous pouvez activer le mock en dev en définissant USE_DEV_PAYMENT_MOCK=true"
  );
} else {
  stripe = new Stripe(stripeKey);
}

router.post("/create-checkout-session", async (req, res) => {
  const { course } = req.body;

  // Basic validation
  if (!course || course.prix === undefined) {
    return res.status(400).json({ error: "Données du cours incomplètes" });
  }

  // Dev-only mock: return a local frontend success URL when Stripe is not configured
  // or when explicitly requested via USE_DEV_PAYMENT_MOCK=true
  if (isDev && (USE_DEV_PAYMENT_MOCK || !stripe)) {
    console.log("Using dev payment mock for course", course.titre || course._id);
    // return a URL that mimics Stripe redirect to success page
    return res.json({ url: `${FRONTEND_URL}/success?mock_checkout=true` });
  }

  if (!stripe) {
    return res.status(500).json({ error: "Stripe non configuré sur le serveur" });
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
      success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error("Erreur Stripe :", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;