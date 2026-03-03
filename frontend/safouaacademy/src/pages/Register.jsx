import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, GraduationCap } from "lucide-react";

function Register() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    mdp: "",
    confirmMdp: "",
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

    if (formData.mdp !== formData.confirmMdp) {
      return setError("Les mots de passe ne correspondent pas");
    }
    if (!formData.acceptTerms) {
      return setError("Vous devez accepter les conditions d'utilisation");
    }

    try {
      setLoading(true);
      const res = await registerUser(formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data));

      const role = res.data.data.role;
      if (role === "administrateur") navigate("/admin");
      else if (role === "enseignant") navigate("/enseignant");
      else navigate("/etudiant");
    } catch (error) {
      setError(
        error.response?.data?.message || 
        error.message || 
        "Erreur lors de l'inscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="max-w-5xl w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white grid md:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="relative p-10 text-white bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
            <div className="w-3 h-3 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50"></div>
            <span className="font-bold text-sm">Safoua Academy</span>
          </div>

          <h2 className="text-4xl font-extrabold mt-8">CRÉER UN COMPTE</h2>
          <p className="mt-4 text-white/90">
            Rejoignez notre plateforme d'apprentissage
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/15 backdrop-blur-sm rounded-2xl">
              <ShieldCheck size={24} />
              <span>Profil vérifié</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/15 backdrop-blur-sm rounded-2xl">
              <GraduationCap size={24} />
              <span>Accès aux formations</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/15 backdrop-blur-sm rounded-2xl">
              <Mail size={24} />
              <span>Email confirmé</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                INSCRIPTION
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                Academy
              </h3>
            </div>
            <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              👤
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-2 border border-red-200">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NOM & PRENOM */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Nom</label>
                <div className="relative mt-2">
                  <User className="absolute left-4 top-3 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Dupont"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Prénom</label>
                <div className="relative mt-2">
                  <User className="absolute left-4 top-3 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Jean"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-semibold">Email</label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-3 text-gray-400" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jean@academy.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* ROLE */}
            <div>
              <label className="text-sm font-semibold">Rôle</label>
              <div className="relative mt-2">
                <GraduationCap className="absolute left-4 top-3 text-gray-400" size={16} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                >
                  <option value="etudiant">Étudiant</option>
                  <option value="enseignant">Enseignant</option>
                  <option value="administrateur">Administrateur</option>
                </select>
              </div>
            </div>

            {/* MOT DE PASSE */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Mot de passe</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-3 text-gray-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="mdp"
                    value={formData.mdp}
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Confirmer</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-3 text-gray-400" size={16} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmMdp"
                    value={formData.confirmMdp}
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
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* CONDITIONS */}
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

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white shadow-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition disabled:opacity-50 text-lg"
            >
              {loading ? "⏳ Inscription..." : "✅ S'inscrire"}
            </button>

            {/* LOGIN LINK */}
            <p className="text-center text-sm pt-5 border-t border-gray-200">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
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