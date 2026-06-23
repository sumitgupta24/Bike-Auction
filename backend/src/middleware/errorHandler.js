const logger = require('../lib/logger');

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  
  logger.error(err.message, { requestId: req.requestId, code, stack: err.stack });
  
  res.status(status).json({ 
    error: { code, message: err.message }, 
    meta: { requestId: req.requestId } 
  });
};

module.exports = errorHandler;
