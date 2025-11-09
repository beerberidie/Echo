import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';

interface LoginFormProps {
  onClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await authAPI.login({ email, password });
        if (response.success) {
          localStorage.setItem('token', response.data.token);
          window.location.reload(); // Reload to fetch user data with the new token
        }
      } else {
        // Register
        if (!name) {
          setError('Name is required');
          setIsLoading(false);
          return;
        }
        
        const response = await authAPI.register({ name, email, password });
        if (response.success) {
          localStorage.setItem('token', response.data.token);
          window.location.reload(); // Reload to fetch user data with the new token
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {isLogin ? 'Login' : 'Create Account'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
              minLength={6}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {isLogin ? 'Need an account?' : 'Already have an account?'}
            </button>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
