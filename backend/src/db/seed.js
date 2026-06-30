require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const logger = require('../lib/logger');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bike-auction';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for seeding');

    await User.deleteMany({});
    await Listing.deleteMany({});
    await Auction.deleteMany({});
    await Bid.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const sellerPass = await bcrypt.hash('seller123', salt);
    const buyerPass = await bcrypt.hash('buyer123', salt);

    const admin = await User.create({ email: 'admin@test.com', passwordHash: adminPass, role: 'admin' });
    const seller1 = await User.create({ email: 'seller1@test.com', passwordHash: sellerPass, role: 'seller' });
    const seller2 = await User.create({ email: 'seller2@test.com', passwordHash: sellerPass, role: 'seller' });
    const buyer1 = await User.create({ email: 'buyer1@test.com', passwordHash: buyerPass, role: 'buyer' });
    const buyer2 = await User.create({ email: 'buyer2@test.com', passwordHash: buyerPass, role: 'buyer' });
    const buyer3 = await User.create({ email: 'buyer3@test.com', passwordHash: buyerPass, role: 'buyer' });

    const listing1 = await Listing.create({
      sellerId: seller1._id,
      make: 'Trek',
      model: 'Domane SL 6',
      year: 2022,
      description: 'High performance carbon endurance road bike.',
      photoUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e',
      status: 'approved'
    });

    const listing2 = await Listing.create({
      sellerId: seller2._id,
      make: 'Specialized',
      model: 'Stumpjumper EVO',
      year: 2023,
      description: 'Trail-ready full suspension mountain bike.',
      photoUrl: 'https://images.unsplash.com/photo-1576435728678-68dd0f612051',
      status: 'approved'
    });

    const listing3 = await Listing.create({
      sellerId: seller1._id,
      make: 'Cannondale',
      model: 'SuperSix EVO',
      year: 2023,
      description: 'Lightweight aerodynamic race bike.',
      photoUrl: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8',
      status: 'approved'
    });

    const now = new Date();

    const auction1 = await Auction.create({
      listingId: listing1._id,
      startsAt: new Date(now.getTime() - 10 * 60 * 1000),
      endsAt: new Date(now.getTime() + 20 * 60 * 1000),
      reservePrice: 1500,
      maxPrice: 3500,
      currentPrice: 1900,
      bidCount: 3,
      status: 'live'
    });

    await Bid.create([
      { auctionId: auction1._id, bidderId: buyer1._id, amount: 1600, placedAt: new Date(now.getTime() - 8 * 60 * 1000) },
      { auctionId: auction1._id, bidderId: buyer2._id, amount: 1750, placedAt: new Date(now.getTime() - 5 * 60 * 1000) },
      { auctionId: auction1._id, bidderId: buyer3._id, amount: 1900, placedAt: new Date(now.getTime() - 2 * 60 * 1000) }
    ]);

    const auction2 = await Auction.create({
      listingId: listing2._id,
      startsAt: new Date(now.getTime() - 5 * 60 * 1000),
      endsAt: new Date(now.getTime() + 30 * 60 * 1000),
      reservePrice: 2200,
      maxPrice: 4500,
      currentPrice: 2500,
      bidCount: 2,
      status: 'live'
    });

    await Bid.create([
      { auctionId: auction2._id, bidderId: buyer1._id, amount: 2300, placedAt: new Date(now.getTime() - 4 * 60 * 1000) },
      { auctionId: auction2._id, bidderId: buyer2._id, amount: 2500, placedAt: new Date(now.getTime() - 1 * 60 * 1000) }
    ]);

    const auction3 = await Auction.create({
      listingId: listing3._id,
      startsAt: new Date(now.getTime() + 15 * 60 * 1000),
      endsAt: new Date(now.getTime() + 60 * 60 * 1000),
      reservePrice: 3000,
      maxPrice: 5000,
      currentPrice: 0,
      bidCount: 0,
      status: 'scheduled'
    });

    logger.info('Database seeded successfully');

    console.log('\n--- Seeded Users Summary ---');
    const usersSummary = [admin, seller1, seller2, buyer1, buyer2, buyer3].map(u => ({
      Email: u.email,
      Role: u.role
    }));
    console.table(usersSummary);

    console.log('\n--- Seeded Auctions Summary ---');
    const auctionsSummary = [
      {
        Auction: 'Auction 1 (Trek Domane SL 6)',
        Status: auction1.status,
        CurrentPrice: `$${auction1.currentPrice}`,
        MaxPrice: `$${auction1.maxPrice}`,
        BidCount: auction1.bidCount,
        Seller: 'seller1@test.com'
      },
      {
        Auction: 'Auction 2 (Specialized Stumpjumper EVO)',
        Status: auction2.status,
        CurrentPrice: `$${auction2.currentPrice}`,
        MaxPrice: `$${auction2.maxPrice}`,
        BidCount: auction2.bidCount,
        Seller: 'seller2@test.com'
      },
      {
        Auction: 'Auction 3 (Cannondale SuperSix EVO)',
        Status: auction3.status,
        CurrentPrice: `$${auction3.currentPrice}`,
        MaxPrice: `$${auction3.maxPrice}`,
        BidCount: auction3.bidCount,
        Seller: 'seller1@test.com'
      }
    ];
    console.table(auctionsSummary);

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database', { message: error.message });
    process.exit(1);
  }
};

seedDB();
