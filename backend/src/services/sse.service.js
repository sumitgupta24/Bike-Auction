const logger = require('../lib/logger');

const clients = new Map();

const sseService = {
  addClient: (auctionId, res) => {
    const id = String(auctionId);
    if (!clients.has(id)) {
      clients.set(id, new Set());
    }
    clients.get(id).add(res);
    logger.info(`SSE client added to auction ${id}`);
  },

  removeClient: (auctionId, res) => {
    const id = String(auctionId);
    if (clients.has(id)) {
      const auctionClients = clients.get(id);
      auctionClients.delete(res);
      if (auctionClients.size === 0) {
        clients.delete(id);
      }
    }
  },

  broadcast: (auctionId, data) => {
    const id = String(auctionId);
    if (clients.has(id)) {
      const auctionClients = clients.get(id);
      const message = `data: ${JSON.stringify(data)}\n\n`;
      auctionClients.forEach(res => {
        res.write(message);
      });
    }
  },

  startHeartbeat: () => {
    setInterval(() => {
      clients.forEach(auctionClients => {
        auctionClients.forEach(res => {
          res.write(': heartbeat\n\n');
        });
      });
    }, 15000);
  }
};

module.exports = sseService;
