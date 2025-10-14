import React, { useState } from 'react';
import { 
  User, 
  LogOut, 
  FolderOpen, 
  CheckSquare, 
  Calendar,
  Settings,
  Bell,
  Paperclip,
  Search,
  Briefcase,
  BarChart3,
  Home,
  BookOpen
} from 'lucide-react';
import { User as UserType, Project, Todo } from '../types';

interface SidebarProps {
  user: UserType;
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onProjectsSelect: () => void;
  onCalendarSelect: () => void;
  onViewChange: (view: 'projects' | 'calendar' | 'todos' | 'attachments' | 'settings' | 'gantt' | 'dashboard' | 'knowledge') => void;
  onMyOfficeSelect: () => void;
  onUniversalSearch: () => void;
  onSignOut: () => void; // This prop needs to be passed down from a parent component that has access to the sign-out function
  activeView: 'projects' | 'calendar' | 'todos' | 'attachments' | 'settings' | 'gantt' | 'dashboard' | 'knowledge';
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  projects,
  onProjectSelect,
  onProjectsSelect,
  onCalendarSelect,
  onMyOfficeSelect,
  onViewChange,
  onUniversalSearch,
  onSignOut, // Now a destructured prop
  activeView
}) => {
  // Get all todos from all projects
  const allTodos = projects.flatMap(project => 
    project.todos.map(todo => ({
      ...todo,
      projectTitle: project.title,
      projectColor: project.color
    }))
  );

  const pendingTodos = allTodos.filter(todo => !todo.completed);

  // Filter projects by category
  const mainProjects = projects.filter(project => project.category === 'main');
  const myOfficeProjects = projects.filter(project => project.category === 'mine');

  const handleProjectsClick = () => {
    onProjectsSelect();
  };

  const handleCalendarClick = () => {
    onCalendarSelect();
  };

  const handleMyOfficeClick = () => {
    onMyOfficeSelect();
  };

  return (
    <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100/50 h-screen flex flex-col shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        {/* Universal Search Button */}
        <button
          onClick={onUniversalSearch}
          className="w-full mb-6 p-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100 rounded-xl transition-all duration-300 flex items-center space-x-3 text-gray-700 hover:text-blue-700 shadow-sm hover:shadow-md touch-manipulation"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">Search everything...</span>
        </button>
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Project Manager</h1>
            <p className="text-xs text-gray-500">Organize & Track</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-gray-700 text-sm font-semibold">{user.name.charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
            <p className="text-xs text-gray-500">Active User</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-2">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 touch-manipulation ${
              activeView === 'dashboard'
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-100'
                : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-semibold">Dashboard</span>
          </button>
          
          <button
            onClick={handleMyOfficeClick}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 touch-manipulation ${
              activeView === 'myoffice'
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-100'
                : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="font-semibold">My Office</span>
          </button>
          
          <button
            onClick={handleProjectsClick}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 touch-manipulation ${
              activeView === 'projects'
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-100'
                : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            <span className="font-semibold">Projects</span>
          </button>
          
          <button
            onClick={() => onViewChange('todos')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 touch-manipulation ${
              activeView === 'todos'
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-100'
                : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="font-semibold">All Todos</span>
          </button>
          
          <button
            onClick={() => onViewChange('attachments')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 touch-manipulation ${
              activeView === 'attachments'
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-100'
                : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            <Paperclip className="w-5 h-5" />
            <span className="font-semibold">Attachments</span>
          </button>
          
          <button
            onClick={handleCalendarClick}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 touch-manipulation ${
              activeView === 'calendar'
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-100'
                : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">Calendar</span>
          </button>
          <button
            onClick={() => onViewChange('gantt')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 touch-manipulation ${
              activeView === 'gantt'
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-100'
                : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-semibold">Gantt Chart</span>
          </button>
          <button
            onClick={() => onViewChange('knowledge')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 touch-manipulation ${
              activeView === 'knowledge'
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-100'
                : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">Knowledge Base</span>
          </button>
          <button
            onClick={() => onViewChange('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 touch-manipulation ${
              activeView === 'settings'
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-100'
                : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-semibold">Settings</span>
          </button>
        </nav>

        {/* Projects List */}
        {(activeView === 'projects' || activeView === 'myoffice') && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{activeView === 'myoffice' ? 'My Office' : 'Projects'}</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{activeView === 'myoffice' ? myOfficeProjects.length : mainProjects.length}</span>
            </div>
            <div className="space-y-2">
              {(activeView === 'myoffice' ? myOfficeProjects : mainProjects).map(project => (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect(project)}
                  className="w-full p-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 rounded-xl transition-all duration-300 text-left group hover:shadow-md border border-transparent hover:border-gray-200/50 touch-manipulation"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate text-sm">
                        {project.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate font-medium">
                        {project.todos.length} tasks
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pending Todos */}
        {(activeView === 'projects' || activeView === 'myoffice') && pendingTodos.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Pending Tasks</h3>
            <div className="space-y-2">
              {pendingTodos.slice(0, 5).map(todo => (
                <div key={todo.id} className="p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100/50 shadow-sm">
                  <p className="font-semibold text-gray-900 text-sm truncate">{todo.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-600 font-medium">{todo.projectTitle}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      todo.priority === 'high' ? 'bg-red-100 text-red-700' :
                      todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {todo.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/30 to-gray-100/30">
        <button
          onClick={() => {
            console.log('Logout button clicked');
            onSignOut();
          }}
          className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 rounded-xl transition-all duration-300 text-gray-600 hover:text-red-600 hover:shadow-md border border-transparent hover:border-red-100 touch-manipulation"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;