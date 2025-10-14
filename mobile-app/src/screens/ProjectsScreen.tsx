import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  status: string;
  category: string;
  due_date?: string;
  created_at: string;
  todos?: any[];
  notes?: any[];
  links?: any[];
}

export default function ProjectsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
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
          notes(*),
          links(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', 'Failed to load projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const getProjectStats = (project: Project) => {
    const totalTodos = project.todos?.length || 0;
    const completedTodos = project.todos?.filter(todo => todo.completed).length || 0;
    const totalNotes = project.notes?.length || 0;
    const totalLinks = project.links?.length || 0;
    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

    return { totalTodos, completedTodos, totalNotes, totalLinks, completionRate };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'hold': return '#F59E0B';
      case 'completed': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const renderProject = ({ item: project }: { item: Project }) => {
    const stats = getProjectStats(project);

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => navigation.navigate('ProjectDetail' as never, { project } as never)}
      >
        <View style={[styles.projectHeader, { backgroundColor: project.color }]} />
        
        <View style={styles.projectContent}>
          <View style={styles.projectInfo}>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                <Text style={styles.statusText}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.projectTitle} numberOfLines={2}>
              {project.title}
            </Text>
            
            {project.description && (
              <Text style={styles.projectDescription} numberOfLines={3}>
                {project.description}
              </Text>
            )}
          </View>

          {/* Progress Bar */}
          {stats.totalTodos > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercentage}>{stats.completionRate}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${stats.completionRate}%`,
                      backgroundColor: project.color 
                    }
                  ]} 
                />
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="checkbox-outline" size={16} color="#3B82F6" />
              <Text style={styles.statNumber}>{stats.totalTodos}</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="document-text-outline" size={16} color="#8B5CF6" />
              <Text style={styles.statNumber}>{stats.totalNotes}</Text>
              <Text style={styles.statLabel}>Notes</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="link-outline" size={16} color="#10B981" />
              <Text style={styles.statNumber}>{stats.totalLinks}</Text>
              <Text style={styles.statLabel}>Links</Text>
            </View>
          </View>

          {project.due_date && (
            <View style={styles.dueDateContainer}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.dueDateText}>
                Due {new Date(project.due_date).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Projects</Text>
        <Text style={styles.screenSubtitle}>Manage your projects and workflows</Text>
      </View>

      {projects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No projects yet</Text>
          <Text style={styles.emptySubtitle}>Create your first project to get started</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
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
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  projectHeader: {
    height: 6,
  },
  projectContent: {
    padding: 20,
  },
  projectInfo: {
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dueDateText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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