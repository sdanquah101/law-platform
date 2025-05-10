import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '../types/database.types';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  currentUserId: string;
  index: number;
}

const LeaderboardItem = ({ entry, currentUserId, index }: LeaderboardItemProps) => {
  const isCurrentUser = entry.id === currentUserId;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`card p-4 mb-3 ${
        isCurrentUser ? 'border-2 border-blue-500 dark:border-blue-600' : ''
      }`}
    >
      <div className="flex items-center">
        <div className={`
          flex items-center justify-center w-8 h-8 rounded-full mr-4 font-bold
          ${index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
            index === 1 ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300' :
            index === 2 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}
        `}>
          {entry.rank}
        </div>
        
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 mr-3 overflow-hidden">
          {entry.avatar_url ? (
            <img 
              src={entry.avatar_url} 
              alt={entry.username} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
              {entry.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <div className="font-medium">{entry.username}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Level {entry.level}</div>
        </div>
        
        <div className="text-right">
          <div className="font-bold">{entry.score.toLocaleString()} XP</div>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardItem;