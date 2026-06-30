const mongoose = require('mongoose');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const sseService = require('./sse.service');

const placeBid = async (auctionId, bidderId, amount) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auction = await Auction.findById(auctionId).populate('listingId').session(session);

    if (!auction) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Auction not found' };
    }

    if (auction.status !== 'live') {
      throw { status: 400, code: 'AUCTION_NOT_LIVE', message: 'Can only bid on live auctions' };
    }

    if (auction.listingId.sellerId.toString() === bidderId.toString()) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Seller cannot bid on their own auction' };
    }

    if (amount <= auction.currentPrice) {
      throw { status: 409, code: 'BID_TOO_LOW', message: `Bid must exceed current price of $${auction.currentPrice}` };
    }

    const bid = new Bid({
      auctionId,
      bidderId,
      amount
    });

    await bid.save({ session });

    auction.currentPrice = amount;
    auction.bidCount += 1;
    await auction.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Broadcast update to all connected SSE clients for this auction
    sseService.broadcast(auctionId, {
      currentPrice: auction.currentPrice,
      bidCount: auction.bidCount,
      placedAt: bid.placedAt,
      amount: bid.amount
    });

    return bid;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  placeBid
};
