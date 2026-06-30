const Auction = require('../models/Auction');
const sseService = require('../services/sse.service');

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
    const { listingId, startsAt, endsAt, reservePrice } = req.body;

    const auction = await Auction.create({
      listingId,
      startsAt,
      endsAt,
      reservePrice,
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

module.exports = {
  getAuctions,
  getAuctionById,
  createAuction,
  streamAuction
};
