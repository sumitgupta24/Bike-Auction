const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');
const Listing = require('../../src/models/Listing');
const Auction = require('../../src/models/Auction');
const Bid = require('../../src/models/Bid');

const seedDB = async () => {
  await User.deleteMany({});
  await Listing.deleteMany({});
  await Auction.deleteMany({});
  await Bid.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('admin123', salt);
  const sellerPass = await bcrypt.hash('seller123', salt);
  const buyerPass = await bcrypt.hash('buyer123', salt);

  const admin = await User.create({ email: 'admin@test.com', passwordHash: adminPass, role: 'admin' });
  const seller = await User.create({ email: 'seller@test.com', passwordHash: sellerPass, role: 'seller' });
  const buyer = await User.create({ email: 'buyer@test.com', passwordHash: buyerPass, role: 'buyer' });

  const listing = await Listing.create({
    sellerId: seller._id,
    make: 'Trek',
    model: 'Test Model',
    year: 2022,
    description: 'Test description',
    photoUrl: 'http://test.com/photo.jpg',
    status: 'approved'
  });

  const now = new Date();
  const endsLive = new Date(now.getTime() + 30 * 60000);
  const startsScheduled = new Date(now.getTime() + 10 * 60000);
  const endsScheduled = new Date(now.getTime() + 40 * 60000);

  const liveAuction = await Auction.create({
    listingId: listing._id,
    startsAt: now,
    endsAt: endsLive,
    reservePrice: 1500,
    currentPrice: 1000,
    status: 'live'
  });

  const scheduledAuction = await Auction.create({
    listingId: listing._id,
    startsAt: startsScheduled,
    endsAt: endsScheduled,
    reservePrice: 2000,
    currentPrice: 0,
    status: 'scheduled'
  });

  return {
    admin,
    seller,
    buyer,
    listing,
    liveAuction,
    scheduledAuction
  };
};

module.exports = { seedDB };
