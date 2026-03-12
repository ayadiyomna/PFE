import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function LessonPlayer() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [completed, setCompleted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState("");

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    loadLessonData();
    loadProgress();
    loadNotes();
    loadBookmarks();
  }, [courseId, lessonId]);

  useEffect(() => {
    // Sauvegarder la progression toutes les 30 secondes
    const interval = setInterval(() => {
      if (isPlaying && videoRef.current) {
        saveProgress();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isPlaying, lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      try {
        // Charger le cours et la leçon depuis l'API
        const courseResponse = await axios.get(`${API_BASE}/cours/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(courseResponse.data);
        
        const lessonResponse = await axios.get(`${API_BASE}/cours/${courseId}/lecons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLesson(lessonResponse.data);
        
        const lessonsResponse = await axios.get(`${API_BASE}/cours/${courseId}/lecons`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLessons(lessonsResponse.data);
        
        toast.success("📚 Leçon chargée");
      } catch (apiError) {
        console.log("API non disponible, chargement des données locales");
        
        // Données simulées
        const mockCourse = {
          id: parseInt(courseId) || 1,
          titre: "Tajwid Avancé",
          instructor: "Cheikh Ahmed Al-Mansouri"
        };
        setCourse(mockCourse);

        const mockLesson = {
          id: lessonId || "l1",
          title: "Introduction aux règles de prononciation",
          description: "Dans cette leçon, nous aborderons les bases fondamentales de la prononciation arabe et les règles essentielles du Tajwid pour débutants.",
          videoUrl: "https://example.com/video.mp4",
          duration: 930, // 15:30 en secondes
          resources: [
            { id: 1, title: "PDF de la leçon", type: "pdf", url: "#", size: "2.5 MB" },
            { id: 2, title: "Exercices pratiques", type: "doc", url: "#", size: "1.8 MB" },
            { id: 3, title: "Audio de répétition", type: "mp3", url: "#", size: "5.2 MB" }
          ],
          nextLesson: {
            id: "l2",
            title: "Les lettres solaires et lunaires"
          },
          prevLesson: {
            id: "l0",
            title: "Introduction au cours"
          }
        };
        setLesson(mockLesson);

        const mockLessons = [
          { id: "l0", title: "Introduction au cours", duration: "10:20", completed: true, progress: 100 },
          { id: "l1", title: "Introduction aux règles de prononciation", duration: "15:30", completed: false, progress: 45, active: true },
          { id: "l2", title: "Les lettres solaires et lunaires", duration: "12:45", completed: false, progress: 0 },
          { id: "l3", title: "Les règles de prolongation", duration: "18:20", completed: false, progress: 0 },
          { id: "l4", title: "Exercices pratiques", duration: "25:15", completed: false, progress: 0 }
        ];
        setLessons(mockLessons);
      }
    } catch (error) {
      console.error("Erreur chargement leçon:", error);
      toast.error("❌ Erreur lors du chargement de la leçon");
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = () => {
    const progress = JSON.parse(localStorage.getItem(`lesson-progress-${courseId}`) || '{}');
    setCompleted(!!progress[lessonId]);
    
    // Restaurer la position de la vidéo
    const position = progress[`${lessonId}-position`];
    if (position && videoRef.current) {
      videoRef.current.currentTime = position;
    }
  };

  const loadNotes = () => {
    const savedNotes = localStorage.getItem(`notes-${courseId}-${lessonId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  };

  const loadBookmarks = () => {
    const saved = JSON.parse(localStorage.getItem(`bookmarks-${courseId}-${lessonId}`) || '[]');
    setBookmarks(saved);
  };

  const saveProgress = () => {
    if (!videoRef.current) return;

    const progress = JSON.parse(localStorage.getItem(`lesson-progress-${courseId}`) || '{}');
    progress[lessonId] = completed;
    progress[`${lessonId}-position`] = videoRef.current.currentTime;
    progress[`${lessonId}-last-watched`] = new Date().toISOString();
    
    localStorage.setItem(`lesson-progress-${courseId}`, JSON.stringify(progress));
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
      setPlaybackRate(nextRate);
      toast.info(`⏩ Vitesse: ${nextRate}x`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleComplete = () => {
    setCompleted(!completed);
    
    // Mettre à jour la progression
    const progress = JSON.parse(localStorage.getItem(`lesson-progress-${courseId}`) || '{}');
    progress[lessonId] = !completed;
    localStorage.setItem(`lesson-progress-${courseId}`, JSON.stringify(progress));
    
    if (!completed) {
      toast.success("✅ Leçon marquée comme terminée !");
      
      // Vérifier si toutes les leçons sont terminées
      const allLessons = lessons.map(l => l.id);
      const completedLessons = Object.keys(progress).filter(key => 
        allLessons.includes(key) && progress[key] === true
      );
      
      if (completedLessons.length === allLessons.length) {
        toast.success("🎉 Félicitations ! Vous avez terminé toutes les leçons !");
        
        // Proposer de passer le quiz final
        setTimeout(() => {
          if (window.confirm("Voulez-vous passer le quiz final maintenant ?")) {
            navigate(`/quiz/cours/${courseId}/final`);
          }
        }, 1000);
      }
    }
  };

  const handlePrevious = () => {
    if (lesson?.prevLesson) {
      navigate(`/cours/${courseId}/lecon/${lesson.prevLesson.id}`);
    }
  };

  const handleNext = () => {
    if (lesson?.nextLesson) {
      navigate(`/cours/${courseId}/lecon/${lesson.nextLesson.id}`);
    }
  };

  const handleLessonSelect = (selectedLessonId) => {
    if (selectedLessonId !== lessonId) {
      saveProgress(); // Sauvegarder avant de changer
      navigate(`/cours/${courseId}/lecon/${selectedLessonId}`);
    }
  };

  const handleSaveNotes = () => {
    localStorage.setItem(`notes-${courseId}-${lessonId}`, notes);
    setShowNotes(false);
    toast.success("📝 Notes sauvegardées !");
  };

  const handleAddBookmark = () => {
    if (!videoRef.current) return;
    
    const newBookmark = {
      id: Date.now(),
      time: videoRef.current.currentTime,
      formattedTime: formatTime(videoRef.current.currentTime),
      note: bookmarkNote,
      createdAt: new Date().toISOString()
    };
    
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    localStorage.setItem(`bookmarks-${courseId}-${lessonId}`, JSON.stringify(updated));
    
    setShowBookmarkModal(false);
    setBookmarkNote("");
    toast.success("🔖 Marque-page ajouté !");
  };

  const handleJumpToBookmark = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      toast.info(`⏩ Position: ${formatTime(time)}`);
    }
  };

  const handleDeleteBookmark = (bookmarkId) => {
    const updated = bookmarks.filter(b => b.id !== bookmarkId);
    setBookmarks(updated);
    localStorage.setItem(`bookmarks-${courseId}-${lessonId}`, JSON.stringify(updated));
    toast.info("🔖 Marque-page supprimé");
  };

  const handleDownloadResource = (resource) => {
    toast.info(`📥 Téléchargement de ${resource.title}...`);
    // Simulation de téléchargement
    setTimeout(() => {
      toast.success(`✅ ${resource.title} téléchargé !`);
    }, 1000);
  };

  const handleSpeedChange = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      toast.info(`⏩ Vitesse: ${rate}x`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🔍</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Leçon non trouvée</h2>
          <button
            onClick={() => navigate(`/cours/${courseId}`)}
            className="text-emerald-600 hover:underline"
          >
            Retour au cours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      <header className="bg-white shadow-sm border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Retour"
            >
              ←
            </button>
            <div>
              <Link to="/" className="text-xl font-extrabold text-emerald-700 tracking-wider">
                Safoua Academy
              </Link>
              <p className="text-sm text-gray-500">{course.titre}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowNotes(!showNotes)}
              className={`p-2 rounded-lg transition relative ${
                showNotes ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100'
              }`}
              title="Notes"
            >
              📝
              {notes && <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-600 rounded-full"></span>}
            </button>
            <button 
              onClick={() => setShowBookmarkModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Ajouter un marque-page"
            >
              🔖
            </button>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm">
              Mon compte
            </button>
          </div>
        </div>
      </header>

      {/* Modal ajout marque-page */}
      {showBookmarkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ajouter un marque-page</h3>
            <p className="text-sm text-gray-600 mb-2">Position: {formatTime(currentTime)}</p>
            <textarea
              placeholder="Note (optionnelle)..."
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows="3"
            ></textarea>
            <div className="flex gap-3">
              <button
                onClick={handleAddBookmark}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
              >
                Ajouter
              </button>
              <button
                onClick={() => setShowBookmarkModal(false)}
                className="flex-1 border border-gray-200 py-2 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Lecteur vidéo */}
            <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video relative group">
              <video
                ref={videoRef}
                className="w-full h-full"
                src={lesson.videoUrl}
                poster={course.image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop"}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  if (!completed) {
                    toast.success("🎉 Leçon terminée !");
                  }
                }}
              />
              
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <button 
                    onClick={togglePlay}
                    className="w-20 h-20 bg-emerald-600/90 hover:bg-emerald-700 rounded-full flex items-center justify-center transition transform hover:scale-110"
                  >
                    <span className="text-white text-4xl">▶</span>
                  </button>
                </div>
              )}

              {/* Contrôles vidéo */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition">
                <div className="flex items-center gap-2 text-white text-sm mb-2">
                  <span>{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer"
                  />
                  <span>{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={togglePlay} className="text-white hover:text-emerald-300 text-xl">
                      {isPlaying ? "⏸️" : "▶️"}
                    </button>

                    <div className="flex items-center gap-1">
                      <button onClick={toggleMute} className="text-white hover:text-emerald-300">
                        {isMuted ? "🔇" : "🔊"}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <button 
                      onClick={changePlaybackRate} 
                      className="text-white hover:text-emerald-300 text-sm font-semibold px-2 py-1 rounded bg-white/20"
                    >
                      {playbackRate}x
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrevious} 
                      disabled={!lesson?.prevLesson}
                      className={`text-white hover:text-emerald-300 ${!lesson?.prevLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      ⏮️
                    </button>
                    <button 
                      onClick={handleNext} 
                      disabled={!lesson?.nextLesson}
                      className={`text-white hover:text-emerald-300 ${!lesson?.nextLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      ⏭️
                    </button>
                    <button onClick={toggleFullscreen} className="text-white hover:text-emerald-300">
                      ⛶
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Titre et description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
                  <p className="text-gray-600 mt-1">{course.titre} • {course.instructor}</p>
                </div>
                <button
                  onClick={handleComplete}
                  className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition ${
                    completed 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{completed ? "✓ Terminé" : "○ Marquer comme terminé"}</span>
                </button>
              </div>
              <p className="text-gray-700">{lesson.description}</p>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handlePrevious}
                  disabled={!lesson?.prevLesson}
                  className={`flex items-center gap-2 font-semibold ${
                    lesson?.prevLesson 
                      ? 'text-emerald-600 hover:text-emerald-700' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  ← <span className="hidden sm:inline">{lesson?.prevLesson?.title || 'Précédent'}</span>
                </button>
                <button
                  onClick={handleNext}
                  disabled={!lesson?.nextLesson}
                  className={`flex items-center gap-2 font-semibold ${
                    lesson?.nextLesson 
                      ? 'text-emerald-600 hover:text-emerald-700' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="hidden sm:inline">{lesson?.nextLesson?.title || 'Suivant'}</span> →
                </button>
              </div>
            </div>

            {/* Ressources */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ressources</h2>
              <div className="space-y-2">
                {lesson.resources?.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                  >
                    <span className="text-emerald-600 text-xl">
                      {resource.type === 'pdf' ? '📄' : resource.type === 'mp3' ? '🎵' : '📎'}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-700 font-medium">{resource.title}</p>
                      <p className="text-xs text-gray-500">{resource.size}</p>
                    </div>
                    <button
                      onClick={() => handleDownloadResource(resource)}
                      className="text-gray-400 hover:text-emerald-600 transition"
                      title="Télécharger"
                    >
                      ⬇️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Marque-pages */}
            {bookmarks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">🔖 Marque-pages</h2>
                <div className="space-y-2">
                  {bookmarks.sort((a, b) => a.time - b.time).map((bookmark) => (
                    <div key={bookmark.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <button
                        onClick={() => handleJumpToBookmark(bookmark.time)}
                        className="flex items-center gap-2 text-left flex-1"
                      >
                        <span className="text-emerald-600 font-mono">{bookmark.formattedTime}</span>
                        <span className="text-gray-600 text-sm">{bookmark.note || 'Sans note'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        className="text-red-400 hover:text-red-600 transition"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="lg:col-span-1 space-y-4">
            {/* Liste des leçons */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>📋</span>
                Contenu du cours
              </h2>
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {lessons.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleLessonSelect(l.id)}
                    className={`w-full text-left p-3 rounded-lg transition flex items-start gap-3 ${
                      l.id === lessonId 
                        ? 'bg-emerald-50 border border-emerald-200' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs ${
                      l.completed 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : l.id === lessonId
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {l.completed ? "✓" : l.id.slice(-1)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        l.id === lessonId ? 'text-emerald-700' : 'text-gray-700'
                      }`}>
                        {l.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{l.duration}</p>
                      {l.progress > 0 && l.progress < 100 && (
                        <div className="mt-1 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600" 
                            style={{ width: `${l.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            {showNotes && (
              <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-emerald-600">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📝</span>
                  Mes notes
                </h3>
                <textarea
                  placeholder="Prenez des notes pendant la leçon..."
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  rows="8"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setShowNotes(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {/* Vitesse de lecture rapide */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Vitesse de lecture</h3>
              <div className="flex gap-2">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleSpeedChange(rate)}
                    className={`px-2 py-1 rounded text-sm font-semibold transition ${
                      playbackRate === rate
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Infos */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">À propos</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Instructeur</span>
                  <span className="text-gray-700 font-medium">{course.instructor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Leçons</span>
                  <span className="text-gray-700 font-medium">{lessons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Progression</span>
                  <span className="text-gray-700 font-medium">
                    {Math.round((currentTime / duration) * 100) || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LessonPlayer;