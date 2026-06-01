const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const mongoose = require("mongoose");

// Route de paiement de test Stripe simple (0.50$)
router.post("/test-checkout-session", async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { course } = req.body;
  if (!course) {
    return res.status(400).json({ error: "No course data provided" });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.titre || "Test Course",
              description: "Test Payment",
            },
            unit_amount: 50, // 0.50$ pour test
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error("Stripe Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// Environment / dev helpers
const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const isDev = process.env.NODE_ENV !== "production";
// Prefer explicit FRONTEND_URL, otherwise try to detect from request origin or default to common Vite port 5174
const FRONTEND_URL = process.env.FRONTEND_URL || null;
const FRONTEND_DEFAULT_PORT = process.env.FRONTEND_PORT || "5174";
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
  const { course, userId } = req.body;

  if (!course) {
    return res.status(400).json({ error: "No course data provided" });
  }

  // Determine frontend base URL from env or request (safer in dev when ports vary)
  const frontendBase = FRONTEND_URL || req.get('origin') || `http://localhost:${FRONTEND_DEFAULT_PORT}`;

  // Dev-only mock: return a local frontend success URL when Stripe is not configured
  // or when explicitly requested via USE_DEV_PAYMENT_MOCK=true
  if (isDev && (USE_DEV_PAYMENT_MOCK || !stripe)) {
    console.log("Using dev payment mock for course", course.titre || course._id, "->", frontendBase);
    return res.json({ url: `${frontendBase}/success?mock_checkout=true` });
  }

  if (!stripe) {
    return res.status(500).json({ error: "Stripe non configuré sur le serveur" });
  }

  try {
    let numericPrice = Number(course.prix);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      numericPrice = 0.5; // $0.50 fallback test price
    }

    const currency = course.currency || "usd";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: course.titre || "Test Course",
              description: course.description || "Test Payment",
              images: course.image ? [course.image] : [],
            },
            unit_amount: Math.round(numericPrice * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendBase}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBase}/cancel`,
      metadata: {
        courseId: String(course._id || ""),
        userId: String(userId || "")
      }
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error("Erreur Stripe :", e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/create-payment-intent", async (req, res) => {
  const { courseId, userId } = req.body;

  if (!courseId) {
    return res.status(400).json({ error: "No courseId provided" });
  }

  // If MongoDB is not connected in development, return a mock clientSecret
  // This avoids long DB hangs which lead to frontend Axios timeouts
  if (isDev && mongoose.connection.readyState !== 1) {
    console.log("MongoDB disconnected — returning dev mock clientSecret for", courseId);
    return res.json({ clientSecret: "mock_client_secret" });
  }

  if (isDev && (USE_DEV_PAYMENT_MOCK || !stripe)) {
    console.log("Using dev payment mock for course ID", courseId);
    return res.json({ clientSecret: "mock_client_secret" });
  }

  if (!stripe) {
    return res.status(500).json({ error: "Stripe non configuré sur le serveur" });
  }

  try {
    const Cours = require("../models/Cours");
    const course = await Cours.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Cours non trouvé" });
    }

    let numericPrice = Number(course.prix);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      numericPrice = 0.5;
    }

    const currency = course.currency || "usd";

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(numericPrice * 100),
      currency,
      description: course.description || course.titre || "Paiement de cours",
      automatic_payment_methods: { enabled: true },
      metadata: {
        courseId: String(course._id),
        userId: String(userId || "")
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    console.error("Erreur de création PaymentIntent :", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;