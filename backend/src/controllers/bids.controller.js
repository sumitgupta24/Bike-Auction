const Bid = require('../models/Bid');
const bidService = require('../services/bid.service');

const placeBid = async (req, res, next) => {
  try {
    const auctionId = req.params.id;
    const { amount } = req.body;

    const bid = await bidService.placeBid(auctionId, req.user._id, amount);
    
    res.status(201).json({ data: bid, meta: { requestId: req.requestId } });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: { code: error.code, message: error.message }, meta: { requestId: req.requestId } });
    } else {
      next(error);
    }
  }
};

const getBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ auctionId: req.params.id })
      .sort({ placedAt: -1 })
      .populate('bidderId', '-passwordHash');
      
    res.json({ data: bids, meta: { requestId: req.requestId } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeBid,
  getBids
};
