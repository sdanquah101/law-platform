import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Use environment variables for the Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate Supabase configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const recordAnswer = async (userId: string, questionId: string, isCorrect: boolean, answerIndex: number | string, timeSpent: number = 0) => {
  try {
    const { error } = await supabase
      .from('user_answers')
      .insert({
        user_id: userId,
        question_id: questionId,
        is_correct: isCorrect,
        answer_index: answerIndex,
        time_spent: timeSpent
      });

    if (error) {
      console.error('Error recording answer:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error recording answer:', error);
    throw error;
  }
};

// Helper functions for database interactions
export const getQuestions = async (category?: string, limit = 10) => {
  try {
    // First verify connection
    const { error: connectionError } = await supabase.from('questions').select('count').limit(1);
    if (connectionError) {
      throw new Error(`Database connection error: ${connectionError.message}`);
    }

    const query = supabase
      .from('questions')
      .select('*');
    
    if (category) {
      query.eq('topic_id', category);
    }
    
    const { data, error } = await query.limit(limit);
    
    if (error) {
      console.error('Error fetching questions:', error);
      throw new Error(`Database query error: ${error.message}`);
    }
    
    // Add null check and ensure data is an array before mapping
    if (!data || !Array.isArray(data)) {
      console.warn('No questions found or invalid data format');
      return [];
    }
    
    // Transform the data to ensure options are always in the correct format
    return data.map(question => ({
      ...question,
      options: Array.isArray(question.options)
        ? question.options.map((opt: any, idx: number) => {
            if (typeof opt === 'object' && opt !== null && 'id' in opt && 'text' in opt) {
              return opt;
            } else if (typeof opt === 'string') {
              // If only text is present, assign id as a, b, c, ...
              return { id: String.fromCharCode(97 + idx), text: opt };
            } else {
              return { id: String.fromCharCode(97 + idx), text: String(opt) };
            }
          })
        : [],
      correct_option: typeof question.correct_answer === 'number' 
        ? question.correct_answer 
        : 0
    }));
  } catch (error: any) {
    console.error('Error in getQuestions:', {
      error,
      message: error.message,
      supabaseUrl,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data;
};

export const getUserAchievements = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements (
        id,
        title,
        description,
        icon,
        requirement
      )
    `)
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }

  return data;
};

export const getLeaderboard = async (limit: number) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url, level, xp')
    .order('xp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  // Add rank to each entry
  const leaderboard = data.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    score: entry.xp // Map xp to score for display purposes
  }));

  return leaderboard;
};

export const updateQuestionExplanation = async (questionId: string, explanation: string) => {
  const { error } = await supabase
    .from('questions')
    .update({ explanation })
    .eq('id', questionId);

  if (error) {
    console.error('Error updating question explanation:', error);
    return false;
  }

  return true;
};

export const generateExplanation = async (question: any) => {
  try {
    // Get the current session and access token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!session?.access_token) {
      throw new Error('No active session found');
    }

    // Prepare the request URL and headers
    const functionUrl = `${supabaseUrl}/functions/v1/generate-explanation`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };

    // Prepare the request body
    const body = {
      question: question.question_text,
      options: question.options,
      correct_answer: question.options[question.correct_option],
      question_type: question.question_type || 'multiple_choice'
    };

    // Make the request to the Edge Function
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.explanation) {
      throw new Error('No explanation received from the server');
    }

    // Update the question with the new explanation
    await updateQuestionExplanation(question.id, data.explanation);
    
    return data.explanation;
  } catch (error: any) {
    console.error('Error generating explanation:', error);
    throw new Error(`Failed to generate explanation: ${error.message}`);
  }
};

export const updateStreak = async (userId: string) => {
  if (!userId) {
    console.error('No user ID provided for streak update');
    return;
  }

  try {
    // First check if we can connect to Supabase
    const { error: connectionError } = await supabase.from('users').select('count').limit(1);
    if (connectionError) {
      throw new Error(`Failed to connect to Supabase: ${connectionError.message}`);
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Use single() instead of maybeSingle() since we know the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('last_login, streak_days')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`Error fetching user data: ${userError.message}`);
    }

    if (!user) {
      throw new Error('User not found');
    }

    let streakDays = user.streak_days || 0;
    let lastLogin = user.last_login ? new Date(user.last_login) : null;

    if (lastLogin) {
      const isYesterday = 
        lastLogin.getDate() === yesterday.getDate() &&
        lastLogin.getMonth() === yesterday.getMonth() &&
        lastLogin.getFullYear() === yesterday.getFullYear();

      const isMoreThanOneDay = lastLogin < yesterday;

      if (isYesterday) {
        streakDays += 1;
      } else if (isMoreThanOneDay) {
        streakDays = 1;
      }
    } else {
      streakDays = 1;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        streak_days: streakDays,
        last_login: today.toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Error updating streak: ${updateError.message}`);
    }
  } catch (error: any) {
    // Log the full error for debugging
    console.error('Error updating streak:', {
      error,
      message: error.message,
      userId,
      supabaseUrl,
      timestamp: new Date().toISOString()
    });
    
    // Re-throw the error to be handled by the calling function
    throw error;
  }
};

export const storeExplanationFeedback = async (userId: string, questionId: string, feedback: 'up' | 'down') => {
  try {
    const { error } = await supabase
      .from('explanation_feedback')
      .insert({
        user_id: userId,
        question_id: questionId,
        feedback,
        created_at: new Date().toISOString(),
      });
    if (error) {
      console.error('Error storing explanation feedback:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error storing explanation feedback:', error);
    throw error;
  }
};