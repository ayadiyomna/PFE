import { Link } from "react-router-dom";
import bg from "../assets/bg.jpg";

function Home() {

  const heroStyle = {
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "80vh",
    position: "relative",
    display: "flex",
    alignItems: "center"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Poppins', sans-serif" }}>

      {/* HEADER */}
      <header style={{
        background: "white",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
      }}>
        <h1 style={{ color: "#059669", fontWeight: "800" }}>Safoua Academy</h1>

        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/login" style={{ textDecoration: "none", color: "#111827", fontWeight: "600" }}>
            Login
          </Link>

          <Link to="/register">
            <button style={{
              background: "#10b981",
              color: "white",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}>
              Register
            </button>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section style={heroStyle}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)"
        }} />

        <div style={{
          position: "relative",
          padding: "2rem",
          color: "white",
          maxWidth: "800px",
          marginLeft: "5%"
        }}>
          <h2 style={{ fontSize: "3rem", fontWeight: "900" }}>
            Maîtrisez le Coran et l'Arabe
          </h2>

          <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>
            Plateforme intelligente avec accompagnement personnalisé
          </p>

          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <Link to="/Cours">
              <button style={{
                background: "#10b981",
                border: "none",
                padding: "1rem 1.5rem",
                borderRadius: "10px",
                color: "white",
                fontWeight: "600",
                cursor: "pointer"
              }}>
                Voir les Cours
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: "#1f2937",
        color: "white",
        textAlign: "center",
        padding: "1rem"
      }}>
        © 2026 Safoua Academy
      </footer>

    </div>
  );
}

export default Home;