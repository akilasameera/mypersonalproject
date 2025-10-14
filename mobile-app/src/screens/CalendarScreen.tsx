import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function CalendarScreen() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          todos(*),
          notes(*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', 'Failed to load calendar data');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const getUpcomingItems = () => {
    const items: any[] = [];
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    projects.forEach(project => {
      // Add project due dates
      if (project.due_date) {
        const dueDate = new Date(project.due_date);
        if (dueDate >= now && dueDate <= nextWeek) {
          items.push({
            id: `project-${project.id}`,
            title: project.title,
            type: 'project',
            dueDate: project.due_date,
            project,
          });
        }
      }

      // Add todos with due dates
      project.todos?.forEach((todo: any) => {
        if (todo.due_date) {
          const dueDate = new Date(todo.due_date);
          if (dueDate >= now && dueDate <= nextWeek) {
            items.push({
              id: `todo-${todo.id}`,
              title: todo.title,
              type: 'todo',
              dueDate: todo.due_date,
              project,
              completed: todo.completed,
              priority: todo.priority,
            });
          }
        }
      });

      // Add notes with due dates
      project.notes?.forEach((note: any) => {
        if (note.due_date) {
          const dueDate = new Date(note.due_date);
          if (dueDate >= now && dueDate <= nextWeek) {
            items.push({
              id: `note-${note.id}`,
              title: note.title,
              type: 'note',
              dueDate: note.due_date,
              project,
            });
          }
        }
      });
    });

    return items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const upcomingItems = getUpcomingItems();

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'project': return 'folder-outline';
      case 'todo': return 'checkbox-outline';
      case 'note': return 'document-text-outline';
      default: return 'circle-outline';
    }
  };

  const getItemColor = (type: string, completed?: boolean) => {
    if (type === 'todo' && completed) return '#10B981';
    switch (type) {
      case 'project': return '#F59E0B';
      case 'todo': return '#3B82F6';
      case 'note': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Calendar</Text>
        <Text style={styles.screenSubtitle}>Upcoming deadlines and tasks</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* This Week Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          
          {upcomingItems.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptySectionTitle}>No upcoming items</Text>
              <Text style={styles.emptySectionSubtitle}>
                You're all caught up for this week!
              </Text>
            </View>
          ) : (
            upcomingItems.map(item => (
              <View key={item.id} style={styles.calendarItem}>
                <View style={styles.calendarItemHeader}>
                  <View style={styles.calendarItemInfo}>
                    <View style={styles.calendarItemTitleRow}>
                      <Ionicons 
                        name={getItemIcon(item.type) as any} 
                        size={20} 
                        color={getItemColor(item.type, item.completed)} 
                      />
                      <Text style={[
                        styles.calendarItemTitle,
                        item.completed && styles.completedText
                      ]}>
                        {item.title}
                      </Text>
                    </View>
                    
                    <View style={styles.calendarItemMeta}>
                      <View style={styles.projectIndicator}>
                        <View 
                          style={[styles.projectColorDot, { backgroundColor: item.project.color }]} 
                        />
                        <Text style={styles.projectName}>{item.project.title}</Text>
                      </View>
                      
                      <View style={[
                        styles.dueDateBadge,
                        isOverdue(item.dueDate) && !item.completed && styles.overdueBadge
                      ]}>
                        <Ionicons 
                          name="calendar-outline" 
                          size={12} 
                          color={isOverdue(item.dueDate) && !item.completed ? '#EF4444' : '#6B7280'} 
                        />
                        <Text style={[
                          styles.dueDateText,
                          isOverdue(item.dueDate) && !item.completed && styles.overdueText
                        ]}>
                          {new Date(item.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                    </View>
                  </div>
                  
                  {item.priority && (
                    <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]}>
                      <Text style={styles.priorityText}>{item.priority}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Projects Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects Overview</Text>
          
          {projects.map(project => {
            const totalTodos = project.todos?.length || 0;
            const completedTodos = project.todos?.filter((t: any) => t.completed).length || 0;
            const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

            return (
              <View key={project.id} style={styles.projectOverviewCard}>
                <View style={styles.projectOverviewHeader}>
                  <View style={styles.projectOverviewInfo}>
                    <View style={styles.projectOverviewTitleRow}>
                      <View style={[styles.projectColorDot, { backgroundColor: project.color }]} />
                      <Text style={styles.projectOverviewTitle}>{project.title}</Text>
                    </View>
                    
                    {totalTodos > 0 && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { 
                                width: `${completionRate}%`,
                                backgroundColor: project.color 
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressText}>{completionRate}%</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.projectStats}>
                    <Text style={styles.projectStatsText}>
                      {totalTodos} tasks • {project.notes?.length || 0} notes
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  calendarItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  calendarItemInfo: {
    flex: 1,
  },
  calendarItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  calendarItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  calendarItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  projectName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  overdueBadge: {
    backgroundColor: '#FEE2E2',
  },
  dueDateText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  overdueText: {
    color: '#EF4444',
  },
  priorityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  projectOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectOverviewHeader: {
    gap: 12,
  },
  projectOverviewInfo: {
    gap: 8,
  },
  projectOverviewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectOverviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 32,
    textAlign: 'right',
  },
  projectStats: {
    alignItems: 'flex-end',
  },
  projectStatsText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});