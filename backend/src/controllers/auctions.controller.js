const Auction = require('../models/Auction');
const sseService = require('../services/sse.service');
const bidService = require('../services/bid.service');

const getAuctions = async (req, res, next) => {
  try {
    const status = req.query.status;
    const filter = status ? { status } : {};
    const auctions = await Auction.find(filter).populate({
      path: 'listingId',
      populate: { path: 'sellerId', select: '-passwordHash' }
    }).sort({ endsAt: 1 });

    res.json({ data: auctions, meta: { requestId: req.requestId } });
  } catch (error) {
    next(error);
  }
};

const getAuctionById = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id).populate({
      path: 'listingId',
      populate: { path: 'sellerId', select: '-passwordHash' }
    }).populate('winnerId', '-passwordHash');

    if (!auction) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Auction not found' }, meta: { requestId: req.requestId } });
    }

    res.json({ data: auction, meta: { requestId: req.requestId } });
  } catch (error) {
    next(error);
  }
};

const createAuction = async (req, res, next) => {
  try {
    const { listingId, startsAt, endsAt, reservePrice, maxPrice } = req.body;

    const auction = await Auction.create({
      listingId,
      startsAt,
      endsAt,
      reservePrice,
      maxPrice: maxPrice || null,
      currentPrice: 0,
      status: 'scheduled'
    });

    res.status(201).json({ data: auction, meta: { requestId: req.requestId } });
  } catch (error) {
    next(error);
  }
};

const streamAuction = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Render's buffering

  const auctionId = req.params.id;
  sseService.addClient(auctionId, res);

  req.on('close', () => {
    sseService.removeClient(auctionId, res);
  });
};

const purchaseAuction = async (req, res, next) => {
  try {
    const auction = await bidService.purchaseAuction(req.params.id, req.user._id);
    res.json({ data: auction, meta: { requestId: req.requestId } });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: { code: error.code, message: error.message }, meta: { requestId: req.requestId } });
    } else {
      next(error);
    }
  }
};

module.exports = {
  getAuctions,
  getAuctionById,
  createAuction,
  streamAuction,
  purchaseAuction
};
