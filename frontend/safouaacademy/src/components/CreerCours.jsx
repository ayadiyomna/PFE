import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function CreerCours() {
  const navigate = useNavigate();

  // ✅ ÉTAT DU FORMULAIRE
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "Débutant",
    language: "Français",
    duration: "",
    price: "",
    imagePreview: ""
  });

  // ✅ ÉTAT VALIDATION
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ✅ CATEGORIES DISPONIBLES
  const categories = ["Coran", "Langue", "Jurisprudence", "Histoire"];
  const levels = ["Débutant", "Intermédiaire", "Expert"];
  const languages = ["Français", "Arabe", "Anglais"];

  // ✅ GESTION CHANGE INPUTS
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // ✅ CLEAR ERROR SUR CHANGEMENT
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // ✅ GESTION IMAGE PREVIEW
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ VALIDATION FORMULAIRE
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Le titre est obligatoire";
    else if (formData.title.length < 5) newErrors.title = "Le titre doit faire au moins 5 caractères";

    if (!formData.description.trim()) newErrors.description = "La description est obligatoire";
    else if (formData.description.length < 20) newErrors.description = "La description doit faire au moins 20 caractères";

    if (!formData.category) newErrors.category = "Sélectionnez une catégorie";
    if (!formData.duration) newErrors.duration = "Indiquez la durée";
    if (!formData.price || formData.price <= 0) newErrors.price = "Le prix doit être supérieur à 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ SOUMISSION FORMULAIRE
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    // ✅ SIMULATION API
    setTimeout(() => {
      console.log("Nouveau cours créé:", formData);
      
      // ✅ AJOUT AU LOCALSTORAGE (simulation)
      const courses = JSON.parse(localStorage.getItem('teacherCourses') || '[]');
      const newCourse = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toLocaleDateString('fr-FR')
      };
      courses.unshift(newCourse);
      localStorage.setItem('teacherCourses', JSON.stringify(courses));
      
      setLoading(false);
      setSuccess(true);
      
      // ✅ REDIRECTION APRÈS 2s
      setTimeout(() => {
        navigate('/enseignant');
      }, 2000);
    }, 1500);
  };

  // ✅ FONCTION DÉCONNEXION
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER IDENTIQUE */}
      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </Link>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/enseignant" className="text-emerald-600 font-semibold">Espace Enseignant</Link>
            <Link to="/enseignant/analytiques" className="text-gray-600 hover:text-emerald-600">Analytiques</Link>
            <Link to="/enseignant/parametres" className="text-gray-600 hover:text-emerald-600">Paramètres</Link>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-semibold px-3 py-1 rounded transition">
              Déconnexion
            </button>
          </nav>
          
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/compte')} className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold">
              Mon compte
            </button>
            <button onClick={handleLogout} className="md:hidden p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Déconnexion">
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* FORMULAIRE CRÉATION */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* EN-TÊTE */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-8 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Créer un nouveau cours</h1>
                <p className="text-emerald-100 mt-1">Remplissez le formulaire pour ajouter votre cours</p>
              </div>
            </div>
          </div>

          {/* FORMULAIRE */}
          <form onSubmit={handleSubmit} className="p-8">
            
            {success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Cours créé avec succès !</h2>
                <p className="text-gray-600 mb-6">Redirection vers votre dashboard...</p>
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent"></div>
                  Redirection en cours
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* COLONNE 1 - Infos principales */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Titre du cours *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                        errors.title 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-200 focus:ring-emerald-500'
                      }`}
                      placeholder="Ex: Tajwid Avancé - Maîtrisez la récitation parfaite"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                        </svg>
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 resize-vertical transition ${
                        errors.description 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-200 focus:ring-emerald-500'
                      }`}
                      placeholder="Décrivez votre cours en détail (minimum 20 caractères)..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                        </svg>
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                          errors.category 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-200 focus:ring-emerald-500'
                        }`}
                      >
                        <option value="">Choisir une catégorie</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Niveau</label>
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {levels.map(lvl => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* COLONNE 2 - Détails techniques */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Langue</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Durée *</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                        errors.duration 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-200 focus:ring-emerald-500'
                      }`}
                      placeholder="Ex: 8 semaines, 12 heures"
                    />
                    {errors.duration && (
                      <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prix (€) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                        errors.price 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-200 focus:ring-emerald-500'
                      }`}
                      placeholder="0"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">Image du cours (optionnel)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 transition cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    {formData.imagePreview && (
                      <div className="mt-4 p-2 border border-gray-200 rounded-xl bg-gray-50">
                        <img 
                          src={formData.imagePreview} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* BOUTONS ACTIONS */}
            {!success && (
              <div className="flex gap-4 pt-8 border-t border-gray-100 mt-8">
                <button
                  type="button"
                  onClick={() => navigate('/enseignant')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
                    loading
                      ? 'bg-emerald-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Créer le cours
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreerCours;
