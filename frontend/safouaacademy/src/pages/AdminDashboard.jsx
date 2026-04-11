import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Données statiques des étudiants
  const [students, setStudents] = useState([
    { id: 301, nom: "M. Ait Ali", cours: "Tajwid Avancé", progression: 64 },
    { id: 302, nom: "S. Rahmani", cours: "Arabe Classique", progression: 52 },
    { id: 303, nom: "L. Bernard", cours: "Fiqh & Usul", progression: 41 }
  ]);
  
  // États pour les modales
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    cours: "",
    progression: 0
  });
  const [newId, setNewId] = useState(304);

  // Vérification d'authentification
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };

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
      setStudents(students.map(s => 
        s.id === editingStudent.id 
          ? { ...s, nom: formData.nom, cours: formData.cours, progression: formData.progression }
          : s
      ));
    } else {
      setStudents([...students, {
        id: newId,
        nom: formData.nom,
        cours: formData.cours,
        progression: formData.progression
      }]);
      setNewId(newId + 1);
    }
    setShowStudentModal(false);
  };

  const confirmDelete = (studentId) => {
    setDeleteConfirm(studentId);
  };

  const handleDeleteStudent = () => {
    if (deleteConfirm) {
      setStudents(students.filter(s => s.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const filteredStudents = students.filter(student =>
    student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.cours.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Afficher un loader pendant la vérification
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de confirmation suppression */}
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

      {/* Modal Ajout/Édition Étudiant */}
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

      {/* HEADER avec Sidebar intégrée */}
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
              Étudiants
            </button>
            <button 
              onClick={() => setActiveTab("courses")}
              className={activeTab === "courses" ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600"}
            >
              Cours
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
        
        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Rechercher des étudiants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Students Tab */}
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

            {filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">NOM</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">COURS</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">PROGRESSION</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.nom}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.cours}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-600 rounded-full" 
                                style={{ width: `${student.progression}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{student.progression}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => confirmDelete(student.id)}
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
                <p className="text-gray-500">Aucun étudiant trouvé</p>
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

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Gestion des Cours</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">Tajwid Avancé</h3>
                <p className="text-sm text-gray-600 mt-1">Niveau Expert</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-emerald-600 font-bold">12 étudiants</span>
                  <span className="text-sm text-gray-500">Prog. moy. 64%</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">Arabe Classique</h3>
                <p className="text-sm text-gray-600 mt-1">Niveau Intermédiaire</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-emerald-600 font-bold">8 étudiants</span>
                  <span className="text-sm text-gray-500">Prog. moy. 52%</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">Fiqh & Usul</h3>
                <p className="text-sm text-gray-600 mt-1">Niveau Avancé</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-emerald-600 font-bold">6 étudiants</span>
                  <span className="text-sm text-gray-500">Prog. moy. 41%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
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
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email de contact</label>
                    <input
                      type="email"
                      value="contact@safoua.com"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
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
                    <p className="text-2xl font-bold text-emerald-600">{students.length}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Cours actifs</p>
                    <p className="text-2xl font-bold text-emerald-600">3</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Progression moyenne</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {Math.round(students.reduce((acc, s) => acc + s.progression, 0) / students.length)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Taux complétion</p>
                    <p className="text-2xl font-bold text-emerald-600">52%</p>
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