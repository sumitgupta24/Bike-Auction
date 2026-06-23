import React from 'react';
import { Link } from 'react-router-dom';
import Countdown from './Countdown';
import { Clock } from 'lucide-react';

const AuctionCard = ({ auction }) => {
  const isLive = auction.status === 'live';
  const isEnded = auction.status === 'ended';
  const isScheduled = auction.status === 'scheduled';
  
  const targetDate = isScheduled ? auction.startsAt : auction.endsAt;

  return (
    <div className="group relative rounded-2xl bg-slate-800/50 p-4 border border-slate-700/50 hover:bg-slate-800 transition-all duration-300 backdrop-blur-xl hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgba(56,189,248,0.3)]">
      <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-xl">
        <img 
          src={auction.listingId.photoUrl} 
          alt={`${auction.listingId.year} ${auction.listingId.make} ${auction.listingId.model}`}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          {isLive && <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold backdrop-blur-md animate-pulse">LIVE</span>}
          {isScheduled && <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold backdrop-blur-md">UPCOMING</span>}
          {isEnded && <span className="px-3 py-1 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30 text-xs font-semibold backdrop-blur-md">ENDED</span>}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock size={14} className={isLive ? 'text-emerald-400' : ''} />
            <Countdown targetDate={targetDate} />
          </div>
          <span className="text-white font-bold text-lg">${auction.currentPrice > 0 ? auction.currentPrice : auction.reservePrice}</span>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-1">
        {auction.listingId.year} {auction.listingId.make} {auction.listingId.model}
      </h3>
      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
        {auction.listingId.description}
      </p>
      
      <Link 
        to={`/auctions/${auction._id}`}
        className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-2.5 rounded-xl transition-colors duration-200"
      >
        View Details
      </Link>
    </div>
  );
};

export default AuctionCard;
