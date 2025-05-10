import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types/database.types';
import { updateStreak } from '../lib/supabase';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  session: any;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  session: null,
  
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      // First authenticate the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Check if the user profile exists in the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle(); // Use maybeSingle instead of single
        
        if (userError) throw userError;
        
        // If no user profile exists, create one
        if (!userData) {
          const { data: newUserData, error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email || email,
              username: data.user.user_metadata?.username || email.split('@')[0],
              level: 1,
              xp: 0,
              streak_days: 0
            })
            .select()
            .single();
            
          if (insertError) throw insertError;
          
          // Update user streak
          await updateStreak(data.user.id);
          
          set({ 
            user: newUserData, 
            session: data.session,
            isLoading: false 
          });
        } else {
          // User profile exists, update streak and set state
          await updateStreak(data.user.id);
          
          set({ 
            user: userData, 
            session: data.session,
            isLoading: false 
          });
        }
      } else {
        throw new Error('No user returned from authentication');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ 
        error: error.message || 'Failed to sign in', 
        isLoading: false 
      });
    }
  },
  
  signUp: async (email, password, username) => {
    set({ isLoading: true, error: null });
    
    try {
      // First create the auth user with sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }, // Store username in auth metadata
          emailRedirectTo: window.location.origin // Add redirect URL for email verification
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Failed to create auth user');
      }
      
      // Check if email confirmation is required
      if (authData.user.identities && authData.user.identities.length === 0) {
        set({
          isLoading: false,
          error: 'Email confirmation required. Please check your email to verify your account before signing in.'
        });
        return;
      }
      
      // Sign in immediately after sign up to get a valid session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) throw signInError;
      
      // Now insert the user record with the active session
      const { data: userData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          username,
          level: 1,
          xp: 0,
          streak_days: 0
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        await supabase.auth.signOut();
        throw new Error(`Failed to create user profile: ${insertError.message}`);
      }

      set({ 
        user: userData, 
        session: signInData.session,
        isLoading: false 
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      // Ensure we're signed out if anything fails
      await supabase.auth.signOut();
      set({ 
        error: error.message || 'Failed to sign up', 
        isLoading: false,
        user: null,
        session: null
      });
    }
  },
  
  signOut: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      set({ 
        user: null, 
        session: null,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to sign out', 
        isLoading: false 
      });
    }
  },
  
  refreshUser: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        set({ 
          user: null, 
          session: null,
          isLoading: false 
        });
        return;
      }

      // Query the users table for the profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (userError) throw userError;
      
      // If user profile doesn't exist, create one
      if (!userData) {
        const { data: newUserData, error: insertError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
            level: 1,
            xp: 0,
            streak_days: 0
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        set({ 
          user: newUserData, 
          session,
          isLoading: false,
          error: null
        });
      } else {
        set({ 
          user: userData, 
          session,
          isLoading: false,
          error: null
        });
      }
    } catch (error: any) {
      console.error('Refresh user error:', error);
      set({ 
        error: error.message || 'Failed to refresh user', 
        isLoading: false,
        user: null,
        session: null
      });
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      console.error('Reset password error:', error);
      set({ 
        error: error.message || 'Failed to send reset password email', 
        isLoading: false 
      });
      return false;
    }
  },

  updatePassword: async (password) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      console.error('Update password error:', error);
      set({ 
        error: error.message || 'Failed to update password', 
        isLoading: false 
      });
      return false;
    }
  }
}));