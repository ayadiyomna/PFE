import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    mdp: "",
    role: "etudiant"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      setLoading(true);
      const res = await loginUser(formData);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate(res.data.role === "administrateur" ? "/admin" : 
               res.data.role === "enseignant" ? "/enseignant" : "/etudiant");
    } catch (error) {
      setError(error.response?.data?.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto border border-gray-200 p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Safoua Academy</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">WELCOME BACK</h2>
        <p className="text-gray-600 mb-4">Accès aux cours, suivi vocal et espace enseignants.</p>
        
        {/* Badges */}
        <div className="flex gap-4 mb-8">
          <span className="font-bold">Connexion sécurisée (UI)</span>
          <span className="text-gray-600">Support: support@demo.com</span>
        </div>

        <hr className="border-t border-gray-300 mb-6" />

        {/* Titre formulaire */}
        <h3 className="text-xl font-bold mb-6">LOGIN ACCOUNT</h3>
        <p className="text-gray-700 mb-6">Safoua Academy</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="etudiant@exemple.com"
              required
              className="w-full p-2 border border-gray-300"
            />
          </div>

          {/* Rôle */}
          <div>
            <label className="block text-sm mb-1">Rôle</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 bg-white"
            >
              <option value="etudiant">Étudiant</option>
              <option value="enseignant">Enseignant</option>
            </select>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm mb-1">Mot de passe</label>
            <input
              type="password"
              name="mdp"
              value={formData.mdp}
              onChange={handleChange}
              placeholder="Votre mot de passe"
              required
              className="w-full p-2 border border-gray-300"
            />
          </div>

          {/* Bouton Se connecter */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          {/* Options */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm">Remember me</span>
            </label>
            <a href="#" className="text-sm text-blue-600">Forgot?</a>
          </div>
        </form>

        {/* Accès démo */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200">
          <p className="font-bold mb-2">Accès démo</p>
          <p className="text-sm">Email admin@demo.com</p>
          <p className="text-sm mb-2">Mot de passe Password123!</p>
          <p className="text-xs text-gray-600">
            Choisissez votre rôle (Étudiant / Enseignant) pour charger le bon tableau de bord.
          </p>
        </div>

        {/* Lien inscription */}
        <p className="text-center text-sm mt-4">
          Pas de compte ? <a href="/register" className="text-blue-600">S'inscrire</a>
        </p>
      </div>
    </div>
  );
}

export default Login;