import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../services/api";
import coursService from "../services/coursService";

function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    pendingRequests: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userType, setUserType] = useState('student'); // 'student' ou 'teacher'
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    role: "etudiant",
    status: "actif"
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [recentActivities, setRecentActivities] = useState([]);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    loadDashboardData();
    loadRecentActivities();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger tous les utilisateurs
      await loadUsers();
      
      // Charger les cours
      await loadCourses();
      
      // Charger les statistiques
      await loadStats();
      
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      toast.error("❌ Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/utilisateurs');
      const users = response.data.data || response.data;
      
      // Filtrer par rôle
      const studentsList = users.filter(u => u.role === 'etudiant');
      const teachersList = users.filter(u => u.role === 'enseignant');
      
      setStudents(studentsList);
      setTeachers(teachersList);
      
      // Sauvegarder en cache
      localStorage.setItem('cachedStudents', JSON.stringify(studentsList));
      localStorage.setItem('cachedTeachers', JSON.stringify(teachersList));
      
    } catch (error) {
      console.log("Erreur chargement utilisateurs, utilisation du cache");
      
      // Utiliser le cache si disponible
      const cachedStudents = JSON.parse(localStorage.getItem('cachedStudents') || '[]');
      const cachedTeachers = JSON.parse(localStorage.getItem('cachedTeachers') || '[]');
      
      if (cachedStudents.length > 0) setStudents(cachedStudents);
      if (cachedTeachers.length > 0) setTeachers(cachedTeachers);
    }
  };

  const loadCourses = async () => {
    try {
      const result = await coursService.getAllCours();
      if (result.success) {
        setCourses(result.data);
      }
    } catch (error) {
      console.error("Erreur chargement cours:", error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/statistiques');
      setStats(response.data.data || response.data);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
      
      // Calculer les stats manuellement
      const totalStudents = students.length;
      const totalTeachers = teachers.length;
      const totalCourses = courses.length;
      const totalRevenue = courses.reduce((acc, c) => acc + ((c.students || 0) * (c.prix || 0)), 0);
      
      setStats({
        totalStudents,
        totalTeachers,
        totalCourses,
        totalRevenue,
        pendingRequests: 3 // Exemple
      });
    }
  };

  const loadRecentActivities = async () => {
    try {
      const response = await api.get('/admin/activites-recentes');
      setRecentActivities(response.data.data || response.data);
    } catch (error) {
      // Activités simulées
      setRecentActivities([
        { id: 1, type: 'inscription', user: 'Ahmed Benali', date: '2026-03-15', time: 'il y a 5 min' },
        { id: 2, type: 'cours', user: 'Fatima Zahra', action: 'a créé un cours', date: '2026-03-15', time: 'il y a 1h' },
        { id: 3, type: 'paiement', user: 'Mohamed Ali', montant: '89 DT', date: '2026-03-15', time: 'il y a 2h' }
      ]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/', { replace: true });
    toast.success("👋 Déconnexion réussie !");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = (type) => {
    setEditingUser(null);
    setUserType(type);
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      password: "",
      role: type === 'student' ? 'etudiant' : 'enseignant',
      status: "actif"
    });
    setShowModal(true);
  };

  const handleEditUser = (user, type) => {
    setEditingUser(user);
    setUserType(type);
    setFormData({
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      password: "",
      role: user.role,
      status: user.status || "actif"
    });
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.email.trim()) {
      toast.error("⚠️ Tous les champs sont obligatoires !");
      return;
    }

    try {
      if (editingUser) {
        // UPDATE
        await api.put(`/admin/utilisateurs/${editingUser.id}`, formData);
        toast.success("✅ Utilisateur modifié !");
      } else {
        // CREATE
        await api.post('/admin/utilisateurs', formData);
        toast.success("🎉 Nouvel utilisateur ajouté !");
      }
      
      setShowModal(false);
      loadDashboardData(); // Recharger
      
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      
      if (error.offline) {
        // Mode hors-ligne
        const newUser = {
          id: Date.now(),
          ...formData,
          name: `${formData.prenom} ${formData.nom}`,
          createdAt: new Date().toISOString()
        };
        
        if (userType === 'student') {
          setStudents([...students, newUser]);
          localStorage.setItem('cachedStudents', JSON.stringify([...students, newUser]));
        } else {
          setTeachers([...teachers, newUser]);
          localStorage.setItem('cachedTeachers', JSON.stringify([...teachers, newUser]));
        }
        
        toast.success("✅ Utilisateur ajouté en mode hors-ligne");
        setShowModal(false);
      } else {
        toast.error(error.message || "❌ Erreur sauvegarde");
      }
    }
  };

  const confirmDelete = (userId, type) => {
    setDeleteConfirm({ id: userId, type });
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;

    try {
      await api.delete(`/admin/utilisateurs/${deleteConfirm.id}`);
      toast.success("🗑️ Utilisateur supprimé !");
      
      // Mettre à jour la liste
      if (deleteConfirm.type === 'student') {
        setStudents(students.filter(s => s.id !== deleteConfirm.id));
      } else {
        setTeachers(teachers.filter(t => t.id !== deleteConfirm.id));
      }
      
      setDeleteConfirm(null);
      
    } catch (error) {
      if (error.offline) {
        // Mode hors-ligne
        if (deleteConfirm.type === 'student') {
          const updated = students.filter(s => s.id !== deleteConfirm.id);
          setStudents(updated);
          localStorage.setItem('cachedStudents', JSON.stringify(updated));
        } else {
          const updated = teachers.filter(t => t.id !== deleteConfirm.id);
          setTeachers(updated);
          localStorage.setItem('cachedTeachers', JSON.stringify(updated));
        }
        toast.success("🗑️ Utilisateur supprimé en mode hors-ligne");
        setDeleteConfirm(null);
      } else {
        toast.error("❌ Erreur suppression");
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/utilisateurs/${userId}`);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'actif' ? 'inactif' : 'actif';
      await api.patch(`/admin/utilisateurs/${userId}/statut`, { status: newStatus });
      toast.success(`✅ Statut mis à jour`);
      loadDashboardData();
    } catch (error) {
      toast.error("❌ Erreur mise à jour statut");
    }
  };

  const handleApproveTeacher = async (teacherId) => {
    try {
      await api.post(`/admin/enseignants/${teacherId}/approuver`);
      toast.success("✅ Enseignant approuvé");
      loadDashboardData();
    } catch (error) {
      toast.error("❌ Erreur");
    }
  };

  const filteredStudents = students.filter(student =>
    `${student.nom} ${student.prenom} ${student.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter(teacher =>
    `${teacher.nom} ${teacher.prenom} ${teacher.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCourses = courses.filter(course =>
    course.titre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
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
      />

      {/* Modal de confirmation suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmer suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteUser}
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

      {/* Modal Ajout/Édition Utilisateur */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingUser ? 'Modifier' : 'Ajouter'} {userType === 'student' ? 'un étudiant' : 'un enseignant'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Prénom"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="email@exemple.com"
                />
              </div>
              
              {!editingUser && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="••••••••"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveUser}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
              >
                {editingUser ? 'Modifier' : 'Ajouter'}
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

      {/* HEADER */}
      <header className="bg-white shadow-md border-t-4 border-emerald-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`${activeTab === "dashboard" ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab("students")}
              className={`${activeTab === "students" ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              Étudiants
            </button>
            <button 
              onClick={() => setActiveTab("teachers")}
              className={`${activeTab === "teachers" ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              Enseignants
            </button>
            <button 
              onClick={() => setActiveTab("courses")}
              className={`${activeTab === "courses" ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              Cours
            </button>
            <button 
              onClick={() => setActiveTab("settings")}
              className={`${activeTab === "settings" ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-emerald-600'}`}
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
        
        {/* Barre de recherche globale */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Rechercher des utilisateurs ou cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-sm text-gray-500">Total étudiants</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.totalStudents || students.length}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-sm text-gray-500">Total enseignants</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.totalTeachers || teachers.length}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-sm text-gray-500">Cours</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.totalCourses || courses.length}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-sm text-gray-500">Revenus (DT)</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-sm text-gray-500">Demandes en attente</p>
                    <p className="text-3xl font-bold text-amber-600">{stats.pendingRequests}</p>
                  </div>
                </div>

                {/* Graphiques simplifiés */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Répartition des utilisateurs</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-24">Étudiants</span>
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600" 
                            style={{ width: `${(students.length / (students.length + teachers.length)) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{students.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-24">Enseignants</span>
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600" 
                            style={{ width: `${(teachers.length / (students.length + teachers.length)) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{teachers.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Activités récentes</h3>
                    <div className="space-y-3">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 text-sm p-2 hover:bg-gray-50 rounded-lg">
                          <span className={`w-2 h-2 rounded-full ${
                            activity.type === 'inscription' ? 'bg-green-500' :
                            activity.type === 'cours' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}></span>
                          <span className="text-gray-600">
                            {activity.user} {activity.action || `s'est inscrit`}
                          </span>
                          <span className="text-gray-400 text-xs ml-auto">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Gestion des étudiants</h2>
                  <button
                    onClick={() => handleAddUser('student')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold flex items-center gap-2"
                  >
                    <span>+</span> Ajouter un étudiant
                  </button>
                </div>

                {filteredStudents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nom</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Cours</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Progression</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Statut</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">
                                {student.prenom} {student.nom}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {student.coursCount || student.enrolledCourses?.length || 0}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-600" 
                                    style={{ width: `${student.progress || Math.floor(Math.random() * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{student.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                student.status === 'actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {student.status || 'actif'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewUser(student.id)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Voir"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() => handleEditUser(student, 'student')}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Modifier"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(student.id, student.status)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title={student.status === 'actif' ? 'Désactiver' : 'Activer'}
                                >
                                  {student.status === 'actif' ? '🔒' : '🔓'}
                                </button>
                                <button
                                  onClick={() => confirmDelete(student.id, 'student')}
                                  className="p-1 hover:bg-red-100 rounded text-red-600"
                                  title="Supprimer"
                                >
                                  🗑️
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
                  </div>
                )}
              </div>
            )}

            {/* Teachers Tab */}
            {activeTab === "teachers" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Gestion des enseignants</h2>
                  <button
                    onClick={() => handleAddUser('teacher')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold flex items-center gap-2"
                  >
                    <span>+</span> Ajouter un enseignant
                  </button>
                </div>

                {filteredTeachers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nom</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Cours créés</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Étudiants</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Statut</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredTeachers.map((teacher) => (
                          <tr key={teacher.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">
                                {teacher.prenom} {teacher.nom}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{teacher.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {teacher.coursesCount || teacher.createdCourses?.length || 0}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {teacher.totalStudents || 0}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                teacher.status === 'actif' ? 'bg-green-100 text-green-700' : 
                                teacher.status === 'en_attente' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {teacher.status || 'actif'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewUser(teacher.id)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Voir"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() => handleEditUser(teacher, 'teacher')}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Modifier"
                                >
                                  ✏️
                                </button>
                                {teacher.status === 'en_attente' && (
                                  <button
                                    onClick={() => handleApproveTeacher(teacher.id)}
                                    className="p-1 hover:bg-green-100 rounded text-green-600"
                                    title="Approuver"
                                  >
                                    ✓
                                  </button>
                                )}
                                <button
                                  onClick={() => confirmDelete(teacher.id, 'teacher')}
                                  className="p-1 hover:bg-red-100 rounded text-red-600"
                                  title="Supprimer"
                                >
                                  🗑️
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
                    <span className="text-6xl mb-4 block">👨‍🏫</span>
                    <p className="text-gray-500">Aucun enseignant trouvé</p>
                  </div>
                )}
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === "courses" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Gestion des cours</h2>
                
                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                        <img 
                          src={course.image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop"} 
                          alt={course.titre}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{course.titre}</h3>
                          <p className="text-sm text-gray-600 mb-2">Par {course.instructor}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-emerald-600 font-bold">{course.prix} DT</span>
                            <span className="text-gray-500">👥 {course.students || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              course.status === 'Publié' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {course.status || 'Brouillon'}
                            </span>
                            <button
                              onClick={() => navigate(`/cours/${course.id}`)}
                              className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold ml-auto"
                            >
                              Voir →
                            </button>
                          </div>
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
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email de contact</label>
                        <input
                          type="email"
                          value="admin@safoua.com"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Statistiques globales</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Utilisateurs totaux</p>
                        <p className="text-2xl font-bold text-emerald-600">{students.length + teachers.length}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Cours publiés</p>
                        <p className="text-2xl font-bold text-emerald-600">{courses.filter(c => c.status === 'Publié').length}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Taux de complétion</p>
                        <p className="text-2xl font-bold text-emerald-600">78%</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Revenus mensuels</p>
                        <p className="text-2xl font-bold text-emerald-600">12,450 DT</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;