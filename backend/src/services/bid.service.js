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

const purchaseAuction = async (auctionId, buyerId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auction = await Auction.findById(auctionId).populate('listingId').session(session);

    if (!auction) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Auction not found' };
    }

    if (auction.status !== 'live') {
      throw { status: 400, code: 'AUCTION_NOT_LIVE', message: 'Can only purchase live auctions' };
    }

    if (!auction.maxPrice || auction.maxPrice <= 0) {
      throw { status: 400, code: 'NO_MAX_PRICE', message: 'Direct purchase is not available for this auction' };
    }

    if (auction.listingId.sellerId.toString() === buyerId.toString()) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Seller cannot purchase their own auction' };
    }

    if (auction.maxPrice <= auction.currentPrice) {
      throw { status: 409, code: 'PRICE_EXCEEDED', message: 'Current bid already equals or exceeds max price' };
    }

    const bid = new Bid({
      auctionId,
      bidderId: buyerId,
      amount: auction.maxPrice
    });

    await bid.save({ session });

    auction.currentPrice = auction.maxPrice;
    auction.bidCount += 1;
    auction.status = 'ended';
    auction.winnerId = buyerId;
    await auction.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Broadcast update to all connected SSE clients for this auction
    sseService.broadcast(auctionId, {
      currentPrice: auction.currentPrice,
      bidCount: auction.bidCount,
      status: auction.status,
      winnerId: auction.winnerId,
      placedAt: bid.placedAt,
      amount: bid.amount
    });

    return auction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  placeBid,
  purchaseAuction
};
