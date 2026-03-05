import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function CertificatesPage() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [inProgressCourses, setInProgressCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données
  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      // Simuler un appel API
      setTimeout(() => {
        setCertificates([
          {
            id: "SAF-2024-001",
            course: "Tajwid Avancé",
            level: "Expert",
            date: "15 fév 2024",
            instructor: "Cheikh Ahmed Al-Mansouri",
            score: 94,
            hours: 42,
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop"
          }
        ]);

        setInProgressCourses([
          {
            id: 2,
            title: "Arabe Classique",
            progress: 64,
            remainingLessons: 12,
            estimatedCompletion: "avril 2026"
          },
          {
            id: 3,
            title: "Fiqh & Usul",
            progress: 32,
            remainingLessons: 24,
            estimatedCompletion: "juin 2026"
          },
          {
            id: 4,
            title: "Tafsir du Coran",
            progress: 18,
            remainingLessons: 36,
            estimatedCompletion: "août 2026"
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erreur chargement certificats:", error);
      setLoading(false);
    }
  };

  const handleDownloadCertificate = (certificateId) => {
    console.log("Téléchargement du certificat", certificateId);
    // Générer un PDF
    window.open(`/api/certificats/${certificateId}/pdf`, '_blank');
  };

  const handleShareCertificate = (certificateId) => {
    console.log("Partage du certificat", certificateId);
    // Copier le lien
    navigator.clipboard.writeText(`https://safouaacademy.com/certificats/${certificateId}`);
    alert("Lien copié dans le presse-papiers !");
  };

  const handleViewCertificate = (certificateId) => {
    navigate(`/certificats/${certificateId}`);
  };

  const handleContinueCourse = (courseId) => {
    navigate(`/cours/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/catalogue" className="text-gray-600 hover:text-emerald-600">
              Catalogue
            </Link>
            <Link to="/progression" className="text-gray-600 hover:text-emerald-600">
              Progression
            </Link>
            <Link to="/certificats" className="text-emerald-600 font-semibold">
              Certificats
            </Link>
          </nav>
          
          <button 
            onClick={() => navigate('/compte')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
          >
            Mon compte
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {/* En-tête avec statistiques */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Mes certificats</h1>
              
              <div className="flex items-center gap-3 mt-3 md:mt-0">
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg flex items-center gap-2">
                  <span>🏆</span>
                  <span className="font-semibold">{certificates.length} obtenu{certificates.length > 1 ? 's' : ''}</span>
                </div>
                <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                  <span>📚</span>
                  <span className="font-semibold">{inProgressCourses.length} en cours</span>
                </div>
              </div>
            </div>

            {/* Section des certificats obtenus */}
            {certificates.length > 0 ? (
              <div className="space-y-6 mb-10">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  Certificats obtenus
                </h2>
                
                {certificates.map((cert) => (
                  <div key={cert.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* En-tête du certificat */}
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 border-b-4 border-emerald-600">
                      <div className="text-center">
                        <span className="text-6xl mb-4 block">🏆</span>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Certificat de Réussite</h3>
                        <p className="text-lg text-gray-700 mb-4">Safoua Academy</p>
                        
                        <div className="border-t-2 border-emerald-600 pt-4 inline-block">
                          <p className="text-xl font-semibold text-gray-900">{cert.course}</p>
                          <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                              Niveau {cert.level}
                            </span>
                            <span className="text-gray-600">Score: {cert.score}%</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">Certificat ID: {cert.id}</p>
                          <p className="text-sm text-gray-600">Délivré le {cert.date}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Ce certificat atteste de votre réussite</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Formateur: {cert.instructor} • {cert.hours} heures
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleShareCertificate(cert.id)}
                          className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                          title="Partager"
                        >
                          <span>📤</span>
                          <span className="hidden sm:inline ml-2">Partager</span>
                        </button>
                        
                        <button 
                          onClick={() => handleViewCertificate(cert.id)}
                          className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                          title="Voir"
                        >
                          <span>👁️</span>
                          <span className="hidden sm:inline ml-2">Voir</span>
                        </button>
                        
                        <button 
                          onClick={() => handleDownloadCertificate(cert.id)}
                          className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold flex items-center gap-2"
                        >
                          <span>📥</span>
                          Télécharger PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* État vide */
              <div className="bg-white rounded-xl shadow-sm p-12 text-center mb-10">
                <span className="text-6xl mb-4 block">🏆</span>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun certificat pour le moment</h3>
                <p className="text-gray-500 mb-4">Complétez vos cours pour obtenir vos premiers certificats</p>
                <Link 
                  to="/catalogue" 
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                >
                  <span>📚</span>
                  Explorer les cours
                </Link>
              </div>
            )}

            {/* Certificats à venir */}
            {inProgressCourses.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-emerald-600">⏳</span>
                  Prochains certificats
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgressCourses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-2xl">📖</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{course.title}</h3>
                            <p className="text-xs text-gray-500">Est. {course.estimatedCompletion}</p>
                          </div>
                        </div>

                        {/* Barre de progression */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progression</span>
                            <span className="font-semibold text-emerald-600">{course.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-600 transition-all" 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">{course.remainingLessons} leçons restantes</span>
                          <button
                            onClick={() => handleContinueCourse(course.id)}
                            className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                          >
                            Continuer
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default CertificatesPage;