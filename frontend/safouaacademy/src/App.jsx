import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages publiques
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Cours from "./pages/Cours";
import CourseDetail from "./pages/CoursDetails";

// Pages protégées
import AdminDashboard from "./pages/AdminDashboard";
import EtudiantDashboard from "./pages/EtudiantDashboard";
import EnseignantDashboard from "./pages/EnseignantDashboard";
import LessonPlayer from "./pages/LessonPlayer";
import ProgressQuizPage from "./pages/ProgressQuizPage";
import CertificatesPage from "./pages/CertificatesPage";
import CreerCours from './components/CreerCours';

// Composant de route protégée
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user) {
      setIsAuthenticated(true);
      setUserRole(user.role);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cours" element={<Cours />} />
          <Route path="/cours/:id" element={<CourseDetail />} />
          
          {/* Routes protégées - Étudiant */}
          <Route path="/etudiant" element={
            <ProtectedRoute allowedRoles={['etudiant', 'admin']}>
              <EtudiantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/etudiant/progression" element={
            <ProtectedRoute allowedRoles={['etudiant', 'admin']}>
              <ProgressQuizPage />
            </ProtectedRoute>
          } />
          <Route path="/etudiant/certificats" element={
            <ProtectedRoute allowedRoles={['etudiant', 'admin']}>
              <CertificatesPage />
            </ProtectedRoute>
          } />
          
          {/* Routes des cours - Accessibles aux étudiants inscrits */}
          <Route path="/cours/:courseId/lecon/:lessonId" element={
            <ProtectedRoute allowedRoles={['etudiant', 'enseignant', 'admin']}>
              <LessonPlayer />
            </ProtectedRoute>
          } />
          <Route path="/quiz/cours/:courseId" element={
            <ProtectedRoute allowedRoles={['etudiant', 'admin']}>
              <ProgressQuizPage />
            </ProtectedRoute>
          } />
          <Route path="/quiz/cours/:courseId/final" element={
            <ProtectedRoute allowedRoles={['etudiant', 'admin']}>
              <ProgressQuizPage />
            </ProtectedRoute>
          } />
          <Route path="/quiz/revision/:quizId" element={
            <ProtectedRoute allowedRoles={['etudiant', 'admin']}>
              <ProgressQuizPage />
            </ProtectedRoute>
          } />
          
          {/* Routes protégées - Enseignant */}
          <Route path="/enseignant" element={
            <ProtectedRoute allowedRoles={['enseignant', 'admin']}>
              <EnseignantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/enseignant/creer-cours" element={
            <ProtectedRoute allowedRoles={['enseignant', 'admin']}>
              <CreerCours />
            </ProtectedRoute>
          } />
          <Route path="/enseignant/modifier-cours/:id" element={
            <ProtectedRoute allowedRoles={['enseignant', 'admin']}>
              <CreerCours />
            </ProtectedRoute>
          } />
          <Route path="/enseignant/statistiques/:courseId" element={
            <ProtectedRoute allowedRoles={['enseignant', 'admin']}>
              <EnseignantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/enseignant/analytiques" element={
            <ProtectedRoute allowedRoles={['enseignant', 'admin']}>
              <EnseignantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/enseignant/parametres" element={
            <ProtectedRoute allowedRoles={['enseignant', 'admin']}>
              <div>Paramètres enseignant</div>
            </ProtectedRoute>
          } />
          
          {/* Routes protégées - Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/etudiants" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/etudiants/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/cours" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/parametres" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Paramètres admin</div>
            </ProtectedRoute>
          } />
          
          {/* Redirections pour les anciennes routes */}
          <Route path="/CourseDetail" element={<Navigate to="/cours" replace />} />
          <Route path="/certificat" element={<Navigate to="/etudiant/certificats" replace />} />
          <Route path="/lecon" element={<Navigate to="/cours" replace />} />
          <Route path="/quizz" element={<Navigate to="/etudiant/progression" replace />} />
          
          {/* Route 404 */}
          <Route path="*" element={
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-red-50 flex items-center justify-center px-4 py-12">
              <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl text-center p-12 border-t-8 border-red-500">
                <div className="w-24 h-24 bg-red-100 rounded-2xl mx-auto mb-8 flex items-center justify-center">
                  <span className="text-4xl">🚫</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                  404
                </h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Page non trouvée
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  La page que vous cherchez n'existe pas ou a été déplacée.
                </p>
                <div className="space-y-3">
                  <a
                    href="/"
                    className="inline-flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 w-full justify-center"
                  >
                    ← Retour à l'accueil
                  </a>
                  <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center gap-3 border border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 w-full justify-center"
                  >
                    ← Page précédente
                  </button>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;