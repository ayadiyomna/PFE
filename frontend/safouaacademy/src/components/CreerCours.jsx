import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function CreerCours() {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000/api"; // Adaptez à votre backend

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    categorie: "",
    niveau: "",
    langue: "Français",
    duree: "",
    prix: "",
    image: null,
    objectifs: "",
    prerequis: "",
    modules: [{ titre: "", duree: "", lecons: [{ titre: "" }] }],
    certificat: true,
    status: "Publié"
  });

  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger la liste des enseignants au montage
  useEffect(() => {
    const fetchEnseignants = async () => {
      try {
        const res = await axios.get(`${API_BASE}/utilisateurs/enseignants`);
        setEnseignants(res.data);
      } catch (error) {
        toast.error("Erreur lors du chargement des enseignants");
      }
    };
    fetchEnseignants();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, { titre: "", duree: "", lecons: [{ titre: "" }] }]
    }));
  };

  const removeModule = (index) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const addLecon = (moduleIndex) => {
    setFormData(prev => {
      const newModules = [...prev.modules];
      newModules[moduleIndex].lecons.push({ titre: "" });
      return { ...prev, modules: newModules };
    });
  };

  const handleLeconChange = (moduleIndex, leconIndex, value) => {
    setFormData(prev => {
      const newModules = [...prev.modules];
      newModules[moduleIndex].lecons[leconIndex].titre = value;
      return { ...prev, modules: newModules };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoading(true);

    try {
      const courseData = {
        ...formData,
        enseignantId: formData.enseignantId, // Ajout pour assigner à l'enseignant sélectionné
        prix: parseFloat(formData.prix),
        duree: parseInt(formData.duree),
        modules: formData.modules.map((module, index) => ({
          titre: module.titre,
          ordre: index + 1,
          duree: parseInt(module.duree),
          lecons: module.lecons.map((lecon, lIndex) => ({
            titre: lecon.titre,
            ordre: lIndex + 1
          })).filter(lecon => lecon.titre.trim())
        })).filter(module => module.titre.trim())
      };

      // Supprimer image du payload si pas de fichier (géré côté backend)
      const payload = new FormData();
      Object.keys(courseData).forEach(key => {
        if (key === 'image' && courseData.image) {
          payload.append('image', courseData.image);
        } else if (key !== 'image') {
          payload.append(key, JSON.stringify(courseData[key]));
        }
      });

      await axios.post(`${API_BASE}/cours`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Cours créé avec succès !");
      navigate("/admin/cours");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Erreur lors de la création du cours";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/admin/cours" className="text-indigo-600 hover:text-indigo-500 font-medium">
            ← Retour aux cours
          </Link>
        </div>
        <main>
          <div className="bg-white shadow-xl rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Créer un nouveau cours</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre du cours *</label>
                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix (€) *</label>
                  <input
                    type="number"
                    name="prix"
                    value={formData.prix}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                  <select name="categorie" value={formData.categorie} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                    <option value="">Sélectionner</option>
                    <option value="Développement Web">Développement Web</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau *</label>
                  <select name="niveau" value={formData.niveau} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                    <option value="">Sélectionner</option>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enseignant *</label>
                  <select
                    name="enseignantId"
                    value={formData.enseignantId || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Sélectionner un enseignant</option>
                    {enseignants.map((ens) => (
                      <option key={ens._id} value={ens._id}>
                        {ens.nom} {ens.prenom} ({ens.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durée (heures) *</label>
                  <input
                    type="number"
                    name="duree"
                    value={formData.duree}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Objectifs</label>
                  <textarea
                    name="objectifs"
                    rows="3"
                    value={formData.objectifs}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prérequis</label>
                  <textarea
                    name="prerequis"
                    rows="3"
                    value={formData.prerequis}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Image du cours</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Modules</label>
                {formData.modules.map((module, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Module {index + 1}</h3>
                      {formData.modules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModule(index)}
                          className="text-red-600 hover:text-red-500"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Titre du module"
                      value={module.titre}
                      onChange={(e) => {
                        const newModules = [...formData.modules];
                        newModules[index].titre = e.target.value;
                        setFormData({ ...formData, modules: newModules });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded mb-3"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Durée (minutes)"
                      value={module.duree}
                      onChange={(e) => {
                        const newModules = [...formData.modules];
                        newModules[index].duree = e.target.value;
                        setFormData({ ...formData, modules: newModules });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded mb-3"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Leçons</label>
                      {module.lecons.map((lecon, lIndex) => (
                        <input
                          key={lIndex}
                          type="text"
                          placeholder={`Leçon ${lIndex + 1}`}
                          value={lecon.titre}
                          onChange={(e) => handleLeconChange(index, lIndex, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded mb-2"
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => addLecon(index)}
                        className="text-indigo-600 hover:text-indigo-500 text-sm"
                      >
                        + Ajouter une leçon
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addModule}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                >
                  + Ajouter un module
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.certificat}
                    onChange={(e) => setFormData({ ...formData, certificat: e.target.checked })}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Délivrer un certificat</span>
                </label>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Création..." : "Créer le cours"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreerCours;