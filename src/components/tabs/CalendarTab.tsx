import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, FileText, CheckSquare } from 'lucide-react';
import { Project } from '../../types';

interface CalendarTabProps {
  project: Project;
}

const CalendarTab: React.FC<CalendarTabProps> = ({ project }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const getItemsForDate = (date: Date) => {
    // Format calendar date as YYYY-MM-DD to match database format
    const calendarDateStr = date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
    
    const notesForDate = project.notes.filter(note => {
      const noteDueDate = note.dueDate || note.due_date;
      if (!noteDueDate) return false;
      
      // Handle both string and Date formats
      const noteDateStr = typeof noteDueDate === 'string' 
        ? noteDueDate.split('T')[0] 
        : noteDueDate.getFullYear() + '-' + 
          String(noteDueDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(noteDueDate.getDate()).padStart(2, '0');
          
      return noteDateStr === calendarDateStr;
    });
    
    const todosForDate = project.todos.filter(todo => {
      const dueDate = todo.dueDate || todo.due_date;
      if (!dueDate) return false;
      
      // Handle both string and Date formats
      const todoDateStr = typeof dueDate === 'string' 
        ? dueDate.split('T')[0] 
        : new Date(dueDate.getTime() + (12 * 60 * 60 * 1000)).toISOString().split('T')[0];
          
      return todoDateStr === calendarDateStr;
    });
    
    // Add meeting todos for this date
    const meetingTodosForDate = (project.meetings || []).flatMap(meeting => 
      (meeting.todos || []).filter(meetingTodo => {
        const dueDate = meetingTodo.dueDate;
        if (!dueDate) return false;
        
        const todoDateStr = typeof dueDate === 'string' 
          ? dueDate.split('T')[0] 
          : dueDate;
          
        return todoDateStr === calendarDateStr;
      }).map(meetingTodo => ({
        ...meetingTodo,
        title: `📅 ${meetingTodo.title}${meetingTodo.assignedTo ? ` (${meetingTodo.assignedTo})` : ''}`,
        type: 'meeting-todo' as const,
        meetingTitle: meeting.title
      }))
    );
    
    // Also check if project itself is due on this date
    let projectDueDate = null;
    const projectDue = project.dueDate || project.due_date;
    if (projectDue) {
      projectDueDate = typeof projectDue === 'string' 
        ? projectDue.split('T')[0] 
        : projectDue.getFullYear() + '-' + 
          String(projectDue.getMonth() + 1).padStart(2, '0') + '-' + 
          String(projectDue.getDate()).padStart(2, '0');
    }
    const isProjectDue = projectDueDate === calendarDateStr;
    
    return { 
      notes: notesForDate, 
      todos: todosForDate,
      meetingTodos: meetingTodosForDate,
      isProjectDue
    };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

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
  const remainingCells = 42 - calendarDates.length; // 6 rows × 7 days = 42 cells
  for (let day = 1; day <= remainingCells; day++) {
    calendarDates.push(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDates.map((date, index) => {
              const items = getItemsForDate(date);
              const hasItems = items.notes.length > 0 || items.todos.length > 0 || items.isProjectDue;
              
              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border rounded-lg transition-colors ${
                    isCurrentMonth(date)
                      ? 'bg-white border-gray-200 hover:border-gray-300'
                      : 'bg-gray-50 border-gray-100'
                  } ${
                    isToday(date)
                      ? 'ring-2 ring-blue-500 border-blue-500'
                      : ''
                  } ${
                    hasItems
                      ? 'hover:shadow-md cursor-pointer'
                      : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isCurrentMonth(date)
                      ? isToday(date)
                        ? 'text-blue-600'
                        : 'text-gray-900'
                      : 'text-gray-400'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  {hasItems && (
                    <div className="space-y-1">
                      {items.isProjectDue && (
                        <div className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-md truncate hover:opacity-80 transition-opacity cursor-pointer">
                          📋 {project.title}
                        </div>
                      )}
                      
                      {items.todos.slice(0, 2).map(todo => (
                        <div
                          key={todo.id}
                          className={`text-xs px-2 py-1 rounded-md truncate hover:opacity-80 transition-opacity cursor-pointer ${
                            todo.completed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {todo.title}
                        </div>
                      ))}
                      
                      {items.notes.slice(0, 2).map(note => (
                        <div
                          key={note.id}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-md truncate hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          📝 {note.title}
                        </div>
                      ))}
                      
                      {(items.todos.length + items.notes.length + (items.isProjectDue ? 1 : 0)) > 2 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{(items.todos.length + items.notes.length + (items.isProjectDue ? 1 : 0)) - 2} more
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

      {/* Upcoming Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Items</h3>
        
        {/* Get upcoming items (next 7 days) */}
        {(() => {
          const today = new Date();
          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          const upcomingTodos = project.todos.filter(todo => {
            const dueDate = todo.dueDate || todo.due_date;
            if (!dueDate) return false;
            const dueDateObj = typeof dueDate === 'string' 
              ? new Date(dueDate + 'T00:00:00') 
              : new Date(dueDate);
            return dueDate >= today && dueDate <= nextWeek;
          }).sort((a, b) => {
            const aDate = typeof (a.dueDate || a.due_date) === 'string' 
              ? new Date((a.dueDate || a.due_date) + 'T00:00:00') 
              : new Date(a.dueDate || a.due_date);
            const bDate = typeof (b.dueDate || b.due_date) === 'string' 
              ? new Date((b.dueDate || b.due_date) + 'T00:00:00') 
              : new Date(b.dueDate || b.due_date);
            return aDate.getTime() - bDate.getTime();
          });
          
          const upcomingNotes = project.notes.filter(note => {
            const noteDueDate = note.dueDate || note.due_date;
            if (!noteDueDate) return false;
            const dueDateObj = new Date(noteDueDate + 'T12:00:00');
            return dueDateObj >= today && dueDateObj <= nextWeek;
          }).sort((a, b) => {
            const aDueDate = a.dueDate || a.due_date;
            const bDueDate = b.dueDate || b.due_date;
            const aDate = new Date(aDueDate + 'T12:00:00');
            const bDate = new Date(bDueDate + 'T12:00:00');
            return aDate.getTime() - bDate.getTime();
          });
          
          const allUpcoming = [
            ...upcomingTodos.map(todo => ({ ...todo, type: 'todo' as const })),
            ...upcomingNotes.map(note => ({ ...note, type: 'note' as const }))
          ].sort((a, b) => {
            const aDate = new Date((a.dueDate || a.due_date) + 'T12:00:00');
            const bDate = new Date((b.dueDate || b.due_date) + 'T12:00:00');
            return aDate.getTime() - bDate.getTime();
          });
          
          if (allUpcoming.length === 0) {
            return (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming items in the next 7 days</p>
              </div>
            );
          }
          
          return (
            <div className="space-y-3">
              {allUpcoming.map(item => (
                <div key={`${item.type}-${item.id}`} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    item.type === 'todo' 
                      ? 'bg-blue-100 text-blue-600' 
                      : item.type === 'meeting-todo'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {item.type === 'todo' ? <CheckSquare className="w-4 h-4" /> : 
                     item.type === 'meeting-todo' ? <CheckSquare className="w-4 h-4" /> :
                     <FileText className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    {item.type === 'meeting-todo' && (
                      <p className="text-xs text-gray-500 mt-1">From: {item.meetingTitle}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      Due {new Date((item.dueDate || item.due_date)!).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {(item.type === 'todo' || item.type === 'meeting-todo') && 'priority' in item && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'high' ? 'bg-red-100 text-red-700' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default CalendarTab;