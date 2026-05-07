import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "../services/authService";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const userData = authService.getCurrentUser();
    setUser(userData);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleDashboardClick = () => {
    if (!user) return;
    switch (user.role) {
      case "administrateur":
      case "admin":
        navigate("/admin");
        break;
      case "enseignant":
      case "teacher":
        navigate("/enseignant");
        break;
      case "etudiant":
        navigate("/etudiant");
        break;
      default:
        navigate("/");
    }
  };

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

  const getIcon = (iconName, className = "w-6 h-6") => {
    const icons = {
      "chevron-down": "M19 9l-7 7-7-7",
      "chevron-right": "M9 5l7 7-7 7",
      "mail": "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      "phone": "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    };
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[iconName]} />
      </svg>
    );
  };

  const getNavigationLinks = () => {
    if (!user) {
      return [
        { to: "/", label: "Accueil" },
        { to: "/cours", label: location.pathname === "/" ? "Catalogue" : "Cours" },
        { to: "/login", label: "Connexion" },
        { to: "/register", label: "Inscription" }
      ];
    }

    const baseLinks = [
      { to: "/", label: "Accueil" },
      { to: "/cours", label: location.pathname === "/" ? "Catalogue" : "Cours" }
    ];

    switch (user.role) {
      case "administrateur":
      case "admin":
        return [
          ...baseLinks,
          { to: "/admin", label: "Administration" }
        ];
      case "enseignant":
      case "teacher":
        return [
          ...baseLinks,
          { to: "/enseignant", label: "Mon Espace" }
        ];
      case "etudiant":
        return [
          ...baseLinks,
          { to: "/etudiant", label: "Mon Espace" }
        ];
      default:
        return baseLinks;
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    return `${user.prenom || ""} ${user.nom || ""}`.trim() || user.email || "Utilisateur";
  };

  const getRoleDisplayName = () => {
    if (!user) return "";
    switch (user.role) {
      case "administrateur":
      case "admin":
        return "Administrateur";
      case "enseignant":
      case "teacher":
        return "Enseignant";
      case "etudiant":
        return "Étudiant";
      default:
        return user.role;
    }
  };

  const navigationLinks = getNavigationLinks();

  const isHomePage = location.pathname === "/";

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-500 ${
        isHomePage ? (
          scrolled 
            ? 'bg-white backdrop-blur-xl shadow-lg border-b border-emerald-100' 
            : 'bg-white backdrop-blur-md'
        ) : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div 
            className={`relative transform transition-transform duration-300 hover:scale-105 cursor-pointer ${
              isHomePage ? 'text-emerald-700' : 'text-white'
            }`}
          >
            <h1 className="text-3xl font-black">
              <span className={`bg-gradient-to-r ${
                isHomePage 
                  ? 'from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent'
                  : 'from-white to-emerald-100 bg-clip-text text-transparent'
              }`}>
                Safoua
              </span>
              <span className={isHomePage ? 'text-emerald-700' : 'text-white'}> Academy</span>
            </h1>
            <div className={`absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r ${
              isHomePage ? 'from-emerald-500 to-teal-500' : 'from-white to-emerald-200'
            } rounded-full`}></div>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.filter(link => link.to !== "/login" && link.to !== "/register").map((link) => (
              <div key={link.to} className="transform transition-transform duration-200 hover:-translate-y-1">
                {link.label === "Catalogue" && isHomePage ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                      className={`flex items-center gap-2 font-semibold relative group ${
                        isHomePage ? 'text-gray-700 hover:text-emerald-700' : 'text-emerald-100 hover:text-white'
                      } bg-white rounded-xl px-4 py-2 shadow-md hover:shadow-xl border border-emerald-100 transition-all transform hover:scale-105`}
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
                ) : (
                  <Link 
                    to={link.to} 
                    className={`font-semibold relative group ${
                      isHomePage ? 'text-emerald-700 hover:text-emerald-800' : 'text-emerald-100 hover:text-white'
                    }`}
                  >
                    {link.label}
                    <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${
                      isHomePage ? 'bg-emerald-600' : 'bg-white'
                    }`}></span>
                  </Link>
                )}
              </div>
            ))}

            {user ? (
              <>
                <button 
                  onClick={handleDashboardClick} 
                  className={`font-semibold relative group transform transition-transform duration-200 hover:-translate-y-1 ${
                    isHomePage ? 'text-gray-700 hover:text-emerald-700' : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  Dashboard
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${
                    isHomePage ? 'bg-emerald-600' : 'bg-white'
                  }`}></span>
                </button>
                <button 
                  onClick={handleLogout} 
                  className={`font-semibold relative group transform transition-transform duration-200 hover:-translate-y-1 ${
                    isHomePage ? 'text-red-600 hover:text-red-700' : 'text-red-400 hover:text-red-300'
                  }`}
                >
                  Déconnexion
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${
                    isHomePage ? 'bg-red-600' : 'bg-red-400'
                  }`}></span>
                </button>
              </>
            ) : (
              <div className="transform transition-transform duration-200 hover:-translate-y-1">
                <Link 
                  to="/login" 
                  className={`font-semibold relative group ${
                    isHomePage ? 'text-gray-700 hover:text-emerald-700' : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  Connexion
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${
                    isHomePage ? 'bg-emerald-600' : 'bg-white'
                  }`}></span>
                </Link>
              </div>
            )}
          </nav>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            {user ? (
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
  );
}

export default Header;