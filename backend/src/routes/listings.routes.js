const express = require('express');
const listingsController = require('../controllers/listings.controller');
const protect = require('../middleware/protect');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.get('/', listingsController.getListings);
router.post('/', protect, requireRole('seller'), listingsController.createListing);

module.exports = router;
