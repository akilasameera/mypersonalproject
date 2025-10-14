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
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

interface ProjectDetailScreenProps {
  route: {
    params: {
      project: any;
    };
  };
}

export default function ProjectDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { project: initialProject } = route.params as any;
  
  const [project, setProject] = useState(initialProject);
  const [activeTab, setActiveTab] = useState('notes');
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    { id: 'notes', label: 'Notes', icon: 'document-text-outline' },
    { id: 'todos', label: 'Tasks', icon: 'checkbox-outline' },
    { id: 'links', label: 'Links', icon: 'link-outline' },
  ];

  const fetchProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          todos(*),
          notes(*, attachments(*)),
          links(*)
        `)
        .eq('id', project.id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project details:', error);
      Alert.alert('Error', 'Failed to load project details');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjectDetails();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notes':
        return (
          <View style={styles.tabContent}>
            {project.notes?.length === 0 ? (
              <View style={styles.emptyTabContent}>
                <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTabTitle}>No notes yet</Text>
                <Text style={styles.emptyTabSubtitle}>Add your first note to get started</Text>
              </View>
            ) : (
              project.notes?.map((note: any) => (
                <View key={note.id} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{note.title}</Text>
                  <Text style={styles.itemContent} numberOfLines={3}>
                    {note.content}
                  </Text>
                  {note.due_date && (
                    <View style={styles.itemMeta}>
                      <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                      <Text style={styles.itemMetaText}>
                        Due {new Date(note.due_date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {note.attachments?.length > 0 && (
                    <View style={styles.itemMeta}>
                      <Ionicons name="attach-outline" size={14} color="#6B7280" />
                      <Text style={styles.itemMetaText}>
                        {note.attachments.length} attachment{note.attachments.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        );

      case 'todos':
        return (
          <View style={styles.tabContent}>
            {project.todos?.length === 0 ? (
              <View style={styles.emptyTabContent}>
                <Ionicons name="checkbox-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTabTitle}>No tasks yet</Text>
                <Text style={styles.emptyTabSubtitle}>Add your first task to get started</Text>
              </View>
            ) : (
              project.todos?.map((todo: any) => (
                <View key={todo.id} style={styles.itemCard}>
                  <View style={styles.todoHeader}>
                    <View style={styles.todoInfo}>
                      <Text style={[styles.itemTitle, todo.completed && styles.completedText]}>
                        {todo.title}
                      </Text>
                      {todo.description && (
                        <Text style={[styles.itemContent, todo.completed && styles.completedText]} numberOfLines={2}>
                          {todo.description}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.checkbox, todo.completed && styles.checkboxCompleted]}>
                      {todo.completed && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.todoMeta}>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(todo.priority) }]}>
                      <Text style={styles.priorityText}>{todo.priority}</Text>
                    </View>
                    {todo.due_date && (
                      <View style={styles.itemMeta}>
                        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                        <Text style={styles.itemMetaText}>
                          Due {new Date(todo.due_date).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'links':
        return (
          <View style={styles.tabContent}>
            {project.links?.length === 0 ? (
              <View style={styles.emptyTabContent}>
                <Ionicons name="link-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTabTitle}>No links yet</Text>
                <Text style={styles.emptyTabSubtitle}>Add your first link to get started</Text>
              </View>
            ) : (
              project.links?.map((link: any) => (
                <View key={link.id} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{link.title}</Text>
                  <Text style={styles.linkUrl} numberOfLines={1}>
                    {link.url}
                  </Text>
                  {link.description && (
                    <Text style={styles.itemContent} numberOfLines={2}>
                      {link.description}
                    </Text>
                  )}
                  <View style={styles.itemMeta}>
                    <Ionicons name="open-outline" size={14} color="#3B82F6" />
                    <Text style={[styles.itemMetaText, { color: '#3B82F6' }]}>
                      Tap to open
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.detailHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <View style={styles.projectHeaderInfo}>
          <View style={styles.projectTitleContainer}>
            <View style={[styles.projectColorIndicator, { backgroundColor: project.color }]} />
            <Text style={styles.projectDetailTitle} numberOfLines={2}>
              {project.title}
            </Text>
          </View>
          {project.description && (
            <Text style={styles.projectDetailDescription} numberOfLines={2}>
              {project.description}
            </Text>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.id ? '#3B82F6' : '#6B7280'} 
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
              <View style={[styles.tabBadge, activeTab === tab.id && styles.activeTabBadge]}>
                <Text style={[styles.tabBadgeText, activeTab === tab.id && styles.activeTabBadgeText]}>
                  {tab.id === 'notes' ? project.notes?.length || 0 :
                   tab.id === 'todos' ? project.todos?.length || 0 :
                   project.links?.length || 0}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  projectHeaderInfo: {
    flex: 1,
  },
  projectTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  projectDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  projectDetailDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#EBF4FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  tabBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: '#3B82F6',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  activeTabBadgeText: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  emptyTabContent: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyTabSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  itemCard: {
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
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  itemContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  itemMetaText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  linkUrl: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 8,
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  todoInfo: {
    flex: 1,
    marginRight: 12,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  todoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});