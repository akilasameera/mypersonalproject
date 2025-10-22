import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, CheckSquare, FileText, Link } from 'lucide-react';
import { Project } from '../types';
import ProjectModal from './ProjectModal';

interface ProjectGridProps {
  projects: Project[];
  projectActions: any;
  onProjectSelect: (project: Project) => void;
  isAdmin?: boolean;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  projectActions,
  onProjectSelect,
  isAdmin = false
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hold' | 'completed'>('all');

  // Separate master project and other projects
  const masterProject = projects.find(p => p.title.toLowerCase() === 'master');
  const otherProjects = projects.filter(p => p.title.toLowerCase() !== 'master');

  // Filter non-master projects based on status
  const filteredOtherProjects = otherProjects.filter(project => {
    if (statusFilter === 'all') return true;
    return project.status === statusFilter;
  });

  // Always include master project if it exists and matches filter
  const filteredProjects = [
    ...(masterProject && (statusFilter === 'all' || masterProject.status === statusFilter) ? [masterProject] : []),
    ...filteredOtherProjects
  ];

  const getStatusCounts = () => {
    return {
      all: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      hold: projects.filter(p => p.status === 'hold').length,
      completed: projects.filter(p => p.status === 'completed').length,
    };
  };

  const statusCounts = getStatusCounts();

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDeleteProject = (project: Project) => {
    // Prevent deletion of Master project
    if (project.title.toLowerCase() === 'master') {
      alert('The Master project cannot be deleted as it serves as the template for all projects.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this project?')) {
      projectActions.deleteProject(project.id);
    }
  };

  const handleProjectSave = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'links' | 'todos'>) => {
    try {
      const projectWithCategory = {
        ...projectData,
        category: 'main' as const
      };
      
      if (editingProject) {
        await projectActions.updateProject(editingProject.id, projectWithCategory);
      } else {
        await projectActions.createProject(projectWithCategory);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const getProjectStats = (project: Project) => {
    const totalTodos = project.todos.length;
    const completedTodos = project.todos.filter(todo => todo.completed).length;
    const totalNotes = project.notes.length;
    const totalLinks = project.links.length;
    
    return { totalTodos, completedTodos, totalNotes, totalLinks };
  };

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100/50 min-h-screen relative overflow-hidden pb-20 sm:pb-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 to-purple-700 bg-clip-text text-transparent">Projects</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-base sm:text-lg">Manage your main projects and workflows</p>
        </div>
        
        {/* Status Filter and Create Button */}
        <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-4">
          <div className="flex bg-gray-100/80 rounded-xl p-1 gap-1 overflow-x-auto backdrop-blur-xl border border-white/20 shadow-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap touch-manipulation ${
                statusFilter === 'all' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap touch-manipulation ${
                statusFilter === 'active' ? 'bg-white text-green-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active ({statusCounts.active})
            </button>
            <button
              onClick={() => setStatusFilter('hold')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap touch-manipulation ${
                statusFilter === 'hold' ? 'bg-white text-yellow-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hold ({statusCounts.hold})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap touch-manipulation ${
                statusFilter === 'completed' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({statusCounts.completed})
            </button>
          </div>

          {/* Desktop Create Button */}
          <button
            onClick={handleCreateProject}
            className="hidden lg:flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl items-center space-x-2 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Visit Task Calendar Button - Centered */}
      <div className="flex justify-center mb-8">
        <a
          href="https://flow.mypersonalprojects.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-2xl inline-flex items-center space-x-3 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105 group"
        >
          <span className="text-lg">Visit Task Calendar</span>
          <svg
            className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={handleCreateProject}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-30 touch-manipulation"
      >
        <Plus className="w-6 h-6" />
      </button>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 sm:py-20">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-purple-200 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <CheckSquare className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
            {statusFilter === 'all' ? 'No projects yet' : `No ${statusFilter} projects`}
          </h3>
          <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg px-4">
            {statusFilter === 'all' ? 'Create your first project to get started' : `No projects with ${statusFilter} status found`}
          </p>
          <button
            onClick={handleCreateProject}
            className="w-full max-w-xs sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 text-base"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProjects.map(project => {
            const stats = getProjectStats(project);
            const completionRate = stats.totalTodos > 0 
              ? Math.round((stats.completedTodos / stats.totalTodos) * 100) 
              : 0;

            const isMasterProject = project.title.toLowerCase() === 'master';

            return (
              <div
                key={project.id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border hover:shadow-2xl transition-all duration-500 group overflow-hidden hover:scale-105 ${
                  isMasterProject
                    ? 'border-blue-400 ring-2 ring-blue-200 shadow-blue-100'
                    : 'border-white/50 hover:border-white/80'
                }`}
              >
                <div
                  className="h-1.5 w-full bg-gradient-to-r"
                  style={{ backgroundColor: project.color }}
                />
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                        {isMasterProject && (
                          <>
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                              Master Template
                            </span>
                            {isAdmin && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                Admin Only
                              </span>
                            )}
                          </>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          project.status === 'active' ? 'bg-green-100 text-green-700' :
                          project.status === 'hold' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                    {/* Current Status in top-right */}
                    <div className="ml-3 flex flex-col items-end space-y-2">
                      {(() => {
                        const currentStatusNote = project.notes.find(note => note.statusCategory === 'current_status');
                        if (currentStatusNote) {
                          return (
                            <div className="text-right">
                              <div className="text-xs font-medium text-gray-500 mb-1">Current Status:</div>
                              <div className="text-xs font-semibold text-gray-700 truncate max-w-32">
                                {currentStatusNote.title}
                              </div>
                              {(currentStatusNote.statusType || currentStatusNote.status_type) && (
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                                  (currentStatusNote.statusType || currentStatusNote.status_type) === 'me' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {(currentStatusNote.statusType || currentStatusNote.status_type) === 'me' ? 'Me' : 'Customer'}
                                </span>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                      {(project.dueDate || project.due_date) && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                          <Calendar className="w-3 h-3" />
                          <span>Due {new Date((project.dueDate || project.due_date) + 'T12:00:00').toLocaleDateString('en-US')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {stats.totalTodos > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span className="font-semibold">{completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r"
                          style={{ 
                            background: `linear-gradient(90deg, ${project.color}, ${project.color}dd)`,
                            width: `${completionRate}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-1">
                        <CheckSquare className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-base font-bold text-gray-900">{stats.totalTodos}</p>
                      <p className="text-xs text-gray-500 font-medium">Tasks</p>
                    </div>
                    <div className="text-center">
                      <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-1">
                        <FileText className="w-4 h-4 text-purple-500" />
                      </div>
                      <p className="text-base font-bold text-gray-900">{stats.totalNotes}</p>
                      <p className="text-xs text-gray-500 font-medium">Notes</p>
                    </div>
                    <div className="text-center">
                      <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-1">
                        <Link className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-base font-bold text-gray-900">{stats.totalLinks}</p>
                      <p className="text-xs text-gray-500 font-medium">Links</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onProjectSelect(project)}
                      className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-lg text-sm transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {project.title.toLowerCase() !== 'master' && (
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editingProject}
          onSave={handleProjectSave}
          onClose={() => setShowModal(false)}
          defaultCategory="main"
        />
      )}
    </div>
  );
};

export default ProjectGrid;