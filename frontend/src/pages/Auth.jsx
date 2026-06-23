import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511994298241-608e28f14fde')] bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-sky-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md p-8 bg-slate-800/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-sky-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-sky-500/30">
            <span className="text-white font-black text-3xl italic tracking-tighter">B!</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Sign in to place your bids' : 'Join BidBike to start bidding'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-slate-300 font-medium text-sm mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/30 border border-slate-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-slate-300 font-medium text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/30 border border-slate-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/25 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-400 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sky-400 hover:text-sky-300 font-bold transition-colors ml-1"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
