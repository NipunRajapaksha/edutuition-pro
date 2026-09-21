const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tuition_management_secret_key_2026_jwt_token';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]` 
      });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole, JWT_SECRET };
