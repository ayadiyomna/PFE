import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    mdp: "",
    role: "etudiant",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      navigate(
        res.data.role === "administrateur"
          ? "/admin"
          : res.data.role === "enseignant"
          ? "/enseignant"
          : "/etudiant"
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Email ou mot de passe incorrect"
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
          <h2 className="text-4xl font-extrabold">WELCOME BACK</h2>
          <p className="mt-4 text-white/90">
            Accès aux cours, suivi vocal et espace enseignants.
          </p>

          <div className="mt-8 space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <ShieldCheck size={16} />
              Connexion sécurisée
            </p>
            <p className="flex items-center gap-2">
              <Mail size={16} />
              Support: support@demo.com
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-10">
          <h3 className="text-2xl font-bold text-gray-900">
            Login Account
          </h3>
          <p className="text-gray-600 mb-6">Safoua Academy</p>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-semibold">
                Email
              </label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-3 text-gray-400" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="etudiant@exemple.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold">
                Rôle
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full mt-2 px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="etudiant">Étudiant</option>
                <option value="enseignant">Enseignant</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">
                Mot de passe
              </label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-3 text-gray-400" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="mdp"
                  value={formData.mdp}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl font-semibold text-white shadow-lg bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
            <div className="flex justify-between text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Remember me
              </label>
              <button type="button" className="font-semibold">
                Forgot?
              </button>
            </div>
          </form>
          <p className="text-center text-sm mt-6">
            Pas de compte ?{" "}
            <Link to="/register" className="text-emerald-600 font-semibold">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;