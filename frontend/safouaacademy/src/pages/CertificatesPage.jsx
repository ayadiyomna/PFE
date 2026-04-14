import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import api from "../services/api";
import authService from "../services/authService";

function CertificatesPage() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [inProgressCourses, setInProgressCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    loadCertificates();
    loadInProgressCourses();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/certificats/mes-certificats');
      setCertificates(response.data.data || []);
    } catch (error) {
      console.error("Erreur chargement certificats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadInProgressCourses = async () => {
    try {
      const response = await api.get('/cours/etudiant/mes-cours');
      const courses = response.data.data || [];
      
      // Filtrer les cours non terminés
      const inProgress = courses.filter(c => (c.progress || 0) < 100);
      setInProgressCourses(inProgress);
    } catch (error) {
      console.error("Erreur chargement cours en cours:", error);
    }
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      const response = await api.get(`/certificats/${certificateId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificat-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    }
  };

  const handleShareCertificate = (certificate) => {
    setShareModal(certificate);
  };

  const handleShareConfirm = async (method, certificateId) => {
    const shareUrl = `${window.location.origin}/certificats/${certificateId}`;
    
    try {
      if (method === 'copy') {
        await navigator.clipboard.writeText(shareUrl);
      } else if (method === 'email') {
        window.location.href = `mailto:?subject=Mon certificat Safoua Academy&body=J'ai obtenu mon certificat ! Consultez-le ici : ${shareUrl}`;
      } else if (method === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
      }
      setShareModal(null);
    } catch (error) {
      console.error("Erreur lors du partage:", error);
    }
  };

  const handleViewCertificate = (certificateId) => {
    navigate(`/certificats/${certificateId}`);
  };

  const handleContinueCourse = (courseId) => {
    navigate(`/cours/${courseId}`);
  };

  const handleGenerateCertificate = async (courseId) => {
    try {
      await api.post(`/certificats/generer/${courseId}`);
      loadCertificates();
    } catch (error) {
      console.error("Erreur génération certificat:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/cours" className="text-gray-600 hover:text-emerald-600">
              Catalogue
            </Link>
            <Link to="/etudiant" className="text-gray-600 hover:text-emerald-600">
              Mes cours
            </Link>
            <Link to="/etudiant/progression" className="text-gray-600 hover:text-emerald-600">
              Progression
            </Link>
            <Link to="/certificats" className="text-emerald-600 font-semibold">
              Certificats
            </Link>
          </nav>
          
          <button 
            onClick={() => navigate('/etudiant')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
          >
            Mon compte
          </button>
        </div>
      </header>

      {/* Modal de partage */}
      {shareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Partager le certificat</h3>
            <p className="text-sm text-gray-600 mb-4">{shareModal.course}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleShareConfirm('copy', shareModal.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-200"
              >
                <span className="text-2xl">📋</span>
                <span className="flex-1 text-left">Copier le lien</span>
              </button>
              
              <button
                onClick={() => handleShareConfirm('email', shareModal.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-200"
              >
                <span className="text-2xl">📧</span>
                <span className="flex-1 text-left">Partager par email</span>
              </button>
              
              <button
                onClick={() => handleShareConfirm('linkedin', shareModal.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-200"
              >
                <span className="text-2xl">💼</span>
                <span className="flex-1 text-left">Partager sur LinkedIn</span>
              </button>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShareModal(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
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

            {certificates.length > 0 ? (
              <div className="space-y-6 mb-10">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  Certificats obtenus
                </h2>
                
                {certificates.map((cert) => (
                  <div key={cert.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition">
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

                    <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Ce certificat atteste de votre réussite</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Formateur: {cert.instructor} • {cert.hours} heures
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleShareCertificate(cert)}
                          className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                          title="Partager"
                        >
                          <span>📤</span>
                          <span className="hidden sm:inline">Partager</span>
                        </button>
                        
                        <button 
                          onClick={() => handleViewCertificate(cert.id)}
                          className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                          title="Voir"
                        >
                          <span>👁️</span>
                          <span className="hidden sm:inline">Voir</span>
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
              <div className="bg-white rounded-xl shadow-sm p-12 text-center mb-10">
                <span className="text-6xl mb-4 block">🏆</span>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun certificat pour le moment</h3>
                <p className="text-gray-500 mb-4">Complétez vos cours pour obtenir vos premiers certificats</p>
                <Link 
                  to="/cours" 
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                >
                  <span>📚</span>
                  Explorer les cours
                </Link>
              </div>
            )}

            {inProgressCourses.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-emerald-600">⏳</span>
                  Prochains certificats
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgressCourses.map((course) => (
                    <div key={course._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-2xl">📖</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{course.titre}</h3>
                            <p className="text-xs text-gray-500">
                              Est. {new Date(new Date().setMonth(new Date().getMonth() + 2)).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progression</span>
                            <span className="font-semibold text-emerald-600">{course.progress || 0}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-600 transition-all" 
                              style={{ width: `${course.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">
                            {course.remainingLessons || Math.floor((100 - (course.progress || 0)) / 10)} leçons restantes
                          </span>
                          <button
                            onClick={() => handleContinueCourse(course._id)}
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