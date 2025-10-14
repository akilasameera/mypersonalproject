import React, { useState } from 'react';
import { ArrowLeft, Users, FileText, CheckSquare, MessageSquare, Calendar, Clock } from 'lucide-react';
import { Meeting } from '../types';
import MeetingTranscriptTab from './tabs/MeetingTranscriptTab';
import MeetingSummaryTab from './tabs/MeetingSummaryTab';
import MeetingTodoTab from './tabs/MeetingTodoTab';
import { useMeetings } from '../hooks/useMeetings';

interface MeetingDetailProps {
  meeting: Meeting;
  onMeetingUpdate: (meeting: Meeting) => void;
  onBack: () => void;
}

type MeetingTabType = 'transcript' | 'summary' | 'todos';

const MeetingDetail: React.FC<MeetingDetailProps> = ({
  meeting,
  onMeetingUpdate,
  onBack
}) => {
  const { createSummary, createMeetingTodo } = useMeetings('');
  const [activeTab, setActiveTab] = useState<MeetingTabType>('transcript');

  const tabs = [
    { id: 'transcript' as MeetingTabType, label: 'Transcript', icon: MessageSquare, count: meeting.transcripts?.length || 0 },
    { id: 'summary' as MeetingTabType, label: 'Summary', icon: FileText, count: meeting.summaries?.length || 0 },
    { id: 'todos' as MeetingTabType, label: 'Action Items', icon: CheckSquare, count: meeting.todos?.length || 0 }
  ];

  const handleMeetingUpdate = (updates: Partial<Meeting>) => {
    const updatedMeeting = {
      ...meeting,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    onMeetingUpdate(updatedMeeting);
  };

  const handleGenerateSummary = async (summaryData: any) => {
    try {
      const newSummary = await createSummary(meeting.id, summaryData);
      const updatedSummaries = [...(meeting.summaries || []), newSummary];
      handleMeetingUpdate({ summaries: updatedSummaries });
      
      // Force component re-render by updating the meeting object
      const updatedMeeting = {
        ...meeting,
        summaries: updatedSummaries,
        updatedAt: new Date().toISOString()
      };
      onMeetingUpdate(updatedMeeting);
    } catch (error) {
      console.error('Error creating AI-generated summary:', error);
      throw error;
    }
  };

  const handleGenerateTodos = async (todosData: any[]) => {
    try {
      const createdTodos = [];
      for (const todoData of todosData) {
        const newTodo = await createMeetingTodo(meeting.id, todoData);
        createdTodos.push(newTodo);
      }
      const updatedTodos = [...(meeting.todos || []), ...createdTodos];
      handleMeetingUpdate({ todos: updatedTodos });
      
      // Force component re-render by updating the meeting object
      const updatedMeeting = {
        ...meeting,
        todos: updatedTodos,
        updatedAt: new Date().toISOString()
      };
      onMeetingUpdate(updatedMeeting);
    } catch (error) {
      console.error('Error creating AI-generated todos:', error);
      throw error;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                  {meeting.title}
                </h1>
              </div>
              {meeting.description && (
                <p className="text-sm text-gray-600 mt-1 truncate">{meeting.description}</p>
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
                <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-md">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">{meeting.title}</h1>
              </div>
            </div>
            
            <div className="ml-16 mb-8 space-y-3">
              {meeting.description && (
                <p className="text-gray-600 text-lg leading-relaxed">{meeting.description}</p>
              )}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDateTime(meeting.meetingDate)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                  <Clock className="w-4 h-4" />
                  <span>{meeting.duration} minutes</span>
                </div>
                <span className={`px-3 py-2 rounded-xl text-sm font-semibold ${getStatusColor(meeting.status)}`}>
                  {meeting.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Meeting Info */}
          <div className="lg:hidden mb-4 px-4">
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-2 text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100/50 px-3 py-2 rounded-xl backdrop-blur-sm border border-gray-200/50">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">{formatDateTime(meeting.meetingDate)}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100/50 px-3 py-2 rounded-xl backdrop-blur-sm border border-gray-200/50">
                <Clock className="w-3 h-3" />
                <span className="font-medium">{meeting.duration}m</span>
              </div>
            </div>
          </div>

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
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-gray-200/80 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6 lg:p-8 relative z-10 pb-20 lg:pb-8">
        {activeTab === 'transcript' && (
          <MeetingTranscriptTab
            meetingId={meeting.id}
            transcripts={meeting.transcripts || []}
            onUpdateTranscripts={(transcripts) => handleMeetingUpdate({ transcripts })}
            onGenerateSummary={handleGenerateSummary}
            onGenerateTodos={handleGenerateTodos}
          />
        )}
        {activeTab === 'summary' && (
          <MeetingSummaryTab
            meetingId={meeting.id}
            summaries={meeting.summaries || []}
            onUpdateSummaries={(summaries) => handleMeetingUpdate({ summaries })}
          />
        )}
        {activeTab === 'todos' && (
          <MeetingTodoTab
            meetingId={meeting.id}
            todos={meeting.todos || []}
            onUpdateTodos={(todos) => handleMeetingUpdate({ todos })}
          />
        )}
      </div>
    </div>
  );
};

export default MeetingDetail;