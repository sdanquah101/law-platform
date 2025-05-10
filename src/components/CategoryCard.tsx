import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Category } from '../types/database.types';

interface CategoryCardProps {
  category: Category;
  index: number;
}

const CategoryCard = ({ category, index }: CategoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link 
        to={`/quiz/${category.id}`}
        className="block"
      >
        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="card h-full"
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div 
                className="w-12 h-12 mb-4 text-blue-500 dark:text-blue-400 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-lg"
                dangerouslySetInnerHTML={{ __html: category.icon }}
              />
              <div className="badge badge-primary">
                {category.question_count} questions
              </div>
            </div>
            
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
    </motion.div>
  );
};

export default CategoryCard;