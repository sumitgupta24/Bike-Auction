const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const { seedDB } = require('./helpers/seed');

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/bike-auction-test?replicaSet=rs0';
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  await seedDB();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth API', () => {
  it('should register a new user and return 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'password123' });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.email).toEqual('new@test.com');
  });

  it('should return 409 when registering duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'password123' });
      
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'password123' });
      
    expect(res.statusCode).toEqual(409);
    expect(res.body.error.code).toEqual('CONFLICT');
  });

  it('should login with correct credentials and return 200', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'buyer@test.com', password: 'buyer123' });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should return 401 with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'buyer@test.com', password: 'wrongpassword' });
      
    expect(res.statusCode).toEqual(401);
  });
});
