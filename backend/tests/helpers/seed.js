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
  const seller1 = await User.create({ email: 'seller1@test.com', passwordHash: sellerPass, role: 'seller' });
  const seller2 = await User.create({ email: 'seller2@test.com', passwordHash: sellerPass, role: 'seller' });

  const buyer = await User.create({ email: 'buyer@test.com', passwordHash: buyerPass, role: 'buyer' });
  const buyer1 = await User.create({ email: 'buyer1@test.com', passwordHash: buyerPass, role: 'buyer' });
  const buyer2 = await User.create({ email: 'buyer2@test.com', passwordHash: buyerPass, role: 'buyer' });

  const listing = await Listing.create({
    sellerId: seller._id,
    make: 'Trek',
    model: 'Test Model',
    year: 2022,
    description: 'Test description',
    photoUrl: 'http://test.com/photo.jpg',
    status: 'approved'
  });

  const listing1 = await Listing.create({
    sellerId: seller1._id,
    make: 'Specialized',
    model: 'Tarmac SL7',
    year: 2023,
    description: 'Test road bike description',
    photoUrl: 'http://test.com/photo1.jpg',
    status: 'approved'
  });

  const listing2 = await Listing.create({
    sellerId: seller2._id,
    make: 'Cannondale',
    model: 'SystemSix',
    year: 2023,
    description: 'Test aero bike description',
    photoUrl: 'http://test.com/photo2.jpg',
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
    maxPrice: 3000,
    currentPrice: 1000,
    status: 'live'
  });

  const liveAuction2 = await Auction.create({
    listingId: listing1._id,
    startsAt: now,
    endsAt: endsLive,
    reservePrice: 2000,
    maxPrice: 4000,
    currentPrice: 1800,
    status: 'live'
  });

  const scheduledAuction = await Auction.create({
    listingId: listing2._id,
    startsAt: startsScheduled,
    endsAt: endsScheduled,
    reservePrice: 2500,
    currentPrice: 0,
    status: 'scheduled'
  });

  return {
    admin,
    seller,
    seller1,
    seller2,
    buyer,
    buyer1,
    buyer2,
    listing,
    listing1,
    listing2,
    liveAuction,
    liveAuction2,
    scheduledAuction
  };
};

module.exports = { seedDB };
