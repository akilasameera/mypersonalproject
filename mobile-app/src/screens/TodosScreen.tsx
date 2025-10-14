import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function TodosScreen() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          color,
          todos(*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const allTodos = (projectsData || []).flatMap(project =>
        (project.todos || []).map(todo => ({
          ...todo,
          projectTitle: project.title,
          projectColor: project.color,
          projectId: project.id,
        }))
      );

      setTodos(allTodos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodos();
  };

  const toggleTodo = async (todoId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', todoId);

      if (error) throw error;

      setTodos(prev => prev.map(todo =>
        todo.id === todoId ? { ...todo, completed: !completed } : todo
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'pending') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const renderTodo = ({ item: todo }: { item: any }) => (
    <View style={styles.todoCard}>
      <View style={styles.todoHeader}>
        <TouchableOpacity
          style={[styles.checkbox, todo.completed && styles.checkboxCompleted]}
          onPress={() => toggleTodo(todo.id, todo.completed)}
        >
          {todo.completed && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        
        <View style={styles.todoInfo}>
          <Text style={[styles.todoTitle, todo.completed && styles.completedText]}>
            {todo.title}
          </Text>
          
          {todo.description && (
            <Text style={[styles.todoDescription, todo.completed && styles.completedText]} numberOfLines={2}>
              {todo.description}
            </Text>
          )}
          
          <View style={styles.todoMeta}>
            <View style={styles.projectIndicator}>
              <View style={[styles.projectColorDot, { backgroundColor: todo.projectColor }]} />
              <Text style={styles.projectName}>{todo.projectTitle}</Text>
            </View>
            
            {todo.priority && (
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(todo.priority) }]}>
                <Text style={styles.priorityText}>{todo.priority}</Text>
              </View>
            )}
          </View>
          
          {todo.due_date && (
            <View style={[
              styles.dueDateContainer,
              isOverdue(todo.due_date) && !todo.completed && styles.overdueContainer
            ]}>
              <Ionicons 
                name="calendar-outline" 
                size={14} 
                color={isOverdue(todo.due_date) && !todo.completed ? '#EF4444' : '#6B7280'} 
              />
              <Text style={[
                styles.dueDateText,
                isOverdue(todo.due_date) && !todo.completed && styles.overdueText
              ]}>
                Due {new Date(todo.due_date).toLocaleDateString()}
              </Text>
              {isOverdue(todo.due_date) && !todo.completed && (
                <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const pendingCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>All Tasks</Text>
        <Text style={styles.screenSubtitle}>
          {pendingCount} pending • {completedCount} completed
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.activeFilterTabText]}>
            All ({todos.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'pending' && styles.activeFilterTab]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterTabText, filter === 'pending' && styles.activeFilterTabText]}>
            Pending ({pendingCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.activeFilterTab]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterTabText, filter === 'completed' && styles.activeFilterTabText]}>
            Completed ({completedCount})
          </Text>
        </TouchableOpacity>
      </View>

      {filteredTodos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkbox-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>
            {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all' 
              ? 'Create tasks in your projects to see them here'
              : `You don't have any ${filter} tasks at the moment`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTodos}
          renderItem={renderTodo}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#EBF4FF',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeFilterTabText: {
    color: '#3B82F6',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  todoCard: {
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
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  todoInfo: {
    flex: 1,
    gap: 8,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
  },
  todoDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  todoMeta: {
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  overdueContainer: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});