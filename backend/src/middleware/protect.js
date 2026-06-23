const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      error: { code: 'UNAUTHORIZED', message: 'Not authorized, no token' }, 
      meta: { requestId: req.requestId } 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) {
      return res.status(401).json({ 
        error: { code: 'UNAUTHORIZED', message: 'Not authorized, user not found' }, 
        meta: { requestId: req.requestId } 
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: { code: 'UNAUTHORIZED', message: 'Not authorized, token failed' }, 
      meta: { requestId: req.requestId } 
    });
  }
};

module.exports = protect;
