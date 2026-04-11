import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.login(formData);
      
      if (result.success) {
        const user = authService.getCurrentUser();
        let role = user?.role;
        
        console.log("✅ Connexion réussie - Rôle reçu:", role);
        
        // Normaliser le rôle : 'administrateur' devient 'admin'
        let normalizedRole = role;
        if (role === 'administrateur') {
          normalizedRole = 'admin';
          // Mettre à jour le rôle dans localStorage
          user.role = 'admin';
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('role', 'admin');
          console.log("🔄 Rôle normalisé en: admin");
        }
        
        // Redirection en fonction du rôle normalisé
        if (normalizedRole === 'admin') {
          console.log("🚀 Redirection vers /admin");
          navigate('/admin');
        } 
        else if (normalizedRole === 'enseignant') {
          console.log("🚀 Redirection vers /enseignant");
          navigate('/enseignant');
        } 
        else if (normalizedRole === 'etudiant') {
          console.log("🚀 Redirection vers /etudiant");
          navigate('/etudiant');
        }
        else {
          console.log("⚠️ Rôle inconnu, redirection vers /");
          navigate('/');
        }
      } else {
        setError(result.message || "Email ou mot de passe incorrect");
      }
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="max-w-5xl w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white grid md:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="relative p-10 text-white bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600">
          <h2 className="text-4xl font-extrabold">BIENVENUE</h2>
          <p className="mt-4 text-white/90">
            Accès aux cours, suivi vocal et espace enseignants.
          </p>

          <div className="mt-8 space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <span>🔒</span>
              Connexion sécurisée
            </p>
            <p className="flex items-center gap-2">
              <span>📧</span>
              Support: support@safoua.com
            </p>
          </div>

          <div className="absolute bottom-8 left-8 right-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm italic">
                "Une plateforme exceptionnelle pour apprendre le Coran et la langue arabe"
              </p>
              <p className="text-xs mt-2 text-white/80">— Ahmed, étudiant</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-10">
          <h3 className="text-2xl font-bold text-gray-900">Connexion</h3>
          <p className="text-gray-600 mb-6">Safoua Academy</p>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-3 text-gray-400">📧</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemple@academy.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-3 text-gray-400">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-500 hover:text-gray-700 transition"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end mt-2">
              <Link 
                to="/forgot-password" 
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </span>
              ) : "Se connecter"}
            </button>
            
            <p className="text-center text-sm pt-5 border-t border-gray-200">
              Pas de compte ?{" "}
              <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700 transition">
                S'inscrire
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;