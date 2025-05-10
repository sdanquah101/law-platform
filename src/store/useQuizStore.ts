import { create } from 'zustand';
import type { Question, QuizResult } from '../types/database.types';
import { getQuestions, recordAnswer } from '../lib/supabase';
import { supabase } from '../lib/supabase';

type QuizState = {
  questions: Question[];
  currentQuestionIndex: number;
  answers: (number | string)[];
  correctAnswers: number;
  isLoading: boolean;
  quizStartTime: Date | null;
  quizCompleted: boolean;
  currentCategory: string | null;
  error: string | null;
  
  fetchQuestions: (category?: string, limit?: number) => Promise<void>;
  answerQuestion: (answer: number | string, timeSpent: number, userId: string) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  resetQuiz: () => void;
  completeQuiz: (userId: string) => Promise<QuizResult | null>;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  correctAnswers: 0,
  isLoading: false,
  quizStartTime: null,
  quizCompleted: false,
  currentCategory: null,
  error: null,
  
  fetchQuestions: async (category, limit = 10) => {
    set({ isLoading: true, error: null });
    
    try {
      const questions = await getQuestions(category, limit);
      set({ 
        questions, 
        currentQuestionIndex: 0,
        answers: Array(questions.length).fill(-1),
        correctAnswers: 0,
        quizStartTime: new Date(),
        quizCompleted: false,
        currentCategory: category || null,
        isLoading: false
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch questions', 
        isLoading: false 
      });
    }
  },
  
  answerQuestion: async (answer: number | string, timeSpent: number, userId: string) => {
    const { questions, currentQuestionIndex, answers, correctAnswers } = get();
    const currentQuestion = questions[currentQuestionIndex];
    
    // Check if the answer is correct based on question type
    let isCorrect = false;
    let answerToStore: number | string = answer;
    switch (currentQuestion.question_type) {
      case 'multiple_choice':
        // For multiple choice, compare the selected option's id with the correct answer
        isCorrect = String(answer) === String(currentQuestion.correct_answer);
        break;
      case 'fill_in':
        // For fill in blank, compare the text directly
        isCorrect = String(answer).toLowerCase() === String(currentQuestion.correct_answer).toLowerCase();
        answerToStore = String(answer); // Always store as string
        break;
      case 'essay':
        // Essay questions are evaluated separately
        isCorrect = true;
        break;
      default:
        isCorrect = String(answer) === String(currentQuestion.correct_answer);
    }
    
    // Update answers array
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerToStore;
    
    // Update correct answers count
    const newCorrectAnswers = isCorrect 
      ? correctAnswers + 1 
      : correctAnswers;
    
    // Record the answer in the database
    await recordAnswer(userId, currentQuestion.id, isCorrect, answerToStore, timeSpent);
    
    set({
      answers: newAnswers,
      correctAnswers: newCorrectAnswers
    });
  },
  
  nextQuestion: () => {
    const { currentQuestionIndex, questions, answers } = get();
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const newAnswers = [...answers];
      if (typeof newAnswers[nextIndex] === 'undefined') {
        newAnswers[nextIndex] = -1;
      }
      set({ currentQuestionIndex: nextIndex, answers: newAnswers });
    }
  },
  
  previousQuestion: () => {
    const { currentQuestionIndex, answers } = get();
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      const newAnswers = [...answers];
      if (typeof newAnswers[prevIndex] === 'undefined') {
        newAnswers[prevIndex] = -1;
      }
      set({ currentQuestionIndex: prevIndex, answers: newAnswers });
    }
  },
  
  resetQuiz: () => {
    set({
      currentQuestionIndex: 0,
      answers: [],
      correctAnswers: 0,
      quizStartTime: new Date(),
      quizCompleted: false,
      error: null
    });
  },
  
  completeQuiz: async (userId) => {
    const { questions, correctAnswers, quizStartTime, currentCategory } = get();
    
    if (!quizStartTime) return null;
    
    const endTime = new Date();
    const timeTaken = Math.floor((endTime.getTime() - quizStartTime.getTime()) / 1000);
    
    set({ quizCompleted: true });
    
    try {
      // Record the quiz result
      const { data, error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: userId,
          score: correctAnswers,
          total_questions: questions.length,
          time_taken: timeTaken,
          category: currentCategory || undefined
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update user XP (10 XP per correct answer)
      await supabase.rpc('increment_user_xp', { 
        user_id: userId, 
        xp_amount: correctAnswers * 10 
      });
      
      return data as QuizResult;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to record quiz results'
      });
      return null;
    }
  }
}));