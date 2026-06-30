const express = require('express');
const auctionsController = require('../controllers/auctions.controller');
const protect = require('../middleware/protect');
const requireRole = require('../middleware/requireRole');
const bidsRouter = require('./bids.routes');

const router = express.Router();

router.get('/', auctionsController.getAuctions);
router.get('/:id', auctionsController.getAuctionById);
router.post('/', protect, requireRole('admin'), auctionsController.createAuction);
router.get('/:id/stream', auctionsController.streamAuction);
router.post('/:id/purchase', protect, requireRole('buyer'), auctionsController.purchaseAuction);

// Mount bids sub-router
router.use('/:id/bids', bidsRouter);

module.exports = router;
