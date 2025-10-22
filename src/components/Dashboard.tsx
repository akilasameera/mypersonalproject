import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import ProjectGrid from './ProjectGrid';
import ProjectDetail from './ProjectDetail';
import ConsolidatedCalendar from './ConsolidatedCalendar';
import AllTodosView from './AllTodosView';
import SettingsPage from './SettingsPage';
import AttachmentsView from './AttachmentsView';
import UniversalSearch from './UniversalSearch';
import GanttChartView from './GanttChartView';
import DashboardReports from './DashboardReports';
import KnowledgeBaseView from './KnowledgeBaseView';
import { User, Project } from '../types';
import MyOfficeView from './MyOfficeView';
import { useAuth } from '../hooks/useAuth';

interface DashboardProps {
  user: User;
  projects: Project[];
  projectActions: any;
  loading: boolean;
  isAdmin: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  projects,
  projectActions,
  loading,
  isAdmin
}) => {
  const { signOut } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeView, setActiveView] = useState<'projects' | 'calendar' | 'todos' | 'attachments' | 'settings' | 'myoffice' | 'gantt' | 'dashboard' | 'knowledge'>('projects');
  const [showUniversalSearch, setShowUniversalSearch] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const handleSignOut = async () => {
    console.log('handleSignOut called');
    try {
      const result = await signOut();
      console.log('Sign out result:', result);
    } catch (error) {
      console.error('Error signing out:', error);
      // Show user-friendly error message
      alert('Failed to sign out. Please try again.');
    }
  };
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setActiveView('projects');
    setShowMobileSidebar(false); // Close mobile sidebar when selecting project
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    projectActions.updateProjectData(updatedProject.id, updatedProject);
    setSelectedProject(updatedProject);
  };

  const handleBackToGrid = () => {
    setSelectedProject(null);
    setActiveView('projects');
  };

  const handleCalendarSelect = () => {
    setActiveView('calendar');
    setSelectedProject(null);
    setShowMobileSidebar(false);
  };

  const handleMyOfficeSelect = () => {
    setActiveView('myoffice');
    setSelectedProject(null);
    setShowMobileSidebar(false);
  };

  const handleProjectsSelect = () => {
    setActiveView('projects');
    setSelectedProject(null);
    setShowMobileSidebar(false);
  };

  const handleViewChange = (view: 'projects' | 'calendar' | 'todos' | 'attachments' | 'settings' | 'myoffice' | 'gantt' | 'dashboard' | 'knowledge') => {
    setActiveView(view);
    setSelectedProject(null);
    setShowMobileSidebar(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row relative">
      {/* Visit Task Calendar Button */}
      <a
        href="https://flow.mypersonalprojects.com"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-4 right-4 z-50 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 group"
      >
        <span>Visit Task Calendar</span>
        <svg
          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </a>

      {/* Universal Search */}
      {showUniversalSearch && (
        <UniversalSearch
          projects={projects}
          onClose={() => setShowUniversalSearch(false)}
          onProjectSelect={handleProjectSelect}
        />
      )}
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm p-4 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110 touch-manipulation"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Project Manager</h1>
          </div>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 overflow-y-auto">
            <div className="p-4 border-b border-gray-200/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 touch-manipulation"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="pb-20">
              <Sidebar
                user={user}
                projects={projects}
                onProjectSelect={handleProjectSelect}
                onProjectsSelect={handleProjectsSelect}
                onCalendarSelect={handleCalendarSelect}
                onViewChange={handleViewChange}
                onMyOfficeSelect={handleMyOfficeSelect}
                onUniversalSearch={() => {
                  setShowUniversalSearch(true);
                  setShowMobileSidebar(false);
                }}
                onSignOut={handleSignOut}
                activeView={activeView}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-40">
        <Sidebar
          user={user}
          projects={projects}
          onProjectSelect={handleProjectSelect}
          onProjectsSelect={handleProjectsSelect}
          onCalendarSelect={handleCalendarSelect}
          onViewChange={handleViewChange}
          onMyOfficeSelect={handleMyOfficeSelect}
          onUniversalSearch={() => setShowUniversalSearch(true)}
          onSignOut={handleSignOut}
          activeView={activeView}
        />
      </div>
      
      <div className="flex-1 min-h-0 lg:ml-64">
        {selectedProject ? (
          <ProjectDetail
            project={selectedProject}
            onProjectUpdate={handleProjectUpdate}
            onBack={handleBackToGrid}
          />
        ) : activeView === 'myoffice' ? (
          <MyOfficeView
            projects={projects.filter(p => p.category === 'mine')}
            projectActions={projectActions}
            onProjectSelect={handleProjectSelect}
          />
        ) : activeView === 'calendar' ? (
          <ConsolidatedCalendar
            projects={projects}
            onProjectSelect={handleProjectSelect}
          />
        ) : activeView === 'todos' ? (
          <AllTodosView
            projects={projects}
            onProjectSelect={handleProjectSelect}
          />
        ) : activeView === 'attachments' ? (
          <AttachmentsView
            projects={projects}
            onProjectSelect={handleProjectSelect}
          />
        ) : activeView === 'settings' ? (
          <SettingsPage user={user} />
        ) : activeView === 'gantt' ? (
          <GanttChartView
            projects={projects}
            onProjectSelect={handleProjectSelect}
            onRefreshProjects={projectActions.refetch}
          />
        ) : activeView === 'dashboard' ? (
          <DashboardReports
            projects={projects}
            user={user}
            onProjectSelect={handleProjectSelect}
          />
        ) : activeView === 'knowledge' ? (
          <KnowledgeBaseView />
        ) : (
          <ProjectGrid
            projects={projects.filter(p => p.category === 'main')}
            projectActions={projectActions}
            onProjectSelect={handleProjectSelect}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;