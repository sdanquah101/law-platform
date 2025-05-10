import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore } from '../store/useQuizStore';

const QuizResults = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    questions, 
    correctAnswers,
    quizCompleted,
    currentCategory
  } = useQuizStore();
  
  const score = (correctAnswers / questions.length) * 100;
  const isPerfectScore = correctAnswers === questions.length;
  const isGoodScore = score >= 70;
  
  useEffect(() => {
    // If the quiz isn't completed, redirect to the quiz page
    if (!quizCompleted && questions.length > 0) {
      navigate('/quiz');
    }
    
    // If there are no questions, redirect to the categories page
    if (questions.length === 0) {
      navigate('/categories');
    }
  }, [quizCompleted, questions, navigate]);

  if (!user || questions.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {(isPerfectScore || isGoodScore) && <Confetti numberOfPieces={isPerfectScore ? 200 : 100} recycle={false} />}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card p-8 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {currentCategory ? `Category: ${currentCategory}` : 'Quick Quiz'}
        </p>
        
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
            className={`w-36 h-36 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold ${
              score >= 70
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            }`}
          >
            {Math.round(score)}%
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-2">
            {isPerfectScore
              ? 'Perfect Score!'
              : isGoodScore
                ? 'Great Job!'
                : 'Keep Practicing!'}
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400">
            You got {correctAnswers} out of {questions.length} questions correct.
          </p>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-6">
          <h3 className="font-bold mb-2">You've earned:</h3>
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <span>Correct Answers:</span>
              <span className="font-bold">{correctAnswers} × 10 XP = {correctAnswers * 10} XP</span>
            </li>
            
            {isPerfectScore && (
              <li className="flex items-center justify-between">
                <span>Perfect Score Bonus:</span>
                <span className="font-bold">50 XP</span>
              </li>
            )}
          </ul>
          
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between font-bold">
              <span>Total XP:</span>
              <span>{isPerfectScore ? correctAnswers * 10 + 50 : correctAnswers * 10} XP</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link to="/categories" className="btn btn-secondary flex-1">
            Study Another Topic
          </Link>
          
          {currentCategory ? (
            <Link to={`/quiz/${currentCategory}`} className="btn btn-primary flex-1">
              Try Again
            </Link>
          ) : (
            <Link to="/quiz" className="btn btn-primary flex-1">
              Take Another Quiz
            </Link>
          )}
        </div>
        
        <div className="mt-6">
          <Link to="/" className="text-blue-600 hover:underline dark:text-blue-400">
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizResults;