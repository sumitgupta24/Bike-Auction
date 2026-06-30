const express = require('express');
const bidsController = require('../controllers/bids.controller');
const protect = require('../middleware/protect');
const requireRole = require('../middleware/requireRole');

const router = express.Router({ mergeParams: true });

router.post('/', protect, requireRole('buyer'), bidsController.placeBid);
router.get('/', bidsController.getBids);

module.exports = router;
