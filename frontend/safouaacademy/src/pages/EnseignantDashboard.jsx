import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import api from "../services/api";
import coursService from "../services/coursService";
import authService from "../services/authService";

function EnseignantDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("cours");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    averageProgress: 0,
    revenue: 0,
    pendingReviews: 0
  });
  const [deleteModal, setDeleteModal] = useState(null);
  const [user, setUser] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactResult, setContactResult] = useState(null);
  const [selectedCourseIdForStats, setSelectedCourseIdForStats] = useState(null);
  const [studentsData, setStudentsData] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);
  const [accountFormData, setAccountFormData] = useState({ nom: "", prenom: "", email: "" });
  const [passwordFormData, setPasswordFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [accountMessage, setAccountMessage] = useState(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const userData = authService.getCurrentUser();
    if (userData) {
      setUser(userData);
      setAccountFormData({
        nom: userData.nom || "",
        prenom: userData.prenom || "",
        email: userData.email || ""
      });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadTeacherData();
    }
  }, [user]);

  const handleLogout = () => {
    authService.logout();
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 500);
  };

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTeacherCourses(),
        loadTeacherStats(),
        loadRecentActivities(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherCourses = async () => {
    try {
      const response = await api.get("/cours/enseignant/mes-cours");
      const coursesData = response.data.data || response.data;
      setCourses(coursesData);
    } catch (error) {
      console.error("Erreur chargement cours enseignant:", error);
    }
  };

  const loadTeacherStats = async () => {
    try {
      const response = await api.get("/stats/enseignant");
      setStats(response.data.data);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const response = await api.get("/stats/activites");
      setRecentActivities(response.data.data || []);
    } catch (error) {
      console.error("Erreur chargement activités:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    }
  };

  const handleCreateCourse = () => {
    navigate("/enseignant/creer-cours");
  };

  const handleEditCourse = (courseId) => {
    navigate(`/enseignant/modifier-cours/${courseId}`);
  };

  const handleViewStats = (courseId) => {
    setSelectedCourseIdForStats(courseId);
    setActiveTab("analytiques");
  };

  const handleViewCourse = (courseId) => {
    navigate(`/cours/${courseId}`);
  };

  const handleDeleteCourse = (courseId) => {
    setDeleteModal(courseId);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;

    try {
      const result = await coursService.deleteCours(deleteModal);
      if (result.success) {
        setCourses(courses.filter((c) => c._id !== deleteModal));
        setDeleteModal(null);
        loadTeacherStats();
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleDuplicateCourse = async (course) => {
    try {
      const newCourse = {
        titre: `${course.titre} (copie)`,
        description: course.description,
        categorie: course.categorie,
        niveau: course.niveau,
        prix: course.prix,
        modules: course.modules || [],
        status: "Brouillon"
      };

      await coursService.createCours(newCourse);
      loadTeacherCourses();
    } catch (error) {
      console.error("Erreur duplication:", error);
    }
  };

  const handlePublishCourse = async (courseId) => {
    try {
      await api.patch(`/cours/${courseId}`, { status: "Publié" });
      setCourses(courses.map((c) => (c._id === courseId ? { ...c, status: "Publié" } : c)));
    } catch (error) {
      console.error("Erreur publication:", error);
    }
  };

  const handleArchiveCourse = async (courseId) => {
    try {
      await api.patch(`/cours/${courseId}`, { status: "Archivé" });
      setCourses(courses.map((c) => (c._id === courseId ? { ...c, status: "Archivé" } : c)));
    } catch (error) {
      console.error("Erreur archivage:", error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map((n) => (n._id === notificationId ? { ...n, read: true } : n)));
    } catch (error) {
      console.error("Erreur marquage notification:", error);
    }
  };

  const loadCourseStudents = async (courseId) => {
    try {
      setLoadingStudents(true);
      const response = await api.get(`/cours/enseignant/${courseId}/etudiants`);
      if (response.data.success) {
        setStudentsData(response.data.data);
        setSelectedCourseForStudents(courseId);
      } else {
        console.error("Erreur chargement étudiants:", response.data);
        alert("Erreur: " + (response.data.message || "Impossible de charger les étudiants"));
      }
    } catch (error) {
      console.error("Erreur chargement étudiants:", error);
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      alert("Erreur: " + (error.response?.data?.message || error.message || "Erreur serveur"));
      setStudentsData(null);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleExportStudentsCSV = () => {
    if (!studentsData || !studentsData.etudiants) return;

    const headers = ['Nom', 'Prénom', 'Email', 'Date d\'inscription', 'Progression (%)', 'Leçons complétées', 'Note'];
    const rows = studentsData.etudiants.map(student => [
      student.nom,
      student.prenom,
      student.email,
      new Date(student.dateInscription).toLocaleDateString('fr-FR'),
      student.progression,
      student.leçonsCompletées,
      student.note
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `etudiants_${studentsData.coursTitre}_${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAccountInputChange = (e) => {
    const { name, value } = e.target;
    setAccountFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setAccountMessage(null);

    if (!accountFormData.nom.trim() || !accountFormData.prenom.trim() || !accountFormData.email.trim()) {
      setAccountMessage({ type: 'error', text: 'Nom, prénom et email sont requis.' });
      return;
    }

    try {
      setAccountLoading(true);
      const response = await api.put('/users/profile', {
        nom: accountFormData.nom,
        prenom: accountFormData.prenom,
        email: accountFormData.email
      });

      if (response.data.success) {
        setUser(response.data.data);
        authService.setSession({ token: localStorage.getItem('token'), user: response.data.data });
        setAccountFormData({
          nom: response.data.data.nom || '',
          prenom: response.data.data.prenom || '',
          email: response.data.data.email || ''
        });
        setAccountMessage({ type: 'success', text: response.data.message || 'Profil mis à jour avec succès.' });
      }
    } catch (error) {
      console.error('Erreur mise à jour compte:', error);
      setAccountMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Impossible de mettre à jour le profil.' });
    } finally {
      setAccountLoading(false);
      setTimeout(() => setAccountMessage(null), 4000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setAccountMessage(null);

    if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      setAccountMessage({ type: 'error', text: 'Tous les champs du mot de passe sont requis.' });
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      setAccountMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setAccountMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await api.put('/users/profile', {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      });

      if (response.data.success) {
        setAccountMessage({ type: 'success', text: response.data.message || 'Mot de passe modifié avec succès.' });
        setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      setAccountMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Impossible de changer le mot de passe.' });
    } finally {
      setPasswordLoading(false);
      setTimeout(() => setAccountMessage(null), 4000);
    }
  };

  const handleUploadProfileImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAccountMessage({ type: 'error', text: 'Veuillez sélectionner une image valide.' });
      return;
    }

    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const updatedProfile = response.data.data.profile || response.data.data;
        setUser(updatedProfile);
        authService.setSession({ token: localStorage.getItem('token'), user: updatedProfile });
        setAccountMessage({ type: 'success', text: response.data.message || 'Photo de profil mise à jour.' });
      }
    } catch (error) {
      console.error('Erreur upload image profile:', error);
      setAccountMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Erreur upload image.' });
    } finally {
      setImageUploading(false);
      setTimeout(() => setAccountMessage(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold">
                Supprimer
              </button>
              <button onClick={() => setDeleteModal(null)} className="flex-1 border border-gray-200 py-2 rounded-lg hover:bg-gray-50 transition font-semibold">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-md border-t-4 border-emerald-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>

          <nav className="hidden md:flex space-x-8 items-center">
            <button onClick={() => setActiveTab("cours")} className={`${activeTab === "cours" ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600"}`}>Mes cours</button>
            <button onClick={() => setActiveTab("analytiques")} className={`${activeTab === "analytiques" ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600"}`}>Analytiques</button>
            <button onClick={() => setActiveTab("etudiants")} className={`${activeTab === "etudiants" ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600"}`}>Étudiants</button>
            <button onClick={() => setActiveTab("parametres")} className={`${activeTab === "parametres" ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600"}`}>Paramètres</button>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-semibold px-3 py-1 rounded transition">Déconnexion</button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <span className="text-xl">🔔</span>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
              <span className="text-emerald-600">👨‍🏫</span>
              <span className="text-sm font-semibold text-gray-700">
                {user?.prenom || user?.name || "Enseignant"}
              </span>
            </div>

            <button onClick={() => setActiveTab("parametres")} className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold">
              Mon compte
            </button>

            <button onClick={handleLogout} className="md:hidden p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Déconnexion">
              🚪
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour, {user?.prenom || user?.name || "Enseignant"} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>
          {/* Le bouton "+ Créer un cours" a été retiré pour les enseignants; création gérée via l'administration */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Total étudiants</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.totalStudents.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Cours actifs</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.totalCourses}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Progression moyenne</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.averageProgress}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Revenus (DT)</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="text-sm text-gray-500">Avis en attente</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pendingReviews}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {activeTab === "analytiques" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Analytiques des cours</h2>
                {selectedCourseIdForStats ? (
                  <div className="space-y-6">
                    {courses.find((c) => c._id === selectedCourseIdForStats) && (
                      <>
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {courses.find((c) => c._id === selectedCourseIdForStats)?.titre}
                          </h3>
                          <button
                            onClick={() => setSelectedCourseIdForStats(null)}
                            className="mt-2 text-sm text-emerald-600 hover:underline"
                          >
                            ← Voir tous les cours
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                            <p className="text-sm text-gray-600">Étudiants inscrits</p>
                            <p className="text-3xl font-bold text-emerald-600 mt-2">
                              {courses.find((c) => c._id === selectedCourseIdForStats)?.students?.length || 0}
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-gray-600">Progression moyenne</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">
                              {courses.find((c) => c._id === selectedCourseIdForStats)?.progress || 0}%
                            </p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                            <p className="text-sm text-gray-600">Évaluation</p>
                            <p className="text-3xl font-bold text-amber-600 mt-2">
                              {courses.find((c) => c._id === selectedCourseIdForStats)?.rating || "N/A"}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <p className="text-sm text-gray-600">Prix (DT)</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">
                              {courses.find((c) => c._id === selectedCourseIdForStats)?.prix || 0}
                            </p>
                          </div>
                        </div>
                        <div className="mt-6 bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Statistiques détaillées</h4>
                          <div className="space-y-2 text-sm text-gray-700">
                            <p><span className="font-semibold">Statut:</span> {courses.find((c) => c._id === selectedCourseIdForStats)?.status || "Brouillon"}</p>
                            <p><span className="font-semibold">Catégorie:</span> {courses.find((c) => c._id === selectedCourseIdForStats)?.categorie || "Non spécifiée"}</p>
                            <p><span className="font-semibold">Niveau:</span> {courses.find((c) => c._id === selectedCourseIdForStats)?.niveau || "Non spécifié"}</p>
                            <p><span className="font-semibold">Modules:</span> {courses.find((c) => c._id === selectedCourseIdForStats)?.modules?.length || 0}</p>
                            <p><span className="font-semibold">Date de création:</span> {new Date(courses.find((c) => c._id === selectedCourseIdForStats)?.createdAt).toLocaleDateString("fr-FR")}</p>
                            <p><span className="font-semibold">Dernière mise à jour:</span> {new Date(courses.find((c) => c._id === selectedCourseIdForStats)?.updatedAt).toLocaleDateString("fr-FR")}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <span className="text-6xl mb-4 block">📊</span>
                    <p className="text-gray-500 mb-4">Sélectionnez un cours pour voir ses statistiques</p>
                    <p className="text-sm text-gray-400">Cliquez sur le bouton 📊 à côté d'un cours pour afficher ses analytiques</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "cours" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mes cours</h2>
                {courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 cursor-pointer hover:text-emerald-600" onClick={() => handleEditCourse(course._id)}>
                                {course.titre}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                course.status === "Publié" ? "bg-green-100 text-green-700" :
                                course.status === "Archivé" ? "bg-gray-100 text-gray-700" :
                                "bg-yellow-100 text-yellow-700"
                              }`}>
                                {course.status || "Brouillon"}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1"><span>👥</span> {course.students?.length || 0} étudiants</span>
                              <span className="flex items-center gap-1"><span>📊</span> Progression: {course.progress || 0}%</span>
                              <span className="flex items-center gap-1"><span>📅</span> Mis à jour: {new Date(course.updatedAt || course.createdAt).toLocaleDateString("fr-FR")}</span>
                              <span className="flex items-center gap-1"><span>⭐</span> {course.rating || "Nouveau"}</span>
                              <span className="flex items-center gap-1"><span>💰</span> {course.prix} DT</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button onClick={() => handleViewStats(course._id)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition" title="Statistiques">📊</button>
                            <button onClick={() => handleEditCourse(course._id)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition" title="Modifier">✏️</button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${course.progress || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                      <span className="text-6xl mb-4 block">📚</span>
                      <p className="text-gray-500 mb-4">Vous n'avez pas encore de cours</p>
                      <p className="text-sm text-slate-600 mb-3">La création de cours est gérée par l'administration. Si vous souhaitez créer un cours, contactez l'administrateur.</p>
                      <button onClick={() => { setShowContactModal(true); setContactResult(null); }} className="text-emerald-600 font-semibold hover:underline">Contacter l'administrateur</button>
                    </div>
                    {showContactModal && (
                      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                          <h3 className="text-lg font-bold text-slate-900 mb-3">Demande à l'administrateur</h3>
                          <p className="text-sm text-slate-500 mb-4">Remplissez le formulaire pour demander la création d'un cours ou toute autre aide.</p>
                          {contactResult && (
                            <div className={`mb-3 p-3 rounded ${contactResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{contactResult.message}</div>
                          )}
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-semibold text-slate-700">Sujet</label>
                              <input value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} placeholder="Sujet (ex: Demande création cours)" className="w-full px-3 py-2 mt-1 border rounded" />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-slate-700">Message *</label>
                              <textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} rows={6} placeholder="Décrivez votre demande" className="w-full px-3 py-2 mt-1 border rounded" />
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4">
                            <button disabled={contactLoading} onClick={async () => {
                              if (!contactMessage.trim()) { setContactResult({ success: false, message: 'Le message est requis' }); return; }
                              try {
                                setContactLoading(true);
                                const payload = { subject: contactSubject, message: contactMessage };
                                const res = await api.post('/notifications/contact', payload);
                                setContactResult({ success: true, message: res.data?.message || 'Demande envoyée' });
                                setContactSubject(''); setContactMessage('');
                                setTimeout(() => setShowContactModal(false), 1200);
                              } catch (err) {
                                setContactResult({ success: false, message: err.response?.data?.message || err.message || 'Erreur envoi' });
                              } finally { setContactLoading(false); }
                            }} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50">{contactLoading ? 'Envoi...' : 'Envoyer la demande'}</button>
                            <button disabled={contactLoading} onClick={() => setShowContactModal(false)} className="flex-1 border border-slate-200 py-2 rounded-xl font-semibold hover:bg-slate-50">Annuler</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "etudiants" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Étudiants inscrits</h2>
                {courses.length > 0 ? (
                  <div className="space-y-6">
                    {selectedCourseForStudents ? (
                      <div>
                        <div className="mb-6 pb-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900">{studentsData?.coursTitre}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {studentsData?.nombreEtudiants} étudiant{studentsData?.nombreEtudiants > 1 ? 's' : ''} inscrit{studentsData?.nombreEtudiants > 1 ? 's' : ''}
                          </p>
                          <button
                            onClick={() => setSelectedCourseForStudents(null)}
                            className="mt-3 text-sm text-emerald-600 hover:underline font-semibold"
                          >
                            ← Voir tous les cours
                          </button>
                        </div>

                        {loadingStudents ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
                          </div>
                        ) : studentsData?.etudiants && studentsData.etudiants.length > 0 ? (
                          <div>
                            <div className="mb-4 flex justify-end">
                              <button
                                onClick={handleExportStudentsCSV}
                                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm"
                              >
                                📥 Exporter en CSV
                              </button>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date inscription</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Progression</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Leçons</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Note</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {studentsData.etudiants.map((student, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                      <td className="py-3 px-4">
                                        <span className="font-medium text-gray-900">
                                          {student.prenom} {student.nom}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-gray-600">{student.email}</td>
                                      <td className="py-3 px-4 text-gray-600">
                                        {new Date(student.dateInscription).toLocaleDateString("fr-FR")}
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2 justify-center">
                                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                              className="h-full bg-emerald-600 rounded-full transition-all"
                                              style={{ width: `${student.progression}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-xs font-semibold text-gray-700 w-10">
                                            {student.progression}%
                                          </span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                                          {student.leçonsCompletées}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <span className="inline-block text-xs font-semibold">
                                          {student.note ? `${student.note.toFixed(1)}/20` : 'N/A'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-6">Aucun étudiant inscrit à ce cours</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {courses.map((course) => (
                          <div key={course._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900">{course.titre}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {course.students?.length || 0} étudiant{(course.students?.length || 0) > 1 ? 's' : ''} inscrit{(course.students?.length || 0) > 1 ? 's' : ''}
                                </p>
                              </div>
                              <button
                                onClick={() => loadCourseStudents(course._id)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm"
                              >
                                Voir les détails →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <span className="text-6xl mb-4 block">👥</span>
                    <p className="text-gray-500">Vous n'avez pas de cours avec des étudiants</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "parametres" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Paramètres du compte</h2>

                {accountMessage && (
                  <div className={`mb-4 p-3 rounded ${accountMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                    {accountMessage.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                      {user?.image ? (
                        <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.image}`} alt="Profil" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">👤</span>
                      )}
                    </div>

                    <div className="w-full text-center">
                      <input id="enseignant-profile-image" type="file" accept="image/*" onChange={handleUploadProfileImage} className="hidden" />
                      <label htmlFor="enseignant-profile-image" className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${imageUploading ? 'bg-gray-200 text-gray-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                        {imageUploading ? 'Téléversement...' : 'Changer la photo'}
                      </label>
                      <p className="text-xs text-gray-500 mt-3">Format: JPG/PNG/GIF — Max 5MB</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                      <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
                      <form onSubmit={handleUpdateAccount} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Nom</label>
                            <input name="nom" value={accountFormData.nom} onChange={handleAccountInputChange} className="w-full px-3 py-2 border rounded" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Prénom</label>
                            <input name="prenom" value={accountFormData.prenom} onChange={handleAccountInputChange} className="w-full px-3 py-2 border rounded" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Email</label>
                          <input name="email" value={accountFormData.email} onChange={handleAccountInputChange} className="w-full px-3 py-2 border rounded" />
                        </div>

                        <div className="flex gap-3">
                          <button disabled={accountLoading} type="submit" className={`px-4 py-2 rounded-lg font-semibold ${accountLoading ? 'bg-gray-200 text-gray-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                            {accountLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-100 mt-6">
                      <h3 className="text-lg font-semibold mb-4">Sécurité — changer le mot de passe</h3>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Mot de passe actuel</label>
                          <input name="currentPassword" type="password" value={passwordFormData.currentPassword} onChange={handlePasswordInputChange} className="w-full px-3 py-2 border rounded" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Nouveau mot de passe</label>
                            <input name="newPassword" type="password" value={passwordFormData.newPassword} onChange={handlePasswordInputChange} className="w-full px-3 py-2 border rounded" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Confirmer le mot de passe</label>
                            <input name="confirmPassword" type="password" value={passwordFormData.confirmPassword} onChange={handlePasswordInputChange} className="w-full px-3 py-2 border rounded" />
                          </div>
                        </div>

                        <div>
                          <button disabled={passwordLoading} type="submit" className={`px-4 py-2 rounded-lg font-semibold ${passwordLoading ? 'bg-gray-200 text-gray-700' : 'bg-amber-600 text-white hover:bg-amber-700'}`}>
                            {passwordLoading ? 'Mise à jour...' : 'Modifier le mot de passe'}
                          </button>
                        </div>
                      </form>
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

export default EnseignantDashboard;