import React, { useState } from 'react';
import { X, Calendar, FileText, Download, Clock, Tag } from 'lucide-react';
import { Note } from '../types';
import AttachmentPreview from './AttachmentPreview';

interface NoteDetailModalProps {
  note: Note;
  onClose: () => void;
  onEdit: (note: Note) => void;
}

const NoteDetailModal: React.FC<NoteDetailModalProps> = ({ note, onClose, onEdit }) => {
  const [previewingAttachment, setPreviewingAttachment] = useState<any>(null);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
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

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
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
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20 my-4">
        {/* Header */}
        <div className="flex items-start justify-between p-6 sm:p-8 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-gray-100/30">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 rounded-xl ${
                note.statusCategory === 'current_status' 
                  ? 'bg-gradient-to-br from-orange-100 to-red-100 text-orange-600' 
                  : 'bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600'
              }`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {note.title}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    note.statusCategory === 'current_status'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Tag className="w-3 h-3 inline mr-1" />
                    {note.statusCategory === 'current_status' ? 'Current Status' : 'General Note'}
                  </span>
                  {note.statusType && note.statusCategory === 'current_status' && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 ${
                      (note.statusType || note.status_type) === 'me' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {(note.statusType || note.status_type) === 'me' ? 'Me' : 'Customer'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(note)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
            >
              Edit Note
            </button>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Due Date */}
          {note.dueDate && (
            <div className="mb-6">
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-sm ${
                isOverdue(note.dueDate) 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <Calendar className="w-4 h-4" />
                <span>Due: {formatDateOnly(note.dueDate)}</span>
                {isOverdue(note.dueDate) && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                    OVERDUE
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span>Content</span>
            </h3>
            <div className="bg-gradient-to-br from-gray-50/50 to-gray-100/30 rounded-2xl p-6 border border-gray-200/50">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
                  {note.content}
                </p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {note.attachments && note.attachments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span>Attachments ({note.attachments.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {note.attachments.map(attachment => (
                  <div key={attachment.id} className="relative group">
                    {isImageFile(attachment.type) ? (
                      <div 
                        className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200"
                        onClick={() => setPreviewingAttachment(attachment)}
                      >
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-xs font-medium truncate">
                            {attachment.name.split('/').pop()}
                          </p>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete if needed
                            }}
                            className="p-1.5 bg-white/90 hover:bg-white text-gray-600 hover:text-red-600 rounded-full transition-colors shadow-sm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center p-3 cursor-pointer hover:shadow-lg transition-all duration-300 group"
                        onClick={() => setPreviewingAttachment(attachment)}
                      >
                        <div className="text-2xl mb-2">{getFileIcon(attachment.type)}</div>
                        <p className="text-xs font-semibold text-gray-900 text-center truncate w-full">
                          {attachment.name.split('/').pop()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatFileSize(attachment.size)}</p>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete if needed
                            }}
                            className="p-1.5 bg-white/90 hover:bg-white text-gray-600 hover:text-red-600 rounded-full transition-colors shadow-sm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span>Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900 font-semibold mt-1">
                  {formatDateTime(note.created_at || note.createdAt)}
                </p>
              </div>
              {(note.updated_at || note.updatedAt) && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-gray-900 font-semibold mt-1">
                    {formatDateTime(note.updated_at || note.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attachment Preview Modal */}
      {previewingAttachment && (
        <AttachmentPreview
          attachment={previewingAttachment}
          onClose={() => setPreviewingAttachment(null)}
        />
      )}
    </div>
  );
};

export default NoteDetailModal;