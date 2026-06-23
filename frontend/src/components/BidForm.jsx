import React, { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../lib/AuthContext';

const BidForm = ({ auctionId, currentPrice }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleBid = async (e) => {
    e.preventDefault();
    if (!amount) return;
    
    setError('');
    setLoading(true);
    
    try {
      await api.post(`/auctions/${auctionId}/bids`, { amount: Number(amount) });
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
        <p className="text-slate-400 mb-3">You must be logged in to bid.</p>
        <a href="/auth" className="inline-block bg-sky-500 hover:bg-sky-400 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Log In
        </a>
      </div>
    );
  }

  if (user.role !== 'buyer') {
    return (
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center text-slate-400">
        Only buyers can place bids.
      </div>
    );
  }

  return (
    <form onSubmit={handleBid} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={currentPrice + 1}
            placeholder={`Min bid: $${currentPrice + 1}`}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 pl-8 pr-4 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !amount || Number(amount) <= currentPrice}
          className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-colors whitespace-nowrap"
        >
          {loading ? 'Placing...' : 'Place Bid'}
        </button>
      </div>
    </form>
  );
};

export default BidForm;
