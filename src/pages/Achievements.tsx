import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserAchievements } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import AchievementCard from '../components/AchievementCard';
import type { UserAchievement } from '../types/database.types';

const Achievements = () => {
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;
      
      setIsLoading(true);
      const data = await getUserAchievements(user.id);
      setAchievements(data);
      setIsLoading(false);
    };

    fetchAchievements();
  }, [user]);

  if (!user) return null;

  // Group achievements by category
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const condition = achievement.achievement.condition;
    let category = 'General';
    
    if (condition.includes('streak')) {
      category = 'Consistency';
    } else if (condition.includes('level')) {
      category = 'Progression';
    } else if (condition.includes('quiz')) {
      category = 'Quiz Performance';
    }
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, UserAchievement[]>);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Your Achievements</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Track your progress and unlock badges as you learn
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full mb-4"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedAchievements).length > 0 ? (
            Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-4">{category} Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {categoryAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      name={achievement.achievement.name}
                      description={achievement.achievement.description}
                      icon={achievement.achievement.icon}
                      achieved={true}
                      achievedAt={achievement.achieved_at}
                    />
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="card p-8 text-center">
              <h2 className="text-xl font-bold mb-4">No Achievements Yet</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Complete quizzes, maintain your streak, and level up to earn achievements!
              </p>
              <div className="flex justify-center">
                <a href="/categories" className="btn btn-primary">
                  Start Learning
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Achievements;