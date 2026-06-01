import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import du composant de synchronisation
import SyncStatus from "./components/SyncStatus";
import Header from "./components/Header";

// Pages publiques
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Cours from "./pages/Cours";
import CourseDetail from "./pages/CoursDetails";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Pages protégées
import AdminDashboard from "./pages/AdminDashboard";
import EtudiantDashboard from "./pages/EtudiantDashboard";
import EnseignantDashboard from "./pages/EnseignantDashboard";
import LessonPlayer from "./pages/LessonPlayer";
import ProgressQuizPage from "./pages/ProgressQuizPage";
import CertificatesPage from "./pages/CertificatesPage";
import CreerCours from './components/CreerCours';
import EnseignantCourseEditor from './pages/EnseignantCourseEditor';
import ChatWidget from './components/ChatWidget';
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import CheckoutPayment from "./pages/CheckoutPayment";
import Compte from "./pages/Compte";

// Layout component - Pages SANS header (login, register, etc.)
const PublicLayout = ({ children }) => (
  <div className="min-h-screen">
    {children}
  </div>
);

// Layout component - Pages AVEC header
const DefaultLayout = ({ children }) => (
  <>
    <Header />
    <div className="min-h-screen pt-28 bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100">
      {children}
    </div>
  </>
);

// Composant de route protégée
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userRole: null,
    loading: true
  });

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          setAuthState({
            isAuthenticated: false,
            userRole: null,
            loading: false
          });
          return;
        }

        const user = JSON.parse(userStr);
        
        let normalizedRole = user?.role;
        if (normalizedRole === 'administrateur') {
          normalizedRole = 'admin';
        }
        
        setAuthState({
          isAuthenticated: true,
          userRole: normalizedRole,
          loading: false
        });
      } catch (error) {
        console.error('Erreur de vérification auth:', error);
        setAuthState({
          isAuthenticated: false,
          userRole: null,
          loading: false
        });
      }
    };

    checkAuth();
  }, []);

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(authState.userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Composant pour la page 404
const NotFoundPage = () => (
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
);

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const currentPath = window.location.pathname;
    
    if (token && userStr && currentPath === '/') {
      try {
        const user = JSON.parse(userStr);
        const role = user?.role;
        
        if (role === 'administrateur' || role === 'admin') {
          window.location.href = '/admin';
        } else if (role === 'enseignant') {
          window.location.href = '/enseignant';
        } else if (role === 'etudiant') {
          window.location.href = '/etudiant';
        }
      } catch (error) {
        console.error("Erreur de redirection:", error);
      }
    }
  }, []);

  return (
    <>
      <BrowserRouter>
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
          limit={3}
        />
        
        <SyncStatus />
        <ChatWidget />
        
        <Routes>
          {/* Routes SANS header (login, register, forgot-password, reset-password) */}
          <Route path="/login" element={
            <PublicLayout><Login /></PublicLayout>
          } />
          <Route path="/register" element={
            <PublicLayout><Register /></PublicLayout>
          } />
          <Route path="/forgot-password" element={
            <PublicLayout><ForgotPassword /></PublicLayout>
          } />
          <Route path="/reset-password/:token" element={
            <PublicLayout><ResetPassword /></PublicLayout>
          } />
          
          {/* Routes AVEC header (toutes les autres) */}
          <Route path="/" element={
            <DefaultLayout><Home /></DefaultLayout>
          } />
          <Route path="/cours" element={
            <DefaultLayout><Cours /></DefaultLayout>
          } />
          <Route path="/cours/:id" element={
            <DefaultLayout><CourseDetail /></DefaultLayout>
          } />
          <Route path="/cours/:id/paiement" element={
            <ProtectedRoute>
              <DefaultLayout><CheckoutPayment /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/success" element={
            <DefaultLayout><Success /></DefaultLayout>
          } />
          <Route path="/cancel" element={
            <DefaultLayout><Cancel /></DefaultLayout>
          } />
          
          {/* Routes protégées - Étudiant */}
          <Route path="/etudiant" element={
            <ProtectedRoute allowedRoles={['etudiant', 'admin']}>
              <DefaultLayout><EtudiantDashboard /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/compte" element={
            <ProtectedRoute>
              <DefaultLayout><Compte /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/etudiant/progression" element={
            <ProtectedRoute allowedRoles={['etudiant', 'admin']}>
              <DefaultLayout><ProgressQuizPage /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/etudiant/certificats" element={
            <ProtectedRoute allowedRoles={['etudiant', 'admin']}>
              <DefaultLayout><CertificatesPage /></DefaultLayout>
            </ProtectedRoute>
          } />
          
          {/* Routes des cours */}
          <Route path="/cours/:courseId/lecon/:lessonId" element={
            <ProtectedRoute allowedRoles={['etudiant', 'enseignant', 'admin']}>
              <DefaultLayout><LessonPlayer /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/quiz/cours/:courseId" element={
            <ProtectedRoute allowedRoles={['etudiant', 'admin']}>
              <DefaultLayout><ProgressQuizPage /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/quiz/cours/:courseId/final" element={
            <ProtectedRoute allowedRoles={['etudiant', 'admin']}>
              <DefaultLayout><ProgressQuizPage /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/quiz/revision/:quizId" element={
            <ProtectedRoute allowedRoles={['etudiant', 'admin']}>
              <DefaultLayout><ProgressQuizPage /></DefaultLayout>
            </ProtectedRoute>
          } />
          
          {/* Routes protégées - Enseignant */}
          <Route path="/enseignant" element={
            <ProtectedRoute allowedRoles={['enseignant', 'admin']}>
              <DefaultLayout><EnseignantDashboard /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/enseignant/creer-cours" element={
            <ProtectedRoute allowedRoles={['enseignant', 'admin']}>
              <DefaultLayout><CreerCours /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/enseignant/modifier-cours/:id" element={
            <ProtectedRoute allowedRoles={['enseignant', 'admin']}>
              <DefaultLayout><EnseignantCourseEditor /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/enseignant/statistiques/:courseId" element={
            <ProtectedRoute allowedRoles={['enseignant', 'admin']}>
              <DefaultLayout><EnseignantDashboard /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/enseignant/analytiques" element={
            <ProtectedRoute allowedRoles={['enseignant', 'admin']}>
              <DefaultLayout><EnseignantDashboard /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/enseignant/parametres" element={
            <ProtectedRoute allowedRoles={['enseignant', 'admin']}>
              <DefaultLayout>
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Paramètres enseignant</h1>
                  <p className="text-gray-600">Page en construction</p>
                </div>
              </DefaultLayout>
            </ProtectedRoute>
          } />
          
          {/* Routes protégées - Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DefaultLayout><AdminDashboard /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/etudiants" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DefaultLayout><AdminDashboard /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/etudiants/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DefaultLayout><AdminDashboard /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/cours" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DefaultLayout><AdminDashboard /></DefaultLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/parametres" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DefaultLayout>
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Paramètres administrateur</h1>
                  <p className="text-gray-600">Page en construction</p>
                </div>
              </DefaultLayout>
            </ProtectedRoute>
          } />
          
          {/* Redirections */}
          <Route path="/CourseDetail" element={<Navigate to="/cours" replace />} />
          <Route path="/certificat" element={<Navigate to="/etudiant/certificats" replace />} />
          <Route path="/lecon" element={<Navigate to="/cours" replace />} />
          <Route path="/quizz" element={<Navigate to="/etudiant/progression" replace />} />
          <Route path="/catalogue" element={<Navigate to="/cours" replace />} />
          
          {/* Route 404 */}
          <Route path="*" element={<DefaultLayout><NotFoundPage /></DefaultLayout>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;