import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session and handle profile creation
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error && error.message.includes('refresh_token_not_found')) {
          // Clear invalid session data and wait for sign out to complete
          await supabase.auth.signOut();
          setUser(null);
          setLoading(false);
          return;
        }
        handleSession(session);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session: any) => {
    if (session?.user) {
      // Ensure profile exists before setting user
      await ensureProfileExists(session.user);

      // Fetch admin status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      setIsAdmin(profile?.is_admin || false);
      setUser(session.user);
    } else {
      setUser(null);
      setIsAdmin(false);
    }
    setLoading(false);
  };

  const ensureProfileExists = async (user: User) => {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create it
    if (!existingProfile) {
      await createProfile(user);
    }
  };

  const createProfile = async (user: User) => {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
      });

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    // Don't set loading to false here - let handleSession do it
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Don't set loading to false here - let handleSession do it
    return { data, error };
  };

  const signOut = async () => {
    console.log('signOut function called');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      // Clear client-side session even if server-side signout fails
      await supabase.auth.setSession(null);
      console.log('Supabase signOut result:', { error });
      if (error) {
        console.error('Supabase signOut error:', error);
      }
      return { error };
    } catch (err) {
      console.error('Exception in signOut:', err);
      // Ensure session is cleared even on exception
      await supabase.auth.setSession(null);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
  };
}