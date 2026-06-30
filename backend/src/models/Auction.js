const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  reservePrice: { type: Number, required: true },
  maxPrice: { type: Number, default: null },
  currentPrice: { type: Number, default: 0 },
  status: { type: String, enum: ['scheduled', 'live', 'ended', 'cancelled'], default: 'scheduled' },
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bidCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);
