import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import coursService from "../services/coursService";
import authService from "../services/authService";

// Constantes pour les valeurs enum (doit correspondre au backend)
const VALID_NIVEAUX = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];
const VALID_STATUS = ['Brouillon', 'Publié', 'Archivé'];

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState([]);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [courseForm, setCourseForm] = useState({
    titre: "",
    description: "",
    categorie: "",
    niveau: "",
    prix: "",
    instructeur: "",
    status: "Brouillon"
  });
  const [formData, setFormData] = useState({ 
    nom: "", 
    prenom: "",
    email: "", 
    role: "etudiant",
    password: ""
  });
  const [operationLoading, setOperationLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await api.get("/users");
      if (result?.data?.data) setUsers(result.data.data);
      else if (result?.data) setUsers(result.data);
      else setUsers([]);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des utilisateurs:", error.response?.data || error.message);
      showMessage(
        error.response?.data?.message || 
        error.message || 
        "Erreur lors du chargement des utilisateurs",
        true
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 4000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  const loadCourses = async () => {
    try {
      const result = await coursService.getAllCours();
      if (result.success) setCours(result.data);
      else setCours([]);
    } catch (error) {
      setCours([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token) {
      navigate("/login");
      return;
    }
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("👤 Current user:", user); // Debug log
        if (user?.role === "admin" || user?.role === "administrateur") {
          setIsAuthorized(true);
          loadUsers();
          loadCourses();
        } else {
          console.error("❌ User role not admin:", user?.role);
          navigate("/");
        }
      } catch (e) {
        console.error("❌ Error parsing user:", e);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseFormChange = (e) => {
    const { name, value } = e.target;
    setCourseForm((prev) => ({
      ...prev,
      [name]: name === "prix" ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({ nom: "", prenom: "", email: "", role: "etudiant", password: "" });
    setErrorMessage("");
    setShowStudentModal(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setFormData({
      nom: student.nom || "",
      prenom: student.prenom || "",
      email: student.email || "",
      role: student.role || "etudiant",
      password: ""
    });
    setErrorMessage("");
    setShowStudentModal(true);
  };

  const handleSaveStudent = async () => {
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.email.trim()) {
      showMessage("Veuillez remplir tous les champs requis", true);
      return;
    }

    setOperationLoading(true);
    try {
      if (editingStudent) {
        // Update user
        const updateData = {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          role: formData.role
        };
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        
        const result = await api.put(`/users/${editingStudent._id}`, updateData);
        if (result?.data?.success) {
          await loadUsers();
          setShowStudentModal(false);
          showMessage("Utilisateur modifié avec succès!");
        } else {
          showMessage("Erreur lors de la modification", true);
        }
      } else {
        // Create new user
        if (!formData.password.trim()) {
          showMessage("Le mot de passe est requis pour un nouvel utilisateur", true);
          setOperationLoading(false);
          return;
        }

        const result = await api.post("/users", {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          role: formData.role,
          password: formData.password
        });

        if (result?.data?.success) {
          await loadUsers();
          setShowStudentModal(false);
          showMessage("Utilisateur créé avec succès!");
        } else {
          showMessage(result?.data?.message || "Erreur lors de la création", true);
        }
      }
    } catch (error) {
      showMessage(error?.response?.data?.message || "Erreur serveur", true);
    } finally {
      setOperationLoading(false);
    }
  };

  const confirmDelete = (studentId) => {
    setDeleteConfirm(studentId);
    setErrorMessage("");
  };

  const handleDeleteStudent = async () => {
    if (deleteConfirm) {
      setOperationLoading(true);
      try {
        const result = await api.delete(`/users/${deleteConfirm}`);
        if (result?.data?.success) {
          await loadUsers();
          setDeleteConfirm(null);
          showMessage("Utilisateur supprimé avec succès!");
        } else {
          showMessage("Erreur lors de la suppression", true);
        }
      } catch (error) {
        showMessage(error?.response?.data?.message || "Erreur serveur", true);
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const cancelDelete = () => setDeleteConfirm(null);

  const handleCreateCourse = async () => {
    try {
      // Validation des champs requis
      if (!courseForm.titre.trim()) {
        showMessage("Le titre du cours est requis", true);
        return;
      }
      if (!courseForm.description.trim()) {
        showMessage("La description du cours est requise", true);
        return;
      }
      if (!courseForm.categorie.trim()) {
        showMessage("La catégorie du cours est requise", true);
        return;
      }
      if (!courseForm.niveau.trim()) {
        showMessage("Le niveau du cours est requis", true);
        return;
      }
      // Validation de l'enum niveau
      if (!VALID_NIVEAUX.includes(courseForm.niveau)) {
        showMessage(`Le niveau "${courseForm.niveau}" n'est pas valide. Valeurs acceptées: ${VALID_NIVEAUX.join(', ')}`, true);
        return;
      }
      if (!courseForm.prix && courseForm.prix !== 0) {
        showMessage("Le prix du cours est requis", true);
        return;
      }
      if (parseFloat(courseForm.prix) < 0) {
        showMessage("Le prix ne peut pas être négatif", true);
        return;
      }
      if (!courseForm.instructeur) {
        showMessage("Un enseignant doit être assigné au cours", true);
        return;
      }

      setOperationLoading(true);

      const payload = {
        titre: courseForm.titre.trim(),
        description: courseForm.description.trim(),
        categorie: courseForm.categorie.trim(),
        niveau: courseForm.niveau.trim(), // This will be one of the valid enum values
        prix: parseFloat(courseForm.prix) || 0,
        instructeur: courseForm.instructeur,
        status: courseForm.status || "Brouillon",
        students: []
      };

      console.log('📋 Payload envoyé:', payload);

      const result = await coursService.createCours(payload);
      if (result.success) {
        showMessage("Espace de cours créé avec succès!", false);
        
        // Réinitialiser le formulaire
        setCourseForm({
          titre: "",
          description: "",
          categorie: "",
          niveau: "",
          prix: "",
          instructeur: "",
          status: "Brouillon"
        });
        
        // Recharger les cours
        await loadCourses();
      } else {
        showMessage(result.message || "Erreur lors de la création du cours", true);
      }
    } catch (error) {
      console.error("Erreur lors de la création du cours:", error);
      showMessage(
        error?.response?.data?.message || 
        error.message || 
        "Erreur lors de la création du cours",
        true
      );
    } finally {
      setOperationLoading(false);
    }
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter((user) =>
    (user.nom || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.prenom || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((user.prenom || "") + " " + (user.nom || "")).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dashboardStats = {
    totalUsers: users.length,
    students: users.filter((u) => u.role === "etudiant").length,
    teachers: users.filter((u) => u.role === "enseignant" || u.role === "teacher").length,
    admins: users.filter((u) => u.role === "admin" || u.role === "administrateur").length,
    courses: cours.length,
    freeCourses: cours.filter((c) => c.prix === 0).length,
    paidCourses: cours.filter((c) => c.prix > 0).length,
    categories: [...new Set(cours.map((c) => c.categorie).filter(Boolean))].length
  };

  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f8f5] flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        <p className="text-slate-600">Vérification des permissions...</p>
        {errorMessage && <p className="text-red-600 text-sm max-w-md text-center">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8f5] text-slate-800 flex">
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-in">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-in">
          {successMessage}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Confirmer suppression</h3>
            <p className="text-slate-600 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={handleDeleteStudent} disabled={operationLoading} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">{operationLoading ? "Suppression..." : "Supprimer"}</button>
              <button onClick={cancelDelete} disabled={operationLoading} className="flex-1 border border-slate-200 py-2.5 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-50">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {showStudentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-5">{editingStudent ? "Modifier" : "Ajouter"} un utilisateur</h3>
            {errorMessage && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">{errorMessage}</div>}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Prénom</label>
                  <input name="prenom" value={formData.prenom} onChange={handleInputChange} placeholder="Prénom" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nom</label>
                  <input name="nom" value={formData.nom} onChange={handleInputChange} placeholder="Nom" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Rôle</label>
                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="etudiant">Étudiant</option>
                  <option value="enseignant">Enseignant</option>
                  <option value="administrateur">Administrateur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mot de passe {editingStudent ? "(laisser vide pour ne pas modifier)" : "(requis)"}</label>
                <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Mot de passe" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveStudent} disabled={operationLoading} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">{operationLoading ? "Enregistrement..." : (editingStudent ? "Modifier" : "Ajouter")}</button>
              <button onClick={() => setShowStudentModal(false)} disabled={operationLoading} className="flex-1 border border-slate-200 py-2.5 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-50">Annuler</button>
            </div>
          </div>
        </div>
      )}

      <aside className="w-72 bg-white border-r border-emerald-100 hidden lg:flex flex-col shadow-sm">
        <div className="px-6 py-6 border-b border-emerald-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black">S</div>
          <div>
            <h1 className="font-black text-xl text-emerald-700">Safoua Academy</h1>
            <p className="text-xs text-slate-500">Admin Panel</p>
          </div>
        </div>
        <nav className="p-4 space-y-2 text-sm font-medium">
          {[
            ["dashboard", "Dashboard"],
            ["users", "Utilisateurs"],
            ["students", "Étudiants"],
            ["teachers", "Enseignants"],
            ["courses", "Cours"],
            ["create-espace", "Créer Espace"]
          ].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`w-full text-left px-4 py-3 rounded-xl transition ${activeTab === key ? "bg-emerald-600 text-white shadow" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"}`}>{label}</button>
          ))}
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition">Déconnexion</button>
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white/90 backdrop-blur border-b border-emerald-100 sticky top-0 z-40">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Welcome back,</p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard Administration</h2>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleLogout} className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Déconnexion</button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="relative max-w-xl">
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher un utilisateur, étudiant, enseignant..." className="w-full bg-white border border-emerald-100 rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
            <span className="absolute left-4 top-3.5 text-slate-400">🔎</span>
          </div>

          {activeTab === "dashboard" && (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  ["Utilisateurs", dashboardStats.totalUsers, "bg-emerald-600"],
                  ["Étudiants", dashboardStats.students, "bg-emerald-500"],
                  ["Enseignants", dashboardStats.teachers, "bg-emerald-700"],
                  ["Cours", dashboardStats.courses, "bg-emerald-400"]
                ].map(([label, value, color]) => (
                  <div key={label} className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
                    <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center mb-4`}>●</div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
                  </div>
                ))}
              </section>

              <section className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
                <h3 className="text-lg font-bold text-slate-900 mb-5">Créer un espace de cours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="titre" value={courseForm.titre} onChange={handleCourseFormChange} placeholder="Titre du cours" className="px-4 py-3 border border-slate-200 rounded-xl" />
                  <input name="categorie" value={courseForm.categorie} onChange={handleCourseFormChange} placeholder="Catégorie" className="px-4 py-3 border border-slate-200 rounded-xl" />
                  <select name="niveau" value={courseForm.niveau} onChange={handleCourseFormChange} className="px-4 py-3 border border-slate-200 rounded-xl">
                    <option value="">-- Niveau --</option>
                    {VALID_NIVEAUX.map((niveau) => (
                      <option key={niveau} value={niveau}>{niveau}</option>
                    ))}
                  </select>
                  <input name="prix" type="number" value={courseForm.prix} onChange={handleCourseFormChange} placeholder="Prix" className="px-4 py-3 border border-slate-200 rounded-xl" />
                  <select name="instructeur" value={courseForm.instructeur} onChange={handleCourseFormChange} className="px-4 py-3 border border-slate-200 rounded-xl">
                    <option value="">Choisir un enseignant</option>
                    {users.filter((u) => u.role === "enseignant" || u.role === "teacher").map((u) => (
                      <option key={u._id || u.id} value={u._id || u.id}>{u.prenom} {u.nom}</option>
                    ))}
                  </select>
                  <select name="status" value={courseForm.status} onChange={handleCourseFormChange} className="px-4 py-3 border border-slate-200 rounded-xl">
                    {VALID_STATUS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <textarea name="description" value={courseForm.description} onChange={handleCourseFormChange} placeholder="Description" className="md:col-span-2 px-4 py-3 border border-slate-200 rounded-xl min-h-[120px]"></textarea>
                </div>
                <div className="mt-4">
                  <button onClick={handleCreateCourse} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700">
                    Créer l’espace
                  </button>
                </div>
              </section>
            </>
          )}

          {activeTab === "users" && (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">Gestion des Utilisateurs</h3>
                <button onClick={handleAddStudent} className=" hidden bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700">+ Ajouter Utilisateur</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="pb-3 font-semibold text-slate-700 px-4">Nom</th>
                      <th className="pb-3 font-semibold text-slate-700 px-4">Email</th>
                      <th className="pb-3 font-semibold text-slate-700 px-4">Rôle</th>
                      <th className="pb-3 font-semibold text-slate-700 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-4 px-4">{user.prenom} {user.nom}</td>
                          <td className="py-4 px-4">{user.email}</td>
                          <td className="py-4 px-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              {user.role === "administrateur" ? "Admin" : user.role === "enseignant" ? "Enseignant" : "Étudiant"}
                            </span>
                          </td>
                          <td className="py-4 px-4 space-x-2">
                            <button onClick={() => handleEditStudent(user)} className="px-3 py-1 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold transition">Modifier</button>
                            <button onClick={() => confirmDelete(user._id)} className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition">Supprimer</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-500">Aucun utilisateur trouvé</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "students" && (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">Gestion des Étudiants</h3>
                <button onClick={handleAddStudent} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700">+ Ajouter Étudiant</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="pb-3 font-semibold text-slate-700 px-4">Nom</th>
                      <th className="pb-3 font-semibold text-slate-700 px-4">Email</th>
                      <th className="pb-3 font-semibold text-slate-700 px-4">Date d'inscription</th>
                      <th className="pb-3 font-semibold text-slate-700 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.filter(u => u.role === "etudiant").length > 0 ? (
                      filteredUsers.filter(u => u.role === "etudiant").map((user) => (
                        <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-4 px-4">{user.prenom} {user.nom}</td>
                          <td className="py-4 px-4">{user.email}</td>
                          <td className="py-4 px-4 text-xs text-slate-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "-"}</td>
                          <td className="py-4 px-4 space-x-2">
                            <button onClick={() => handleEditStudent(user)} className="px-3 py-1 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold transition">Modifier</button>
                            <button onClick={() => confirmDelete(user._id)} className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition">Supprimer</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-500">Aucun étudiant trouvé</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "teachers" && (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">Gestion des Enseignants</h3>
                <button onClick={handleAddStudent} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700">+ Ajouter Enseignant</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="pb-3 font-semibold text-slate-700 px-4">Nom</th>
                      <th className="pb-3 font-semibold text-slate-700 px-4">Email</th>
                      <th className="pb-3 font-semibold text-slate-700 px-4">Date d'inscription</th>
                      <th className="pb-3 font-semibold text-slate-700 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.filter(u => u.role === "enseignant" || u.role === "teacher").length > 0 ? (
                      filteredUsers.filter(u => u.role === "enseignant" || u.role === "teacher").map((user) => (
                        <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-4 px-4">{user.prenom} {user.nom}</td>
                          <td className="py-4 px-4">{user.email}</td>
                          <td className="py-4 px-4 text-xs text-slate-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "-"}</td>
                          <td className="py-4 px-4 space-x-2">
                            <button onClick={() => handleEditStudent(user)} className="px-3 py-1 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold transition">Modifier</button>
                            <button onClick={() => confirmDelete(user._id)} className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition">Supprimer</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-500">Aucun enseignant trouvé</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "courses" && (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
              <h3 className="text-lg font-bold text-slate-900 mb-5">Gestion des cours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {cours.map((course) => (
                  <div key={course._id} className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-slate-900 line-clamp-1">{course.titre}</h4>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{course.prix === 0 ? "Gratuit" : `${course.prix} DT`}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between mt-4 text-sm">
                      <span className="text-emerald-700 font-semibold">{course.students?.length || 0} étudiants</span>
                      <span className="text-slate-500">{course.categorie}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "create-espace" && (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Créer un nouvel espace de cours</h3>
              <p className="text-slate-600 text-sm mb-6">Remplissez tous les champs pour créer un nouvel espace de cours lié à un enseignant</p>
              
              {errorMessage && (
                <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
                  {errorMessage}
                </div>
              )}
              
              {successMessage && (
                <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded-xl text-sm">
                  {successMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Titre du cours *</label>
                  <input 
                    name="titre" 
                    value={courseForm.titre} 
                    onChange={handleCourseFormChange} 
                    placeholder="Ex: Tajwid Avancé" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Catégorie *</label>
                  <input 
                    name="categorie" 
                    value={courseForm.categorie} 
                    onChange={handleCourseFormChange} 
                    placeholder="Ex: Coran, Islam, Arabe..." 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Niveau *</label>
                  <select 
                    name="niveau" 
                    value={courseForm.niveau} 
                    onChange={handleCourseFormChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Sélectionner un niveau --</option>
                    {VALID_NIVEAUX.map((niveau) => (
                      <option key={niveau} value={niveau}>
                        {niveau}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Valeurs acceptées: {VALID_NIVEAUX.join(', ')}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Prix (DT) *</label>
                  <input 
                    name="prix" 
                    type="number" 
                    value={courseForm.prix} 
                    onChange={handleCourseFormChange} 
                    placeholder="0 pour gratuit" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Enseignant *</label>
                  <select 
                    name="instructeur" 
                    value={courseForm.instructeur} 
                    onChange={handleCourseFormChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Choisir un enseignant</option>
                    {users.filter((u) => u.role === "enseignant" || u.role === "teacher").map((u) => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.prenom} {u.nom}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Statut</label>
                  <select 
                    name="status" 
                    value={courseForm.status} 
                    onChange={handleCourseFormChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {VALID_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                  <textarea 
                    name="description" 
                    value={courseForm.description} 
                    onChange={handleCourseFormChange} 
                    placeholder="Décrivez le contenu, les objectifs et les prérequis du cours..." 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px] resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleCreateCourse} 
                  disabled={operationLoading}
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {operationLoading ? "Création en cours..." : "Créer l'espace de cours"}
                </button>
                <button 
                  onClick={() => {
                    setCourseForm({
                      titre: "",
                      description: "",
                      categorie: "",
                      niveau: "",
                      prix: "",
                      instructeur: "",
                      status: "Brouillon"
                    });
                  }}
                  disabled={operationLoading}
                  className="flex-1 border border-slate-200 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Réinitialiser
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Espaces créés récemment</h4>
                {cours.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cours.slice(-6).reverse().map((course) => (
                      <div key={course._id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50 transition">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h5 className="font-semibold text-slate-900 line-clamp-1">{course.titre}</h5>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                            course.status === "Publié" ? "bg-green-100 text-green-700" :
                            course.status === "Archivé" ? "bg-gray-100 text-gray-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {course.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2 line-clamp-2">{course.description}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{course.categorie} • {course.niveau}</span>
                          <span className="font-semibold text-emerald-600">{course.prix === 0 ? "Gratuit" : `${course.prix} DT`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm text-center py-6">Aucun espace créé yet</p>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;