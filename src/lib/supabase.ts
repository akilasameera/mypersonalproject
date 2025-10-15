import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          color: string;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          color?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          color?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          content: string;
          due_date: string | null;
          created_at: string;
          updated_at: string;
          status_category: string;
          status_type: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          content: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          status_category?: string;
          status_type?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          content?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          status_category?: string;
          status_type?: string | null;
        };
      };
      attachments: {
        Row: {
          id: string;
          note_id: string;
          name: string;
          size: number;
          type: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          name: string;
          size: number;
          type: string;
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          name?: string;
          size?: number;
          type?: string;
          url?: string;
          created_at?: string;
        };
      };
      links: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          url: string;
          username: string | null;
          password: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          url: string;
          username?: string | null;
          password?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          url?: string;
          username?: string | null;
          password?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          completed: boolean;
          due_date: string | null;
          priority: 'low' | 'medium' | 'high';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          completed?: boolean;
          due_date?: string | null;
          priority?: 'low' | 'medium' | 'high';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          completed?: boolean;
          due_date?: string | null;
          priority?: 'low' | 'medium' | 'high';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      meetings: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string;
          meeting_date: string;
          duration: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string;
          meeting_date?: string;
          duration?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string;
          meeting_date?: string;
          duration?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      meeting_transcripts: {
        Row: {
          id: string;
          meeting_id: string;
          content: string;
          speaker: string;
          timestamp_in_meeting: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          content: string;
          speaker?: string;
          timestamp_in_meeting?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          content?: string;
          speaker?: string;
          timestamp_in_meeting?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      meeting_summaries: {
        Row: {
          id: string;
          meeting_id: string;
          content: string;
          key_points: string;
          action_items: string;
          decisions: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          content: string;
          key_points?: string;
          action_items?: string;
          decisions?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          content?: string;
          key_points?: string;
          action_items?: string;
          decisions?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      meeting_todos: {
        Row: {
          id: string;
          meeting_id: string;
          title: string;
          description: string;
          assigned_to: string;
          due_date: string | null;
          priority: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          title: string;
          description?: string;
          assigned_to?: string;
          due_date?: string | null;
          priority?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          title?: string;
          description?: string;
          assigned_to?: string;
          due_date?: string | null;
          priority?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      knowledge_topics: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      knowledge_sections: {
        Row: {
          id: string;
          topic_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      knowledge_tiles: {
        Row: {
          id: string;
          section_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}