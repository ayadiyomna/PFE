import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import EtudiantDashboard from "./pages/EtudiantDashboard";
import EnseignantDashboard from "./pages/EnseignantDashboard";
import Home from "./pages/Home";
import Cours from "./pages/Cours";
import CourseDetail from "./pages/CoursDetails";
import LessonPlayer from "./pages/LessonPlayer";
import ProgressQuizPage from "./pages/ProgressQuizPage";
import CertificatesPage from "./pages/CertificatesPage";
import CreerCours from './components/CreerCours';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100">
        <Routes>
          <Route path="/" element={<Home />} />                    
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cours" element={<Cours/>}/>
          <Route path="/CourseDetail" element={<CourseDetail></CourseDetail>}></Route>
          <Route path="/certificat" element={<CertificatesPage/>}/>
          <Route path="/lecon" element={<LessonPlayer/>}>
          </Route>
          <Route path="/quizz" element={<ProgressQuizPage/>}></Route>

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/etudiant" element={<EtudiantDashboard />} />
          <Route path="/enseignant" element={<EnseignantDashboard />} />
          <Route path="/enseignant/creer-cours" element={<CreerCours />}/>
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
                  La page que vous cherchez n'existe pas.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  ← Retour à l'accueil
                </a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
