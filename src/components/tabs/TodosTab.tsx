import React, { useState } from 'react';
import { Plus, Edit, Trash2, Check, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { Todo } from '../../types';
import { useTodos } from '../../hooks/useTodos';

interface TodosTabProps {
  projectId: string;
  todos: Todo[];
  onUpdateTodos: (todos: Todo[]) => void;
}

const TodosTab: React.FC<TodosTabProps> = ({ projectId, todos, onUpdateTodos }) => {
  const { createTodo, updateTodo, toggleTodo, deleteTodo, loading } = useTodos(projectId);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTodo) {
        // Update existing todo
        const updatedTodo = await updateTodo(editingTodo.id, {
          title: formData.title,
          description: formData.description || undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          priority: formData.priority,
          notes: formData.notes || undefined,
          completed: editingTodo.completed,
        });
        
        const updatedTodos = todos.map(todo => 
          todo.id === editingTodo.id ? updatedTodo : todo
        );
        onUpdateTodos(updatedTodos);
      } else {
        // Create new todo
        const newTodo = await createTodo({
          title: formData.title,
          description: formData.description || undefined,
          completed: false,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          priority: formData.priority,
          notes: formData.notes || undefined,
        });
        
        onUpdateTodos([newTodo, ...todos]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  const handleToggleComplete = async (todoId: string) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;
      
      const updatedTodo = await toggleTodo(todoId, !todo.completed);
      const updatedTodos = todos.map(t => 
        t.id === todoId ? updatedTodo : t
      );
      onUpdateTodos(updatedTodos);
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      startDate: todo.startDate || '',
      endDate: todo.endDate || todo.dueDate || '', // Use endDate or fallback to dueDate for compatibility
      priority: todo.priority,
      notes: todo.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (todoId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTodo(todoId);
        const updatedTodos = todos.filter(todo => todo.id !== todoId);
        onUpdateTodos(updatedTodos);
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', startDate: '', endDate: '', priority: 'medium', notes: '' });
    setEditingTodo(null);
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown';
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const completedTodos = todos.filter(todo => todo.completed);
  const pendingTodos = todos.filter(todo => !todo.completed);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTodos(new Set(pendingTodos.map(todo => todo.id)));
    } else {
      setSelectedTodos(new Set());
    }
  };

  const handleSelectTodo = (todoId: string, checked: boolean) => {
    const newSelected = new Set(selectedTodos);
    if (checked) {
      newSelected.add(todoId);
    } else {
      newSelected.delete(todoId);
    }
    setSelectedTodos(newSelected);
  };

  const handleBulkComplete = async () => {
    if (selectedTodos.size === 0) return;
    
    try {
      const promises = Array.from(selectedTodos).map(todoId => 
        toggleTodo(todoId, true)
      );
      
      await Promise.all(promises);
      
      // Update todos state
      const updatedTodos = todos.map(todo => 
        selectedTodos.has(todo.id) ? { ...todo, completed: true } : todo
      );
      onUpdateTodos(updatedTodos);
      
      // Clear selection
      setSelectedTodos(new Set());
    } catch (error) {
      console.error('Error completing todos:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTodos.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedTodos.size} selected tasks?`)) {
      try {
        const promises = Array.from(selectedTodos).map(todoId => 
          deleteTodo(todoId)
        );
        
        await Promise.all(promises);
        
        // Update todos state
        const updatedTodos = todos.filter(todo => !selectedTodos.has(todo.id));
        onUpdateTodos(updatedTodos);
        
        // Clear selection
        setSelectedTodos(new Set());
      } catch (error) {
        console.error('Error deleting todos:', error);
      }
    }
  };

  const isAllSelected = pendingTodos.length > 0 && pendingTodos.every(todo => selectedTodos.has(todo.id));
  const isPartiallySelected = selectedTodos.size > 0 && !isAllSelected;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Todos</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{pendingTodos.length} pending</span>
            <span>{completedTodos.length} completed</span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingTodo ? 'Edit Task' : 'Create New Task'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What needs to be done?"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Additional details..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full transition-all duration-300 cursor-pointer"
                  placeholder="Select start date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full transition-all duration-300 cursor-pointer"
                  placeholder="Select end date"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Additional notes for this task..."
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
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Saving...' : editingTodo ? 'Update' : 'Create'} Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Todos List */}
      {todos.length === 0 ? (
        <div className="text-center py-12">
          <Check className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-500 mb-4">Create your first task to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Add Task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pending Tasks */}
          {pendingTodos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium text-gray-900">Pending Tasks</h3>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isPartiallySelected;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Select All ({pendingTodos.length})
                      </span>
                    </label>
                  </div>
                </div>
                
                {selectedTodos.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 font-medium">
                      {selectedTodos.size} selected
                    </span>
                    <button
                      onClick={handleBulkComplete}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Complete</span>
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {pendingTodos.map(todo => (
                  <div key={todo.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedTodos.has(todo.id)}
                        onChange={(e) => handleSelectTodo(todo.id, e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleToggleComplete(todo.id)}
                        className="mt-1 w-5 h-5 border-2 border-gray-300 rounded hover:border-blue-500 transition-colors flex items-center justify-center"
                      >
                        {todo.completed && <Check className="w-3 h-3 text-blue-500" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{todo.title}</h4>
                            {todo.description && (
                              <p className="text-gray-600 text-sm mt-1">{todo.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                                {todo.priority}
                              </span>
                              
                              {todo.dueDate && (
                                <div className={`flex items-center space-x-1 text-sm ${
                                  isOverdue(todo.dueDate) ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  <Calendar className="w-4 h-4" />
                                  <span>Due {formatDateOnly(todo.dueDate)}</span>
                                  {isOverdue(todo.dueDate) && <AlertCircle className="w-4 h-4" />}
                                </div>
                              )}
                              
                              {todo.startDate && (
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>Start {formatDateOnly(todo.startDate)}</span>
                                </div>
                              )}
                              
                              {todo.endDate && (
                                <div className={`flex items-center space-x-1 text-sm ${
                                  isOverdue(todo.endDate) ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  <Calendar className="w-4 h-4" />
                                  <span>End {formatDateOnly(todo.endDate)}</span>
                                  {isOverdue(todo.endDate) && <AlertCircle className="w-4 h-4" />}
                                </div>
                              )}
                              
                              {(todo.due_date && !todo.dueDate) && (
                                <div className={`flex items-center space-x-1 text-sm ${
                                  isOverdue(todo.due_date) ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  <Calendar className="w-4 h-4" />
                                  <span>Due {formatDateOnly(todo.due_date)}</span>
                                  {isOverdue(todo.due_date) && <AlertCircle className="w-4 h-4" />}
                                </div>
                              )}
                              
                              {todo.notes && (
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Has notes</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEdit(todo)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(todo.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {todo.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{todo.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTodos.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Completed Tasks</h3>
              <div className="space-y-3">
                {completedTodos.map(todo => (
                  <div key={todo.id} className="bg-gray-50 rounded-lg border border-gray-100 p-4">
                    <div className="flex items-start space-x-4 opacity-75">
                      <button
                        onClick={() => handleToggleComplete(todo.id)}
                        className="mt-1 w-5 h-5 bg-green-500 rounded flex items-center justify-center hover:bg-green-600 transition-colors"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-700 line-through">{todo.title}</h4>
                            {todo.description && (
                              <p className="text-gray-500 text-sm mt-1 line-through">{todo.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEdit(todo)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(todo.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TodosTab;