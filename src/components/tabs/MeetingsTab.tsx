import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Users, Play, Square, CheckCircle, X, FileText, CheckSquare } from 'lucide-react';
import { Meeting } from '../../types';
import { useMeetings } from '../../hooks/useMeetings';
import MeetingDetail from '../MeetingDetail';

interface MeetingsTabProps {
  projectId: string;
  meetings: Meeting[];
  onUpdateMeetings: (meetings: Meeting[]) => void;
}

const MeetingsTab: React.FC<MeetingsTabProps> = ({ projectId, meetings, onUpdateMeetings }) => {
  const { createMeeting, updateMeeting, deleteMeeting, loading } = useMeetings(projectId);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingDate: '',
    duration: 60,
    status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMeeting) {
        // Update existing meeting
        const updatedMeeting = await updateMeeting(editingMeeting.id, {
          title: formData.title,
          description: formData.description,
          meetingDate: formData.meetingDate,
          duration: formData.duration,
          status: formData.status,
        });
        
        const updatedMeetings = meetings.map(meeting => 
          meeting.id === editingMeeting.id ? { ...meeting, ...updatedMeeting } : meeting
        );
        onUpdateMeetings(updatedMeetings);
      } else {
        // Create new meeting
        const newMeeting = await createMeeting({
          title: formData.title,
          description: formData.description,
          meetingDate: formData.meetingDate,
          duration: formData.duration,
          status: formData.status,
        });
        
        // Add empty arrays for related data
        const meetingWithRelatedData = {
          ...newMeeting,
          transcripts: [],
          summaries: [],
          todos: []
        };
        
        onUpdateMeetings([meetingWithRelatedData, ...meetings]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving meeting:', error);
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      meetingDate: meeting.meetingDate.split('T')[0], // Extract date part
      duration: meeting.duration,
      status: meeting.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (meetingId: string) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(meetingId);
        const updatedMeetings = meetings.filter(meeting => meeting.id !== meetingId);
        onUpdateMeetings(updatedMeetings);
      } catch (error) {
        console.error('Error deleting meeting:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', meetingDate: '', duration: 60, status: 'scheduled' });
    setEditingMeeting(null);
    setShowForm(false);
  };

  const handleMeetingSelect = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
  };

  const handleBackToList = () => {
    setSelectedMeeting(null);
  };

  const formatDateTime = (dateString: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <Square className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  if (selectedMeeting) {
    return (
      <MeetingDetail
        meeting={selectedMeeting}
        onBack={handleBackToList}
        onMeetingUpdate={(updatedMeeting) => {
          const updatedMeetings = meetings.map(meeting => 
            meeting.id === updatedMeeting.id ? updatedMeeting : meeting
          );
          onUpdateMeetings(updatedMeetings);
          setSelectedMeeting(updatedMeeting);
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Meetings</h2>
          <p className="text-gray-600 mt-1">Manage meeting transcripts, summaries, and action items</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl flex items-center space-x-2 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105 text-base"
        >
          <Plus className="w-4 h-4" />
          <span>Add Meeting</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            {editingMeeting ? 'Edit Meeting' : 'Create New Meeting'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meeting Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm"
                placeholder="Meeting title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm"
                placeholder="Meeting description or agenda"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meeting Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.meetingDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm"
                  min="15"
                  max="480"
                  step="15"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Status
              </label>
              <div className="flex bg-gray-100/80 rounded-xl p-1 gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'scheduled' }))}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    formData.status === 'scheduled' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Scheduled
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'in_progress' }))}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    formData.status === 'in_progress' ? 'bg-white text-green-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'completed' }))}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    formData.status === 'completed' ? 'bg-white text-gray-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Completed
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'cancelled' }))}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    formData.status === 'cancelled' ? 'bg-white text-red-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-6 py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base"
              >
                {loading ? 'Saving...' : editingMeeting ? 'Update' : 'Create'} Meeting
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No meetings yet</h3>
          <p className="text-gray-600 mb-6">Create your first meeting to track discussions and action items</p>
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 text-base"
          >
            Create Meeting
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {meetings.map(meeting => (
            <div 
              key={meeting.id} 
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-4 sm:p-5 hover:shadow-2xl transition-all duration-500 group overflow-hidden hover:scale-105 hover:border-white/80 shadow-lg cursor-pointer"
              onClick={() => handleMeetingSelect(meeting)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-1 line-clamp-2">
                    {meeting.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(meeting.status)}`}>
                      {getStatusIcon(meeting.status)}
                      <span className="ml-1">{meeting.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
                <div className="flex items-center space-x-1 ml-2 sm:ml-3 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(meeting);
                    }}
                    className="p-2 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md touch-manipulation"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(meeting.id);
                    }}
                    className="p-2 sm:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md touch-manipulation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {meeting.description && (
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed text-sm line-clamp-2 hover:text-gray-900 transition-colors">
                    {meeting.description}
                  </p>
                </div>
              )}

              {/* Meeting Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-base font-bold text-gray-900">{meeting.transcripts?.length || 0}</p>
                  <p className="text-xs text-gray-500 font-medium">Transcripts</p>
                </div>
                <div className="text-center">
                  <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <FileText className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-base font-bold text-gray-900">{meeting.summaries?.length || 0}</p>
                  <p className="text-xs text-gray-500 font-medium">Summaries</p>
                </div>
                <div className="text-center">
                  <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <CheckSquare className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-base font-bold text-gray-900">{meeting.todos?.length || 0}</p>
                  <p className="text-xs text-gray-500 font-medium">Action Items</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3" />
                  <span className="font-medium">{formatDateTime(meeting.meetingDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">{meeting.duration} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingsTab;