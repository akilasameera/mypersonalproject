import React, { useState, useMemo } from 'react';
import { Search, Paperclip, Download, X, FileText, FolderOpen, Calendar } from 'lucide-react';
import { Project, Attachment } from '../types';

interface AttachmentsViewProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
}

interface AttachmentWithProject extends Attachment {
  projectTitle: string;
  projectColor: string;
  project: Project;
  noteTitle: string;
  noteId: string;
}

const AttachmentsView: React.FC<AttachmentsViewProps> = ({ projects, onProjectSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Get all attachments from all projects
  const allAttachments: AttachmentWithProject[] = useMemo(() => {
    const attachments: AttachmentWithProject[] = [];
    
    projects.forEach(project => {
      project.notes.forEach(note => {
        if (note.attachments && note.attachments.length > 0) {
          note.attachments.forEach(attachment => {
            attachments.push({
              ...attachment,
              projectTitle: project.title,
              projectColor: project.color,
              project: project,
              noteTitle: note.title,
              noteId: note.id
            });
          });
        }
      });
    });
    
    return attachments.sort((a, b) => 
      new Date(b.created_at || b.createdAt || '').getTime() - 
      new Date(a.created_at || a.createdAt || '').getTime()
    );
  }, [projects]);

  // Filter attachments based on search query
  const filteredAttachments = useMemo(() => {
    if (!searchQuery.trim()) return allAttachments;
    
    const query = searchQuery.toLowerCase();
    return allAttachments.filter(attachment => 
      attachment.name.toLowerCase().includes(query) ||
      attachment.projectTitle.toLowerCase().includes(query) ||
      attachment.noteTitle.toLowerCase().includes(query) ||
      attachment.type.toLowerCase().includes(query)
    );
  }, [allAttachments, searchQuery]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
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

  const totalSize = allAttachments.reduce((sum, att) => sum + att.size, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100/50 min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 sm:top-20 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 sm:bottom-20 sm:left-20 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-teal-400/5 to-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1 sm:mb-2">
            Attachments
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">All your files in one place</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 shadow-lg">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl">
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{allAttachments.length}</p>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Files</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 shadow-lg">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg sm:rounded-xl">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{formatFileSize(totalSize)}</p>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Size</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 shadow-lg">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg sm:rounded-xl">
                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{projects.length}</p>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Projects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-10 sm:pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm text-base"
              placeholder="Search attachments by name, project, note, or file type..."
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors touch-manipulation"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3">
              Found {filteredAttachments.length} attachment{filteredAttachments.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
        </div>

        {/* Attachments Grid */}
        {filteredAttachments.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <Paperclip className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
              {searchQuery ? 'No attachments found' : 'No attachments yet'}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base px-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Upload files to your notes to see them here'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredAttachments.map(attachment => (
              <div
                key={attachment.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/50 p-4 sm:p-5 hover:shadow-2xl transition-all duration-500 group overflow-hidden hover:scale-105 hover:border-white/80 shadow-lg"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="text-2xl">{getFileIcon(attachment.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate group-hover:text-blue-600 transition-colors">
                        {attachment.name.split('/').pop()}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">{formatFileSize(attachment.size)}</p>
                    </div>
                  </div>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md touch-manipulation"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  </a>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1 sm:mb-1">Project</p>
                    <button
                      onClick={() => onProjectSelect(attachment.project)}
                      className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs sm:text-sm transition-colors w-full text-left touch-manipulation"
                    >
                      <div 
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                        style={{ backgroundColor: attachment.projectColor }}
                      />
                      <span className="truncate">{attachment.projectTitle}</span>
                    </button>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1 sm:mb-1">Note</p>
                    <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 bg-gray-50 rounded-lg text-xs sm:text-sm">
                      <FileText className="w-2 h-2 sm:w-3 sm:h-3 text-gray-400" />
                      <span className="truncate text-gray-700">{attachment.noteTitle}</span>
                    </div>
                  </div>

                  <div className="pt-1 sm:pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="w-2 h-2 sm:w-3 sm:h-3" />
                      <span>Uploaded {formatDate(attachment.created_at || attachment.createdAt || '')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentsView;