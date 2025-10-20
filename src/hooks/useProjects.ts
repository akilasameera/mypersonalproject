import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { vpsClient } from '../lib/vpsClient';
import type { Project } from '../types';

export function useProjects(userId: string | undefined, isAdmin: boolean = false) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [userId, isAdmin]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch related data for each project
      const projectsWithData = await Promise.all(
        (projectsData || []).map(async (project) => {
          const [notesResult, linksResult, todosResult] = await Promise.all([
            // Fetch notes with attachments
            supabase
              .from('notes')
              .select(`
                *,
                attachments (*)
              `)
              .eq('project_id', project.id)
              .order('created_at', { ascending: false }),
            
            // Fetch links
            supabase
              .from('links')
              .select('*')
              .eq('project_id', project.id)
              .order('created_at', { ascending: false }),
            
            // Fetch todos
            supabase
              .from('todos')
              .select('*')
              .eq('project_id', project.id)
              .order('created_at', { ascending: false }),
          
          // Fetch meetings with related data
          supabase
            .from('meetings')
            .select(`
              *,
              meeting_transcripts (*),
              meeting_summaries (*),
              meeting_todos (*)
            `)
            .eq('project_id', project.id)
            .order('meeting_date', { ascending: false }),
        ]);

        const meetingsResult = await supabase
          .from('meetings')
          .select(`
            *,
            meeting_transcripts (*),
            meeting_summaries (*),
            meeting_todos (*)
          `)
          .eq('project_id', project.id)
          .order('meeting_date', { ascending: false });

        return {
            ...project,
            notes: notesResult.data || [],
            links: linksResult.data || [],
            todos: todosResult.data || [],
            meetings: meetingsResult.data || [],
          };
        })
      );

      // Map database fields to frontend fields for notes
      const projectsWithMappedFields = projectsWithData.map(project => ({
        ...project,
        status: project.status || 'active',
        category: project.category || 'main',
        notes: project.notes.map(note => ({
          ...note,
          statusCategory: note.status_category || 'general',
          statusType: note.status_type || undefined,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
          dueDate: note.due_date
        })),
        todos: project.todos.map(todo => ({
          ...todo,
          startDate: todo.start_date,
          endDate: todo.end_date,
          dueDate: todo.due_date, // Keep for backward compatibility
          createdAt: todo.created_at,
          updatedAt: todo.updated_at
        })),
        meetings: project.meetings?.map(meeting => ({
          ...meeting,
          meetingDate: meeting.meeting_date,
          createdAt: meeting.created_at,
          updatedAt: meeting.updated_at,
          transcripts: meeting.meeting_transcripts?.map(transcript => ({
            ...transcript,
            timestampInMeeting: transcript.timestamp_in_meeting,
            createdAt: transcript.created_at,
            updatedAt: transcript.updated_at
          })) || [],
          summaries: meeting.meeting_summaries?.map(summary => ({
            ...summary,
            keyPoints: summary.key_points,
            actionItems: summary.action_items,
            createdAt: summary.created_at,
            updatedAt: summary.updated_at
          })) || [],
          todos: meeting.meeting_todos?.map(todo => ({
            ...todo,
            assignedTo: todo.assigned_to,
            dueDate: todo.due_date,
            createdAt: todo.created_at,
            updatedAt: todo.updated_at
          })) || []
        })) || []
      }));

      // Filter out Master project for non-admin users
      const filteredProjects = isAdmin
        ? projectsWithMappedFields
        : projectsWithMappedFields.filter(project => project.title.toLowerCase() !== 'master');

      setProjects(filteredProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'links' | 'todos'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          title: projectData.title,
          description: projectData.description,
          color: projectData.color,
          due_date: projectData.dueDate || null,
          category: projectData.category || 'main',
          status: projectData.status || 'active',
        })
        .select()
        .single();

      if (error) throw error;

      const newProject = {
        ...data,
        notes: [],
        links: [],
        todos: [],
      };

      try {
        await vpsClient.projects.create({
          id: data.id,
          user_id: userId,
          title: projectData.title,
          description: projectData.description,
          color: projectData.color,
          start_date: projectData.startDate || null,
          end_date: projectData.endDate || null,
          status: projectData.status || 'active',
          priority: projectData.priority || 'medium',
          progress: 0,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } catch (vpsError) {
        console.warn('VPS sync failed for project creation:', vpsError);
      }

      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          title: updates.title,
          description: updates.description,
          color: updates.color,
          due_date: updates.dueDate || null,
          category: updates.category,
          status: updates.status,
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      try {
        await vpsClient.projects.update(projectId, {
          title: updates.title,
          description: updates.description,
          color: updates.color,
          start_date: updates.startDate || null,
          end_date: updates.endDate || null,
          status: updates.status,
          priority: updates.priority,
          progress: updates.progress
        });
      } catch (vpsError) {
        console.warn('VPS sync failed for project update:', vpsError);
      }

      setProjects(prev => prev.map(project =>
        project.id === projectId
          ? { ...project, ...data }
          : project
      ));

      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      try {
        await vpsClient.projects.delete(projectId);
      } catch (vpsError) {
        console.warn('VPS sync failed for project deletion:', vpsError);
      }

      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const updateProjectData = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            ...updates,
            // Force update timestamp to trigger re-renders
            updatedAt: new Date().toISOString(),
            // Ensure notes have proper field mapping
            notes: updates.notes ? updates.notes.map(note => ({
              ...note,
              statusCategory: note.statusCategory || note.status_category || 'general'
            })) : project.notes
          }
        : project
    ));
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    updateProjectData,
    refetch: fetchProjects,
  };
}