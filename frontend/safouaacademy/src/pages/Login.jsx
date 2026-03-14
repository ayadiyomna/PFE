import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    setLoading(true);

    try {
      setTimeout(() => {
        if (formData.email && formData.password) {
          const user = {
            id: 1,
            nom: "Utilisateur",
            email: formData.email,
            role: formData.role
          };
          
          localStorage.setItem("token", "fake-jwt-token");
          localStorage.setItem("user", JSON.stringify(user));

          toast.success("Connexion réussie !");

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
        } else {
          toast.error("Email ou mot de passe incorrect");
          setError("Email ou mot de passe incorrect");
        }
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error("Erreur de connexion");
      setError("Erreur de connexion");
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
        </div>

        {/* RIGHT SIDE */}
        <div className="p-10">
          <h3 className="text-2xl font-bold text-gray-900">
            Connexion
          </h3>
          <p className="text-gray-600 mb-6">Safoua Academy</p>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-semibold">Email</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-3 text-gray-400">📧</span>
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

            {/* ROLE */}
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

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-semibold">Mot de passe</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-3 text-gray-400">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
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
                  {showPassword ? "👁️" : "👁️‍🗨️"}
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