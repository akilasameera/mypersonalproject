import React from 'react';
import { Calendar, Target } from 'lucide-react';
import { Project } from '../../types';

interface WeeklyActionsProps {
  thisWeekTodos: any[];
  onProjectSelect: (project: Project) => void;
  getPriorityColor: (priority: string) => string;
}

const WeeklyActions: React.FC<WeeklyActionsProps> = ({ 
  thisWeekTodos, 
  onProjectSelect, 
  getPriorityColor 
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-lg mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-200 rounded-lg">
          <Target className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">This Week's Actions</h3>
          <p className="text-sm text-gray-600">{thisWeekTodos.length} tasks due this week</p>
        </div>
      </div>

      {thisWeekTodos.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tasks due this week</p>
          <p className="text-sm text-gray-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {thisWeekTodos.map(todo => (
            <div
              key={`${todo.project.id}-${todo.id}`}
              className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => onProjectSelect(todo.project)}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: todo.project.color }} />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate text-sm">{todo.title}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-600">{todo.project.title}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                    {todo.priority}
                  </span>
                  {(todo.startDate || todo.start_date) && (
                    <span className="text-xs text-blue-600 font-medium">
                      Start {new Date((todo.startDate || todo.start_date) + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  {(todo.endDate || todo.end_date) && (
                    <span className="text-xs text-purple-600 font-medium">
                      End {new Date((todo.endDate || todo.end_date) + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeeklyActions;