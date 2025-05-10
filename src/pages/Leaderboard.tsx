import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLeaderboard } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import LeaderboardItem from '../components/LeaderboardItem';
import type { LeaderboardEntry } from '../types/database.types';
import { Trophy } from 'lucide-react';

const Leaderboard = () => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const data = await getLeaderboard(20);
      setLeaderboard(data);
      setIsLoading(false);
    };

    fetchLeaderboard();
  }, []);

  if (!user) return null;

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          See how you rank against other learners
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full mr-4"></div>
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full mr-3"></div>
                <div className="flex-grow">
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
                </div>
                <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : leaderboard.length > 0 ? (
        <>
          {/* Top 3 Section */}
          {topThree.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Map only the top 3 users with special styling */}
                {topThree.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className={`card p-6 text-center ${
                      index === 0 
                        ? 'border-2 border-yellow-400 dark:border-yellow-600 bg-gradient-to-b from-white to-yellow-50 dark:from-slate-800 dark:to-slate-800' 
                        : index === 1
                          ? 'border-2 border-slate-300 dark:border-slate-500 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-800'
                          : 'border-2 border-amber-400 dark:border-amber-700 bg-gradient-to-b from-white to-amber-50 dark:from-slate-800 dark:to-slate-800'
                    }`}
                  >
                    <div className="relative">
                      <div className="absolute -top-12 left-0 right-0 flex justify-center">
                        <div className={`
                          w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold
                          ${index === 0 ? 'bg-yellow-400 text-yellow-800' :
                            index === 1 ? 'bg-slate-300 text-slate-700' :
                            'bg-amber-400 text-amber-800'}
                        `}>
                          <Trophy size={36} />
                        </div>
                      </div>
                      
                      <div className="mt-10">
                        <div className="flex justify-center mb-3">
                          <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            {entry.avatar_url ? (
                              <img 
                                src={entry.avatar_url} 
                                alt={entry.username} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-500 dark:text-slate-400">
                                {entry.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-1">{entry.username}</h3>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Level {entry.level}</div>
                        <div className="text-2xl font-bold">{entry.score.toLocaleString()} XP</div>
                        
                        <div className={`
                          mt-2 text-sm font-bold py-1 px-3 rounded-full inline-block
                          ${index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            index === 1 ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}
                        `}>
                          #{entry.rank}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Rest of the Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-xl font-bold mb-4">Rankings</h2>
            <div className="space-y-3">
              {rest.map((entry, index) => (
                <LeaderboardItem 
                  key={entry.id} 
                  entry={entry} 
                  currentUserId={user.id} 
                  index={index + 3} 
                />
              ))}
            </div>
          </motion.div>
        </>
      ) : (
        <div className="card p-6 text-center">
          <h2 className="text-xl font-bold mb-2">No Data Available</h2>
          <p className="text-slate-600 dark:text-slate-400">
            There are no users on the leaderboard yet. Be the first to complete a quiz!
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;