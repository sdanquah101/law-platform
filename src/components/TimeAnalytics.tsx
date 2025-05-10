import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TimeAnalyticsProps {
  userId: string;
}

interface TimeData {
  averageTime: number;
  timePerCategory: Record<string, number>;
  timeHistory: Array<{ date: string; time: number }>;
  improvementRate: number;
}

const TimeAnalytics = ({ userId }: TimeAnalyticsProps) => {
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNoData, setHasNoData] = useState(false);

  useEffect(() => {
    const fetchTimeData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setHasNoData(false);

        // Fetch average time per question
        const { data: averageTimeData, error: avgError } = await supabase
          .from('user_profiles')
          .select('average_time')
          .eq('user_id', userId)
          .maybeSingle();

        if (avgError) throw avgError;

        // Fetch time per category
        const { data: categoryData, error: catError } = await supabase
          .from('user_answers')
          .select(`
            time_spent,
            questions (
              topic_id
            )
          `)
          .eq('user_id', userId);

        if (catError) throw catError;

        // If we have no data at all, show the no data state
        if (!averageTimeData && (!categoryData || categoryData.length === 0)) {
          setHasNoData(true);
          return;
        }

        // Calculate time per category
        const timePerCategory = categoryData.reduce((acc: Record<string, number>, curr) => {
          const category = curr.questions.topic_id;
          acc[category] = (acc[category] || 0) + curr.time_spent;
          return acc;
        }, {});

        // Fetch time history (last 10 answers)
        const { data: historyData, error: histError } = await supabase
          .from('user_answers')
          .select('time_spent, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .limit(10);

        if (histError) throw histError;

        // Calculate improvement rate
        const timeHistory = historyData.map(item => ({
          date: new Date(item.created_at).toLocaleDateString(),
          time: item.time_spent
        }));

        const improvementRate = calculateImprovementRate(timeHistory);

        setTimeData({
          averageTime: averageTimeData?.average_time || 0,
          timePerCategory,
          timeHistory,
          improvementRate
        });
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching time data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeData();
  }, [userId]);

  const calculateImprovementRate = (history: Array<{ date: string; time: number }>) => {
    if (history.length < 2) return 0;
    
    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.floor(history.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, item) => sum + item.time, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.time, 0) / secondHalf.length;
    
    return ((firstAvg - secondAvg) / firstAvg) * 100;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    );
  }

  if (hasNoData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center card">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Time Analytics Yet</h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Complete some quizzes to start tracking your time performance!
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-rose-600 dark:text-rose-400 p-4 rounded-lg border border-rose-200 dark:border-rose-800">
        Error loading time analytics: {error}
      </div>
    );
  }

  if (!timeData) return null;

  const timeHistoryChart: ChartData<'line'> = {
    labels: timeData.timeHistory.map(item => item.date),
    datasets: [
      {
        label: 'Time per Question (seconds)',
        data: timeData.timeHistory.map(item => item.time),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const categoryChart: ChartData<'bar'> = {
    labels: Object.keys(timeData.timePerCategory),
    datasets: [
      {
        label: 'Average Time per Category (seconds)',
        data: Object.values(timeData.timePerCategory),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Average Time</div>
              <div className="text-2xl font-bold">{timeData.averageTime}s</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full ${
              timeData.improvementRate > 0
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
            }`}>
              {timeData.improvementRate > 0 ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Time Improvement</div>
              <div className="text-2xl font-bold">
                {Math.abs(timeData.improvementRate).toFixed(1)}%
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Categories Tracked</div>
              <div className="text-2xl font-bold">{Object.keys(timeData.timePerCategory).length}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Time History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="card p-6"
      >
        <h3 className="text-lg font-bold mb-4">Time History</h3>
        <div className="h-[300px]">
          <Line
            data={timeHistoryChart}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Time (seconds)',
                  },
                },
              },
            }}
          />
        </div>
      </motion.div>

      {/* Category Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-bold mb-4">Time per Category</h3>
        <div className="h-[300px]">
          <Bar
            data={categoryChart}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Average Time (seconds)',
                  },
                },
              },
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default TimeAnalytics;