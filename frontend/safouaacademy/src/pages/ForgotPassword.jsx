import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Correction : utiliser /api/users au lieu de /api/auth
      const response = await axios.post(
        "http://localhost:5000/api/users/forgot-password",
        { email }
      );
      setMessage(response.data.message || "Email de réinitialisation envoyé !");
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
        <div className="p-10">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Mot de passe oublié
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
          
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded-lg mb-4">
              {message}
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-3 text-gray-400">📧</span>
                <input
                  type="email"
                  placeholder="exemple@academy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
            
            <p className="text-center text-sm pt-5 border-t border-gray-200">
              <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition">
                Retour à la connexion
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}