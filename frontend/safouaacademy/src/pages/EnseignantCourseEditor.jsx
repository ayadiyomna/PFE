import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Video, 
  FileText, 
  Award,
  ArrowLeft,
  Clock,
  FolderOpen,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';

function EnseignantCourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Quiz management state
  const [quizzes, setQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    titre: '',
    module: '',
    questions: [
      { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
    ],
    duration: 15,
    difficulty: 'Intermédiaire',
    points: 100,
    passingScore: 70
  });
  // Restore activeModules state
  const [activeModules, setActiveModules] = useState([]);

  // Fetch quizzes for this course
  const loadQuizzes = async () => {
    setQuizLoading(true);
    try {
      const res = await api.get(`/quiz/cours/${id}`);
      setQuizzes(res.data?.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const loadCourse = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/cours/${id}`);
      setCourse(res.data?.data || null);
      setError('');
    } catch (err) {
      console.error('Erreur chargement cours:', err);
      setError(err.message || 'Erreur lors du chargement du cours');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadCourse();
    loadQuizzes();
  }, [id]);
  // Quiz form handlers
  const handleQuizInputChange = (e) => {
    setNewQuiz({ ...newQuiz, [e.target.name]: e.target.value });
  };

  const handleQuizQuestionChange = (idx, field, value) => {
    const updatedQuestions = newQuiz.questions.map((q, i) =>
      i === idx ? { ...q, [field]: value } : q
    );
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const handleQuizOptionChange = (qIdx, optIdx, value) => {
    const updatedQuestions = newQuiz.questions.map((q, i) => {
      if (i !== qIdx) return q;
      const newOptions = q.options.map((opt, j) => (j === optIdx ? value : opt));
      return { ...q, options: newOptions };
    });
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const addQuizQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [
        ...newQuiz.questions,
        { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
      ]
    });
  };

  const removeQuizQuestion = (idx) => {
    setNewQuiz({
      ...newQuiz,
      questions: newQuiz.questions.filter((_, i) => i !== idx)
    });
  };

  const handleAddQuiz = async () => {
    if (!newQuiz.titre.trim() || newQuiz.questions.some(q => !q.question.trim() || q.options.some(opt => !opt.trim()))) {
      setError('Veuillez remplir tous les champs du quiz');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      const payload = { ...newQuiz, cours: id };
      const res = await api.post('/quiz', payload);
      if (res.data?.success) {
        setShowQuizForm(false);
        setNewQuiz({
          titre: '',
          module: '',
          questions: [
            { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
          ],
          duration: 15,
          difficulty: 'Intermédiaire',
          points: 100,
          passingScore: 70
        });
        await loadQuizzes();
        showSuccess('Quiz ajouté avec succès');
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout du quiz');
      setTimeout(() => setError(''), 3000);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const toggleModule = (moduleId) => {
    setActiveModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) {
      setError('Veuillez entrer un titre pour le module');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      const res = await api.post(`/cours/${id}/modules`, { titre: newModuleTitle });
      if (res.data?.success) {
        setNewModuleTitle('');
        await loadCourse();
        showSuccess('Module ajouté avec succès');
      }
    } catch (err) {
      console.error('Erreur ajout module:', err);
      setError(err.message || 'Erreur lors de l\'ajout du module');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditModule = async (moduleId) => {
    const newTitle = window.prompt('Nouveau titre du module :');
    if (!newTitle) return;
    try {
      const res = await api.put(`/cours/${id}/modules/${moduleId}`, { titre: newTitle });
      if (res.data?.success) {
        await loadCourse();
        showSuccess('Module mis à jour avec succès');
      }
    } catch (err) {
      console.error('Erreur mise à jour module:', err);
      setError(err.message || 'Erreur lors de la mise à jour');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('⚠️ Attention : La suppression du module entraînera la suppression de toutes ses leçons. Êtes-vous sûr ?')) return;
    try {
      const res = await api.delete(`/cours/${id}/modules/${moduleId}`);
      if (res.data?.success) {
        await loadCourse();
        showSuccess('Module supprimé avec succès');
      }
    } catch (err) {
      console.error('Erreur suppression module:', err);
      setError(err.message || 'Erreur lors de la suppression');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim() || !selectedModuleForLesson) {
      setError('Veuillez entrer un titre pour la leçon');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      const res = await api.post(`/cours/${id}/modules/${selectedModuleForLesson}/lecons`, { titre: newLessonTitle });
      if (res.data?.success) {
        setNewLessonTitle('');
        setSelectedModuleForLesson(null);
        await loadCourse();
        showSuccess('Leçon ajoutée avec succès');
      }
    } catch (err) {
      console.error('Erreur ajout leçon:', err);
      setError(err.message || 'Erreur lors de l\'ajout de la leçon');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditLesson = async (moduleId, lessonId) => {
    try {
      const lesson = course.modules.find(m => m._id === moduleId)?.lecons.find(l => l._id === lessonId);
      if (!lesson) return alert('Leçon introuvable');
      const newTitle = window.prompt('Titre de la leçon :', lesson.titre || '');
      if (newTitle === null) return;
      const newVideo = window.prompt('URL de la vidéo (laisser vide pour conserver) :', lesson.videoUrl || '');
      const newDesc = window.prompt('Description (laisser vide pour conserver) :', lesson.description || '');
      const payload = { titre: newTitle };
      if (newVideo !== null) payload.videoUrl = newVideo;
      if (newDesc !== null) payload.description = newDesc;
      const res = await api.put(`/cours/${id}/modules/${moduleId}/lecons/${lessonId}`, payload);
      if (res.data?.success) {
        await loadCourse();
        showSuccess('Leçon mise à jour avec succès');
      }
    } catch (err) {
      console.error('Erreur mise à jour leçon:', err);
      setError(err.message || 'Erreur lors de la mise à jour');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm('Supprimer cette leçon ?')) return;
    try {
      const res = await api.delete(`/cours/${id}/modules/${moduleId}/lecons/${lessonId}`);
      if (res.data?.success) {
        await loadCourse();
        showSuccess('Leçon supprimée avec succès');
      }
    } catch (err) {
      console.error('Erreur suppression leçon:', err);
      setError(err.message || 'Erreur lors de la suppression');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUploadResource = async (moduleId, lessonId, type = 'pdf') => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await api.post('/cours/upload/resource', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = uploadRes.data?.data?.url;
      if (!url) throw new Error('URL manquante');
      const createRes = await api.post(`/cours/${id}/modules/${moduleId}/lecons/${lessonId}/ressources`, {
        titre: file.name,
        type,
        url,
        taille: `${Math.round(file.size / 1024)} KB`
      });
      if (createRes.data?.success) {
        setFile(null);
        await loadCourse();
        showSuccess('Ressource ajoutée avec succès');
      }
    } catch (err) {
      console.error('Erreur upload ressource:', err);
      setError(err.message || 'Erreur lors de l\'upload');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (moduleId, lessonId, resourceId) => {
    if (!window.confirm('Supprimer cette ressource ?')) return;
    try {
      const res = await api.delete(`/cours/${id}/modules/${moduleId}/lecons/${lessonId}/ressources/${resourceId}`);
      if (res.data?.success) {
        await loadCourse();
        showSuccess('Ressource supprimée avec succès');
      }
    } catch (err) {
      console.error('Erreur suppression ressource:', err);
      setError(err.message || 'Erreur lors de la suppression');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cours introuvable</h2>
          <p className="text-gray-600 mb-4">Le cours que vous recherchez n'existe pas ou a été supprimé.</p>
          <button onClick={() => navigate('/enseignant')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-28 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/enseignant')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.titre}</h1>
                <p className="text-sm text-gray-500 mt-1">Éditeur de cours • Gérez le contenu de votre formation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Quiz Management Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Quiz du cours
            </h2>
            <button
              onClick={() => setShowQuizForm(v => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un quiz
            </button>
          </div>
          <div className="p-6">
            {quizLoading ? (
              <div className="text-gray-500">Chargement des quiz...</div>
            ) : quizzes.length === 0 ? (
              <div className="text-gray-500">Aucun quiz pour ce cours.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {quizzes.map(qz => (
                  <li key={qz._id} className="py-3">
                    <div className="font-semibold text-gray-900">{qz.titre}</div>
                    <div className="text-xs text-gray-500 mt-1">{qz.questions.length} questions • {qz.duration} min • Difficulté: {qz.difficulty}</div>
                  </li>
                ))}
              </ul>
            )}

            {showQuizForm && (
              <div className="mt-6 border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">Créer un nouveau quiz</h3>
                <div className="space-y-4">
                  <input
                    name="titre"
                    value={newQuiz.titre}
                    onChange={handleQuizInputChange}
                    placeholder="Titre du quiz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    name="module"
                    value={newQuiz.module}
                    onChange={handleQuizInputChange}
                    placeholder="Module (optionnel)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="duration"
                      type="number"
                      min={1}
                      value={newQuiz.duration}
                      onChange={handleQuizInputChange}
                      placeholder="Durée (min)"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                      name="difficulty"
                      value={newQuiz.difficulty}
                      onChange={handleQuizInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <input
                    name="points"
                    type="number"
                    min={1}
                    value={newQuiz.points}
                    onChange={handleQuizInputChange}
                    placeholder="Points"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    name="passingScore"
                    type="number"
                    min={1}
                    max={100}
                    value={newQuiz.passingScore}
                    onChange={handleQuizInputChange}
                    placeholder="Score de passage (%)"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Questions</h4>
                    {newQuiz.questions.map((q, idx) => (
                      <div key={idx} className="mb-4 p-3 border rounded-lg bg-gray-50">
                        <input
                          value={q.question}
                          onChange={e => handleQuizQuestionChange(idx, 'question', e.target.value)}
                          placeholder={`Question ${idx + 1}`}
                          className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                        />
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {q.options.map((opt, oIdx) => (
                            <input
                              key={oIdx}
                              value={opt}
                              onChange={e => handleQuizOptionChange(idx, oIdx, e.target.value)}
                              placeholder={`Option ${oIdx + 1}`}
                              className="px-2 py-1 border border-gray-300 rounded"
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <label className="text-xs text-gray-600">Bonne réponse:</label>
                          <select
                            value={q.correctAnswer}
                            onChange={e => handleQuizQuestionChange(idx, 'correctAnswer', Number(e.target.value))}
                            className="px-2 py-1 border border-gray-300 rounded"
                          >
                            {q.options.map((_, oIdx) => (
                              <option key={oIdx} value={oIdx}>{`Option ${oIdx + 1}`}</option>
                            ))}
                          </select>
                        </div>
                        <input
                          value={q.explanation}
                          onChange={e => handleQuizQuestionChange(idx, 'explanation', e.target.value)}
                          placeholder="Explication (optionnel)"
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                        <div className="flex justify-end mt-2">
                          {newQuiz.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuizQuestion(idx)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Supprimer la question
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addQuizQuestion}
                      className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
                    >
                      Ajouter une question
                    </button>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleAddQuiz}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Enregistrer le quiz
                    </button>
                    <button
                      onClick={() => setShowQuizForm(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modules Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-emerald-600" />
              Modules du cours
            </h2>
            <p className="text-sm text-gray-500 mt-1">Organisez votre cours en modules et leçons</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {course.modules?.map((mod, index) => (
                <div key={mod._id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                    <div 
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => toggleModule(mod._id)}
                    >
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-emerald-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{mod.titre}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Durée: {mod.duree || 0} min
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {mod.lecons?.length || 0} leçons
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditModule(mod._id)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Modifier le module"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteModule(mod._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer le module"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {activeModules.includes(mod._id) && (
                    <div className="p-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Video className="w-4 h-4 text-emerald-600" />
                        Leçons
                      </h4>
                      <div className="space-y-3">
                        {mod.lecons?.map((l) => (
                          <div key={l._id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{l.titre}</div>
                                {l.description && (
                                  <p className="text-sm text-gray-600 mt-1">{l.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  {l.duree > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {l.duree} min
                                    </span>
                                  )}
                                  {l.videoUrl && (
                                    <a 
                                      href={l.videoUrl} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                    >
                                      <Video className="w-3 h-3" />
                                      Voir la vidéo
                                    </a>
                                  )}
                                </div>
                                
                                {l.ressources && l.ressources.length > 0 && (
                                  <div className="mt-3">
                                    <div className="text-xs font-medium text-gray-700 mb-2">Ressources :</div>
                                    <div className="flex flex-wrap gap-2">
                                      {l.ressources.map(r => (
                                        <div key={r._id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-sm">
                                          <FileText className="w-3 h-3 text-gray-600" />
                                          <a 
                                            href={r.url} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="text-emerald-600 hover:text-emerald-700"
                                          >
                                            {r.titre}
                                          </a>
                                          <span className="text-xs text-gray-400">({r.taille})</span>
                                          <button 
                                            onClick={() => handleDeleteResource(mod._id, l._id, r._id)}
                                            className="text-red-600 hover:text-red-700 ml-1"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleEditLesson(mod._id, l._id)}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                  title="Modifier la leçon"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteLesson(mod._id, l._id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Supprimer la leçon"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <input
                                type="file"
                                onChange={handleFileChange}
                                className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                              />
                              <button 
                                onClick={() => handleUploadResource(mod._id, l._id)}
                                disabled={!file || uploading}
                                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                {uploading ? (
                                  <Loader className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Upload className="w-3 h-3" />
                                )}
                                Ajouter ressource
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add Lesson Form */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input 
                            placeholder="Titre de la nouvelle leçon" 
                            value={selectedModuleForLesson === mod._id ? newLessonTitle : ''} 
                            onChange={(e) => { 
                              setSelectedModuleForLesson(mod._id); 
                              setNewLessonTitle(e.target.value); 
                            }} 
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                          <button 
                            onClick={() => { 
                              setSelectedModuleForLesson(mod._id); 
                              handleAddLesson(); 
                            }} 
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Ajouter une leçon
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Module Form */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  placeholder="Titre du nouveau module" 
                  value={newModuleTitle} 
                  onChange={(e) => setNewModuleTitle(e.target.value)} 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddModule()}
                />
                <button 
                  onClick={handleAddModule} 
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un module
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Info Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <Upload className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ajouter des ressources</h3>
              <p className="text-sm text-gray-700 mb-1">
                Pour ajouter une ressource (PDF, document, etc.) à une leçon :
              </p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Sélectionnez un fichier en utilisant le champ de fichier sous la leçon concernée</li>
                <li>Cliquez sur "Ajouter ressource" pour l'attacher à la leçon</li>
                <li>Les ressources seront visibles par les étudiants dans la section correspondante</li>
              </ol>
              <p className="text-xs text-gray-500 mt-3">
                Formats supportés : PDF, DOC, DOCX, PPT, PPTX, images (PNG, JPG, JPEG)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnseignantCourseEditor;