import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Correction : utiliser /api/users au lieu de /api/auth
      await axios.post(
        `http://localhost:5000/api/users/reset-password/${token}`,
        { password }
      );
      
      setMessage("Mot de passe réinitialisé avec succès !");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
        <div className="p-10">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Nouveau mot de passe
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Entrez votre nouveau mot de passe
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
              <label className="text-sm font-semibold text-gray-700">Nouveau mot de passe</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-3 text-gray-400">🔒</span>
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700">Confirmer le mot de passe</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-3 text-gray-400">🔒</span>
                <input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Réinitialisation..." : "Réinitialiser"}
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