// Home.jsx - INLINE STYLES (FONCTIONNE DIRECT)
import { useEffect, useState } from "react";
import axios from "axios";
import CourseCard from "../components/CourseCard";

function Home() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/cours/courslist")
      .then(res => setCours(res.data.data || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const heroStyle = {
    backgroundImage: "url('https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1800&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "70vh",
    position: "relative"
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f9fafb",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderTop: "4px solid #10b981",
        padding: "1rem 0"
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h1 style={{
            fontSize: "2rem",
            fontWeight: "900",
            color: "#047857"
          }}>Safoua Academy</h1>
          <button style={{
            backgroundColor: "#10b981",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            fontWeight: "600",
            cursor: "pointer"
          }}>Commencer</button>
        </div>
      </header>

      {/* Hero */}
      <section style={heroStyle}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(6,78,59,0.7), rgba(5,63,49,0.4), rgba(0,0,0,0.2))"
        }} />
        <div style={{
          position: "relative",
          padding: "5rem 1.5rem"
        }}>
          <div style={{
            maxWidth: "1280px",
            margin: "0 auto"
          }}>
            <h2 style={{
              fontSize: "3rem",
              fontWeight: "900",
              color: "white",
              marginBottom: "1rem",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
            }}>
              Maîtrisez le Coran et l'Arabe
            </h2>
            <p style={{
              fontSize: "1.25rem",
              color: "rgba(255,255,255,0.9)",
              marginBottom: "2rem"
            }}>
              Apprentissage intelligent avec IA
            </p>
            <button style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "1rem 2rem",
              borderRadius: "0.75rem",
              fontSize: "1.125rem",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(16,185,129,0.3)"
            }}>
              Commencer Gratuitement
            </button>
          </div>
        </div>
      </section>

      {/* Cours */}
      <section style={{
        padding: "4rem 1.5rem",
        backgroundColor: "#f8fafc"
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          textAlign: "center"
        }}>
          <h3 style={{
            fontSize: "2.5rem",
            fontWeight: "900",
            color: "#1f2937",
            marginBottom: "3rem"
          }}>Nos Cours</h3>
          
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem"
            }}>
              {cours.map(cour => (
                <CourseCard key={cour._id} cour={cour} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
