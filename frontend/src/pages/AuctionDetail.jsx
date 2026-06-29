import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import Countdown from '../components/Countdown';
import BidForm from '../components/BidForm';
import BidFeed from '../components/BidFeed';
import { ArrowLeft, Clock, Info } from 'lucide-react';

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await api.get(`/auctions/${id}`);
        setAuction(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  const handleNewBid = (data) => {
    setAuction(prev => ({
      ...prev,
      currentPrice: data.currentPrice,
      bidCount: data.bidCount
    }));
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-sky-400 font-bold text-xl">Loading Auction...</div>;
  if (!auction) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400 font-bold text-xl">Auction not found</div>;

  const isLive = auction.status === 'live';
  const isScheduled = auction.status === 'scheduled';
  const isEnded = auction.status === 'ended';
  const targetDate = isScheduled ? auction.startsAt : auction.endsAt;

  return (
    <div className="min-h-screen relative pb-20">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium">
            <ArrowLeft size={18} /> Back to Auctions
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/30 rounded-3xl overflow-hidden border border-slate-700/50 backdrop-blur-sm">
              <div className="aspect-video relative">
                <img 
                  src={auction.listingId.photoUrl} 
                  alt={`${auction.listingId.year} ${auction.listingId.make} ${auction.listingId.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  {isLive && <span className="px-4 py-2 rounded-full bg-emerald-500/90 text-white font-bold shadow-lg animate-pulse">LIVE AUCTION</span>}
                  {isScheduled && <span className="px-4 py-2 rounded-full bg-blue-500/90 text-white font-bold shadow-lg">UPCOMING</span>}
                  {isEnded && <span className="px-4 py-2 rounded-full bg-slate-500/90 text-white font-bold shadow-lg">ENDED</span>}
                </div>
              </div>
              <div className="p-8">
                <h1 className="text-4xl font-black text-white mb-2">
                  {auction.listingId.year} {auction.listingId.make} {auction.listingId.model}
                </h1>
                <p className="text-sky-400 font-medium mb-6 flex items-center gap-2">
                  <Info size={18} /> Seller: {auction.listingId.sellerId?.email}
                </p>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 text-lg leading-relaxed">
                    {auction.listingId.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-sm shadow-xl">
              <div className="mb-6 flex justify-between items-center">
                <div className="text-slate-400 font-medium">Current Price</div>
                <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5">
                  <Clock size={16} className={isLive ? 'text-emerald-400' : 'text-slate-400'} />
                  <Countdown targetDate={targetDate} onEnd={isEnded ? null : () => window.location.reload()} />
                </div>
              </div>
              
              <div className="text-6xl font-black text-white tracking-tighter mb-8">
                ${auction.currentPrice > 0 ? auction.currentPrice : auction.reservePrice}
              </div>

              {isLive ? (
                <div className="space-y-4">
                  <BidForm auctionId={auction._id} currentPrice={auction.currentPrice || auction.reservePrice} />
                </div>
              ) : isEnded ? (
                <div className="bg-slate-900/50 p-4 rounded-xl text-center border border-slate-700">
                  <div className="text-slate-400 mb-2">Auction Ended</div>
                  {auction.winnerId ? (
                    <div className="text-emerald-400 font-bold">Winning Bid: ${auction.currentPrice}</div>
                  ) : (
                    <div className="text-red-400 font-bold">Reserve not met.</div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900/50 p-4 rounded-xl text-center border border-slate-700 text-slate-400">
                  Bidding opens when the auction starts.
                </div>
              )}
            </div>

            <BidFeed auctionId={auction._id} onNewBid={handleNewBid} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuctionDetail;
