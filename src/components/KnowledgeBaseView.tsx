import React, { useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, FileText, Layers, X, Brain } from 'lucide-react';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase';
import { useAuth } from '../hooks/useAuth';
import type { KnowledgeTopic, KnowledgeSection, KnowledgeTile } from '../hooks/useKnowledgeBase';

const KnowledgeBaseView: React.FC = () => {
  const { user } = useAuth();
  const {
    topics,
    loading,
    createTopic,
    updateTopic,
    deleteTopic,
    createSection,
    updateSection,
    deleteSection,
    createTile,
    updateTile,
    deleteTile,
  } = useKnowledgeBase(user?.id);

  const [selectedTopic, setSelectedTopic] = useState<KnowledgeTopic | null>(null);
  const [selectedSection, setSelectedSection] = useState<KnowledgeSection | null>(null);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showTileForm, setShowTileForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<KnowledgeTopic | null>(null);
  const [editingSection, setEditingSection] = useState<KnowledgeSection | null>(null);
  const [editingTile, setEditingTile] = useState<KnowledgeTile | null>(null);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  const [fullscreenContent, setFullscreenContent] = useState('');
  const [topicFormData, setTopicFormData] = useState({
    title: '',
    description: ''
  });
  const [sectionFormData, setSectionFormData] = useState({
    title: '',
    content: ''
  });
  const [tileFormData, setTileFormData] = useState({
    title: '',
    content: '',
  });

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTopic) {
        await updateTopic(editingTopic.id, {
          title: topicFormData.title,
          description: topicFormData.description
        });
      } else {
        await createTopic({
          title: topicFormData.title,
          description: topicFormData.description
        });
      }
      
      resetTopicForm();
    } catch (error) {
      console.error('Error saving topic:', error);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return;

    try {
      if (editingSection) {
        await updateSection(editingSection.id, {
          title: sectionFormData.title,
          content: sectionFormData.content
        });
        
        // Update the selected topic with the updated section
        const updatedSections = selectedTopic.sections.map(section =>
          section.id === editingSection.id
            ? { ...section, title: sectionFormData.title, content: sectionFormData.content }
            : section
        );
        setSelectedTopic({ ...selectedTopic, sections: updatedSections });
      } else {
        const newSection = await createSection(selectedTopic.id, {
          title: sectionFormData.title,
          content: sectionFormData.content
        });
        
        // Update the selected topic with the new section
        setSelectedTopic({
          ...selectedTopic,
          sections: [newSection, ...selectedTopic.sections]
        });
      }
      
      resetSectionForm();
    } catch (error) {
      console.error('Error saving section:', error);
    }
  };

  const handleCreateTile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;

    try {
      if (editingTile) {
        await updateTile(editingTile.id, {
          title: tileFormData.title,
          content: tileFormData.content
        });
        
        // Update the selected section with the updated tile
        const updatedTiles = selectedSection.tiles.map(tile =>
          tile.id === editingTile.id
            ? { ...tile, title: tileFormData.title, content: tileFormData.content }
            : tile
        );
        setSelectedSection({ ...selectedSection, tiles: updatedTiles });
        
        // Also update the selected topic
        if (selectedTopic) {
          const updatedSections = selectedTopic.sections.map(section =>
            section.id === selectedSection.id
              ? { ...section, tiles: updatedTiles }
              : section
          );
          setSelectedTopic({ ...selectedTopic, sections: updatedSections });
        }
      } else {
        const newTile = await createTile(selectedSection.id, {
          title: tileFormData.title,
          content: tileFormData.content
        });
        
        // Update the selected section with the new tile
        const updatedTiles = [newTile, ...selectedSection.tiles];
        setSelectedSection({ ...selectedSection, tiles: updatedTiles });
        
        // Also update the selected topic
        if (selectedTopic) {
          const updatedSections = selectedTopic.sections.map(section =>
            section.id === selectedSection.id
              ? { ...section, tiles: updatedTiles }
              : section
          );
          setSelectedTopic({ ...selectedTopic, sections: updatedSections });
        }
      }
      
      resetTileForm();
    } catch (error) {
      console.error('Error saving tile:', error);
    }
  };

  const resetTopicForm = () => {
    setTopicFormData({ title: '', description: '' });
    setEditingTopic(null);
    setShowTopicForm(false);
  };

  const resetSectionForm = () => {
    setSectionFormData({ title: '', content: '' });
    setEditingSection(null);
    setShowSectionForm(false);
  };

  const resetTileForm = () => {
    setTileFormData({ title: '', content: '' });
    setEditingTile(null);
    setShowTileForm(false);
  };

  const handleEditTopic = (topic: KnowledgeTopic) => {
    setEditingTopic(topic);
    setTopicFormData({
      title: topic.title,
      description: topic.description
    });
    setShowTopicForm(true);
  };

  const handleEditSection = (section: KnowledgeSection) => {
    setEditingSection(section);
    setSectionFormData({
      title: section.title,
      content: section.content
    });
    setShowSectionForm(true);
  };

  const handleEditTile = (tile: KnowledgeTile) => {
    setEditingTile(tile);
    setTileFormData({
      title: tile.title,
      content: tile.content,
    });
    setShowTileForm(true);
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (window.confirm('Are you sure you want to delete this topic? This will also delete all sections and tiles within it.')) {
      try {
        await deleteTopic(topicId);
        if (selectedTopic?.id === topicId) {
          setSelectedTopic(null);
          setSelectedSection(null);
        }
      } catch (error) {
        console.error('Error deleting topic:', error);
      }
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (window.confirm('Are you sure you want to delete this section? This will also delete all tiles within it.')) {
      try {
        await deleteSection(sectionId);
        if (selectedSection?.id === sectionId) {
          setSelectedSection(null);
        }
        
        // Update the selected topic
        if (selectedTopic) {
          const updatedSections = selectedTopic.sections.filter(section => section.id !== sectionId);
          setSelectedTopic({ ...selectedTopic, sections: updatedSections });
        }
      } catch (error) {
        console.error('Error deleting section:', error);
      }
    }
  };

  const handleDeleteTile = async (tileId: string) => {
    if (window.confirm('Are you sure you want to delete this tile?')) {
      try {
        await deleteTile(tileId);
        
        // Update the selected section
        if (selectedSection) {
          const updatedTiles = selectedSection.tiles.filter(tile => tile.id !== tileId);
          setSelectedSection({ ...selectedSection, tiles: updatedTiles });
          
          // Also update the selected topic
          if (selectedTopic) {
            const updatedSections = selectedTopic.sections.map(section =>
              section.id === selectedSection.id
                ? { ...section, tiles: updatedTiles }
                : section
            );
            setSelectedTopic({ ...selectedTopic, sections: updatedSections });
          }
        }
      } catch (error) {
        console.error('Error deleting tile:', error);
      }
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

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100/50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100/50 min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-900 to-blue-700 bg-clip-text text-transparent mb-1 sm:mb-2">
            Knowledge Base
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Organize your knowledge with topics, sections, and tiles</p>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center space-x-2 text-sm">
          <button
            onClick={() => {
              setSelectedTopic(null);
              setSelectedSection(null);
            }}
            className={`px-3 py-2 rounded-lg transition-colors ${
              !selectedTopic ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Topics
          </button>
          {selectedTopic && (
            <>
              <span className="text-gray-400">/</span>
              <button
                onClick={() => setSelectedSection(null)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  !selectedSection ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {selectedTopic.title}
              </button>
            </>
          )}
          {selectedSection && (
            <>
              <span className="text-gray-400">/</span>
              <span className="px-3 py-2 bg-green-100 text-green-700 rounded-lg">
                {selectedSection.title}
              </span>
            </>
          )}
        </div>

        {/* Topics View */}
        {!selectedTopic && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Knowledge Topics</h2>
              <button
                onClick={() => setShowTopicForm(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Topic</span>
              </button>
            </div>

            {/* Topic Form */}
            {showTopicForm && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {editingTopic ? 'Edit Topic' : 'Create New Topic'}
                </h3>
                <form onSubmit={handleCreateTopic} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Topic Title
                    </label>
                    <input
                      type="text"
                      value={topicFormData.title}
                      onChange={(e) => setTopicFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm"
                      placeholder="Enter topic title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={topicFormData.description}
                      onChange={(e) => setTopicFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm"
                      placeholder="Describe this topic..."
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={resetTopicForm}
                      className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-semibold transition-all duration-300 shadow-lg"
                    >
                      {editingTopic ? 'Update' : 'Create'} Topic
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Topics Grid */}
            {topics.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BookOpen className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No topics yet</h3>
                <p className="text-gray-600 mb-6">Create your first knowledge topic to get started</p>
                <button
                  onClick={() => setShowTopicForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg"
                >
                  Create Topic
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map(topic => (
                  <div
                    key={topic.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-500 group overflow-hidden hover:scale-105 cursor-pointer"
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors duration-300 mb-2">
                          {topic.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTopic(topic);
                          }}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTopic(topic.id);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                      <span>{topic.sections.length} sections</span>
                      <span>Created {formatDateTime(topic.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sections View */}
        {selectedTopic && !selectedSection && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Sections in "{selectedTopic.title}"</h2>
              <button
                onClick={() => setShowSectionForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
            </div>

            {/* Section Form */}
            {showSectionForm && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {editingSection ? 'Edit Section' : 'Create New Section'}
                </h3>
                <form onSubmit={handleCreateSection} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={sectionFormData.title}
                      onChange={(e) => setSectionFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm"
                      placeholder="Enter section title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={sectionFormData.content}
                      onChange={(e) => setSectionFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm"
                      placeholder="Write your section content here..."
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={resetSectionForm}
                      className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-300 shadow-lg"
                    >
                      {editingSection ? 'Update' : 'Create'} Section
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sections Grid */}
            {selectedTopic.sections.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Layers className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No sections yet</h3>
                <p className="text-gray-600 mb-6">Create your first section in this topic</p>
                <button
                  onClick={() => setShowSectionForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg"
                >
                  Create Section
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedTopic.sections.map(section => (
                  <div
                    key={section.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-500 group overflow-hidden hover:scale-105 cursor-pointer"
                    onClick={() => setSelectedSection(section)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-2">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSection(section);
                          }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(section.id);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                      <span>{section.tiles.length} tiles</span>
                      <span>Created {formatDateTime(section.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tiles View */}
        {selectedSection && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Tiles in "{selectedSection.title}"</h2>
              <button
                onClick={() => setShowTileForm(true)}
                className="bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tile</span>
              </button>
            </div>

            {/* Tile Form */}
            {showTileForm && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {editingTile ? 'Edit Tile' : 'Create New Tile'}
                </h3>
                <form onSubmit={handleCreateTile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tile Title
                    </label>
                    <input
                      type="text"
                      value={tileFormData.title}
                      onChange={(e) => setTileFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm"
                      placeholder="Enter tile title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload HTML File
                    </label>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept=".html,.htm"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const content = event.target?.result as string;
                                setTileFormData(prev => ({ ...prev, content }));
                              };
                              reader.readAsText(file);
                            }
                          }}
                          className="hidden"
                          id="html-file-upload"
                        />
                        <label htmlFor="html-file-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Upload HTML File</p>
                              <p className="text-xs text-gray-500">Select .html or .htm file to upload</p>
                            </div>
                          </div>
                        </label>
                      </div>
                      
                      {tileFormData.content && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-green-700">
                              ✨ HTML file loaded successfully!
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            File size: {(tileFormData.content.length / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={resetTileForm}
                      className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-300 shadow-lg"
                    >
                      {editingTile ? 'Update' : 'Create'} Tile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tiles Grid */}
            {selectedSection.tiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FileText className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tiles yet</h3>
                <p className="text-gray-600 mb-6">Create your first tile in this section</p>
                <button
                  onClick={() => setShowTileForm(true)}
                  className="bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg"
                >
                  Create Tile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedSection.tiles.map(tile => (
                  <div
                    key={tile.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-500 group overflow-hidden hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors duration-300 mb-2">
                          {tile.title}
                        </h4>
                        <div className="w-6 h-0.5 bg-gradient-to-r from-green-500 to-purple-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center space-x-1 ml-3">
                        <button
                          onClick={() => handleEditTile(tile)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTile(tile.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-3 text-sm hover:text-gray-900 transition-colors">
                        {tile.content.includes('<!DOCTYPE html') ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">HTML</span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Interactive Webpage</p>
                                <p className="text-xs text-gray-500">Click to view fullscreen</p>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium text-gray-700">Live HTML Content</span>
                                </div>
                                <span className="text-xs text-blue-600 font-medium">
                                  {(tile.content.length / 1024).toFixed(1)} KB
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          tile.content
                        )}
                      </p>
                      {tile.content.length > 150 && (
                        <p className="text-purple-600 text-xs mt-2 font-medium hover:text-purple-700 transition-colors">
                          Click to explore...
                        </p>
                      )}
                    </div>
                    
                    {/* HTML Content Action Button */}
                    {tile.content.includes('<!DOCTYPE html') && (
                      <div className="mb-4">
                        <button
                          onClick={() => {
                            setFullscreenContent(tile.content);
                            setShowFullscreenPreview(true);
                          }}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-3"
                        >
                          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                          </div>
                          <span>View Interactive Webpage</span>
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                      <span>Created {formatDateTime(tile.createdAt)}</span>
                      <span>{tile.content.length} chars</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Fullscreen Preview Modal */}
      {showFullscreenPreview && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
          <div className="relative w-full max-w-[100%] h-[100%] bg-white rounded-xl overflow-hidden shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowFullscreenPreview(false)}
              className="absolute top-4 right-4 z-10 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Fullscreen Content */}
            <iframe
              srcDoc={fullscreenContent}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="HTML Preview Fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseView;