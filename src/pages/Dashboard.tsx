import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Target, Award, LucideIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import UserXPProgress from '../components/UserXPProgress';
import DashboardStats from '../components/DashboardStats';
import { getCategories, getUserAchievements } from '../lib/supabase';
import type { Category, UserAchievement } from '../types/database.types';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (user) {
        const [categoriesData, achievementsData] = await Promise.all([
          getCategories(),
          getUserAchievements(user.id)
        ]);
        
        setCategories(categoriesData);
        setAchievements(achievementsData);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const featuredCategories = categories.slice(0, 3);

  if (!user) return null;

  return (
    <div>
      {/* Welcome Section */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold"
          >
            {user.username.charAt(0).toUpperCase()}
          </motion.div>
          
          <div className="flex-grow text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-2"
            >
              Welcome back, {user.username}!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-600 dark:text-slate-400 mb-4"
            >
              Continue your legal learning journey and level up your knowledge.
            </motion.p>
            
            <UserXPProgress user={user} />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
        <DashboardStats />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderActionCard(
            "Start Quiz",
            "Test your knowledge with a random quiz",
            BookOpen,
            "/quiz",
            "bg-gradient-to-br from-blue-500 to-indigo-600"
          )}
          {renderActionCard(
            "Practice Mode",
            "Train with targeted questions in your weak areas",
            Target,
            "/categories",
            "bg-gradient-to-br from-emerald-500 to-teal-600"
          )}
          {renderActionCard(
            "Achievements",
            "View your earned badges and rewards",
            Award,
            "/achievements",
            "bg-gradient-to-br from-amber-500 to-yellow-600"
          )}
        </div>
      </motion.div>

      {/* Featured Categories */}
      {featuredCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Featured Categories</h2>
            <Link to="/categories" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              featuredCategories.map((category, index) => (
                <Link key={category.id} to={`/quiz/${category.id}`}>
                  <motion.div 
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="card h-full"
                  >
                    <div className="p-6">
                      <div 
                        className="w-12 h-12 mb-4 text-blue-500 dark:text-blue-400 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-lg"
                        dangerouslySetInnerHTML={{ __html: category.icon }}
                      />
                      
                      <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {category.description}
                      </p>
                      
                      <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center">
                        Start Learning
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Achievements</h2>
            <Link to="/achievements" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full mb-4"></div>
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))
            ) : (
              achievements.slice(0, 3).map((achievement, index) => (
                <motion.div 
                  key={achievement.id}
                  className="card p-6"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-3"
                      dangerouslySetInnerHTML={{ __html: achievement.achievement.icon }}
                    />
                    
                    <h3 className="text-lg font-bold mb-1">{achievement.achievement.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {achievement.achievement.description}
                    </p>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                      Earned on {new Date(achievement.achieved_at).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Helper function to render action cards
function renderActionCard(
  title: string, 
  description: string, 
  Icon: LucideIcon, 
  link: string, 
  bgColor: string
) {
  return (
    <Link to={link}>
      <motion.div 
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`card overflow-hidden`}
      >
        <div className={`${bgColor} p-6 text-white`}>
          <Icon className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-1">{title}</h3>
          <p className="text-white/80 text-sm">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}

export default Dashboard;