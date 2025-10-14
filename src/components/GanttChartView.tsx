import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { Calendar, Plus, Filter, ChevronLeft, ChevronRight, BarChart3, Clock, FolderOpen, Edit, Trash2, X, Brain, Wand2 } from 'lucide-react';
import { Project, Todo } from '../types';
import { supabase } from '../lib/supabase';
import ImageTaskExtractor from './ImageTaskExtractor';

interface GanttChartViewProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onRefreshProjects: () => void;
}

interface GanttTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  projectId: string;
  projectTitle: string;
  projectColor: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  status: 'Not Started' | 'In Progress' | 'Complete' | 'On Hold';
  originalTodo?: Todo;
}

interface TaskFormData {
  title: string;
  projectId: string;
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high';
}

interface TaskTooltipProps {
  task: GanttTask;
  position: { x: number; y: number };
  visible: boolean;
}

const TaskTooltip: React.FC<TaskTooltipProps> = ({ task, position, visible }) => {
  if (!visible || !task) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
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

  const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      className="fixed z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-4 max-w-sm pointer-events-none"
      style={{
        left: Math.min(position.x + 10, window.innerWidth - 320),
        top: Math.max(position.y - 10, 10),
      }}
    >
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-gray-900 text-base mb-1">{task.title}</h3>
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: task.projectColor }}
            />
            <span className="text-sm text-gray-600 font-medium">{task.projectTitle}</span>
          </div>
        </div>

        {task.originalTodo?.description && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Description:</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {task.originalTodo.description}
            </p>
          </div>
        )}

        {task.originalTodo?.notes && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Notes:</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {task.originalTodo.notes}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-700">Start Date</p>
            <p className="text-sm text-gray-900">{formatDate(task.startDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">End Date</p>
            <p className="text-sm text-gray-900">{formatDate(task.endDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">Duration</p>
            <p className="text-sm text-gray-900">{duration} day{duration !== 1 ? 's' : ''}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">Progress</p>
            <p className="text-sm text-gray-900">{Math.round(task.progress)}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
            {task.priority} priority
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            task.completed
              ? 'bg-green-100 text-green-700'
              : task.status === 'In Progress'
              ? 'bg-blue-100 text-blue-700'
              : task.status === 'On Hold'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {task.status}
          </span>
        </div>
      </div>
    </div>
  );
};

// Calculate responsive day width based on screen size
const useResponsiveDayWidth = () => {
  const [dayWidth, setDayWidth] = useState(50);

  React.useEffect(() => {
    const updateDayWidth = () => {
      const screenWidth = window.innerWidth;
      const leftColumnsWidth = 540;
      const sidebarWidth = window.innerWidth >= 1024 ? 256 : 0;
      const paddingAndMargins = 64;
      const availableWidth = screenWidth - leftColumnsWidth - sidebarWidth - paddingAndMargins;

      const today = new Date();
      const currentMonthDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const nextMonthDays = new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate();
      const totalDays = currentMonthDays + nextMonthDays;

      const calculatedDayWidth = Math.floor(availableWidth / totalDays);
      const finalDayWidth = Math.max(Math.min(calculatedDayWidth * 0.9, 56), 14);

      setDayWidth(finalDayWidth);
    };

    updateDayWidth();
    window.addEventListener('resize', updateDayWidth);
    return () => window.removeEventListener('resize', updateDayWidth);
  }, []);

  return dayWidth;
};

// FIX: helpers to normalize dates and work in day "cells"
const startOfLocalDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfLocalDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const diffDays = (a: Date, b: Date) => {
  const A = startOfLocalDay(a).getTime();
  const B = startOfLocalDay(b).getTime();
  return Math.round((B - A) / (1000 * 60 * 60 * 24));
};

const GanttChartView: React.FC<GanttChartViewProps> = ({ projects, onProjectSelect, onRefreshProjects }) => {
  const dayWidth = useResponsiveDayWidth();
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'projects' | 'meetings'>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAIExtractor, setShowAIExtractor] = useState(false);
  const [hoveredTask, setHoveredTask] = useState<GanttTask | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    title: '',
    projectId: projects[0]?.id || '',
    startDate: '',
    endDate: '',
    priority: 'medium'
  });

  // measure actual width of the fixed left columns so the Today line aligns perfectly
  const leftColsRef = useRef<HTMLDivElement | null>(null);
  const [leftOffset, setLeftOffset] = useState(0);

  useLayoutEffect(() => {
    if (!leftColsRef.current) return;

    const el = leftColsRef.current;
    const update = () => setLeftOffset(el.offsetWidth);

    // ResizeObserver for accurate updates
    let ro: ResizeObserver | null = null;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }
    update();
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('resize', update);
      if (ro) ro.disconnect();
    };
  }, []);

  // Convert todos to Gantt tasks
  const ganttTasks: GanttTask[] = useMemo(() => {
    const tasks: GanttTask[] = [];

    projects.forEach(project => {
      project.todos.forEach(todo => {
        if (todo.endDate || todo.due_date) {
          // FIX: normalize to local day boundaries to avoid timezone/offset drift
          const endSrc = (todo.endDate || todo.due_date)!;
          const endDate = endOfLocalDay(new Date(`${endSrc}T00:00:00`));

          // Use actual start_date if present; else created_at/createdAt
          let startDate: Date;
          if (todo.startDate) {
            startDate = startOfLocalDay(new Date(`${todo.startDate}T00:00:00`));
          } else {
            // createdAt/created_at may be full ISO; normalize to local midnight
            const created = new Date((todo as any).createdAt || (todo as any).created_at || new Date());
            startDate = startOfLocalDay(created);
          }

          // Determine status
          let status: 'Not Started' | 'In Progress' | 'Complete' | 'On Hold' = 'Not Started';
          const now = new Date();
          if (todo.completed) {
            status = 'Complete';
          } else if (startOfLocalDay(now).getTime() >= startOfLocalDay(startDate).getTime() &&
                     startOfLocalDay(now).getTime() <= startOfLocalDay(endDate).getTime()) {
            status = 'In Progress';
          } else if (now > endDate) {
            status = 'On Hold'; // overdue / past window without completion
          }

          // progress: clamp 0..100 (linear by days)
          const elapsedDays = diffDays(startDate, now);
          const totalDays = Math.max(diffDays(startDate, endDate) + 1, 1); // inclusive
          const linearPct = (elapsedDays / totalDays) * 100;
          const progress = todo.completed ? 100 : clamp(linearPct, 0, 100);

          tasks.push({
            id: todo.id,
            title: todo.title,
            startDate,
            endDate,
            progress: Number.isFinite(progress) ? progress : 0,
            projectId: project.id,
            projectTitle: project.title,
            projectColor: project.color,
            priority: (todo.priority as any) || 'medium',
            completed: !!todo.completed,
            status,
            originalTodo: todo
          });
        }
      });

      // Add meeting todos to Gantt chart
      if (project.meetings) {
        project.meetings.forEach(meeting => {
          if (meeting.todos) {
            meeting.todos.forEach(meetingTodo => {
              if (meetingTodo.dueDate) {
                // Use meeting date as start date, due date as end date
                const meetingDate = new Date(meeting.meetingDate);
                const startDate = startOfLocalDay(meetingDate);
                const endDate = endOfLocalDay(new Date(`${meetingTodo.dueDate}T00:00:00`));

                // Determine status
                let status: 'Not Started' | 'In Progress' | 'Complete' | 'On Hold' = 'Not Started';
                const now = new Date();
                if (meetingTodo.completed) {
                  status = 'Complete';
                } else if (startOfLocalDay(now).getTime() >= startOfLocalDay(startDate).getTime() &&
                           startOfLocalDay(now).getTime() <= startOfLocalDay(endDate).getTime()) {
                  status = 'In Progress';
                } else if (now > endDate) {
                  status = 'On Hold';
                }

                // Calculate progress
                const elapsedDays = diffDays(startDate, now);
                const totalDays = Math.max(diffDays(startDate, endDate) + 1, 1);
                const linearPct = (elapsedDays / totalDays) * 100;
                const progress = meetingTodo.completed ? 100 : clamp(linearPct, 0, 100);

                tasks.push({
                  id: `meeting-todo-${meetingTodo.id}`,
                  title: `📅 ${meetingTodo.title}${meetingTodo.assignedTo ? ` (${meetingTodo.assignedTo})` : ''}`,
                  startDate,
                  endDate,
                  progress: Number.isFinite(progress) ? progress : 0,
                  projectId: project.id,
                  projectTitle: project.title,
                  projectColor: project.color,
                  priority: (meetingTodo.priority as any) || 'medium',
                  completed: !!meetingTodo.completed,
                  status,
                  originalTodo: {
                    ...meetingTodo,
                    description: `Meeting Action Item from "${meeting.title}" - ${meetingTodo.description || ''}`,
                    notes: `From meeting: ${meeting.title}\nMeeting Date: ${new Date(meeting.meetingDate).toLocaleDateString()}\nAssigned to: ${meetingTodo.assignedTo || 'Unassigned'}`
                  } as any
                });
              }
            });
          }
        });
      }
    });

    return tasks.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [projects]);

  // Filter tasks by project
  const filteredTasks = useMemo(() => {
    let tasks = ganttTasks;
    
    // Filter by project
    if (selectedProjectFilter !== 'all') {
      tasks = tasks.filter(task => task.projectId === selectedProjectFilter);
    }
    
    // Filter by source
    if (sourceFilter === 'projects') {
      tasks = tasks.filter(task => !task.id.startsWith('meeting-todo-'));
    } else if (sourceFilter === 'meetings') {
      tasks = tasks.filter(task => task.id.startsWith('meeting-todo-'));
    }
    
    return tasks;
  }, [ganttTasks, selectedProjectFilter, sourceFilter]);

  const getSourceCounts = () => {
    const projectTasks = ganttTasks.filter(task => !task.id.startsWith('meeting-todo-'));
    const meetingTasks = ganttTasks.filter(task => task.id.startsWith('meeting-todo-'));
    
    return {
      all: ganttTasks.length,
      projects: projectTasks.length,
      meetings: meetingTasks.length,
    };
  };

  const sourceCounts = getSourceCounts();

  // Generate timeline dates (exactly current + next month)
  const timelineDates = useMemo(() => {
    const dates: Date[] = [];
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // First day of current month

    const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysInNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).getDate();
    const totalDays = daysInCurrentMonth + daysInNextMonth;

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(startOfLocalDay(date)); // FIX: normalize the grid dates too
    }
    return dates;
  }, [currentDate]);

  // Group dates by month for header
  const monthGroups = useMemo(() => {
    const groups: { [key: string]: Date[] } = {};
    timelineDates.forEach(date => {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(date);
    });
    return groups;
  }, [timelineDates]);

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

  const goToToday = () => {
    // FIX: jump the window so that Today is in the current month kept as "now"
    setCurrentDate(new Date());
  };

  // FIX: pixel-accurate positioning based on day indices
  const getTaskPixelPosition = (task: GanttTask) => {
    if (timelineDates.length === 0) return { leftPx: 0, widthPx: 0 };

    const chartStart = timelineDates[0];
    const chartEnd = timelineDates[timelineDates.length - 1];

    // Clamp task range into visible chart range (inclusive days)
    const startClamped = startOfLocalDay(task.startDate < chartStart ? chartStart : task.startDate);
    const endClamped = endOfLocalDay(task.endDate > endOfLocalDay(chartEnd) ? endOfLocalDay(chartEnd) : task.endDate);

    const startIndex = clamp(diffDays(chartStart, startClamped), 0, timelineDates.length - 1);
    const endIndex = clamp(diffDays(chartStart, endClamped), 0, timelineDates.length - 1);

    const leftPx = startIndex * dayWidth;
    const widthPx = Math.max((endIndex - startIndex + 1) * dayWidth, dayWidth * 0.2); // at least a sliver

    return { leftPx, widthPx };
  };

  const handleCreateTask = async () => {
    if (!taskFormData.title || !taskFormData.projectId || !taskFormData.startDate || !taskFormData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const project = projects.find(p => p.id === taskFormData.projectId);
    if (!project) return;

    try {
      const { error } = await supabase
        .from('todos')
        .insert({
          project_id: taskFormData.projectId,
          title: taskFormData.title,
          description: `Timeline task: ${taskFormData.startDate} to ${taskFormData.endDate}`,
          completed: false,
          start_date: taskFormData.startDate,
          end_date: taskFormData.endDate,
          due_date: taskFormData.endDate, // keep for backward compatibility
          priority: taskFormData.priority,
          notes: `Created from Gantt chart on ${new Date().toLocaleDateString()}`
        });

      if (error) throw error;

      await onRefreshProjects();

      setTaskFormData({
        title: '',
        projectId: projects[0]?.id || '',
        startDate: '',
        endDate: '',
        priority: 'medium'
      });
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleAIExtractedTasks = async (extractedTasks: any[]) => {
    try {
      let totalCreated = 0;
      const projectNames: string[] = [];

      for (const task of extractedTasks) {
        const targetProjectId = task.selectedProjectId;
        const targetProject = projects.find(p => p.id === targetProjectId);

        if (!targetProject) {
          console.error('Project not found for task:', task.title);
          continue;
        }

        const { error } = await supabase
          .from('todos')
          .insert({
            project_id: targetProjectId,
            title: task.title,
            description: task.description || `AI-extracted task from image`,
            completed: false,
            start_date: task.startDate || null,
            end_date: task.endDate || null,
            due_date: task.endDate || null, // backward compatibility
            priority: task.priority || 'medium',
            notes: `Extracted by AI with ${Math.round((task.confidence ?? 0) * 100)}% confidence on ${new Date().toLocaleDateString()}`
          });

        if (error) throw error;

        totalCreated++;
        if (!projectNames.includes(targetProject.title)) projectNames.push(targetProject.title);
      }

      await onRefreshProjects();
      alert(`Successfully created ${totalCreated} tasks across ${projectNames.length} project(s): ${projectNames.join(', ')}`);
    } catch (error) {
      console.error('Error creating AI-extracted tasks:', error);
      alert('Failed to create some tasks. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'On Hold': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const handleTaskMouseEnter = (task: GanttTask, event: React.MouseEvent) => {
    setHoveredTask(task);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleTaskMouseLeave = () => {
    setHoveredTask(null);
  };

  const handleTaskMouseMove = (event: React.MouseEvent) => {
    if (hoveredTask) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const formatDateHeader = (date: Date) => date.getDate().toString();
  const getMonthName = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Compute Today line position (using measured leftOffset)
  const TodayLine = () => {
    const now = new Date();
    const todayY = now.getFullYear();
    const todayM = now.getMonth();
    const todayD = now.getDate();

    const todayNormalized = new Date(todayY, todayM, todayD);

    const chartStart = timelineDates[0];
    const chartEnd = timelineDates[timelineDates.length - 1];

    if (todayNormalized < chartStart || todayNormalized > endOfLocalDay(chartEnd)) return null;

    const todayIndex = timelineDates.findIndex(date =>
      date.getFullYear() === todayY &&
      date.getMonth() === todayM &&
      date.getDate() === todayD
    );

    if (todayIndex === -1) return null;

    const leftPx = leftOffset + todayIndex * dayWidth + dayWidth / 2;

    return (
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10 pointer-events-none"
        style={{ left: `${leftPx}px` }}
      >
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
        <div className="absolute -top-6 -left-8 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
          Today
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100/50 min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-indigo-400/8 to-purple-400/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-br from-teal-400/8 to-blue-400/8 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-full mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-900 to-purple-700 bg-clip-text text-transparent mb-1 sm:mb-2">
            Gantt Chart
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Visualize project timelines and manage tasks</p>
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Project Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter by Project:</span>
              </div>
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white min-w-48"
              >
                <option value="all">All Projects ({ganttTasks.length} tasks)</option>
                {projects.map(project => {
                  const taskCount = ganttTasks.filter(task => task.projectId === project.id).length;
                  return (
                    <option key={project.id} value={project.id}>
                      {project.title} ({taskCount} tasks)
                    </option>
                  );
                })}
              </select>
              
              {/* Source Filter */}
              <div className="flex bg-gray-100/80 rounded-xl p-1">
                <button
                  onClick={() => setSourceFilter('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    sourceFilter === 'all' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({sourceCounts.all})
                </button>
                <button
                  onClick={() => setSourceFilter('projects')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    sourceFilter === 'projects' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Projects ({sourceCounts.projects})
                </button>
                <button
                  onClick={() => setSourceFilter('meetings')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    sourceFilter === 'meetings' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Meetings ({sourceCounts.meetings})
                </button>
              </div>
            </div>

            {/* Navigation and Add Task */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <button
                  onClick={goToToday}
                  className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Today
                </button>

                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="text-sm font-medium text-gray-900">
                {currentDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })} - {new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </div>

              <button
                onClick={() => setShowTaskForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl transform hover:scale-105 mr-3"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>

              <button
                onClick={() => setShowAIExtractor(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl transform hover:scale-105"
              >
                <Brain className="w-4 h-4" />
                <span>AI Extract</span>
              </button>
            </div>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg relative w-full gantt-container overflow-hidden">
          {/* Month Headers */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex border-b border-gray-200">
              {/* Left fixed headers */}
              <div className="flex flex-shrink-0">
                <div className="w-80 bg-gray-100 border-r border-gray-200 p-3">
                  <div className="text-sm font-semibold text-gray-700">Task Name</div>
                </div>
                <div className="w-24 bg-gray-100 border-r border-gray-200 p-3">
                  <div className="text-sm font-semibold text-gray-700">Status</div>
                </div>
                <div className="w-20 bg-gray-100 border-r border-gray-200 p-3">
                  <div className="text-sm font-semibold text-gray-700">Start</div>
                </div>
                <div className="w-20 bg-gray-100 border-r border-gray-200 p-3">
                  <div className="text-sm font-semibold text-gray-700">End</div>
                </div>
                <div className="w-16 bg-gray-100 border-r border-gray-200 p-3">
                  <div className="text-sm font-semibold text-gray-700">Days</div>
                </div>
              </div>
              {/* Right month group headers */}
              <div className="bg-gray-100" style={{ width: `${timelineDates.length * dayWidth}px` }}>
                <div className="flex overflow-hidden">
                  {Object.entries(monthGroups).map(([monthKey, dates]) => (
                    <div
                      key={monthKey}
                      className="border-r border-gray-300 bg-gray-200 flex-shrink-0"
                      style={{ width: `${dates.length * dayWidth}px` }}
                    >
                      <div className="p-2 text-center">
                        <div className="text-sm font-bold text-gray-800">
                          {getMonthName(dates[0])}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Day Headers */}
            <div className="flex">
              {/* Left placeholders (measured) */}
              <div ref={leftColsRef} className="flex flex-shrink-0">
                <div className="w-80 bg-gray-50 border-r border-gray-200"></div>
                <div className="w-24 bg-gray-50 border-r border-gray-200"></div>
                <div className="w-20 bg-gray-50 border-r border-gray-200"></div>
                <div className="w-20 bg-gray-50 border-r border-gray-200"></div>
                <div className="w-16 bg-gray-50 border-r border-gray-200"></div>
              </div>

              {/* Right day grid header */}
              <div className="bg-gray-50" style={{ width: `${timelineDates.length * dayWidth}px` }}>
                <div className="flex overflow-hidden">
                  {timelineDates.map((date, index) => (
                    <div
                      key={index}
                      className={`border-r border-gray-200 text-center py-2 ${
                        date.getDay() === 0 || date.getDay() === 6 ? 'bg-gray-100' : 'bg-white'
                      }`}
                      style={{
                        width: `${dayWidth}px`,
                        minWidth: `${dayWidth}px`,
                        flexShrink: 0
                      }}
                    >
                      <div
                        className={`text-xs font-medium ${
                          date.getDay() === 0 || date.getDay() === 6 ? 'text-gray-500' : 'text-gray-700'
                        }`}
                      >
                        {formatDateHeader(date)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="max-h-[600px] overflow-y-auto">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks with timeline</h3>
                <p className="text-gray-500 mb-4">
                  {selectedProjectFilter === 'all'
                    ? 'Add tasks with start and end dates to see them in the Gantt chart'
                    : 'No tasks with dates found in the selected project'
                  }
                </p>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Add First Task
                </button>
              </div>
            ) : (
              filteredTasks.map((task, index) => {
                const pos = getTaskPixelPosition(task); // FIX: use pixel positions
                return (
                  <div key={task.id} className={`flex border-b border-gray-100 hover:bg-blue-50/30 transition-colors min-w-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    {/* Task Name */}
                    <div className="w-80 border-r border-gray-200 p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{getPriorityIcon(task.priority)}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: task.projectColor }}
                            />
                            <span className="text-xs text-gray-500 truncate">{task.projectTitle}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="w-24 border-r border-gray-200 p-3 flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>

                    {/* Start Date */}
                    <div className="w-20 border-r border-gray-200 p-3 flex items-center">
                      <span className="text-xs text-gray-600 font-mono">
                        {task.startDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                      </span>
                    </div>

                    {/* End Date */}
                    <div className="w-20 border-r border-gray-200 p-3 flex items-center">
                      <span className="text-xs text-gray-600 font-mono">
                        {task.endDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="w-16 border-r border-gray-200 p-3 flex items-center">
                      <span className="text-xs text-gray-600 font-mono">
                        {Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24))}d
                      </span>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 p-3 relative min-w-0">
                      <div className="relative h-6">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex overflow-hidden">
                          {timelineDates.map((date, dateIndex) => (
                            <div
                              key={dateIndex}
                              className={`border-r border-gray-100 ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-gray-50' : ''}`}
                              style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px`, flexShrink: 0 }}
                            />
                          ))}
                        </div>

                        {/* Task Bar */}
                        <div
                          className={`absolute top-1 h-4 rounded-sm flex items-center text-xs font-medium text-white shadow-sm transition-all duration-300 hover:shadow-md ${
                            task.completed
                              ? 'bg-green-500'
                              : task.status === 'In Progress'
                              ? 'bg-blue-500'
                              : task.status === 'On Hold'
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                          }`}
                          style={{ left: `${pos.leftPx}px`, width: `${pos.widthPx}px` }} // FIX: pixel-based
                          onMouseEnter={(e) => handleTaskMouseEnter(task, e)}
                          onMouseLeave={handleTaskMouseLeave}
                          onMouseMove={handleTaskMouseMove}
                        >
                          <div className="px-2 truncate">
                            {Math.round(task.progress)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Today Indicator Line (aligned using measured leftOffset) */}
          <TodayLine />
        </div>

        {/* Project Summary */}
        {selectedProjectFilter !== 'all' && (
          <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline Summary</h3>
            {(() => {
              const project = projects.find(p => p.id === selectedProjectFilter);
              if (!project) return null;

              const projectTasks = filteredTasks.filter(task => task.projectId === project.id);
              const completedTasks = projectTasks.filter(task => task.completed);
              const inProgressTasks = projectTasks.filter(task => task.status === 'In Progress');
              const notStartedTasks = projectTasks.filter(task => task.status === 'Not Started');
              const completionRate = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;

              return (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{projectTasks.length}</div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{notStartedTasks.length}</div>
                    <div className="text-sm text-gray-600">Not Started</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{completionRate}%</div>
                    <div className="text-sm text-gray-600">Progress</div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Task Creation Form */}
      {showTaskForm && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mt-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-900 to-purple-700 bg-clip-text text-transparent">
              Add New Task to Timeline
            </h3>
            <button
              onClick={() => setShowTaskForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
              <input
                type="text"
                value={taskFormData.title}
                onChange={(e) => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <select
                value={taskFormData.projectId}
                onChange={(e) => setTaskFormData(prev => ({ ...prev, projectId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={taskFormData.priority}
                onChange={(e) => setTaskFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={taskFormData.startDate}
                onChange={(e) => setTaskFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={taskFormData.endDate}
                onChange={(e) => setTaskFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCreateTask}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Task Extractor */}
      {showAIExtractor && (
        <ImageTaskExtractor
          projectId={selectedProjectFilter === 'all' ? projects[0]?.id || '' : selectedProjectFilter}
          selectedProjectFilter={selectedProjectFilter}
          projects={projects}
          onTasksExtracted={handleAIExtractedTasks}
          onClose={() => setShowAIExtractor(false)}
        />
      )}

      {/* Task Tooltip */}
      <TaskTooltip
        task={hoveredTask as any}
        position={mousePosition}
        visible={!!hoveredTask}
      />
    </div>
  );
};

export default GanttChartView;
