const crypto = require('crypto');

const csrfProtection = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  const token = req.headers['x-csrf-token'];
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
};

const generateCsrfToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.setHeader('X-CSRF-Token', req.session.csrfToken);
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Set-Cookie', `csrfToken=${req.session.csrfToken}; Secure; HttpOnly; SameSite=Strict`);
  }
  next();
};

module.exports = { csrfProtection, generateCsrfToken };
