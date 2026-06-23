const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const { seedDB } = require('./helpers/seed');

let testData;

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/bike-auction-test?replicaSet=rs0';
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  testData = await seedDB();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

const loginUser = async (email, password) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return res.body.data.token;
};

describe('Bids API', () => {
  it('should place a valid bid and return 201', async () => {
    const buyerToken = await loginUser('buyer@test.com', 'buyer123');
    
    const res = await request(app)
      .post(`/api/auctions/${testData.liveAuction._id}/bids`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 1100 });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.amount).toEqual(1100);
  });

  it('should update auction.currentPrice in the database', async () => {
    const buyerToken = await loginUser('buyer@test.com', 'buyer123');
    
    await request(app)
      .post(`/api/auctions/${testData.liveAuction._id}/bids`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 1500 });
      
    const res = await request(app).get(`/api/auctions/${testData.liveAuction._id}`);
    expect(res.body.data.currentPrice).toEqual(1500);
    expect(res.body.data.bidCount).toEqual(1);
  });

  it('should return 409 with BID_TOO_LOW if bid below current price', async () => {
    const buyerToken = await loginUser('buyer@test.com', 'buyer123');
    
    const res = await request(app)
      .post(`/api/auctions/${testData.liveAuction._id}/bids`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 900 });
      
    expect(res.statusCode).toEqual(409);
    expect(res.body.error.code).toEqual('BID_TOO_LOW');
  });

  it('should return 400 when bidding on a non-live auction', async () => {
    const buyerToken = await loginUser('buyer@test.com', 'buyer123');
    
    const res = await request(app)
      .post(`/api/auctions/${testData.scheduledAuction._id}/bids`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 5000 });
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.error.code).toEqual('AUCTION_NOT_LIVE');
  });

  it('should return 403 when seller bids on their own auction', async () => {
    const sellerToken = await loginUser('seller@test.com', 'seller123');
    
    const res = await request(app)
      .post(`/api/auctions/${testData.liveAuction._id}/bids`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ amount: 2000 });
      
    expect(res.statusCode).toEqual(403);
    expect(res.body.error.code).toEqual('FORBIDDEN');
  });
});
