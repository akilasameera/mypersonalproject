import React, { useState } from 'react';
import { Plus, Edit, Trash2, ExternalLink, Eye, EyeOff, User, Lock } from 'lucide-react';
import { Link } from '../../types';
import { useLinks } from '../../hooks/useLinks';

interface LinksTabProps {
  projectId: string;
  links: Link[];
  onUpdateLinks: (links: Link[]) => void;
}

const LinksTab: React.FC<LinksTabProps> = ({ projectId, links, onUpdateLinks }) => {
  const { createLink, updateLink, deleteLink, loading } = useLinks(projectId);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    username: '',
    password: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLink) {
        // Update existing link
        const updatedLink = await updateLink(editingLink.id, {
          title: formData.title,
          url: formData.url,
          username: formData.username || undefined,
          password: formData.password || undefined,
          description: formData.description || undefined,
        });
        
        const updatedLinks = links.map(link => 
          link.id === editingLink.id ? updatedLink : link
        );
        onUpdateLinks(updatedLinks);
      } else {
        // Create new link
        const newLink = await createLink({
          title: formData.title,
          url: formData.url,
          username: formData.username || undefined,
          password: formData.password || undefined,
          description: formData.description || undefined,
        });
        
        onUpdateLinks([newLink, ...links]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving link:', error);
    }
  };

  const handleEdit = (link: Link) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      username: link.username || '',
      password: link.password || '',
      description: link.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (linkId: string) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await deleteLink(linkId);
        const updatedLinks = links.filter(link => link.id !== linkId);
        onUpdateLinks(updatedLinks);
      } catch (error) {
        console.error('Error deleting link:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', url: '', username: '', password: '', description: '' });
    setEditingLink(null);
    setShowForm(false);
  };

  const togglePasswordVisibility = (linkId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [linkId]: !prev[linkId]
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Links</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Link</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingLink ? 'Edit Link' : 'Add New Link'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Link title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password (Optional)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Brief description"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Saving...' : editingLink ? 'Update' : 'Add'} Link
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links List */}
      {links.length === 0 ? (
        <div className="text-center py-12">
          <ExternalLink className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No links yet</h3>
          <p className="text-gray-500 mb-4">Add your first link to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Add Link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {links.map(link => (
            <div key={link.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg truncate">{link.title}</h3>
                  <p className="text-blue-600 text-sm truncate">{getDomain(link.url)}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleEdit(link)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {link.description && (
                <p className="text-gray-600 mb-4">{link.description}</p>
              )}

              {(link.username || link.password) && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Credentials</h4>
                  {link.username && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Username:</span>
                      <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                        {link.username}
                      </span>
                    </div>
                  )}
                  {link.password && (
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Password:</span>
                      <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                        {showPasswords[link.id] ? link.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(link.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPasswords[link.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                Added {formatDateTime(link.created_at || link.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinksTab;