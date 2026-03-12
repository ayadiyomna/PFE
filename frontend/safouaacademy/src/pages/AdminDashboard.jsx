import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "",
    progress: 0
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const API_BASE = "http://localhost:5000/api"; // Changez selon votre backend

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/', { replace: true });
    toast.success("👋 Déconnexion réussie !");
  };

  // ✅ CHARGEMENT API (remplace setTimeout)
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/admin/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
      toast.info(`📊 ${response.data.length} étudiants chargés`);
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("❌ Erreur chargement étudiants");
      // Fallback data si API down
      setStudents([
        { id: 301, name: "M. Ait Ali", email: "ait.ali@example.com", course: "Tajwid Avancé", progress: 64 },
        { id: 302, name: "S. Rahmani", email: "rahmani@example.com", course: "Arabe Classique", progress: 52 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "progress" ? parseInt(value) || 0 : value
    }));
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({ name: "", email: "", course: "", progress: 0 });
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email || "",
      course: student.course,
      progress: student.progress
    });
    setShowModal(true);
  };

  // ✅ CREATE/UPDATE API
  const handleSaveStudent = async () => {
    if (!formData.name.trim() || !formData.course) {
      toast.error("⚠️ Nom et cours obligatoires !");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (editingStudent) {
        // UPDATE
        await axios.put(`${API_BASE}/admin/students/${editingStudent.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("✅ Étudiant modifié !");
      } else {
        // CREATE
        await axios.post(`${API_BASE}/admin/students`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("🎉 Nouvel étudiant ajouté !");
      }
      
      setShowModal(false);
      loadStudents(); // Refresh
    } catch (error) {
      toast.error(error.response?.data?.message || "❌ Erreur sauvegarde");
    }
  };

  // ✅ DELETE avec confirmation toast
  const confirmDelete = (studentId) => {
    setDeleteConfirm(studentId);
  };

  const handleDeleteStudent = async () => {
    if (!deleteConfirm) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/admin/students/${deleteConfirm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("🗑️ Étudiant supprimé !");
      setDeleteConfirm(null);
      loadStudents();
    } catch (error) {
      toast.error("❌ Erreur suppression");
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleViewStudent = (studentId) => {
    navigate(`/admin/etudiants/${studentId}`);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER IDENTIQUE */}
      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/admin" className="text-emerald-600 font-semibold">Dashboard Admin</Link>
            <Link to="/admin/etudiants" className="text-gray-600 hover:text-emerald-600">Étudiants</Link>
            <Link to="/admin/cours" className="text-gray-600 hover:text-emerald-600">Cours</Link>
            <Link to="/admin/parametres" className="text-gray-600 hover:text-emerald-600">Paramètres</Link>
            <button 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-semibold px-3 py-1 rounded transition"
              title="Déconnexion"
            >
              Déconnexion
            </button>
          </nav>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/compte')}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              Admin
            </button>
            <button 
              onClick={handleLogout} 
              className="md:hidden p-2 text-red-600 hover:bg-red-50 rounded-lg transition" 
              title="Déconnexion"
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* ✅ TOAST CONTAINER */}
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
      />

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmer suppression</h3>
            <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteStudent}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Supprimer
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 border border-gray-200 py-2 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VOTRE MAIN CONTENT IDENTIQUE */}
      <main className="flex-1">
        <div className="px-4 sm:px-6 lg:px-10 py-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* ... TOUT VOTRE JSX TABLEAU RESTE IDENTIQUE ... */}
            {/* Juste modifier les onClick : */}
            
            {/* Bouton Supprimer devient : */}
            <button 
              onClick={() => confirmDelete(student.id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Supprimer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 text-red-600">
                {/* SVG identique */}
              </svg>
            </button>
            
            {/* ET handleSaveStudent utilise maintenant les toasts au lieu d'alert */}
          </div>
        </div>
      </main>

      
    </div>
  );
}

export default AdminDashboard;
