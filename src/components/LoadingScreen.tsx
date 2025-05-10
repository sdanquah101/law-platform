import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <svg 
          className="w-16 h-16 text-blue-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
          />
        </svg>
      </motion.div>
      <motion.h3 
        className="mt-4 font-bold text-lg text-blue-600"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Loading LawLearn...
      </motion.h3>
    </div>
  );
};

export default LoadingScreen;