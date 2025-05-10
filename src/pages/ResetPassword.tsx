import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const { resetPassword, error, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    
    if (!email) return;
    
    const success = await resetPassword(email);
    if (success) {
      setSubmitted(true);
    }
  };

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
              {submitted ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
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
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                  />
                </svg>
              )}
            </motion.div>
            <h1 className="text-2xl font-bold">
              {submitted ? 'Check Your Email' : 'Reset Your Password'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {submitted 
                ? 'We\'ve sent you a password reset link' 
                : 'Enter your email to receive a password reset link'}
            </p>
          </div>

          {error && !submitted && (
            <div className="bg-rose-100 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg mb-6 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {submitted ? (
            <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg mb-6 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300">
              <p className="mb-2">A password reset link has been sent to <strong>{email}</strong></p>
              <p className="text-sm">Please check your email and follow the instructions to reset your password. The link will expire in 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  required
                  className={`input w-full ${touched && !email ? 'border-rose-500 dark:border-rose-500' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  disabled={isLoading}
                  placeholder="Enter your email"
                />
                {touched && !email && (
                  <p className="text-sm text-rose-500 mt-1">Email is required</p>
                )}
              </div>

              <button
                type="submit"
                className={`btn btn-primary w-full mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;