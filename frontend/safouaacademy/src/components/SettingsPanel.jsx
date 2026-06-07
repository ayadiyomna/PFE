import React, { useState, useEffect } from 'react';
import {
  getAdminSettings,
  updateSettings,
  deleteLogo,
  deleteFavicon,
} from '../services/api';

const SettingsPanel = () => {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    platformeName: '',
    email: '',
    phone: '',
    socialLinks: {
      facebook: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      youtube: '',
    },
  });

  const normalizeSocialLinks = (links = {}) => ({
    facebook: links.facebook || '',
    linkedin: links.linkedin || '',
    twitter: links.twitter || '',
    instagram: links.instagram || '',
    youtube: links.youtube || '',
  });

  const [files, setFiles] = useState({
    logo: null,
    favicon: null,
  });

  const [previews, setPreviews] = useState({
    logo: null,
    favicon: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const result = await getAdminSettings();
    if (result.success && result.data) {
      setSettings(result.data);
      setFormData({
        platformeName: result.data.platformeName || '',
        email: result.data.email || '',
        phone: result.data.phone || '',
        socialLinks: normalizeSocialLinks(result.data.socialLinks),
      });
      if (result.data.logo) {
        setPreviews((prev) => ({ ...prev, logo: result.data.logo }));
      }
      if (result.data.favicon) {
        setPreviews((prev) => ({ ...prev, favicon: result.data.favicon }));
      }
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'Failed to load settings',
      });
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...normalizeSocialLinks(prev.socialLinks),
        [name]: value,
      },
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      const file = fileList[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: `${name} must be an image file` });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: `${name} file size must be less than 5MB` });
        return;
      }

      setFiles((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({
          ...prev,
          [name]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = async (imageType) => {
    if (!settings) return;

    setLoading(true);
    let result;
    if (imageType === 'logo') {
      result = await deleteLogo(settings._id);
    } else if (imageType === 'favicon') {
      result = await deleteFavicon(settings._id);
    }

    if (result.success) {
      setPreviews((prev) => ({
        ...prev,
        [imageType]: null,
      }));
      setFiles((prev) => ({
        ...prev,
        [imageType]: null,
      }));
      setSettings(result.data);
      setMessage({
        type: 'success',
        text: `${imageType} deleted successfully`,
      });
    } else {
      setMessage({
        type: 'error',
        text: result.error || `Failed to delete ${imageType}`,
      });
    }
    setLoading(false);
  };

  const handleReset = () => {
    if (settings) {
      loadSettings();
      setFiles({ logo: null, favicon: null });
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!settings) {
      setMessage({ type: 'error', text: 'Settings not loaded' });
      return;
    }

    // Validation
    if (!formData.platformeName.trim()) {
      setMessage({ type: 'error', text: 'Platform name is required' });
      return;
    }

    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('platformeName', formData.platformeName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('socialLinks', JSON.stringify(formData.socialLinks));

      if (files.logo) {
        submitData.append('logo', files.logo);
      }
      if (files.favicon) {
        submitData.append('favicon', files.favicon);
      }

      const result = await updateSettings(settings._id, submitData);

      if (result.success) {
        setSettings(result.data);
        setFiles({ logo: null, favicon: null });
        setMessage({
          type: 'success',
          text: result.message || 'Settings updated successfully',
        });
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to update settings',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Error updating settings',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Paramètres de Plateforme</h2>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de la Plateforme
          </label>
          <input
            type="text"
            name="platformeName"
            value={formData.platformeName}
            onChange={handleInputChange}
            placeholder="ex: Safoua Academy"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de Contact
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="contact@safouaacademy.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de Téléphone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+212 123 456 789"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
          <div className="space-y-2">
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {previews.logo && (
              <div className="flex items-center space-x-4">
                <img
                  src={previews.logo}
                  alt="Logo Preview"
                  className="h-20 w-20 object-contain border border-gray-200 rounded"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage('logo')}
                  disabled={loading}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Favicon Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
          <div className="space-y-2">
            <input
              type="file"
              name="favicon"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {previews.favicon && (
              <div className="flex items-center space-x-4">
                <img
                  src={previews.favicon}
                  alt="Favicon Preview"
                  className="h-20 w-20 object-contain border border-gray-200 rounded"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage('favicon')}
                  disabled={loading}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Liens Réseaux Sociaux</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(formData.socialLinks).map((social) => (
              <div key={social}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {social}
                </label>
                <input
                  type="url"
                  name={social}
                  value={formData.socialLinks[social] ?? ''}
                  onChange={handleSocialChange}
                  placeholder={`https://${social}.com/safouaacademy`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={loadSettings}
            disabled={loading}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50 font-medium"
          >
            Charger
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 font-medium"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
          >
            {loading ? 'Enregistrement...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPanel;
