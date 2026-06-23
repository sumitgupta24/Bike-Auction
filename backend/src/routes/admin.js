const express = require('express');
const Listing = require('../models/Listing');
const protect = require('../middleware/protect');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.post('/listings/:id/approve', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id, 
      { status: 'approved' }, 
      { new: true }
    );
    
    if (!listing) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Listing not found' }, meta: { requestId: req.requestId } });
    }
    
    res.json({ data: listing, meta: { requestId: req.requestId } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
