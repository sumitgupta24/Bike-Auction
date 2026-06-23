const cron = require('node-cron');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const logger = require('./logger');

const startScheduler = () => {
  // Run every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    try {
      // Open scheduled auctions that have reached their start time
      const openRes = await Auction.updateMany(
        { status: 'scheduled', startsAt: { $lte: new Date() } },
        { status: 'live' }
      );
      if (openRes.modifiedCount > 0) {
        logger.info(`Opened ${openRes.modifiedCount} scheduled auctions.`);
      }

      // Close live auctions that have reached their end time
      const ended = await Auction.find({ status: 'live', endsAt: { $lte: new Date() } });
      for (const auction of ended) {
        const topBid = await Bid.findOne({ auctionId: auction._id }).sort({ amount: -1 });
        auction.status = 'ended';
        
        if (topBid && topBid.amount >= auction.reservePrice) {
          auction.winnerId = topBid.bidderId;
        }
        await auction.save();
        logger.info(`Closed auction ${auction._id}. Winner: ${auction.winnerId || 'None'}`);
      }
    } catch (error) {
      logger.error('Error in auction scheduler', { message: error.message });
    }
  });
};

module.exports = { startScheduler };
