const crypto = require('crypto');

const requestId = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  next();
};

module.exports = requestId;
