import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { vpsClient } from '../lib/vpsClient';
import type { Link } from '../types';

export function useLinks(projectId: string) {
  const [loading, setLoading] = useState(false);

  const createLink = async (linkData: Omit<Link, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('links')
        .insert({
          project_id: projectId,
          title: linkData.title,
          url: linkData.url,
          username: linkData.username || null,
          password: linkData.password || null,
          description: linkData.description || null,
        })
        .select()
        .single();

      if (error) throw error;

      try {
        await vpsClient.links.create({
          id: data.id,
          project_id: projectId,
          title: linkData.title,
          url: linkData.url,
          description: linkData.description || '',
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } catch (vpsError) {
        console.warn('VPS sync failed for link creation:', vpsError);
      }

      return data;
    } catch (error) {
      console.error('Error creating link:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLink = async (linkId: string, updates: Partial<Link>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('links')
        .update({
          title: updates.title,
          url: updates.url,
          username: updates.username || null,
          password: updates.password || null,
          description: updates.description || null,
        })
        .eq('id', linkId)
        .select()
        .single();

      if (error) throw error;

      try {
        await vpsClient.links.update(linkId, {
          title: updates.title,
          url: updates.url,
          description: updates.description || ''
        });
      } catch (vpsError) {
        console.warn('VPS sync failed for link update:', vpsError);
      }

      return data;
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      try {
        await vpsClient.links.delete(linkId);
      } catch (vpsError) {
        console.warn('VPS sync failed for link deletion:', vpsError);
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createLink,
    updateLink,
    deleteLink,
  };
}