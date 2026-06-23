const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: { code: 'FORBIDDEN', message: 'Not authorized to access this route' }, 
        meta: { requestId: req.requestId } 
      });
    }
    next();
  };
};

module.exports = requireRole;
