import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";

function LessonPlayer() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [completed, setCompleted] = useState(false);

  // Données simulées
  const lessonData = {
    id: lessonId || "l1",
    title: "Introduction aux règles de prononciation",
    courseTitle: "Tajwid Avancé",
    instructor: "Cheikh Ahmed Al-Mansouri",
    duration: "15:30",
    videoUrl: "https://example.com/video.mp4",
    description: "Dans cette leçon, nous aborderons les bases fondamentales de la prononciation arabe et les règles essentielles du Tajwid pour débutants.",
    resources: [
      { id: 1, title: "PDF de la leçon", type: "pdf", url: "#" },
      { id: 2, title: "Exercices pratiques", type: "doc", url: "#" },
      { id: 3, title: "Audio de répétition", type: "mp3", url: "#" }
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

  const courseLessons = [
    { id: "l0", title: "Introduction au cours", duration: "10:20", completed: true },
    { id: "l1", title: "Introduction aux règles de prononciation", duration: "15:30", completed: false, active: true },
    { id: "l2", title: "Les lettres solaires et lunaires", duration: "12:45", completed: false },
    { id: "l3", title: "Les règles de prolongation", duration: "18:20", completed: false },
    { id: "l4", title: "Exercices pratiques", duration: "25:15", completed: false }
  ];

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
    const rates = [0.5, 1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
      setPlaybackRate(nextRate);
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
    const progress = JSON.parse(localStorage.getItem('lessonProgress') || '{}');
    progress[lessonId] = !completed;
    localStorage.setItem('lessonProgress', JSON.stringify(progress));
  };

  const handlePrevious = () => {
    if (lessonData.prevLesson) {
      navigate(`/cours/${courseId}/lecon/${lessonData.prevLesson.id}`);
    }
  };

  const handleNext = () => {
    if (lessonData.nextLesson) {
      navigate(`/cours/${courseId}/lecon/${lessonData.nextLesson.id}`);
    }
  };

  const handleLessonSelect = (lessonId) => {
    navigate(`/cours/${courseId}/lecon/${lessonId}`);
  };

  const handleSaveNotes = () => {
    localStorage.setItem(`notes-${lessonId}`, notes);
    setShowNotes(false);
    alert("Notes sauvegardées !");
  };

  useEffect(() => {
    // Charger les notes sauvegardées
    const savedNotes = localStorage.getItem(`notes-${lessonId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
    
    // Vérifier si la leçon est terminée
    const progress = JSON.parse(localStorage.getItem('lessonProgress') || '{}');
    setCompleted(!!progress[lessonId]);
  }, [lessonId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              ←
            </button>
            <div>
              <Link to="/" className="text-xl font-extrabold text-emerald-700 tracking-wider">
                Safoua Academy
              </Link>
              <p className="text-sm text-gray-500">{lessonData.courseTitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowNotes(!showNotes)}
              className="p-2 hover:bg-gray-100 rounded-lg transition relative"
              title="Notes"
            >
              📝
              {showNotes && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-600 rounded-full"></span>
              )}
            </button>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm">
              Mon compte
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Lecteur vidéo */}
            <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video relative group">
              <video
                ref={videoRef}
                className="w-full h-full"
                src={lessonData.videoUrl}
                poster="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <button 
                    onClick={togglePlay}
                    className="w-20 h-20 bg-emerald-600/90 hover:bg-emerald-700 rounded-full flex items-center justify-center transition"
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
                    <button onClick={togglePlay} className="text-white hover:text-emerald-300">
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

                    <button onClick={changePlaybackRate} className="text-white hover:text-emerald-300 text-sm font-semibold px-2 py-1 rounded bg-white/20">
                      {playbackRate}x
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={handlePrevious} className="text-white hover:text-emerald-300">
                      ⏮️
                    </button>
                    <button onClick={handleNext} className="text-white hover:text-emerald-300">
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
                  <h1 className="text-2xl font-bold text-gray-900">{lessonData.title}</h1>
                  <p className="text-gray-600 mt-1">{lessonData.courseTitle} • {lessonData.instructor}</p>
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
              <p className="text-gray-700">{lessonData.description}</p>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  ← <span className="hidden sm:inline">{lessonData.prevLesson?.title || 'Précédent'}</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  <span className="hidden sm:inline">{lessonData.nextLesson?.title || 'Suivant'}</span> →
                </button>
              </div>
            </div>

            {/* Ressources */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ressources</h2>
              <div className="space-y-2">
                {lessonData.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                  >
                    <span className="text-emerald-600">
                      {resource.type === 'pdf' ? '📄' : resource.type === 'mp3' ? '🎵' : '📎'}
                    </span>
                    <span className="flex-1 text-gray-700">{resource.title}</span>
                    <span className="text-gray-400">⬇️</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>📋</span>
                Contenu du cours
              </h2>
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {courseLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson.id)}
                    className={`w-full text-left p-3 rounded-lg transition flex items-start gap-3 ${
                      lesson.active 
                        ? 'bg-emerald-50 border border-emerald-200' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      lesson.completed 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : lesson.active
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {lesson.completed ? "✓" : lesson.id.slice(-1)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        lesson.active ? 'text-emerald-700' : 'text-gray-700'
                      }`}>
                        {lesson.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{lesson.duration}</p>
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
                  rows="6"
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

            {/* Infos */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">À propos de ce cours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Instructeur</span>
                  <span className="text-gray-700 font-medium">{lessonData.instructor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Durée totale</span>
                  <span className="text-gray-700 font-medium">4h 30min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Leçons</span>
                  <span className="text-gray-700 font-medium">{courseLessons.length}</span>
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