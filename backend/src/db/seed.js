require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Auction = require('../models/Auction');
const logger = require('../lib/logger');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bike-auction';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for seeding');

    await User.deleteMany({});
    await Listing.deleteMany({});
    await Auction.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const sellerPass = await bcrypt.hash('seller123', salt);
    const buyerPass = await bcrypt.hash('buyer123', salt);

    const admin = await User.create({ email: 'admin@test.com', passwordHash: adminPass, role: 'admin' });
    const seller = await User.create({ email: 'seller@test.com', passwordHash: sellerPass, role: 'seller' });
    const buyer = await User.create({ email: 'buyer@test.com', passwordHash: buyerPass, role: 'buyer' });

    const listing1 = await Listing.create({
      sellerId: seller._id,
      make: 'Trek',
      model: 'Domane SL 6',
      year: 2022,
      description: 'Excellent condition road bike.',
      photoUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e',
      status: 'approved'
    });

    const listing2 = await Listing.create({
      sellerId: seller._id,
      make: 'Specialized',
      model: 'Stumpjumper',
      year: 2023,
      description: 'Brand new mountain bike.',
      photoUrl: 'https://images.unsplash.com/photo-1576435728678-68dd0f612051',
      status: 'approved'
    });

    const now = new Date();
    const endsLive = new Date(now.getTime() + 30 * 60000);
    const startsScheduled = new Date(now.getTime() + 10 * 60000);
    const endsScheduled = new Date(now.getTime() + 40 * 60000);

    await Auction.create({
      listingId: listing1._id,
      startsAt: now,
      endsAt: endsLive,
      reservePrice: 1500,
      currentPrice: 1000,
      status: 'live'
    });

    await Auction.create({
      listingId: listing2._id,
      startsAt: startsScheduled,
      endsAt: endsScheduled,
      reservePrice: 2000,
      currentPrice: 0,
      status: 'scheduled'
    });

    logger.info('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database', { message: error.message });
    process.exit(1);
  }
};

seedDB();
