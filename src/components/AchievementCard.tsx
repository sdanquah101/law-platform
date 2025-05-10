import { motion } from 'framer-motion';

interface AchievementCardProps {
  name: string;
  description: string;
  icon: string;
  achieved: boolean;
  achievedAt?: string;
}

const AchievementCard = ({ name, description, icon, achieved, achievedAt }: AchievementCardProps) => {
  return (
    <motion.div 
      className={`card p-4 h-full ${
        achieved ? 'border-2 border-amber-500' : 'opacity-50 grayscale'
      }`}
      whileHover={{ 
        scale: achieved ? 1.03 : 1,
        boxShadow: achieved ? "0px 5px 15px rgba(0, 0, 0, 0.1)" : "none"
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center text-center h-full">
        <div className={`p-3 rounded-full mb-3 ${
          achieved 
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
        }`}>
          <div dangerouslySetInnerHTML={{ __html: icon }} className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold mb-1">{name}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow">{description}</p>
        
        {achieved && achievedAt && (
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
            Achieved on {new Date(achievedAt).toLocaleDateString()}
          </div>
        )}
        
        {!achieved && (
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
            Not yet achieved
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AchievementCard;