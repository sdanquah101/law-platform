export type User = {
  id: string;
  email: string;
  created_at: string;
  username: string;
  avatar_url?: string;
  level: number;
  xp: number;
  streak_days: number;
  last_login: string;
}

export type Question = {
  id: string;  // Changed from number to string to match UUID type
  question_text: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  correct_answer: string;
  explanation?: string;
  question_type: 'multiple_choice' | 'fill_in' | 'essay';
  topic_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export type UserAnswer = {
  id: string;
  user_id: string;
  question_id: string;  // Changed from number to string to match UUID type
  is_correct: boolean;
  answer_index: number | string;
  time_spent: number;
  created_at: string;
}

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export type UserAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  achieved_at: string;
  achievement: Achievement;
}

export type LeaderboardEntry = {
  id: string;
  username: string;
  avatar_url?: string;
  score: number;
  level: number;
  rank: number;
}

export type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
  question_count: number;
}

export type QuizResult = {
  id: string;
  user_id: string;
  score: number;
  total_questions: number;
  time_taken: number;
  created_at: string;
  category?: string;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at'>;
        Update: Partial<Omit<User, 'created_at'>>;
      };
      questions: {
        Row: Question;
        Insert: Omit<Question, 'created_at'>;
        Update: Partial<Omit<Question, 'created_at'>>;
      };
      user_answers: {
        Row: UserAnswer;
        Insert: Omit<UserAnswer, 'id' | 'created_at'>;
        Update: Partial<Omit<UserAnswer, 'id' | 'created_at'>>;
      };
    };
  };
};