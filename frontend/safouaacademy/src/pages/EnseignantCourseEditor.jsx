import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function EnseignantCourseEditor() {
  const { id } = useParams(); // course id
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/cours/${id}`);
      setCourse(res.data?.data || null);
    } catch (err) {
      console.error('Erreur chargement cours:', err);
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      const res = await api.post(`/cours/${id}/modules`, { titre: newModuleTitle });
      if (res.data?.success) {
        setNewModuleTitle('');
        await loadCourse();
      }
    } catch (err) {
      console.error('Erreur ajout module:', err);
      setError(err.message || 'Erreur');
    }
  };

  const handleEditModule = async (moduleId) => {
    const newTitle = window.prompt('Nouveau titre du module :');
    if (!newTitle) return;
    try {
      const res = await api.put(`/cours/${id}/modules/${moduleId}`, { titre: newTitle });
      if (res.data?.success) {
        await loadCourse();
        alert('Module mis à jour');
      }
    } catch (err) {
      console.error('Erreur mise à jour module:', err);
      alert(err.message || 'Erreur');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Confirmer la suppression du module et toutes ses leçons ?')) return;
    try {
      const res = await api.delete(`/cours/${id}/modules/${moduleId}`);
      if (res.data?.success) {
        await loadCourse();
        alert('Module supprimé');
      }
    } catch (err) {
      console.error('Erreur suppression module:', err);
      alert(err.message || 'Erreur');
    }
  };

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim() || !selectedModuleForLesson) return;
    try {
      const res = await api.post(`/cours/${id}/modules/${selectedModuleForLesson}/lecons`, { titre: newLessonTitle });
      if (res.data?.success) {
        setNewLessonTitle('');
        setSelectedModuleForLesson(null);
        await loadCourse();
      }
    } catch (err) {
      console.error('Erreur ajout leçon:', err);
      setError(err.message || 'Erreur');
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
        alert('Leçon mise à jour');
      }
    } catch (err) {
      console.error('Erreur mise à jour leçon:', err);
      alert(err.message || 'Erreur');
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm('Supprimer cette leçon ?')) return;
    try {
      const res = await api.delete(`/cours/${id}/modules/${moduleId}/lecons/${lessonId}`);
      if (res.data?.success) {
        await loadCourse();
        alert('Leçon supprimée');
      }
    } catch (err) {
      console.error('Erreur suppression leçon:', err);
      alert(err.message || 'Erreur');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUploadResource = async (moduleId, lessonId, type = 'pdf') => {
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      // upload file to server
      const uploadRes = await api.post('/cours/upload/resource', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = uploadRes.data?.data?.url;
      if (!url) throw new Error('URL manquante');
      // create resource entry
      const createRes = await api.post(`/cours/${id}/modules/${moduleId}/lecons/${lessonId}/ressources`, {
        titre: file.name,
        type,
        url,
        taille: `${Math.round(file.size / 1024)} KB`
      });
      if (createRes.data?.success) {
        setFile(null);
        await loadCourse();
      }
    } catch (err) {
      console.error('Erreur upload ressource:', err);
      setError(err.message || 'Erreur');
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
        alert('Ressource supprimée');
      }
    } catch (err) {
      console.error('Erreur suppression ressource:', err);
      alert(err.message || 'Erreur');
    }
  };

  const handleGenerateCertificat = async () => {
    try {
      const res = await api.post(`/certificats/generer/${id}`);
      if (res.data?.success) {
        alert(res.data.message || 'Certificat généré');
      } else {
        alert(res.data?.message || 'Erreur génération');
      }
    } catch (err) {
      console.error('Erreur générer certificat:', err);
      alert(err.message || 'Erreur');
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!course) return <div className="p-8">Cours introuvable</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Éditeur du cours — {course.titre}</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/enseignant')} className="px-4 py-2 bg-gray-100 rounded">Retour</button>
          <button onClick={handleGenerateCertificat} className="px-4 py-2 bg-emerald-600 text-white rounded">Générer certificat</button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <section className="mb-8">
        <h2 className="font-semibold mb-2">Modules</h2>
        <div className="space-y-4">
          {course.modules?.map((mod) => (
            <div key={mod._id} className="p-4 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{mod.titre}</h3>
                  <p className="text-sm text-slate-500">Durée: {mod.duree || 0} min • Leçons: {mod.lecons?.length || 0}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditModule(mod._id)} className="px-3 py-1 bg-yellow-400 text-white rounded text-sm">Modifier</button>
                  <button onClick={() => handleDeleteModule(mod._id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Supprimer</button>
                </div>
              </div>

              <div className="mt-3">
                <h4 className="font-medium">Leçons</h4>
                <ul className="mt-2 space-y-2">
                  {mod.lecons?.map((l) => (
                    <li key={l._id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="font-semibold">{l.titre}</div>
                        <div className="text-xs text-slate-500">Durée: {l.duree || 0} min</div>
                        {l.description && <div className="text-sm text-slate-600 mt-1">{l.description}</div>}
                        {l.ressources && l.ressources.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-slate-500 font-medium">Ressources :</div>
                            <ul className="mt-1 space-y-1">
                              {l.ressources.map(r => (
                                <li key={r._id} className="flex items-center gap-3">
                                  <a href={r.url} target="_blank" rel="noreferrer" className="text-emerald-600 text-sm">{r.titre || r.url}</a>
                                  <span className="text-xs text-slate-400">({r.type} • {r.taille})</span>
                                  <button onClick={() => handleDeleteResource(mod._id, l._id, r._id)} className="text-red-600 text-xs ml-2">Supprimer</button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <a className="text-sm text-emerald-600" href={l.videoUrl || '#'} target="_blank" rel="noreferrer">Voir vidéo</a>
                        <button onClick={() => handleEditLesson(mod._id, l._id)} className="px-3 py-1 bg-yellow-400 text-white rounded text-sm">Modifier</button>
                        <button onClick={() => handleDeleteLesson(mod._id, l._id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Supprimer</button>
                        <button onClick={() => handleUploadResource(mod._id, l._id)} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm" disabled={!file || uploading}>{uploading ? 'Upload...' : 'Ajouter ressource'}</button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex gap-2">
                  <input placeholder="Titre nouvelle leçon" value={selectedModuleForLesson === mod._id ? newLessonTitle : ''} onChange={(e) => { setSelectedModuleForLesson(mod._id); setNewLessonTitle(e.target.value); }} className="px-3 py-2 border rounded" />
                  <button onClick={() => { setSelectedModuleForLesson(mod._id); handleAddLesson(); }} className="px-3 py-2 bg-emerald-600 text-white rounded">Ajouter leçon</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input placeholder="Titre nouveau module" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} className="px-3 py-2 border rounded" />
          <button onClick={handleAddModule} className="px-3 py-2 bg-emerald-600 text-white rounded">Ajouter module</button>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Upload ressource (sélectionnez un fichier avant de cliquer sur "Ajouter ressource")</h2>
        <div className="flex items-center gap-3">
          <input type="file" onChange={handleFileChange} />
          <div className="text-sm text-slate-500">Fichier sélectionné: {file?.name || 'aucun'}</div>
        </div>
      </section>

    </div>
  );
}

export default EnseignantCourseEditor;
