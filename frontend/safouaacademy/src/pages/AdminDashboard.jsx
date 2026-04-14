import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";           // ← AJOUTÉ
import coursService from "../services/coursService"; // ← AJOUTÉ
import authService from "../services/authService";   // ← AJOUTÉ

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // ← REMPLACÉ : Données réelles au lieu de statiques
  const [users, setUsers] = useState([]);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour les modales (inchangés)
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    cours: "",
    progression: 0
  });

 const loadUsers = async () => {
  console.log("🔍 === DÉBUT loadUsers ===");
  
  try {
    setLoading(true);
    let result;
    
    try {
      console.log("Test 1: /users");
      result = await api.get('/users');
      console.log("✅ /users OK:", result?.data?.data?.length || 0);
    } catch (e1) {
      console.log("❌ /users FAIL");
      // ... autres tests
    }
    
    console.log("RESULTAT FINAL:", result);
    
    // ✅ FIX : result.data.data (structure de votre API)
    if (result?.data?.data) {
      console.log("📥 Setting users:", result.data.data.length);
      setUsers(result.data.data);
    } else if (result?.data) {
      console.log("📥 Setting users (format plat):", result.data.length);
      setUsers(result.data);
    } else {
      console.log("🚫 Aucun résultat valide");
      setUsers([]);
    }
  } catch (error) {
    console.log("💥 ERREUR:", error.message);
    setUsers([]);
  } finally {
    setLoading(false);
    console.log("🔍 === FIN loadUsers ===");
  }
};

  const loadCourses = async () => {
    try {
      const result = await coursService.getAllCours();
      if (result.success) {
        setCours(result.data);
      }
    } catch (error) {
      console.error("📚 Cours indisponibles:", error);
      setCours([]);
    }
  };

  // Vérification d'authentification (inchangée)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log("=== AdminDashboard - Vérification ===");
    console.log("Token présent:", !!token);
    
    if (!token) {
      console.log("Pas de token, redirection vers login");
      navigate('/login');
      return;
    }
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const role = user?.role;
        console.log("Rôle utilisateur:", role);
        
        if (role === 'admin' || role === 'administrateur') {
          console.log("✅ Accès admin autorisé");
          setIsAuthorized(true);
          // ← AJOUTÉ : Charger données après autorisation
          loadUsers();
          loadCourses();
        } else {
          console.log("❌ Pas admin, redirection vers home");
          navigate('/');
        }
      } catch (error) {
        console.error("Erreur parsing user:", error);
        navigate('/login');
      }
    } else {
      console.log("Pas d'utilisateur, redirection vers login");
      navigate('/login');
    }
  }, []);

  const handleLogout = () => {
    authService.logout(); // ← AMÉLIORÉ
    navigate('/login');
  };

  // Fonctions modales (inchangées)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "progression" ? parseInt(value) || 0 : value }));
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({ nom: "", cours: "", progression: 0 });
    setShowStudentModal(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setFormData({
      nom: student.nom,
      cours: student.cours,
      progression: student.progression
    });
    setShowStudentModal(true);
  };

  const handleSaveStudent = () => {
    if (!formData.nom.trim() || !formData.cours.trim()) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    if (editingStudent) {
      setUsers(users.map(u => 
        u._id === editingStudent._id || u.id === editingStudent.id
          ? { ...u, nom: formData.nom, cours: formData.cours, progression: formData.progression }
          : u
      ));
    } else {
      setUsers([...users, {
        _id: `temp-${Date.now()}`,
        nom: formData.nom,
        cours: formData.cours,
        progression: formData.progression
      }]);
    }
    setShowStudentModal(false);
  };

  const confirmDelete = (studentId) => {
    setDeleteConfirm(studentId);
  };

  const handleDeleteStudent = () => {
    if (deleteConfirm) {
      setUsers(users.filter(u => u._id !== deleteConfirm && u.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // ← AMÉLIORÉ : Filtre pour vraies données users
 const filteredUsers = (Array.isArray(users) ? users : []).filter(user =>
  (user.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (user.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  ((user.prenom || '') + ' ' + (user.nom || '')).toLowerCase().includes(searchTerm.toLowerCase())
);

  // Loader pendant vérif + chargement
  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modales INCHANGÉES */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmer suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible.
            </p>
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

      {showStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingStudent ? 'Modifier' : 'Ajouter'} un étudiant
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: M. Ait Ali"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cours</label>
                <input
                  type="text"
                  name="cours"
                  value={formData.cours}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: Tajwid Avancé"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Progression (%)</label>
                <input
                  type="number"
                  name="progression"
                  value={formData.progression}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0-100"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveStudent}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
              >
                {editingStudent ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                onClick={() => setShowStudentModal(false)}
                className="flex-1 border border-gray-200 py-2 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER INCHANGÉ */}
      <header className="bg-white shadow-md border-t-4 border-emerald-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <span className="text-gray-400 text-sm">GESTION</span>
            <button 
              onClick={() => setActiveTab("students")}
              className={activeTab === "students" ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600"}
            >
              Étudiants ({filteredUsers.length})
            </button>
            <button 
                            onClick={() => setActiveTab("courses")}
              className={activeTab === "courses" ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600"}
            >
              Cours ({cours.length})
            </button>
            <span className="text-gray-400 text-sm ml-4">PARAMÈTRES</span>
            <button 
              onClick={() => setActiveTab("settings")}
              className={activeTab === "settings" ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600"}
            >
              Paramètres
            </button>
            <button 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-semibold px-3 py-1 rounded transition"
            >
              Déconnexion
            </button>
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
              <span className="text-emerald-600">👑</span>
              <span className="text-sm font-semibold text-gray-700">Admin</span>
            </div>
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

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Barre de recherche AMÉLIORÉE */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Rechercher étudiants, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* ✅ STUDENTS TAB - DONNÉES RÉELLES */}
        {activeTab === "students" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Gestion des Étudiants</h2>
              <button
                onClick={handleAddStudent}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold flex items-center gap-2"
              >
                <span>+</span> Ajouter
              </button>
            </div>

            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">NOM</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">EMAIL</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">RÔLE</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <tr key={user._id || user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {user._id ? user._id.slice(-6) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {user.prenom || ''} {user.nom || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'etudiant' ? 'bg-blue-100 text-blue-800' : 
                            user.role === 'admin' ? 'bg-emerald-100 text-emerald-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role || 'etudiant'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditStudent(user)}
                              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => confirmDelete(user._id || user.id)}
                              className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">👥</span>
                <p className="text-gray-500">
                  {users.length === 0 ? 'Aucun étudiant disponible' : 'Aucun étudiant trouvé'}
                </p>
                {users.length === 0 && (
                  <p className="text-sm text-gray-400 mb-4">Endpoint /users nécessaire</p>
                )}
                <button
                  onClick={handleAddStudent}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  + Ajouter un étudiant
                </button>
              </div>
            )}
          </div>
        )}

        {/* ✅ COURSES TAB - DONNÉES RÉELLES */}
        {activeTab === "courses" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Gestion des Cours</h2>
            
            {cours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cours.map((course) => (
                  <div key={course._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition cursor-pointer group">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 text-lg">{course.titre}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {course.categorie} • {course.niveau}
                    </p>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-emerald-600 font-bold">
                        {course.students?.length || 0} étudiants
                      </span>
                      <span className="text-sm text-gray-500 font-semibold">
                        {course.prix === 0 ? 'Gratuit' : `${course.prix} DT`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📚</span>
                <p className="text-gray-500">Aucun cours trouvé</p>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB - AMÉLIORÉ avec vraies stats */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Paramètres de la plateforme</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Informations générales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nom de la plateforme</label>
                    <input
                      type="text"
                      value="Safoua Academy"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Total utilisateurs</label>
                    <input
                      type="text"
                      value={users.length}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-emerald-50 font-semibold text-emerald-700"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Statistiques globales</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total étudiants</p>
                    <p className="text-2xl font-bold text-emerald-600">{users.length}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Cours actifs</p>
                    <p className="text-2xl font-bold text-emerald-600">{cours.length}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Catégories</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {[...new Set(cours.map(c => c.categorie))].length}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Cours gratuits</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {cours.filter(c => c.prix === 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;