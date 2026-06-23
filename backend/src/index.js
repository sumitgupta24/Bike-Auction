require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const logger = require('./lib/logger');
const { startScheduler } = require('./lib/scheduler');
const sseService = require('./services/sse.service');
const requestId = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const auctionRoutes = require('./routes/auctions');
const adminRoutes = require('./routes/admin');
const healthRoutes = require('./routes/health');

const app = express();

app.use(express.json());
app.use(requestId);
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5174',
  credentials: true
}));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: {
    write: (message) => logger.info(message.trim(), { type: 'http' })
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      logger.info('Connected to MongoDB');
      
      startScheduler();
      sseService.startHeartbeat();

      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      logger.error('Failed to connect to MongoDB', { message: error.message });
      process.exit(1);
    });
}

module.exports = app;
