import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bg from "../assets/4.jpg";

function Home() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredNom, setHoveredNom] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAuthenticated(!!token);
    setUserRole(user.role);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { id: 0, name: "Tajwid & Coran", desc: "Règles récitation + mémorisation", link: "/cours?cat=tajwid", colorClass: "from-emerald-500 to-green-600", bgClass: "bg-emerald-50" },
    { id: 1, name: "Langue Arabe", desc: "Classique + moderne pour Coran", link: "/cours?cat=arabe", colorClass: "from-blue-500 to-cyan-600", bgClass: "bg-blue-50" },
    { id: 2, name: "Fiqh", desc: "Jurisprudence rites quotidiens", link: "/cours?cat=fiqh", colorClass: "from-purple-500 to-violet-600", bgClass: "bg-purple-50" },
    { id: 3, name: "Histoire Islamique", desc: "Sira Prophète + Compagnons", link: "/cours?cat=histoire", colorClass: "from-orange-500 to-amber-600", bgClass: "bg-orange-50" },
    { id: 4, name: "Aqida (Croyance)", desc: "Piliers foi Coran/Sunna", link: "/cours?cat=aqida", colorClass: "from-indigo-500 to-blue-600", bgClass: "bg-indigo-50" },
    { id: 5, name: "Akhlak & Adab", desc: "Éthique + comportements nobles", link: "/cours?cat=akhlak", colorClass: "from-pink-500 to-rose-600", bgClass: "bg-pink-50" },
    { id: 6, name: "Tafsir", desc: "Exégèse sourates classiques", link: "/cours?cat=tafsir", colorClass: "from-green-500 to-teal-600", bgClass: "bg-green-50" },
    { id: 7, name: "Sourates Courtes", desc: "Mémorisation débutants", link: "/cours?cat=sourates", colorClass: "from-teal-500 to-cyan-600", bgClass: "bg-teal-50" }
  ];

  const nomsAllah = [
    "Allah", "Ar-Rahman", "Ar-Rahim", "Al-Malik",
    "Al-Quddus", "As-Salam", "Al-Mu'min", "Al-Muhaymin",
    "Al-Aziz", "Al-Jabbar", "Al-Mutakabbir", "Al-Khaliq",
    "Al-Bari", "Al-Musawwir", "Al-Gaffar", "Al-Qahhar",
    "Al-Wahhab", "Ar-Razzaq", "Al-Fattah", "Al-Alim",
    "Al-Qabid", "Al-Basit", "Al-Khafid", "Ar-Rafi",
    "Al-Mu'izz", "Al-Mudhill", "As-Sami", "Al-Basir",
    "Al-Hakam", "Al-Adl", "Al-Latif", "Al-Khabir",
    "Al-Halim", "Al-Azim", "Al-Ghafur", "Ash-Shakur",
    "Al-Ali", "Al-Kabir", "Al-Hafiz", "Al-Muqit",
    "Al-Hasib", "Al-Jalil", "Al-Karim", "Ar-Raqib",
    "Al-Mujib", "Al-Wasi", "Al-Hakim", "Al-Wadud",
    "Al-Majid", "Al-Ba'ith", "Ash-Shahid", "Al-Haqq",
    "Al-Wakil", "Al-Qawi", "Al-Matin", "Al-Wali",
    "Al-Hamid", "Al-Muhsi", "Al-Mubdi", "Al-Mu'id",
    "Al-Muhyi", "Al-Mumit", "Al-Hayy", "Al-Qayyum",
    "Al-Wajid", "Al-Majid", "Al-Wahid", "Al-Ahad",
    "As-Samad", "Al-Qadir", "Al-Muqtadir", "Al-Muqaddim",
    "Al-Mu'akhkhir", "Al-Awwal", "Al-Akhir", "Az-Zahir",
    "Al-Batin", "Al-Wali", "Al-Muta'ali", "Al-Barr",
    "At-Tawwab", "Al-Muntaqim", "Al-Afu", "Ar-Ra'uf",
    "Malik Al-Mulk", "Dhu Al-Jalal", "Al-Muqsit", "Al-Jami",
    "Al-Ghani", "Al-Mughni", "Al-Mani", "Ad-Darr",
    "An-Nafi", "An-Nur", "Al-Hadi", "Al-Badi",
    "Al-Baqi", "Al-Warith", "Ar-Rashid"
  ];
  
  const versetArabe = "ٱلۡفَاتِحَةِ";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategory((prev) => (prev + 1) % categories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [categories.length]);

  const features = [
    { icon: "zap", title: "Cours structurés", description: "Apprenez à votre rythme avec des cours bien organisés" },
    { icon: "video", title: "Vidéos interactives", description: "Leçons vidéo de haute qualité avec exercices pratiques" },
    { icon: "trending-up", title: "Suivi de progression", description: "Visualisez votre avancement dans chaque cours" },
    { icon: "award", title: "Certificats", description: "Obtenez des certificats reconnus à la fin de chaque cours" }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('enrolledCourses');
    setIsAuthenticated(false);
    setUserRole(null);
    toast.success("👋 Déconnexion réussie !");
    navigate('/');
  };

  const handleDashboardClick = () => {
    if (!isAuthenticated) {
      toast.info("🔐 Connectez-vous pour accéder à votre espace");
      navigate('/login');
      return;
    }
    switch(userRole) {
      case 'admin': navigate('/admin'); break;
      case 'enseignant': navigate('/enseignant'); break;
      case 'etudiant': navigate('/etudiant'); break;
      default: navigate('/login');
    }
  };

  const getIcon = (iconName, className = "w-6 h-6") => {
    switch(iconName) {
      case "zap":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "video":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case "trending-up":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case "award":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "menu":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
      case "chevron-down":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        );
      case "chevron-right":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        );
      case "mail":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case "phone":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case "book-open":
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Header avec animation CSS pure */}
      <header 
        className={`fixed w-full z-50 transition-all duration-500 animate-slideDown ${
          scrolled 
            ? 'bg-white backdrop-blur-xl shadow-lg border-b border-emerald-100' 
            : 'bg-white backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo avec animation hover */}
            <div 
              className="relative transform transition-transform duration-300 hover:scale-105 cursor-pointer"
            >
              <h1 className="text-3xl font-black">
                <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Safoua
                </span>
                <span className="text-emerald-700"> Academy</span>
              </h1>
              <div className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
            </div>

            {/* Navigation desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <div className="transform transition-transform duration-200 hover:-translate-y-1">
                <Link to="/" className="text-emerald-700 font-semibold relative group">
                  Accueil
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"></span>
                </Link>
              </div>
              
              <div className="transform transition-transform duration-200 hover:-translate-y-1">
                <Link to="/cours" className="text-gray-700 hover:text-emerald-700 font-semibold relative group">
                  Catalogue
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"></span>
                </Link>
              </div>
              
              {/* Dropdown Catégories */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 font-semibold bg-white rounded-xl px-4 py-2 shadow-md hover:shadow-xl border border-emerald-100 transition-all transform hover:scale-105"
                >
                  Catégories
                  <span className={`transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`}>
                    {getIcon("chevron-down", "w-4 h-4")}
                  </span>
                </button>
                
                {isCategoriesOpen && (
                  <div className="absolute top-full left-0 mt-3 w-96 bg-white backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 py-3 z-50 max-h-96 overflow-y-auto animate-fadeIn">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="transform transition-all duration-200 hover:translate-x-2"
                      >
                        <Link
                          to={cat.link}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent text-gray-700 hover:text-emerald-700 transition-all border-b border-gray-100 last:border-b-0"
                          onClick={() => setIsCategoriesOpen(false)}
                        >
                          <div className={`w-1.5 h-12 rounded-full bg-gradient-to-b ${cat.colorClass} shadow-lg`} />
                          <div>
                            <div className="font-bold text-lg">{cat.name}</div>
                            <div className="text-sm text-gray-500">{cat.desc}</div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <>
                  <button 
                    onClick={handleDashboardClick} 
                    className="text-gray-700 hover:text-emerald-700 font-semibold relative group transform transition-transform duration-200 hover:-translate-y-1"
                  >
                    Dashboard
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"></span>
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="text-red-600 hover:text-red-700 font-semibold relative group transform transition-transform duration-200 hover:-translate-y-1"
                  >
                    Déconnexion
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full"></span>
                  </button>
                </>
              ) : (
                <div className="transform transition-transform duration-200 hover:-translate-y-1">
                  <Link to="/login" className="text-gray-700 hover:text-emerald-700 font-semibold relative group">
                    Connexion
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"></span>
                  </Link>
                </div>
              )}
            </nav>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              {isAuthenticated ? (
                <button
                  onClick={handleDashboardClick}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all font-bold shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Mon espace
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-3 border-2 border-emerald-600 text-emerald-700 rounded-2xl hover:bg-emerald-50 transition-all font-semibold shadow-md hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all font-bold shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero avec image de fond et texte à gauche */}
      <section
        className="relative overflow-hidden min-h-screen flex items-center"
        style={{
          backgroundImage: imageError ? 'none' : `url(${bg})`,
          backgroundColor: imageError ? '#064e3b' : 'transparent',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed'
        }}
        onError={() => setImageError(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/80 to-black/60"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full">
          <div className="max-w-2xl ml-0 lg:ml-8 animate-fadeInUp">
            {/* Lien de la sourate Al-Fatiha - plus petit et à côté du texte */}
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl">
                Apprenez l'<span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">Islam</span>
                <br />en ligne
              </h2>
              <Link 
                to="/fatiha" 
                className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-300/30 transition-all transform hover:scale-105"
              >
                <span className="font-arabic text-emerald-300 text-lg" style={{ fontFamily: "'Amiri', 'Scheherazade New', 'Traditional Arabic', serif" }}>
                  {versetArabe}
                </span>
                {getIcon("book-open", "w-4 h-4 text-emerald-300")}
              </Link>
            </div>
            
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-xl">
              Découvrez des cours de qualité en Tajwid, Arabe, Fiqh et Histoire islamique. 
              Apprenez à votre rythme avec des enseignants qualifiés.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/cours"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-2xl transform hover:scale-105 active:scale-95 text-center"
              >
                Explorer les cours
              </Link>
              
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="bg-white/20 text-white border-2 border-white/30 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-white/30 backdrop-blur-xl transition-all transform hover:scale-105 active:scale-95 text-center"
                >
                  Commencer gratuitement
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator animé */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce">
          {getIcon("chevron-down", "w-6 h-6")}
        </div>
      </section>

      {/* Catégories - sans numérotation */}
      <section className="py-32 bg-gradient-to-br from-white via-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fadeInUp">
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Nos <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">8 Catégories</span> Principales
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choisissez votre parcours spirituel personnalisé</p>
          </div>
          
          <div className="relative">
            {/* Indicateurs */}
            <div className="flex justify-center gap-3 mb-16">
              {categories.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentCategory(idx)}
                  className={`relative transition-all duration-300 transform hover:scale-110 ${
                    currentCategory === idx ? 'w-12' : 'w-4'
                  } h-4 rounded-full overflow-hidden`}
                >
                  <span className={`absolute inset-0 ${
                    currentCategory === idx 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
                      : 'bg-gray-300'
                  }`} />
                </button>
              ))}
            </div>

            {/* Grille - sans badges de numérotation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  onMouseEnter={() => setHoveredCategory(idx)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`group relative p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                    currentCategory === idx ? 'ring-4 ring-emerald-500/30 shadow-2xl scale-105' : ''
                  }`}
                >
                  {/* Badge supprimé */}

                  {/* Icône */}
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${cat.colorClass} shadow-xl transition-transform duration-300 ${hoveredCategory === idx ? 'rotate-6' : ''} flex items-center justify-center`}>
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253" />
                    </svg>
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-900 mb-3 text-center group-hover:text-emerald-600 transition">
                    {cat.name}
                  </h4>
                  
                  <p className="text-gray-600 text-sm mb-6 text-center leading-relaxed">
                    {cat.desc}
                  </p>
                  
                  <div className="text-center">
                    <Link
                      to={cat.link}
                      className="inline-flex items-center gap-2 text-emerald-600 font-semibold group-hover:text-emerald-700 transition-all group-hover:translate-x-1"
                    >
                      Découvrir
                      {getIcon("chevron-right", "w-4 h-4")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 99 Noms - version sans numérotation et sans lien "Explorer" */}
      <section className="py-32 bg-gradient-to-br from-emerald-900/5 via-white to-emerald-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fadeInUp">
            <h3 className="text-4xl md:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Les 99 Plus Beaux Noms
              </span>
              <br />
              <span className="text-3xl md:text-4xl text-emerald-800">d'Allah ﷻ</span>
            </h3>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 font-serif italic">
              "Celui qui les mémorise entrera au Paradis"
            </p>
          </div>

          {/* Grille - sans numérotation */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 max-h-96 overflow-y-auto p-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100">
            {nomsAllah.map((nom, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredNom(idx)}
                onMouseLeave={() => setHoveredNom(null)}
                onClick={() => toast.info(
                  <div>
                    <div className="font-bold">Ya {nom}</div>
                    <div className="text-sm text-emerald-600">Béni soit ce Nom</div>
                  </div>, 
                  { theme: "colored" }
                )}
                className={`p-3 bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 border border-emerald-100 hover:border-emerald-300 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 text-center font-medium text-gray-700 hover:text-emerald-700 text-xs min-h-[60px] flex items-center justify-center transform ${hoveredNom === idx ? 'scale-105 -translate-y-1' : ''}`}
              >
                {nom}
              </div>
            ))}
          </div>

          {/* Lien "Explorer tous les noms" supprimé */}
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fadeInUp">
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Pourquoi choisir <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Safoua Academy</span> ?
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group relative p-8 bg-gradient-to-br from-white to-emerald-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-emerald-100"
              >
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6 shadow-xl transition-transform duration-300 ${hoveredFeature === index ? 'scale-110' : ''}`}>
                    {getIcon(feature.icon, "w-6 h-6 text-white")}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
                <div className="absolute bottom-4 right-4 text-6xl font-black text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="animate-fadeInUp">
              <h5 className="text-2xl font-black mb-6">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Safoua Academy
                </span>
              </h5>
              <p className="text-gray-400 leading-relaxed">
                Apprentissage islamique en ligne de qualité premium. Coran, Sunna et sciences religieuses.
              </p>
            </div>

            <div className="animate-fadeInUp animation-delay-100">
              <h5 className="font-bold text-emerald-400 mb-6">Liens rapides</h5>
              <ul className="space-y-4">
                {['Catalogue', 'Connexion', 'Inscription', 'Contact'].map((item) => (
                  <li key={item} className="transform transition-all duration-200 hover:translate-x-2">
                    <Link to={`/${item.toLowerCase()}`} className="text-gray-400 hover:text-white transition flex items-center gap-2">
                      <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="animate-fadeInUp animation-delay-200">
              <h5 className="font-bold text-emerald-400 mb-6">Catégories</h5>
              <ul className="space-y-3">
                {['Tajwid & Coran', 'Langue arabe', 'Fiqh', 'Aqida', 'Histoire Islamique'].map((item) => (
                  <li key={item} className="text-gray-400 hover:text-white cursor-pointer transition transform hover:translate-x-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="animate-fadeInUp animation-delay-300">
              <h5 className="font-bold text-emerald-400 mb-6">Contact</h5>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-400 hover:text-white transition transform hover:translate-x-2">
                  {getIcon("mail", "w-5 h-5 text-emerald-400")}
                  contact@safoua.com
                </li>
                <li className="flex items-center gap-3 text-gray-400 hover:text-white transition transform hover:translate-x-2">
                  {getIcon("phone", "w-5 h-5 text-emerald-400")}
                  +216 XX XXX XXX
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-12 text-center animate-fadeIn">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Safoua Academy. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {/* Styles CSS pour les animations et la police arabe */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap');
        
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.8s ease-out;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animation-delay-700 {
          animation-delay: 0.7s;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        
        .font-arabic {
          font-family: 'Amiri', 'Scheherazade New', 'Traditional Arabic', serif;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

export default Home;