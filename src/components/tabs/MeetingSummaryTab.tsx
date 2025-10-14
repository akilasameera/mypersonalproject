import React, { useState } from 'react';
import { Plus, Edit, Trash2, FileText, X, Brain, Lightbulb, Target, CheckCircle } from 'lucide-react';
import { MeetingSummary } from '../../types';
import { useMeetings } from '../../hooks/useMeetings';

interface MeetingSummaryTabProps {
  meetingId: string;
  summaries: MeetingSummary[];
  onUpdateSummaries: (summaries: MeetingSummary[]) => void;
}

const MeetingSummaryTab: React.FC<MeetingSummaryTabProps> = ({ 
  meetingId, 
  summaries, 
  onUpdateSummaries 
}) => {
  const { createSummary, updateSummary, deleteSummary, loading } = useMeetings('');
  const [showForm, setShowForm] = useState(false);
  const [editingSummary, setEditingSummary] = useState<MeetingSummary | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    keyPoints: '',
    actionItems: '',
    decisions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSummary) {
        // Update existing summary
        const updatedSummary = await updateSummary(editingSummary.id, {
          content: formData.content,
          keyPoints: formData.keyPoints,
          actionItems: formData.actionItems,
          decisions: formData.decisions,
        });
        
        const updatedSummaries = summaries.map(summary => 
          summary.id === editingSummary.id ? { ...summary, ...updatedSummary } : summary
        );
        onUpdateSummaries(updatedSummaries);
      } else {
        // Create new summary
        const newSummary = await createSummary(meetingId, {
          content: formData.content,
          keyPoints: formData.keyPoints,
          actionItems: formData.actionItems,
          decisions: formData.decisions,
        });
        
        onUpdateSummaries([...summaries, newSummary]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving summary:', error);
    }
  };

  const handleEdit = (summary: MeetingSummary) => {
    setEditingSummary(summary);
    setFormData({
      content: summary.content,
      keyPoints: summary.keyPoints || '',
      actionItems: summary.actionItems || '',
      decisions: summary.decisions || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (summaryId: string) => {
    if (window.confirm('Are you sure you want to delete this summary?')) {
      try {
        await deleteSummary(summaryId);
        const updatedSummaries = summaries.filter(summary => summary.id !== summaryId);
        onUpdateSummaries(updatedSummaries);
      } catch (error) {
        console.error('Error deleting summary:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ content: '', keyPoints: '', actionItems: '', decisions: '' });
    setEditingSummary(null);
    setShowForm(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meeting Summary</h2>
          <p className="text-gray-600 mt-1">Capture key insights and outcomes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Summary</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingSummary ? 'Edit Summary' : 'Create New Summary'}
            </h3>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Summary
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Provide an overall summary of the meeting..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Points
              </label>
              <textarea
                value={formData.keyPoints}
                onChange={(e) => setFormData(prev => ({ ...prev, keyPoints: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="• Key point 1&#10;• Key point 2&#10;• Key point 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Items
              </label>
              <textarea
                value={formData.actionItems}
                onChange={(e) => setFormData(prev => ({ ...prev, actionItems: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="• Action item 1 - Assigned to: [Name]&#10;• Action item 2 - Due: [Date]&#10;• Action item 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decisions Made
              </label>
              <textarea
                value={formData.decisions}
                onChange={(e) => setFormData(prev => ({ ...prev, decisions: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="• Decision 1&#10;• Decision 2&#10;• Decision 3"
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
                className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Saving...' : editingSummary ? 'Update' : 'Create'} Summary
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summaries List */}
      {summaries.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No summaries yet</h3>
          <p className="text-gray-500 mb-4">Create your first meeting summary to capture key insights</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Add Summary
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {summaries.map(summary => (
            <div key={summary.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Meeting Summary</h4>
                    <p className="text-xs text-gray-500">
                      Created {formatDateTime(summary.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(summary)}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(summary.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Main Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-gray-600" />
                    <span>Summary</span>
                  </h5>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {summary.content}
                  </p>
                </div>

                {/* Key Points */}
                {summary.keyPoints && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <span>Key Points</span>
                    </h5>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {summary.keyPoints}
                    </p>
                  </div>
                )}

                {/* Action Items */}
                {summary.actionItems && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span>Action Items</span>
                    </h5>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {summary.actionItems}
                    </p>
                  </div>
                )}

                {/* Decisions */}
                {summary.decisions && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                      <span>Decisions Made</span>
                    </h5>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {summary.decisions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingSummaryTab;