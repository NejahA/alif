import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/register', { 
        username, email, password, confirmPassword 
      });
      login(response.data.tokens.accessToken, response.data.user);
      toast.success('Successfully registered!');
      navigate('/dashboard');
    } catch (error: any) {
      const details = error.response?.data?.details;
      if (details && details.length > 0) {
        toast.error(details[0].message);
      } else {
        toast.error(error.response?.data?.error || 'Failed to register');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-400">
          Begin Your Journey
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
            <input 
              type="text" 
              required
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="TimeTraveler99"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="traveler@time.com"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="relative w-full py-4 mt-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(251,146,60,0.4)] hover:shadow-[0_0_25px_rgba(251,146,60,0.6)] overflow-hidden"
          >
            {isSubmitting ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : null}
            <span className={isSubmitting ? 'opacity-0' : 'opacity-100 transition-opacity'}>
              Start Journey
            </span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Login here
            </Link>
          </p>
          <p className="mt-2 text-gray-400 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-300 transition-colors">
              &larr; Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
