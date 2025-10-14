import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, FileText, Upload, X, Download } from 'lucide-react';
import { Note } from '../../types';
import { supabase } from '../../lib/supabase';
import { useNotes } from '../../hooks/useNotes';
import { useAuth } from '../../hooks/useAuth';
import NoteDetailModal from '../NoteDetailModal';
import AttachmentPreview from '../AttachmentPreview';

interface CurrentStatusTabProps {
  projectId: string;
  notes: Note[];
  onUpdateNotes: (notes: Note[]) => void;
}

const CurrentStatusTab: React.FC<CurrentStatusTabProps> = ({ projectId, notes, onUpdateNotes }) => {
  const { user } = useAuth();
  const { createNote, updateNote, deleteNote, uploadAttachment, deleteAttachment, loading } = useNotes(projectId, user?.id || '');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [previewingAttachment, setPreviewingAttachment] = useState<any>(null);
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [pasteIndicator, setPasteIndicator] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    dueDate: '',
    statusCategory: 'current_status' as 'general' | 'current_status',
    statusType: 'me' as 'me' | 'customer',
  });

  // Handle paste events for clipboard images
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Only handle paste when the form is open
      if (!showForm) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Check if the item is an image
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          
          const file = item.getAsFile();
          if (file) {
            // Generate a meaningful filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const extension = file.type.split('/')[1] || 'png';
            const filename = `pasted-image-${timestamp}.${extension}`;
            
            // Create a new File object with a proper name
            const namedFile = new File([file], filename, { type: file.type });
            
            setPendingAttachments(prev => [...prev, namedFile]);
            
            // Show paste indicator briefly
            setPasteIndicator(true);
            setTimeout(() => setPasteIndicator(false), 2000);
          }
          break;
        }
      }
    };

    // Add event listener when form is open
    if (showForm) {
      document.addEventListener('paste', handlePaste);
    }

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [showForm]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploadingFiles(true);
      
      if (editingNote) {
        // Update existing note
        // If changing from current_status to general, clear status_type
        const noteData = {
          title: formData.title,
          content: formData.content,
          dueDate: formData.dueDate || undefined,
          statusCategory: formData.statusCategory,
          statusType: formData.statusCategory === 'current_status' ? formData.statusType : undefined,
        };
        
        const updatedNote = await updateNote(editingNote.id, noteData);
        
        // Upload any pending attachments for existing note
        if (pendingAttachments.length > 0) {
          const uploadedAttachments = [];
          for (const file of pendingAttachments) {
            const attachment = await uploadAttachment(editingNote.id, file);
            uploadedAttachments.push(attachment);
          }
          updatedNote.attachments = [...(updatedNote.attachments || []), ...uploadedAttachments];
        }
        
        // If the note was changed to general, it should move to Notes tab
        if (formData.statusCategory === 'general') {
          // Remove from current status notes
          const updatedNotes = notes.filter(note => note.id !== editingNote.id);
          onUpdateNotes(updatedNotes);
          // Force refresh to show the note in the correct tab
          window.location.reload();
        } else {
          // Update notes list - keep in current status
          const updatedNotes = [{ ...editingNote, ...updatedNote }];
          onUpdateNotes(updatedNotes);
        }
      } else {
        // CRITICAL: Move ALL existing current status notes to general category first
        console.log('Moving existing current status notes to general...');
        
        // Get ALL current status notes from the database, not just the filtered ones
        const { data: allCurrentStatusNotes, error: fetchError } = await supabase
          .from('notes')
          .select('*')
          .eq('project_id', projectId)
          .eq('status_category', 'current_status');
          
        if (fetchError) {
          console.error('Error fetching current status notes:', fetchError);
          throw fetchError;
        }
        
        console.log('Found existing current status notes:', allCurrentStatusNotes);
        
        // Move each existing current status note to general
        if (allCurrentStatusNotes && allCurrentStatusNotes.length > 0) {
          for (const note of allCurrentStatusNotes) {
            console.log('Moving note to general:', note.id, note.title);
            const { error: updateError } = await supabase
              .from('notes')
              .update({
                status_category: 'general',
                status_type: null
              })
              .eq('id', note.id);
              
            if (updateError) {
              console.error('Error moving note to general:', updateError);
              throw updateError;
            }
          }
        }
        
        // Create the new current status note
        console.log('Creating new current status note...');
        const newNote = await createNote({
          title: formData.title,
          content: formData.content,
          dueDate: formData.dueDate || undefined,
          statusCategory: formData.statusCategory,
          statusType: formData.statusType,
        });
        
        // Upload attachments for new note
        if (pendingAttachments.length > 0) {
          const uploadedAttachments = [];
          for (const file of pendingAttachments) {
            const attachment = await uploadAttachment(newNote.id, file);
            uploadedAttachments.push(attachment);
          }
          newNote.attachments = uploadedAttachments;
        }
        
        // Force a complete refresh of the project data
        window.location.reload();
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setViewingNote(null); // Close detail view if open
    setFormData({
      title: note.title,
      content: note.content,
      dueDate: note.dueDate || '',
      statusCategory: note.statusCategory || 'current_status',
      statusType: note.statusType || 'me',
    });
    setShowForm(true);
  };

  const handleDelete = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this status note?')) {
      try {
        await deleteNote(noteId);
        const updatedNotes = notes.filter(note => note.id !== noteId);
        onUpdateNotes(updatedNotes);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', dueDate: '', statusCategory: 'current_status', statusType: 'me' });
    setEditingNote(null);
    setShowForm(false);
    setPendingAttachments([]);
  };

  const handleNoteClick = (note: Note) => {
    setViewingNote(note);
  };

  const handleCloseDetailView = () => {
    setViewingNote(null);
  };

  const handleFileSelect = (files: FileList) => {
    const newFiles = Array.from(files);
    setPendingAttachments(prev => [...prev, ...newFiles]);
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteAttachment = async (noteId: string, attachmentId: string, fileName: string) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await deleteAttachment(attachmentId, fileName);
        
        // Update the note by removing the attachment
        const updatedNotes = notes.map(note => 
          note.id === noteId 
            ? { ...note, attachments: note.attachments?.filter(att => att.id !== attachmentId) || [] }
            : note
        );
        onUpdateNotes(updatedNotes);
      } catch (error) {
        console.error('Error deleting attachment:', error);
        alert('Failed to delete attachment. Please try again.');
      }
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString + (dateString.includes('T') ? '' : 'T12:00:00')).toLocaleDateString('en-US', {
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

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString + 'T12:00:00').toLocaleDateString('en-US', {
        year: '2-digit',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImageFile = (type: string) => {
    return type.startsWith('image/');
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '🗜️';
    return '📎';
  };
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-900 to-red-700 bg-clip-text text-transparent">Current Status</h2>
          <p className="text-gray-600 mt-1">Track current project status and updates</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-4 px-8 rounded-2xl flex items-center space-x-2 transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transform hover:scale-105 text-base"
        >
          <Plus className="w-4 h-4" />
          <span>Add Status Note</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl mb-8">
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-900 to-red-700 bg-clip-text text-transparent mb-4">
            {editingNote ? 'Edit Status Note' : 'Create New Status Note'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm"
                placeholder="Status note title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm"
                placeholder="Write your status update here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="transition-all duration-300 cursor-pointer"
                placeholder="Select due date"
              />
            </div>

            {/* Mobile-Friendly Note Type Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Note Type
              </label>
              <div className="flex bg-gray-100/80 rounded-xl p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, statusCategory: 'general' }))}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    formData.statusCategory === 'general'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  General Note
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, statusCategory: 'current_status' }))}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    formData.statusCategory === 'current_status'
                      ? 'bg-white text-orange-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Current Status
                </button>
              </div>
            </div>
            
            {/* Status Type Toggle - Only show when Current Status is selected */}
            {formData.statusCategory === 'current_status' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Status Type
              </label>
              <div className="flex bg-gray-100/80 rounded-xl p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, statusType: 'me' }))}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    formData.statusType === 'me'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Me
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, statusType: 'customer' }))}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    formData.statusType === 'customer'
                      ? 'bg-white text-purple-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Customer
                </button>
              </div>
            </div>
            )}

            {/* File Attachments */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Attachments (Optional) {pasteIndicator && <span className="text-green-600 font-medium">📋 Image pasted!</span>}
              </label>
              
              {/* File Upload Area */}
              <div className="mb-4">
                <label className="block">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileSelect(e.target.files);
                        e.target.value = ''; // Reset input
                      }
                    }}
                    className="hidden"
                  />
                  <div className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                    pasteIndicator 
                      ? 'border-green-400 bg-gradient-to-br from-green-50/50 to-green-100/30' 
                      : 'border-gray-300 hover:border-orange-400 bg-gradient-to-br from-gray-50/50 to-gray-100/30 hover:from-orange-50/50 hover:to-red-50/30'
                  }`}>
                    <div className="flex items-center space-x-3 text-gray-500">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm font-medium">Click to select files or drag and drop</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 font-medium">
                      💡 Tip: You can also paste images with Ctrl+V
                    </div>
                  </div>
                </label>
              </div>
              
              {/* Pending Attachments */}
              {pendingAttachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">Files to upload:</h4>
                  {pendingAttachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePendingAttachment(index)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingFiles}
                className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploadingFiles ? 'Uploading files...' : loading ? 'Saving...' : editingNote ? 'Update Status Note' : 'Create Status Note'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileText className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No status notes yet</h3>
          <p className="text-gray-600 mb-6">Create your first status note to track progress</p>
          <button
            onClick={() => setShowForm(true)}
            className="w-full max-w-xs sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-xl transform hover:scale-105 text-base"
          >
            Create Status Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {notes.map(note => (
            <div key={note.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-5 hover:shadow-2xl transition-all duration-500 group overflow-hidden hover:scale-105 hover:border-white/80 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors duration-300 mb-1 cursor-pointer"
                    onClick={() => handleNoteClick(note)}
                  >
                    {note.title}
                  </h3>
                  {(note.statusType || note.status_type) && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        (note.statusType || note.status_type) === 'me' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {(note.statusType || note.status_type) === 'me' ? 'Me' : 'Customer'}
                      </span>
                    </div>
                  )}
                  <div className="w-8 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                </div>
                <div className="flex items-center space-x-1 ml-3">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4 cursor-pointer" onClick={() => handleNoteClick(note)}>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-3 text-sm hover:text-gray-900 transition-colors">
                  {note.content}
                </p>
                {note.content.length > 150 && (
                  <p className="text-orange-600 text-xs mt-2 font-medium hover:text-orange-700 transition-colors">
                    Click to read more...
                  </p>
                )}
              </div>
              
              {/* Attachment Indicator */}
              {note.attachments && note.attachments.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                    <FileText className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {note.attachments.length} attachment{note.attachments.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-orange-600 font-medium">Click note to view</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span className="font-medium">Created {formatDateTime(note.created_at || note.createdAt)}</span>
                {note.dueDate && (
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    isOverdue(note.dueDate) ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    <span>Due {formatDateOnly(note.dueDate)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Detail Modal */}
      {viewingNote && (
        <NoteDetailModal
          note={viewingNote}
          onClose={handleCloseDetailView}
          onEdit={(note) => {
            handleEdit(note);
            setViewingNote(null);
          }}
        />
      )}

      {/* Attachment Preview Modal */}
      {previewingAttachment && (
        <AttachmentPreview
          attachment={previewingAttachment}
          onClose={() => setPreviewingAttachment(null)}
          onDelete={() => {
            // Find which note this attachment belongs to
            const noteWithAttachment = notes.find(note => 
              note.attachments?.some(att => att.id === previewingAttachment.id)
            );
            if (noteWithAttachment) {
              handleDeleteAttachment(noteWithAttachment.id, previewingAttachment.id, previewingAttachment.name);
            }
            setPreviewingAttachment(null);
          }}
        />
      )}
    </div>
  );
};

export default CurrentStatusTab;