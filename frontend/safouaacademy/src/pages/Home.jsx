import { Link } from "react-router-dom";
import bg from "../assets/4.jpg"

function Home() {
  const features = [
    {
      icon: "zap",
      title: "Cours structurés",
      description: "Apprenez à votre rythme avec des cours bien organisés"
    },
    {
      icon: "video",
      title: "Vidéos interactives",
      description: "Leçons vidéo de haute qualité avec exercices pratiques"
    },
    {
      icon: "trending-up",
      title: "Suivi de progression",
      description: "Visualisez votre avancement dans chaque cours"
    },
    {
      icon: "award",
      title: "Certificats",
      description: "Obtenez des certificats reconnus à la fin de chaque cours"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-emerald-700 tracking-wider">
            Safoua Academy
          </h1>
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-emerald-600 font-semibold">Accueil</Link>
            <Link to="/cours" className="text-gray-600 hover:text-emerald-600">Catalogue</Link>
            <Link to="/login" className="text-gray-600 hover:text-emerald-600">Connexion</Link>
          </nav>
          <div className="flex gap-3">
            <Link 
              to="/login"
              className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition font-semibold"
            >
              Se connecter
            </Link>
            <Link 
              to="/register"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Texte à gauche */}
      <section className="relative overflow-hidden" 
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/70 via-emerald-900/40 to-black/20"></div>
        <div className="relative py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              {/* Texte aligné à GAUCHE */}
              <h2 className="text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow mb-6">
                Apprenez l'Islam en ligne
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                Découvrez des cours de qualité en Tajwid, Arabe, Fiqh et Histoire islamique. 
                Apprenez à votre rythme avec des enseignants qualifiés.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/cours"
                  className="bg-emerald-500 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-emerald-600 transition shadow-lg shadow-emerald-600/20 w-fit"
                >
                  Explorer les cours
                </Link>
                <Link 
                  to="/register"
                  className="bg-white/10 text-white border border-white/25 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-white/15 transition w-fit"
                >
                  Commencer gratuitement
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Pourquoi choisir Safoua Academy ?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-100 mb-4 w-12 h-12 mx-auto">
                  <svg 
                    className="w-6 h-6 text-emerald-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {feature.icon === "zap" && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    )}
                    {feature.icon === "video" && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    )}
                    {feature.icon === "trending-up" && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    )}
                    {feature.icon === "award" && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2 text-center">{feature.title}</h4>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="bg-gray-800 text-white py-8 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>&copy; 2026 Safoua Academy. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
