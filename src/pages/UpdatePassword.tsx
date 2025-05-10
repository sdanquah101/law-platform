import { useState, FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const UpdatePassword = () => {
  const { updatePassword, error, isLoading } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    setFormError(null);
    
    if (!password || !confirmPassword) {
      return;
    }
    
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError("Passwords don't match");
      return;
    }
    
    const success = await updatePassword(password);
    if (success) {
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  // If there's no hash in the URL, redirect to login
  if (typeof window !== 'undefined' && !window.location.hash && !success) {
    return <Navigate to="/login" replace />;
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
              {success ? (
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
              {success ? 'Password Updated' : 'Create New Password'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {success 
                ? 'Your password has been successfully updated' 
                : 'Enter your new password below'}
            </p>
          </div>

          {(error || formError) && !success && (
            <div className="bg-rose-100 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg mb-6 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{formError || error}</p>
              </div>
            </div>
          )}

          {success ? (
            <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg mb-6 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300">
              <p className="mb-2">Your password has been successfully updated.</p>
              <p className="text-sm">You will be redirected to the login page in a few seconds...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="password" className="form-label">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                    className={`input w-full pr-10 ${touched.password && (!password || password.length < 6) ? 'border-rose-500 dark:border-rose-500' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                    disabled={isLoading}
                    placeholder="Enter your new password"
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {touched.password && !password && (
                  <p className="text-sm text-rose-500 mt-1">Password is required</p>
                )}
                {touched.password && password && password.length < 6 && (
                  <p className="text-sm text-rose-500 mt-1">Password must be at least 6 characters</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    required
                    className={`input w-full pr-10 ${
                      touched.confirmPassword && 
                      (!confirmPassword || (password !== confirmPassword && confirmPassword)) 
                        ? 'border-rose-500 dark:border-rose-500' 
                        : ''
                    }`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                    disabled={isLoading}
                    placeholder="Confirm your new password"
                  />
                </div>
                {touched.confirmPassword && !confirmPassword && (
                  <p className="text-sm text-rose-500 mt-1">Please confirm your password</p>
                )}
                {touched.confirmPassword && confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-rose-500 mt-1">Passwords don't match</p>
                )}
              </div>

              <button
                type="submit"
                className={`btn btn-primary w-full mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
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

export default UpdatePassword;