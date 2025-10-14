import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Note, Attachment } from '../types';

export function useNotes(projectId: string, userId: string) {

  const [loading, setLoading] = useState(false);

  const createNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .insert({
          project_id: projectId,
          title: noteData.title,
          content: noteData.content,
          due_date: noteData.dueDate || null,
          status_category: noteData.statusCategory || 'general',
          status_type: noteData.statusType || null,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: updates.title,
          content: updates.content,
          due_date: updates.dueDate || null,
          status_category: updates.statusCategory || 'general',
          status_type: updates.statusType || null,
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadAttachment = async (noteId: string, file: File) => {
    try {
      setLoading(true);
      
      // Create unique filename with user folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${noteId}/${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(fileName);

      // Save attachment metadata to database
      const { data, error } = await supabase
        .from('attachments')
        .insert({
          note_id: noteId,
          name: fileName,
          size: file.size,
          type: file.type,
          url: publicUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAttachment = async (attachmentId: string, fileName: string) => {
    try {
      setLoading(true);
      
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete attachment record from database
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createNote,
    updateNote,
    deleteNote,
    uploadAttachment,
    deleteAttachment,
  };
}