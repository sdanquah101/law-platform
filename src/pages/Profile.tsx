import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import UserXPProgress from '../components/UserXPProgress';
import TimeAnalytics from '../components/TimeAnalytics';
import { getUserAchievements } from '../lib/supabase';
import { Award, Calendar, BookOpen, Clock } from 'lucide-react';
import type { UserAchievement } from '../types/database.types';

const Profile = () => {
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

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

  const recentAchievements = achievements.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold"
            >
              {user.username.charAt(0).toUpperCase()}
            </motion.div>
            
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-800 rounded-full px-2 py-1 text-xs font-bold flex items-center">
              <Award size={12} className="mr-1" />
              Level {user.level}
            </div>
          </div>
          
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-1">{user.email}</p>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6 mt-3">
              <div className="badge badge-primary flex items-center">
                <Calendar size={14} className="mr-1" />
                {user.streak_days} day streak
              </div>
              
              <div className="badge badge-success flex items-center">
                <Award size={14} className="mr-1" />
                {achievements.length} achievements
              </div>
              
              <div className="badge badge-warning flex items-center">
                <Clock size={14} className="mr-1" />
                Joined {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">XP Progress</h3>
              <UserXPProgress user={user} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 dark:text-slate-400'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'analytics'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 dark:text-slate-400'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          Time Analytics
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-4">Your Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mb-3">
                    <BookOpen size={24} />
                  </div>
                  <div className="text-2xl font-bold mb-1">{user.xp}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total XP</div>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <Award size={24} />
                  </div>
                  <div className="text-2xl font-bold mb-1">{user.level}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Current Level</div>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center mb-3">
                    <Calendar size={24} />
                  </div>
                  <div className="text-2xl font-bold mb-1">{user.streak_days}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Day Streak</div>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center mb-3">
                    <Award size={24} />
                  </div>
                  <div className="text-2xl font-bold mb-1">{achievements.length}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Achievements</div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Recent Achievements */}
          {recentAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Recent Achievements</h2>
                <a href="/achievements" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm">
                  View All
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="card p-6 animate-pulse">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full mb-4"></div>
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mt-2"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  recentAchievements.map((achievement) => (
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
        </>
      ) : (
        <TimeAnalytics userId={user.id} />
      )}
    </div>
  );
};

export default Profile;