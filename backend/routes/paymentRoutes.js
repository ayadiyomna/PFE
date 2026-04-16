const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  const { course } = req.body;

  if (!course) {
    return res.status(400).json({ error: "No course data provided" });
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
              name: course.titre || "Cours Safoua Academy",
              description: course.description || "Paiement du cours",
            },
            unit_amount: course.prix ? Math.round(course.prix * 100) : 500,
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error("Stripe Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;