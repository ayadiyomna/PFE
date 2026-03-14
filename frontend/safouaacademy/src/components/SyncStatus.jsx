import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import coursService from '../services/coursService';
import api from '../services/api';

function SyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'offline'
  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    // Vérifier l'état de la connexion
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('🔄 Connexion rétablie');
      checkBackendHealth();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
      toast.warning('📴 Mode hors-ligne activé');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier le nombre de données hors-ligne
    const checkOfflineData = () => {
      const offline = JSON.parse(localStorage.getItem('offlineCourses') || '[]');
      setOfflineCount(offline.length);
    };

    checkOfflineData();
    const interval = setInterval(checkOfflineData, 5000);

    // Vérifier la santé du backend
    checkBackendHealth();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const checkBackendHealth = async () => {
    try {
      await api.get('/health');
      setSyncStatus('synced');
      
      // Si on a des données hors-ligne, proposer la synchronisation
      const offline = JSON.parse(localStorage.getItem('offlineCourses') || '[]');
      if (offline.length > 0) {
        setSyncStatus('pending');
      }
    } catch {
      setSyncStatus('offline');
    }
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    const result = await coursService.syncOfflineData();
    
    if (result.success) {
      toast.success(result.message);
      setSyncStatus('synced');
      setOfflineCount(0);
    } else {
      toast.error(result.message);
      setSyncStatus('offline');
    }
  };

  if (syncStatus === 'synced' && isOnline && offlineCount === 0) {
    return null; // Tout est synchronisé
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {syncStatus === 'offline' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📴</span>
            <div>
              <p className="font-bold">Mode hors-ligne</p>
              <p className="text-sm">Les données sont sauvegardées localement</p>
            </div>
          </div>
        </div>
      )}

      {syncStatus === 'pending' && (
        <button
          onClick={handleSync}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transition"
        >
          <span className="text-xl">🔄</span>
          <div className="text-left">
            <p className="font-bold">Synchronisation</p>
            <p className="text-sm">{offlineCount} élément(s) en attente</p>
          </div>
        </button>
      )}

      {syncStatus === 'syncing' && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <p>Synchronisation en cours...</p>
        </div>
      )}
    </div>
  );
}

export default SyncStatus;