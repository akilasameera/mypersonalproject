import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Meeting, MeetingTranscript, MeetingSummary, MeetingTodo } from '../types';

export function useMeetings(projectId: string) {
  const [loading, setLoading] = useState(false);

  const createMeeting = async (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt' | 'transcripts' | 'summaries' | 'todos'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          project_id: projectId,
          title: meetingData.title,
          description: meetingData.description || '',
          meeting_date: meetingData.meetingDate,
          duration: meetingData.duration,
          status: meetingData.status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMeeting = async (meetingId: string, updates: Partial<Meeting>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meetings')
        .update({
          title: updates.title,
          description: updates.description,
          meeting_date: updates.meetingDate,
          duration: updates.duration,
          status: updates.status,
        })
        .eq('id', meetingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Transcript operations
  const createTranscript = async (meetingId: string, transcriptData: Omit<MeetingTranscript, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_transcripts')
        .insert({
          meeting_id: meetingId,
          content: transcriptData.content,
          speaker: transcriptData.speaker || '',
          timestamp_in_meeting: transcriptData.timestampInMeeting || '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transcript:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTranscript = async (transcriptId: string, updates: Partial<MeetingTranscript>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_transcripts')
        .update({
          content: updates.content,
          speaker: updates.speaker,
          timestamp_in_meeting: updates.timestampInMeeting,
        })
        .eq('id', transcriptId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating transcript:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscript = async (transcriptId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('meeting_transcripts')
        .delete()
        .eq('id', transcriptId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting transcript:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Summary operations
  const createSummary = async (meetingId: string, summaryData: Omit<MeetingSummary, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_summaries')
        .insert({
          meeting_id: meetingId,
          content: summaryData.content,
          key_points: summaryData.keyPoints || '',
          action_items: summaryData.actionItems || '',
          decisions: summaryData.decisions || '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating summary:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSummary = async (summaryId: string, updates: Partial<MeetingSummary>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_summaries')
        .update({
          content: updates.content,
          key_points: updates.keyPoints,
          action_items: updates.actionItems,
          decisions: updates.decisions,
        })
        .eq('id', summaryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating summary:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSummary = async (summaryId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('meeting_summaries')
        .delete()
        .eq('id', summaryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting summary:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Meeting Todo operations
  const createMeetingTodo = async (meetingId: string, todoData: Omit<MeetingTodo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_todos')
        .insert({
          meeting_id: meetingId,
          title: todoData.title,
          description: todoData.description || '',
          assigned_to: todoData.assignedTo || '',
          due_date: todoData.dueDate || null,
          priority: todoData.priority,
          completed: todoData.completed,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating meeting todo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMeetingTodo = async (todoId: string, updates: Partial<MeetingTodo>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_todos')
        .update({
          title: updates.title,
          description: updates.description,
          assigned_to: updates.assignedTo,
          due_date: updates.dueDate || null,
          priority: updates.priority,
          completed: updates.completed,
        })
        .eq('id', todoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating meeting todo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleMeetingTodo = async (todoId: string, completed: boolean) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_todos')
        .update({ completed })
        .eq('id', todoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling meeting todo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMeetingTodo = async (todoId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('meeting_todos')
        .delete()
        .eq('id', todoId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting meeting todo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    createTranscript,
    updateTranscript,
    deleteTranscript,
    createSummary,
    updateSummary,
    deleteSummary,
    createMeetingTodo,
    updateMeetingTodo,
    toggleMeetingTodo,
    deleteMeetingTodo,
  };
}