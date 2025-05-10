import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCategories, supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore } from '../store/useQuizStore';
import CategoryCard from '../components/CategoryCard';
import QuizQuestion from '../components/QuizQuestion';
import type { Category, Question } from '../types/database.types';

const fetchCategoriesWithCounts = async () => {
  const { data: categories, error } = await supabase.from('categories').select('*');
  if (error || !categories) return [];
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const { count } = await supabase
        .from('questions')
        .select('id', { count: 'exact', head: true })
        .eq('topic_id', cat.id);
      return { ...cat, question_count: count || 0 };
    })
  );
  return categoriesWithCounts;
};

const Categories = () => {
  const { user } = useAuthStore();
  const { questions, fetchQuestions, answerQuestion, currentQuestionIndex, answers, nextQuestion, previousQuestion } = useQuizStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const selectedAnswer = answers[currentQuestionIndex] ?? -1;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await fetchCategoriesWithCounts();
      setCategories(data);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchQuestions(selectedCategory, 10);
      setShowExplanation(false);
    }
  }, [selectedCategory, fetchQuestions]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleAnswer = async (answer: number | string) => {
    if (!user) return;
    
    const timeSpent = 0; // You can implement time tracking if needed
    await answerQuestion(answer, timeSpent, user.id);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    nextQuestion();
  };

  const handlePreviousQuestion = () => {
    setShowExplanation(false);
    previousQuestion();
  };

  const renderContent = () => {
    if (selectedCategory && questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      
      return (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Categories
            </button>
            
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>

          <div className="card p-6 mb-6">
            <QuizQuestion
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              onAnswer={handleAnswer}
              showExplanation={showExplanation}
              onShowExplanation={() => setShowExplanation(true)}
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>
            
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className="btn btn-primary"
            >
              Next Question
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">Law Categories</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Choose a legal topic to start your learning journey
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div key={category.id} onClick={() => handleCategorySelect(category.id)}>
                <CategoryCard category={category} index={index} />
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return <div>{renderContent()}</div>;
};

export default Categories;