import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Project } from '../types';

interface ProjectModalProps {
  project: Project | null;
  onSave: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  defaultCategory?: 'main' | 'mine';
}

const colors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onSave, onClose, defaultCategory = 'main' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: colors[0],
    dueDate: '',
    category: defaultCategory as 'main' | 'mine',
    status: 'active' as 'active' | 'hold' | 'completed'
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        color: project.color,
        dueDate: project.dueDate || '',
        category: project.category || 'main',
        status: project.status || 'active'
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave({
        title: formData.title.trim(),
        description: formData.description.trim(),
        color: formData.color,
        dueDate: formData.dueDate || undefined,
        category: formData.category,
        status: formData.status,
        notes: project?.notes || [],
        links: project?.links || [],
        todos: project?.todos || []
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-white/20 my-4 sm:my-8">
        <div className="flex items-center justify-between p-8 border-b border-gray-100/50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Project Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm text-base"
              placeholder="Enter project title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none bg-gray-50/50 focus:bg-white shadow-sm text-base"
              placeholder="Describe your project"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Due Date (Optional)
            </label>
            <div className="relative">
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm cursor-pointer text-base"
                placeholder="Select due date"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Project Type
            </label>
            <div className="flex flex-col sm:flex-row bg-gray-100/80 rounded-xl p-1 space-y-1 sm:space-y-0">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: 'main' }))}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 touch-manipulation ${
                  formData.category === 'main' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600'
                }`}
              >
                Main Projects
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: 'mine' }))}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 touch-manipulation ${
                  formData.category === 'mine' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600'
                }`}
              >
                My Office
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Project Status
            </label>
            <div className="flex bg-gray-100/80 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 touch-manipulation ${
                  formData.status === 'active' ? 'bg-white text-green-600 shadow-md' : 'text-gray-600'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'hold' }))}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 touch-manipulation ${
                  formData.status === 'hold' ? 'bg-white text-yellow-600 shadow-md' : 'text-gray-600'
                }`}
              >
                Hold
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'completed' }))}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 touch-manipulation ${
                  formData.status === 'completed' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Project Color
            </label>
            <div className="grid grid-cols-5 gap-3 sm:gap-4">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl transition-all duration-300 shadow-lg touch-manipulation ${
                    formData.color === color 
                      ? 'ring-4 ring-blue-300 scale-110 shadow-xl' 
                      : 'hover:scale-105 hover:shadow-xl'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md touch-manipulation text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 touch-manipulation text-base"
            >
              {project ? 'Update' : 'Create'} Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;