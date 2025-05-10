import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Brain, Award, Calendar, Clock, TrendingUp } from 'lucide-react';

const DashboardStats = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    quizzesTaken: 0,
    averageScore: 0,
    streak: user?.streak_days || 0,
    achievementCount: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Fetch questions answered and correct answers
        const { count: answersCount, error: answersError } = await supabase
          .from('user_answers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: correctCount, error: correctError } = await supabase
          .from('user_answers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_correct', true);

        // Fetch quizzes taken
        const { count: quizzesCount, error: quizzesError } = await supabase
          .from('quiz_results')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch average score
        const { data: scoreData, error: scoreError } = await supabase
          .from('quiz_results')
          .select('score, total_questions')
          .eq('user_id', user.id);

        // Fetch achievements
        const { count: achievementCount, error: achievementError } = await supabase
          .from('user_achievements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (answersError || correctError || quizzesError || scoreError || achievementError) {
          console.error('Error fetching stats');
          return;
        }

        // Calculate average score
        let averageScore = 0;
        if (scoreData && scoreData.length > 0) {
          const totalPercentages = scoreData.reduce((acc, quiz) => {
            return acc + (quiz.score / quiz.total_questions) * 100;
          }, 0);
          averageScore = totalPercentages / scoreData.length;
        }

        setStats({
          questionsAnswered: answersCount || 0,
          correctAnswers: correctCount || 0,
          quizzesTaken: quizzesCount || 0,
          averageScore: Math.round(averageScore),
          streak: user?.streak_days || 0,
          achievementCount: achievementCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  const statsItems = [
    {
      label: 'Questions Answered',
      value: stats.questionsAnswered,
      icon: <Brain className="text-blue-500" />,
    },
    {
      label: 'Correct Answers',
      value: stats.correctAnswers,
      icon: <TrendingUp className="text-emerald-500" />,
    },
    {
      label: 'Quizzes Taken',
      value: stats.quizzesTaken,
      icon: <Clock className="text-indigo-500" />,
    },
    {
      label: 'Average Score',
      value: `${stats.averageScore}%`,
      icon: <Clock className="text-amber-500" />,
    },
    {
      label: 'Current Streak',
      value: stats.streak,
      icon: <Calendar className="text-rose-500" />,
    },
    {
      label: 'Achievements',
      value: stats.achievementCount,
      icon: <Award className="text-purple-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {statsItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="card p-4"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-2">
              {item.icon}
            </div>
            <div className="text-2xl font-bold mb-1">{item.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;