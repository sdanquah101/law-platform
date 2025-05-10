import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore } from '../store/useQuizStore';
import QuizQuestion from '../components/QuizQuestion';

// Helper to check for MCQ type
const isMCQType = (type: string) => type === 'multiple_choice' || type === 'mcq';

const QuizPage = () => {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    questions,
    currentQuestionIndex,
    answers,
    isLoading,
    error,
    fetchQuestions,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    completeQuiz
  } = useQuizStore();
  const [showExplanation, setShowExplanation] = useState(false);
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<number | string>(-1);

  useEffect(() => {
    if (user) {
      fetchQuestions(categoryId, 10);
    }
  }, [fetchQuestions, categoryId, user]);

  useEffect(() => {
    setLocalSelectedAnswer(answers[currentQuestionIndex] ?? -1);
  }, [currentQuestionIndex, answers]);

  const handleAnswer = async (answerIndex: number | string) => {
    if (!user) return;
    setLocalSelectedAnswer(answerIndex);
    await answerQuestion(answerIndex, 0, user.id);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    nextQuestion();
  };

  const handlePreviousQuestion = () => {
    setShowExplanation(false);
    previousQuestion();
  };

  const handleCompleteQuiz = async () => {
    if (!user) return;
    const result = await completeQuiz(user.id);
    navigate('/quiz-results');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <h2 className="text-xl font-bold text-rose-600 mb-2">Error Loading Quiz</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
        <button 
          onClick={() => fetchQuestions(categoryId, 10)} 
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="card p-6 text-center">
        <h2 className="text-xl font-bold mb-2">No Questions Available</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          There are no questions available for this category right now.
        </p>
        <button 
          onClick={() => navigate('/categories')} 
          className="btn btn-primary"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold mb-2">
          {categoryId ? `${categoryId} Quiz` : 'Quick Quiz'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        
        <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700 mb-6">
          <motion.div 
            className="bg-blue-600 h-2.5 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      <div className="card p-6 mb-6">
        <QuizQuestion
          question={currentQuestion}
          selectedAnswer={localSelectedAnswer}
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
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleCompleteQuiz}
              className="btn btn-primary"
              disabled={localSelectedAnswer === -1}
            >
              Complete Quiz
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="btn btn-primary"
              disabled={localSelectedAnswer === -1}
            >
              Next Question
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default QuizPage;