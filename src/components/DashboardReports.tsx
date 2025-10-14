import React, { useMemo, useState } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Target,
  FileText,
  Link,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  FolderOpen,
  Users,
  Zap
} from 'lucide-react';
import { Project, Todo, Note } from '../types';
import MetricsCards from './dashboard/MetricsCards';
import WeeklyActions from './dashboard/WeeklyActions';
import DraggableTile from './dashboard/DraggableTile';

interface DashboardReportsProps {
  projects: Project[];
  user: any;
  onProjectSelect: (project: Project) => void;
}

interface TileConfig {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large';
}

const DashboardReports: React.FC<DashboardReportsProps> = ({ projects, user, onProjectSelect }) => {
  const [draggedTile, setDraggedTile] = useState<string | null>(null);
  
  // Load saved layout from localStorage or use default
  const getInitialTileConfig = (): TileConfig[] => {
    try {
      const saved = localStorage.getItem(`dashboard-layout-${user.id}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading dashboard layout:', error);
    }
    
    // Default layout
    return [
      { id: 'highPriority', title: 'High Priority Actions', size: 'small' },
      { id: 'projectPerformance', title: 'Project Performance', size: 'medium' },
      { id: 'weeklySummary', title: 'Weekly Summary', size: 'small' },
      { id: 'recentActivity', title: 'Recent Activity', size: 'small' },
      { id: 'productivity', title: 'Productivity Score', size: 'small' },
      { id: 'quickActions', title: 'Quick Actions', size: 'small' },
      { id: 'projectStatus', title: 'Project Status', size: 'small' },
    ];
  };
  
  const [tileConfigs, setTileConfigs] = useState<TileConfig[]>(getInitialTileConfig);
  
  // Save layout to localStorage whenever it changes
  const updateTileConfigs = (newConfigs: TileConfig[]) => {
    setTileConfigs(newConfigs);
    try {
      localStorage.setItem(`dashboard-layout-${user.id}`, JSON.stringify(newConfigs));
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
    }
  };

  // Calculate dashboard metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const allTodos = projects.flatMap(p => p.todos.map(t => ({ ...t, project: p })));
    const allNotes = projects.flatMap(p => p.notes.map(n => ({ ...n, project: p })));
    
    const thisWeekTodos = allTodos.filter(todo => {
      const dueDate = todo.dueDate || todo.due_date;
      if (!dueDate) return false;
      const due = new Date(dueDate);
      return due >= weekStart && due <= weekEnd;
    });
    
    const overdueTodos = allTodos.filter(todo => {
      const dueDate = todo.dueDate || todo.due_date;
      if (!dueDate || todo.completed) return false;
      return new Date(dueDate) < now;
    });
    
    const highPriorityTodos = allTodos.filter(todo => 
      !todo.completed && todo.priority === 'high'
    );
    
    const projectStats = projects.map(project => {
      const totalTodos = project.todos.length;
      const completedTodos = project.todos.filter(t => t.completed).length;
      const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;
      
      return {
        ...project,
        totalTodos,
        completedTodos,
        completionRate,
        pendingTodos: totalTodos - completedTodos
      };
    });
    
    const recentActivity = [
      ...allTodos.filter(todo => {
        const created = new Date(todo.createdAt || todo.created_at);
        return (now.getTime() - created.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      }).map(todo => ({ ...todo, type: 'todo' as const })),
      ...allNotes.filter(note => {
        const created = new Date(note.createdAt || note.created_at);
        return (now.getTime() - created.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      }).map(note => ({ ...note, type: 'note' as const }))
    ].sort((a, b) => 
      new Date(b.createdAt || b.created_at).getTime() - 
      new Date(a.createdAt || a.created_at).getTime()
    );
    
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalTodos: allTodos.length,
      completedTodos: allTodos.filter(t => t.completed).length,
      pendingTodos: allTodos.filter(t => !t.completed).length,
      thisWeekTodos,
      overdueTodos,
      highPriorityTodos,
      projectStats,
      recentActivity: recentActivity.slice(0, 10),
      totalNotes: allNotes.length,
      totalLinks: projects.reduce((sum, p) => sum + p.links.length, 0)
    };
  }, [projects]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getCompletionTrend = (completionRate: number) => {
    if (completionRate >= 80) return { icon: ArrowUp, color: 'text-green-600', bg: 'bg-green-100' };
    if (completionRate >= 50) return { icon: Minus, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { icon: ArrowDown, color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleDragStart = (tileId: string) => {
    setDraggedTile(tileId);
  };

  const handleDragEnd = () => {
    setDraggedTile(null);
  };

  const handleDrop = (targetTileId: string) => {
    if (!draggedTile || draggedTile === targetTileId) return;

    const newConfigs = [...tileConfigs];
    const draggedIndex = newConfigs.findIndex(t => t.id === draggedTile);
    const targetIndex = newConfigs.findIndex(t => t.id === targetTileId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged item and insert at target position
    const [draggedConfig] = newConfigs.splice(draggedIndex, 1);
    newConfigs.splice(targetIndex, 0, draggedConfig);

    updateTileConfigs(newConfigs);
  };

  const handleResize = (tileId: string, newSize: 'small' | 'medium' | 'large') => {
    const newConfigs = tileConfigs.map(config =>
      config.id === tileId ? { ...config, size: newSize } : config
    );
    updateTileConfigs(newConfigs);
  };

  const renderTileContent = (tileId: string) => {
    switch (tileId) {
      case 'highPriority':
        return (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
                <Zap className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{metrics.highPriorityTodos.length} urgent tasks</p>
              </div>
            </div>

            {metrics.highPriorityTodos.length === 0 ? (
              <div className="text-center py-6">
                <CheckSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No high priority tasks</p>
                <p className="text-xs text-gray-400">Great job staying on top of priorities!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {metrics.highPriorityTodos.slice(0, 4).map(todo => (
                  <div
                    key={`${todo.project.id}-${todo.id}`}
                    className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => onProjectSelect(todo.project)}
                  >
                    <div className="p-1 bg-red-100 rounded">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate text-sm">{todo.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-600">{todo.project.title}</span>
                        {(todo.dueDate || todo.due_date) && (
                          <span className="text-xs text-red-600 font-medium">
                            Due {formatDate(todo.dueDate || todo.due_date)}
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

      case 'projectPerformance':
        return (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion rates</p>
              </div>
            </div>

            <div className="space-y-3">
              {metrics.projectStats.slice(0, 5).map(project => {
                const trend = getCompletionTrend(project.completionRate);
                return (
                  <div
                    key={project.id}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => onProjectSelect(project)}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate text-sm">{project.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-12 bg-gray-200 rounded-full h-1">
                          <div
                            className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${project.completionRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {Math.round(project.completionRate)}%
                        </span>
                      </div>
                    </div>
                    <div className={`p-1 rounded ${trend.bg}`}>
                      <trend.icon className={`w-3 h-3 ${trend.color}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'weeklySummary':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900 text-sm">Tasks Due</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{metrics.thisWeekTodos.length}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-gray-900 text-sm">Total Notes</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{metrics.totalNotes}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Link className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900 text-sm">Saved Links</span>
              </div>
              <span className="text-lg font-bold text-green-600">{metrics.totalLinks}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-gray-900 text-sm">Active Projects</span>
              </div>
              <span className="text-lg font-bold text-orange-600">{metrics.activeProjects}</span>
            </div>
          </div>
        );

      case 'recentActivity':
        return (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last 7 days</p>
              </div>
            </div>

            {metrics.recentActivity.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-2">
                {metrics.recentActivity.slice(0, 6).map(item => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => onProjectSelect(item.project)}
                  >
                    <div className={`p-1 rounded ${
                      item.type === 'todo' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {item.type === 'todo' ? <CheckSquare className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{item.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-600">{item.project.title}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(item.createdAt || item.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'productivity':
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray={`${(metrics.completedTodos / Math.max(metrics.totalTodos, 1)) * 100}, 100`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">
                  {Math.round((metrics.completedTodos / Math.max(metrics.totalTodos, 1)) * 100)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">Task completion rate</p>
          </div>
        );

      case 'quickActions':
        return (
          <div className="space-y-3">
            <button
              onClick={() => onProjectSelect(projects[0])}
              className="w-full p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg transition-all duration-300 text-left border border-blue-100"
            >
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900 text-sm">View Projects</span>
              </div>
            </button>

            <button className="w-full p-3 bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 rounded-lg transition-all duration-300 text-left border border-green-100">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900 text-sm">View Calendar</span>
              </div>
            </button>

            <button className="w-full p-3 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg transition-all duration-300 text-left border border-orange-100">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-gray-900 text-sm">All Todos</span>
              </div>
            </button>
          </div>
        );

      case 'projectStatus':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Active</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {projects.filter(p => p.status === 'active').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">On Hold</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {projects.filter(p => p.status === 'hold').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Completed</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {projects.filter(p => p.status === 'completed').length}
              </span>
            </div>
          </div>
        );

      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 to-purple-700 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Weekly reports and action items</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Welcome back, {user.name} • {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Key Metrics - Fixed Top Row */}
        <MetricsCards metrics={metrics} />

        {/* This Week's Actions - Fixed Second Row */}
        <WeeklyActions 
          thisWeekTodos={metrics.thisWeekTodos}
          onProjectSelect={onProjectSelect}
          getPriorityColor={getPriorityColor}
        />

        {/* Draggable Tiles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-min">
          {tileConfigs.map(config => (
            <DraggableTile
              key={config.id}
              id={config.id}
              title={config.title}
              size={config.size}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onResize={handleResize}
              isDragging={draggedTile === config.id}
            >
              {renderTileContent(config.id)}
            </DraggableTile>
          ))}
        </div>

        {/* Reset Layout Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              const defaultConfigs = [
                { id: 'highPriority', title: 'High Priority Actions', size: 'medium' as const },
                { id: 'projectPerformance', title: 'Project Performance', size: 'medium' as const },
                { id: 'weeklySummary', title: 'Weekly Summary', size: 'medium' as const },
                { id: 'recentActivity', title: 'Recent Activity', size: 'medium' as const },
                { id: 'productivity', title: 'Productivity Score', size: 'small' as const },
                { id: 'quickActions', title: 'Quick Actions', size: 'small' as const },
                { id: 'projectStatus', title: 'Project Status', size: 'small' as const }
              ];
              updateTileConfigs(defaultConfigs);
            }}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
          >
            Reset Dashboard Layout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardReports;