// Register.jsx COMPLET ✅ CORRIGÉ + STYLES DU DÉBUT
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

export default function Register() {
  const [formData, setFormData] = useState({
    nom: "", prenom: "", email: "", mdp: "", confirmMdp: "", 
    role: "enseignant", acceptTerms: false 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (formData.mdp !== formData.confirmMdp) {
      return setError("Les mots de passe ne correspondent pas");
    }
    if (!formData.acceptTerms) {
      return setError("Vous devez accepter les conditions");
    }
    
    try {
      setLoading(true);
      const res = await registerUser(formData);
      
      // ✅ CORRIGÉ pour votre backend structure
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data));
      
      // ✅ CORRIGÉ - navigation par role
      const role = res.data.data.role;
      if (role === "administrateur") return navigate("/admin");
      if (role === "enseignant") return navigate("/enseignant");
      navigate("/etudiant");
      
    } catch (error) {
      // ✅ Gestion axios error
      const message = error.response?.data?.message || error.message || "Erreur inscription";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // STYLES DU DÉBUT (IDENTIQUES)
  const rootStyle = {
    minHeight: "100vh", 
    padding: "80px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex", 
    alignItems: "center",
    justifyContent: "center"
  };

  const cardStyle = {
    width: "100%", 
    maxWidth: "900px", 
    margin: "0 auto",
    background: "white", 
    borderRadius: "24px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
    overflow: "hidden"
  };

  const gridStyle = { 
    display: "grid", 
    gridTemplateColumns: "1fr 1fr", 
    minHeight: "650px" 
  };

  const heroStyle = {
    padding: "60px 50px", 
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "white", 
    position: "relative", 
    overflow: "hidden"
  };

  const badgeStyle = { 
    display: "inline-flex", 
    alignItems: "center", 
    gap: "12px", 
    background: "rgba(255,255,255,0.2)", 
    padding: "12px 20px", 
    borderRadius: "50px",
    fontSize: "14px", 
    fontWeight: "700", 
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.3)"
  };

  const sparkle = { 
    width: "12px", 
    height: "12px", 
    background: "#ffd700", 
    borderRadius: "50%",
    boxShadow: "0 0 15px rgba(255,215,0,0.6)"
  };

  const titleStyle = { 
    fontSize: "40px", 
    fontWeight: "900", 
    margin: "30px 0 15px 0", 
    lineHeight: 1.1 
  };

  const subtitleStyle = { 
    fontSize: "18px", 
    opacity: 0.9, 
    marginBottom: "40px",
    maxWidth: "300px"
  };

  const featuresStyle = { 
    display: "flex", 
    flexDirection: "column", 
    gap: "20px",
    marginTop: "30px"
  };

  const featureItem = { 
    display: "flex", 
    alignItems: "center", 
    gap: "15px", 
    padding: "20px", 
    background: "rgba(255,255,255,0.15)", 
    borderRadius: "16px", 
    fontSize: "16px",
    backdropFilter: "blur(10px)"
  };

  const formContainer = { 
    padding: "60px 50px" 
  };

  const headerStyle = { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "40px" 
  };

  const tagStyle = { 
    fontSize: "12px", 
    textTransform: "uppercase", 
    letterSpacing: "2px", 
    color: "#64748b", 
    fontWeight: "700",
    display: "block"
  };

  const sectionTitle = { 
    fontSize: "28px", 
    fontWeight: "800", 
    color: "#1e293b", 
    margin: "8px 0 0 0" 
  };

  const avatarStyle = { 
    width: "60px", 
    height: "60px", 
    background: "#1e293b", 
    borderRadius: "20px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontSize: "24px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
  };

  const errorStyle = { 
    background: "#fee2e2", 
    border: "1px solid #fecaca", 
    borderRadius: "12px", 
    padding: "16px 20px", 
    color: "#dc2626", 
    fontSize: "14px", 
    marginBottom: "25px", 
    display: "flex", 
    alignItems: "center", 
    gap: "10px" 
  };

  const formStyle = { 
    display: "grid", 
    gap: "24px" 
  };

  const rowStyle = { 
    display: "grid", 
    gridTemplateColumns: "1fr 1fr", 
    gap: "24px" 
  };

  const labelStyle = { 
    display: "block", 
    fontSize: "14px", 
    fontWeight: "600", 
    color: "#1e293b", 
    marginBottom: "8px" 
  };

  const inputWrapper = { 
    position: "relative" 
  };

  const iconStyle = { 
    position: "absolute", 
    left: "20px", 
    top: "50%", 
    transform: "translateY(-50%)", 
    fontSize: "20px", 
    color: "#94a3b8", 
    zIndex: 1 
  };

  const inputStyle = { 
    width: "100%", 
    padding: "18px 20px 18px 60px", 
    borderRadius: "16px", 
    border: "1px solid #e2e8f0", 
    background: "white", 
    fontSize: "15px", 
    color: "#1e293b",
    outline: "none", 
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
    transition: "all 0.2s",
    fontFamily: "inherit"
  };

  const selectStyle = { 
    ...inputStyle, 
    paddingRight: "50px", 
    backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTIgMSIgc3Ryb2tlPSIjOTRhM2I4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==")`, 
    backgroundRepeat: "no-repeat", 
    backgroundPosition: "right 20px center", 
    backgroundSize: "12px",
    appearance: "none"
  };

  const checkboxStyle = { 
    display: "flex", 
    alignItems: "flex-start", 
    gap: "12px", 
    padding: "20px", 
    background: "#f8fafc", 
    borderRadius: "16px", 
    border: "1px solid #e2e8f0", 
    cursor: "pointer",
    fontSize: "14px",
    color: "#374151"
  };

  const checkboxInput = { 
    width: "20px", 
    height: "20px", 
    marginTop: "2px", 
    accentColor: "#10b981" 
  };

  const buttonStyle = { 
    width: "100%", 
    padding: "20px", 
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
    color: "white", 
    border: "none", 
    borderRadius: "20px", 
    fontSize: "18px", 
    fontWeight: "700", 
    cursor: "pointer", 
    boxShadow: "0 10px 30px rgba(16,185,129,0.4)", 
    transition: "all 0.3s",
    fontFamily: "inherit"
  };

  const loginLinkStyle = { 
    textAlign: "center", 
    paddingTop: "25px", 
    borderTop: "1px solid #e2e8f0", 
    color: "#6b7280", 
    fontSize: "15px" 
  };

  const linkStyle = { 
    color: "#10b981", 
    fontWeight: "700", 
    textDecoration: "none" 
  };

  // Composants réutilisables
  function InputField({ label, name, value, onChange, icon, type = "text", placeholder }) {
    return (
      <div style={{marginBottom: "8px"}}>
        <label style={labelStyle}>{label}</label>
        <div style={inputWrapper}>
          <span style={iconStyle}>{icon}</span>
          <input
            name={name} 
            type={type} 
            value={value}
            onChange={onChange} 
            placeholder={placeholder}
            required 
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "#10b981";
              e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
          />
        </div>
      </div>
    );
  }

  function SelectField({ label, name, value, onChange, icon, options }) {
    return (
      <div style={{marginBottom: "8px"}}>
        <label style={labelStyle}>{label}</label>
        <div style={inputWrapper}>
          <span style={iconStyle}>{icon}</span>
          <select 
            name={name} 
            value={value} 
            onChange={onChange} 
            style={selectStyle} 
            required
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div style={rootStyle}>
      <div style={cardStyle}>
        <div style={gridStyle}>
          {/* Hero */}
          <div style={heroStyle}>
            <div style={badgeStyle}>
              <div style={sparkle} />
              <span>Safoua Academy</span>
            </div>
            <h1 style={titleStyle}>CRÉER UN COMPTE</h1>
            <p style={subtitleStyle}>Accédez aux formations disponibles</p>
            <div style={featuresStyle}>
              <div style={featureItem}>
                <span style={{fontSize: "24px", marginRight: "15px"}}>✓</span>
                <span>Profil vérifié</span>
              </div>
              <div style={featureItem}>
                <span style={{fontSize: "24px", marginRight: "15px"}}>📧</span>
                <span>Email confirmé</span>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div style={formContainer}>
            <div style={headerStyle}>
              <div>
                <span style={tagStyle}>INSCRIPTION</span>
                <h3 style={sectionTitle}>Academy</h3>
              </div>
              <div style={avatarStyle}>👤</div>
            </div>

            {error && <div style={errorStyle}>⚠️ {error}</div>}

            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={rowStyle}>
                <InputField 
                  label="Nom *" 
                  name="nom" 
                  value={formData.nom} 
                  onChange={handleChange} 
                  icon="👤" 
                  placeholder="Dupont"
                />
                <InputField 
                  label="Prénom *" 
                  name="prenom" 
                  value={formData.prenom} 
                  onChange={handleChange} 
                  icon="✏️" 
                  placeholder="Jean"
                />
              </div>

              <InputField 
                label="Email *" 
                name="email" 
                type="email"
                value={formData.email} 
                onChange={handleChange}
                icon="📧" 
                placeholder="jean@academy.com"
              />

              <SelectField 
                label="Profil *" 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                icon="🎓"
                options={[
                  {value: "etudiant", label: "Étudiant"},
                  {value: "enseignant", label: "Enseignant"},
                  {value: "administrateur", label: "Administrateur"}
                ]}
              />

              <div style={rowStyle}>
                <InputField 
                  label="Mot de passe *" 
                  name="mdp" 
                  type="password"
                  value={formData.mdp} 
                  onChange={handleChange}
                  icon="🔒" 
                  placeholder="••••••••"
                />
                <InputField 
                  label="Confirmer *" 
                  name="confirmMdp" 
                  type="password"
                  value={formData.confirmMdp} 
                  onChange={handleChange}
                  icon="🔐" 
                  placeholder="••••••••"
                />
              </div>

              <label style={checkboxStyle}>
                <input
                  type="checkbox" 
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  style={checkboxInput}
                />
                <span>J'accepte les conditions d'utilisation</span>
              </label>

              <button 
                type="submit" 
                disabled={loading} 
                style={buttonStyle}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 15px 35px rgba(16,185,129,0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 10px 30px rgba(16,185,129,0.4)";
                  }
                }}
              >
                {loading ? "⏳ Inscription..." : "✅ S'inscrire"}
              </button>

              <div style={loginLinkStyle}>
                Déjà un compte ? <a href="/login" style={linkStyle}>Se connecter</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
