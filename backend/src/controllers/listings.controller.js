const Listing = require('../models/Listing');

const getListings = async (req, res, next) => {
  try {
    const listings = await Listing.find().populate('sellerId', '-passwordHash');
    res.json({ data: listings, meta: { requestId: req.requestId } });
  } catch (error) {
    next(error);
  }
};

const createListing = async (req, res, next) => {
  try {
    const { make, model, year, description, photoUrl } = req.body;
    
    const listing = await Listing.create({
      sellerId: req.user._id,
      make,
      model,
      year,
      description,
      photoUrl,
      status: 'draft'
    });

    res.status(201).json({ data: listing, meta: { requestId: req.requestId } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getListings,
  createListing
};
