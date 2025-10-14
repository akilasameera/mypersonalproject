import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, FileText, CheckSquare, Clock, X } from 'lucide-react';
import { Project, Todo, Note } from '../types';

interface ConsolidatedCalendarProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
}

type TaskSourceFilter = 'all' | 'projects' | 'meetings';

interface CalendarItem {
  id: string;
  title: string;
  type: 'todo' | 'note' | 'project';
  dueDate: string;
  project: Project;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  originalTodo?: Todo;
  originalNote?: Note;
  source?: 'project' | 'meeting';
  meetingTitle?: string;
}

interface ItemTooltipProps {
  item: CalendarItem;
  position: { x: number; y: number };
  visible: boolean;
}

const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, position, visible }) => {
  if (!visible) return null;

  const formatDate = (date: string) => {
    if (!date) return null;
    return new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'todo': return <CheckSquare className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'project': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'todo': return item.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600';
      case 'note': return 'bg-purple-100 text-purple-600';
      case 'project': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div
      className="fixed z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-4 max-w-sm pointer-events-none"
      style={{
        left: Math.min(position.x + 10, window.innerWidth - 320),
        top: Math.max(position.y - 10, 10),
      }}
    >
      <div className="space-y-3">
        {/* Item Header */}
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${getTypeColor()}`}>
            {getTypeIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base mb-1">{item.title}</h3>
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.project.color }}
              />
              <span className="text-sm text-gray-600 font-medium">{item.project.title}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Description:</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Notes:</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {item.notes}
            </p>
          </div>
        )}

        {/* Content for Notes */}
        {item.type === 'note' && item.originalNote?.content && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Content:</p>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {item.originalNote.content}
            </p>
          </div>
        )}

        {/* Date Information */}
        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-100">
          {item.startDate && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">Start Date:</p>
              <p className="text-sm text-blue-600 font-medium">{formatDate(item.startDate)}</p>
            </div>
          )}
          {item.endDate && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">End Date:</p>
              <p className="text-sm text-purple-600 font-medium">{formatDate(item.endDate)}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">Due Date:</p>
            <p className="text-sm text-gray-900 font-medium">{formatDate(item.dueDate)}</p>
          </div>
        </div>

        {/* Priority and Status */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {item.priority && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(item.priority)}`}>
              {item.priority} priority
            </span>
          )}
          {item.type === 'todo' && item.completed !== undefined && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              item.completed
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {item.completed ? 'Completed' : 'Pending'}
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor()}`}>
            {item.type}
          </span>
        </div>

        {/* Attachments indicator */}
        {item.originalNote?.attachments && item.originalNote.attachments.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <FileText className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-600 font-medium">
                {item.originalNote.attachments.length} attachment{item.originalNote.attachments.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface DetailPopupProps {
  item: CalendarItem;
  onClose: () => void;
  onProjectSelect: (project: Project) => void;
}

const DetailPopup: React.FC<DetailPopupProps> = ({ item, onClose, onProjectSelect }) => {
  const handleProjectSelect = () => {
    onProjectSelect(item.project);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                item.type === 'todo' ? 'bg-blue-100 text-blue-600' :
                item.type === 'note' ? 'bg-purple-100 text-purple-600' :
                'bg-green-100 text-green-600'
              }`}>
                {item.type === 'todo' ? <CheckSquare className="w-5 h-5" /> :
                 item.type === 'note' ? <FileText className="w-5 h-5" /> :
                 <Calendar className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 capitalize">{item.type}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Project</label>
            <div className="flex items-center space-x-2 mt-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.project.color }}
              />
              <span className="text-sm text-gray-900">{item.project.title}</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Due Date</label>
            <p className="text-sm text-gray-900 mt-1">
              {new Date(item.dueDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          {item.description && (
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <p className="text-sm text-gray-900 mt-1">{item.description}</p>
            </div>
          )}
          
          {item.type === 'todo' && item.priority && (
            <div>
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                item.priority === 'high' ? 'bg-red-100 text-red-700' :
                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {item.priority}
              </span>
            </div>
          )}
          
          {item.type === 'todo' && item.completed !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                item.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {item.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleProjectSelect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Open Project
          </button>
        </div>
      </div>
    </div>
  );
};

const ConsolidatedCalendar: React.FC<ConsolidatedCalendarProps> = ({
  projects,
  onProjectSelect
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sourceFilter, setSourceFilter] = useState<TaskSourceFilter>('all');
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<CalendarItem | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getAllCalendarItems = (): CalendarItem[] => {
    const items: CalendarItem[] = [];
    
    projects.forEach(project => {
      // Add project due dates
      if (project.dueDate || project.due_date) {
        items.push({
          id: `project-${project.id}`,
          title: project.title,
          type: 'project',
          dueDate: project.dueDate || project.due_date,
          project,
          source: 'project'
        });
      }
      
      // Add todos with due dates
      project.todos.forEach(todo => {
        const todoDueDate = todo.dueDate || todo.due_date || todo.endDate || todo.end_date;
        if (todoDueDate) {
          items.push({
            id: `todo-${todo.id}`,
            title: todo.title,
            type: 'todo',
            dueDate: todoDueDate,
            project,
            completed: todo.completed,
            priority: todo.priority,
            description: todo.description,
            startDate: todo.startDate || todo.start_date,
            endDate: todo.endDate || todo.end_date,
            notes: todo.notes,
            originalTodo: todo,
            source: 'project'
          });
        }
      });
      
      // Add meeting todos with due dates
      if (project.meetings) {
        project.meetings.forEach(meeting => {
          if (meeting.todos && meeting.todos.length > 0) {
            meeting.todos.forEach(meetingTodo => {
              if (meetingTodo.dueDate) {
                items.push({
                  id: `meeting-todo-${meetingTodo.id}`,
                  title: `📅 ${meetingTodo.title}${meetingTodo.assignedTo ? ` (${meetingTodo.assignedTo})` : ''}`,
                  type: 'todo',
                  dueDate: meetingTodo.dueDate,
                  project,
                  completed: meetingTodo.completed,
                  priority: meetingTodo.priority,
                  description: `Meeting Action Item: ${meetingTodo.description || ''}`,
                  notes: `From meeting: ${meeting.title}\nMeeting Date: ${new Date(meeting.meetingDate).toLocaleDateString()}\nAssigned to: ${meetingTodo.assignedTo || 'Unassigned'}`,
                  source: 'meeting',
                  meetingTitle: meeting.title,
                  originalTodo: meetingTodo
                });
              }
            });
          }
        });
      }
      
      // Add notes with due dates
      project.notes.forEach(note => {
        const noteDueDate = note.dueDate || note.due_date;
        if (noteDueDate) {
          items.push({
            id: `note-${note.id}`,
            title: note.title,
            type: 'note',
            dueDate: noteDueDate,
            project,
            description: note.content.substring(0, 100) + '...',
            source: 'project',
            originalNote: note
          });
        }
      });
    });
    
    return items;
  };

  // Filter items by source
  const filteredCalendarItems = useMemo(() => {
    const allItems = getAllCalendarItems();
    
    if (sourceFilter === 'projects') {
      return allItems.filter(item => item.source === 'project');
    } else if (sourceFilter === 'meetings') {
      return allItems.filter(item => item.source === 'meeting');
    } else {
      return allItems;
    }
  }, [projects, sourceFilter]);

  const handleItemMouseEnter = (item: CalendarItem, event: React.MouseEvent) => {
    setHoveredItem(item);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleItemMouseLeave = () => {
    setHoveredItem(null);
  };

  const handleItemMouseMove = (event: React.MouseEvent) => {
    if (hoveredItem) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const getItemsForDate = (date: Date) => {
    // Format calendar date as YYYY-MM-DD to match database format
    const calendarDateStr = date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
    
    return filteredCalendarItems.filter(item => {
      if (!item.dueDate) return false;
      
      // Handle both date strings and Date objects
      let itemDateStr;
      if (typeof item.dueDate === 'string') {
        // If it's already a string in YYYY-MM-DD format, use it directly
        itemDateStr = item.dueDate.split('T')[0]; // Remove time part if present
      } else {
        // If it's a Date object, format it
        const itemDate = new Date(item.dueDate);
        itemDateStr = itemDate.getFullYear() + '-' + 
          String(itemDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(itemDate.getDate()).padStart(2, '0');
      }
      
      return itemDateStr === calendarDateStr;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getSourceCounts = () => {
    const allItems = getAllCalendarItems();
    return {
      all: allItems.length,
      projects: allItems.filter(item => item.source === 'project').length,
      meetings: allItems.filter(item => item.source === 'meeting').length,
    };
  };

  const sourceCounts = getSourceCounts();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  
  // Create array of dates for the calendar
  const calendarDates = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const day = prevMonth.getDate() - (firstDay - 1 - i);
    calendarDates.push(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day));
  }
  
  // Add days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDates.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }
  
  // Add days from next month to fill the grid
  const remainingCells = 42 - calendarDates.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarDates.push(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day));
  }

  const upcomingItems = filteredCalendarItems
    .filter(item => {
      const itemDueDate = item.dueDate;
      if (!itemDueDate) return false;
      
      // Apply source filter
      if (sourceFilter === 'projects' && item.source !== 'project') return false;
      if (sourceFilter === 'meetings' && item.source !== 'meeting') return false;
      
      // Parse the due date properly
      const itemDate = typeof itemDueDate === 'string' 
        ? new Date(itemDueDate + 'T00:00:00') // Add time to avoid timezone issues
        : new Date(itemDueDate);
        
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for proper comparison
      
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0); // End of next month
      return itemDate >= today && itemDate <= nextMonth;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 10);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Calendar</h1>
          <p className="text-gray-600 text-sm sm:text-base">View all your project deadlines and tasks in one place</p>
          
          {/* Source Filter */}
          <div className="mt-4">
            <div className="flex bg-gray-100/80 rounded-xl p-1 w-fit">
              <button
                onClick={() => setSourceFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  sourceFilter === 'all' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({sourceCounts.all})
              </button>
              <button
                onClick={() => setSourceFilter('projects')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  sourceFilter === 'projects' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Projects ({sourceCounts.projects})
              </button>
              <button
                onClick={() => setSourceFilter('meetings')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  sourceFilter === 'meetings' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Meetings ({sourceCounts.meetings})
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-2 sm:px-4 py-1 sm:py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm sm:text-base touch-manipulation"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-3 sm:p-4 lg:p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-4 mb-2 sm:mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-4">
                  {calendarDates.map((date, index) => {
                    const items = getItemsForDate(date);
                    const hasItems = items.length > 0;
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-20 sm:min-h-24 lg:min-h-32 p-1 sm:p-2 lg:p-3 border rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                          isCurrentMonth(date)
                            ? 'bg-white border-gray-200 hover:border-gray-300'
                            : 'bg-gray-50 border-gray-100'
                        } ${
                          isToday(date)
                            ? 'ring-2 ring-blue-500 border-blue-500'
                            : ''
                        } ${
                          hasItems
                            ? 'hover:shadow-md'
                            : ''
                        }`}
                      >
                        <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                          isCurrentMonth(date)
                            ? isToday(date)
                              ? 'text-blue-600'
                              : 'text-gray-900'
                            : 'text-gray-400'
                        }`}>
                          {date.getDate()}
                        </div>
                        
                        {hasItems && (
                          <div className="space-y-0.5 sm:space-y-1">
                            {items.slice(0, 3).map(item => (
                              <div
                                key={item.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedItem(item);
                                }}
                                className={`text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-md truncate cursor-pointer hover:opacity-80 transition-opacity ${
                                  item.type === 'todo' 
                                    ? item.completed
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-blue-100 text-blue-700'
                                    : item.type === 'note'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {item.type === 'todo' ? '✓ ' : item.type === 'note' ? '📝 ' : '📋 '}
                                {item.title}
                              </div>
                            ))}
                            
                            {items.length > 3 && (
                              <div className="text-xs text-gray-500 px-1 sm:px-2">
                                +{items.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Upcoming Items */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Upcoming</h3>
              
              {upcomingItems.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-gray-500 text-xs sm:text-sm">No upcoming items</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {upcomingItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors touch-manipulation"
                    >
                      <div className={`p-1.5 sm:p-2 rounded-lg ${
                        item.type === 'todo' 
                          ? 'bg-blue-100 text-blue-600' 
                          : item.type === 'note'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {item.type === 'todo' ? <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4" /> :
                         item.type === 'note' ? <FileText className="w-3 h-3 sm:w-4 sm:h-4" /> :
                         <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.title}</h4>
                        <p className="text-xs text-gray-600">
                          {new Date(item.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Overview */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Projects</h3>
              <div className="space-y-2 sm:space-y-3">
                {projects.slice(0, 5).map(project => (
                  <div
                    key={project.id}
                    onClick={() => onProjectSelect(project)}
                    onMouseEnter={(e) => handleItemMouseEnter({
                      id: `project-${project.id}`,
                      title: project.title,
                      type: 'project',
                      dueDate: project.dueDate || project.due_date || '',
                      project,
                      description: project.description
                    }, e)}
                    onMouseLeave={handleItemMouseLeave}
                    onMouseMove={handleItemMouseMove}
                    className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors touch-manipulation"
                  >
                    <div 
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{project.title}</p>
                      <p className="text-xs text-gray-500">
                        {project.todos.length} tasks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item Tooltip */}
      <ItemTooltip
        item={hoveredItem}
        position={mousePosition}
        visible={!!hoveredItem}
      />

      {/* Detail Popup */}
      {selectedItem && (
        <DetailPopup
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onProjectSelect={onProjectSelect}
        />
      )}
    </div>
  );
};

export default ConsolidatedCalendar;