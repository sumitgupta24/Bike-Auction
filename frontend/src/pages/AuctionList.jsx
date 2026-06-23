import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import AuctionCard from '../components/AuctionCard';
import { useAuth } from '../lib/AuthContext';
import { LogOut } from 'lucide-react';

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('live');
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/auctions');
        setAuctions(res.data.data);
      } catch (err) {
        console.error('Failed to load auctions');
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const filteredAuctions = auctions.filter(a => filter === 'all' || a.status === filter);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <span className="text-white font-black text-xl italic tracking-tighter">B!</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">BidBike</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 bg-white/5 rounded-full pl-4 pr-2 py-1.5 border border-white/5">
                <span className="text-sm font-medium text-slate-300">
                  {user.email.split('@')[0]} <span className="opacity-50 text-xs ml-1">({user.role})</span>
                </span>
                <button 
                  onClick={logout}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <a href="/auth" className="bg-white text-black hover:bg-slate-200 px-6 py-2 rounded-full font-bold transition-all hover:scale-105 shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)]">
                Login
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Premium Bikes,<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Live Auctions.</span></h2>
            <p className="text-slate-400 text-lg max-w-xl">Join the most exclusive bicycle auction platform. Bid in real-time on verified, high-end road and mountain bikes.</p>
          </div>
          
          <div className="flex bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 backdrop-blur-md self-start md:self-end">
            {['live', 'scheduled', 'ended', 'all'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-lg font-medium text-sm transition-all capitalize ${
                  filter === status 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="aspect-[3/4] bg-slate-800/50 rounded-2xl animate-pulse border border-slate-700/50" />
            ))}
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-700/50 border-dashed">
            <h3 className="text-2xl font-bold text-white mb-2">No auctions found</h3>
            <p className="text-slate-400">There are no {filter !== 'all' ? filter : ''} auctions at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAuctions.map(auction => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AuctionList;
