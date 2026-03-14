import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "etudiant",
    acceptTerms: false
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      toast.error("❌ Les mots de passe ne correspondent pas");
      return;
    }
    
    if (!formData.acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      toast.error("📝 Vous devez accepter les conditions d'utilisation");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email invalide");
      toast.error("📧 Format d'email invalide");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      toast.error("🔒 Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        id: Date.now(),
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        role: formData.role,
        name: `${formData.prenom} ${formData.nom}`
      };
      
      localStorage.setItem("token", "fake-jwt-token-" + Date.now());
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", formData.role);

      toast.success("✅ Inscription réussie !");
      
      await new Promise(resolve => setTimeout(resolve, 500));

      switch(formData.role) {
        case "administrateur":
          navigate("/admin/dashboard");
          break;
        case "enseignant":
          navigate("/enseignant/dashboard");
          break;
        default:
          navigate("/etudiant");
      }
    } catch (error) {
      console.error("Erreur inscription:", error);
      setError("Erreur lors de l'inscription");
      toast.error("❌ Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
      {/* CORRECTION: Ajout des valeurs booléennes explicites */}
      <ToastContainer 
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
        theme="colored"
      />

      <div className="max-w-5xl w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white grid md:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="relative p-10 text-white bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600">
          <h2 className="text-4xl font-extrabold">CRÉER UN COMPTE</h2>
          <p className="mt-4 text-white/90">
            Rejoignez notre plateforme d'apprentissage
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/15 backdrop-blur-sm rounded-2xl">
              <span className="text-2xl">🛡️</span>
              <span>Profil vérifié</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/15 backdrop-blur-sm rounded-2xl">
              <span className="text-2xl">🎓</span>
              <span>Accès aux formations</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/15 backdrop-blur-sm rounded-2xl">
              <span className="text-2xl">📚</span>
              <span>+500 cours disponibles</span>
            </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm italic">
                "La meilleure plateforme pour apprendre le Coran et la langue arabe"
              </p>
              <p className="text-xs mt-2 text-white/80">— Ahmed, étudiant</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-10">
          <h3 className="text-2xl font-bold text-gray-900">Inscription</h3>
          <p className="text-gray-600 mb-6">Safoua Academy</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Nom</label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-3 text-gray-400">👤</span>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Prénom</label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-3 text-gray-400">👤</span>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            </div>

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
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Rôle</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full mt-2 px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="etudiant">👨‍🎓 Étudiant</option>
                <option value="enseignant">👨‍🏫 Enseignant</option>
                <option value="administrateur">👨‍💼 Administrateur</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-3 text-gray-400">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength="6"
                    className="w-full pl-11 pr-11 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
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
              <div>
                <label className="text-sm font-semibold text-gray-700">Confirmer</label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-3 text-gray-400">🔒</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="w-5 h-5 mt-0.5 accent-emerald-600"
              />
              <span className="text-sm text-gray-600">
                J'accepte les <a href="/conditions" className="text-emerald-600 hover:underline">conditions d'utilisation</a> et la <a href="/confidentialite" className="text-emerald-600 hover:underline">politique de confidentialité</a>
              </span>
            </label>

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
                  Inscription en cours...
                </span>
              ) : "S'inscrire"}
            </button>

            <p className="text-center text-sm pt-5 border-t border-gray-200">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition">
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Register;