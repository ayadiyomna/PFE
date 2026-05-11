import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import authService from "../services/authService";

function Compte() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Formulaire d'édition de profil
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: ""
  });

  // Formulaire de changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState(null);

  useEffect(() => {
    const userData = authService.getCurrentUser();
    if (!userData) {
      navigate("/login");
      return;
    }
    loadUserProfile();
  }, [navigate]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/profile");
      if (response.data.success) {
        setUser(response.data.data);
        setFormData({
          nom: response.data.data.nom || "",
          prenom: response.data.data.prenom || "",
          email: response.data.data.email || ""
        });
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
      setMessage({
        type: "error",
        text: "Erreur chargement du profil"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.email.trim()) {
      setMessage({
        type: "error",
        text: "Tous les champs sont requis"
      });
      return;
    }

    try {
      const response = await api.put("/users/profile", formData);
      if (response.data.success) {
        setUser(response.data.data);
        authService.setSession({ token: localStorage.getItem('token'), user: response.data.data });
        setMessage({
          type: "success",
          text: "Profil mis à jour avec succès"
        });
        setEditing(false);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erreur lors de la mise à jour"
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validations
    if (!passwordData.currentPassword) {
      setMessage({
        type: "error",
        text: "Le mot de passe actuel est requis"
      });
      return;
    }

    if (!passwordData.newPassword) {
      setMessage({
        type: "error",
        text: "Le nouveau mot de passe est requis"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Le nouveau mot de passe doit contenir au moins 6 caractères"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: "error",
        text: "Les mots de passe ne correspondent pas"
      });
      return;
    }

    try {
      setUpdatingPassword(true);
      const response = await api.put("/users/profile", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Mot de passe modifié avec succès"
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erreur lors du changement de mot de passe"
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({
        type: "error",
        text: "La taille de l'image ne doit pas dépasser 5MB"
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Veuillez sélectionner une image valide"
      });
      return;
    }

    try {
      setUploadingImage(true);
      const formDataToSend = new FormData();
      formDataToSend.append("image", file);

      const response = await api.post("/users/profile/picture", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        const updated = response.data.data.profile || response.data.data;
        setUser(updated);
        authService.setSession({ token: localStorage.getItem('token'), user: updated });
        setMessage({
          type: "success",
          text: "Photo de profil mise à jour avec succès"
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Erreur upload photo:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erreur lors de l'upload de la photo"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100">
      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
          >
            ← Retour
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Section Photo de Profil */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Photo de profil</h2>
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                {user?.image ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${user.image}`}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">👤</span>
                )}
              </div>
              <button
                onClick={triggerFileInput}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 transition disabled:opacity-50"
              >
                📷
              </button>
            </div>
            <div>
              <p className="text-gray-600 mb-4">
                Cliquez sur l'appareil photo pour changer votre photo de profil
              </p>
              <p className="text-sm text-gray-500">
                Format accepté: JPG, PNG, GIF (Max 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Section Informations Personnelles */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Informations personnelles</h2>
            <button
              onClick={() => setEditing(!editing)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                editing
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {editing ? "Annuler" : "✏️ Modifier"}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
              >
                ✓ Enregistrer les modifications
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nom</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Prénom</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.prenom}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rôle</p>
                  <p className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                    {user?.role === "administrateur"
                      ? "Administrateur"
                      : user?.role === "enseignant"
                      ? "Enseignant"
                      : "Étudiant"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Membre depuis</p>
                  <p className="text-gray-900">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("fr-FR")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section Sécurité - Changement de mot de passe */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sécurité</h2>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition"
                placeholder="Entrez votre mot de passe actuel"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition"
                  placeholder="Entrez un nouveau mot de passe"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition"
                  placeholder="Confirmez le nouveau mot de passe"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50"
            >
              {updatingPassword ? "Mise à jour..." : "🔒 Modifier le mot de passe"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Compte;
