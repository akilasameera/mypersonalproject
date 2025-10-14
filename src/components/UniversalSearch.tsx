import React, { useState, useMemo } from 'react';
import { Search, X, FolderOpen, FileText, CheckSquare, Link, Calendar, Paperclip } from 'lucide-react';
import { Project } from '../types';

interface UniversalSearchProps {
  projects: Project[];
  onClose: () => void;
  onProjectSelect: (project: Project) => void;
}

interface SearchResult {
  id: string;
  type: 'project' | 'note' | 'todo' | 'link' | 'attachment';
  title: string;
  content?: string;
  projectTitle: string;
  projectColor: string;
  project: Project;
  dueDate?: string;
  completed?: boolean;
  priority?: string;
  url?: string;
}

const UniversalSearch: React.FC<UniversalSearchProps> = ({ projects, onClose, onProjectSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Create searchable items from all projects
  const searchableItems: SearchResult[] = useMemo(() => {
    const items: SearchResult[] = [];

    projects.forEach(project => {
      // Add project itself
      items.push({
        id: `project-${project.id}`,
        type: 'project',
        title: project.title,
        content: project.description,
        projectTitle: project.title,
        projectColor: project.color,
        project: project,
        dueDate: project.dueDate
      });

      // Add notes
      project.notes.forEach(note => {
        items.push({
          id: `note-${note.id}`,
          type: 'note',
          title: note.title,
          content: note.content,
          projectTitle: project.title,
          projectColor: project.color,
          project: project,
          dueDate: note.dueDate
        });
      });

      // Add todos
      project.todos.forEach(todo => {
        items.push({
          id: `todo-${todo.id}`,
          type: 'todo',
          title: todo.title,
          content: todo.description,
          projectTitle: project.title,
          projectColor: project.color,
          project: project,
          dueDate: todo.dueDate,
          completed: todo.completed,
          priority: todo.priority
        });
      });

      // Add links
      project.links.forEach(link => {
        items.push({
          id: `link-${link.id}`,
          type: 'link',
          title: link.title,
          content: link.description,
          projectTitle: project.title,
          projectColor: project.color,
          project: project,
          url: link.url
        });
      });

      // Add attachments
      project.notes.forEach(note => {
        if (note.attachments) {
          note.attachments.forEach(attachment => {
            items.push({
              id: `attachment-${attachment.id}`,
              type: 'attachment',
              title: attachment.name.split('/').pop() || attachment.name,
              content: `File in note: ${note.title}`,
              projectTitle: project.title,
              projectColor: project.color,
              project: project,
              url: attachment.url
            });
          });
        }
      });
    });

    return items;
  }, [projects]);

  // Filter items based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return searchableItems.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.content?.toLowerCase().includes(query) ||
      item.projectTitle.toLowerCase().includes(query)
    ).slice(0, 50); // Limit to 50 results for performance
  }, [searchableItems, searchQuery]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return FolderOpen;
      case 'note': return FileText;
      case 'todo': return CheckSquare;
      case 'link': return Link;
      case 'attachment': return Paperclip;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-100 text-blue-700';
      case 'note': return 'bg-purple-100 text-purple-700';
      case 'todo': return 'bg-green-100 text-green-700';
      case 'link': return 'bg-orange-100 text-orange-700';
      case 'attachment': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onProjectSelect(result.project);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-20">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full border border-white/20 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Universal Search
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-100/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm"
              placeholder="Search projects, notes, todos, links, and attachments..."
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-3">
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {searchQuery && searchResults.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try different keywords or check your spelling</p>
            </div>
          ) : searchQuery ? (
            <div className="p-4 space-y-2">
              {searchResults.map(result => {
                const Icon = getIcon(result.type);
                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-4 hover:bg-gray-50 rounded-xl transition-all duration-300 text-left group hover:shadow-md border border-transparent hover:border-gray-200/50"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {result.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                            {result.type}
                          </span>
                        </div>
                        {result.content && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {result.content}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: result.projectColor }}
                            />
                            <span>{result.projectTitle}</span>
                          </div>
                          {result.dueDate && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due {new Date(result.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {result.completed !== undefined && (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              result.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {result.completed ? 'Completed' : 'Pending'}
                            </span>
                          )}
                          {result.priority && (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              result.priority === 'high' ? 'bg-red-100 text-red-700' :
                              result.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {result.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start typing to search</h3>
              <p className="text-gray-500">Search across all your projects, notes, todos, links, and attachments</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100/50 bg-gray-50/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Press ESC to close</span>
            <span>Click any result to open its project</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalSearch;