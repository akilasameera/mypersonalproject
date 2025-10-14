import React, { useState, useEffect } from 'react';
import { FileText, Save, Loader, Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { vpsClient } from '../../lib/vpsClient';
import FileViewer from '../FileViewer';

interface BRDTabProps {
  projectId: string;
  isMasterProject: boolean;
}

const BRDTab: React.FC<BRDTabProps> = ({ projectId, isMasterProject }) => {
  const [brdContent, setBrdContent] = useState('');
  const [configurationId, setConfigurationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessProfileUrl, setBusinessProfileUrl] = useState<string | null>(null);
  const [businessMapUrl, setBusinessMapUrl] = useState<string | null>(null);
  const [businessProfileName, setBusinessProfileName] = useState<string | null>(null);
  const [businessMapName, setBusinessMapName] = useState<string | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingMap, setUploadingMap] = useState(false);

  useEffect(() => {
    loadBRD();
  }, [projectId]);

  const loadBRD = async () => {
    try {
      setLoading(true);
      const data = await vpsClient.configurations.getByProject(projectId);

      if (data) {
        setConfigurationId(data.id);
        setBrdContent(data.brd_content || '');
        setBusinessProfileUrl(data.business_profile_url || null);
        setBusinessMapUrl(data.business_map_url || null);
        setBusinessProfileName(data.business_profile_name || null);
        setBusinessMapName(data.business_map_name || null);
      } else {
        const result = await vpsClient.configurations.upsert({
          project_id: projectId,
          is_master: isMasterProject,
          brd_content: ''
        });
        setConfigurationId(result.id);
      }
    } catch (error) {
      console.error('Error loading BRD:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!configurationId) return;

    try {
      setSaving(true);
      await vpsClient.configurations.update(projectId, {
        brd_content: brdContent
      });
    } catch (error) {
      console.error('Error saving BRD:', error);
      alert('Failed to save BRD content');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'profile' | 'map') => {
    if (!configurationId) return;

    try {
      if (type === 'profile') {
        setUploadingProfile(true);
      } else {
        setUploadingMap(true);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `brd-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      const updateData = type === 'profile'
        ? { business_profile_url: publicUrl, business_profile_name: file.name }
        : { business_map_url: publicUrl, business_map_name: file.name };

      await vpsClient.configurations.update(projectId, updateData);

      if (type === 'profile') {
        setBusinessProfileUrl(publicUrl);
        setBusinessProfileName(file.name);
      } else {
        setBusinessMapUrl(publicUrl);
        setBusinessMapName(file.name);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      if (type === 'profile') {
        setUploadingProfile(false);
      } else {
        setUploadingMap(false);
      }
    }
  };

  const handleRemoveFile = async (type: 'profile' | 'map') => {
    if (!configurationId) return;

    try {
      const updateData = type === 'profile'
        ? { business_profile_url: null, business_profile_name: null }
        : { business_map_url: null, business_map_name: null };

      await vpsClient.configurations.update(projectId, updateData);

      if (type === 'profile') {
        setBusinessProfileUrl(null);
        setBusinessProfileName(null);
      } else {
        setBusinessMapUrl(null);
        setBusinessMapName(null);
      }
    } catch (error) {
      console.error('Error removing file:', error);
      alert('Failed to remove file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Business Requirements Document</h2>
                <p className="text-sm text-gray-600">
                  {isMasterProject ? 'Master template for all projects' : 'Project-specific requirements'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Business Profile (PowerPoint or PDF)</label>
            {businessProfileUrl ? (
              <div className="relative group">
                <FileViewer
                  url={businessProfileUrl}
                  fileName={businessProfileName || 'Business Profile'}
                  fileType={businessProfileName?.endsWith('.pptx') || businessProfileName?.endsWith('.ppt') ? 'PowerPoint Presentation' : 'PDF Document'}
                />
                <button
                  onClick={() => handleRemoveFile('profile')}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all bg-gray-50">
                {uploadingProfile ? (
                  <Loader className="w-16 h-16 animate-spin text-blue-500" />
                ) : (
                  <>
                    <Upload className="w-20 h-20 text-gray-400 mb-4" />
                    <span className="text-lg font-medium text-gray-600">Click to upload Business Profile</span>
                    <span className="text-base text-gray-500 mt-2">PowerPoint or PDF up to 50MB</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".ppt,.pptx,.pdf,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'profile');
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Business MAP (PowerPoint or PDF)</label>
            {businessMapUrl ? (
              <div className="relative group">
                <FileViewer
                  url={businessMapUrl}
                  fileName={businessMapName || 'Business MAP'}
                  fileType={businessMapName?.endsWith('.pptx') || businessMapName?.endsWith('.ppt') ? 'PowerPoint Presentation' : 'PDF Document'}
                />
                <button
                  onClick={() => handleRemoveFile('map')}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all bg-gray-50">
                {uploadingMap ? (
                  <Loader className="w-16 h-16 animate-spin text-blue-500" />
                ) : (
                  <>
                    <Upload className="w-20 h-20 text-gray-400 mb-4" />
                    <span className="text-lg font-medium text-gray-600">Click to upload Business MAP</span>
                    <span className="text-base text-gray-500 mt-2">PowerPoint or PDF up to 50MB</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".ppt,.pptx,.pdf,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'map');
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">BRD Content</label>
            <textarea
              value={brdContent}
              onChange={(e) => setBrdContent(e.target.value)}
              placeholder="Enter your Business Requirements Document here..."
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BRDTab;
