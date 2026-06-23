import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const BidFeed = ({ auctionId, onNewBid }) => {
  const [bids, setBids] = useState([]);
  
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await api.get(`/auctions/${auctionId}/bids`);
        setBids(res.data.data);
      } catch (err) {
        console.error('Failed to fetch bids', err);
      }
    };
    fetchBids();
  }, [auctionId]);

  useEffect(() => {
    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auctions/${auctionId}/stream`);
    
    eventSource.onmessage = (event) => {
      if (event.data === 'heartbeat') return;
      try {
        const data = JSON.parse(event.data);
        if (onNewBid) onNewBid(data);
        
        api.get(`/auctions/${auctionId}/bids`).then(res => setBids(res.data.data));
      } catch (err) {
        console.error('Error parsing SSE', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [auctionId, onNewBid]);

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
        <h3 className="text-white font-semibold">Live Bid Feed</h3>
      </div>
      <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
        {bids.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No bids yet. Be the first!</p>
        ) : (
          bids.map((bid, i) => (
            <div 
              key={bid._id} 
              className={`flex justify-between items-center p-3 rounded-xl border ${
                i === 0 
                  ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' 
                  : 'bg-slate-800/50 border-slate-700/30 text-slate-300'
              } transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {bid.bidderId.email.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sm">
                  {bid.bidderId.email.split('@')[0]}
                  {i === 0 && <span className="ml-2 text-xs opacity-75">(Highest Bidder)</span>}
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">${bid.amount}</div>
                <div className="text-xs opacity-60">
                  {new Date(bid.placedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BidFeed;
