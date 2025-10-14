import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Todo } from '../types';

export function useTodos(projectId: string) {
  const [loading, setLoading] = useState(false);

  const createTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .insert({
          project_id: projectId,
          title: todoData.title,
          description: todoData.description || null,
          completed: todoData.completed || false,
          start_date: todoData.startDate || null,
          end_date: todoData.endDate || null,
          due_date: todoData.endDate || null, // Keep for backward compatibility
          priority: todoData.priority || 'medium',
          notes: todoData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async (todoId: string, updates: Partial<Todo>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .update({
          title: updates.title,
          description: updates.description || null,
          completed: updates.completed,
          start_date: updates.startDate || null,
          end_date: updates.endDate || null,
          due_date: updates.endDate || null, // Keep for backward compatibility
          priority: updates.priority || 'medium',
          notes: updates.notes || null,
        })
        .eq('id', todoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (todoId: string, completed: boolean) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .update({ completed })
        .eq('id', todoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling todo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
  };
}