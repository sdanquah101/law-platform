import { useState, FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const { user, signIn, error, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    await signIn(email, password);
  };

  const getErrorMessage = () => {
    if (error?.includes('Invalid login credentials')) {
      return 'The email or password you entered is incorrect. Please try again.';
    }
    return error;
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="card p-8 w-full">
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4"
            >
              <svg 
                className="w-8 h-8" 
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
            <h1 className="text-2xl font-bold">Welcome to LawLearn</h1>
            <p className="text-slate-600 dark:text-slate-400">Sign in to continue your learning journey</p>
          </div>

          {error && (
            <div className="bg-rose-100 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg mb-6 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{getErrorMessage()}</p>
                <p className="text-sm mt-1">Please check your credentials and try again.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                required
                className={`input w-full ${touched.email && !email ? 'border-rose-500 dark:border-rose-500' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                disabled={isLoading}
                placeholder="Enter your email"
              />
              {touched.email && !email && (
                <p className="text-sm text-rose-500 mt-1">Email is required</p>
              )}
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="form-label">Password</label>
                <Link 
                  to="/reset-password" 
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                required
                className={`input w-full ${touched.password && !password ? 'border-rose-500 dark:border-rose-500' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                disabled={isLoading}
                placeholder="Enter your password"
              />
              {touched.password && !password && (
                <p className="text-sm text-rose-500 mt-1">Password is required</p>
              )}
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline dark:text-blue-400">
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;