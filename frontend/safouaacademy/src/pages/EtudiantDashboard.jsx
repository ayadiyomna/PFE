import { useState, useEffect } from "react";
import { getCoursList } from "../services/coursService";
import CourseCard from "../components/CourseCard";

function EtudiantDashboard() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCours = async () => {
      try {
        setLoading(true);
        const response = await getCoursList();
        setCours(response.data);
      } catch (err) {
        setError("Erreur chargement des cours");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCours();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-xl">Chargement des cours...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Étudiant */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Mes Cours Disponibles
          </h1>
          <p className="text-xl text-gray-600">Découvrez nos formations adaptées à votre niveau</p>
        </div>

        {/* Grille des cours */}
        {error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {cours.map((cour) => (
              <CourseCard key={cour._id} cour={cour} />
            ))}
          </div>
        )}

        {cours.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 mb-4">Aucun cours disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EtudiantDashboard;
