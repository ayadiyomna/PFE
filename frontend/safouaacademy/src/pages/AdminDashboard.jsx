import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

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

  // Charger les étudiants
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      // Simuler un appel API
      setTimeout(() => {
        setStudents([
          { id: 301, name: "M. Ait Ali", email: "ait.ali@example.com", course: "Tajwid Avancé", progress: 64 },
          { id: 302, name: "S. Rahmani", email: "rahmani@example.com", course: "Arabe Classique", progress: 52 },
          { id: 303, name: "L. Bernard", email: "bernard@example.com", course: "Fiqh & Usul", progress: 41 }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erreur chargement étudiants:", error);
      setLoading(false);
    }
  };

  // Gestionnaire du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "progress" ? parseInt(value) || 0 : value
    }));
  };

  // Ouvrir modal d'ajout
  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      course: "",
      progress: 0
    });
    setShowModal(true);
  };

  // Ouvrir modal de modification
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

  // Sauvegarder (ajout ou modification)
  const handleSaveStudent = async () => {
    if (!formData.name || !formData.course) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      if (editingStudent) {
        // Modification
        const updatedStudents = students.map(s => 
          s.id === editingStudent.id 
            ? { ...s, ...formData }
            : s
        );
        setStudents(updatedStudents);
        console.log("Étudiant modifié:", { id: editingStudent.id, ...formData });
      } else {
        // Ajout
        const newStudent = {
          id: Math.max(...students.map(s => s.id), 0) + 1,
          ...formData
        };
        setStudents([...students, newStudent]);
        console.log("Étudiant ajouté:", newStudent);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    }
  };

  // Supprimer un étudiant
  const handleDeleteStudent = (studentId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
      setStudents(students.filter(student => student.id !== studentId));
      console.log("Étudiant supprimé", studentId);
    }
  };

  // Voir les détails d'un étudiant
  const handleViewStudent = (studentId) => {
    navigate(`/admin/etudiants/${studentId}`);
  };

  // Filtrer les étudiants
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/admin" className="text-emerald-600 font-semibold">
              Dashboard Admin
            </Link>
            <Link to="/admin/etudiants" className="text-gray-600 hover:text-emerald-600">
              Étudiants
            </Link>
            <Link to="/admin/cours" className="text-gray-600 hover:text-emerald-600">
              Cours
            </Link>
            <Link to="/admin/parametres" className="text-gray-600 hover:text-emerald-600">
              Paramètres
            </Link>
          </nav>
          
          <button 
            onClick={() => navigate('/compte')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
          >
            Admin
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1">
        <div className="px-4 sm:px-6 lg:px-10 py-8">
          
          {/* Carte de gestion */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            
            {/* En-tête */}
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">Gestion des Étudiants</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {students.length} étudiants inscrits
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                {/* Recherche */}
                <div className="relative">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="lucide lucide-search w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                  >
                    <path d="m21 21-4.34-4.34"></path>
                    <circle cx="11" cy="11" r="8"></circle>
                  </svg>
                  <input 
                    placeholder="Rechercher…" 
                    className="pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Bouton Ajouter */}
                <button 
                  onClick={handleAddStudent}
                  className="inline-flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition bg-emerald-600 hover:bg-emerald-700"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="lucide lucide-plus w-4 h-4"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                  Ajouter
                </button>
              </div>
            </div>

            {/* Tableau */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wide">ID</th>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wide">Nom</th>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wide">Email</th>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wide">Cours</th>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wide">Progression</th>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50/60">
                            <td className="px-6 py-3 text-gray-800 whitespace-nowrap font-medium">{student.id}</td>
                            <td className="px-6 py-3 text-gray-800 whitespace-nowrap">{student.name}</td>
                            <td className="px-6 py-3 text-gray-800 whitespace-nowrap">{student.email}</td>
                            <td className="px-6 py-3 text-gray-800 whitespace-nowrap">{student.course}</td>
                            <td className="px-6 py-3 text-gray-800 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{student.progress}%</span>
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-600 rounded-full"
                                    style={{ width: `${student.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleViewStudent(student.id)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                                  title="Voir détails"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye text-gray-600">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleEditStudent(student)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                                  title="Modifier"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil text-blue-600">
                                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
                                    <path d="m15 5 4 4"></path>
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                                  title="Supprimer"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 text-red-600">
                                    <path d="M10 11v6"></path>
                                    <path d="M14 11v6"></path>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                    <path d="M3 6h18"></path>
                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            Aucun étudiant trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pied du tableau */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-sm text-gray-600">
                    Affichage de {filteredStudents.length} étudiant{filteredStudents.length > 1 ? 's' : ''} sur {students.length}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal d'ajout/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingStudent ? "Modifier l'étudiant" : "Ajouter un étudiant"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="exemple@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cours</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Sélectionner un cours</option>
                  <option value="Tajwid Avancé">Tajwid Avancé</option>
                  <option value="Arabe Classique">Arabe Classique</option>
                  <option value="Fiqh & Usul">Fiqh & Usul</option>
                  <option value="Histoire Islamique">Histoire Islamique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progression (%)</label>
                <input
                  type="number"
                  name="progress"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveStudent}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
              >
                {editingStudent ? "Modifier" : "Ajouter"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 py-2 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;