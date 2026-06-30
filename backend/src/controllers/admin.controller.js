const Listing = require('../models/Listing');

const approveListing = async (req, res, next) => {
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
};

module.exports = {
  approveListing
};
