import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import coursService from "../services/coursService";
import authService from "../services/authService";

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
  const [formData, setFormData] = useState({ nom: "", cours: "", progression: 0 });

  const loadUsers = async () => {
    try {
      setLoading(true);
      let result;
      try { result = await api.get('/users'); } catch (e1) {}
      if (result?.data?.data) setUsers(result.data.data);
      else if (result?.data) setUsers(result.data);
      else setUsers([]);
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
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
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token) { navigate('/login'); return; }
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.role === 'admin' || user?.role === 'administrateur') {
          setIsAuthorized(true);
          loadUsers();
          loadCourses();
        } else navigate('/');
      } catch (e) { navigate('/login'); }
    } else navigate('/login');
  }, []);

  const handleLogout = () => { authService.logout(); navigate('/login'); };
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: name === 'progression' ? parseInt(value) || 0 : value })); };
  const handleAddStudent = () => { setEditingStudent(null); setFormData({ nom: "", cours: "", progression: 0 }); setShowStudentModal(true); };
  const handleEditStudent = (student) => { setEditingStudent(student); setFormData({ nom: student.nom || '', cours: student.cours || '', progression: student.progression || 0 }); setShowStudentModal(true); };
  const handleSaveStudent = () => { if (!formData.nom.trim() || !formData.cours.trim()) return; if (editingStudent) { setUsers(users.map(u => u._id === editingStudent._id || u.id === editingStudent.id ? { ...u, nom: formData.nom, cours: formData.cours, progression: formData.progression } : u)); } else { setUsers([...users, { _id: `temp-${Date.now()}`, nom: formData.nom, cours: formData.cours, progression: formData.progression, role: 'etudiant' }]); } setShowStudentModal(false); };
  const confirmDelete = (studentId) => setDeleteConfirm(studentId);
  const handleDeleteStudent = () => { if (deleteConfirm) { setUsers(users.filter(u => u._id !== deleteConfirm && u.id !== deleteConfirm)); setDeleteConfirm(null); } };
  const cancelDelete = () => setDeleteConfirm(null);

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user =>
    (user.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((user.prenom || '') + ' ' + (user.nom || '')).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dashboardStats = {
    totalUsers: users.length,
    students: users.filter(u => u.role === 'etudiant').length,
    teachers: users.filter(u => u.role === 'enseignant' || u.role === 'teacher').length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'administrateur').length,
    courses: cours.length,
    freeCourses: cours.filter(c => c.prix === 0).length,
    paidCourses: cours.filter(c => c.prix > 0).length,
    categories: [...new Set(cours.map(c => c.categorie))].length
  };

  if (!isAuthorized || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f4f8f5]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f8f5] text-slate-800 flex">
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Confirmer suppression</h3>
            <p className="text-slate-600 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={handleDeleteStudent} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700">Supprimer</button>
              <button onClick={cancelDelete} className="flex-1 border border-slate-200 py-2.5 rounded-xl font-semibold hover:bg-slate-50">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {showStudentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-5">{editingStudent ? 'Modifier' : 'Ajouter'} un étudiant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nom complet</label>
                <input name="nom" value={formData.nom} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cours</label>
                <input name="cours" value={formData.cours} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Progression (%)</label>
                <input type="number" name="progression" value={formData.progression} onChange={handleInputChange} min="0" max="100" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveStudent} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700">{editingStudent ? 'Modifier' : 'Ajouter'}</button>
              <button onClick={() => setShowStudentModal(false)} className="flex-1 border border-slate-200 py-2.5 rounded-xl font-semibold hover:bg-slate-50">Annuler</button>
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
          {[['dashboard','Dashboard'],['users','Utilisateurs'],['students','Étudiants'],['teachers','Enseignants'],['courses','Cours']].map(([key,label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`w-full text-left px-4 py-3 rounded-xl transition ${activeTab===key ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}>{label}</button>
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

          {activeTab === 'dashboard' && (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  ['Utilisateurs', dashboardStats.totalUsers, 'bg-emerald-600'],
                  ['Étudiants', dashboardStats.students, 'bg-emerald-500'],
                  ['Enseignants', dashboardStats.teachers, 'bg-emerald-700'],
                  ['Cours', dashboardStats.courses, 'bg-emerald-400']
                ].map(([label, value, color]) => (
                  <div key={label} className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
                    <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center mb-4`}>●</div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
                  </div>
                ))}
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-slate-900">Gestion des utilisateurs</h3>
                    <button onClick={() => setActiveTab('users')} className="text-emerald-700 font-semibold hover:text-emerald-800">Voir tout</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredUsers.slice(0, 6).map((user) => (
                      <div key={user._id || user.id} className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition">
                        <p className="font-semibold text-slate-900">{user.prenom || ''} {user.nom || 'N/A'}</p>
                        <p className="text-sm text-slate-500 truncate">{user.email || 'N/A'}</p>
                        <span className={`inline-flex mt-3 px-2.5 py-1 rounded-full text-xs font-bold ${user.role === 'enseignant' || user.role === 'teacher' ? 'bg-emerald-100 text-emerald-700' : user.role === 'admin' ? 'bg-slate-100 text-slate-700' : 'bg-green-100 text-green-700'}`}>{user.role || 'etudiant'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Cours</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50"><span className="text-slate-700">Gratuits</span><span className="font-black text-emerald-700">{dashboardStats.freeCourses}</span></div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100"><span className="text-slate-700">Payants</span><span className="font-black text-emerald-700">{dashboardStats.paidCourses}</span></div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50"><span className="text-slate-700">Catégories</span><span className="font-black text-emerald-700">{dashboardStats.categories}</span></div>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'users' && (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 overflow-x-auto">
              <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold text-slate-900">Utilisateurs</h3></div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-500 border-b"><th className="py-3">Nom</th><th>Email</th><th>Rôle</th></tr></thead>
                <tbody>
                  {filteredUsers.map((u) => (<tr key={u._id || u.id} className="border-b last:border-0"><td className="py-3">{u.prenom || ''} {u.nom || 'N/A'}</td><td>{u.email || 'N/A'}</td><td>{u.role || 'etudiant'}</td></tr>))}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === 'students' && (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">Étudiants</h3>
                <button onClick={handleAddStudent} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">+ Ajouter</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUsers.filter(u => u.role === 'etudiant').map((student) => (
                  <div key={student._id || student.id} className="p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-3"><p className="font-semibold">{student.prenom || ''} {student.nom || 'Étudiant'}</p><span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{student.progression || 0}%</span></div>
                    <p className="text-sm text-slate-500 mb-4">{student.email || 'N/A'}</p>
                    <div className="flex gap-2"><button onClick={() => handleEditStudent(student)} className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200">Modifier</button><button onClick={() => confirmDelete(student._id || student.id)} className="px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100">Supprimer</button></div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'teachers' && (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
              <h3 className="text-lg font-bold text-slate-900 mb-5">Enseignants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUsers.filter(u => u.role === 'enseignant' || u.role === 'teacher').map((teacher) => (
                  <div key={teacher._id || teacher.id} className="p-4 rounded-2xl border border-slate-100 bg-emerald-50/40">
                    <p className="font-semibold text-slate-900">{teacher.prenom || ''} {teacher.nom || 'Enseignant'}</p>
                    <p className="text-sm text-slate-500">{teacher.email || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'courses' && (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
              <h3 className="text-lg font-bold text-slate-900 mb-5">Gestion des cours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {cours.map((course) => (
                  <div key={course._id} className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-slate-900 line-clamp-1">{course.titre}</h4>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{course.prix === 0 ? 'Gratuit' : `${course.prix} DT`}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between mt-4 text-sm"><span className="text-emerald-700 font-semibold">{course.students?.length || 0} étudiants</span><span className="text-slate-500">{course.categorie}</span></div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
