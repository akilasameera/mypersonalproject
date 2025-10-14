import React, { useState } from 'react';
import { CheckSquare, Calendar, AlertCircle, FolderOpen, Edit, Trash2, Plus, Filter, X } from 'lucide-react';
import { Project, Todo } from '../types';
import { useTodos } from '../hooks/useTodos';

interface AllTodosViewProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
}

const AllTodosView: React.FC<AllTodosViewProps> = ({ projects, onProjectSelect }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate');
  const [dateFilter, setDateFilter] = useState({
    fromDate: '',
    toDate: ''
  });
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Get all todos from all projects
  const allTodos = projects.flatMap(project => 
    project.todos.map(todo => ({
      ...todo,
      projectTitle: project.title,
      projectColor: project.color,
      project: project
    }))
  );

  // Filter todos
  const filteredTodos = allTodos.filter(todo => {
    // Filter by completion status
    let statusMatch = true;
    if (filter === 'pending') statusMatch = !todo.completed;
    if (filter === 'completed') statusMatch = todo.completed;
    
    // Filter by date range
    let dateMatch = true;
    const todoDueDate = todo.dueDate || todo.due_date;

    if (!todoDueDate) {
      dateMatch = false;
    } else {
      const todoDate = new Date(todoDueDate);

      if (dateFilter.fromDate) {
        const fromDate = new Date(dateFilter.fromDate);
        if (todoDate < fromDate) {
          dateMatch = false;
        }
      }

      if (dateFilter.toDate) {
        const toDate = new Date(dateFilter.toDate);
        toDate.setDate(toDate.getDate() + 1); // Include end date
        if (todoDate > toDate) {
          dateMatch = false;
        }
      }
    }
    
    return statusMatch && dateMatch;
  });

  // Sort todos
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (sortBy === 'created') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
        timeZone: 'America/Los_Angeles',
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const pendingCount = allTodos.filter(todo => !todo.completed).length;
  const completedCount = allTodos.filter(todo => todo.completed).length;
  const overdueCount = allTodos.filter(todo => !todo.completed && todo.dueDate && isOverdue(todo.dueDate)).length;

  const clearDateFilter = () => {
    setDateFilter({ fromDate: '', toDate: '' });
  };

  const hasDateFilter = dateFilter.fromDate || dateFilter.toDate;
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">All Todos</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage all your tasks across all projects</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{allTodos.length}</p>
                <p className="text-gray-600 text-xs sm:text-sm">Total Tasks</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{pendingCount}</p>
                <p className="text-gray-600 text-xs sm:text-sm">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{completedCount}</p>
                <p className="text-gray-600 text-xs sm:text-sm">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{overdueCount}</p>
                <p className="text-gray-600 text-xs sm:text-sm">Overdue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="space-y-3 sm:space-y-4">
            {/* First Row - Status Filter and Sort */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
              <div className="flex items-center">
                <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-manipulation ${
                      filter === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All ({allTodos.length})
                  </button>
                  <button
                    onClick={() => setFilter('pending')}
                    className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-manipulation ${
                      filter === 'pending'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    onClick={() => setFilter('completed')}
                    className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-manipulation ${
                      filter === 'completed'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Completed ({completedCount})
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                <button
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                    showDateFilter || hasDateFilter
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Date Filter</span>
                  {hasDateFilter && (
                    <span className="bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs">
                      Active
                    </span>
                  )}
                </button>
                
                <div className="flex items-center space-x-2 sm:space-x-2">
                  <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'created')}
                    className="flex-1 sm:flex-none px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="created">Created Date</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Second Row - Date Filter */}
            {showDateFilter && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2 justify-center sm:justify-start">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">Filter by Due Date:</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <div className="flex items-center space-x-2 flex-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-600 w-12 sm:w-auto">From:</label>
                      <input
                        type="date"
                        value={dateFilter.fromDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, fromDate: e.target.value }))}
                        className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-600 w-12 sm:w-auto">To:</label>
                      <input
                        type="date"
                        value={dateFilter.toDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, toDate: e.target.value }))}
                        className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    
                    {hasDateFilter && (
                      <button
                        onClick={clearDateFilter}
                        className="flex items-center justify-center space-x-1 px-2 sm:px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {hasDateFilter && (
                  <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-blue-700 text-center sm:text-left">
                    <span className="font-medium">Showing {filteredTodos.length} tasks</span>
                    {dateFilter.fromDate && dateFilter.toDate && (
                      <span> from {new Date(dateFilter.fromDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })} to {new Date(dateFilter.toDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}</span>
                    )}
                    {dateFilter.fromDate && !dateFilter.toDate && (
                      <span> from {new Date(dateFilter.fromDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })} onwards</span>
                    )}
                    {!dateFilter.fromDate && dateFilter.toDate && (
                      <span> until {new Date(dateFilter.toDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        {hasDateFilter && (
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {filteredTodos.length} tasks match your date filter
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {filteredTodos.filter(t => !t.completed).length} pending, {filteredTodos.filter(t => t.completed).length} completed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Todos List */}
        {sortedTodos.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <CheckSquare className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </h3>
            <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base px-4">
              {hasDateFilter
                ? 'No tasks found in the selected date range'
                : filter === 'all' 
                  ? 'Create your first task in a project to get started'
                  : `You don't have any ${filter} tasks at the moment`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {sortedTodos.map(todo => (
              <div
                key={`${todo.project.id}-${todo.id}`}
                className={`bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow ${
                  todo.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="flex-1">
                        <h3 className={`font-semibold text-base sm:text-lg ${
                          todo.completed ? 'text-gray-600 line-through' : 'text-gray-900'
                        }`}>
                          {todo.title}
                        </h3>
                        {todo.description && (
                          <p className={`text-xs sm:text-sm mt-1 ${
                            todo.completed ? 'text-gray-500 line-through' : 'text-gray-600'
                          }`}>
                            {todo.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
                      {/* Project */}
                      <button
                        onClick={() => onProjectSelect(todo.project)}
                        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs sm:text-sm transition-colors touch-manipulation"
                      >
                        <div 
                          className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                          style={{ backgroundColor: todo.projectColor }}
                        />
                        <FolderOpen className="w-3 h-3 sm:w-3 sm:h-3" />
                        <span>{todo.projectTitle}</span>
                      </button>

                      {/* Priority */}
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>

                      {/* Due Date */}
                      {todo.dueDate && (
                        <div className={`flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full text-xs ${
                          isOverdue(todo.dueDate) && !todo.completed
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Calendar className="w-2 h-2 sm:w-3 sm:h-3" />
                          <span>Due {formatDate(todo.dueDate)}</span>
                          {isOverdue(todo.dueDate) && !todo.completed && <AlertCircle className="w-2 h-2 sm:w-3 sm:h-3" />}
                        </div>
                      )}

                      {(todo.due_date && !todo.dueDate) && (
                        <div className={`flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full text-xs ${
                          isOverdue(todo.due_date) && !todo.completed
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Calendar className="w-2 h-2 sm:w-3 sm:h-3" />
                          <span>Due {formatDate(todo.due_date)}</span>
                          {isOverdue(todo.due_date) && !todo.completed && <AlertCircle className="w-2 h-2 sm:w-3 sm:h-3" />}
                        </div>
                      )}

                      {/* Completion Status */}
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        todo.completed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {todo.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>

                    {todo.notes && (
                      <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">{todo.notes}</p>
                      </div>
                    )}
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

export default AllTodosView;