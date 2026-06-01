import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import coursService from "../services/coursService";
import authService from "../services/authService";
import api from "../services/api";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const isBrowser = typeof window !== "undefined";
const hostname = isBrowser ? window.location.hostname : "";
const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
const isSecurePage = isBrowser && window.location.protocol === "https:";
const isStripeLiveKey = publishableKey.startsWith("pk_live_");
const isStripeTestKey = publishableKey.startsWith("pk_test_");
const stripeEnvironmentValid = isStripeTestKey ? isLocalhost || isSecurePage : isSecurePage;

if (publishableKey && !publishableKey.startsWith("pk_")) {
  console.warn(
    "VITE_STRIPE_PUBLISHABLE_KEY looks invalid — Stripe will be disabled in the UI. Replace with a key starting with pk_test_ or pk_live_."
  );
}

const stripeErrorMessage = !publishableKey
  ? "Clé Stripe introuvable. Configurez VITE_STRIPE_PUBLISHABLE_KEY."
  : isStripeLiveKey && !isSecurePage
  ? "La clé Stripe live nécessite HTTPS. Servez l'application en HTTPS pour utiliser un compte Stripe en production."
  : isStripeTestKey && !isLocalhost && !isSecurePage
  ? "La clé Stripe de test fonctionne uniquement sur localhost en HTTP. Servez l'application en HTTPS ou utilisez localhost."
  : null;

const stripePromise = publishableKey.startsWith("pk_") && !stripeErrorMessage ? loadStripe(publishableKey) : null;

function CheckoutForm({ course, clientSecret, userEmail, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      setError("Le paiement n'est pas encore prêt. Réessayez dans un instant.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Impossible de trouver le champ de paiement.");
      return;
    }

    setProcessing(true);

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: userEmail || "client@example.com"
          }
        }
      });

      if (confirmError) {
        setError(confirmError.message || "Erreur de paiement. Vérifiez vos informations et réessayez.");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        await onPaymentSuccess();
      } else {
        setError("Le paiement n'a pas pu être finalisé. Réessayez plus tard.");
      }
    } catch (paymentException) {
      console.error("Erreur confirmCardPayment:", paymentException);
      setError(paymentException.message || "Erreur lors de la confirmation du paiement.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Détails de paiement</h2>
        <p className="text-gray-600">
          {course?.titre} — {course?.prix} DT
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 p-4 bg-slate-50">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Carte bancaire</label>
        <div className="rounded-lg border border-gray-300 bg-white p-4">
          <CardElement options={{ style: { base: { fontSize: "16px", color: "#111827", fontFamily: 'Inter, system-ui, sans-serif', '::placeholder': { color: '#9ca3af' } } } }} />
        </div>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || !clientSecret || processing}
        className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
      >
        {processing ? "Paiement en cours..." : "Payer maintenant"}
      </button>
    </form>
  );
}

function CheckoutPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const initializePayment = async () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const courseResult = await coursService.getCoursById(id);

        if (!courseResult.success) {
          navigate("/cours");
          return;
        }

        setCourse(courseResult.data);

        const response = await api.post("/payment/create-payment-intent", {
          courseId: id,
          userId: currentUser?._id
        });

        if (!response.data?.clientSecret) {
          throw new Error("Impossible de créer l'intention de paiement.");
        }

        setClientSecret(response.data.clientSecret);
      } catch (fetchError) {
        console.error("Erreur initialisation paiement:", fetchError);
        setError(fetchError.response?.data?.error || fetchError.response?.data?.message || fetchError.message || "Erreur lors de la préparation du paiement.");
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [id, navigate]);

  const handlePaymentSuccess = async () => {
    try {
      const enrollment = await coursService.enrollToCours(id);
      if (!enrollment.success) {
        setError(enrollment.message || "Inscription réussie, mais impossible d'enregistrer l'inscription.");
        return;
      }
      setSuccessMessage("Paiement réussi et inscription effectuée !");
      navigate("/success");
    } catch (enrollError) {
      console.error("Erreur d'inscription après paiement:", enrollError);
      setError(enrollError.message || "Le paiement a réussi, mais l'inscription a échoué.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Erreur de paiement</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
            onClick={() => navigate(`/cours/${id}`)}
          >
            Retour au cours
          </button>
        </div>
      </div>
    );
  }

  if (stripeErrorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Problème de configuration Stripe</h1>
          <p className="text-gray-600 mb-4">{stripeErrorMessage}</p>
          <button
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
            onClick={() => navigate(`/cours/${id}`)}
          >
            Retour au cours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-emerald-600 p-8 text-white">
            <h1 className="text-3xl font-bold">Paiement du cours</h1>
            <p className="mt-2 text-slate-200">Complétez votre paiement pour accéder immédiatement au cours.</p>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900">{course?.titre}</h2>
              <p className="text-gray-600 mt-2">Prix : {course?.prix} DT</p>
            </div>

            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  course={course}
                  clientSecret={clientSecret}
                  userEmail={authService.getCurrentUser()?.email}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </Elements>
            ) : (
              <div className="rounded-3xl border border-gray-200 p-8 text-center">
                <p className="text-gray-600">Préparation du paiement...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CheckoutPayment;
