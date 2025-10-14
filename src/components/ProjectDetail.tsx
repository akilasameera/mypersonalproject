import React, { useState } from 'react';
import { ArrowLeft, FileText, Link, CheckSquare, Calendar, Settings, FileCode, Boxes } from 'lucide-react';
import { Project } from '../types';
import NotesTab from './tabs/NotesTab';
import CurrentStatusTab from './tabs/CurrentStatusTab';
import LinksTab from './tabs/LinksTab';
import TodosTab from './tabs/TodosTab';
import CalendarTab from './tabs/CalendarTab';
import MeetingsTab from './tabs/MeetingsTab';
import SetupTab from './tabs/SetupTab';
import BRDTab from './tabs/BRDTab';
import ConfiguratorTab from './tabs/ConfiguratorTab';

interface ProjectDetailProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
  onBack: () => void;
}

type TabType = 'notes' | 'current_status' | 'links' | 'todos' | 'meetings' | 'calendar' | 'setup' | 'brd' | 'configurator';

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onProjectUpdate,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('notes');

  const isMasterProject = project.title.toLowerCase() === 'master';

  const tabs = [
    { id: 'notes' as TabType, label: 'Notes', icon: FileText, count: project.notes.length },
    { id: 'current_status' as TabType, label: 'Current Status', icon: FileText, count: project.notes.filter(note => note.statusCategory === 'current_status').length },
    { id: 'links' as TabType, label: 'Links', icon: Link, count: project.links.length },
    { id: 'todos' as TabType, label: 'Todos', icon: CheckSquare, count: project.todos.length },
    { id: 'meetings' as TabType, label: 'Meetings', icon: Calendar, count: project.meetings?.length || 0 },
    { id: 'calendar' as TabType, label: 'Calendar', icon: Calendar },
    { id: 'brd' as TabType, label: 'BRD', icon: FileCode },
    { id: 'configurator' as TabType, label: 'Configurator', icon: Boxes },
    { id: 'setup' as TabType, label: 'Setup', icon: Settings }
  ];

  const handleProjectUpdate = (updates: Partial<Project>) => {
    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    onProjectUpdate(updatedProject);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-400/8 to-purple-400/8 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-teal-400/8 to-blue-400/8 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-2xl border-b border-gray-200/30 shadow-lg relative z-10 sticky top-0">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <button
              onClick={onBack}
              className="p-3 hover:bg-gray-100/80 rounded-2xl transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-lg touch-manipulation backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1 min-w-0 mx-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full shadow-lg ring-2 ring-white/50"
                  style={{ backgroundColor: project.color }}
                />
                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                  {project.title}
                </h1>
              </div>
              {project.description && (
                <p className="text-sm text-gray-600 mt-1 truncate">{project.description}</p>
              )}
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={onBack}
                className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md touch-manipulation"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div 
                  className="w-5 h-5 rounded-full shadow-md flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">{project.title}</h1>
              </div>
            </div>
            
            <div className="ml-16 mb-8 space-y-3">
              {project.description && (
                <p className="text-gray-600 text-lg leading-relaxed">{project.description}</p>
              )}
              {project.dueDate && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl w-fit">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {new Date(project.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Due Date */}
          {project.dueDate && (
            <div className="lg:hidden mb-4 px-4">
              <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100/50 px-3 py-2 rounded-xl w-fit backdrop-blur-sm border border-gray-200/50">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">Due: {new Date(project.dueDate + 'T12:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="px-4 lg:ml-16">
            {/* Mobile Tabs - Horizontal Scroll */}
            <div className="lg:hidden">
              <div className="flex gap-2 bg-white/60 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-gray-200/30 overflow-x-auto scrollbar-hide">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap touch-manipulation min-w-fit ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    {tab.count !== undefined && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeTab === tab.id
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden lg:block">
              <div className="flex flex-wrap gap-2 bg-gray-100/80 backdrop-blur rounded-2xl p-2 w-fit shadow-lg border border-gray-200/50">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap touch-manipulation ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-lg shadow-gray-200/50 scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:shadow-md'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeTab === tab.id
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-gray-200/80 text-gray-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6 lg:p-8 relative z-10 pb-20 lg:pb-8">
        {activeTab === 'notes' && (
          <NotesTab
            projectId={project.id}
            notes={project.notes.filter(note => note.statusCategory !== 'current_status')}
            onUpdateNotes={(updatedNotes) => {
              // When a note is changed to current_status, move existing current_status notes to general
              const hasNewCurrentStatus = updatedNotes.some(note => note.statusCategory === 'current_status');
              
              if (hasNewCurrentStatus) {
                // Move existing current_status notes to general
                const existingCurrentStatus = project.notes.filter(note => note.statusCategory === 'current_status');
                const movedToGeneral = existingCurrentStatus.map(note => ({
                  ...note,
                  statusCategory: 'general' as const,
                  statusType: undefined,
                  status_type: undefined
                }));
                
                // Combine: moved notes + updated notes (excluding old current_status)
                const allNotes = [
                  ...movedToGeneral,
                  ...updatedNotes
                ];
                handleProjectUpdate({ notes: allNotes });
              } else {
                // Normal update - combine with existing current_status notes
                handleProjectUpdate({ 
                  notes: [...updatedNotes, ...project.notes.filter(note => note.statusCategory === 'current_status')] 
                });
              }
            }}
            statusCategory="general"
          />
        )}
        {activeTab === 'current_status' && (
          <CurrentStatusTab
            projectId={project.id}
            notes={project.notes.filter(note => note.statusCategory === 'current_status')}
            onUpdateNotes={(updatedNotes) => {
              // When current status is updated, we need to handle the moved notes properly
              // The CurrentStatusTab already handles moving old current status notes to general
              // So we need to update the project with:
              // 1. All existing general notes (unchanged)
              // 2. Old current status notes that were moved to general (they're now in the database as general)
              // 3. The new current status note(s)
              
              // Get all notes that are not current status (these stay as they are)
              const nonCurrentStatusNotes = project.notes.filter(note => note.statusCategory !== 'current_status');
              
              // The updatedNotes contains only the current status note(s)
              // We need to refetch or assume old current status notes are now general
              handleProjectUpdate({ 
                notes: [...nonCurrentStatusNotes, ...updatedNotes]
              });
            }}
          />
        )}
        {activeTab === 'links' && (
          <LinksTab
            projectId={project.id}
            links={project.links}
            onUpdateLinks={(links) => handleProjectUpdate({ links })}
          />
        )}
        {activeTab === 'todos' && (
          <TodosTab
            projectId={project.id}
            todos={project.todos}
            onUpdateTodos={(todos) => handleProjectUpdate({ todos })}
          />
        )}
        {activeTab === 'meetings' && (
          <MeetingsTab
            projectId={project.id}
            meetings={project.meetings || []}
            onUpdateMeetings={(meetings) => handleProjectUpdate({ meetings })}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarTab
            project={project}
          />
        )}
        {activeTab === 'setup' && (
          <SetupTab
            projectId={project.id}
          />
        )}
        {activeTab === 'brd' && (
          <BRDTab
            projectId={project.id}
            isMasterProject={isMasterProject}
          />
        )}
        {activeTab === 'configurator' && (
          <ConfiguratorTab
            projectId={project.id}
            isMasterProject={isMasterProject}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;