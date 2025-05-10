import { supabase } from './supabase';

export const evaluateEssayAnswer = async (question: string, studentResponse: string, keyPoints: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No active session found');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-essay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ question, studentResponse, keyPoints }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error evaluating essay:', error);
    throw error;
  }
};

export const evaluateFillInBlankAnswer = async (question: string, studentResponse: string, correctAnswer: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No active session found');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-fill-in-blank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ question, studentResponse, correctAnswer }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error evaluating fill in blank:', error);
    throw error;
  }
};

export const generateExplanation = async (question: any, studentResponse: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No active session found');
    }

    // Construct minimal question object for the LLM
    const minimalQuestion = {
      question_text: question.question_text,
      correct_answer: question.correct_answer,
      options: question.options,
      question_type: question.question_type,
    };

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-explanation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ question: minimalQuestion, student_response: studentResponse }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.explanation;
  } catch (error) {
    console.error('Error generating explanation:', error);
    throw error;
  }
};