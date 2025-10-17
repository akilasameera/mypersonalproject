import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { vpsClient } from '../lib/vpsClient';
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

      try {
        await vpsClient.todos.create({
          id: data.id,
          project_id: projectId,
          title: todoData.title,
          description: todoData.description || '',
          completed: todoData.completed || false,
          priority: todoData.priority || 'medium',
          due_date: todoData.endDate || null,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } catch (vpsError) {
        console.warn('VPS sync failed for todo creation:', vpsError);
      }

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

      try {
        await vpsClient.todos.update(todoId, {
          title: updates.title,
          description: updates.description || '',
          completed: updates.completed,
          priority: updates.priority,
          due_date: updates.endDate || null
        });
      } catch (vpsError) {
        console.warn('VPS sync failed for todo update:', vpsError);
      }

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

      try {
        await vpsClient.todos.update(todoId, { completed });
      } catch (vpsError) {
        console.warn('VPS sync failed for todo toggle:', vpsError);
      }

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

      try {
        await vpsClient.todos.delete(todoId);
      } catch (vpsError) {
        console.warn('VPS sync failed for todo deletion:', vpsError);
      }
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