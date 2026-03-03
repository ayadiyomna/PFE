import { useEffect, useState } from "react";
import axios from "axios";

function Cours() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/cours/courslist")
      .then(res => setCours(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "3rem", fontFamily: "'Poppins', sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "3rem" }}>
        Nos Cours Disponibles
      </h2>

      {loading ? (
        <p style={{ textAlign: "center" }}>Chargement...</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem"
        }}>
          {cours.map((c) => (
            <div key={c._id} style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
            }}>
              <img
                src={c.image || "https://via.placeholder.com/400x200"}
                alt={c.titre}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px"
                }}
              />

              <h3 style={{ marginTop: "1rem" }}>{c.titre}</h3>

              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                {c.description}
              </p>

              <p style={{ marginTop: "0.5rem", fontWeight: "600" }}>
                Niveau: {c.niveau}
              </p>

              <p style={{ fontWeight: "700", color: "#059669" }}>
                {c.prix === 0 ? "Gratuit" : `${c.prix} DT`}
              </p>

              <button style={{
                marginTop: "1rem",
                background: "#10b981",
                border: "none",
                padding: "0.7rem 1rem",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer"
              }}>
                Voir Détails
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cours;