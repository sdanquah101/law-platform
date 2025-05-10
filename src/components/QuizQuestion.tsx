import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { evaluateEssayAnswer, evaluateFillInBlankAnswer, generateExplanation } from '../lib/evaluations';
import { storeExplanationFeedback } from '../lib/supabase';
import type { Question } from '../types/database.types';
import { useAuthStore } from '../store/useAuthStore';

interface QuizQuestionProps {
  question: Question;
  selectedAnswer: number | string;
  onAnswer: (answer: number | string, timeSpent: number) => void;
  showExplanation: boolean;
  onShowExplanation: () => void;
}

const QuizQuestion = ({
  question,
  selectedAnswer,
  onAnswer,
  showExplanation,
  onShowExplanation,
}: QuizQuestionProps) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const startTimeRef = useRef<number>(Date.now());
  const [feedback, setFeedback] = useState<null | 'up' | 'down'>(null);
  const { user } = useAuthStore ? useAuthStore() : { user: null };
  const [essayScore, setEssayScore] = useState<number | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setTextAnswer('');
    setFeedback(null);
    setExplanation(null);
  }, [question.id]);

  const storeFeedback = async (feedbackType: 'up' | 'down') => {
    setFeedback(feedbackType);
    if (user && question.id) {
      try {
        await storeExplanationFeedback(user.id, question.id, feedbackType);
      } catch (e) {
        // Optionally handle error
      }
    }
  };

  const fetchExplanation = async (selectedId: string) => {
    if (explanation) {
      onShowExplanation();
      return;
    }
    setIsLoadingExplanation(true);
    setError(null);
    try {
      let result: string | null = null;
      if (question.explanation) {
        result = question.explanation;
      } else if (isMCQType(question.question_type)) {
        result = await generateExplanation(question, selectedId);
        if (typeof result === 'string' && result.length > 0 && question.id && typeof question.id === 'string') {
          try {
            await import('../lib/supabase').then(mod => mod.updateQuestionExplanation(question.id, result as string));
          } catch (e) { /* ignore update errors */ }
        }
      } else if (question.question_type === 'fill_in') {
        const fillInResult = await evaluateFillInBlankAnswer(question.question_text, String(selectedId), question.correct_answer);
        result = fillInResult?.explanation || fillInResult?.feedback || null;
      } else if (question.question_type === 'essay') {
        const essayResult = await evaluateEssayAnswer(question.question_text, String(selectedId), question.correct_answer);
        result = essayResult?.explanation ?? null;
      }
      setExplanation(result);
      onShowExplanation();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch explanation');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleAnswerSubmission = async (answerId: string) => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    try {
      setError(null);
      onAnswer(answerId, timeSpent);
      if (question.question_type === 'essay') {
        // Call the LLM immediately and store score and explanation
        const essayResult = await evaluateEssayAnswer(question.question_text, String(answerId), question.correct_answer);
        setEssayScore(essayResult?.score ?? null);
        setExplanation(essayResult?.explanation ?? null); // Store explanation for later
      }
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate answer');
    }
  };

  const renderQuestionContent = () => {
    if (isMCQType(question.question_type)) {
      return (
        <div className="options space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.id === question.correct_answer;
            const isIncorrect = isSelected && !isCorrect;

            let optionClass = "quiz-option relative";
            if (isSelected) optionClass += " selected";
            if (isSelected && isCorrect) optionClass += " correct";
            if (isIncorrect) optionClass += " incorrect";
            if (!isSelected && isCorrect && selectedAnswer !== -1) optionClass += " correct";

            return (
              <motion.button
                key={option.id}
                whileHover={selectedAnswer === -1 ? { scale: 1.01 } : {}}
                whileTap={selectedAnswer === -1 ? { scale: 0.98 } : {}}
                className={optionClass}
                onClick={() => {
                  if (selectedAnswer === -1) {
                    handleAnswerSubmission(option.id);
                  }
                }}
                disabled={selectedAnswer !== -1}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 border-slate-300 dark:border-slate-600">
                    {option.id.toUpperCase()}
                  </div>
                  <div className="flex-grow">{option.text}</div>
                  {((isSelected && isCorrect) || (!isSelected && isCorrect && selectedAnswer !== -1)) && (
                    <div className="flex-shrink-0 ml-3 text-emerald-600 dark:text-emerald-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                  {isIncorrect && (
                    <div className="flex-shrink-0 ml-3 text-rose-600 dark:text-rose-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                  )}
                </div>
                {(!isSelected && isCorrect && selectedAnswer !== -1) && (
                  <div className="absolute inset-0 border-2 border-emerald-500 dark:border-emerald-400 rounded-lg pointer-events-none"></div>
                )}
              </motion.button>
            );
          })}
        </div>
      );
    }
    switch (question.question_type) {
      case 'fill_in':
      case 'essay':
        const isFillIn = question.question_type === 'fill_in';
        const isCorrectFillIn = isFillIn && String(selectedAnswer).trim().toLowerCase() === String(question.correct_answer).trim().toLowerCase();
        return (
          <div className="space-y-4">
            {selectedAnswer === -1 ? (
              <>
                <textarea
                  className="w-full p-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  placeholder={`Type your ${question.question_type === 'essay' ? 'essay' : 'answer'} here...`}
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  rows={question.question_type === 'essay' ? 6 : 1}
                />
                <button
                  className="btn btn-primary w-full"
                  onClick={() => textAnswer.trim() && handleAnswerSubmission(textAnswer.trim())}
                  disabled={!textAnswer.trim()}
                >
                  Submit Answer
                </button>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between`}>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Your answer:</div>
                      <div className="font-medium">{selectedAnswer}</div>
                    </div>
                    {isFillIn && !isCorrectFillIn && (
                      <div className="ml-4 text-rose-600 dark:text-rose-400 flex items-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </div>
                    )}
                  </div>
                  {isFillIn && (
                    <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">Correct answer:</div>
                      <div className="font-medium text-emerald-700 dark:text-emerald-300">{question.correct_answer}</div>
                    </div>
                  )}
                </div>
                {question.question_type === 'essay' && essayScore !== null && (
                  <div className="absolute bottom-2 right-4 text-xs text-slate-500 bg-white/80 px-2 py-1 rounded shadow">
                    {essayScore}/10
                  </div>
                )}
              </>
            )}
          </div>
        );

      default:
        return <p>Unsupported question type: {question.question_type}</p>;
    }
  };

  // Show explanation button for all question types after answering
  const canShowExplanation = selectedAnswer !== -1;

  return (
    <div className="quiz-question">
      <h3 className="text-xl font-semibold mb-6">{question.question_text}</h3>

      {renderQuestionContent()}

      {canShowExplanation && (
        <button
          className="btn btn-secondary mt-4"
          onClick={() => fetchExplanation(String(selectedAnswer))}
          disabled={isLoadingExplanation}
        >
          {isLoadingExplanation ? 'Loading...' : 'Show Explanation'}
        </button>
      )}

      {showExplanation && (
        <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <h4 className="text-lg font-medium mb-2">Explanation</h4>
          {isLoadingExplanation ? (
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          ) : error ? (
            <div className="text-rose-600 dark:text-rose-400">{error}</div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              {(() => { console.log('LLM Explanation:', explanation); return null; })()}
              {(() => {
                let displayExplanation = explanation;
                try {
                  if (typeof explanation === 'string' && explanation.trim().startsWith('{')) {
                    const parsed = JSON.parse(explanation);
                    if (parsed.error) {
                      displayExplanation = parsed.error;
                    }
                  }
                } catch (e) {
                  displayExplanation = explanation;
                }
                return <ReactMarkdown>{(displayExplanation && displayExplanation.trim()) ? displayExplanation : (question.explanation || 'No explanation available.')}</ReactMarkdown>;
              })()}
              <div className="flex gap-4 mt-4">
                <button
                  className={`px-3 py-1 rounded-full border ${feedback === 'up' ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'border-slate-300 dark:border-slate-600'}`}
                  onClick={() => storeFeedback('up')}
                  disabled={!!feedback}
                  aria-label="Thumbs up"
                >
                  👍
                </button>
                <button
                  className={`px-3 py-1 rounded-full border ${feedback === 'down' ? 'bg-rose-100 border-rose-400 text-rose-700' : 'border-slate-300 dark:border-slate-600'}`}
                  onClick={() => storeFeedback('down')}
                  disabled={!!feedback}
                  aria-label="Thumbs down"
                >
                  👎
                </button>
                {feedback && (
                  <span className="ml-2 text-sm text-slate-500">Thank you for your feedback!</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper to check for MCQ type
const isMCQType = (type: string) => type === 'multiple_choice' || type === 'mcq';

export default QuizQuestion;