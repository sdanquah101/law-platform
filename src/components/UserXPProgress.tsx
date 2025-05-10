import { motion } from 'framer-motion';
import type { User } from '../types/database.types';

interface UserXPProgressProps {
  user: User;
}

const UserXPProgress = ({ user }: UserXPProgressProps) => {
  const currentXP = user.xp;
  const xpForNextLevel = user.level * 100;
  const xpFromPreviousLevel = (user.level - 1) * 100;
  const levelProgress = ((currentXP - xpFromPreviousLevel) / (xpForNextLevel - xpFromPreviousLevel)) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-sm">
        <span>Level {user.level}</span>
        <span>{currentXP} / {xpForNextLevel} XP</span>
      </div>
      <div className="xp-progress">
        <motion.div 
          className="xp-progress-bar"
          initial={{ width: '0%' }}
          animate={{ width: `${levelProgress}%` }}
          transition={{ duration: 1 }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
        <span>Level {user.level}</span>
        <span>Level {user.level + 1}</span>
      </div>
    </div>
  );
};

export default UserXPProgress;