import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Les mots de passe ne correspondent pas");
    }
    if (!formData.acceptTerms) {
      return setError("Vous devez accepter les conditions d'utilisation");
    }

    setLoading(true);

    try {
      // Simuler une inscription
      setTimeout(() => {
        const user = {
          id: Date.now(),
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          role: formData.role
        };
        
        localStorage.setItem("token", "fake-jwt-token");
        localStorage.setItem("user", JSON.stringify(user));

        switch(formData.role) {
          case "administrateur":
            navigate("/admin");
            break;
          case "enseignant":
            navigate("/enseignant");
            break;
          default:
            navigate("/etudiant");
        }
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError("Erreur lors de l'inscription");
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="max-w-5xl w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white grid md:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="relative p-10 text-white bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600">
          <h2 className="text-4xl font-extrabold">CRÉER UN COMPTE</h2>
          <p className="mt-4 text-white/90">
            Rejoignez notre plateforme d'apprentissage
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/15 backdrop-blur-sm rounded-2xl">
              <span>🛡️</span>
              <span>Profil vérifié</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/15 backdrop-blur-sm rounded-2xl">
              <span>🎓</span>
              <span>Accès aux formations</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-10">
          <h3 className="text-2xl font-bold text-gray-900">Inscription</h3>
          <p className="text-gray-600 mb-6">Safoua Academy</p>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Nom</label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-3 text-gray-400">👤</span>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Dupont"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Prénom</label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-3 text-gray-400">👤</span>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Jean"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">Email</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-3 text-gray-400">📧</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jean@academy.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">Rôle</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full mt-2 px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="etudiant">Étudiant</option>
                <option value="enseignant">Enseignant</option>
                <option value="administrateur">Administrateur</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Mot de passe</label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-3 text-gray-400">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-gray-500"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Confirmer</label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-3 text-gray-400">🔒</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3 text-gray-500"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 cursor-pointer">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="w-5 h-5 mt-0.5 accent-emerald-600"
              />
              <span className="text-sm text-gray-600">
                J'accepte les conditions d'utilisation
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white shadow-lg bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 text-lg"
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </button>

            <p className="text-center text-sm pt-5 border-t border-gray-200">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-emerald-600 font-semibold">
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