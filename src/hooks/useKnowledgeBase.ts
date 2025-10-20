import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface KnowledgeTopic {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isShared?: boolean;
  createdByAdmin?: boolean;
  userId: string;
  sections: KnowledgeSection[];
}

export interface KnowledgeSection {
  id: string;
  topicId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tiles: KnowledgeTile[];
}

export interface KnowledgeTile {
  id: string;
  sectionId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function useKnowledgeBase(userId: string | undefined, isAdmin: boolean = false) {
  const [topics, setTopics] = useState<KnowledgeTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchTopics();
    }
  }, [userId, isAdmin]);

  const fetchTopics = async () => {
    try {
      setLoading(true);

      // Fetch user's own topics
      const { data: userTopicsData, error: userTopicsError } = await supabase
        .from('knowledge_topics')
        .select(`
          *,
          knowledge_sections (
            *,
            knowledge_tiles (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (userTopicsError) throw userTopicsError;

      // Fetch shared admin topics (if not admin)
      let sharedTopicsData: any[] = [];
      if (!isAdmin) {
        const { data, error: sharedError } = await supabase
          .from('knowledge_topics')
          .select(`
            *,
            knowledge_sections (
              *,
              knowledge_tiles (*)
            )
          `)
          .eq('is_shared', true)
          .eq('created_by_admin', true)
          .order('created_at', { ascending: false });

        if (sharedError) throw sharedError;
        sharedTopicsData = data || [];
      }

      // Combine both datasets
      const allTopicsData = [...(userTopicsData || []), ...sharedTopicsData];

      const topicsWithSections = allTopicsData.map(topic => ({
        id: topic.id,
        title: topic.title,
        description: topic.description,
        userId: topic.user_id,
        isShared: topic.is_shared,
        createdByAdmin: topic.created_by_admin,
        createdAt: topic.created_at,
        updatedAt: topic.updated_at,
        sections: (topic.knowledge_sections || []).map((section: any) => ({
          id: section.id,
          topicId: section.topic_id,
          title: section.title,
          content: section.content,
          createdAt: section.created_at,
          updatedAt: section.updated_at,
          tiles: (section.knowledge_tiles || []).map((tile: any) => ({
            id: tile.id,
            sectionId: tile.section_id,
            title: tile.title,
            content: tile.content,
            createdAt: tile.created_at,
            updatedAt: tile.updated_at,
          })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }));

      setTopics(topicsWithSections);
    } catch (error) {
      console.error('Error fetching knowledge topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async (topicData: { title: string; description: string }) => {
    try {
      const { data, error } = await supabase
        .from('knowledge_topics')
        .insert({
          user_id: userId,
          title: topicData.title,
          description: topicData.description,
          created_by_admin: isAdmin,
          is_shared: false
        })
        .select()
        .single();

      if (error) throw error;

      const newTopic: KnowledgeTopic = {
        id: data.id,
        userId: data.user_id,
        isShared: data.is_shared,
        createdByAdmin: data.created_by_admin,
        title: data.title,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        sections: []
      };

      setTopics(prev => [newTopic, ...prev]);
      return newTopic;
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  };

  const updateTopic = async (topicId: string, updates: { title: string; description: string }) => {
    try {
      const { data, error } = await supabase
        .from('knowledge_topics')
        .update({
          title: updates.title,
          description: updates.description,
        })
        .eq('id', topicId)
        .select()
        .single();

      if (error) throw error;

      setTopics(prev => prev.map(topic => 
        topic.id === topicId 
          ? { ...topic, title: data.title, description: data.description, updatedAt: data.updated_at }
          : topic
      ));

      return data;
    } catch (error) {
      console.error('Error updating topic:', error);
      throw error;
    }
  };

  const deleteTopic = async (topicId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;

      setTopics(prev => prev.filter(topic => topic.id !== topicId));
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  };

  const createSection = async (topicId: string, sectionData: { title: string; content: string }) => {
    try {
      const { data, error } = await supabase
        .from('knowledge_sections')
        .insert({
          topic_id: topicId,
          title: sectionData.title,
          content: sectionData.content,
        })
        .select()
        .single();

      if (error) throw error;

      const newSection: KnowledgeSection = {
        id: data.id,
        topicId: data.topic_id,
        title: data.title,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        tiles: []
      };

      setTopics(prev => prev.map(topic => 
        topic.id === topicId 
          ? { ...topic, sections: [newSection, ...topic.sections] }
          : topic
      ));

      return newSection;
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  };

  const updateSection = async (sectionId: string, updates: { title: string; content: string }) => {
    try {
      const { data, error } = await supabase
        .from('knowledge_sections')
        .update({
          title: updates.title,
          content: updates.content,
        })
        .eq('id', sectionId)
        .select()
        .single();

      if (error) throw error;

      setTopics(prev => prev.map(topic => ({
        ...topic,
        sections: topic.sections.map(section =>
          section.id === sectionId
            ? { ...section, title: data.title, content: data.content, updatedAt: data.updated_at }
            : section
        )
      })));

      return data;
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  };

  const deleteSection = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;

      setTopics(prev => prev.map(topic => ({
        ...topic,
        sections: topic.sections.filter(section => section.id !== sectionId)
      })));
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  };

  const createTile = async (sectionId: string, tileData: { title: string; content: string }) => {
    try {
      const { data, error } = await supabase
        .from('knowledge_tiles')
        .insert({
          section_id: sectionId,
          title: tileData.title,
          content: tileData.content,
        })
        .select()
        .single();

      if (error) throw error;

      const newTile: KnowledgeTile = {
        id: data.id,
        sectionId: data.section_id,
        title: data.title,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setTopics(prev => prev.map(topic => ({
        ...topic,
        sections: topic.sections.map(section =>
          section.id === sectionId
            ? { ...section, tiles: [newTile, ...section.tiles] }
            : section
        )
      })));

      return newTile;
    } catch (error) {
      console.error('Error creating tile:', error);
      throw error;
    }
  };

  const updateTile = async (tileId: string, updates: { title: string; content: string }) => {
    try {
      const { data, error } = await supabase
        .from('knowledge_tiles')
        .update({
          title: updates.title,
          content: updates.content,
        })
        .eq('id', tileId)
        .select()
        .single();

      if (error) throw error;

      setTopics(prev => prev.map(topic => ({
        ...topic,
        sections: topic.sections.map(section => ({
          ...section,
          tiles: section.tiles.map(tile =>
            tile.id === tileId
              ? { ...tile, title: data.title, content: data.content, updatedAt: data.updated_at }
              : tile
          )
        }))
      })));

      return data;
    } catch (error) {
      console.error('Error updating tile:', error);
      throw error;
    }
  };

  const deleteTile = async (tileId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_tiles')
        .delete()
        .eq('id', tileId);

      if (error) throw error;

      setTopics(prev => prev.map(topic => ({
        ...topic,
        sections: topic.sections.map(section => ({
          ...section,
          tiles: section.tiles.filter(tile => tile.id !== tileId)
        }))
      })));
    } catch (error) {
      console.error('Error deleting tile:', error);
      throw error;
    }
  };

  const toggleShare = async (topicId: string, isShared: boolean) => {
    try {
      const { error } = await supabase
        .from('knowledge_topics')
        .update({ is_shared: isShared })
        .eq('id', topicId);

      if (error) throw error;

      setTopics(prev => prev.map(topic =>
        topic.id === topicId ? { ...topic, isShared } : topic
      ));
    } catch (error) {
      console.error('Error toggling share:', error);
      throw error;
    }
  };

  return {
    topics,
    loading,
    createTopic,
    updateTopic,
    deleteTopic,
    createSection,
    updateSection,
    deleteSection,
    createTile,
    updateTile,
    deleteTile,
    toggleShare,
    refetch: fetchTopics,
  };
}